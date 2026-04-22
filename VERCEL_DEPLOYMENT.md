# 🚀 Vercel Deployment Guide - زاد مسلم (Simple Version)

## ✅ Why This Approach?
- **Simple** - No external database setup needed
- **Free** - 100% free on Vercel
- **Easy** - Just push and deploy
- **Client-Side Storage** - Data stored in user's browser (IndexedDB/LocalStorage)

---

## 📋 How It Works

This app uses **client-side storage** for user data:
- **Prayer notifications** - Stored in browser, managed by Service Worker
- **Goals/Tasks** - Stored in browser's IndexedDB
- **Settings** - Stored in browser's LocalStorage

**Note:** Push subscriptions are stored in-memory on the server. They reset when the server restarts (every ~15 min on Vercel free tier). Users just need to allow notifications again.

---

## 📋 Deployment Steps (10 minutes)

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create repository on GitHub
# Go to: https://github.com/new
# Name: zad-muslim
# Click "Create repository"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/zad-muslim.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" → Choose "Continue with GitHub" (FREE, no credit card)
3. Click "Import Project"
4. Select your `zad-muslim` repository
5. Click "Import"

### Step 3: Configure Environment Variables

In Vercel dashboard, go to "Settings" → "Environment Variables"

Add these variables:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY
BDfKkya975WhlfmZAkyxvBaiInsvJ-RyqNIZXyhPWTIemqB8nfmrhLruP2r1Yizaw915G_qSZG8pMl6-f0xUIM8

VAPID_PRIVATE_KEY
6IDB6Vntsb7D9yTa18iCLP8KWsd4CzUL1IBc9pTl66I

VAPID_SUBJECT
mailto:zad-muslim@app.com

NODE_ENV
production
```

**That's it! No database setup needed.**

### Step 4: Deploy

- Click "Deploy"
- Wait 2-3 minutes
- Your app will be live at: `https://zad-muslim.vercel.app`

---

## 🔧 After Deployment

### Test Your App

1. Visit your Vercel URL
2. Allow location permission
3. Allow notification permission
4. Test prayer times
5. Test notifications

### Important Notes About Notifications

**How Notifications Work:**
- Push subscriptions are stored in server memory
- Vercel free tier puts server to sleep after ~15 minutes of inactivity
- When server wakes up, subscriptions are lost
- Users just need to revisit the site and allow notifications again

**To Keep Notifications Working 24/7:**

Use a free external cron service to ping your API every minute:

#### Option 1: Cron-Job.org (Recommended)

1. Go to https://cron-job.org
2. Sign up (free, no credit card)
3. Create new cron job:
   - **Title**: Zad Muslim Notifications
   - **URL**: `https://your-app.vercel.app/api/push/cron`
   - **Schedule**: Every 1 minute
   - **Method**: GET
4. Save and enable

#### Option 2: EasyCron.com

1. Go to https://www.easycron.com
2. Sign up (free tier: 100 executions/day)
3. Create cron job:
   - **URL**: `https://your-app.vercel.app/api/push/cron`
   - **Cron Expression**: `* * * * *` (every minute)
4. Save

#### Option 3: UptimeRobot.com

1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-app.vercel.app/api/push/cron`
   - **Monitoring Interval**: 5 minutes (free tier limit)
4. Create monitor

**With external cron:**
- ✅ Server stays awake 24/7
- ✅ Notifications work continuously
- ✅ Users don't need to re-allow notifications
- ✅ 100% free

### Custom Domain (Optional)

1. In Vercel dashboard → "Settings" → "Domains"
2. Add your domain
3. Update DNS records as instructed

---

## 🔄 Future Updates

Every time you push to GitHub, Vercel auto-deploys:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel deploys automatically!
```

---

## 🆘 Troubleshooting

### Build Failed?

Check Vercel build logs. Common issues:
- Missing environment variables
- TypeScript errors (already ignored in config)

### Notifications Not Working?

- Check all VAPID environment variables are set
- Make sure user allowed notifications in browser
- If server restarted, user needs to allow notifications again
- **Solution**: Set up external cron service (see above)

### Notifications Stop After 15 Minutes?

This is normal on Vercel free tier:
- Server goes to sleep after 15 min inactivity
- Push subscriptions are stored in-memory
- **Solution**: Use external cron service like cron-job.org to ping `/api/push/cron` every minute

---

## 💡 Generate Your Own VAPID Keys (Optional)

If you want unique push notification keys:

```bash
npx web-push generate-vapid-keys
```

Update the VAPID environment variables in Vercel with your new keys.

---

## 🎯 What's Working

After deployment:
- ✅ Prayer times with auto-location
- ✅ Adhan notifications (with external cron)
- ✅ Prayer reminders (with external cron)
- ✅ Salawat reminders (with external cron)
- ✅ Quran reader
- ✅ Hadith collections
- ✅ Azkar
- ✅ Goals/Tasks (saved in browser)
- ✅ Radio stations
- ✅ PWA installation
- ✅ Offline mode
- ✅ Dark theme
- ✅ Arabic/English

---

## 💰 Cost

**Forever Free:**
- Vercel: Hobby plan (100GB bandwidth/month)
- Cron-Job.org: Free unlimited cron jobs
- No database costs
- No credit card required!

---

## 🎉 You're Done!

Your Muslim PWA app is now live on Vercel!

**Next Steps:**
1. Test all features
2. Set up external cron service (cron-job.org) for 24/7 notifications
3. Share your URL
4. Add custom domain (optional)

Need help? Check Vercel docs! 🚀
