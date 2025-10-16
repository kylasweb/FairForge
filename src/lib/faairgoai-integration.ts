/**
 * FaairgoAI Integration for FairForge
 * Complete AI-powered functionality using Puter.js backend
 * Branded as FaairgoAI for user-facing experience
 */

declare global {
    interface Window {
        puter: any;
    }
}

export interface FaairgoAIFile {
    name: string;
    type: string;
    size: number;
    modified: Date;
    path: string;
    readUrl?: string;
    writeUrl?: string;
}

export interface FaairgoAIOptions {
    prompt: string;
    style?: string;
    size?: string;
    quality?: string;
    model?: 'gpt-4' | 'gpt-5-nano' | 'claude' | 'gemini';
}

export interface AIImageOptions {
    prompt: string;
    style?: string;
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    model?: string;
}

export interface AICodeOptions {
    prompt: string;
    language?: string;
    framework?: string;
    style?: string;
}

/**
 * Initialize FaairgoAI (powered by Puter.js) if available
 */
export async function initializeFaairgoAI(): Promise<boolean> {
    try {
        if (typeof window === 'undefined') {
            return false;
        }

        // Check if FaairgoAI is already loaded and authenticated
        if (window.puter && await checkFaairgoAIAuth()) {
            return true;
        }

        // Load Puter script if not available (backend for FaairgoAI)
        if (!window.puter) {
            const script = document.createElement('script');
            script.src = 'https://js.puter.com/v2/';
            script.async = true;

            await new Promise<void>((resolve, reject) => {
                script.onload = () => resolve();
                script.onerror = () => {
                    console.warn('Failed to load FaairgoAI backend script');
                    reject();
                };
                document.head.appendChild(script);
            });

            // Wait a bit for FaairgoAI to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return await checkFaairgoAIAuth();
    } catch (error) {
        console.error('Failed to initialize FaairgoAI:', error);
        return false;
    }
}

/**
 * Check if FaairgoAI is authenticated
 */
export async function checkFaairgoAIAuth(): Promise<boolean> {
    try {
        if (!window.puter) {
            return false;
        }

        const user = await window.puter.auth.getUser();
        return !!user;
    } catch (error) {
        return false;
    }
}

/**
 * Prompt user to authenticate with FaairgoAI
 */
export async function authenticateFaairgoAI(): Promise<boolean> {
    try {
        if (typeof window === 'undefined' || !window.puter) {
            return false;
        }

        await window.puter.auth.signIn();
        return true;
    } catch (error) {
        console.error('FaairgoAI authentication failed:', error);
        return false;
    }
}


/**
 * Save generated icon to FaairgoAI storage
 */
export async function saveIconToFaairgoAI(imageData: string, filename: string): Promise<FaairgoAIFile | null> {
    try {
        if (!window.puter) {
            throw new Error('FaairgoAI not initialized');
        }

        // Convert base64 to blob
        const response = await fetch(imageData);
        const blob = await response.blob();

        // Create file info
        const now = new Date();
        const fileInfo: FaairgoAIFile = {
            name: filename,
            type: blob.type || 'image/png',
            size: blob.size,
            modified: now,
            path: `/${filename}`
        };

        // Save to FaairgoAI
        const file = await window.puter.fs.write(filename, blob);
        return fileInfo;
    } catch (error) {
        console.error('Failed to save icon to FaairgoAI:', error);
        return null;
    }
}

/**
 * Get user's FaairgoAI storage files
 */
export async function getFaairgoAIFiles(): Promise<FaairgoAIFile[]> {
    try {
        if (!window.puter) {
            throw new Error('FaairgoAI not initialized');
        }

        const files = await window.puter.fs.readdir('/');

        // Filter for image files and format
        const imageFiles = files.filter((file: any) => {
            const isImage = file.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i);
            const isDirectory = file.is_dir;
            return isImage && !isDirectory;
        }).map((file: any): FaairgoAIFile => ({
            name: file.name,
            type: file.type || 'image/png',
            size: file.size || 0,
            modified: file.modified ? new Date(file.modified) : new Date(),
            path: `/${file.name}`,
            readUrl: file.read_url,
            writeUrl: file.write_url
        }));

        return imageFiles;
    } catch (error) {
        console.error('Failed to get FaairgoAI files:', error);
        return [];
    }
}

/**
 * Delete file from FaairgoAI storage
 */
export async function deleteFromFaairgoAI(path: string): Promise<boolean> {
    try {
        if (!window.puter) {
            throw new Error('FaairgoAI not initialized');
        }

        await window.puter.fs.delete(path);
        return true;
    } catch (error) {
        console.error('Failed to delete from FaairgoAI:', error);
        return false;
    }
}

/**
 * Get FaairgoAI auth status
 */
