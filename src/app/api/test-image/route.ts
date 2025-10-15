import { NextRequest, NextResponse } from 'next/server'
import { generateIconWithPuter, initializePuter } from '@/lib/puter-integration'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('🧪 Testing Puter.js with prompt:', prompt)

    // Initialize Puter.js
    const puterInitialized = await initializePuter()

    if (!puterInitialized) {
      console.warn('⚠️ Puter.js not available, using demo mode')

      return NextResponse.json({
        success: true,
        isDemoMode: true,
        message: 'Test image generation - Demo Mode (Puter.js not available)',
        data: {
          imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          prompt: prompt,
          metadata: {
            model: 'puter-demo',
            processing_time: 1.0
          }
        }
      })
    }

    console.log('✅ Puter.js initialized successfully')

    try {
      console.log('🚀 Generating test image with Puter.js...')

      // Generate a test image using Puter.js
      const testImage = await generateIconWithPuter({ prompt: prompt, style: 'test' })

      console.log('✅ Puter.js Response received')

      if (testImage && testImage.src) {
        console.log('✅ Image generated successfully')

        return NextResponse.json({
          success: true,
          isDemoMode: false,
          message: 'Test image generated successfully with Puter.js',
          data: {
            imageUrl: testImage.src,
            prompt: prompt,
            metadata: {
              model: 'puter-ai',
              processing_time: 2.0
            }
          }
        })
      } else {
        throw new Error('No image data received from Puter.js')
      }

    } catch (error) {
      console.error('❌ Puter.js test failed:', error)

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