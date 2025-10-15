import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithPuterAI, generateUICodeWithPuterAI, initializePuter } from '@/lib/puter-integration';

export async function POST(request: NextRequest) {
  console.log('🎯 UI Generation API called');

  try {
    const body = await request.json();
    const { type, platform, style, prompt, imageData, url } = body;

    console.log('📝 Request data:', {
      type,
      platform,
      style,
      hasPrompt: !!prompt,
      hasImageData: !!imageData,
      hasUrl: !!url
    });

    if (!type || !platform || !style) {
      console.log('❌ Missing required fields:', { type, platform, style });
      return NextResponse.json(
        { error: 'Missing required fields: type, platform, style' },
        { status: 400 }
      );
    }

    if (type === 'textToUI' && !prompt) {
      console.log('❌ Missing prompt for textToUI generation');
      return NextResponse.json(
        { error: 'Prompt is required for text-to-UI generation' },
        { status: 400 }
      );
    }

    if ((type === 'wireframeToUI' || type === 'screenshotToUI') && !imageData && !url) {
      console.log('❌ Missing image data/URL for image-to-UI generation');
      return NextResponse.json(
        { error: 'Either image data or URL is required for this generation type' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting UI generation...');
    console.log('📝 Request details:', { type, platform, style, prompt: prompt?.substring(0, 100) });

    // Note: Puter.js will be handled on the client-side
    // For now, we'll return demo content that looks good
    const puterInitialized = false;

    let finalPrompt = '';

    if (type === 'textToUI') {
      finalPrompt = `Create a ${style} ${platform} UI design based on this description: "${prompt}". Generate a complete, professional user interface with proper layout, components, and visual hierarchy. The design should be modern, clean, and suitable for the ${platform} platform.`;
    } else if (type === 'wireframeToUI') {
      finalPrompt = `Convert this wireframe/sketch into a polished ${style} ${platform} UI design. Transform the rough layout into a complete, professional interface with proper styling, colors, typography, and components. The design should be modern and clean while maintaining the original structure and layout.`;
    } else if (type === 'screenshotToUI') {
      finalPrompt = `Recreate and improve this ${platform} UI screenshot in a ${style} design. Extract the layout, components, and functionality, then recreate it as a polished, modern interface. Enhance the visual design while maintaining the core structure and user experience.`;
    }

    // Add platform-specific guidance
    if (platform === 'mobile') {
      finalPrompt += ' Design for mobile devices with touch-friendly interactions, proper spacing, and mobile-first approach.';
    } else if (platform === 'tablet') {
      finalPrompt += ' Design for tablet devices with appropriate spacing and layout that works well on larger touch screens.';
    } else if (platform === 'responsive') {
      finalPrompt += ' Create a responsive design that works well across desktop, tablet, and mobile devices.';
    }

    // Add style-specific guidance
    if (style === 'material') {
      finalPrompt += ' Use Material Design principles with proper elevation, typography, and component guidelines.';
    } else if (style === 'ios') {
      finalPrompt += ' Follow iOS Human Interface Guidelines with clean typography, subtle animations, and native iOS components.';
    } else if (style === 'bootstrap') {
      finalPrompt += ' Use Bootstrap design patterns with proper grid system, components, and utility classes.';
    } else if (style === 'tailwind') {
      finalPrompt += ' Use modern Tailwind CSS design patterns with clean spacing, consistent colors, and utility-first approach.';
    }

    // Generate a demo UI mockup image
    console.log('🎨 Generating demo UI preview...');
    console.log('📏 Final prompt length:', finalPrompt.length);

    // Create a more realistic demo image - a placeholder that shows UI mockup
    const base64Image = generateDemoUIImage(style, platform, type, prompt || 'demo interface');

    // Generate corresponding HTML/CSS code
    let codePrompt = `Generate clean, modern HTML and CSS code for a ${style} ${platform} UI interface based on this design: "${finalPrompt}".`;

    if (type === 'textToUI') {
      codePrompt += ` Create a complete, functional interface that matches this description: "${prompt}".`;
    }

    codePrompt += `
    
    Requirements:
    - Use semantic HTML5 elements
    - Create responsive CSS that works on ${platform}
    - Include hover states and transitions
    - Use modern CSS (flexbox/grid)
    - Add placeholder content that makes sense
    - Include proper accessibility attributes
    - Make it visually appealing with the ${style} design system
    - Add comments to explain the structure
    `;

    console.log('💻 Generating demo UI code...');
    console.log('📏 Code prompt length:', codePrompt.length);

    // Generate appropriate demo code based on the request
    const generatedCode = getDemoCode(style, platform, prompt || 'demo interface');

    console.log('✅ UI generation completed successfully');
    console.log('📊 Response stats - Image:', !!base64Image, 'Code length:', generatedCode.length);

    return NextResponse.json({
      success: true,
      isDemoMode: true, // Always demo mode for now until client-side Puter integration
      data: {
        image: base64Image,
        code: generatedCode
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error in generate-ui:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to generate UI',
      isDemoMode: true,
      data: {
        image: generateDemoUIImage('modern', 'responsive', 'textToUI', 'demo'),
        code: getDemoCode('modern', 'responsive', 'demo')
      }
    }, { status: 500 });
  }
}

function generateDemoUIImage(style: string, platform: string, type: string, prompt: string): string {
  // Generate UI elements based on the prompt
  const promptLower = prompt.toLowerCase();

  // Determine theme and content based on prompt keywords
  let theme = '#667eea', theme2 = '#764ba2';
  let title = 'Custom Interface';
  let buttonLabels = ['Action', 'Submit', 'More'];

  if (promptLower.includes('dashboard') || promptLower.includes('admin')) {
    theme = '#0d6efd'; theme2 = '#0a58ca';
    title = 'Admin Dashboard';
    buttonLabels = ['View', 'Edit', 'Delete'];
  } else if (promptLower.includes('ecommerce') || promptLower.includes('shop') || promptLower.includes('store')) {
    theme = '#198754'; theme2 = '#146c43';
    title = 'Online Store';
    buttonLabels = ['Buy', 'Cart', 'Wishlist'];
  } else if (promptLower.includes('blog') || promptLower.includes('news') || promptLower.includes('article')) {
    theme = '#dc3545'; theme2 = '#b02a37';
    title = 'Blog Platform';
    buttonLabels = ['Read', 'Share', 'Comment'];
  } else if (promptLower.includes('portfolio') || promptLower.includes('personal')) {
    theme = '#fd7e14'; theme2 = '#e8681b';
    title = 'Portfolio Site';
    buttonLabels = ['View', 'Contact', 'Download'];
  } else if (promptLower.includes('social') || promptLower.includes('community')) {
    theme = '#6610f2'; theme2 = '#520dc2';
    title = 'Social Platform';
    buttonLabels = ['Like', 'Share', 'Follow'];
  } else if (promptLower.includes('banking') || promptLower.includes('finance')) {
    theme = '#20c997'; theme2 = '#1aa179';
    title = 'Banking App';
    buttonLabels = ['Transfer', 'Pay', 'Save'];
  } else {
    // Extract key words from prompt for generic interface
    const words = prompt.split(' ').filter(w => w.length > 3);
    title = words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Custom UI';
  }

  const svg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${theme};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${theme2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="#f8f9fa"/>
    <rect x="0" y="0" width="600" height="80" fill="url(#headerGrad)"/>
    <text x="300" y="45" text-anchor="middle" fill="white" font-family="system-ui" font-size="20" font-weight="bold">${title}</text>
    
    <rect x="40" y="120" width="160" height="120" rx="8" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <rect x="50" y="130" width="140" height="8" rx="4" fill="#e9ecef"/>
    <rect x="50" y="150" width="100" height="6" rx="3" fill="#dee2e6"/>
    <rect x="50" y="165" width="120" height="6" rx="3" fill="#dee2e6"/>
    <rect x="50" y="200" width="80" height="25" rx="12" fill="${theme}"/>
    <text x="90" y="215" text-anchor="middle" fill="white" font-family="system-ui" font-size="10">${buttonLabels[0]}</text>
    
    <rect x="220" y="120" width="160" height="120" rx="8" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <rect x="230" y="130" width="140" height="8" rx="4" fill="#e9ecef"/>
    <rect x="230" y="150" width="110" height="6" rx="3" fill="#dee2e6"/>
    <rect x="230" y="165" width="90" height="6" rx="3" fill="#dee2e6"/>
    <rect x="230" y="200" width="80" height="25" rx="12" fill="#28a745"/>
    <text x="270" y="215" text-anchor="middle" fill="white" font-family="system-ui" font-size="10">${buttonLabels[1]}</text>
    
    <rect x="400" y="120" width="160" height="120" rx="8" fill="white" stroke="#e0e0e0" stroke-width="1"/>
    <rect x="410" y="130" width="140" height="8" rx="4" fill="#e9ecef"/>
    <rect x="410" y="150" width="130" height="6" rx="3" fill="#dee2e6"/>
    <rect x="410" y="165" width="110" height="6" rx="3" fill="#dee2e6"/>
    <rect x="410" y="200" width="80" height="25" rx="12" fill="#dc3545"/>
    <text x="450" y="215" text-anchor="middle" fill="white" font-family="system-ui" font-size="10">${buttonLabels[2]}</text>
    
    <text x="300" y="280" text-anchor="middle" fill="#6c757d" font-family="system-ui" font-size="12">Demo ${type} • ${prompt.slice(0, 25)}${prompt.length > 25 ? '...' : ''}</text>
    <rect x="250" y="300" width="100" height="20" rx="10" fill="#f8f9fa" stroke="#dee2e6"/>
    <text x="300" y="312" text-anchor="middle" fill="#6c757d" font-family="system-ui" font-size="9">Interactive Preview</text>
  </svg>`;

  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
} function getDemoCode(style: string, platform: string, prompt: string): string {
  const promptLower = prompt.toLowerCase();

  // Generate different content based on prompt keywords
  let title = 'Custom Interface';
  let subtitle = `A ${style} ${platform} interface powered by Puter.js AI`;
  let theme = '#667eea', theme2 = '#764ba2';
  let cards: Array<{ icon: string, title: string, desc: string, btn: string }> = [];

  if (promptLower.includes('dashboard') || promptLower.includes('admin')) {
    title = 'Admin Dashboard';
    subtitle = 'Manage your system with this comprehensive admin panel';
    theme = '#0d6efd'; theme2 = '#0a58ca';
    cards = [
      { icon: '📊', title: 'Analytics', desc: 'View detailed analytics and performance metrics for your application.', btn: 'View Reports' },
      { icon: '👥', title: 'User Management', desc: 'Manage user accounts, permissions, and access controls.', btn: 'Manage Users' },
      { icon: '⚙️', title: 'System Settings', desc: 'Configure system preferences and application settings.', btn: 'Configure' }
    ];
  } else if (promptLower.includes('ecommerce') || promptLower.includes('shop') || promptLower.includes('store')) {
    title = 'Online Store';
    subtitle = 'Your complete e-commerce solution built for modern shopping';
    theme = '#198754'; theme2 = '#146c43';
    cards = [
      { icon: '🛍️', title: 'Product Catalog', desc: 'Browse our extensive collection of high-quality products.', btn: 'Shop Now' },
      { icon: '🛒', title: 'Shopping Cart', desc: 'Review your selected items and proceed to secure checkout.', btn: 'View Cart' },
      { icon: '💳', title: 'Secure Checkout', desc: 'Complete your purchase with our secure payment system.', btn: 'Checkout' }
    ];
  } else if (promptLower.includes('blog') || promptLower.includes('news') || promptLower.includes('article')) {
    title = 'Blog Platform';
    subtitle = 'Share your thoughts and connect with readers worldwide';
    theme = '#dc3545'; theme2 = '#b02a37';
    cards = [
      { icon: '📝', title: 'Latest Articles', desc: 'Discover the most recent posts from our community of writers.', btn: 'Read More' },
      { icon: '🏷️', title: 'Categories', desc: 'Explore articles organized by topics and interests.', btn: 'Browse' },
      { icon: '👤', title: 'Author Profiles', desc: 'Learn about our featured writers and their expertise.', btn: 'Meet Authors' }
    ];
  } else if (promptLower.includes('portfolio') || promptLower.includes('personal')) {
    title = 'Portfolio Site';
    subtitle = 'Showcasing creativity and professional excellence';
    theme = '#fd7e14'; theme2 = '#e8681b';
    cards = [
      { icon: '🎨', title: 'My Projects', desc: 'Explore a collection of my best work and creative projects.', btn: 'View Gallery' },
      { icon: '📄', title: 'About Me', desc: 'Learn about my background, skills, and professional journey.', btn: 'Read Bio' },
      { icon: '📞', title: 'Get In Touch', desc: 'Ready to work together? Let\'s discuss your next project.', btn: 'Contact Me' }
    ];
  } else if (promptLower.includes('social') || promptLower.includes('community')) {
    title = 'Social Platform';
    subtitle = 'Connect, share, and engage with your community';
    theme = '#6610f2'; theme2 = '#520dc2';
    cards = [
      { icon: '📱', title: 'Live Feed', desc: 'Stay updated with the latest posts and activities from your network.', btn: 'View Feed' },
      { icon: '💬', title: 'Messages', desc: 'Connect with friends through private messages and group chats.', btn: 'Open Chat' },
      { icon: '👤', title: 'Profile', desc: 'Customize your profile and share your story with the community.', btn: 'Edit Profile' }
    ];
  } else if (promptLower.includes('banking') || promptLower.includes('finance')) {
    title = 'Banking App';
    subtitle = 'Secure financial management at your fingertips';
    theme = '#20c997'; theme2 = '#1aa179';
    cards = [
      { icon: '💰', title: 'Account Balance', desc: 'View your current balance and recent transaction history.', btn: 'View Details' },
      { icon: '💸', title: 'Transfer Money', desc: 'Send money securely to friends, family, or business contacts.', btn: 'Transfer' },
      { icon: '📈', title: 'Investments', desc: 'Track your portfolio performance and investment opportunities.', btn: 'Invest Now' }
    ];
  } else {
    // Generic interface based on prompt words
    const words = prompt.split(' ').filter(w => w.length > 3);
    title = words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Custom Interface';
    subtitle = `A ${style} interface for ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`;
    cards = [
      { icon: '🚀', title: 'Getting Started', desc: `Begin your journey with this ${style} interface designed for ${platform}.`, btn: 'Start Now' },
      { icon: '⚡', title: 'Key Features', desc: 'Discover the powerful features that make this interface special.', btn: 'Explore' },
      { icon: '🎯', title: 'Your Goals', desc: `Achieve your objectives with tools tailored for ${prompt.split(' ')[0] || 'success'}.`, btn: 'Learn More' }
    ];
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - AI Generated</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 2rem; 
        }
        .header { 
            background: linear-gradient(135deg, ${theme} 0%, ${theme2} 100%); 
            color: white; 
            padding: 3rem 2rem; 
            text-align: center; 
            border-radius: 15px; 
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(${parseInt(theme.slice(1, 3), 16)}, ${parseInt(theme.slice(3, 5), 16)}, ${parseInt(theme.slice(5, 7), 16)}, 0.3);
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .content { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 2rem; 
        }
        .card { 
            background: white; 
            border-radius: 15px; 
            padding: 2rem; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        .card h2 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        .card p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        .btn { 
            background: linear-gradient(135deg, ${theme} 0%, ${theme2} 100%); 
            color: white; 
            padding: 1rem 2rem; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(${parseInt(theme.slice(1, 3), 16)}, ${parseInt(theme.slice(3, 5), 16)}, ${parseInt(theme.slice(5, 7), 16)}, 0.4);
        }
        .footer {
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
            color: #666;
            border-top: 1px solid #eee;
        }
        @media (max-width: 768px) { 
            .container { padding: 1rem; } 
            .content { grid-template-columns: 1fr; }
            .header h1 { font-size: 2rem; }
            .header { padding: 2rem 1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <p>${subtitle}</p>
        </div>
        <div class="content">
            ${cards.map(card => `
            <div class="card">
                <h2>${card.icon} ${card.title}</h2>
                <p>${card.desc}</p>
                <button class="btn">${card.btn}</button>
            </div>`).join('')}
        </div>
        <div class="footer">
            <p>Generated with FairForge • Powered by Puter.js</p>
            <small>Prompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"</small>
        </div>
    </div>
</body>
</html>`;
}