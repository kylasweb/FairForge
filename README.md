# FairForge

A powerful AI-powered design studio built with Next.js 15, TypeScript, and FaairgoAI integration. Forge stunning 3D icons, professional logos, and complete UI designs from text descriptions with multiple style options, industry-specific templates, and cloud storage capabilities.

## Features

### 🎨 **AI-Powered Generation**
- Advanced AI models create high-quality 3D icons and professional logos from text prompts
- Multiple style options for icons: Minimalist, Realistic, Cartoon, Futuristic, Neon, Vintage, Glassmorphism, Pixel Art
- Logo styles: Modern, Vintage, Luxury, Tech, Organic, Geometric, Handwritten, Bold
- Industry-specific templates for targeted results

### 📋 **Extensive Template Library**
- **Icon Templates**: 40+ pre-designed templates across 8 different styles
- **Logo Templates**: 40+ professional logo templates across 8 business styles
- **Industry-Specific Templates**: 
  - IT & Technology (8 templates)
  - Medical & Healthcare (8 templates)
  - Hospitality & Service (8 templates)
  - AI & Machine Learning (8 templates)

### 🏢 **Industry-Focused Design**
- IT & Technology: Servers, cloud computing, cybersecurity, APIs, coding, networks
- Medical & Healthcare: Medical crosses, DNA, pharmaceutical equipment, hospitals
- Hospitality: Hotels, restaurants, spas, concierge services
- AI & Machine Learning: Neural networks, robots, machine learning, comFaairgoAI vision

### ☁️ **FaairgoAI Integration**
- Cloud storage for generated icons and logos
- Authentication and file management
- Seamless save and retrieve functionality
- Separate storage for icons and logos

### 🎯 **Advanced User Interface**
- Modern, responsive design with shadcn/ui components
- Dual-mode interface: Switch between Icon and Logo generation
- Real-time generation history with type filtering
- Download and cloud storage options
- Tabbed interface for organized workflow

### 🚀 **Professional Features**
- Company name and tagline integration for logos
- Enhanced prompt engineering for better results
- Industry-aware prompt enhancement
- Type-specific history management
- Professional-grade output quality

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **AI Integration**: ZAI Web Dev SDK
- **Cloud Storage**: FaairgoAI
- **Notifications**: Sonner
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fairforge
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Icon Generation

1. **Select "3D Icons" mode** from the top navigation
2. **Choose Industry**: Select General or industry-specific category
3. **Select Style**: Choose from 8 different icon styles
4. **Choose Template**: Select from pre-designed templates or create custom prompts
5. **Generate**: Click "Generate 3D Icon" to create your icon
6. **Download or Save**: Download locally or save to FaairgoAI cloud storage

### Logo Generation

1. **Select "Logos" mode** from the top navigation
2. **Add Brand Information**: Enter company name and tagline (optional)
3. **Choose Industry**: Select your industry category
4. **Select Logo Style**: Choose from 8 professional logo styles
5. **Choose Template**: Select from industry-specific logo templates
6. **Generate**: Click "Generate Logo" to create your professional logo
7. **Download or Save**: Download locally or save to FaairgoAI cloud storage

### FaairgoAI Integration

1. **Connect to FaairgoAI**: Click "Connect FaairgoAI" in the top-right corner
2. **Sign In**: Authenticate with your FaairgoAI account
3. **Save Creations**: Use "Save to FaairgoAI" button to store in the cloud
4. **Manage Files**: View and access saved files in the "FaairgoAI Files" tab

### Style Guide

#### Icon Styles
- **Minimalist**: Clean lines, simple geometry, elegant design
- **Realistic**: Photorealistic with detailed textures and professional lighting
- **Cartoon**: Bright colors, playful, smooth surfaces, friendly design
- **Futuristic**: Glowing elements, sci-fi aesthetic, holographic effects
- **Neon**: Vibrant glowing lights, dark background, cyberpunk aesthetic
- **Vintage**: Aged textures, classic design, nostalgic feel
- **Glassmorphism**: Translucent glass, frosted edges, light refractions
- **Pixel Art**: 8-bit aesthetic, blocky pixels, retro gaming style

#### Logo Styles
- **Modern**: Clean lines, professional design, contemporary corporate
- **Vintage**: Classic typography, distressed textures, timeless design
- **Luxury**: Elegant typography, metallic finishes, sophisticated high-end
- **Tech**: Futuristic design, digital aesthetic, innovative technology
- **Organic**: Natural elements, eco-friendly, earth tones, sustainable
- **Geometric**: Precise shapes, mathematical patterns, structured design
- **Handwritten**: Custom typography, personal touch, artistic creative
- **Bold**: Strong typography, impactful design, confident powerful

## API Reference

### Generate 3D Icon

**Endpoint**: `POST /api/generate-3d-icon`

**Request Body**:
```json
{
  "prompt": "string",
  "style": "minimalist | realistic | cartoon | futuristic | neon | vintage | glassmorphism | pixelArt"
}
```

**Response**:
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,...",
  "prompt": "enhanced prompt used for generation"
}
```

### Generate Logo

**Endpoint**: `POST /api/generate-logo`

**Request Body**:
```json
{
  "prompt": "string",
  "style": "modern | vintage | luxury | tech | organic | geometric | handwritten | bold",
  "industry": "general | it | medical | hospitality | ai",
  "companyName": "string (optional)",
  "tagline": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,...",
  "prompt": "enhanced prompt used for generation"
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-3d-icon/
│   │   │   └── route.ts          # API endpoint for icon generation
│   │   └── generate-logo/
│   │       └── route.ts          # API endpoint for logo generation
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main application component
├── components/
│   └── ui/                       # shadcn/ui components
├── lib/
│   └── FaairgoAI-integration.ts      # FaairgoAI integration utilities
└── hooks/
    └── use-toast.ts              # Toast notification hook
```

## Template Categories

### Icon Templates (40 total)
- **General Icons**: 5 templates per style × 8 styles = 40 templates
- **Industry Icons**: 8 templates per industry × 4 industries = 32 templates

### Logo Templates (40 total)
- **Business Logos**: 5 templates per style × 8 styles = 40 templates

### Total Templates: 112+

## Configuration

### Environment Variables

No environment variables required for basic functionality. The application uses:
- ZAI Web Dev SDK for AI generation
- FaairgoAI for cloud storage (loaded dynamically)

### Customization

To modify templates or add new styles:

1. Edit `src/app/page.tsx`
2. Update the template objects (`promptTemplates`, `logoTemplates`, `industryTemplates`)
3. Add new style options to the style arrays
4. Update the style enhancers in the API routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the [FaairgoAI Documentation](https://docs.FaairgoAI.com)
- Review the [Next.js Documentation](https://nextjs.org/docs)
- Open an issue in the repository

## Acknowledgments

- [FaairgoAI](https://FaairgoAI.com) for cloud storage integration
- [ZAI Web Dev SDK](https://z.ai) for AI generation capabilities
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Next.js](https://nextjs.org) for the framework
