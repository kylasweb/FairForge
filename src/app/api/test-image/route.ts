import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('Testing ZAI SDK with prompt:', prompt)

    // Initialize ZAI SDK
    const zai = await ZAI.create()
    console.log('ZAI SDK initialized successfully')

    // Generate a test image
    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1024x1024',
    })

    console.log('ZAI Response:', JSON.stringify(response, null, 2))

    if (response.data && response.data.length > 0) {
      const imageBase64 = response.data[0].base64
      console.log('Base64 data length:', imageBase64 ? imageBase64.length : 'undefined')
      
      if (imageBase64) {
        const imageUrl = `data:image/png;base64,${imageBase64}`
        return NextResponse.json({
          success: true,
          imageUrl: imageUrl,
          base64Length: imageBase64.length,
          fullResponse: response
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'No image data in response',
      fullResponse: response
    })

  } catch (error) {
    console.error('Test image generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate test image',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}