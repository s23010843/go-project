# 🏗 Architecture — Farm Market Price Portal

A concise technical reference for contributors and maintainers.

---

## Table of Contents
1. [Overview](#1-overview)
2. [Directory Structure](#2-directory-structure)
3. [Backend (Go)](#3-backend-go)
4. [Frontend](#4-frontend)
5. [PWA & Service Worker](#5-pwa--service-worker)
6. [AI / ML Layer](#6-ai--ml-layer)
7. [Security Model](#7-security-model)
8. [Data Flow](#8-data-flow)
9. [Deployment](#9-deployment)
10. [Design Decisions](#10-design-decisions)

---

## 1. Overview

```
Browser (PWA)
     │  HTTP / fetch API
     ▼
Go HTTP Server  ──reads──▶  prices.json
     │
     └──serves──▶  ./static/  (HTML · CSS · JS · SVG · SW)
```

The portal is a **single-binary Go web server** that:
- Exposes a JSON API (`/api/prices`) backed by a flat JSON file.
- Serves a static Progressive Web App with offline support.
- Guards every response with security headers.

The optional **ML layer** (Python) is a standalone batch process that trains a price-prediction model and writes results to file — it is **not** wired into the live request path.

---

## 2. Directory Structure

```
go-project/
├── main.go                  # Go server — routes, middleware, error pages
├── go.mod                   # Go module definition
├── prices.json              # Source-of-truth crop price data
├── Dockerfile               # Container build for production
├── netlify.toml             # Netlify deployment config (static export)
├── requirements.txt         # Python deps for the ML layer
│
├── static/                  # Everything served to the browser
│   ├── index.html           # Main SPA shell
│   ├── style.css            # Design tokens + all component styles
│   ├── script.js            # App logic, chatbot, eye-tracking, install prompt
│   ├── intents.json         # Chatbot intent patterns & replies
│   ├── prices.json          # Mirror of root prices.json (served at /prices.json)
│   ├── bot.svg              # Animated bot mascot
│   ├── favicon.svg          # Browser tab icon
│   ├── manifest.json        # PWA web app manifest
│   ├── sw.js                # Service worker (cache strategies)
│   ├── offline.html         # Shown when network is unavailable
│   ├── 404.html             # Page-not-found error page
│   └── 500.html             # Internal-server-error page
│
├── ml/
│   ├── train.py             # Model training script
│   ├── predict.py           # Prediction helper
│   └── README.md            # ML-specific documentation
│
├── User-Guide.md            # End-user documentation
└── ARCHITECTURE.md          # This file
```

---

## 3. Backend (Go)

**File:** `main.go`

### Request Pipeline

```
Incoming request
      │
      ▼
securityHeaders()       ← middleware — sets CSP, HSTS-like headers, etc.
      │
      ▼
http.ServeMux
  ├─ /api/prices        → getPrices()       JSON handler
  └─ /                  → customFileServer() Static files + error interception
```

### Key Components

| Symbol | Purpose |
|---|---|
| `securityHeaders(next)` | Wraps every handler; injects `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Permissions-Policy`, `Referrer-Policy` |
| `getPrices()` | Reads `prices.json`, decodes into `[]Price`, encodes as JSON response |
| `serveErrorPage()` | Reads `static/404.html` or `static/500.html` and writes it with the correct HTTP status |
| `errorInterceptWriter` | `http.ResponseWriter` decorator; intercepts 404/500 status codes from `http.FileServer` and swaps in custom HTML |
| `customFileServer()` | Wraps `http.FileServer` with `errorInterceptWriter` |

### Content-Security-Policy (summary)

```
default-src  'self'
script-src   'self' 'unsafe-inline' cdn.jsdelivr.net
style-src    'self' 'unsafe-inline' fonts.googleapis.com
font-src     'self' fonts.gstatic.com
img-src      'self' data:
connect-src  'self'
worker-src   'self'
manifest-src 'self'
```

---

## 4. Frontend

**All files live under `static/`.**

### `index.html`
Minimal SPA shell. Contains:
- PWA `<link rel="manifest">` and Apple/Android meta tags.
- Inline bot SVG (FAB + chat header) with individually addressable pupil & glint elements for eye-tracking.
- Chat widget markup (hidden by default).
- SW registration `<script>` block at the bottom.

### `style.css`
Single stylesheet using **CSS custom properties** (design tokens) defined in `:root`.

| Token | Value | Used for |
|---|---|---|
| `--green-900` | `#1b5e20` | Header, dark CTAs |
| `--green-700` | `#2e7d32` | Buttons, chart fill |
| `--green-500` | `#43a047` | Accents, hover |
| `--green-100` | `#e8f5e9` | Table header, info bg |
| `--border` | `#d4e5d5` | All borders |
| `--radius` | `10px` | Cards, inputs |

### `script.js`
Structured as a series of IIFEs and top-level functions:

```
script.js
├── fetch /prices.json          → priceData[]
├── fetch /intents.json         → intents[]  (regex patterns)
├── appendMessage()             chatbot UI helper
├── parseQuery()                crop/market NLP parser
├── resolveReply()              dynamic reply tokens (__CROPS__, __MARKETS__)
├── sendMessage()               main chatbot dispatch
├── filterPrices()              search + market filter
├── displayPrices()             render table + highlight high/low
├── updateChart()               Chart.js bar chart
├── downloadCSV()               Blob → anchor download
├── setAlert()                  price alert UI
├── PWA install IIFE            beforeinstallprompt / appinstalled
└── Bot eye-tracking IIFE       mousemove → SVG cx/cy mutation
```

---

## 5. PWA & Service Worker

**Files:** `manifest.json`, `sw.js`, `offline.html`

### Cache Strategy

| Request type | Strategy | Reason |
|---|---|---|
| Static assets (HTML/CSS/JS/SVG) | **Cache-first**, network refresh in background | Instant loads |
| `/api/prices` | **Network-first**, cached fallback | Always try for fresh data |
| CDN (fonts, Chart.js) | **Cache-first** | Avoid repeated cross-origin downloads |
| Navigation (HTML page) | **Network-first**, offline fallback | Serve the freshest shell |

### Offline Behaviour
1. On first load the SW pre-caches all files in `PRECACHE`.
2. Subsequent loads are served from cache — the app works completely offline.
3. When offline and a navigation request fails, the user sees `offline.html`.
4. `window.addEventListener('online', …)` auto-reloads when connectivity resumes.

### App Manifest (`manifest.json`)
```json
{
  "name": "Farm Market Price Portal",
  "short_name": "Farm Prices",
  "display": "standalone",
  "theme_color": "#2e7d32",
  "start_url": "/"
}
```

---

## 6. AI / ML Layer

**Files:** `ml/train.py`, `ml/predict.py`

The ML layer is **decoupled** from the live server. It is a batch pipeline run manually (or via cron) to generate price predictions.

```
prices.json
     │
     ▼
ml/train.py   (scikit-learn / pandas — see requirements.txt)
     │
     ▼
Saved model artefact
     │
     ▼
ml/predict.py → predicted prices → can be merged back into prices.json
```

**Integration path (future):** expose a `/api/predict` endpoint in `main.go` that shells out to `predict.py` or reads a pre-generated predictions file.

---

## 7. Security Model

| Layer | Control |
|---|---|
| **Transport** | Deploy behind HTTPS (Netlify TLS / Docker + reverse proxy) |
| **Headers** | `securityHeaders` middleware on every response |
| **Clickjacking** | `X-Frame-Options: DENY` |
| **MIME sniffing** | `X-Content-Type-Options: nosniff` |
| **XSS** | `Content-Security-Policy` restricts script origins; `X-XSS-Protection` for legacy browsers |
| **Feature creep** | `Permissions-Policy` disables geolocation, camera, microphone, payment |
| **Referrer leakage** | `Referrer-Policy: strict-origin-when-cross-origin` |
| **Input** | Chatbot input is text-only; no server-side eval; price filter uses dataset lookup only |

---

## 8. Data Flow

```
User types query / applies filter
          │
          ▼
script.js (client)
  ├─ Filter: iterate priceData[] in memory → re-render table + chart
  └─ Chatbot: regex match intents[] → static reply or price lookup in priceData[]
          │
          ▼
No server round-trip for display — only /api/prices on initial load
```

```
Service Worker intercepts /api/prices
  ├─ Online  → fetch network → update cache → return response
  └─ Offline → return cached response (stale-while-offline)
```

---

## 9. Deployment

### Local development
```bash
go run main.go
# → http://localhost:8080
```

### Docker
```bash
docker build -t farm-market .
docker run -p 8080:8080 farm-market
```

### Netlify (static export)
`netlify.toml` configures redirects so the Go server is not needed for the static frontend.  
Set `publish = "static"` and point Netlify to the repository.

---

## 10. Design Decisions

| Decision | Rationale |
|---|---|
| Flat JSON instead of a database | Simple to deploy, zero dependencies, easy to update manually or via script |
| Go standard library only | No external HTTP frameworks — smaller binary, fewer CVEs |
| Inline SVG for bot | Allows direct DOM manipulation of pupils/glints without a canvas or separate JS library |
| CSS custom properties (tokens) | Single place to retheme the entire UI |
| Service worker pre-cache | Guarantees offline first-paint even on flaky rural connections |
| Decoupled ML layer | Keeps the web server stateless and fast; ML is heavy and best run offline |
