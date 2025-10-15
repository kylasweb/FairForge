import { NextRequest, NextResponse } from 'next/server'
import { generateImageWithPuterAI, initializePuter, enhancePromptWithPuterAI } from '@/lib/puter-integration'

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, negativePrompt, batchSize = 4 } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log(`Starting 3D icon generation with batch size: ${batchSize}`)

    // Enhanced prompt based on style
    const styleEnhancers = {
      minimalist: 'minimalist design, clean lines, soft shadows, modern aesthetic, simple geometry, elegant',
      realistic: 'photorealistic, detailed textures, professional lighting, high quality, realistic materials',
      cartoon: 'cute cartoon style, bright colors, playful, smooth surfaces, friendly design, fun',
      futuristic: 'futuristic design, glowing elements, sci-fi aesthetic, holographic effects, modern tech',
      neon: 'neon glow style, vibrant glowing lights, dark background, cyberpunk aesthetic, electric colors',
      vintage: 'vintage retro style, aged textures, classic design, nostalgic feel, antique materials',
      glassmorphism: 'glassmorphism style, translucent glass, frosted edges, light refractions, modern elegant',
      pixelArt: 'pixel art style, 8-bit aesthetic, blocky pixels, retro gaming, pixelated design'
    }

    // Handle composable styles
    const styleList = style.split(',').map(s => s.trim())
    const combinedStyleEnhancers = styleList.map(s => styleEnhancers[s as keyof typeof styleEnhancers] || styleEnhancers.minimalist).join(', ')

    const basePrompt = `Create a 3D icon of: ${prompt}. Style: ${combinedStyleEnhancers}. The icon should be centered, well-lit, with a transparent or neutral background, suitable for use as an app icon or website icon.`

    const enhancedPrompt = negativePrompt
      ? `${basePrompt} Avoid: ${negativePrompt}.`
      : basePrompt

    // Initialize Puter
    let puterInitialized = false
    try {
      puterInitialized = await initializePuter()
      console.log('✅ Puter initialized successfully')
    } catch (initError) {
      console.error('❌ Puter initialization failed:', initError)
    }

    // Generate multiple variations with better error handling
    const maxBatchSize = Math.min(batchSize, 4)
    const variations: string[] = []

    console.log(`Attempting to generate ${maxBatchSize} variations...`)

    if (puterInitialized) {
      // Enhance the prompt with Puter AI
      try {
        const enhancedWithAI = await enhancePromptWithPuterAI(enhancedPrompt, style.split(',')[0])
        console.log('🎯 Prompt enhanced with Puter AI')
      } catch (enhanceError) {
        console.warn('⚠️ Prompt enhancement failed, using original prompt')
      }

      for (let i = 0; i < maxBatchSize; i++) {
        try {
          const variationPrompt = i === 0 ? enhancedPrompt : `${enhancedPrompt}. Variation ${i + 1} with subtle differences.`

          console.log(`🎨 Generating variation ${i + 1}/${maxBatchSize} with Puter AI...`)

          const imageElement = await generateImageWithPuterAI(variationPrompt, true) // testMode = true

          if (imageElement && imageElement.src) {
            variations.push(imageElement.src)
            console.log(`✅ Variation ${i + 1} added successfully`)
          } else {
            console.warn(`⚠️ No image data in variation ${i + 1}`)
          }

          // Add a small delay between requests to avoid rate limiting
          if (i < maxBatchSize - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }

        } catch (error) {
          console.error(`❌ Error generating variation ${i + 1}:`, error)
          // Continue with other variations even if one fails
        }
      }
    } else {
      console.warn('⚠️ Puter not initialized, generating demo variations')
      // Generate demo placeholders
      for (let i = 0; i < maxBatchSize; i++) {
        variations.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77PA==')
      }
    }

    if (variations.length === 0) {
      throw new Error('No icons generated successfully')
    }

    console.log(`Successfully generated ${variations.length} out of ${maxBatchSize} variations`)

    return NextResponse.json({
      success: true,
      isDemoMode: !puterInitialized,
      variations: variations,
      prompt: enhancedPrompt,
      requestedCount: maxBatchSize,
      actualCount: variations.length
    })

  } catch (error) {
    console.error('Error generating 3D icons:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate 3D icons',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}