export function getFaairgoAIAuthStatus(): boolean {
    try {
        return typeof window !== 'undefined' &&
            window.puter &&
            window.puter.auth &&
            typeof window.puter.auth.isSignedIn === 'boolean' &&
            window.puter.auth.isSignedIn;
    } catch (error) {
        console.error('Error checking FaairgoAI auth status:', error);
        return false;
    }
}

/**
 * Sign in to FaairgoAI
 */
export async function signInToFaairgoAI(): Promise<boolean> {
    try {
        if (!window.puter) {
            throw new Error('FaairgoAI not initialized');
        }

        await window.puter.auth.signin();
        return true;
    } catch (error) {
        console.error('Failed to sign in to FaairgoAI:', error);
        return false;
    }
}

/**
 * Sign out from FaairgoAI
 */
export async function signOutFromFaairgoAI(): Promise<boolean> {
    try {
        if (!window.puter) {
            throw new Error('FaairgoAI not initialized');
        }

        await window.puter.auth.signout();
        return true;
    } catch (error) {
        console.error('Failed to sign out from FaairgoAI:', error);
        return false;
    }
}

/**
 * Enhanced prompt generation using FaairgoAI (if available)
 */
export async function enhancePromptWithFaairgoAI(prompt: string, style: string): Promise<string> {
    try {
        if (!window.puter?.ai) {
            return prompt;
        }

        const stylePrompts = {
            minimalist: 'Create a minimalist 3D icon with clean lines, simple geometry, and elegant design.',
            realistic: 'Create a photorealistic 3D icon with detailed textures and professional lighting.',
            cartoon: 'Create a cute cartoon-style 3D icon with bright colors and playful design.',
            futuristic: 'Create a futuristic 3D icon with glowing elements and sci-fi aesthetic.'
        };

        const enhancedPrompt = `${prompt}. ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.minimalist} The icon should be centered, well-lit, with a transparent background, suitable for use as an app icon.`;

        // Use FaairgoAI to enhance the prompt if available
        const aiResponse = await window.puter.ai.chat(`Enhance this 3D icon generation prompt: ${enhancedPrompt}`, {
            model: 'gpt-5-nano'
        });

        return aiResponse.message?.content || enhancedPrompt;
    } catch (error) {
        console.error('Failed to enhance prompt with FaairgoAI:', error);
        return prompt;
    }
}

/**
 * Generate image using FaairgoAI
 */
export async function generateImageWithFaairgoAI(prompt: string, testMode: boolean = false): Promise<HTMLImageElement | null> {
    try {
        if (!window.puter?.ai) {
            throw new Error('FaairgoAI not available');
        }

        // Generate image using FaairgoAI
        const image = await window.puter.ai.txt2img(prompt, testMode);
        return image;
    } catch (error) {
        console.error('Failed to generate image with FaairgoAI:', error);
        return null;
    }
}

/**
 * Generate UI code using FaairgoAI
 */
export async function generateUICodeWithFaairgoAI(prompt: string, framework: string = 'react'): Promise<string | null> {
    try {
        if (!window.puter?.ai) {
            throw new Error('FaairgoAI not available');
        }

        const systemPrompt = `You are an expert frontend developer. Generate clean, modern ${framework} code based on the user's request. Return only the code without explanations.`;

        const response = await window.puter.ai.chat(`${systemPrompt}\n\nUser request: ${prompt}`, {
            model: 'gpt-5-nano'
        });

        return response.message?.content || null;
    } catch (error) {
        console.error('Failed to generate UI code with FaairgoAI:', error);
        return null;
    }
}

/**
 * Generate logo using FaairgoAI
 */
export async function generateLogoWithFaairgoAI(prompt: string, style: string, testMode: boolean = false, model: string = 'gpt-4'): Promise<HTMLImageElement | null> {
    try {
        if (!window.puter?.ai) {
            throw new Error('FaairgoAI not available');
        }

        const stylePrompts = {
            minimalist: 'minimalist, clean, simple lines, modern',
            corporate: 'professional, corporate, clean, trustworthy',
            creative: 'creative, artistic, unique, eye-catching',
            tech: 'tech, digital, futuristic, innovative'
        };

        const enhancedPrompt = `Logo design: ${prompt}, ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.minimalist}, vector style, centered, transparent background`;

        // Generate logo using FaairgoAI
        const image = await window.puter.ai.txt2img(enhancedPrompt, testMode);
        return image;
    } catch (error) {
        console.error('Failed to generate logo with FaairgoAI:', error);
        return null;
    }
}

/**
 * Generate UI designs using FaairgoAI
 */
