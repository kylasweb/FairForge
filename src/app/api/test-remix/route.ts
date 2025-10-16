import { NextRequest, NextResponse } from 'next/server'
import { remixImageWithFaairgoAI, initializeFaairgoAI } from '@/lib/faairgoai-integration'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test remix endpoint called')

    // Initialize FaairgoAI
    const faairgoAIInitialized = await initializeFaairgoAI()

    if (!faairgoAIInitialized) {
      console.warn('⚠️ FaairgoAI not available, using demo mode')

      return NextResponse.json({
        success: true,
        isDemoMode: true,
        message: 'Test remix - Demo Mode (FaairgoAI not available)',
        data: {
          imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          prompt: 'Demo test remix',
          metadata: {
            model: 'faairgoai-demo',
            processing_time: 1.0
          }
        }
      })
    }

    console.log('✅ FaairgoAI initialized')

    try {
      // Generate a simple test image
      const testPrompt = 'A simple red circle on white background, minimal design'
      console.log('🚀 Generating test image with prompt:', testPrompt)

      const testImage = await remixImageWithFaairgoAI('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', testPrompt)

      if (testImage && testImage.src) {
        console.log('✅ Test image generated successfully')

        return NextResponse.json({
          success: true,
          isDemoMode: false,
          message: 'Test remix completed successfully with FaairgoAI',
          data: {
            testImage: testImage.src,
            prompt: testPrompt,
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
      console.error('❌ FaairgoAI test remix failed:', error)

      // Fallback to demo mode
      return NextResponse.json({
        success: true,
        isDemoMode: true,
        message: 'Fallback to demo mode due to processing error',
        data: {
          testImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          prompt: 'Demo test remix',
          error: 'Processing failed, showing demo content'
        }
      })
    }

  } catch (error) {
    console.error('Error in test remix:', error)

    return NextResponse.json(
      {
        error: 'Test remix failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
