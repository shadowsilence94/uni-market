# Quick Deployment Guide - Uni-Market

## Option 1: Deploy to Render + Vercel (Recommended)

### Step 1: Deploy Backend to Render (5 minutes)

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Choose "Build and deploy from a Git repository"
4. Connect your GitHub account or paste Git URL
5. Configure:
   - **Name**: `uni-market-backend`
   - **Region**: Singapore (closest to Thailand)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
6. Add Environment Variables:
   - `PORT` = `3001`
   - `JWT_SECRET` = `your-random-secret-key-here`
   - `NODE_ENV` = `production`
7. Click "Create Web Service"
8. **COPY YOUR BACKEND URL** (e.g., `https://uni-market-backend.onrender.com`)

### Step 2: Update Frontend API URL

Edit `client/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://YOUR-RENDER-URL.onrender.com', // Paste your backend URL here
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
```

### Step 3: Deploy Frontend to Vercel (3 minutes)

1. Go to https://vercel.com and sign up
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"
6. Wait 2-3 minutes
7. **YOUR SITE IS LIVE!** 🎉

### Step 4: Update Backend CORS

Edit `server/index.js` line 14:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-vercel-app.vercel.app', // Add your Vercel URL here
  process.env.FRONTEND_URL
].filter(Boolean);
```

Push changes to trigger redeployment.

---

## Option 2: Deploy Both to Render (Simpler)

### Backend (Same as above)

### Frontend on Render

1. Click "New +" → "Static Site"
2. Connect repository
3. Configure:
   - **Name**: `uni-market-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com`
5. Deploy

---

## Option 3: Deploy to Railway (Alternative)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect and deploy both services
5. Add environment variables in dashboard

---

## Testing Your Deployment

1. Visit your frontend URL
2. Try to register a new user
3. Login with admin credentials:
   - Email: `st126010@ait.asia`
   - Password: `Htutkoko@17`
4. Test listing an item
5. Test verification request

---

## Common Issues & Fixes

### "Failed to fetch" errors
- Check backend is running (visit backend URL directly)
- Verify CORS settings include your frontend URL
- Check browser console for specific errors

### Images not uploading
- Render free tier has 512MB RAM limit
- Consider using Cloudinary for image hosting in production

### Backend sleeping (Render free tier)
- First request after 15 min takes 30-60 seconds
- Upgrade to paid plan ($7/month) for always-on service

### Build failures
- Check Node version (use Node 18+)
- Verify all dependencies in package.json
- Review build logs in dashboard

---

## Free Tier Limits

**Render Free:**
- 750 hours/month
- 512 MB RAM
- Sleeps after 15 min inactivity

**Vercel Free:**
- 100 GB bandwidth/month
- Unlimited deployments
- Always on

**Railway Free:**
- $5 credit/month
- ~500 hours runtime

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Share URL with AIT community
3. ✅ Monitor usage and errors
4. ✅ Consider upgrading for production use
5. ✅ Set up custom domain (optional)

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Check deployment logs for errors
- Review browser console for frontend issues

**Your Uni-Market is ready to serve the AIT community! 🎓🛒**
