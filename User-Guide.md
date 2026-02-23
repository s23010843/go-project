# 📖 User Guide — Farm Market Price Portal

Welcome! This guide explains everything you can do with the **Farm Market Price Portal** — no technical knowledge needed.

---

## Table of Contents
1. [Opening the App](#1-opening-the-app)
2. [Installing the App on Your Device](#2-installing-the-app-on-your-device)
3. [Searching & Filtering Prices](#3-searching--filtering-prices)
4. [Reading the Price Table](#4-reading-the-price-table)
5. [Understanding the Price Chart](#5-understanding-the-price-chart)
6. [Setting a Price Alert](#6-setting-a-price-alert)
7. [Downloading Data as CSV](#7-downloading-data-as-csv)
8. [Using the Price Assistant Chat Bot](#8-using-the-price-assistant-chat-bot)
9. [Using the App Offline](#9-using-the-app-offline)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Opening the App

Open your web browser and go to the address your administrator provided (e.g. `http://localhost:8080`).  
The page loads automatically with the latest crop prices from all markets.

---

## 2. Installing the App on Your Device

You can add the portal to your phone or desktop so it opens like a normal app — no app store needed.

### On a phone (Android / iOS)
1. Open the site in **Chrome** (Android) or **Safari** (iOS).
2. Tap the browser menu (⋮ or Share icon).
3. Choose **"Add to Home Screen"** → **Add**.
4. An icon appears on your home screen. Tap it to open the app.

### On a desktop (Chrome / Edge)
1. Look for the **"Install App"** button at the top of the page — it appears automatically when your browser supports it.
2. Click **Install App** → confirm in the pop-up.
3. The portal opens as a standalone window, just like a native app.

> **Tip:** The Install App button only appears when the browser decides the site is eligible. If you don't see it, use the browser's address-bar install icon (📥) instead.

---

## 3. Searching & Filtering Prices

At the top of the page you'll find the **Filter Prices** section.

| Control | What it does |
|---|---|
| **Search crop** text box | Type any part of a crop name (e.g. `whe` to find Wheat) |
| **All Markets** dropdown | Narrow results to a single market (Central, North, South) |
| **Apply Filter** button | Applies the search and market selection |
| **⬇ Download CSV** button | Saves the currently visible prices to a spreadsheet file |

Click **Apply Filter** after making your selections. The table and chart update instantly.

---

## 4. Reading the Price Table

The **Price List** table shows three columns:

| Column | Meaning |
|---|---|
| **Crop** | Name of the agricultural product |
| **Market** | Which market the price is from |
| **Price (₹)** | Current price in Indian Rupees per unit |

**Colour coding:**
- 🟢 **Green row** — Highest price in the current view (best selling opportunity)
- 🔴 **Red row** — Lowest price in the current view (watch out for buyers)

---

## 5. Understanding the Price Chart

The **Price Comparison** bar chart shows the same prices as the table in a visual format.  
Each bar represents one market entry. Taller bars = higher price.  
Hover over any bar to see the exact price in a tooltip.

The chart updates every time you apply a filter.

---

## 6. Setting a Price Alert

1. Scroll to the **Set Price Alert** section.
2. Type your target price (in ₹) into the text box.
3. Click **Set Alert**.
4. A confirmation message appears.

> **Note:** Alerts are for reference only in this version — they do not yet send push notifications or emails.

---

## 7. Downloading Data as CSV

1. (Optional) Apply a filter to narrow down the crops or market you want.
2. Click **⬇ Download CSV**.
3. A file named `farm_prices.csv` is saved to your device.
4. Open it in Excel, Google Sheets, or any spreadsheet app.

---

## 8. Using the Price Assistant Chat Bot

The **🌾 bot icon** in the bottom-right corner opens a chat assistant.

### How to open it
Click the green bot button (bottom-right). A chat panel slides up.

### What you can ask
- `"What is the price of Wheat?"` — price across all markets
- `"Wheat in Central"` — price for a specific crop + market
- `"List all crops"` — see all available crops
- `"Which markets are available?"` — list all markets
- `"Hello"` / `"Hi"` — friendly greeting

### Fun feature 🎯
The bot's **eyes follow your mouse cursor** around the screen — just like the GitHub mascot!

### Closing the chat
Click the **×** button inside the chat panel, or click the bot button again.

---

## 9. Using the App Offline

The portal works **even without an internet connection**, thanks to built-in offline caching.

- Prices you've already loaded remain visible and searchable.
- The chart and CSV download continue to work.
- If you're offline, a friendly notice appears automatically.
- The moment your connection comes back, the app refreshes to show the latest prices.

---

## 10. Troubleshooting

| Problem | Solution |
|---|---|
| Prices won't load | Check your internet connection; reload the page |
| Install App button missing | Use the browser's built-in install option (address bar icon) |
| Chart is blank | Try refreshing the page; may require a brief internet connection |
| Old data showing | Pull down to refresh (mobile) or press `Ctrl + Shift + R` (desktop) to force a fresh load |
| 404 page appears | The URL you visited doesn't exist — click **Go to Home** |
| 500 page appears | A server error occurred — click **Try Again** or wait a moment |

---

*For technical issues or feature requests, please open an issue on the [project repository](https://github.com/s23010843/go-project).*
