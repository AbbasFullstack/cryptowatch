
![Header](https://capsule-render.vercel.app/api?type=waving&height=230&section=header&text=CryptoWatch&fontSize=60&fontColor=ffffff&animation=twinkling&desc=Personal%20Crypto%20Watchlist%20%E2%80%A2%20Auth%20+%20Live%20Prices%20+%20Charts&descAlignY=72&color=gradient&customColorList=10)

<div align="center">

<img src="https://readme-typing-svg.demolab.com/?font=Fira+Code&weight=600&size=24&pause=1000&color=F7931A&center=true&vCenter=true&width=700&lines=Supabase+Auth+%26+PostgreSQL;Binance+WebSocket+Live+Prices;Interactive+Charts+with+Recharts" alt="Typing SVG"/>

**Personal crypto watchlist — authentication, real-time prices & interactive charts**

[![LIVE DEMO](https://img.shields.io/badge/🚀_LIVE_DEMO-cryptowatch--rust.vercel.app-orange?style=for-the-badge&logo=vercel&logoColor=white)](https://cryptowatch-rust.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_+_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Binance](https://img.shields.io/badge/Binance-WebSocket-F0B90B?style=for-the-badge&logo=binance&logoColor=black)](https://binance.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>

---

## ✨ Features

<div align="center">

[![🔐 Authentication](https://img.shields.io/badge/🔐_Auth-Supabase_Email_Password-3ECF8E?style=for-the-badge)](#)
[![⭐ Watchlist](https://img.shields.io/badge/⭐_Watchlist-PostgreSQL_+_Row_Level_Security-blue?style=for-the-badge)](#)
[![⚡ Live Prices](https://img.shields.io/badge/⚡_Live_Prices-Binance_WebSocket-green?style=for-the-badge)](#)

[![📊 Charts](https://img.shields.io/badge/📊_Charts-24H_7D_1M_1Y-orange?style=for-the-badge)](#)
[![📈 Live Ticker](https://img.shields.io/badge/📈_Scrolling_Ticker-Marquee-purple?style=for-the-badge)](#)
[![💎 UI](https://img.shields.io/badge/💎_UI-Glassmorphism_Carbon_Dark-teal?style=for-the-badge)](#)

</div>

---

## 🏗️ Architecture

```text
Browser ──Auth + Watchlist (RLS)──► Supabase (PostgreSQL)
   │
   ├──WebSocket (live har second)──► Binance Stream
   │
   └──REST (klines charts)────────► Binance API
```

---

## 🛠️ Tech Stack

<div align="center">

[![Next.js 16](https://img.shields.io/badge/Next.js_16-App_Router-black?style=for-the-badge&logo=next.js)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Type_Safety-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Glassmorphism_UI-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-Database_+_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![Binance WebSocket](https://img.shields.io/badge/Binance_WebSocket-Live_Streams-F0B90B?style=for-the-badge&logo=binance&logoColor=black)](#)
[![CoinPaprika](https://img.shields.io/badge/CoinPaprika-Top_20_Coins-822250?style=for-the-badge)](#)
[![Recharts](https://img.shields.io/badge/Recharts-Area_Charts-0088FE?style=for-the-badge)](#)
[![Vercel](https://img.shields.io/badge/Vercel-Auto_Deploy-black?style=for-the-badge&logo=vercel)](#)

</div>

---

## 📦 Installation

```bash
git clone https://github.com/AbbasFullstack/cryptowatch.git
cd cryptowatch/frontend
npm install

# .env.local banayein (apni Supabase keys)
echo "NEXT_PUBLIC_SUPABASE_URL=your_project_url" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key" >> .env.local

npm run dev
```

> 🔐 Keys Supabase dashboard → Settings → API se lein

---

## 📁 Project Structure

```text
cryptowatch/
└── frontend/
    ├── app/
    │   ├── auth/page.tsx        # Login / Signup
    │   ├── coin/[id]/page.tsx   # Chart + live stats
    │   ├── page.tsx             # Home (watchlist + live list)
    │   └── globals.css          # Marquee animation
    └── lib/
        └── supabase.ts          # Supabase client
```

---

## 👨💻 About the Developer

<div align="center">

<img src="https://github.com/AbbasFullstack.png" width="120" height="120" alt="Abbas Hussain"/>

### **Abbas Hussain**
*Full-Stack Web Developer*

[![GitHub](https://img.shields.io/badge/GitHub-AbbasFullstack-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AbbasFullstack)
[![Email](https://img.shields.io/badge/abbaswebdevelopers@gmail.com-Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:abbaswebdevelopers@gmail.com)

> 🎯 Self-taught developer building production-ready full-stack apps
> 💻 Next.js • TypeScript • Supabase • WebSocket APIs
> 📱 **Fun fact:** this entire project was built using only a mobile phone (GitHub Codespaces + Termux)!

### 📊 Development Activity

![Contribution Graph](https://ghchart.rshah.org/F7931A/AbbasFullstack)

</div>

---

## 📄 License

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#)

**Made with ❤️ by Abbas Hussain**

⭐ *Star this repo if you find it helpful!*

</div>

![Footer](https://capsule-render.vercel.app/api?type=wave&height=110&section=footer&color=gradient&customColorList=10)