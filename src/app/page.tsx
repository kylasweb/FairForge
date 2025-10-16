'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Sparkles, Box, Palette, Zap, Cloud, CloudOff, User, LogOut, PenTool, RefreshCw, Eraser, Expand, Wand2, Settings, Trash2, Edit3, Layers, Grid3x3, Monitor, Smartphone, Tablet, Upload, Code, FileText, Bug, Camera, Archive, Volume2, Eye, Sliders, Zap as Lightning, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { initializeFaairgoAI, saveIconToFaairgoAI, getFaairgoAIFiles, getFaairgoAIAuthStatus, signInToFaairgoAI, signOutFromFaairgoAI, streamChatWithFaairgoAI, analyzeImageAdvanced, generateImageWithQuality, textToSpeechWithFaairgoAI, type FaairgoAIFile } from '@/lib/faairgoai-integration'
import JSZip from 'jszip'

// UI/UX Generation Templates
const uiGenerationTemplates = {
  textToUI: [
    { name: 'Login Screen', prompt: 'Create a modern login screen for a mobile app with email/password fields, social login buttons, and clean design' },
    { name: 'E-commerce Product Page', prompt: 'Design a product details page for an e-commerce app with product images, price, description, and add to cart button' },
    { name: 'Dashboard Analytics', prompt: 'Create a dashboard interface with charts, metrics cards, and data visualization for analytics platform' },
    { name: 'Social Media Feed', prompt: 'Design a social media feed with posts, user interactions, stories, and navigation elements' },
    { name: 'Banking App', prompt: 'Create a banking app interface with account balance, transaction history, and transfer functionality' }
  ],
  wireframeToUI: [
    { name: 'App Wireframe', prompt: 'Convert hand-drawn app wireframe to clean digital UI with proper spacing and modern design' },
    { name: 'Website Layout', prompt: 'Transform website wireframe sketch into polished web design with navigation and content sections' },
    { name: 'Form Design', prompt: 'Convert form wireframe to styled UI with proper input fields, labels, and validation states' },
    { name: 'Navigation Flow', prompt: 'Transform navigation wireframe into interactive UI with menu items and user flow' }
  ],
  screenshotToUI: [
    { name: 'App Redesign', prompt: 'Recreate and improve this app screenshot with modern design principles and better UX' },
    { name: 'Website Clone', prompt: 'Convert website screenshot to editable UI design with component-based structure' },
    { name: 'Component Extraction', prompt: 'Extract and recreate UI components from this screenshot as reusable design elements' }
  ]
}

const uiPlatformOptions = [
  { value: 'web', label: 'Web Design', icon: Monitor },
  { value: 'mobile', label: 'Mobile App', icon: Smartphone },
  { value: 'tablet', label: 'Tablet Design', icon: Tablet },
  { value: 'responsive', label: 'Responsive Design', icon: Grid3x3 }
]

const uiStyleOptions = [
  { value: 'modern', label: 'Modern', icon: Sparkles },
  { value: 'minimalist', label: 'Minimalist', icon: Box },
  { value: 'material', label: 'Material Design', icon: Palette },
  { value: 'ios', label: 'iOS Style', icon: Smartphone },
  { value: 'bootstrap', label: 'Bootstrap', icon: Code },
  { value: 'tailwind', label: 'Tailwind CSS', icon: Code }
]

const promptTemplates = {
  minimalist: [
    { name: 'Home Icon', prompt: 'Create a minimalist 3D home icon, clean lines, soft shadows, modern design' },
    { name: 'Settings', prompt: 'Generate a 3D settings gear icon, minimalist style, smooth rotation, metallic finish' },
    { name: 'User Profile', prompt: 'Design a 3D user profile icon, simple silhouette, gradient colors, elegant' },
    { name: 'Mail', prompt: 'Create a 3D envelope icon, minimalist, paper texture, subtle depth' },
    { name: 'Heart', prompt: 'Generate a 3D heart icon, clean geometry, soft pink gradient, modern' }
  ],
  realistic: [
    { name: 'Camera', prompt: 'Create a photorealistic 3D camera icon, detailed lens, metallic body, studio lighting' },
    { name: 'Coffee Cup', prompt: 'Generate a realistic 3D coffee cup, ceramic material, steam effects, warm lighting' },
    { name: 'Headphones', prompt: 'Design a realistic 3D headphones icon, detailed texture, leather cushions, metallic accents' },
    { name: 'Watch', prompt: 'Create a photorealistic 3D smartwatch, detailed screen, metal band, premium materials' },
    { name: 'Sneaker', prompt: 'Generate a realistic 3D sneaker icon, detailed texture, rubber sole, dynamic pose' }
  ],
  cartoon: [
    { name: 'Star', prompt: 'Create a cute 3D cartoon star icon, bright colors, playful style, smooth surfaces' },
    { name: 'Rocket', prompt: 'Generate a 3D cartoon rocket ship, colorful, friendly design, exhaust flames' },
    { name: 'Rainbow', prompt: 'Design a 3D cartoon rainbow icon, vibrant colors, fluffy clouds, cheerful' },
    { name: 'Ice Cream', prompt: 'Create a 3D cartoon ice cream cone, sprinkles, melting effect, fun style' },
    { name: 'Pizza', prompt: 'Generate a 3D cartoon pizza slice, melted cheese, pepperoni, delicious look' }
  ],
  futuristic: [
    { name: 'AI Brain', prompt: 'Create a futuristic 3D AI brain icon, glowing circuits, neural network, holographic' },
    { name: 'Cyber Eye', prompt: 'Generate a futuristic 3D cybernetic eye, LED lights, metallic details, sci-fi' },
    { name: 'Data Cube', prompt: 'Design a futuristic 3D data cube, holographic display, floating particles, tech' },
    { name: 'Quantum', prompt: 'Create a futuristic 3D quantum icon, energy particles, glowing effects, abstract' },
    { name: 'Network', prompt: 'Generate a futuristic 3D network icon, connected nodes, data streams, digital' }
  ],
  neon: [
    { name: 'Neon Heart', prompt: 'Create a neon 3D heart icon, glowing pink and blue lights, dark background, cyberpunk aesthetic' },
    { name: 'Neon Star', prompt: 'Generate a neon 3D star icon, bright glowing edges, electric blue, vibrant lighting' },
    { name: 'Neon Lightning', prompt: 'Design a neon 3D lightning bolt icon, electric yellow glow, dramatic lighting effects' },
    { name: 'Neon Moon', prompt: 'Create a neon 3D crescent moon icon, purple and pink glow, mystical atmosphere' },
    { name: 'Neon Flame', prompt: 'Generate a neon 3D flame icon, orange and red glow, fire effects, intense lighting' }
  ],
  vintage: [
    { name: 'Vintage Camera', prompt: 'Create a vintage 3D camera icon, retro design, brass finish, aged texture, classic' },
    { name: 'Vintage Phone', prompt: 'Generate a vintage 3D rotary phone icon, antique black, retro styling, nostalgic' },
    { name: 'Vintage Car', prompt: 'Design a vintage 3D car icon, 1950s style, pastel colors, classic automobile' },
    { name: 'Vintage Watch', prompt: 'Create a vintage 3D pocket watch icon, gold finish, ornate details, timeless' },
    { name: 'Vintage Radio', prompt: 'Generate a vintage 3D radio icon, wooden case, retro dials, nostalgic charm' }
  ],
  glassmorphism: [
    { name: 'Glass Heart', prompt: 'Create a glassmorphism 3D heart icon, translucent glass, frosted edges, soft blur' },
    { name: 'Glass Cube', prompt: 'Generate a glassmorphism 3D cube icon, transparent glass, colored reflections, modern' },
    { name: 'Glass Sphere', prompt: 'Design a glassmorphism 3D sphere icon, crystal clear, light refractions, elegant' },
    { name: 'Glass Diamond', prompt: 'Create a glassmorphism 3D diamond icon, faceted glass, prism effects, luxury' },
    { name: 'Glass Star', prompt: 'Generate a glassmorphism 3D star icon, translucent material, glowing core, ethereal' }
  ],
  pixelArt: [
    { name: 'Pixel Sword', prompt: 'Create a pixel art 3D sword icon, 8-bit style, blocky pixels, retro gaming' },
    { name: 'Pixel Mushroom', prompt: 'Generate a pixel art 3D mushroom icon, classic gaming, red spots, pixelated' },
    { name: 'Pixel Ghost', prompt: 'Design a pixel art 3D ghost icon, cute retro style, white pixels, friendly' },
    { name: 'Pixel Coin', prompt: 'Create a pixel art 3D coin icon, golden pixels, retro arcade, collectible' },
    { name: 'Pixel Heart', prompt: 'Generate a pixel art 3D heart icon, 8-bit style, pink pixels, nostalgic' }
  ]
}

