# CASINO36.FUN - Demo Game Platform

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

A fun, virtual-currency demo game platform. **No real money, no blockchain, no gambling APIs.**

## 🎮 Features

- **5 Games**: Tài Xỉu, Bầu Cua, Xổ Số VIP, Quay Hũ, Aviator
- **Promo Codes**: Redeem codes for virtual balance
- **Beautiful UI**: Glassmorphism design with smooth animations
- **Mobile-First**: Fully responsive design
- **Secure Auth**: JWT-based authentication

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, SQLite (better-sqlite3)
- **Auth**: JWT with bcrypt password hashing

## 📦 Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd okvip

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deploy to Render.com

### Option 1: One-Click Deploy

1. Fork this repository
2. Click the "Deploy to Render" button above
3. Configure environment variables if needed
4. Deploy!

### Option 2: Manual Deploy

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add environment variables:
   - `JWT_SECRET` - Render can auto-generate this
   - `NODE_ENV` - Set to `production`
5. Deploy!

## 🎁 Promo Codes

| Code | Reward |
|------|--------|
| CHAOMUNGTANTHU | 10,000,000 |
| VIP36CASINO | 36,000,000 |
| HAPPYNEWYEAR2026 | 260,000,000 |
| TOIYEUTHANHHOA | 36,360,000 |
| GAMEVUIGIAITRI | 10,000,000 |

## 📱 Screenshots

Coming soon!

## ⚠️ Disclaimer

This is a **DEMO platform only**. All currencies are virtual in-game balance. There are no real money transactions, deposits, or withdrawals. For entertainment purposes only.

## 📄 License

MIT License
