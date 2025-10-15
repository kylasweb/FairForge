import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, platform, style, prompt, imageData, url } = body

    if (!type || !platform || !style) {
      return NextResponse.json(
        { error: 'Missing required fields: type, platform, style' },
        { status: 400 }
      )
    }

    if (type === 'textToUI' && !prompt) {
      return NextResponse.json(
        { error: 'Prompt is required for text-to-UI generation' },
        { status: 400 }
      )
    }

    if ((type === 'wireframeToUI' || type === 'screenshotToUI') && !imageData && !url) {
      return NextResponse.json(
        { error: 'Either image data or URL is required for this generation type' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    let finalPrompt = ''

    if (type === 'textToUI') {
      finalPrompt = `Create a ${style} ${platform} UI design based on this description: "${prompt}". Generate a complete, professional user interface with proper layout, components, and visual hierarchy. The design should be modern, clean, and suitable for the ${platform} platform.`
    } else if (type === 'wireframeToUI') {
      finalPrompt = `Convert this wireframe/sketch into a polished ${style} ${platform} UI design. Transform the rough layout into a complete, professional interface with proper styling, colors, typography, and components. The design should be modern and clean while maintaining the original structure and layout.`
    } else if (type === 'screenshotToUI') {
      finalPrompt = `Recreate and improve this ${platform} UI screenshot in a ${style} design. Extract the layout, components, and functionality, then recreate it as a polished, modern interface. Enhance the visual design while maintaining the core structure and user experience.`
    }

    // Add platform-specific guidance
    if (platform === 'mobile') {
      finalPrompt += ' Design for mobile devices with touch-friendly interactions, proper spacing, and mobile-first approach.'
    } else if (platform === 'tablet') {
      finalPrompt += ' Design for tablet devices with appropriate spacing and layout that works well on larger touch screens.'
    } else if (platform === 'responsive') {
      finalPrompt += ' Create a responsive design that works well across desktop, tablet, and mobile devices.'
    }

    // Add style-specific guidance
    if (style === 'material') {
      finalPrompt += ' Use Material Design principles with proper elevation, typography, and component guidelines.'
    } else if (style === 'ios') {
      finalPrompt += ' Follow iOS Human Interface Guidelines with clean typography, subtle animations, and native iOS components.'
    } else if (style === 'bootstrap') {
      finalPrompt += ' Use Bootstrap design patterns with proper grid system, components, and utility classes.'
    } else if (style === 'tailwind') {
      finalPrompt += ' Use modern Tailwind CSS design patterns with clean spacing, consistent colors, and utility-first approach.'
    }

    // Generate multiple UI variations (3 different designs)
    interface UIVariation {
      imageUrl: string
      code: string
      variation: number
    }
    const uiVariations: UIVariation[] = []
    const maxVariations = 3 // Reduced from 3 to avoid timeouts

    for (let i = 0; i < maxVariations; i++) {
      try {
        console.log(`Generating UI variation ${i + 1}/${maxVariations}...`)

        const variationPrompt = i === 0
          ? finalPrompt
          : `${finalPrompt}. Create variation ${i + 1} with different layout and visual elements while maintaining the same functionality.`

        const imageResponse = await zai.images.generations.create({
          prompt: variationPrompt,
          size: '1024x1024'
        })

        const imageUrl = imageResponse.data[0].base64
        const base64Image = `data:image/png;base64,${imageUrl}`

        // Generate corresponding HTML/CSS code for this variation
        let codePrompt = `Generate clean, modern HTML and CSS code for a ${style} ${platform} UI interface based on this design: "${variationPrompt}".`

        if (type === 'textToUI') {
          codePrompt += ` Create a complete, functional interface that matches this description: "${prompt}".`
        }

        codePrompt += `
        
        Requirements:
        - Use semantic HTML5 elements
        - Create responsive CSS that works on ${platform}
        - Include hover states and transitions
        - Use modern CSS (flexbox/grid)
        - Add placeholder content that makes sense
        - Include proper accessibility attributes
        - Make it visually appealing with the ${style} design system
        - Add comments to explain the structure
        - This is variation ${i + 1} of ${maxVariations}, so make it unique from other variations
        `

        const codeResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an expert frontend developer who creates clean, modern HTML and CSS code. Always provide complete, working code with proper structure and styling.'
            },
            {
              role: 'user',
              content: codePrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })

        const generatedCode = codeResponse.choices[0]?.message?.content || ''

        uiVariations.push({
          imageUrl: base64Image,
          code: generatedCode,
          variation: i + 1
        })

        console.log(`Successfully generated variation ${i + 1}/${maxVariations}`)

        // Add delay between generations to avoid rate limiting
        if (i < maxVariations - 1) {
          console.log('Waiting 2 seconds before next generation...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

      } catch (error) {
        console.error(`Error generating UI variation ${i + 1}:`, error)
        // Continue with other variations even if one fails
      }
    }

    if (uiVariations.length === 0) {
      throw new Error('No UI variations generated successfully')
    }

    // Create ZIP file
    const zip = new JSZip()

    // Add a README file
    const readmeContent = `# UI Design Package

Generated on: ${new Date().toLocaleString()}
Platform: ${platform}
Style: ${style}
Type: ${type}
${prompt ? `Original Prompt: ${prompt}` : ''}

## Contents

This package contains:
- ${uiVariations.length} UI design variations
- HTML/CSS code for each variation
- UI design images
- Additional assets

## Files

- variation-1/ - First UI design variation
- variation-2/ - Second UI design variation  
- variation-3/ - Third UI design variation
- assets/ - Shared assets and images
- README.md - This file

## Usage

Each variation folder contains:
- index.html - The complete HTML file
- style.css - The CSS stylesheet
- design.png - The UI design image
- preview.html - A preview file with the design embedded

Open the index.html file in any web browser to view the design.
`

    zip.file('README.md', readmeContent)

    // Create assets folder
    const assetsFolder = zip.folder('assets')

    // Add each variation to the ZIP
    for (const variation of uiVariations) {
      const variationFolder = zip.folder(`variation-${variation.variation}`)

      if (variationFolder) {
        // Extract HTML and CSS from the generated code
        let htmlContent = variation.code
        let cssContent = ''

        // Try to separate HTML and CSS if they're combined
        if (variation.code.includes('<style>') && variation.code.includes('</style>')) {
          const styleMatch = variation.code.match(/<style[^>]*>([\s\S]*?)<\/style>/)
          if (styleMatch) {
            cssContent = styleMatch[1]
            htmlContent = variation.code.replace(/<style[^>]*>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="style.css">')
          }
        } else if (variation.code.includes('<link rel="stylesheet"')) {
          // CSS is already separated
          cssContent = `/* ${style} ${platform} CSS Styles */
/* Generated for variation ${variation.variation} */

/* Add your custom styles here */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
}`
        } else {
          // Create basic CSS if none found
          cssContent = `/* ${style} ${platform} CSS Styles */
/* Generated for variation ${variation.variation} */

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
}`
        }

        // Clean up HTML content
        htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '')

        // Add proper HTML structure if missing
        if (!htmlContent.includes('<!DOCTYPE html>')) {
          htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI Design - Variation ${variation.variation}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${htmlContent}
</body>
</html>`
        }

        // Create files
        variationFolder.file('index.html', htmlContent)
        variationFolder.file('style.css', cssContent)

        // Create preview file with embedded image
        const previewContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI Design Preview - Variation ${variation.variation} | FairForge</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        .preview-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .design-image {
            text-align: center;
            margin: 20px 0;
        }
        .design-image img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .actions {
            text-align: center;
            margin-top: 30px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #0056b3;
        }
        .btn-secondary {
            background: #6c757d;
        }
        .btn-secondary:hover {
            background: #545b62;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="preview-header">
            <h1>UI Design - Variation ${variation.variation}</h1>
            <p style="color: #666; font-size: 0.9em; margin-bottom: 10px;">Generated by FairForge</p>
            <p><strong>Platform:</strong> ${platform} | <strong>Style:</strong> ${style} | <strong>Type:</strong> ${type}</p>
            ${prompt ? `<p><strong>Original Prompt:</strong> ${prompt}</p>` : ''}
        </div>
        
        <div class="design-image">
            <h2>Design Preview</h2>
            <img src="design.png" alt="UI Design Variation ${variation.variation}">
        </div>
        
        <div class="actions">
            <a href="index.html" class="btn">View Live Design</a>
            <a href="style.css" class="btn btn-secondary">View CSS</a>
        </div>
    </div>
</body>
</html>`

        variationFolder.file('preview.html', previewContent)

        // Convert base64 image to binary and add to ZIP
        const base64Data = variation.imageUrl.replace(/^data:image\/png;base64,/, '')
        const imageBuffer = Buffer.from(base64Data, 'base64')
        variationFolder.file('design.png', imageBuffer)

        // Also add to assets folder with unique name
        if (assetsFolder) {
          assetsFolder.file(`design-variation-${variation.variation}.png`, imageBuffer)
        }
      }
    }

    // Add additional CSS framework files
    if (style === 'bootstrap') {
      const bootstrapLink = `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">`
      if (assetsFolder) {
        assetsFolder.file('bootstrap-info.txt', `This design uses Bootstrap CSS framework.\nAdd this line to your HTML head:\n${bootstrapLink}`)
      }
    } else if (style === 'tailwind') {
      const tailwindScript = `<script src="https://cdn.tailwindcss.com"></script>`
      if (assetsFolder) {
        assetsFolder.file('tailwind-info.txt', `This design uses Tailwind CSS.\nAdd this line to your HTML head:\n${tailwindScript}`)
      }
    }

    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // Return the ZIP file as a response
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `ui-design-${platform}-${style}-${timestamp}.zip`

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('UI ZIP generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate UI design ZIP package' },
      { status: 500 }
    )
  }
}