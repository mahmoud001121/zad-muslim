# 🕌 زاد مسلم — Zad Muslim

Your daily spiritual companion - Prayer times, Quran, Hadith, Azkar, and more.

## ✨ Features

- 🕌 **Prayer Times** - Auto-detect location, accurate prayer times with Adhan
- 📿 **Azkar** - Daily remembrance and supplications
- 📖 **Quran** - Read and listen to the Holy Quran
- 📚 **Hadith** - Authentic Hadith collections
- 🎯 **Goals** - Track your spiritual goals
- 📻 **Radio** - Islamic radio stations
- 🔔 **Smart Notifications** - Prayer reminders, Adhan alerts, Salawat reminders
- 📱 **PWA** - Install as native app, works offline
- 🌍 **Auto Geolocation** - Automatic prayer time detection
- 🌙 **Dark Theme** - Beautiful dark interface
- 🌐 **Bilingual** - Arabic & English support

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Deploy to Vercel (100% Free - 10 Minutes!)

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for step-by-step guide.

**Simple Deployment:**
- ✅ 100% free forever
- ✅ No credit card required
- ✅ No database setup needed
- ✅ Just push to GitHub and deploy
- ✅ 10 minutes total

## 🔧 Environment Variables

For Vercel deployment, you only need these 3 variables:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"
```

See `.env.example` for full configuration.

## 📦 Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix UI)
- **Storage**: Client-side (IndexedDB + LocalStorage)
- **State**: Zustand
- **i18n**: next-intl
- **Notifications**: web-push + Service Worker
- **PWA**: Serwist

## 🛠️ Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📱 PWA Features

- Install as native app on any device
- Works offline
- Push notifications
- Background sync
- Service worker caching

## 🌍 Deployment

**Vercel (Recommended)**
- See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- Free tier: 100GB bandwidth
- No credit card required
- No database setup needed

## 🔐 Security

- Content Security Policy (CSP) configured
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Rate limiting on API endpoints

## 💾 Data Storage

- **Goals/Tasks**: Stored in browser (IndexedDB)
- **Settings**: Stored in browser (LocalStorage)
- **Notifications**: Managed by Service Worker
- **No server database needed**: Everything works client-side

## 📄 License

MIT

## 🤲 Support

If you find this project useful, please consider:
- ⭐ Starring the repository
- 🤲 Making dua for the developers
- 📢 Sharing with your community

---

**Built with ❤️ for the Muslim Ummah**