// Industry-specific templates
const industryTemplates = {
  it: [
    { name: 'Server', prompt: 'Create a 3D server rack icon, professional IT equipment, blue LED lights, modern data center' },
    { name: 'Cloud Computing', prompt: 'Generate a 3D cloud computing icon, fluffy cloud with digital elements, tech blue, connectivity' },
    { name: 'Database', prompt: 'Design a 3D database icon, cylindrical servers, data visualization, professional blue' },
    { name: 'Cybersecurity', prompt: 'Create a 3D cybersecurity shield icon, protective barrier, digital lock, security blue' },
    { name: 'API', prompt: 'Generate a 3D API icon, connected nodes, data flow, technical diagram, modern tech' },
    { name: 'Code', prompt: 'Design a 3D code icon, brackets and syntax, programming elements, developer tools' },
    { name: 'Network', prompt: 'Create a 3D network icon, connected devices, mesh network, infrastructure' },
    { name: 'Algorithm', prompt: 'Generate a 3D algorithm icon, flowchart elements, logical patterns, computational' }
  ],
  medical: [
    { name: 'Medical Cross', prompt: 'Create a 3D medical cross icon, red cross emblem, healthcare professional, clean design' },
    { name: 'Heartbeat', prompt: 'Generate a 3D heartbeat icon, ECG waveform, medical monitoring, vital signs' },
    { name: 'DNA Helix', prompt: 'Design a 3D DNA helix icon, genetic structure, medical research, scientific' },
    { name: 'Pill', prompt: 'Create a 3D pill icon, medicine capsule, pharmaceutical, healthcare treatment' },
    { name: 'Stethoscope', prompt: 'Generate a 3D stethoscope icon, medical instrument, doctor tool, healthcare' },
    { name: 'Medical Kit', prompt: 'Design a 3D medical first aid kit icon, emergency supplies, healthcare ready' },
    { name: 'Syringe', prompt: 'Create a 3D syringe icon, medical injection, vaccination, healthcare tool' },
    { name: 'Hospital', prompt: 'Generate a 3D hospital building icon, healthcare facility, medical center' }
  ],
  hospitality: [
    { name: 'Hotel Building', prompt: 'Create a 3D hotel building icon, hospitality industry, accommodation service' },
    { name: 'Restaurant', prompt: 'Generate a 3D restaurant icon, dining establishment, food service, chef hat' },
    { name: 'Bed', prompt: 'Design a 3D bed icon, hotel room, comfortable accommodation, hospitality' },
    { name: 'Food Tray', prompt: 'Create a 3D food tray icon, room service, hotel dining, hospitality service' },
    { name: 'Bell', prompt: 'Generate a 3D service bell icon, hotel reception, customer service, hospitality' },
    { name: 'Key Card', prompt: 'Design a 3D hotel key card icon, room access, hospitality security' },
    { name: 'Concierge', prompt: 'Create a 3D concierge desk icon, hotel service, guest assistance, luxury' },
    { name: 'Spa', prompt: 'Generate a 3D spa icon, wellness center, relaxation, hospitality amenities' }
  ],
  ai: [
    { name: 'Neural Network', prompt: 'Create a 3D neural network icon, connected nodes, AI brain, machine learning' },
    { name: 'Robot Head', prompt: 'Generate a 3D robot head icon, artificial intelligence, futuristic tech, smart AI' },
    { name: 'AI Chip', prompt: 'Design a 3D AI processor chip icon, neural processor, computing hardware, AI tech' },
    { name: 'Machine Learning', prompt: 'Create a 3D machine learning icon, data patterns, algorithm visualization, AI learning' },
    { name: 'Deep Learning', prompt: 'Generate a 3D deep learning icon, layered networks, AI architecture, advanced tech' },
    { name: 'Chatbot', prompt: 'Design a 3D chatbot icon, conversational AI, messaging interface, smart assistant' },
    { name: 'Computer Vision', prompt: 'Create a 3D computer vision icon, eye recognition, AI sight, visual intelligence' },
    { name: 'AI Assistant', prompt: 'Generate a 3D AI assistant icon, helpful robot, smart helper, digital assistant' }
  ]
}

// Logo-specific templates
const logoTemplates = {
  modern: [
    { name: 'Tech Startup', prompt: 'Modern tech logo with abstract shapes, clean typography, innovative design' },
    { name: 'Consulting Firm', prompt: 'Professional consulting logo, minimalist design, trustworthy appearance' },
    { name: 'E-commerce Brand', prompt: 'Modern e-commerce logo, shopping elements, digital commerce focus' },
    { name: 'Software Company', prompt: 'Software company logo, code elements, digital innovation theme' },
    { name: 'Financial Services', prompt: 'Financial services logo, secure design, professional appearance' }
  ],
  vintage: [
    { name: 'Coffee Shop', prompt: 'Vintage coffee shop logo, retro typography, warm and inviting' },
    { name: 'Barbershop', prompt: 'Classic barbershop logo, traditional design, vintage barber elements' },
    { name: 'Bakery', prompt: 'Vintage bakery logo, retro baking elements, nostalgic feel' },
    { name: 'Bookstore', prompt: 'Classic bookstore logo, literary elements, timeless design' },
    { name: 'Restaurant', prompt: 'Vintage restaurant logo, classic dining elements, heritage feel' }
  ],
  luxury: [
    { name: 'Jewelry Brand', prompt: 'Luxury jewelry logo, elegant typography, premium materials' },
    { name: 'Hotel Chain', prompt: 'Luxury hotel logo, sophisticated design, premium hospitality' },
    { name: 'Fashion Brand', prompt: 'High fashion logo, elegant typography, luxury style' },
    { name: 'Real Estate', prompt: 'Luxury real estate logo, premium property design, sophisticated' },
    { name: 'Winery', prompt: 'Premium winery logo, elegant wine elements, luxury branding' }
  ],
  tech: [
    { name: 'AI Company', prompt: 'AI technology logo, neural network elements, futuristic design' },
    { name: 'Cybersecurity', prompt: 'Cybersecurity logo, shield elements, digital protection theme' },
    { name: 'Cloud Services', prompt: 'Cloud computing logo, cloud elements, digital infrastructure' },
    { name: 'Mobile App', prompt: 'Mobile app logo, app interface elements, user-friendly design' },
    { name: 'Data Analytics', prompt: 'Data analytics logo, chart elements, insights visualization' }
  ],
  organic: [
    { name: 'Organic Food', prompt: 'Organic food logo, natural elements, green and earthy tones' },
    { name: 'Yoga Studio', prompt: 'Yoga studio logo, zen elements, peaceful and natural design' },
    { name: 'Eco Products', prompt: 'Eco-friendly products logo, sustainability elements, green design' },
    { name: 'Natural Beauty', prompt: 'Natural beauty logo, organic elements, clean and fresh' },
    { name: 'Garden Center', prompt: 'Garden center logo, plant elements, natural growth theme' }
  ],
  geometric: [
    { name: 'Architecture Firm', prompt: 'Geometric architecture logo, structural elements, precise design' },
    { name: 'Engineering Company', prompt: 'Engineering logo, technical elements, geometric precision' },
    { name: 'Construction', prompt: 'Construction logo, building elements, geometric shapes' },
    { name: 'Manufacturing', prompt: 'Manufacturing logo, industrial elements, geometric design' },
    { name: 'Design Studio', prompt: 'Design studio logo, creative geometry, artistic precision' }
  ],
  handwritten: [
    { name: 'Artisan Bakery', prompt: 'Handwritten bakery logo, custom typography, personal touch' },
    { name: 'Craft Store', prompt: 'Handwritten craft store logo, artistic elements, creative feel' },
    { name: 'Personal Blog', prompt: 'Personal blog logo, handwritten style, unique character' },
    { name: 'Photography', prompt: 'Photography logo, artistic handwriting, creative expression' },
    { name: 'Wedding Planner', prompt: 'Wedding planner logo, elegant handwriting, romantic feel' }
  ],
  bold: [
    { name: 'Sports Brand', prompt: 'Bold sports logo, strong typography, athletic energy' },
    { name: 'Fitness Gym', prompt: 'Bold fitness logo, powerful design, strength theme' },
    { name: 'Security Company', prompt: 'Bold security logo, protective elements, strong appearance' },
    { name: 'Automotive', prompt: 'Bold automotive logo, speed elements, powerful design' },
    { name: 'Construction', prompt: 'Bold construction logo, industrial strength, reliable design' }
  ]
}

const styleOptions = [
  { value: 'minimalist', label: 'Minimalist', icon: Box },
  { value: 'realistic', label: 'Realistic', icon: Palette },
  { value: 'cartoon', label: 'Cartoon', icon: Sparkles },
  { value: 'futuristic', label: 'Futuristic', icon: Zap },
  { value: 'neon', label: 'Neon', icon: Zap },
  { value: 'vintage', label: 'Vintage', icon: Box },
  { value: 'glassmorphism', label: 'Glassmorphism', icon: Sparkles },
  { value: 'pixelArt', label: 'Pixel Art', icon: Box }
]

const logoStyleOptions = [
  { value: 'modern', label: 'Modern', icon: Box },
  { value: 'vintage', label: 'Vintage', icon: Box },
  { value: 'luxury', label: 'Luxury', icon: Sparkles },
  { value: 'tech', label: 'Tech', icon: Zap },
  { value: 'organic', label: 'Organic', icon: Palette },
  { value: 'geometric', label: 'Geometric', icon: Box },
  { value: 'handwritten', label: 'Handwritten', icon: PenTool },
  { value: 'bold', label: 'Bold', icon: Zap }
]

const industryOptions = [
  { value: 'general', label: 'General' },
  { value: 'it', label: 'IT & Technology' },
  { value: 'medical', label: 'Medical & Healthcare' },
  { value: 'hospitality', label: 'Hospitality & Service' },
  { value: 'ai', label: 'AI & Machine Learning' }
]

