import { NextRequest, NextResponse } from 'next/server'
import { generateLogoWithFaairgoAI, initializeFaairgoAI } from '@/lib/faairgoai-integration'

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      style,
      industry,
      companyName,
      tagline,
      negativePrompt,
      keywords,
      preferredColors,
      batchSize = 4,
      model = 'gpt-4'
    } = await request.json()

    if (!prompt && !companyName) {
      return NextResponse.json(
        { error: 'Prompt or company name is required' },
        { status: 400 }
      )
    }

    console.log(`Starting logo generation with batch size: ${batchSize}`)

    // Enhanced prompt based on logo style
    const logoStyleEnhancers = {
      modern: 'modern minimalist logo, clean lines, professional design, contemporary, corporate',
      vintage: 'vintage retro logo, classic typography, distressed textures, timeless design, heritage',
      luxury: 'luxury premium logo, elegant typography, metallic gold/silver, sophisticated, high-end',
      tech: 'tech logo, futuristic design, digital aesthetic, innovative, modern technology',
      organic: 'organic logo, natural elements, eco-friendly, earth tones, sustainable design',
      geometric: 'geometric logo, precise shapes, mathematical patterns, structured design, abstract',
      handwritten: 'handwritten logo, custom typography, personal touch, artistic, creative',
      bold: 'bold logo, strong typography, impactful design, confident, powerful statement'
    }

    // Industry-specific logo enhancements
    const industryEnhancers = {
      it: 'technology focused, digital innovation, software company, IT services',
      medical: 'healthcare focused, medical trust, wellness, pharmaceutical, health services',
      hospitality: 'service focused, customer experience, hotel/restaurant, luxury service',
      ai: 'artificial intelligence, machine learning, smart technology, automation, innovation',
      general: 'versatile business, professional services, corporate identity, brand recognition'
    }

    // Handle composable styles
    const styleList = style.split(',').map(s => s.trim())
    const combinedStyleEnhancers = styleList.map(s => logoStyleEnhancers[s as keyof typeof logoStyleEnhancers] || logoStyleEnhancers.modern).join(', ')

    const basePrompt = companyName
      ? `Create a professional logo for "${companyName}"${tagline ? ` with tagline "${tagline}"` : ''}. ${prompt}.`
      : `Create a professional logo. ${prompt}.`

    let enhancedPrompt = `${basePrompt} Style: ${combinedStyleEnhancers}. Industry focus: ${industryEnhancers[industry as keyof typeof industryEnhancers] || industryEnhancers.general}.`

    // Add additional parameters
    if (keywords) {
      enhancedPrompt += ` Keywords: ${keywords}.`
    }

    if (preferredColors) {
      enhancedPrompt += ` Colors: ${preferredColors}.`
    }

    if (negativePrompt) {
      enhancedPrompt += ` Avoid: ${negativePrompt}.`
    }

    enhancedPrompt += ' The logo should be scalable, memorable, professional, suitable for business branding, with a clean background.'

    // Initialize Puter
    let faairgoAIInitialized = false
    try {
      faairgoAIInitialized = await initializeFaairgoAI()
      console.log('✅ FaairgoAI initialized successfully')
    } catch (initError) {
      console.error('❌ FaairgoAI initialization failed:', initError)
    }

    // Generate multiple variations with better error handling
    const maxBatchSize = Math.min(batchSize, 8) // Allow up to 8 variations
    const variations: string[] = []

    console.log(`Attempting to generate ${maxBatchSize} logo variations...`)

    if (faairgoAIInitialized) {
      for (let i = 0; i < maxBatchSize; i++) {
        try {
          const variationPrompt = i === 0 ? enhancedPrompt : `${enhancedPrompt}. Variation ${i + 1} with subtle differences.`

          console.log(`🎨 Generating logo variation ${i + 1}/${maxBatchSize} with FaairgoAI AI...`)

          const imageElement = await generateLogoWithFaairgoAI(variationPrompt, style.split(',')[0], true, model) // testMode = true

          if (imageElement && imageElement.src) {
            variations.push(imageElement.src)
            console.log(`✅ Logo variation ${i + 1} added successfully`)
          } else {
            console.warn(`⚠️ No image data in logo variation ${i + 1}`)
          }

          // Add a small delay between requests to avoid rate limiting
          if (i < maxBatchSize - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }

        } catch (error) {
          console.error(`❌ Error generating logo variation ${i + 1}:`, error)
          // Continue with other variations even if one fails
        }
      }
    } else {
      console.warn('⚠️ FaairgoAI not initialized, generating demo logo variations')
      // Generate demo placeholders
      for (let i = 0; i < maxBatchSize; i++) {
        variations.push('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77PA==')
      }
    }

    if (variations.length === 0) {
      throw new Error('No logos generated successfully')
    }

    console.log(`Successfully generated ${variations.length} out of ${maxBatchSize} logo variations`)

    return NextResponse.json({
      success: true,
      isDemoMode: !faairgoAIInitialized,
      variations: variations,
      prompt: enhancedPrompt,
      requestedCount: maxBatchSize,
      actualCount: variations.length
    })

  } catch (error) {
    console.error('Error generating logos:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate logos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
