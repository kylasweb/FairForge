import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    console.log('Test remix endpoint called')
    
    // Initialize ZAI SDK
    const zai = await ZAI.create()
    console.log('ZAI SDK initialized')

    // Generate a simple test image
    const testPrompt = 'A simple red circle on white background, minimal design'
    console.log('Generating test image with prompt:', testPrompt)
    
    const response = await zai.images.generations.create({
      prompt: testPrompt,
      size: '1024x1024',
    })

    console.log('Test image generation response:', response)

    if (response.data && response.data.length > 0) {
      const imageBase64 = response.data[0].base64
      if (imageBase64) {
        const dataUrl = `data:image/png;base64,${imageBase64}`
        console.log('Test image generated successfully, length:', dataUrl.length)
        
        return NextResponse.json({
          success: true,
          testImage: dataUrl,
          prompt: testPrompt
        })
      } else {
        throw new Error('No base64 data in test image response')
      }
    } else {
      throw new Error('No data in test image response')
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