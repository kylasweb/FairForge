import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Return a known good base64 image (1x1 red pixel)
    const redPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    
    return NextResponse.json({
      success: true,
      imageUrl: `data:image/png;base64,${redPixelBase64}`,
      test: 'Known good image'
    })

  } catch (error) {
    console.error('Test image error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate test image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
