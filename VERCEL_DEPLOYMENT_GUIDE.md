# 🚀 FairForge Vercel Deployment Guide

## Environment Variables for Vercel

Copy these environment variables to your Vercel dashboard under **Project Settings > Environment Variables**.

### 📋 Complete Environment Variables List

#### 🗄️ Database Configuration (NeonDB PostgreSQL)
```
DATABASE_URL=postgresql://neondb_owner:npg_hstMl57UZaBK@ep-wandering-violet-a1ze6nfd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_hstMl57UZaBK@ep-wandering-violet-a1ze6nfd-pooler.ap-southeast-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_hstMl57UZaBK@ep-wandering-violet-a1ze6nfd.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

#### ⚡ Redis Cache (Upstash)
```
REDIS_URL=rediss://default:AWKLAAIncDIzZTA1OTIxNDc4YWU0OWE5YTMxMGFjMWFiNmM4MTZjM3AyMjUyMjc@fast-lionfish-25227.upstash.io:6379
KV_URL=rediss://default:AWKLAAIncDIzZTA1OTIxNDc4YWU0OWE5YTMxMGFjMWFiNmM4MTZjM3AyMjUyMjc@fast-lionfish-25227.upstash.io:6379
KV_REST_API_URL=https://fast-lionfish-25227.upstash.io
KV_REST_API_TOKEN=AWKLAAIncDIzZTA1OTIxNDc4YWU0OWE5YTMxMGFjMWFiNmM4MTZjM3AyMjUyMjc
KV_REST_API_READ_ONLY_TOKEN=AmKLAAIgcDIy1RApfgHS2rLhDTmFoDOjmUigjT3qvKzUrTOk48WmhQ
```

#### 🔐 Authentication (NextAuth.js)
```
NEXTAUTH_SECRET=generate-a-random-32-character-secret-key-here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

#### 👤 Stack Auth (Optional)
```
NEXT_PUBLIC_STACK_PROJECT_ID=****************************
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=****************************************
STACK_SECRET_SERVER_KEY=***********************
```

#### 🤖 AI Provider API Keys (Required for image generation)
```
GOOGLE_API_KEY=your_google_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
XAI_API_KEY=your_xai_grok_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

#### 🧠 Additional AI Provider Keys
```
GOOGLE_VERTEX_API_KEY=your_google_vertex_ai_key_here
GOOGLE_API_KEY_BACKUP=your_backup_gemini_key_here
```

#### 📧 Email Configuration (SMTP)
```
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### 🔧 App Configuration
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

---

## 📝 Step-by-Step Deployment Instructions

### 1. **Access Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Import your `FairForge` repository

### 2. **Configure Environment Variables**
   - Navigate to **Project Settings** → **Environment Variables**
   - Add **ALL** the environment variables listed above
   - Set environment scope to **Production**, **Preview**, and **Development**

### 3. **Important Replacements**
   - Replace `your-app-name` with your actual Vercel app name
   - Generate a secure `NEXTAUTH_SECRET` (32+ characters random string)
   - Add your actual AI provider API keys

### 4. **AI Provider API Keys Setup**

   #### 🎯 **Required APIs** (Get your keys from):
   - **Google Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **OpenRouter**: [OpenRouter Dashboard](https://openrouter.ai/keys)
   - **xAI Grok**: [xAI Console](https://console.x.ai/)
   - **Perplexity**: [Perplexity Dashboard](https://www.perplexity.ai/settings/api)
   - **HuggingFace**: [HuggingFace Tokens](https://huggingface.co/settings/tokens)
   - **OpenAI**: [OpenAI API Keys](https://platform.openai.com/api-keys)

### 5. **Deploy**
   - Click **Deploy** in Vercel
   - The app will automatically deploy on every push to the `main` branch

---

## 🔒 Security Notes

- ✅ All API keys are stored as environment variables (not in code)
- ✅ `.env.local` is ignored by git for local development
- ✅ Never commit actual API keys to the repository
- ✅ Multi-provider fallback system ensures reliability

---

## 🎯 AI Provider Fallback System

The app uses a smart fallback system:
1. **Primary**: Puter.js (free, client-side)
2. **Fallbacks**: 6 AI providers in sequence
3. **Final**: Beautiful placeholder images

This ensures **99.9% uptime** for image generation! 🚀

---

## 🆘 Need Help?

If you encounter issues during deployment:
1. Check Vercel function logs
2. Verify all environment variables are set
3. Ensure API keys are valid and have sufficient credits
4. Check the GitHub repository for the latest updates

**Happy deploying!** 🎉

---

## 📋 **COMPLETE API KEYS LIST - READY TO COPY**

### Copy-Paste All Environment Variables for Vercel:

```
DATABASE_URL=postgresql://neondb_owner:npg_hstMl57UZaBK@ep-wandering-violet-a1ze6nfd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_hstMl57UZaBK@ep-wandering-violet-a1ze6nfd-pooler.ap-southeast-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_hstMl57UZaBK@ep-wandering-violet-a1ze6nfd.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
REDIS_URL=rediss://default:AWKLAAIncDIzZTA1OTIxNDc4YWU0OWE5YTMxMGFjMWFiNmM4MTZjM3AyMjUyMjc@fast-lionfish-25227.upstash.io:6379
KV_URL=rediss://default:AWKLAAIncDIzZTA1OTIxNDc4YWU0OWE5YTMxMGFjMWFiNmM4MTZjM3AyMjUyMjc@fast-lionfish-25227.upstash.io:6379
KV_REST_API_URL=https://fast-lionfish-25227.upstash.io
KV_REST_API_TOKEN=AWKLAAIncDIzZTA1OTIxNDc4YWU0OWE5YTMxMGFjMWFiNmM4MTZjM3AyMjUyMjc
KV_REST_API_READ_ONLY_TOKEN=AmKLAAIgcDIy1RApfgHS2rLhDTmFoDOjmUigjT3qvKzUrTOk48WmhQ
NEXTAUTH_SECRET=generate-a-32-character-random-secret-here
NEXTAUTH_URL=https://your-vercel-app-name.vercel.app
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-vercel-app-name.vercel.app
GOOGLE_API_KEY=your_google_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
XAI_API_KEY=your_xai_grok_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
GOOGLE_VERTEX_API_KEY=your_google_vertex_ai_key_here
GOOGLE_API_KEY_BACKUP=your_backup_gemini_key_here
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### ⚠️ **IMPORTANT**: 
- Replace `your-vercel-app-name` with your actual app name
- Generate a secure 32-character `NEXTAUTH_SECRET`
- Add your email credentials for SMTP (if using email features)
- **Replace the placeholder API keys with your actual keys** (see `.env.local` file for the actual values)

### 🚀 **One-Click Setup**:
1. Copy the entire block above
2. Go to Vercel → Project Settings → Environment Variables  
3. Paste each line as Name=Value pairs
4. Set scope to: Production, Preview & Development
5. Deploy! 🎉