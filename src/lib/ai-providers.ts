/**
 * Multi-Provider AI Integration for FairForge
 * Supports multiple AI providers as fallback when Puter is unavailable
 * Uses environment variables for secure API key management
 */

export interface AIProvider {
    name: string;
    type: 'text' | 'image' | 'both';
    available: boolean;
    priority: number;
}

export interface AIResponse {
    success: boolean;
    data?: any;
    error?: string;
    provider?: string;
}

// API Configuration - Load from environment variables for security
const API_KEYS = {
    // Gemini API Keys
    gemini: [
        process.env.GEMINI_API_KEY_1 || process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2 || process.env.NEXT_PUBLIC_GEMINI_API_KEY_2
    ].filter(Boolean), // Remove undefined values

    // Other AI APIs
    grok: process.env.GROK_API_KEY || process.env.NEXT_PUBLIC_GROK_API_KEY,
    huggingFace: process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY,
    openRouter: process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    vertexAI: process.env.VERTEX_AI_API_KEY || process.env.NEXT_PUBLIC_VERTEX_AI_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY || process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY
};

// Provider configuration with priority (lower number = higher priority)
// Availability is determined by whether API keys are present
export const AI_PROVIDERS: Record<string, AIProvider> = {
    puter: {
        name: 'Puter (FaairgoAI)',
        type: 'both',
        available: false, // Will be set dynamically based on connection
        priority: 1
    },
    gemini: {
        name: 'Google Gemini',
        type: 'both',
        available: API_KEYS.gemini.length > 0,
        priority: 2
    },
    openRouter: {
        name: 'OpenRouter',
        type: 'both',
        available: !!API_KEYS.openRouter,
        priority: 3
    },
    grok: {
        name: 'Grok AI',
        type: 'text',
        available: !!API_KEYS.grok,
        priority: 4
    },
    perplexity: {
        name: 'Perplexity AI',
        type: 'text',
        available: !!API_KEYS.perplexity,
        priority: 5
    },
    huggingFace: {
        name: 'Hugging Face',
        type: 'both',
        available: !!API_KEYS.huggingFace,
        priority: 6
    }
};

/**
 * Google Gemini Integration
 */
export async function generateWithGemini(prompt: string, type: 'text' | 'image' = 'text'): Promise<AIResponse> {
    try {
        const apiKey = API_KEYS.gemini[0]; // Use first Gemini key

        if (!apiKey) {
            return {
                success: false,
                error: 'Gemini API key not configured',
                provider: 'gemini'
            };
        }

        if (type === 'image') {
            // Use Gemini for image generation (if supported) or text-to-image description
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Create a detailed, professional description for generating: ${prompt}. Make it suitable for AI image generation with specific details about style, composition, lighting, and quality.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

            const data = await response.json();
            const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;

            // Return enhanced prompt for other image generation services
            return {
                success: true,
                data: { enhancedPrompt, originalPrompt: prompt },
                provider: 'gemini'
            };
        } else {
            // Text generation
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            return {
                success: true,
                data: { text },
                provider: 'gemini'
            };
        }
    } catch (error) {
        console.error('Gemini API error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            provider: 'gemini'
        };
    }
}

/**
 * OpenRouter Integration
 */
export async function generateWithOpenRouter(prompt: string, model: string = 'meta-llama/llama-3.2-3b-instruct:free'): Promise<AIResponse> {
    try {
        if (!API_KEYS.openRouter) {
            return {
                success: false,
                error: 'OpenRouter API key not configured',
                provider: 'openRouter'
            };
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEYS.openRouter}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'FairForge'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        return {
            success: true,
            data: { text },
            provider: 'openRouter'
        };
    } catch (error) {
        console.error('OpenRouter API error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            provider: 'openRouter'
        };
    }
}

/**
 * Grok AI Integration
 */
export async function generateWithGrok(prompt: string): Promise<AIResponse> {
    try {
        if (!API_KEYS.grok) {
            return {
                success: false,
                error: 'Grok API key not configured',
                provider: 'grok'
            };
        }

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEYS.grok}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'grok-beta',
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) throw new Error(`Grok API error: ${response.status}`);

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        return {
            success: true,
            data: { text },
            provider: 'grok'
        };
    } catch (error) {
        console.error('Grok API error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            provider: 'grok'
        };
    }
}

/**
 * Perplexity AI Integration
 */
