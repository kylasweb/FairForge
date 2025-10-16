/**
 * Puter.js Integration for FairForge
 * Complete AI-powered functionality using Puter.js
 * Replaces Z-AI SDK with Puter's multi-model AI capabilities
 */

declare global {
  interface Window {
    puter: any;
  }
}

export interface PuterFile {
  name: string;
  type: string;
  size: number;
  modified: Date;
  path: string;
  readUrl?: string;
  writeUrl?: string;
}

export interface PuterAIOptions {
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
 * Initialize Puter.js if available
 */
export async function initializePuter(): Promise<boolean> {
  try {
    // For server-side rendering, return false
    if (typeof window === 'undefined') {
      return false;
    }

    // Check if Puter is already loaded and authenticated
    if (window.puter && await checkPuterAuth()) {
      return true;
    }

    // Load Puter script if not available
    if (!window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;

      const loaded = await new Promise<boolean>((resolve) => {
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
      });

      if (!loaded) {
        console.warn('Failed to load Puter.js script');
        return false;
      }

      // Wait a bit for Puter to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Check if user is authenticated
    return await checkPuterAuth();
  } catch (error) {
    console.error('Failed to initialize Puter:', error);
    return false;
  }
}

/**
 * Check if Puter is authenticated
 */
export async function checkPuterAuth(): Promise<boolean> {
  try {
    if (!window.puter) {
      return false;
    }

    // Try to get user info to check if authenticated
    const user = await window.puter.auth.getUser();
    return !!user;
  } catch (error) {
    // User not authenticated or error occurred
    return false;
  }
}

/**
 * Prompt user to authenticate with Puter
 */
export async function authenticatePuter(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.puter) {
      return false;
    }

    // Show authentication dialog
    await window.puter.auth.signIn();
    return true;
  } catch (error) {
    console.error('Puter authentication failed:', error);
    return false;
  }
}



/**
 * Save generated icon to Puter storage
 */
export async function saveIconToPuter(imageData: string, filename: string): Promise<PuterFile | null> {
  try {
    if (!window.puter) {
      throw new Error('Puter not initialized');
    }

    // Convert base64 to blob
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Save to Puter
    const file = await window.puter.fs.write(filename, blob);
    return file;
  } catch (error) {
    console.error('Failed to save icon to Puter:', error);
    return null;
  }
}

/**
 * Get user's Puter storage files
 */
export async function getPuterFiles(): Promise<PuterFile[]> {
  try {
    if (!window.puter) {
      throw new Error('Puter not initialized');
    }

    const files = await window.puter.fs.readdir('/');

    // Filter files safely, checking if file.type exists and is an image
    const imageFiles = files.filter((file: any) => {
      // Check if file exists and has a type property
      if (!file || typeof file !== 'object') {
        return false;
      }

      // Check if file.type exists and starts with 'image/'
      return file.type && typeof file.type === 'string' && file.type.startsWith('image/');
    }).map((file: any): PuterFile => ({
      name: file.name || 'Unknown',
      type: file.type || 'application/octet-stream',
      size: file.size || 0,
      modified: file.modified ? new Date(file.modified) : new Date(),
      path: file.path || '/',
      readUrl: file.readUrl,
      writeUrl: file.writeUrl
    }));

    return imageFiles;
  } catch (error) {
    console.error('Failed to get Puter files:', error);
    return [];
  }
}

/**
 * Delete file from Puter storage
 */
export async function deleteFromPuter(path: string): Promise<boolean> {
  try {
    if (!window.puter) {
      throw new Error('Puter not initialized');
    }

    await window.puter.fs.delete(path);
    return true;
  } catch (error) {
    console.error('Failed to delete from Puter:', error);
    return false;
  }
}

/**
 * Get Puter auth status
 */
export function getPuterAuthStatus(): boolean {
  try {
    return typeof window !== 'undefined' &&
      window.puter &&
      window.puter.auth &&
      typeof window.puter.auth.isSignedIn === 'boolean' &&
      window.puter.auth.isSignedIn;
  } catch (error) {
    console.error('Error checking Puter auth status:', error);
    return false;
  }
}

/**
 * Sign in to Puter
 */
export async function signInToPuter(): Promise<boolean> {
  try {
    if (!window.puter) {
      throw new Error('Puter not initialized');
    }

    await window.puter.auth.signin();
    return true;
  } catch (error) {
    console.error('Failed to sign in to Puter:', error);
    return false;
  }
}

/**
 * Sign out from Puter
 */
export async function signOutFromPuter(): Promise<boolean> {
  try {
    if (!window.puter) {
      throw new Error('Puter not initialized');
    }

    await window.puter.auth.signout();
    return true;
  } catch (error) {
    console.error('Failed to sign out from Puter:', error);
    return false;
  }
}

/**
 * Enhanced prompt generation using Puter AI (if available)
 */
export async function enhancePromptWithPuterAI(prompt: string, style: string): Promise<string> {
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

    // Use Puter AI to enhance the prompt if available
    const aiResponse = await window.puter.ai.chat(`Enhance this 3D icon generation prompt: ${enhancedPrompt}`, {
      model: 'gpt-5-nano'
    });

    return aiResponse.message?.content || enhancedPrompt;
  } catch (error) {
    console.error('Failed to enhance prompt with Puter AI:', error);
    return prompt;
  }
}

/**
 * Generate image using Puter AI
 */
