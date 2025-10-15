# FairForge Deployment Guide

## Current Issue
The deployment to Cloudflare Pages failed because:
1. This is a full-stack Next.js app with API routes and custom server
2. Cloudflare Pages expects static content, not server-side code
3. The deployment tried to use Wrangler (for Workers) instead of Pages

## Solution Options

### Option 1: Cloudflare Workers (Recommended for Cloudflare)
```bash
# Install Cloudflare adapter
npm install @cloudflare/next-on-pages wrangler --save-dev

# Build for Cloudflare
npm run pages:build

# Deploy to Cloudflare Workers
npm run pages:deploy
```

### Option 2: Vercel (Recommended for Next.js)
1. Connect your GitHub repo to Vercel
2. Vercel automatically detects Next.js and handles the deployment
3. Environment variables: Add in Vercel dashboard

### Option 3: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Option 4: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

## Configuration Changes Made

### 1. Added Cloudflare Scripts to package.json
- `pages:build` - Builds for Cloudflare Workers
- `pages:deploy` - Deploys to Cloudflare
- `pages:dev` - Local development with Cloudflare runtime

### 2. Created wrangler.toml
- Cloudflare Workers configuration
- Environment variables setup
- Build commands

### 3. Updated next.config.ts
- Added `output: 'export'` for static generation
- Configured for Cloudflare compatibility

## Environment Variables Needed
```env
DATABASE_URL=your-database-url
Z_AI_API_KEY=your-z-ai-api-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=your-production-url
```

**Note:** Puter.js works client-side without API keys!

## Next Steps
1. **For Cloudflare:** Run `npm install` then `npm run pages:deploy`
2. **For Vercel:** Import project from GitHub at vercel.com
3. **For Railway:** Follow Option 3 above
4. **For Netlify:** Follow Option 4 above

## Performance Recommendations
- Use Vercel for easiest Next.js deployment
- Use Railway for full-stack apps with databases
- Use Cloudflare for global CDN and edge computing
- Consider Supabase for database hosting (works with all platforms)