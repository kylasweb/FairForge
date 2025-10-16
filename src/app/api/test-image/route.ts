import { NextRequest, NextResponse } from 'next/server'
import { generateIconWithFaairgoAI, initializeFaairgoAI } from '@/lib/faairgoai-integration'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('🧪 Testing FaairgoAI with prompt:', prompt)

    // Initialize FaairgoAI
    const faairgoAIInitialized = await initializeFaairgoAI()

    if (!faairgoAIInitialized) {
      console.warn('⚠️ FaairgoAI not available, using demo mode')

      return NextResponse.json({
        success: true,
        isDemoMode: true,
        message: 'Test image generation - Demo Mode (FaairgoAI not available)',
        data: {
          imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          prompt: prompt,
          metadata: {
            model: 'faairgoai-demo',
            processing_time: 1.0
          }
        }
      })
    }

    console.log('✅ FaairgoAI initialized successfully')

    try {
      console.log('🚀 Generating test image with FaairgoAI...')

      // Generate a test image using FaairgoAI
      const testImage = await generateIconWithFaairgoAI({ prompt: prompt, style: 'test' })

      console.log('✅ FaairgoAI Response received')

      if (testImage && testImage.src) {
        console.log('✅ Image generated successfully')

        return NextResponse.json({
          success: true,
          isDemoMode: false,
          message: 'Test image generated successfully with FaairgoAI',
          data: {
            imageUrl: testImage.src,
            prompt: prompt,
            metadata: {
              model: 'faairgoai-ai',
              processing_time: 2.0
            }
          }
        })
      } else {
        throw new Error('No image data received from FaairgoAI')
      }

    } catch (error) {
      console.error('❌ FaairgoAI test failed:', error)

      // Fallback to demo mode
      return NextResponse.json({
        success: true,
        isDemoMode: true,
        message: 'Fallback to demo mode due to processing error',
        data: {
          imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          prompt: prompt,
          error: 'Processing failed, showing demo content'
        }
      })
    }

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