export default function FairForge() {
  const [mode, setMode] = useState<'icon' | 'logo' | 'ui' | 'architect'>('icon')
  const [selectedStyle, setSelectedStyle] = useState('minimalist')
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['minimalist']) // For composable styles
  const [selectedIndustry, setSelectedIndustry] = useState('general')
  const [selectedModel, setSelectedModel] = useState<'gpt-4' | 'gpt-5-nano' | 'claude' | 'claude-sonnet-4' | 'gemini' | 'gemini-2.5-flash' | 'grok' | 'mistral' | 'dall-e-3' | 'deepseek'>('gpt-5-nano')
  const [customPrompt, setCustomPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedIcon, setGeneratedIcon] = useState<string | null>(null)
  const [generatedVariations, setGeneratedVariations] = useState<string[]>([])

  // Enhanced features state
  const [selectedQuality, setSelectedQuality] = useState<'low' | 'medium' | 'high' | 'hd'>('medium')
  const [streamingEnabled, setStreamingEnabled] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)
  const [audioEnabled, setAudioEnabled] = useState(false)

  // Prompt Architect States
  const [architectPrompt, setArchitectPrompt] = useState('')
  const [architectMode, setArchitectMode] = useState<'input' | 'interrogation' | 'synthesis'>('input')
  const [architectQuestions, setArchitectQuestions] = useState<Array<{ id: string, question: string, answer: string, category: string }>>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [finalArchitectPrompt, setFinalArchitectPrompt] = useState('')
  const [architectOutputType, setArchitectOutputType] = useState<'image' | 'story' | 'code' | 'other'>('image')

  // UI Generation States
  const [uiGenerationType, setUiGenerationType] = useState<'textToUI' | 'wireframeToUI' | 'screenshotToUI'>('textToUI')
  const [selectedPlatform, setSelectedPlatform] = useState('web')
  const [selectedUIStyle, setSelectedUIStyle] = useState('modern')
  const [urlInput, setUrlInput] = useState('')
  const [uiPrompt, setUiPrompt] = useState('')
  const [generatedUI, setGeneratedUI] = useState<string | null>(null)
  const [uiCode, setUiCode] = useState<string | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{ prompt: string; url: string; timestamp: Date; type: 'icon' | 'logo' | 'ui' | 'architect' }>>([])
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)

  // Guided prompt builder fields
  const [companyName, setCompanyName] = useState('')
  const [tagline, setTagline] = useState('')
  const [keywords, setKeywords] = useState('')
  const [preferredColors, setPreferredColors] = useState('')
  const [thingsToAvoid, setThingsToAvoid] = useState('')

  // Advanced editing states
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null)
  const [isRemixing, setIsRemixing] = useState(false)
  const [editMode, setEditMode] = useState<'none' | 'inpaint' | 'outpaint'>('none')
  const [batchSize, setBatchSize] = useState(4)

  // FaairgoAI integration states
  const [faairgoAIInitialized, setFaairgoAIInitialized] = useState(false)
  const [faairgoAIAuthStatus, setFaairgoAIAuthStatus] = useState(false)
  const [faairgoAIFiles, setFaairgoAIFiles] = useState<FaairgoAIFile[]>([])
  const [showFaairgoAIFiles, setShowFaairgoAIFiles] = useState(false)

  // Initialize FaairgoAI on component mount
  useEffect(() => {
    const initFaairgoAI = async () => {
      const initialized = await initializeFaairgoAI()
      setFaairgoAIInitialized(initialized)
      if (initialized) {
        setFaairgoAIAuthStatus(getFaairgoAIAuthStatus())
        if (getFaairgoAIAuthStatus()) {
          loadFaairgoAIFiles()
        }
      }
    }
    initFaairgoAI()
  }, [])

  const loadFaairgoAIFiles = async () => {
    try {
      // Only load files if FaairgoAI is initialized and user is authenticated
      if (!faairgoAIInitialized) {
        console.log('FaairgoAI not initialized, skipping file loading');
        return;
      }

      if (!getFaairgoAIAuthStatus()) {
        console.log('User not authenticated with FaairgoAI, skipping file loading');
        return;
      }

      const files = await getFaairgoAIFiles()
      setFaairgoAIFiles(files)
    } catch (error) {
      console.error('Failed to load FaairgoAI files:', error)
      setFaairgoAIFiles([]) // Clear files on error
    }
  }

  const handleFaairgoAISignIn = async () => {
    try {
      const success = await signInToFaairgoAI()
      if (success) {
        setFaairgoAIAuthStatus(true)
        await loadFaairgoAIFiles()
        toast.success('Successfully signed in to FaairgoAI!')
      }
    } catch (error) {
      toast.error('Failed to sign in to FaairgoAI')
    }
  }

  const handleFaairgoAISignOut = async () => {
    try {
      const success = await signOutFromFaairgoAI()
      if (success) {
        setFaairgoAIAuthStatus(false)
        setFaairgoAIFiles([])
        toast.success('Successfully signed out from FaairgoAI')
      }
    } catch (error) {
      toast.error('Failed to sign out from FaairgoAI')
    }
  }

  const saveToFaairgoAI = async () => {
    if (!generatedIcon || !faairgoAIAuthStatus) return

    try {
      const filename = `3d-icon-${Date.now()}.png`
      const file = await saveIconToFaairgoAI(generatedIcon, filename)
      if (file) {
        toast.success('Icon saved to FaairgoAI storage!')
        await loadFaairgoAIFiles()
      } else {
        toast.error('Failed to save icon to FaairgoAI')
      }
    } catch (error) {
      toast.error('Failed to save icon to FaairgoAI')
    }
  }

  const handleTemplateSelect = (template: { name: string; prompt: string }) => {
    setSelectedTemplate(template.prompt)
    setCustomPrompt(template.prompt)
  }

  // Quick Demo Functions for 1-click generation
  const runIconDemo = async () => {
    const demoTemplate = promptTemplates.minimalist[0] // "Home Icon"
    setSelectedStyle('minimalist')
    setCustomPrompt(demoTemplate.prompt)
    setSelectedTemplate(demoTemplate.prompt)
    setMode('icon')

    // Auto-generate after setting values
    setTimeout(() => {
      toast.info('Running Icon Demo - Generating minimalist home icon...')
      generateIcon()
    }, 500)
  }

  const runLogoDemo = async () => {
    const demoTemplate = logoTemplates.modern[0] // "Tech Startup"
    setSelectedStyle('modern')
    setCustomPrompt(demoTemplate.prompt)
    setSelectedTemplate(demoTemplate.prompt)
    setCompanyName('TechFlow')
    setTagline('Innovation Simplified')
    setKeywords('technology, innovation, modern')
    setPreferredColors('blue, white, silver')
    setMode('logo')

    // Auto-generate after setting values
    setTimeout(() => {
      toast.info('Running Logo Demo - Generating modern tech startup logo...')
      generateIcon()
    }, 500)
  }

  const runUIDemo = async () => {
    const demoTemplate = uiGenerationTemplates.textToUI[0] // "Login Screen"
    setUiGenerationType('textToUI')
    setSelectedPlatform('mobile')
    setSelectedUIStyle('modern')
    setUiPrompt(demoTemplate.prompt)

    // Auto-generate after setting values
    setTimeout(() => {
      toast.info('Running UI Demo - Generating modern login screen...')
      generateUI()
    }, 500)
  }

  const run3DIconDemo = async () => {
    const demoTemplate = promptTemplates.realistic[0] // "Camera"
    setSelectedStyle('realistic')
    setCustomPrompt(demoTemplate.prompt)
    setSelectedTemplate(demoTemplate.prompt)
    setMode('icon')

    // Auto-generate after setting values
    setTimeout(() => {
      toast.info('Running 3D Icon Demo - Generating photorealistic camera icon...')
      generateIcon()
    }, 500)
  }

  const runArchitectDemo = async () => {
    const demoPrompt = "Create a modern mobile app dashboard for fitness tracking"
    setArchitectPrompt(demoPrompt)
    setArchitectOutputType('image')
    setMode('architect')

    // Auto-generate after setting values
    setTimeout(() => {
      toast.info('Running Architect Demo - Enhancing prompt with AI analysis...')
      processArchitectPrompt()
    }, 500)
  }

  // Additional demo functions for variety
  const runRandomIconDemo = async () => {
    const styles = ['minimalist', 'realistic', 'cartoon', 'futuristic', 'neon', 'vintage']
    const randomStyle = styles[Math.floor(Math.random() * styles.length)]
    const templates = promptTemplates[randomStyle as keyof typeof promptTemplates]
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]

    setSelectedStyle(randomStyle)
    setCustomPrompt(randomTemplate.prompt)
    setSelectedTemplate(randomTemplate.prompt)
    setMode('icon')

    setTimeout(() => {
      toast.info(`Running Random Icon Demo - Generating ${randomStyle} style: ${randomTemplate.name}`)
      generateIcon()
    }, 500)
  }

  const runRandomLogoDemo = async () => {
    const logoStyles = ['modern', 'vintage', 'luxury', 'tech', 'organic', 'geometric', 'handwritten', 'bold']
    const randomStyle = logoStyles[Math.floor(Math.random() * logoStyles.length)]
    const templates = logoTemplates[randomStyle as keyof typeof logoTemplates]
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]

    const companyNames = ['TechFlow', 'InnovateCorp', 'CreateLab', 'DesignForge', 'FutureVision', 'BrightIdeas']
    const taglines = ['Innovation Simplified', 'Creating Tomorrow', 'Design Excellence', 'Beyond Boundaries', 'Future Ready', 'Ideas in Motion']

    setSelectedStyle(randomStyle)
    setCustomPrompt(randomTemplate.prompt)
    setSelectedTemplate(randomTemplate.prompt)
    setCompanyName(companyNames[Math.floor(Math.random() * companyNames.length)])
    setTagline(taglines[Math.floor(Math.random() * taglines.length)])
    setMode('logo')

    setTimeout(() => {
      toast.info(`Running Random Logo Demo - Generating ${randomStyle} style: ${randomTemplate.name}`)
      generateIcon()
    }, 500)
  }

  const runRandomUIDemo = async () => {
    const platforms = ['web', 'mobile', 'tablet', 'responsive']
    const styles = ['modern', 'minimalist', 'material', 'ios', 'bootstrap', 'tailwind']
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)]
    const randomStyle = styles[Math.floor(Math.random() * styles.length)]
    const templates = uiGenerationTemplates.textToUI
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]

    setUiGenerationType('textToUI')
    setSelectedPlatform(randomPlatform)
    setSelectedUIStyle(randomStyle)
    setUiPrompt(randomTemplate.prompt)

    setTimeout(() => {
      toast.info(`Running Random UI Demo - Generating ${randomStyle} ${randomPlatform} UI: ${randomTemplate.name}`)
      generateUI()
    }, 500)
  }

  // Industry-specific demo functions
  const runTechIconDemo = async () => {
    const techTemplates = industryTemplates.it
    const randomTemplate = techTemplates[Math.floor(Math.random() * techTemplates.length)]

    setSelectedIndustry('it')
    setSelectedStyle('futuristic')
    setCustomPrompt(randomTemplate.prompt)
    setSelectedTemplate(randomTemplate.prompt)
    setMode('icon')

    setTimeout(() => {
      toast.info(`Running Tech Demo - Generating IT industry icon: ${randomTemplate.name}`)
      generateIcon()
    }, 500)
  }

  const runMedicalIconDemo = async () => {
    const medicalTemplates = industryTemplates.medical
    const randomTemplate = medicalTemplates[Math.floor(Math.random() * medicalTemplates.length)]

    setSelectedIndustry('medical')
    setSelectedStyle('realistic')
    setCustomPrompt(randomTemplate.prompt)
    setSelectedTemplate(randomTemplate.prompt)
    setMode('icon')

    setTimeout(() => {
      toast.info(`Running Medical Demo - Generating healthcare icon: ${randomTemplate.name}`)
      generateIcon()
    }, 500)
  }

  const getCurrentTemplates = () => {
    if (mode === 'logo') {
      return logoTemplates[selectedStyle as keyof typeof logoTemplates] || []
    }

    if (selectedIndustry === 'general') {
      return promptTemplates[selectedStyle as keyof typeof promptTemplates] || []
    }
    return industryTemplates[selectedIndustry as keyof typeof industryTemplates] || []
  }

  const getCurrentStyleOptions = () => {
    return mode === 'logo' ? logoStyleOptions : styleOptions
  }

  const generateIcon = async () => {
    if (!customPrompt.trim() && !companyName.trim()) {
      toast.error('Please enter a prompt or company name')
      return
    }

    setIsGenerating(true)
    try {
      const endpoint = mode === 'logo' ? '/api/generate-logo' : '/api/generate-3d-icon'

      // Build comprehensive prompt from guided fields
      const builtPrompt = buildComprehensivePrompt()

      const requestBody = mode === 'logo'
        ? {
          prompt: builtPrompt,
          negativePrompt: negativePrompt.trim(),
          style: selectedStyles.join(', '), // Support composable styles
          industry: selectedIndustry,
          companyName: companyName.trim(),
          tagline: tagline.trim(),
          keywords: keywords.trim(),
          preferredColors: preferredColors.trim(),
          batchSize: batchSize,
          model: selectedModel
        }
        : {
          prompt: builtPrompt,
          negativePrompt: negativePrompt.trim(),
          style: selectedStyles.join(', '),
          batchSize: batchSize,
          model: selectedModel
        }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Failed to generate ${mode}`)
      }

      const data = await response.json()
      console.log('API Response:', data)

      // Handle batch generation
      if (data.variations && Array.isArray(data.variations)) {
        console.log('Setting variations:', data.variations)
        setGeneratedVariations(data.variations)
        setSelectedVariation(data.variations[0])
        setGeneratedIcon(data.variations[0])

        // Show success message with actual count
        const actualCount = data.actualCount || data.variations.length
        const requestedCount = data.requestedCount || batchSize
        const countMessage = actualCount === requestedCount
          ? `${actualCount} ${mode === 'logo' ? 'logo' : 'icon'} variations`
          : `${actualCount} out of ${requestedCount} ${mode === 'logo' ? 'logo' : 'icon'} variations`

        toast.success(`${countMessage} generated successfully!`)

        // Show warning if some variations failed
        if (actualCount < requestedCount) {
          toast.warning(`Some variations failed to generate. Try again or use a smaller batch size.`)
        }

        // Add to history
        setHistory(prev => [{
          prompt: mode === 'logo' && companyName
            ? `${companyName}${tagline ? ` - ${tagline}` : ''}: ${builtPrompt}`
            : builtPrompt,
          url: data.variations[0],
          timestamp: new Date(),
          type: mode
        }, ...prev.slice(0, 11)]) // Keep last 12 items
      } else {
        setGeneratedVariations([data.imageUrl])
        setSelectedVariation(data.imageUrl)
        setGeneratedIcon(data.imageUrl)
        toast.success(`${mode === 'logo' ? 'Logo' : 'Icon'} generated successfully!`)

        // Add to history
        setHistory(prev => [{
          prompt: mode === 'logo' && companyName
            ? `${companyName}${tagline ? ` - ${tagline}` : ''}: ${builtPrompt}`
            : builtPrompt,
          url: data.imageUrl,
          timestamp: new Date(),
          type: mode
        }, ...prev.slice(0, 11)]) // Keep last 12 items
      }
    } catch (error) {
      console.error(`Error generating ${mode}:`, error)
      toast.error(`Failed to generate ${mode}. Please try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Enhanced Features Functions

  const handleStreamingGeneration = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt for streaming generation')
      return
    }

    setIsStreaming(true)
    setStreamingText('')

    try {
      const streamGenerator = streamChatWithFaairgoAI(
        `Generate creative suggestions for: ${customPrompt}`,
        selectedModel,
        { stream: true }
      )

      for await (const chunk of streamGenerator) {
        setStreamingText(prev => prev + chunk)
      }

      toast.success('Streaming generation completed!')
    } catch (error) {
      console.error('Streaming error:', error)
      toast.error('Streaming generation failed')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string
        setUploadedImage(imageUrl)

        // Analyze the image
        const analysis = await analyzeImageAdvanced(imageUrl, selectedModel)
        if (analysis) {
          setImageAnalysis(analysis)
          toast.success('Image analyzed successfully!')
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image')
    }
  }

  const generateWithQualityControl = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    try {
      const generatedImage = await generateImageWithQuality(customPrompt, {
        model: selectedModel.includes('dall-e') ? 'dall-e-3' : 'gpt-image-1',
        quality: selectedQuality,
        size: '512x512',
        style: selectedStyles.join(', ')
      })

      if (generatedImage?.src) {
        setGeneratedVariations(prev => [...prev, generatedImage.src])
        toast.success('High-quality image generated!')
      }
    } catch (error) {
      console.error('Quality generation error:', error)
      toast.error('Failed to generate with quality controls')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTextToSpeech = async (text: string) => {
    if (!text.trim()) {
      toast.error('No text to convert to speech')
      return
    }

    try {
      const audio = await textToSpeechWithFaairgoAI(text)
      if (audio) {
        audio.play()
        toast.success('Playing generated audio!')
      }
    } catch (error) {
      console.error('Text-to-speech error:', error)
      toast.error('Failed to generate speech')
    }
  }

  const buildComprehensivePrompt = () => {
    let prompt = customPrompt.trim()

    if (mode === 'logo' && companyName.trim()) {
      prompt = `Create a professional logo for "${companyName.trim()}"${tagline ? ` with tagline "${tagline.trim()}"` : ''}. ${prompt}`
    }

    if (keywords.trim()) {
      prompt += `. Keywords: ${keywords.trim()}`
    }

    if (preferredColors.trim()) {
      prompt += `. Colors: ${preferredColors.trim()}`
    }

    if (thingsToAvoid.trim()) {
      setNegativePrompt(prev => prev ? `${prev}, ${thingsToAvoid.trim()}` : thingsToAvoid.trim())
    }

    return prompt
  }

  const upscaleImage = async () => {
    if (!selectedVariation) {
      toast.error('Please select an image to upscale')
      return
    }

    setIsUpscaling(true)
    try {
      const response = await fetch('/api/upscale-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: selectedVariation,
          scale: 2 // 2x upscaling
        })
      })

      if (!response.ok) {
        throw new Error('Failed to upscale image')
      }

      const data = await response.json()
      setUpscaledImage(data.upscaledImageUrl)
      toast.success('Image upscaled successfully!')
    } catch (error) {
      console.error('Error upscaling image:', error)
      toast.error('Failed to upscale image')
    } finally {
      setIsUpscaling(false)
    }
  }

  const remixImage = async () => {
    if (!selectedVariation) {
      toast.error('Please select an image to remix')
      return
    }

    setIsRemixing(true)
    try {
      console.log('Starting remix with image:', selectedVariation)
      const response = await fetch('/api/remix-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: selectedVariation,
          prompt: customPrompt.trim() || 'Create variations of this design',
          negativePrompt: negativePrompt.trim(),
          strength: 0.3 // Low denoising for subtle variations
        })
      })

      console.log('Remix response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Remix error response:', errorData)

        // Handle specific 502/503 errors with better messaging
        if (response.status === 503 || errorData.isRetryable) {
          toast.error('The AI service is temporarily unavailable. Please try again in a few moments.')
          return
        }

        throw new Error(errorData.error || `Failed to remix image: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Remix response data:', data)

      if (!data.variations || !Array.isArray(data.variations) || data.variations.length === 0) {
        throw new Error('No variations returned from API')
      }

      console.log('Setting remix variations:', data.variations)
      setGeneratedVariations(data.variations)
      setSelectedVariation(data.variations[0])
      toast.success('Image remixed successfully!')
    } catch (error) {
      console.error('Error remixing image:', error)

      // Handle network errors gracefully
      if (error instanceof Error) {
        if (error.message.includes('502') || error.message.includes('Bad Gateway') || error.message.includes('fetch')) {
          toast.error('Network error occurred. Please check your connection and try again.')
        } else {
          toast.error(`Failed to remix image: ${error.message}`)
        }
      } else {
        toast.error('Failed to remix image: Unknown error')
      }
    } finally {
      setIsRemixing(false)
    }
  }

  const vectorizeImage = async () => {
    if (!selectedVariation) {
      toast.error('Please select an image to vectorize')
      return
    }

    try {
      const response = await fetch('/api/vectorize-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: selectedVariation
        })
      })

      if (!response.ok) {
        throw new Error('Failed to vectorize image')
      }

      const data = await response.json()

      // Download SVG
      const blob = new Blob([data.svgContent], { type: 'image/svg+xml' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vector-${Date.now()}.svg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Image vectorized and downloaded successfully!')
    } catch (error) {
      console.error('Error vectorizing image:', error)
      toast.error('Failed to vectorize image')
    }
  }

  const generateUI = async () => {
    // Validate inputs based on generation type
    if (uiGenerationType === 'textToUI' && !uiPrompt.trim()) {
      toast.error('Please provide a description for text-to-UI generation')
      return
    }

    if ((uiGenerationType === 'wireframeToUI' || uiGenerationType === 'screenshotToUI') && !uploadedImage && !urlInput.trim()) {
      toast.error('Please upload an image or enter a URL for image-to-UI generation')
      return
    }

    setIsGenerating(true)
    try {
      const requestBody: any = {
        type: uiGenerationType,
        platform: selectedPlatform,
        style: selectedUIStyle,
      }

      if (uiGenerationType === 'textToUI') {
        requestBody.prompt = uiPrompt.trim()
      } else if (uiGenerationType === 'wireframeToUI' || uiGenerationType === 'screenshotToUI') {
        if (uploadedImage) {
          requestBody.imageData = uploadedImage
        }
        if (urlInput.trim()) {
          requestBody.url = urlInput.trim()
        }
      }

      const response = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.details || errorData.error || 'Failed to generate UI'
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setGeneratedUI(data.data?.image || data.imageUrl)
      setUiCode(data.data?.code || data.code || null)

      // Show success message when using demo mode
      if (data.isDemoMode) {
        toast.info('Demo mode: Using placeholder content. Sign in to FaairgoAI for full AI functionality powered by GPT and image generation.')
      }

      // Add to history
      const promptText = uiGenerationType === 'textToUI'
        ? uiPrompt.trim()
        : uiGenerationType === 'wireframeToUI'
          ? `Wireframe to UI: ${uploadedImage ? 'Uploaded image' : urlInput}`
          : `Camera to UI: ${uploadedImage ? 'Uploaded image' : urlInput}`

      setHistory(prev => [{
        prompt: promptText,
        url: data.imageUrl,
        timestamp: new Date(),
        type: 'ui'
      }, ...prev])

      toast.success('UI design generated successfully!')
    } catch (error) {
      console.error('Error generating UI:', error)
      toast.error('Failed to generate UI design')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadUI = async () => {
    if (!generatedUI) return

    try {
      const response = await fetch(generatedUI)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ui-design-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('UI design downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download UI design')
    }
  }

  const downloadUICode = () => {
    if (!uiCode) return

    const blob = new Blob([uiCode], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ui-code-${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('UI code downloaded successfully!')
  }

  const downloadUIAsZip = async () => {
    if (!uiPrompt.trim() && !uploadedImage && !urlInput.trim()) {
      toast.error('Please provide a description, upload an image, or enter a URL')
      return
    }

    setIsDownloadingZip(true)
    try {
      toast.info('Starting UI package generation... This may take a moment.')

      const requestBody: any = {
        type: uiGenerationType,
        platform: selectedPlatform,
        style: selectedUIStyle,
      }

      if (uiGenerationType === 'textToUI') {
        requestBody.prompt = uiPrompt.trim()
      } else if (uiGenerationType === 'wireframeToUI' || uiGenerationType === 'screenshotToUI') {
        if (uploadedImage) {
          requestBody.imageData = uploadedImage
        }
        if (urlInput.trim()) {
          requestBody.url = urlInput.trim()
        }
      }

      const response = await fetch('/api/download-ui-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate UI ZIP package')
      }

      // Get the filename from the response headers or create a default one
      const contentDisposition = response.headers.get('content-disposition')
      let filename = `ui-design-${selectedPlatform}-${selectedUIStyle}-${Date.now()}.zip`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`UI design package downloaded successfully! Contains 3 variations with HTML, CSS, and images.`)
    } catch (error) {
      console.error('Error downloading UI ZIP:', error)

      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('502') || error.message.includes('Bad Gateway')) {
          toast.error('The AI service is temporarily unavailable. Please try again in a few moments.')
        } else if (error.message.includes('timeout')) {
          toast.error('Generation timed out. Please try with a simpler prompt.')
        } else {
          toast.error(`Failed to download UI package: ${error.message}`)
        }
      } else {
        toast.error('Failed to download UI package: Unknown error')
      }
    } finally {
      setIsDownloadingZip(false)
    }
  }

  const downloadIcon = async () => {
    const imageToDownload = upscaledImage || selectedVariation || generatedIcon
    if (!imageToDownload) return

    try {
      const response = await fetch(imageToDownload)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${mode === 'logo' ? 'logo' : 'icon'}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`${mode === 'logo' ? 'Logo' : 'Icon'} downloaded successfully!`)
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  // Prompt Architect Functions
  const analyzePromptClarity = (prompt: string) => {
    const words = prompt.trim().split(/\s+/).length
    const hasSpecificTerms = /\b(create|generate|design|make|build|photorealistic|style|color|detailed|professional)\b/i.test(prompt)
    const hasGoalContext = /\b(for|to|in|with|using|like|similar)\b/i.test(prompt)

    return {
      isDetailed: words > 10,
      hasSpecificTerms,
      hasGoalContext,
      needsInterrogation: words < 8 || !hasSpecificTerms || !hasGoalContext
    }
  }

  const generateInterrogationQuestions = (prompt: string, outputType: string) => {
    const baseQuestions = [
      {
        id: 'goal',
        category: 'Primary Goal & Format',
        question: `What is the ultimate output you want to create? (e.g., a photorealistic image, a scene for a story, code for an app, educational material)`
      },
      {
        id: 'subject',
        category: 'Subject & Content',
        question: 'What is the main focus or subject of your request? Describe the key elements that should be featured.'
      },
      {
        id: 'style',
        category: 'Style & Tone',
        question: outputType === 'image'
          ? 'What artistic style are you aiming for? (e.g., hyper-realistic, anime, watercolor, minimalist, vintage)'
          : 'What tone or style should this have? (e.g., formal, casual, humorous, dramatic, technical)'
      },
      {
        id: 'context',
        category: 'Setting & Context',
        question: 'Can you describe the setting, atmosphere, or context? What mood or environment should be conveyed?'
      },
      {
        id: 'details',
        category: 'Specific Details',
        question: 'Are there any specific details, colors, elements, or requirements that must be included or avoided?'
      }
    ]

    return baseQuestions.map(q => ({ ...q, answer: '' }))
  }

  const processArchitectPrompt = () => {
    if (!architectPrompt.trim()) {
      toast.error('Please enter a prompt to analyze')
      return
    }

    const analysis = analyzePromptClarity(architectPrompt)

    if (analysis.needsInterrogation) {
      // Activate interrogation mode
      setArchitectMode('interrogation')
      const questions = generateInterrogationQuestions(architectPrompt, architectOutputType)
      setArchitectQuestions(questions)
      setCurrentQuestionIndex(0)
      toast.info('Prompt needs clarification. Entering Interrogation Mode to help you craft the perfect prompt.')
    } else {
      // Direct synthesis
      setArchitectMode('synthesis')
      synthesizePrompt()
    }
  }

  const handleQuestionAnswer = (questionId: string, answer: string) => {
    setArchitectQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, answer } : q)
    )
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < architectQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // All questions answered, proceed to synthesis
      setArchitectMode('synthesis')
      synthesizePrompt()
    }
  }

  const synthesizePrompt = () => {
    let synthesizedPrompt = architectPrompt.trim()

    if (architectMode === 'interrogation') {
      // Build comprehensive prompt from interrogation answers
      const answeredQuestions = architectQuestions.filter(q => q.answer.trim())

      synthesizedPrompt = `## Comprehensive ${architectOutputType.charAt(0).toUpperCase() + architectOutputType.slice(1)} Generation Prompt

### Original Concept
${architectPrompt}

### Detailed Specifications
${answeredQuestions.map(q => `**${q.category}:** ${q.answer}`).join('\n')}

### Technical Parameters
${architectOutputType === 'image' ? `
- **Style**: Highly detailed, professional quality
- **Composition**: Well-balanced, visually appealing
- **Lighting**: Professional, appropriate to subject matter
- **Resolution**: High resolution, sharp focus
- **Negative Prompts**: blurry, low quality, distorted, amateur
` : `
- **Format**: Clean, well-structured output
- **Quality**: Professional, polished result
- **Requirements**: Meet all specified criteria
`}

### Generation Instructions
Create a ${architectOutputType} that incorporates all the above specifications. Ensure the result is professional, detailed, and exactly matches the described requirements.`
    } else {
      // Direct synthesis - enhance the existing prompt
      synthesizedPrompt = `## Enhanced ${architectOutputType.charAt(0).toUpperCase() + architectOutputType.slice(1)} Generation Prompt

${synthesizedPrompt}

### Technical Enhancement
- High quality, professional result
- Detailed and well-crafted
- Meets modern standards
- ${architectOutputType === 'image' ? 'Photorealistic rendering with proper lighting and composition' : 'Clear, well-structured output'}

### Negative Constraints
Avoid: low quality, amateur, rushed, unclear, generic`
    }

    setFinalArchitectPrompt(synthesizedPrompt)
    toast.success('Comprehensive prompt synthesized successfully!')
  }

  const resetArchitect = () => {
    setArchitectPrompt('')
    setArchitectMode('input')
    setArchitectQuestions([])
    setCurrentQuestionIndex(0)
    setFinalArchitectPrompt('')
  }

  const copyPromptToClipboard = () => {
    if (finalArchitectPrompt) {
      navigator.clipboard.writeText(finalArchitectPrompt)
      toast.success('Prompt copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Box className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                FairForge
              </h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                Powered by FaairgoAI
              </Badge>
            </div>

            {/* FaairgoAI Integration Status */}
            <div className="flex items-center gap-2">
              {faairgoAIInitialized ? (
                <div className="flex items-center gap-2">
                  {faairgoAIAuthStatus ? (
                    <>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Cloud className="h-3 w-3 mr-1" />
                        FaairgoAI Connected
                      </Badge>
                      <Button variant="outline" size="sm" onClick={handleFaairgoAISignOut}>
                        <LogOut className="h-4 w-4 mr-1" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleFaairgoAISignIn}>
                      <Cloud className="h-4 w-4 mr-1" />
                      Connect FaairgoAI
                    </Button>
                  )}
                </div>
              ) : (
                <Badge variant="secondary">
                  <CloudOff className="h-3 w-3 mr-1" />
                  FaairgoAI Unavailable
                </Badge>
              )}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="flex justify-center mb-6">
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'icon' | 'logo' | 'ui' | 'architect')}>
              <TabsList>
                <TabsTrigger value="icon" className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  3D Icons
                </TabsTrigger>
                <TabsTrigger value="logo" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Logos
                </TabsTrigger>
                <TabsTrigger value="ui" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  UI/UX Design
                </TabsTrigger>
                <TabsTrigger value="architect" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Prompt Architect
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto">
            {mode === 'logo'
              ? 'Forge professional logos with AI precision. Perfect for businesses, brands, and personal projects.'
              : mode === 'ui'
                ? 'Craft complete UI/UX designs from text, sketches, or screenshots. AI-powered rapid prototyping at your fingertips.'
                : mode === 'architect'
                  ? 'Transform simple ideas into comprehensive, detailed prompts. AI-powered prompt engineering for better results.'
                  : 'Forge stunning 3D icons with AI-powered creativity. Choose from templates or create your own custom designs.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Templates and Input */}
          <div className="lg:col-span-1 space-y-6">
            {/* Guided Prompt Builder */}
            {mode === 'logo' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Guided Prompt Builder
                  </CardTitle>
                  <CardDescription>Build your logo step by step with professional guidance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="Enter your company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        placeholder="Enter your tagline"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      placeholder="e.g., technology, innovation, modern, clean (comma separated)"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredColors">Preferred Colors</Label>
                    <Input
                      id="preferredColors"
                      placeholder="e.g., blue and white, warm colors, pastel palette"
                      value={preferredColors}
                      onChange={(e) => setPreferredColors(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="thingsToAvoid">Things to Avoid</Label>
                    <Input
                      id="thingsToAvoid"
                      placeholder="e.g., text, complex details, dark colors"
                      value={thingsToAvoid}
                      onChange={(e) => setThingsToAvoid(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* UI Generation Controls */}
            {mode === 'ui' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    UI Generation Type
                  </CardTitle>
                  <CardDescription>Choose how you want to generate your UI design</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="uiGenerationType">Generation Method</Label>
                    <Select value={uiGenerationType} onValueChange={(value: any) => setUiGenerationType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="textToUI">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Text to UI
                          </div>
                        </SelectItem>
                        <SelectItem value="wireframeToUI">
                          <div className="flex items-center gap-2">
                            <Edit3 className="h-4 w-4" />
                            Wireframe to UI
                          </div>
                        </SelectItem>
                        <SelectItem value="screenshotToUI">
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            Camera to UI
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="platform">Target Platform</Label>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uiPlatformOptions.map((option) => {
                          const IconComponent = option.icon
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="uiStyle">UI Style</Label>
                    <Select value={selectedUIStyle} onValueChange={setSelectedUIStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uiStyleOptions.map((option) => {
                          const IconComponent = option.icon
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Style and Industry Selection */}
            {mode !== 'ui' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Style & Industry
                  </CardTitle>
                  <CardDescription>Choose the visual style and industry for your 3D icon</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="industry">Industry Category</Label>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="style">{mode === 'logo' ? 'Logo Style' : 'Icon Style'}</Label>
                    <div className="space-y-2">
                      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary style" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCurrentStyleOptions().map((option) => {
                            const IconComponent = option.icon
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>

                      <div className="text-sm text-gray-600">
                        <Label>Additional Styles (Optional)</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {getCurrentStyleOptions().filter(option => option.value !== selectedStyle).map((option) => {
                            const IconComponent = option.icon
                            const isSelected = selectedStyles.includes(option.value)
                            return (
                              <Button
                                key={option.value}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedStyles(prev => prev.filter(s => s !== option.value))
                                  } else {
                                    setSelectedStyles(prev => [...prev, option.value])
                                  }
                                }}
                              >
                                <IconComponent className="h-3 w-3 mr-1" />
                                {option.label}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Select value={batchSize.toString()} onValueChange={(value) => setBatchSize(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Variation</SelectItem>
                        <SelectItem value="2">2 Variations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Template Selection */}
            {mode !== 'ui' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Prompt Templates
                  </CardTitle>
                  <CardDescription>
                    {mode === 'logo'
                      ? 'Quick start with pre-designed logo templates'
                      : selectedIndustry === 'general'
                        ? 'Quick start with pre-designed templates'
                        : `Industry-specific templates for ${industryOptions.find(opt => opt.value === selectedIndustry)?.label}`
                    }
                  </CardDescription>
                  {/* Quick Demo Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {mode === 'icon' && (
                      <>
                        <Button
                          onClick={runIconDemo}
                          disabled={isGenerating}
                          size="sm"
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          {isGenerating ? 'Generating...' : 'Quick Icon Demo'}
                        </Button>
                        <Button
                          onClick={run3DIconDemo}
                          disabled={isGenerating}
                          size="sm"
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          <Box className="h-4 w-4" />
                          {isGenerating ? 'Generating...' : '3D Icon Demo'}
                        </Button>
                        <Button
                          onClick={runRandomIconDemo}
                          disabled={isGenerating}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          {isGenerating ? 'Generating...' : 'Random Icon'}
                        </Button>
                        <Button
                          onClick={runTechIconDemo}
                          disabled={isGenerating}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Cloud className="h-4 w-4" />
                          {isGenerating ? 'Generating...' : 'Tech Icon'}
                        </Button>
                        <Button
                          onClick={runMedicalIconDemo}
                          disabled={isGenerating}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <PenTool className="h-4 w-4" />
                          {isGenerating ? 'Generating...' : 'Medical Icon'}
                        </Button>
                      </>
                    )}
                    {mode === 'logo' && (
                      <>
                        <Button
                          onClick={runLogoDemo}
                          disabled={isGenerating}
                          size="sm"
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          <Lightning className="h-4 w-4" />
                          {isGenerating ? 'Generating...' : 'Quick Logo Demo'}
                        </Button>
                        <Button
                          onClick={runRandomLogoDemo}
                          disabled={isGenerating}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          {isGenerating ? 'Generating...' : 'Random Logo'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {mode === 'logo' ? (
                    <Tabs value={selectedStyle} onValueChange={setSelectedStyle}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="modern">Modern</TabsTrigger>
                        <TabsTrigger value="vintage">Vintage</TabsTrigger>
                        <TabsTrigger value="luxury">Luxury</TabsTrigger>
                        <TabsTrigger value="tech">Tech</TabsTrigger>
                      </TabsList>
                      <TabsContent value={selectedStyle} className="mt-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {getCurrentTemplates().map((template, index) => (
                            <Button
                              key={index}
                              variant={selectedTemplate === template.prompt ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-left h-auto p-3"
                              onClick={() => handleTemplateSelect(template)}
                            >
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs opacity-70 truncate">{template.prompt}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : selectedIndustry === 'general' ? (
                    <Tabs value={selectedStyle} onValueChange={setSelectedStyle}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="minimalist">Minimalist</TabsTrigger>
                        <TabsTrigger value="realistic">Realistic</TabsTrigger>
                        <TabsTrigger value="cartoon">Cartoon</TabsTrigger>
                        <TabsTrigger value="futuristic">Futuristic</TabsTrigger>
                      </TabsList>
                      <TabsContent value={selectedStyle} className="mt-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {getCurrentTemplates().map((template, index) => (
                            <Button
                              key={index}
                              variant={selectedTemplate === template.prompt ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-left h-auto p-3"
                              onClick={() => handleTemplateSelect(template)}
                            >
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs opacity-70 truncate">{template.prompt}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {getCurrentTemplates().map((template, index) => (
                        <Button
                          key={index}
                          variant={selectedTemplate === template.prompt ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs opacity-70 truncate">{template.prompt}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Custom Prompt */}
            {mode !== 'ui' && mode !== 'architect' && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Prompt</CardTitle>
                  <CardDescription>Describe your ideal {mode === 'logo' ? 'logo' : '3D icon'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder={`Describe the ${mode === 'logo' ? 'logo' : '3D icon'} you want to generate...`}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
                    <Textarea
                      id="negativePrompt"
                      placeholder="Describe what to avoid in the generation..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="model-select" className="text-sm font-medium text-gray-700 mb-2 block">
                      AI Model
                    </Label>
                    <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as 'gpt-4' | 'gpt-5-nano' | 'claude' | 'claude-sonnet-4' | 'gemini' | 'gemini-2.5-flash' | 'grok' | 'mistral' | 'dall-e-3' | 'deepseek')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-5-nano">🚀 GPT-5 Nano (Default)</SelectItem>
                        <SelectItem value="gpt-4">🤖 GPT-4</SelectItem>
                        <SelectItem value="claude">🧠 Claude</SelectItem>
                        <SelectItem value="claude-sonnet-4">🎭 Claude Sonnet 4</SelectItem>
                        <SelectItem value="gemini">💎 Gemini</SelectItem>
                        <SelectItem value="gemini-2.5-flash">⚡ Gemini 2.5 Flash</SelectItem>
                        <SelectItem value="grok">🤯 Grok (xAI)</SelectItem>
                        <SelectItem value="mistral">🌟 Mistral</SelectItem>
                        <SelectItem value="dall-e-3">🎨 DALL-E 3</SelectItem>
                        <SelectItem value="deepseek">🔍 DeepSeek</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Enhanced Features */}
                  <div className="space-y-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <Lightning className="h-4 w-4" />
                      Enhanced AI Features
                    </h4>

                    {/* Quality Control */}
                    <div>
                      <Label htmlFor="quality-select" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Sliders className="h-4 w-4" />
                        Image Quality
                      </Label>
                      <Select value={selectedQuality} onValueChange={(value) => setSelectedQuality(value as 'low' | 'medium' | 'high' | 'hd')}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🔸 Low (Fast)</SelectItem>
                          <SelectItem value="medium">🔷 Medium (Balanced)</SelectItem>
                          <SelectItem value="high">💎 High (Quality)</SelectItem>
                          <SelectItem value="hd">🌟 HD (Premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Enhanced Generation Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={generateWithQualityControl}
                        disabled={isGenerating}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Sliders className="h-4 w-4" />
                        Quality Gen
                      </Button>

                      <Button
                        onClick={handleStreamingGeneration}
                        disabled={isStreaming}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {isStreaming ? 'Streaming...' : 'Stream Ideas'}
                      </Button>
                    </div>

                    {/* Audio Controls */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="audio-enabled"
                        checked={audioEnabled}
                        onChange={(e) => setAudioEnabled(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="audio-enabled" className="text-sm flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Enable Text-to-Speech
                      </Label>
                      {audioEnabled && (
                        <Button
                          onClick={() => handleTextToSpeech(customPrompt)}
                          size="sm"
                          variant="ghost"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Image Upload & Analysis */}
                  <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border">
                    <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Image Analysis & Upload
                    </h4>

                    <div>
                      <Label htmlFor="image-upload" className="text-sm font-medium text-gray-700 mb-2 block">
                        Upload Image for Analysis
                      </Label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>

                    {uploadedImage && (
                      <div className="space-y-2">
                        <img src={uploadedImage} alt="Uploaded" className="w-full h-32 object-cover rounded" />
                        {imageAnalysis && (
                          <div className="text-xs text-gray-600 bg-white p-2 rounded">
                            <p><strong>Description:</strong> {imageAnalysis.description}</p>
                            {imageAnalysis.colors.length > 0 && (
                              <p><strong>Colors:</strong> {imageAnalysis.colors.join(', ')}</p>
                            )}
                            {imageAnalysis.mood && <p><strong>Mood:</strong> {imageAnalysis.mood}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Streaming Text Display */}
                  {streamingText && (
                    <div className="space-y-2 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
                      <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        AI Streaming Response
                      </h4>
                      <div className="text-sm text-gray-700 bg-white p-3 rounded max-h-32 overflow-y-auto">
                        {streamingText}
                        {isStreaming && <span className="animate-pulse">|</span>}
                      </div>
                    </div>
                  )}

                  {/* Original Generate Button */}
                  <Button
                    onClick={generateIcon}
                    disabled={isGenerating || (!customPrompt.trim() && !companyName.trim())}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating {batchSize} Variations...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate {batchSize} {mode === 'logo' ? 'Logo' : 'Icon'} Variations
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Prompt Architect */}
            {mode === 'architect' && (
              <>
                {/* Prompt Architect Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      Prompt Architect
                    </CardTitle>
                    <CardDescription>
                      Transform simple ideas into comprehensive, detailed prompts using AI-powered prompt engineering
                    </CardDescription>
                    {/* Quick Demo Button */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        onClick={runArchitectDemo}
                        disabled={isGenerating}
                        size="sm"
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        <Wand2 className="h-4 w-4" />
                        {isGenerating ? 'Processing...' : 'Quick Architect Demo'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {architectMode === 'input' && (
                      <>
                        <div>
                          <Label htmlFor="architectOutputType">Output Type</Label>
                          <Select value={architectOutputType} onValueChange={(value: 'image' | 'story' | 'code' | 'other') => setArchitectOutputType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">Image Generation</SelectItem>
                              <SelectItem value="story">Story/Text</SelectItem>
                              <SelectItem value="code">Code/Technical</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="architectPrompt">Initial Prompt or Idea</Label>
                          <Textarea
                            id="architectPrompt"
                            placeholder="Enter your initial idea, concept, or rough prompt that you'd like to expand and improve..."
                            value={architectPrompt}
                            onChange={(e) => setArchitectPrompt(e.target.value)}
                            className="min-h-[120px]"
                          />
                        </div>

                        <Button
                          onClick={processArchitectPrompt}
                          disabled={!architectPrompt.trim()}
                          className="w-full"
                        >
                          <Wand2 className="mr-2 h-4 w-4" />
                          Analyze & Enhance Prompt
                        </Button>
                      </>
                    )}

                    {architectMode === 'interrogation' && (
                      <>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800 mb-2">Interrogation Mode Activated</h4>
                          <p className="text-sm text-yellow-700">
                            Your prompt needs clarification. Please answer the following questions to help craft the perfect detailed prompt.
                          </p>
                        </div>

                        {architectQuestions.length > 0 && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">Question {currentQuestionIndex + 1} of {architectQuestions.length}</h4>
                              <Badge variant="outline">{architectQuestions[currentQuestionIndex].category}</Badge>
                            </div>

                            <div className="space-y-3">
                              <p className="text-sm font-medium">{architectQuestions[currentQuestionIndex].question}</p>
                              <Textarea
                                placeholder="Your answer..."
                                value={architectQuestions[currentQuestionIndex].answer}
                                onChange={(e) => handleQuestionAnswer(architectQuestions[currentQuestionIndex].id, e.target.value)}
                                className="min-h-[80px]"
                              />

                              <div className="flex gap-2">
                                <Button
                                  onClick={nextQuestion}
                                  disabled={!architectQuestions[currentQuestionIndex].answer.trim()}
                                  className="flex-1"
                                >
                                  {currentQuestionIndex === architectQuestions.length - 1 ? (
                                    <>
                                      <Sparkles className="mr-2 h-4 w-4" />
                                      Synthesize Final Prompt
                                    </>
                                  ) : (
                                    <>
                                      Next Question
                                      <span className="ml-1">→</span>
                                    </>
                                  )}
                                </Button>

                                <Button
                                  onClick={resetArchitect}
                                  variant="outline"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {architectMode === 'synthesis' && finalArchitectPrompt && (
                      <>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 mb-2">✨ Prompt Synthesis Complete</h4>
                          <p className="text-sm text-green-700">
                            Your comprehensive, detailed prompt has been generated using AI prompt engineering principles.
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="finalPrompt">Enhanced Comprehensive Prompt</Label>
                          <Textarea
                            id="finalPrompt"
                            value={finalArchitectPrompt}
                            readOnly
                            className="min-h-[300px] font-mono text-sm"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={copyPromptToClipboard}
                            className="flex-1"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Copy to Clipboard
                          </Button>

                          <Button
                            onClick={resetArchitect}
                            variant="outline"
                            className="flex-1"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Start New Prompt
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Prompt Architect Guide */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      How Prompt Architect Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">🔍 Analysis Phase</h4>
                      <p className="text-sm text-gray-600">
                        Analyzes your initial prompt for clarity, detail, and completeness.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">❓ Interrogation Mode</h4>
                      <p className="text-sm text-gray-600">
                        If your prompt needs clarification, asks targeted questions to understand your vision.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">⚡ Direct Synthesis</h4>
                      <p className="text-sm text-gray-600">
                        For clear prompts, immediately enhances with technical specifications and best practices.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">📝 Final Output</h4>
                      <p className="text-sm text-gray-600">
                        Generates a comprehensive prompt in Markdown + JSON format for optimal AI results.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* UI Templates */}
            {mode === 'ui' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    UI Generation Templates
                  </CardTitle>
                  <CardDescription>Quick start with pre-designed UI templates</CardDescription>
                  {/* Quick Demo Button */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      onClick={runUIDemo}
                      disabled={isGenerating}
                      size="sm"
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      {isGenerating ? 'Generating...' : 'Quick UI Demo'}
                    </Button>
                    <Button
                      onClick={runRandomUIDemo}
                      disabled={isGenerating}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {isGenerating ? 'Generating...' : 'Random UI'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={uiGenerationType} onValueChange={(value: any) => setUiGenerationType(value)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="textToUI">Text to UI</TabsTrigger>
                      <TabsTrigger value="wireframeToUI">Wireframe</TabsTrigger>
                      <TabsTrigger value="screenshotToUI">Camera</TabsTrigger>
                    </TabsList>
                    <TabsContent value={uiGenerationType} className="mt-4">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {uiGenerationTemplates[uiGenerationType].map((template, index) => (
                          <Button
                            key={index}
                            variant={selectedTemplate === template.prompt ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-left h-auto p-3"
                            onClick={() => {
                              setSelectedTemplate(template.prompt)
                              setUiPrompt(template.prompt)
                            }}
                          >
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs opacity-70 truncate">{template.prompt}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* UI Input Section */}
            {mode === 'ui' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5" />
                    UI Design Input
                  </CardTitle>
                  <CardDescription>
                    {uiGenerationType === 'textToUI' && 'Describe the UI you want to create'}
                    {uiGenerationType === 'wireframeToUI' && 'Upload your wireframe or sketch'}
                    {uiGenerationType === 'screenshotToUI' && 'Upload a screenshot or enter a URL'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {uiGenerationType === 'textToUI' && (
                    <div>
                      <Label htmlFor="uiPrompt">UI Description</Label>
                      <Textarea
                        id="uiPrompt"
                        placeholder="Describe the UI design you want to create..."
                        value={uiPrompt}
                        onChange={(e) => setUiPrompt(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  )}

                  {(uiGenerationType === 'wireframeToUI' || uiGenerationType === 'screenshotToUI') && (
                    <>
                      <div>
                        <Label htmlFor="imageUpload">Upload Image</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = (e) => setUploadedImage(e.target?.result as string)
                                reader.readAsDataURL(file)
                              }
                            }}
                            className="hidden"
                          />
                          <label htmlFor="imageUpload" className="cursor-pointer">
                            {uploadedImage ? (
                              <img src={uploadedImage} alt="Uploaded" className="max-h-40 mx-auto" />
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">Click to upload an image</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {uiGenerationType === 'screenshotToUI' && (
                        <div>
                          <Label htmlFor="urlInput">Or enter URL</Label>
                          <Input
                            id="urlInput"
                            placeholder="https://example.com"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <Button
                    onClick={generateUI}
                    disabled={isGenerating ||
                      (uiGenerationType === 'textToUI' && !uiPrompt.trim()) ||
                      ((uiGenerationType === 'wireframeToUI' || uiGenerationType === 'screenshotToUI') && !uploadedImage && !urlInput.trim())
                    }
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating UI Design...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate UI Design
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={downloadUIAsZip}
                    disabled={isDownloadingZip || (!uiPrompt.trim() && !uploadedImage && !urlInput.trim())}
                    variant="outline"
                    className="w-full"
                    title="Generate 3 UI variations with HTML, CSS, and images in a ZIP package"
                  >
                    {isDownloadingZip ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating ZIP Package...
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        Generate & Download ZIP Package
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* UI Input Section */}
            {mode === 'ui' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5" />
                    UI Design Input
                  </CardTitle>
                  <CardDescription>
                    {uiGenerationType === 'textToUI' && 'Describe the UI you want to create'}
                    {uiGenerationType === 'wireframeToUI' && 'Upload your wireframe or sketch'}
                    {uiGenerationType === 'screenshotToUI' && 'Upload a screenshot or enter a URL'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uiGenerationType === 'textToUI' ? (
                    <Tabs value={selectedStyle} onValueChange={setSelectedStyle}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="modern">Modern</TabsTrigger>
                        <TabsTrigger value="vintage">Vintage</TabsTrigger>
                        <TabsTrigger value="luxury">Luxury</TabsTrigger>
                        <TabsTrigger value="tech">Tech</TabsTrigger>
                      </TabsList>
                      <TabsContent value={selectedStyle} className="mt-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {getCurrentTemplates().map((template, index) => (
                            <Button
                              key={index}
                              variant={selectedTemplate === template.prompt ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-left h-auto p-3"
                              onClick={() => handleTemplateSelect(template)}
                            >
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs opacity-70 truncate">{template.prompt}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : selectedIndustry === 'general' ? (
                    <Tabs value={selectedStyle} onValueChange={setSelectedStyle}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="minimalist">Minimalist</TabsTrigger>
                        <TabsTrigger value="realistic">Realistic</TabsTrigger>
                        <TabsTrigger value="cartoon">Cartoon</TabsTrigger>
                        <TabsTrigger value="futuristic">Futuristic</TabsTrigger>
                      </TabsList>
                      <TabsContent value={selectedStyle} className="mt-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {getCurrentTemplates().map((template, index) => (
                            <Button
                              key={index}
                              variant={selectedTemplate === template.prompt ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-left h-auto p-3"
                              onClick={() => handleTemplateSelect(template)}
                            >
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs opacity-70 truncate">{template.prompt}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {getCurrentTemplates().map((template, index) => (
                        <Button
                          key={index}
                          variant={selectedTemplate === template.prompt ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs opacity-70 truncate">{template.prompt}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - History and FaairgoAI Files */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="current" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="faairgoai" disabled={!faairgoAIAuthStatus}>
                  FaairgoAI Files
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>
                      {mode === 'ui'
                        ? 'Generated UI Design'
                        : mode === 'architect'
                          ? 'Prompt Engineering Studio'
                          : `Generated ${mode === 'logo' ? 'Logos' : 'Icons'}`
                      }
                    </CardTitle>
                    <CardDescription>
                      {mode === 'ui'
                        ? 'Your AI-generated UI design and code'
                        : mode === 'architect'
                          ? 'AI-powered prompt analysis and enhancement'
                          : `Your AI-generated ${mode === 'logo' ? 'logo' : 'icon'} variations`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center min-h-[400px]">
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                        <p className="text-sm text-gray-600">
                          {mode === 'ui' ? 'Generating UI design...' : `Generating ${batchSize} variations...`}
                        </p>
                      </div>
                    ) : mode === 'ui' ? (
                      generatedUI ? (
                        <div className="space-y-4 w-full">
                          <div className="relative">
                            <img
                              src={generatedUI}
                              alt="Generated UI"
                              className="w-full rounded-lg shadow-lg"
                            />
                          </div>

                          {/* UI Code Display */}
                          {uiCode && (
                            <div className="space-y-2">
                              <Label>Generated Code</Label>
                              <div className="bg-gray-100 p-3 rounded-lg max-h-40 overflow-y-auto">
                                <pre className="text-xs text-gray-700">{uiCode}</pre>
                              </div>
                            </div>
                          )}

                          {/* UI Actions */}
                          <div className="flex gap-2">
                            <Button onClick={downloadUI} size="sm" className="flex-1">
                              <Download className="h-4 w-4 mr-1" />
                              Download Image
                            </Button>
                            {uiCode && (
                              <Button onClick={downloadUICode} size="sm" variant="outline" className="flex-1">
                                <Code className="h-4 w-4 mr-1" />
                                Download Code
                              </Button>
                            )}
                            <Button
                              onClick={downloadUIAsZip}
                              size="sm"
                              variant="secondary"
                              className="flex-1"
                              disabled={isDownloadingZip}
                              title="Generate 3 UI variations with HTML, CSS, and images in a ZIP package"
                            >
                              {isDownloadingZip ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Archive className="h-4 w-4 mr-1" />
                                  Download ZIP
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No UI design generated yet</p>
                          <p className="text-sm text-gray-500">Create a design using the controls on the left</p>
                        </div>
                      )
                    ) : generatedVariations.length > 0 ? (
                      <div className="space-y-4 w-full">
                        {/* Variations Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {generatedVariations.map((variation, index) => (
                            <div
                              key={index}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedVariation === variation
                                ? 'border-purple-500 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                              onClick={() => setSelectedVariation(variation)}
                            >
                              <img
                                src={variation}
                                alt={`Variation ${index + 1}`}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  console.error(`Variation ${index + 1} failed to load:`, variation)
                                  e.currentTarget.src = ''
                                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                                  e.currentTarget.alt = 'Failed to load'
                                }}
                                onLoad={() => {
                                  console.log(`Variation ${index + 1} loaded successfully`)
                                }}
                              />
                              {selectedVariation === variation && (
                                <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                #{index + 1}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Advanced Editing Tools - Only show if variation is selected */}
                        {selectedVariation && (
                          <div className="space-y-3">
                            {/* Selected Variation Info */}
                            <div className="text-center text-sm text-gray-600">
                              Selected: Variation #{generatedVariations.indexOf(selectedVariation) + 1}
                            </div>

                            {/* Advanced Editing Tools */}
                            <div className="grid grid-cols-2 gap-2">
                              <Button onClick={remixImage} disabled={isRemixing} variant="outline" size="sm">
                                {isRemixing ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Remix
                              </Button>
                              <Button onClick={upscaleImage} disabled={isUpscaling} variant="outline" size="sm">
                                {isUpscaling ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Expand className="mr-2 h-4 w-4" />
                                )}
                                Upscale
                              </Button>
                              <Button onClick={vectorizeImage} variant="outline" size="sm">
                                <Layers className="mr-2 h-4 w-4" />
                                Vectorize
                              </Button>
                              <Button onClick={downloadIcon} variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </div>

                            {faairgoAIAuthStatus && (
                              <Button onClick={saveToFaairgoAI} variant="outline" className="w-full">
                                <Cloud className="mr-2 h-4 w-4" />
                                Save to FaairgoAI
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : mode === 'architect' ? (
                      <div className="space-y-6 w-full">
                        {architectMode === 'input' && (
                          <div className="text-center text-gray-500">
                            <Wand2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Prompt Architect Ready</p>
                            <p className="text-sm">Enter your initial idea to begin AI-powered prompt enhancement</p>
                          </div>
                        )}

                        {architectMode === 'interrogation' && (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Wand2 className="h-6 w-6 text-yellow-600" />
                              </div>
                              <h3 className="font-medium mb-2">Interrogation Mode Active</h3>
                              <p className="text-sm text-gray-600">
                                Progress: {currentQuestionIndex + 1} of {architectQuestions.length} questions
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium mb-2">Analysis Results</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Original Prompt:</span>
                                  <Badge variant="outline">{architectPrompt.length} characters</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Output Type:</span>
                                  <Badge variant="secondary">{architectOutputType}</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Enhancement Mode:</span>
                                  <Badge variant="default">Interrogation</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {architectMode === 'synthesis' && finalArchitectPrompt && (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="h-6 w-6 text-green-600" />
                              </div>
                              <h3 className="font-medium mb-2">Prompt Enhancement Complete</h3>
                              <p className="text-sm text-gray-600">
                                Your comprehensive prompt is ready for use
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium mb-2">Enhancement Statistics</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Original Length:</span>
                                  <div className="font-medium">{architectPrompt.length} chars</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Enhanced Length:</span>
                                  <div className="font-medium">{finalArchitectPrompt.length} chars</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Enhancement Ratio:</span>
                                  <div className="font-medium">{Math.round(finalArchitectPrompt.length / architectPrompt.length * 10) / 10}x</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Output Type:</span>
                                  <Badge variant="secondary" className="text-xs">{architectOutputType}</Badge>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Quick Actions</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  onClick={copyPromptToClipboard}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                                <Button
                                  onClick={resetArchitect}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  New
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        {mode === 'logo' ? <PenTool className="h-16 w-16 mx-auto mb-4 opacity-50" /> : <Box className="h-16 w-16 mx-auto mb-4 opacity-50" />}
                        <p>No {mode === 'logo' ? 'logos' : 'icons'} generated yet</p>
                        <p className="text-sm">Select a template or enter a custom prompt to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Generation History</CardTitle>
                    <CardDescription>
                      Your recently generated {mode === 'ui' ? 'UI designs' : mode === 'architect' ? 'enhanced prompts' : mode === 'logo' ? 'logos' : '3D icons'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {history.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No history yet</p>
                      ) : (
                        history
                          .filter(item => {
                            if (mode === 'ui') return item.type === 'ui'
                            if (mode === 'architect') return item.type === 'architect'
                            return mode === 'logo' ? item.type === 'logo' : item.type === 'icon'
                          })
                          .map((item, index) => (
                            <div key={index} className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                if (item.type === 'ui') {
                                  setGeneratedUI(item.url)
                                } else {
                                  setGeneratedIcon(item.url)
                                }
                              }}>
                              <img
                                src={item.url}
                                alt="Generated item"
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.prompt}</p>
                                <p className="text-xs text-gray-500">
                                  {item.timestamp.toLocaleTimeString()} •
                                  {item.type === 'ui' ? ' UI Design' : item.type === 'logo' ? 'Logo' : 'Icon'}
                                </p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="faairgoai">
                <Card>
                  <CardHeader>
                    <CardTitle>FaairgoAI Storage</CardTitle>
                    <CardDescription>Your icons saved in FaairgoAI cloud storage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {faairgoAIFiles.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No files in FaairgoAI storage</p>
                      ) : (
                        faairgoAIFiles.map((file, index) => (
                          <div key={index} className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50">
                            <img
                              src={file.readUrl || ''}
                              alt={file.name || 'Unknown file'}
                              className="w-12 h-12 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '';
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name || 'Unknown file'}</p>
                              <p className="text-xs text-gray-500">
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Batch Generation</h3>
              <p className="text-sm text-gray-600">Generate multiple variations at once for more creative options</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Guided Prompt Builder</h3>
              <p className="text-sm text-gray-600">Structured prompt creation with professional guidance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Advanced Editing</h3>
              <p className="text-sm text-gray-600">Remix, upscale, and vectorize your creations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Professional Export</h3>
              <p className="text-sm text-gray-600">Multiple formats including vector SVG for scalability</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}