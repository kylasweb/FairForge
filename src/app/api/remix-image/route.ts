import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, negativePrompt, strength = 0.3 } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    console.log('Remix request received:', { imageUrl, prompt, negativePrompt, strength })

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Create variations based on the original image
    const remixPrompt = `Create variations of this design${prompt ? ` with these modifications: ${prompt}` : ''}. Maintain the core concept and style while introducing subtle changes and creative variations. Professional quality, consistent design language.`

    const fullPrompt = negativePrompt
      ? `${remixPrompt} Avoid: ${negativePrompt}.`
      : remixPrompt

    console.log('Generating remix with prompt:', fullPrompt)

    // Generate multiple variations with retry logic
    const variations: string[] = []
    const maxRetries = 2

    for (let i = 0; i < 4; i++) {
      let retryCount = 0
      let success = false

      while (retryCount <= maxRetries && !success) {
        try {
          const variationPrompt = i === 0 ? fullPrompt : `${fullPrompt}. Variation ${i + 1} with different creative elements.`

          console.log(`Generating variation ${i + 1}${retryCount > 0 ? ` (retry ${retryCount})` : ''}...`)

          // Add delay between requests to avoid rate limiting
          if (i > 0 || retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }

          const response = await zai.images.generations.create({
            prompt: variationPrompt,
            size: '1024x1024',
          })

          console.log(`Variation ${i + 1} response:`, response)

          if (response.data && response.data.length > 0) {
            const imageBase64 = response.data[0].base64
            if (imageBase64) {
              const dataUrl = `data:image/png;base64,${imageBase64}`
              variations.push(dataUrl)
              console.log(`Variation ${i + 1} added successfully`)
              success = true
            } else {
              console.warn(`No base64 data in variation ${i + 1}`)
              if (retryCount === maxRetries) {
                console.warn(`Max retries reached for variation ${i + 1}`)
              }
            }
          } else {
            console.warn(`No data in variation ${i + 1} response`)
            if (retryCount === maxRetries) {
              console.warn(`Max retries reached for variation ${i + 1}`)
            }
          }
        } catch (error) {
          console.error(`Error generating variation ${i + 1}${retryCount > 0 ? ` (retry ${retryCount})` : ''}:`, error)
          retryCount++

          // If it's a 502 error or network error, wait longer before retry
          if (error instanceof Error &&
            (error.message.includes('502') || error.message.includes('Bad Gateway') || error.message.includes('fetch'))) {
            console.log(`Network error detected, waiting 3 seconds before retry...`)
            await new Promise(resolve => setTimeout(resolve, 3000))
          } else if (retryCount <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }
    }

    if (variations.length === 0) {
      throw new Error('No variations generated successfully')
    }

    console.log(`Successfully generated ${variations.length} variations`)

    return NextResponse.json({
      success: true,
      variations: variations,
      prompt: fullPrompt
    })

  } catch (error) {
    console.error('Error remixing image:', error)

    // Check for specific 502 Bad Gateway error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const is502Error = errorMessage.includes('502') || errorMessage.includes('Bad Gateway')

    return NextResponse.json(
      {
        error: is502Error
          ? 'The AI service is temporarily unavailable. Please try again in a few moments.'
          : 'Failed to remix image',
        details: errorMessage,
        isRetryable: is502Error
      },
      { status: is502Error ? 503 : 500 }
    )
  }
}