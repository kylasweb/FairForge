/**
 * Puter.js Integration for FairForge
 * This module handles the integration with Puter.js for enhanced functionality
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
}

/**
 * Initialize Puter.js if available
 */
export async function initializePuter(): Promise<boolean> {
  try {
    // Check if Puter is already loaded
    if (typeof window !== 'undefined' && window.puter) {
      return true;
    }

    // Load Puter script if not available
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;

      return new Promise((resolve) => {
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.head.appendChild(script);
      });
    }

    return false;
  } catch (error) {
    console.error('Failed to initialize Puter:', error);
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