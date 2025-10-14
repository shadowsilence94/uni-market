# 🚀 START HERE - Complete Deployment Guide

## What You Have

✅ A fully functional marketplace application  
✅ Frontend (React + TypeScript)  
✅ Backend (Node.js + Express)  
✅ Admin dashboard  
✅ User authentication  
✅ All features working locally  

## What You Need to Do

Deploy your application to the internet so anyone can access it!

---

## 📋 Complete Deployment Checklist

### ☐ Step 1: Push to GitHub (5 minutes)

**Option A: Use the automated script**
```bash
cd /Volumes/PS2000W/uni-market
./setup-github.sh
```

**Option B: Manual setup**

1. Create repository on GitHub:
   - Go to https://github.com/new
   - Name: `uni-market`
   - Click "Create repository"

2. Run these commands:
```bash
cd /Volumes/PS2000W/uni-market
git init
git add .
git commit -m "Initial commit - Uni-Market application"
git remote add origin https://github.com/YOUR-USERNAME/uni-market.git
git branch -M main
git push -u origin main
```

**✅ Verify:** Visit your GitHub repo - you should see all files

---

### ☐ Step 2: Deploy Backend to Render (5 minutes)

1. **Sign up:** https://render.com (use GitHub login)

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Select your `uni-market` repository
   - Click "Connect"

3. **Configure:**
   ```
   Name: uni-market-backend
   Region: Singapore
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node index.js
   ```

4. **Add Environment Variables:**
   ```
   PORT = 3001
   JWT_SECRET = UniMarket2025SecretKey!ChangeThis
   NODE_ENV = production
   ```

5. **Deploy:** Click "Create Web Service"

6. **IMPORTANT:** Copy your backend URL!
   - Example: `https://uni-market-backend.onrender.com`

**✅ Verify:** Visit `https://your-url.onrender.com/api/items` - should show JSON data

---

### ☐ Step 3: Update Frontend Configuration (2 minutes)

1. **Edit** `client/vite.config.ts`:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     server: {
       proxy: {
         '/api': {
           target: 'https://uni-market-backend.onrender.com', // ← YOUR RENDER URL
           changeOrigin: true,
           secure: false
         }
       }
     }
   })
   ```

2. **Push changes:**
   ```bash
   git add client/vite.config.ts
   git commit -m "Update API URL for production"
   git push
   ```

---

### ☐ Step 4: Deploy Frontend to Vercel (3 minutes)

1. **Sign up:** https://vercel.com (use GitHub login)

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your `uni-market` repository
   - Click "Import"

3. **Configure:**
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   ```

4. **Deploy:** Click "Deploy"

5. **IMPORTANT:** Copy your frontend URL!
   - Example: `https://uni-market.vercel.app`

**✅ Verify:** Visit your Vercel URL - your site should load!

---

### ☐ Step 5: Fix CORS (2 minutes)

1. **Edit** `server/index.js` (line ~14):
   ```javascript
   const allowedOrigins = [
     'http://localhost:5173',
     'https://uni-market.vercel.app', // ← YOUR VERCEL URL
     'https://uni-market-git-main-yourname.vercel.app', // ← Also add this
     process.env.FRONTEND_URL
   ].filter(Boolean);
   ```

2. **Push changes:**
   ```bash
   git add server/index.js
   git commit -m "Add Vercel URL to CORS"
   git push
   ```

3. **Wait 2-3 minutes** for Render to auto-redeploy

**✅ Verify:** Try registering a user on your live site

---

### ☐ Step 6: Test Everything (5 minutes)

Visit your Vercel URL and test:

- [ ] Homepage loads
- [ ] Browse page shows items
- [ ] Register new user
- [ ] Login works
- [ ] List an item (Sell page)
- [ ] Edit profile
- [ ] Request verification
- [ ] Admin login: `st126010@ait.asia` / `Htutkoko@17`
- [ ] Admin dashboard works

---

## 🎉 You're Done!

Your application is now live and accessible to anyone!

### Your URLs:
```
Frontend: https://uni-market.vercel.app
Backend:  https://uni-market-backend.onrender.com
GitHub:   https://github.com/YOUR-USERNAME/uni-market
```

---

## 📚 Additional Resources

- **Detailed GitHub Guide:** `GITHUB_SETUP.md`
- **Deployment Details:** `QUICK_DEPLOY.md`
- **Full Documentation:** `DEPLOYMENT.md`
- **Project Info:** `README.md`

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render (Backend):**
- Sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free

**Vercel (Frontend):**
- 100 GB bandwidth/month
- Always on
- Unlimited deployments

### Common Issues

**"Failed to fetch" errors:**
- Wait 60 seconds (backend waking up)
- Check CORS settings
- Verify backend URL in vite.config.ts

**Images not uploading:**
- Works but slow on free tier
- Consider Cloudinary for production

**Build failures:**
- Check build logs in dashboard
- Verify all dependencies in package.json

---

## 🔄 Making Updates

After making changes to your code:

```bash
git add .
git commit -m "Description of changes"
git push
```

- Render auto-deploys backend (2-3 min)
- Vercel auto-deploys frontend (2-3 min)

---

## 🆘 Need Help?

1. Check the detailed guides in this folder
2. Review deployment logs in Render/Vercel dashboards
3. Check browser console for errors
4. Contact: st126010@ait.asia

---

## 🎯 Next Steps

1. ✅ Share your site with AIT community
2. ✅ Monitor usage in dashboards
3. ✅ Consider custom domain
4. ✅ Upgrade to paid plans for production use

**Congratulations! Your Uni-Market is live! 🎊**
