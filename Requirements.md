# 📋 Requirements — Farm Market Price Portal

This document defines the **Functional** and **Non-Functional** requirements for the Farm Market Price Portal web application.

---

## Table of Contents
1. [Functional Requirements](#1-functional-requirements)
2. [Non-Functional Requirements](#2-non-functional-requirements)
3. [Constraints](#3-constraints)
4. [Assumptions](#4-assumptions)

---

## 1. Functional Requirements

Functional requirements describe **what the system must do**.

---

### FR-01 · Display Crop Prices

| Attribute | Detail |
|---|---|
| **ID** | FR-01 |
| **Title** | Load and display crop price data |
| **Description** | The system shall fetch crop price data from `/prices.json` on page load and display it in a tabular format with columns for Crop, Market, and Price (₹). |
| **Priority** | High |
| **Acceptance Criteria** | Price table is populated within 3 seconds of page load on a standard connection. |

---

### FR-02 · Filter by Crop Name

| Attribute | Detail |
|---|---|
| **ID** | FR-02 |
| **Title** | Real-time crop name search |
| **Description** | The system shall allow users to type a partial or full crop name in a search field and filter the displayed prices in real time (as they type), without requiring a full page reload. |
| **Priority** | High |
| **Acceptance Criteria** | Table updates within 100 ms of each keystroke. Empty search restores all results. |

---

### FR-03 · Filter by Market

| Attribute | Detail |
|---|---|
| **ID** | FR-03 |
| **Title** | Market dropdown filter |
| **Description** | The system shall provide a dropdown menu listing all available markets. Selecting a market shall immediately filter the price table and chart to show only entries from that market. |
| **Priority** | High |
| **Acceptance Criteria** | Selecting "Central" shows only Central market rows; selecting "All Markets" restores all rows. |

---

### FR-04 · Price Comparison Chart

| Attribute | Detail |
|---|---|
| **ID** | FR-04 |
| **Title** | Bar chart visualisation of prices |
| **Description** | The system shall render an interactive bar chart comparing crop prices. The chart shall update whenever a filter is applied. |
| **Priority** | Medium |
| **Acceptance Criteria** | Chart reflects the same data as the visible table. Hovering a bar shows the exact price in a tooltip. |

---

### FR-05 · Highlight Highest and Lowest Prices

| Attribute | Detail |
|---|---|
| **ID** | FR-05 |
| **Title** | Visual price extremes |
| **Description** | The system shall visually distinguish the row with the highest price (green highlight) and the row with the lowest price (red highlight) in the currently filtered dataset. |
| **Priority** | Low |
| **Acceptance Criteria** | Exactly one row carries the `highest` class and one carries the `lowest` class in any non-empty result set. |

---

### FR-06 · Summary Statistics Bar

| Attribute | Detail |
|---|---|
| **ID** | FR-06 |
| **Title** | Display aggregate statistics |
| **Description** | The system shall display a statistics bar showing: number of unique crops, number of unique markets, average price, highest price, and lowest price for the currently visible dataset. |
| **Priority** | Medium |
| **Acceptance Criteria** | Stats update whenever the filter changes. Stats bar is hidden when no data is present. |

---

### FR-07 · Download Prices as CSV

| Attribute | Detail |
|---|---|
| **ID** | FR-07 |
| **Title** | CSV export |
| **Description** | The system shall allow users to download the full (unfiltered) price dataset as a CSV file named `farm_prices.csv`. A toast confirmation shall appear on successful download. |
| **Priority** | Medium |
| **Acceptance Criteria** | Downloaded file contains a header row (Crop, Market, Price) followed by one data row per price entry. |

---

### FR-08 · Set Price Alert

| Attribute | Detail |
|---|---|
| **ID** | FR-08 |
| **Title** | Price threshold alert |
| **Description** | The system shall allow a user to enter a numeric target price and register a simulated price alert. A confirmation message and a toast notification shall be shown. Pressing Enter in the input field shall trigger the same action as clicking "Set Alert". |
| **Priority** | Low |
| **Acceptance Criteria** | Alert confirmation message appears below the input. Input is cleared after a successful alert. Invalid (negative or empty) input shows an error message. |

---

### FR-09 · Price Assistant Chat Bot

| Attribute | Detail |
|---|---|
| **ID** | FR-09 |
| **Title** | Conversational price lookup |
| **Description** | The system shall provide a floating chat widget that a user can open to query crop prices in natural language (e.g. "price of wheat in Central"). The bot shall also handle greeting messages and general enquiries using intent patterns loaded from `intents.json`. |
| **Priority** | Medium |
| **Acceptance Criteria** | Bot responds with the correct price when given a valid crop + market combination. Bot gives a helpful fallback when the query is not understood. |

---

### FR-10 · Bot Eye Tracking

| Attribute | Detail |
|---|---|
| **ID** | FR-10 |
| **Title** | Animated bot eyes follow the cursor |
| **Description** | The bot mascot's pupils (in both the FAB button and the chat widget header) shall track the user's mouse cursor position smoothly, constrained within the eye socket boundary. |
| **Priority** | Low |
| **Acceptance Criteria** | Pupils visibly move toward the cursor. Pupils never leave the white eyeball area. Works on both visible bot instances simultaneously. |

---

### FR-11 · Unread Message Badge

| Attribute | Detail |
|---|---|
| **ID** | FR-11 |
| **Title** | Chat unread notification |
| **Description** | When the chat widget is closed and the bot sends a new message, a red dot badge shall appear on the FAB button. The badge shall disappear when the chat is opened. |
| **Priority** | Low |
| **Acceptance Criteria** | Badge appears after each bot reply while chat is closed. Badge disappears on chat open. |

---

### FR-12 · Custom Error Pages

| Attribute | Detail |
|---|---|
| **ID** | FR-12 |
| **Title** | Friendly 404 and 500 error pages |
| **Description** | The server shall serve a branded, user-friendly HTML page for 404 (not found) and 500 (server error) responses, consistent in style with the main application. Each error page includes navigation buttons and an animated bot with eye tracking. |
| **Priority** | Medium |
| **Acceptance Criteria** | Visiting a non-existent URL returns HTTP 404 and renders `404.html`. A server-side error returns HTTP 500 and renders `500.html`. |

---

### FR-13 · Progressive Web App (PWA) Install

| Attribute | Detail |
|---|---|
| **ID** | FR-13 |
| **Title** | Install as native-like app |
| **Description** | The system shall meet PWA criteria (manifest, service worker, HTTPS) so that supported browsers offer an install prompt. An "Install App" button in the header shall trigger the native install dialogue when the browser fires `beforeinstallprompt`. |
| **Priority** | Medium |
| **Acceptance Criteria** | Install button appears in Chrome/Edge on desktop and Android. App opens in standalone mode after installation. |

---

### FR-14 · Offline Support

| Attribute | Detail |
|---|---|
| **ID** | FR-14 |
| **Title** | Usable without an internet connection |
| **Description** | The system shall pre-cache all static assets and price data on first visit using a service worker. When offline, previously loaded data shall remain accessible. A dedicated `offline.html` page shall be served for uncached navigation requests. The page shall auto-reload when connectivity is restored. |
| **Priority** | High |
| **Acceptance Criteria** | App loads and displays cached prices with no network. Offline notice is shown. Page reloads automatically when back online. |

---

### FR-15 · Toast Notifications

| Attribute | Detail |
|---|---|
| **ID** | FR-15 |
| **Title** | Non-blocking user feedback |
| **Description** | The system shall display brief on-screen toast notifications to confirm successful actions (CSV download, price alert) and to report errors (failed data load). Toasts shall disappear automatically after 3–6 seconds. |
| **Priority** | Low |
| **Acceptance Criteria** | Toast appears within 300 ms of the triggering action. Toast is announced to assistive technologies via `aria-live="assertive"`. Toast removes itself without user interaction. |

---

## 2. Non-Functional Requirements

Non-functional requirements describe **how well the system performs its functions**.

---

### NFR-01 · Performance

| Attribute | Detail |
|---|---|
| **ID** | NFR-01 |
| **Category** | Performance |
| **Description** | The application shall achieve a First Contentful Paint (FCP) of under **2 seconds** and a Largest Contentful Paint (LCP) of under **3 seconds** on a 4G mobile connection. Time-to-Interactive shall not exceed **4 seconds** on first load. |
| **Rationale** | Farmers may access the portal on low-bandwidth mobile connections in rural areas. |
| **Metric** | Measured via Lighthouse / Chrome DevTools on a simulated 4G connection. |

---

### NFR-02 · Accessibility

| Attribute | Detail |
|---|---|
| **ID** | NFR-02 |
| **Category** | Accessibility |
| **Description** | The application shall conform to **WCAG 2.1 Level AA**. All interactive controls shall be keyboard-navigable. All form inputs shall have programmatic labels. Dynamic content changes (filter results, toasts) shall be announced to screen readers via `aria-live` regions. Colour contrast shall meet the 4.5:1 minimum ratio for normal text. |
| **Rationale** | The portal should be usable by users with visual or motor impairments. |
| **Metric** | Zero critical violations in axe-core automated audit; manual screen reader testing. |

---

### NFR-03 · Security

| Attribute | Detail |
|---|---|
| **ID** | NFR-03 |
| **Category** | Security |
| **Description** | Every HTTP response shall include the following headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (disabling geolocation, camera, microphone, payment). The CSP shall restrict script sources to the application origin and the Chart.js CDN only. |
| **Rationale** | Protects users against XSS, clickjacking, MIME confusion, and feature abuse attacks. |
| **Metric** | Security headers verified with [securityheaders.com](https://securityheaders.com); CSP evaluated with Google CSP Evaluator. |

---

### NFR-04 · Responsiveness

| Attribute | Detail |
|---|---|
| **ID** | NFR-04 |
| **Category** | Usability / Responsiveness |
| **Description** | The user interface shall be fully usable on screen widths from **320 px** (small phone) to **2560 px** (large desktop). The layout shall use fluid grids and flex/wrap so no content is clipped or requires horizontal scrolling on any standard viewport. |
| **Rationale** | The majority of target users (farmers, market agents) access the web on mobile phones. |
| **Metric** | Tested at 320 px, 375 px, 768 px, 1024 px, and 1440 px breakpoints with no horizontal overflow. |

---

### NFR-05 · Offline / Resilience

| Attribute | Detail |
|---|---|
| **ID** | NFR-05 |
| **Category** | Availability |
| **Description** | After the first successful load, the application shall be fully functional offline for at least **7 days** without a network connection (limited by browser cache eviction policies). API requests shall fall back to cached responses gracefully. |
| **Rationale** | Rural market areas may have intermittent connectivity. Users must be able to check prices they have already loaded. |
| **Metric** | DevTools → Network → Offline mode; app must render cached data. |

---

### NFR-06 · Maintainability

| Attribute | Detail |
|---|---|
| **ID** | NFR-06 |
| **Category** | Maintainability |
| **Description** | The codebase shall follow a clear separation of concerns: Go server (`main.go`), styles (`style.css`), application logic (`script.js`), and markup (`index.html`). CSS shall use design tokens (custom properties) for all colours and spacing. No external CSS or JS frameworks shall be used for the core UI. |
| **Rationale** | A single developer (or small team) must be able to update the UI, add new crops/markets, or modify the server without cross-cutting changes. |
| **Metric** | Adding a new market requires changes to at most 2 files. Design colour changes require editing only `:root` in `style.css`. |

---

### NFR-07 · Browser Compatibility

| Attribute | Detail |
|---|---|
| **ID** | NFR-07 |
| **Category** | Compatibility |
| **Description** | The application shall be fully functional in the **latest two major versions** of Chrome, Firefox, Edge, and Safari (desktop and mobile). Service Worker and PWA features require a secure context (HTTPS or localhost). |
| **Rationale** | Wide browser support ensures the portal is accessible regardless of the user's device or OS. |
| **Metric** | Manual cross-browser testing on each listed browser. |

---

### NFR-08 · Scalability

| Attribute | Detail |
|---|---|
| **ID** | NFR-08 |
| **Category** | Scalability |
| **Description** | The Go server shall handle at least **500 concurrent HTTP requests** without degradation in response time (< 200 ms p95 for static file serving). The price data file (`prices.json`) shall support up to **10,000 entries** without client-side rendering performance falling below 60 fps during table render. |
| **Rationale** | The portal may be shared across a large market community or district-level portal. |
| **Metric** | Load tested with `hey` or `wrk`; client render tested with Chrome DevTools Performance panel. |

---

### NFR-09 · SEO & Discoverability

| Attribute | Detail |
|---|---|
| **ID** | NFR-09 |
| **Category** | SEO |
| **Description** | The application shall include a descriptive `<meta name="description">` tag, a descriptive `<title>`, and correct `lang` attribute on `<html>`. The PWA manifest shall include `name`, `short_name`, `description`, `theme_color`, and `icons`. |
| **Rationale** | Farmers searching for "crop prices near me" or similar terms should be able to find the portal via search engines. |
| **Metric** | Lighthouse SEO audit score ≥ 90. |

---

### NFR-10 · Usability

| Attribute | Detail |
|---|---|
| **ID** | NFR-10 |
| **Category** | Usability |
| **Description** | The application shall provide immediate visual feedback for all user actions (filter results count, toast on download/alert, skeleton loader while prices fetch). Error messages shall use plain language — no HTTP status codes or technical jargon exposed to the user. All touch targets shall be at least **44 × 44 px** for mobile usability. |
| **Rationale** | The primary users are farmers and market agents who may not have technical backgrounds. |
| **Metric** | All interactive elements pass 44 px minimum size check. All error messages reviewed by a non-technical reader. |

---

## 3. Constraints

| # | Constraint |
|---|---|
| C-01 | The server must be a single self-contained Go binary with no external runtime dependencies. |
| C-02 | Price data is stored in a flat JSON file (`prices.json`); no database is used in the v1 system. |
| C-03 | The ML prediction layer (`ml/`) is a batch process — it must not be invoked synchronously on the HTTP request path. |
| C-04 | The application must be deployable to Netlify (static export) or as a Docker container without code changes. |
| C-05 | All third-party scripts (Chart.js CDN) must be pinned to a specific version to prevent supply-chain attacks. |

---

## 4. Assumptions

| # | Assumption |
|---|---|
| A-01 | Users have a modern smartphone or desktop with a reasonably up-to-date browser. |
| A-02 | Price data is updated externally (manually or via a cron job) and the server is restarted or the service worker cache is invalidated to reflect new prices. |
| A-03 | The deployment will use HTTPS in production; PWA features (service worker, install prompt) will not function over plain HTTP except on `localhost`. |
| A-04 | The target user base reads English; localisation is out of scope for v1. |
| A-05 | Push notification and real-time price-alert delivery are out of scope for v1; alerts are visual only. |

---

*Last updated: February 2026 · [Project Repository](https://github.com/s23010843/go-project)*