export async function generateWithPerplexity(prompt: string): Promise<AIResponse> {
    try {
        if (!API_KEYS.perplexity) {
            return {
                success: false,
                error: 'Perplexity API key not configured',
                provider: 'perplexity'
            };
        }

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEYS.perplexity}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) throw new Error(`Perplexity API error: ${response.status}`);

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        return {
            success: true,
            data: { text },
            provider: 'perplexity'
        };
    } catch (error) {
        console.error('Perplexity API error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            provider: 'perplexity'
        };
    }
}

/**
 * Hugging Face Integration
 */
export async function generateWithHuggingFace(prompt: string, type: 'text' | 'image' = 'text'): Promise<AIResponse> {
    try {
        if (!API_KEYS.huggingFace) {
            return {
                success: false,
                error: 'Hugging Face API key not configured',
                provider: 'huggingFace'
            };
        }

        if (type === 'image') {
            // Use Stable Diffusion for image generation
            const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEYS.huggingFace}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        num_inference_steps: 30,
                        guidance_scale: 7.5
                    }
                })
            });

            if (!response.ok) throw new Error(`Hugging Face API error: ${response.status}`);

            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);

            return {
                success: true,
                data: { imageUrl, imageBlob },
                provider: 'huggingFace'
            };
        } else {
            // Text generation using a free model
            const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEYS.huggingFace}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 512,
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) throw new Error(`Hugging Face API error: ${response.status}`);

            const data = await response.json();
            const text = data[0]?.generated_text || data.generated_text;

            return {
                success: true,
                data: { text },
                provider: 'huggingFace'
            };
        }
    } catch (error) {
        console.error('Hugging Face API error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            provider: 'huggingFace'
        };
    }
}

/**
 * Smart provider selection and fallback system
 */
export async function generateWithFallback(prompt: string, type: 'text' | 'image' = 'text', preferredProvider?: string): Promise<AIResponse> {
    // Get available providers sorted by priority
    const availableProviders = Object.entries(AI_PROVIDERS)
        .filter(([_, provider]) => provider.available && (provider.type === type || provider.type === 'both'))
        .sort(([_, a], [__, b]) => a.priority - b.priority);

    // If preferred provider is specified and available, try it first
    if (preferredProvider && AI_PROVIDERS[preferredProvider]?.available) {
        const provider = availableProviders.find(([name]) => name === preferredProvider);
        if (provider) {
            availableProviders.unshift(provider);
        }
    }

    // Try providers in order of priority
    for (const [providerName] of availableProviders) {
        try {
            let result: AIResponse;

            switch (providerName) {
                case 'gemini':
                    result = await generateWithGemini(prompt, type);
                    break;
                case 'openRouter':
                    result = await generateWithOpenRouter(prompt);
                    break;
                case 'grok':
                    if (type === 'text') result = await generateWithGrok(prompt);
                    else continue; // Skip if image generation requested
                    break;
                case 'perplexity':
                    if (type === 'text') result = await generateWithPerplexity(prompt);
                    else continue; // Skip if image generation requested
                    break;
                case 'huggingFace':
                    result = await generateWithHuggingFace(prompt, type);
                    break;
                default:
                    continue;
            }

            if (result.success) {
                console.log(`✅ Successfully generated content using ${AI_PROVIDERS[providerName].name}`);
                return result;
            }

            console.warn(`⚠️ Failed to generate with ${AI_PROVIDERS[providerName].name}:`, result.error);
        } catch (error) {
            console.warn(`⚠️ Provider ${providerName} failed:`, error);
            continue;
        }
    }

    // All providers failed
    return {
        success: false,
        error: 'All AI providers are currently unavailable',
        provider: 'none'
    };
}

/**
 * Update provider availability status
 */
export function updateProviderStatus(providerName: string, available: boolean) {
    if (AI_PROVIDERS[providerName]) {
        AI_PROVIDERS[providerName].available = available;
        console.log(`📡 Provider ${providerName} status updated: ${available ? 'available' : 'unavailable'}`);
    }
}

/**
 * Get available providers list
 */
export function getAvailableProviders(type?: 'text' | 'image'): string[] {
    return Object.entries(AI_PROVIDERS)
        .filter(([_, provider]) => provider.available && (!type || provider.type === type || provider.type === 'both'))
        .sort(([_, a], [__, b]) => a.priority - b.priority)
        .map(([name]) => name);
}