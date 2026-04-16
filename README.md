# 📊 StudentFolio — Indian Student Finance Tracker

A portfolio tracker built for Indian students to manage all investments in one place and understand the power of compounding.

## Features
- **Portfolio** — Equity, Mutual Funds, FD, RD, Chit Fund, Govt Bonds
- **Live Prices** — Auto-fetch NSE stock prices & MF NAV
- **Goals** — Plan for gadgets, bikes, college fees
- **Advisor** — Rule-based financial tips (educational only, not SEBI registered)
- **Why Start Early** — Interactive compounding visualizer
- **Fund Explorer** — Filter top Indian mutual funds

## 🚀 Deploy to GitHub Pages (Step-by-Step)

### Step 1 — Create a GitHub Account
Go to [github.com](https://github.com) and sign up (free).

### Step 2 — Create a New Repository
1. Click the **＋** icon → **New repository**
2. Name it: `studentfolio` (or anything you like)
3. Set to **Public**
4. Click **Create repository**

### Step 3 — Upload Files
1. Click **uploading an existing file** on the repo page
2. Drag and drop all 3 files:
   - `index.html`
   - `style.css`
   - `app.js`
3. Write commit message: `Initial release`
4. Click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Go to repo **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Branch: **main** | Folder: **/ (root)**
4. Click **Save**

### Step 5 — Your App is Live!
Wait ~2 minutes, then visit:
`https://YOUR-USERNAME.github.io/studentfolio`

---

## 📝 Notes
- All data is stored in your browser (localStorage) — no backend, no server
- Live stock prices use Yahoo Finance API via a CORS proxy (may occasionally fail)
- MF NAV uses mfapi.in (free, reliable)
- Demo data loads automatically on first visit

## ⚠️ Disclaimer
This app is for educational awareness only. Not SEBI registered. Always consult a certified financial advisor before making real investment decisions.
