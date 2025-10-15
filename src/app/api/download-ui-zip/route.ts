import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📦 ZIP download request received')

    // This feature is temporarily disabled during Puter.js migration
    return NextResponse.json(
      { 
        success: false,
        error: 'ZIP download feature temporarily unavailable',
        message: 'This feature is being updated to use Puter.js. Please use individual UI generation endpoints for now.',
        suggestedActions: [
          'Use /api/generate-ui for UI component generation',
          'Use /api/generate-3d-icon for icon creation',
          'Use /api/remix-image for image variations'
        ],
        status: 'under_migration'
      },
      { status: 503 }
    )

  } catch (error) {
    console.error('❌ ZIP download API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process ZIP download request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
