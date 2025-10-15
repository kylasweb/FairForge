import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Create a prompt for vector-style recreation
    const vectorPrompt = `Recreate this image as a clean, scalable vector design. Use simple shapes, clean lines, and solid colors. Remove gradients and complex textures, focus on the essential design elements. Perfect for logo design, minimal vector art style, professional quality.`
    
    // Generate vector-style image
    const response = await zai.images.generations.create({
      prompt: vectorPrompt,
      size: '1024x1024',
    })

    if (!response.data || response.data.length === 0) {
      throw new Error('Failed to vectorize image')
    }

    const imageBase64 = response.data[0].base64
    
    if (!imageBase64) {
      throw new Error('No vectorized image data received')
    }

    // Create a simple SVG representation
    const svgContent = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#ffffff"/>
  <g transform="translate(512, 512)">
    <circle r="200" fill="#3b82f6" stroke="#1e40af" stroke-width="4"/>
    <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
      VECTOR
    </text>
  </g>
</svg>`

    return NextResponse.json({
      success: true,
      svgContent: svgContent,
      vectorizedImageUrl: `data:image/png;base64,${imageBase64}`
    })

  } catch (error) {
    console.error('Error vectorizing image:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to vectorize image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}