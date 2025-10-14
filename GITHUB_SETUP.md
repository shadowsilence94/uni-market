# GitHub Setup & Deployment Guide

## Step 1: Push Your Code to GitHub (5 minutes)

### 1.1 Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `uni-market`
   - **Description**: `Peer-to-peer marketplace for AIT community`
   - **Visibility**: Public (or Private if you prefer)
   - ❌ **DO NOT** check "Initialize with README" (we already have code)
4. Click **"Create repository"**

### 1.2 Initialize Git in Your Project

Open Terminal and run these commands:

```bash
# Navigate to your project
cd /Volumes/PS2000W/uni-market

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - Uni-Market application"

# Add your GitHub repository as remote
# Replace YOUR-USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR-USERNAME/uni-market.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.3 Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. ✅ Ready for deployment!

---

## Step 2: Deploy Backend to Render (5 minutes)

### 2.1 Sign Up & Connect GitHub

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (easiest option)
4. Authorize Render to access your repositories

### 2.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Find and select your `uni-market` repository
3. Click **"Connect"**

### 2.3 Configure Service

Fill in these settings:

```
Name: uni-market-backend
Region: Singapore (closest to Thailand)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: node index.js
Instance Type: Free
```

### 2.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these 3 variables:

```
PORT = 3001
JWT_SECRET = UniMarket2025SecretKey!ChangeThis
NODE_ENV = production
```

### 2.5 Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. **COPY YOUR URL** (e.g., `https://uni-market-backend.onrender.com`)
4. Test it: Visit `https://your-url.onrender.com/api/items` (should show items)

---

## Step 3: Update Frontend Configuration

### 3.1 Update API URL

Edit `client/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://uni-market-backend.onrender.com', // ← Paste your Render URL here
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
```

### 3.2 Commit and Push Changes

```bash
cd /Volumes/PS2000W/uni-market

git add client/vite.config.ts
git commit -m "Update API URL for production"
git push
```

---

## Step 4: Deploy Frontend to Vercel (3 minutes)

### 4.1 Sign Up & Import

1. Go to https://vercel.com
2. Click **"Start Deploying"** or **"Sign Up"**
3. Sign up with GitHub
4. Click **"Add New..."** → **"Project"**
5. Find and **"Import"** your `uni-market` repository

### 4.2 Configure Project

```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build (auto-detected)
Output Directory: dist (auto-detected)
Install Command: npm install (auto-detected)
```

### 4.3 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. **YOUR SITE IS LIVE!** 🎉
4. Copy your URL (e.g., `https://uni-market.vercel.app`)

---

## Step 5: Update CORS Settings

### 5.1 Add Vercel URL to Backend

Edit `server/index.js` (around line 14):

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://uni-market.vercel.app', // ← Add your Vercel URL here
  'https://uni-market-git-main-yourname.vercel.app', // ← Also add this variant
  process.env.FRONTEND_URL
].filter(Boolean);
```

### 5.2 Push Changes

```bash
git add server/index.js
git commit -m "Add Vercel URL to CORS whitelist"
git push
```

Render will automatically redeploy (takes 2-3 minutes).

---

## Step 6: Test Your Deployed Application

### 6.1 Visit Your Site

Open your Vercel URL: `https://uni-market.vercel.app`

### 6.2 Test Features

1. ✅ **Register** a new user
2. ✅ **Login** with admin:
   - Email: `st126010@ait.asia`
   - Password: `Htutkoko@17`
3. ✅ **List an item** (Sell page)
4. ✅ **Browse items**
5. ✅ **Request verification** (Profile page)
6. ✅ **Admin dashboard** (if admin)

---

## Complete Command Summary

```bash
# 1. Initialize and push to GitHub
cd /Volumes/PS2000W/uni-market
git init
git add .
git commit -m "Initial commit - Uni-Market application"
git remote add origin https://github.com/YOUR-USERNAME/uni-market.git
git branch -M main
git push -u origin main

# 2. After updating vite.config.ts with Render URL
git add client/vite.config.ts
git commit -m "Update API URL for production"
git push

# 3. After updating CORS in server/index.js
git add server/index.js
git commit -m "Add Vercel URL to CORS whitelist"
git push
```

---

## Troubleshooting

### "Permission denied" when pushing to GitHub

```bash
# Use HTTPS with token or SSH
# Option 1: HTTPS (will ask for username/password)
git remote set-url origin https://github.com/YOUR-USERNAME/uni-market.git

# Option 2: SSH (need to set up SSH key first)
git remote set-url origin git@github.com:YOUR-USERNAME/uni-market.git
```

### Backend not responding

1. Check Render logs: Dashboard → Your Service → Logs
2. Verify environment variables are set
3. Check if service is sleeping (free tier)

### Frontend can't connect to backend

1. Verify backend URL in `vite.config.ts`
2. Check CORS settings in `server/index.js`
3. Open browser console for error details

### Build failures

1. Check Node version (Render uses Node 18 by default)
2. Verify `package.json` has all dependencies
3. Review build logs in Render/Vercel dashboard

---

## Your URLs

After deployment, save these:

```
Frontend (Vercel): https://uni-market.vercel.app
Backend (Render):  https://uni-market-backend.onrender.com
GitHub Repo:       https://github.com/YOUR-USERNAME/uni-market
```

---

## Next Steps

1. ✅ Share your site with AIT community
2. ✅ Monitor usage in Render/Vercel dashboards
3. ✅ Set up custom domain (optional)
4. ✅ Consider upgrading for production use

**Congratulations! Your Uni-Market is now live! 🎉🚀**