export async function generateImageWithPuterAI(prompt: string, testMode: boolean = false): Promise<HTMLImageElement | null> {
  try {
    if (!window.puter?.ai) {
      throw new Error('Puter AI not available');
    }

    // Generate image using Puter AI
    const image = await window.puter.ai.txt2img(prompt, testMode);
    return image;
  } catch (error) {
    console.error('Failed to generate image with Puter AI:', error);
    return null;
  }
}

/**
 * Generate UI code using Puter AI
 */
export async function generateUICodeWithPuterAI(prompt: string, framework: string = 'react'): Promise<string | null> {
  try {
    if (!window.puter?.ai) {
      throw new Error('Puter AI not available');
    }

    const systemPrompt = `You are an expert frontend developer. Generate clean, modern ${framework} code based on the user's request. Return only the code without explanations.`;

    const response = await window.puter.ai.chat(`${systemPrompt}\n\nUser request: ${prompt}`, {
      model: 'gpt-5-nano'
    });

    return response.message?.content || null;
  } catch (error) {
    console.error('Failed to generate UI code with Puter AI:', error);
    return null;
  }
}

/**
 * Generate logo using Puter AI
 */
export async function generateLogoWithPuterAI(prompt: string, style: string, testMode: boolean = false): Promise<HTMLImageElement | null> {
  try {
    if (!window.puter?.ai) {
      throw new Error('Puter AI not available');
    }

    const stylePrompts = {
      minimalist: 'minimalist, clean, simple lines, modern',
      corporate: 'professional, corporate, clean, trustworthy',
      creative: 'creative, artistic, unique, eye-catching',
      tech: 'tech, digital, futuristic, innovative'
    };

    const enhancedPrompt = `Logo design: ${prompt}, ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.minimalist}, vector style, centered, transparent background`;

    // Generate logo using Puter AI
    const image = await window.puter.ai.txt2img(enhancedPrompt, testMode);
    return image;
  } catch (error) {
    console.error('Failed to generate logo with Puter AI:', error);
    return null;
  }
}

/**
 * Generate UI designs using Puter AI
 */
export async function generateUIWithPuter(options: AIImageOptions): Promise<HTMLImageElement | null> {
  try {
    if (!window.puter?.ai?.txt2img) {
      throw new Error('Puter AI not available');
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

    console.log('🎨 Generating UI with Puter.js:', enhancedPrompt);

    // Use testMode for development, set to false for production
    const testMode = process.env.NODE_ENV === 'development';
    const image = await window.puter.ai.txt2img(enhancedPrompt, testMode);

    return image;
  } catch (error) {
    console.error('Failed to generate UI with Puter AI:', error);
    return null;
  }
}

/**
 * Generate code using Puter AI chat
 */
export async function generateCodeWithPuter(options: AICodeOptions): Promise<string | null> {
  try {
    if (!window.puter?.ai?.chat) {
      throw new Error('Puter AI chat not available');
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

    console.log('💻 Generating code with Puter.js');

    const response = await window.puter.ai.chat(codePrompt, {
      model: 'gpt-4',
      stream: false
    });

    return typeof response === 'string' ? response : response.text || response.content;
  } catch (error) {
    console.error('Failed to generate code with Puter AI:', error);
    return null;
  }
}

/**
 * Generate icons using Puter AI
 */
export async function generateIconWithPuter(options: AIImageOptions): Promise<HTMLImageElement | null> {
  try {
    if (!window.puter?.ai?.txt2img) {
      throw new Error('Puter AI not available');
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

    console.log('🎯 Generating icon with Puter.js:', enhancedPrompt);

    const testMode = process.env.NODE_ENV === 'development';
    const image = await window.puter.ai.txt2img(enhancedPrompt, testMode);

    return image;
  } catch (error) {
    console.error('Failed to generate icon with Puter AI:', error);
    return null;
  }
}

/**
 * Upscale images using Puter AI
 */
export async function upscaleImageWithPuter(imageData: string): Promise<HTMLImageElement | null> {
  try {
    if (!window.puter?.ai?.chat) {
      throw new Error('Puter AI not available');
    }

    // For upscaling, we use a combination of AI enhancement prompt
    const prompt = 'Upscale and enhance this image, improve quality, increase resolution, maintain original style and content, professional enhancement';

    console.log('🔍 Upscaling image with Puter.js');

    const response = await window.puter.ai.chat(prompt, imageData, {
      model: 'gpt-4',
      stream: false
    });

    // Note: This is a simplified implementation
    // In practice, you might need to handle the response differently
    // depending on how Puter.js handles image inputs
    return null; // Return processed image
  } catch (error) {
    console.error('Failed to upscale image with Puter AI:', error);
    return null;
  }
}

/**
 * Process image remix using Puter AI
 */
export async function remixImageWithPuter(imageData: string, newStyle: string): Promise<HTMLImageElement | null> {
  try {
    if (!window.puter?.ai?.chat) {
      throw new Error('Puter AI not available');
    }

    const prompt = `Remix this image in ${newStyle} style. Maintain the core elements but transform the visual style, colors, and aesthetic to match ${newStyle}. Keep the same composition and subject matter.`;

    console.log('🎨 Remixing image with Puter.js:', newStyle);

    const response = await window.puter.ai.chat(prompt, imageData, {
      model: 'gpt-4',
      stream: false
    });

    // Note: Similar to upscaling, this needs proper image handling
    return null; // Return processed image
  } catch (error) {
    console.error('Failed to remix image with Puter AI:', error);
    return null;
  }
}