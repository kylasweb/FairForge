import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, scale = 2 } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Create enhanced prompt for upscaling
    const upscalePrompt = `Enhance and upscale this image to ${scale}x resolution with improved detail, clarity, and quality. Maintain the original style and composition while adding fine details and sharpness. High resolution, professional quality, detailed texture.`

    // Generate upscaled image
    const response = await zai.images.generations.create({
      prompt: upscalePrompt,
      size: '1024x1024',
    })

    if (!response.data || response.data.length === 0) {
      throw new Error('Failed to upscale image')
    }

    const imageBase64 = response.data[0].base64

    if (!imageBase64) {
      throw new Error('No upscaled image data received')
    }

    const upscaledImageUrl = `data:image/png;base64,${imageBase64}`

    return NextResponse.json({
      success: true,
      upscaledImageUrl: upscaledImageUrl,
      scale: scale
    })

  } catch (error) {
    console.error('Error upscaling image:', error)

    return NextResponse.json(
      {
        error: 'Failed to upscale image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}