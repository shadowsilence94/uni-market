# Uni-Market Deployment Guide

## Free Hosting Options

### Backend Deployment (Render.com)

1. **Create account at [Render.com](https://render.com)**

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Or use "Deploy from Git URL"

3. **Configure Service**
   ```
   Name: uni-market-backend
   Region: Choose closest to your users
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node index.js
   ```

4. **Environment Variables**
   - Add in Render dashboard:
   ```
   PORT=3001
   JWT_SECRET=your-secret-key-here-change-this
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy the URL (e.g., https://uni-market-backend.onrender.com)

### Frontend Deployment (Vercel)

1. **Create account at [Vercel.com](https://vercel.com)**

2. **Install Vercel CLI (Optional)**
   ```bash
   npm install -g vercel
   ```

3. **Update API URL**
   - Edit `client/vite.config.ts`:
   ```typescript
   server: {
     proxy: {
       '/api': {
         target: 'https://your-render-backend-url.onrender.com',
         changeOrigin: true
       }
     }
   }
   ```

4. **Deploy via Vercel Dashboard**
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     ```
     Framework Preset: Vite
     Root Directory: client
     Build Command: npm run build
     Output Directory: dist
     ```

5. **Or Deploy via CLI**
   ```bash
   cd client
   vercel
   # Follow prompts
   ```

### Alternative: Deploy Both on Render

**Backend:** Same as above

**Frontend:**
1. Create New Static Site on Render
2. Configure:
   ```
   Name: uni-market-frontend
   Root Directory: client
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

## Environment Setup

### Backend (.env file for local development)
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Frontend (update vite.config.ts for production)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

## Quick Deploy Commands

### Using Vercel CLI
```bash
# Deploy frontend
cd client
vercel --prod

# Note: Update API URL in code before deploying
```

### Using Render
1. Push code to GitHub
2. Connect repository in Render dashboard
3. Configure as described above
4. Deploy automatically on push

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend can connect to backend API
- [ ] Database (db.json) is initialized
- [ ] Admin user can login
- [ ] Test user registration
- [ ] Test item listing
- [ ] Test verification requests
- [ ] Check all pages load correctly

## Troubleshooting

**CORS Issues:**
- Add your Vercel domain to CORS whitelist in server/index.js:
```javascript
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

**API Connection Failed:**
- Verify backend URL in frontend code
- Check Render logs for errors
- Ensure environment variables are set

**Build Failures:**
- Check Node version compatibility
- Verify all dependencies are in package.json
- Review build logs for specific errors

## Free Tier Limitations

**Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

## Production Recommendations

For production use, consider:
1. Use PostgreSQL instead of JSON file database
2. Add Redis for caching
3. Implement proper file storage (AWS S3, Cloudinary)
4. Add monitoring (Sentry, LogRocket)
5. Set up CI/CD pipeline
6. Use environment-specific configs

## Support

For issues, check:
- Render logs: Dashboard → Your Service → Logs
- Vercel logs: Dashboard → Your Project → Deployments → View Logs
- Browser console for frontend errors
