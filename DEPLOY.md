# 🚀 Deployment Instructions

## Push to GitHub

```bash
cd /Volumes/PS2000W/uni-market

git add -A
git commit -m "Fix: API endpoints, NaN prices, Contact Seller & Favorites"
git push origin main
```

## What Happens Next

1. **Vercel** (Frontend) auto-deploys in 2-3 minutes
2. **Render** (Backend) auto-deploys in 3-5 minutes

## Monitor Deployment

- Vercel: https://vercel.com/dashboard
- Render: https://dashboard.render.com

## No Configuration Changes Needed

✅ All environment variables already set
✅ All changes are compatible
✅ Auto-deploy handles everything

## Test After Deployment

Visit your Vercel URL and test:
- Browse page loads items
- Prices show correctly (not NaN)
- Contact Seller works
- Add to Favorites works

## If Auto-Deploy Fails

**Vercel:**
1. Go to dashboard → Select project
2. Click "Redeploy"
3. Uncheck "Use existing Build Cache"

**Render:**
1. Go to dashboard → Select service
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"

That's it! 🎉