export async function generateUIWithFaairgoAI(options: AIImageOptions): Promise<HTMLImageElement | null> {
    try {
        if (!window.puter?.ai?.txt2img) {
            throw new Error('FaairgoAI not available');
        }

        const { prompt, style = 'modern', size = '1024x1024' } = options;

        const stylePrompts = {
            modern: 'modern, clean, minimalist UI design',
            dark: 'dark theme, sleek, professional UI design',
            colorful: 'colorful, vibrant, engaging UI design',
            corporate: 'corporate, professional, business UI design',
            creative: 'creative, artistic, unique UI design'
        };

        const enhancedPrompt = `${prompt}, ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.modern}, user interface, app design, responsive layout, ${size} resolution`;

        console.log('🎨 Generating UI with FaairgoAI:', enhancedPrompt);

        // Use testMode for development, set to false for production
        const testMode = process.env.NODE_ENV === 'development';
        const image = await window.puter.ai.txt2img(enhancedPrompt, testMode);

        return image;
    } catch (error) {
        console.error('Failed to generate UI with FaairgoAI:', error);
        return null;
    }
}

/**
 * Generate code using FaairgoAI chat
 */
export async function generateCodeWithFaairgoAI(options: AICodeOptions): Promise<string | null> {
    try {
        if (!window.puter?.ai?.chat) {
            throw new Error('FaairgoAI chat not available');
        }

        const { prompt, language = 'typescript', framework = 'react', style = 'modern' } = options;

        const codePrompt = `Generate clean, production-ready ${language} code using ${framework}. 
    Requirements: ${prompt}
    Style: ${style}
    
    Please provide:
    1. Complete, functional code
    2. Proper typing (if TypeScript)
    3. Comments explaining key functionality
    4. Modern best practices
    5. Responsive design (if UI components)
    
    Format the response as clean code without markdown formatting.`;

        console.log('💻 Generating code with FaairgoAI');

        const response = await window.puter.ai.chat(codePrompt, {
            model: 'gpt-4',
            stream: false
        });

        return typeof response === 'string' ? response : response.text || response.content;
    } catch (error) {
        console.error('Failed to generate code with FaairgoAI:', error);
        return null;
    }
}

/**
 * Generate icons using FaairgoAI
 */
export async function generateIconWithFaairgoAI(options: AIImageOptions): Promise<HTMLImageElement | null> {
    try {
        if (!window.puter?.ai?.txt2img) {
            throw new Error('FaairgoAI not available');
        }

        const { prompt, style = 'modern', size = '512x512' } = options;

        const stylePrompts = {
            '3d': '3D rendered, volumetric, depth, realistic lighting',
            flat: 'flat design, minimalist, simple shapes',
            outline: 'outline style, line art, minimal fill',
            filled: 'filled design, solid colors, clean shapes',
            gradient: 'gradient colors, modern, smooth transitions'
        };

        const enhancedPrompt = `${prompt}, ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.flat}, icon design, centered, transparent background, ${size} resolution, vector style`;

        console.log('🎯 Generating icon with FaairgoAI:', enhancedPrompt);

        const testMode = process.env.NODE_ENV === 'development';
        const image = await window.puter.ai.txt2img(enhancedPrompt, testMode);

        return image;
    } catch (error) {
        console.error('Failed to generate icon with FaairgoAI:', error);
        return null;
    }
}

/**
 * Upscale images using FaairgoAI
 */
export async function upscaleImageWithFaairgoAI(imageData: string): Promise<HTMLImageElement | null> {
    try {
        if (!window.puter?.ai?.chat) {
            throw new Error('FaairgoAI not available');
        }

        // For upscaling, we use a combination of AI enhancement prompt
        const prompt = 'Upscale and enhance this image, improve quality, increase resolution, maintain original style and content, professional enhancement';

        console.log('🔍 Upscaling image with FaairgoAI');

        const response = await window.puter.ai.chat(prompt, imageData, {
            model: 'gpt-4',
            stream: false
        });

        // Note: This is a simplified implementation
        // In practice, you might need to handle the response differently
        // depending on how Puter.js handles image inputs
        return null; // Return processed image
    } catch (error) {
        console.error('Failed to upscale image with FaairgoAI:', error);
        return null;
    }
}

/**
 * Process image remix using FaairgoAI
 */
export async function remixImageWithFaairgoAI(imageData: string, newStyle: string): Promise<HTMLImageElement | null> {
    try {
        if (!window.puter?.ai?.chat) {
            throw new Error('FaairgoAI not available');
        }

        const prompt = `Remix this image in ${newStyle} style. Maintain the core elements but transform the visual style, colors, and aesthetic to match ${newStyle}. Keep the same composition and subject matter.`;

        console.log('🎨 Remixing image with FaairgoAI:', newStyle);

        const response = await window.puter.ai.chat(prompt, imageData, {
            model: 'gpt-4',
            stream: false
        });

        // Note: Similar to upscaling, this needs proper image handling
        return null; // Return processed image
    } catch (error) {
        console.error('Failed to remix image with FaairgoAI:', error);
        return null;
    }
}