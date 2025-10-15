# Deploy to Vercel (Recommended)

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

2. **Environment Variables:**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   DATABASE_URL=your-database-url
   PUTER_API_KEY=your-puter-api-key
   Z_AI_API_KEY=your-z-ai-api-key
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

3. **Deploy:**
   - Push to GitHub main branch
   - Vercel deploys automatically
   - No additional configuration needed

# Alternative: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   railway login
   railway link
   railway up
   ```

3. **Set Environment Variables:**
   ```bash
   railway variables set DATABASE_URL=your-database-url
   railway variables set PUTER_API_KEY=your-puter-api-key
   railway variables set Z_AI_API_KEY=your-z-ai-api-key
   ```