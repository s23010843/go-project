let priceData = [];
let chart;

// ── Toast notifications ─────────────────────────────────────────────────────
function showToast(msg, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
}

// ── Stats bar ───────────────────────────────────────────────────────────────
function updateStats(data) {
    const bar = document.getElementById('statsBar');
    if (!bar) return;
    if (!data || data.length === 0) { bar.hidden = true; return; }
    const prices  = data.map(d => d.price);
    const crops   = new Set(data.map(d => d.crop)).size;
    const markets = new Set(data.map(d => d.market)).size;
    const avg     = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    document.getElementById('statCrops').textContent   = crops;
    document.getElementById('statMarkets').textContent = markets;
    document.getElementById('statAvg').textContent     = '₹' + avg.toLocaleString('en-IN');
    document.getElementById('statHigh').textContent    = '₹' + Math.max(...prices).toLocaleString('en-IN');
    document.getElementById('statLow').textContent     = '₹' + Math.min(...prices).toLocaleString('en-IN');
    bar.hidden = false;
}

// ── Load prices (show skeleton while fetching) ──────────────────────────────
(function loadPrices() {
    const tbody = document.querySelector('#priceTable tbody');
    if (tbody) {
        tbody.innerHTML = Array(4).fill(0).map(() =>
            `<tr class="skeleton-row">${Array(3).fill('<td><span class="skeleton"></span></td>').join('')}</tr>`
        ).join('');
    }
    fetch('/prices.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            priceData = data;
            displayPrices(priceData);
            updateStats(priceData);
        })
        .catch(err => {
            console.error('Price data unavailable:', err);
            showToast('Could not load price data. Showing cached data if available.', 'error', 6000);
            const tb = document.querySelector('#priceTable tbody');
            if (tb) tb.innerHTML = `<tr><td colspan="3"><div class="empty-state"><div class="empty-state-icon">⚠️</div><p>Could not load prices.<br>Please check your connection and try refreshing.</p></div></td></tr>`;
        });
}());

// Chatbot UI handlers
function appendMessage(text, who="bot") {
    const win = document.getElementById('chatWindow');
    const msg = document.createElement('div');
    msg.className = `chat-message ${who}`;
    msg.innerText = text;
    win.appendChild(msg);
    win.scrollTop = win.scrollHeight;

    // Show unread dot on FAB when widget is closed and bot replies
    if (who === 'bot') {
        const fab = document.getElementById('chatFab');
        if (fab && !fab.classList.contains('is-open')) {
            fab.classList.add('has-unread');
        }
    }
}

function parseQuery(text) {
    // very small parser: look for crop and market words
    const t = text.toLowerCase();
    // find crop by matching available crops
    const crops = [...new Set(priceData.map(p => p.crop.toLowerCase()))];
    const markets = [...new Set(priceData.map(p => p.market.toLowerCase()))];

    let foundCrop = null;
    let foundMarket = null;

    for (const c of crops) if (t.includes(c)) { foundCrop = c; break; }
    for (const m of markets) if (t.includes(m)) { foundMarket = m; break; }

    return { crop: foundCrop, market: foundMarket };
}

let intents = [];

// Load intents from JSON and compile pattern strings into RegExp
fetch('/intents.json')
    .then(r => {
        if (!r.ok) throw new Error(`Failed to load intents (HTTP ${r.status})`);
        return r.json();
    })
    .then(data => {
        intents = data.map(intent => ({
            patterns: intent.patterns.map(p => new RegExp(p, 'i')),
            replies: intent.replies
        }));
    })
    .catch(err => console.error('Intents unavailable:', err));

function resolveReply(reply) {
    if (reply === '__CROPS__') {
        const crops = [...new Set(priceData.map(p => p.crop))].join(', ') || 'Wheat, Rice, Onion, Tomato';
        return `Available crops: ${crops}.`;
    }
    if (reply === '__MARKETS__') {
        const markets = [...new Set(priceData.map(p => p.market))].join(', ') || 'Central, North, South';
        return `Available markets: ${markets}.`;
    }
    return reply;
}

function matchIntent(text) {
    const t = text.toLowerCase();
    for (const intent of intents) {
        if (intent.patterns.some(rx => rx.test(t))) {
            const replies = intent.replies;
            const reply = replies[Math.floor(Math.random() * replies.length)];
            return resolveReply(reply);
        }
    }
    return null;
}

function respondTo(text) {
    const smallTalk = matchIntent(text);
    if (smallTalk) {
        appendMessage(smallTalk, 'bot');
        return;
    }

    const q = parseQuery(text);
    if (!q.crop && !q.market) {
        appendMessage("I'm not sure I understand. Try asking: 'price of Wheat in Central', or type 'help' for options.", 'bot');
        return;
    }

    const cropCap = q.crop ? q.crop.charAt(0).toUpperCase() + q.crop.slice(1) : null;
    const marketCap = q.market ? q.market.charAt(0).toUpperCase() + q.market.slice(1) : null;

    let matches = priceData.filter(p => {
        return (!q.crop || p.crop.toLowerCase() === q.crop) &&
               (!q.market || p.market.toLowerCase() === q.market);
    });

    if (matches.length === 0) {
        appendMessage("Sorry, I couldn't find a matching price. Try a different crop or market.", 'bot');
        return;
    }

    if (matches.length === 1) {
        const m = matches[0];
        appendMessage(`${m.crop} at ${m.market} is ₹${m.price}`, 'bot');
        return;
    }

    // multiple matches -> summarise
    const parts = matches.map(m => `${m.market}: ₹${m.price}`);
    appendMessage(`${cropCap} prices — ${parts.join(' · ')}`, 'bot');
}

function setupChat() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const fab = document.getElementById('chatFab');
    const widget = document.getElementById('chatWidget');
    const closeBtn = document.getElementById('chatCloseBtn');

    // Toggle open/close
    function openChat() {
        widget.classList.add('is-open');
        widget.setAttribute('aria-hidden', 'false');
        fab.classList.add('is-open');
        fab.classList.remove('has-unread');
        input.focus();
    }

    function closeChat() {
        widget.classList.remove('is-open');
        widget.setAttribute('aria-hidden', 'true');
        fab.classList.remove('is-open');
    }

    fab.addEventListener('click', () => {
        widget.classList.contains('is-open') ? closeChat() : openChat();
    });
    closeBtn.addEventListener('click', closeChat);

    // Send on Enter key
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendBtn.click();
    });

    sendBtn.addEventListener('click', () => {
        const val = input.value.trim();
        if (!val) return;
        appendMessage(val, 'user');
        respondTo(val);
        input.value = '';
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            btn.click();
        }
    });

    appendMessage('Hi — I can help with prices. Ask about a crop and optional market.', 'bot');
}

document.addEventListener('DOMContentLoaded', function () {
    setupChat();
    // Live search — filter as the user types
    const searchInput  = document.getElementById('searchInput');
    const marketSelect = document.getElementById('marketSelect');
    if (searchInput)  searchInput.addEventListener('input', filterPrices);
    if (marketSelect) marketSelect.addEventListener('change', filterPrices);
    // Allow Enter key in the alert price field
    const alertInput = document.getElementById('alertPrice');
    if (alertInput) alertInput.addEventListener('keydown', e => { if (e.key === 'Enter') setAlert(); });
});

function filterPrices() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const market = document.getElementById('marketSelect').value;

    const filtered = priceData.filter(item => {
        return item.crop.toLowerCase().includes(search) &&
               (market === "" || item.market === market);
    });

    displayPrices(filtered);
}

function displayPrices(data) {
    const tableBody = document.querySelector('#priceTable tbody');
    tableBody.innerHTML = '';
    const status = document.getElementById('filterStatus');

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3"><div class="empty-state"><div class="empty-state-icon">🌾</div><p>No crops match your search.<br>Try a different name or select a different market.</p></div></td></tr>`;
        if (status) status.textContent = 'No results found.';
        updateChart([]);
        updateStats([]);
        return;
    }

    const prices   = data.map(item => item.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    data.forEach(item => {
        const row = document.createElement('tr');
        if (item.price === maxPrice) row.classList.add('highest');
        if (item.price === minPrice) row.classList.add('lowest');
        row.innerHTML = `
            <td>${item.crop}</td>
            <td>${item.market}</td>
            <td>₹${item.price.toLocaleString('en-IN')}</td>
        `;
        tableBody.appendChild(row);
    });

    if (status) status.textContent = `Showing ${data.length} result${data.length !== 1 ? 's' : ''}.`;
    updateChart(data);
    updateStats(data);
}

function updateChart(data) {
    const ctx = document.getElementById("priceChart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.market),
            datasets: [{
                label: 'Price',
                data: data.map(item => item.price),
                backgroundColor: '#2e7d32'
            }]
        }
    });
}

function downloadCSV() {
    if (!priceData.length) {
        showToast('No price data available to download yet.', 'error');
        return;
    }
    let csv = 'Crop,Market,Price\n';
    priceData.forEach(item => {
        csv += `${item.crop},${item.market},${item.price}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'farm_prices.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ CSV downloaded successfully!');
}

function setAlert() {
    const input   = document.getElementById('alertPrice');
    const message = document.getElementById('alertMessage');
    const target  = input.value;

    if (!target || isNaN(target) || Number(target) < 0) {
        message.textContent = '⚠️ Please enter a valid price to set an alert.';
        return;
    }

    const formatted = Number(target).toLocaleString('en-IN');
    message.textContent = `✅ Alert set for ₹${formatted}. You'll be notified when a crop reaches this price.`;
    showToast(`🔔 Price alert set for ₹${formatted}`, 'success');
    input.value = '';
}

// ── PWA Install prompt ────────────────────────────────────────────────────
(function () {
    'use strict';
    let deferredPrompt = null;
    const btn = document.getElementById('installBtn');

    // Capture the prompt before the browser shows its own mini-infobar
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        if (btn) btn.hidden = false;   // reveal the button
    });

    if (btn) {
        btn.addEventListener('click', async function () {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('[PWA] Install outcome:', outcome);
            deferredPrompt = null;
            btn.hidden = true;         // hide after user responds
        });
    }

    // If the app is already installed, keep the button hidden
    window.addEventListener('appinstalled', function () {
        deferredPrompt = null;
        if (btn) btn.hidden = true;
    });
}());

// ── Bot eye-tracking ────────────────────────────────────────────────────────
// Each eye definition: SVG eye-socket centre (cx,cy), max pupil travel radius,
// and the IDs of the pupil + glint elements across both bot instances
// (FAB button = "fab", chat header = "hdr").
(function () {
    'use strict';

    const EYES = [
        {
            cx: 21, cy: 26, maxR: 1.4,
            pupils: ['bot-fab-pupil-l', 'bot-hdr-pupil-l'],
            glints:  ['bot-fab-glint-l', 'bot-hdr-glint-l'],
            glintBaseCx: 22.4, glintBaseCy: 25.6
        },
        {
            cx: 35, cy: 26, maxR: 1.4,
            pupils: ['bot-fab-pupil-r', 'bot-hdr-pupil-r'],
            glints:  ['bot-fab-glint-r', 'bot-hdr-glint-r'],
            glintBaseCx: 36.4, glintBaseCy: 25.6
        }
    ];

    function movePupils(e) {
        const mx = e.clientX, my = e.clientY;

        EYES.forEach(function (eye) {
            eye.pupils.forEach(function (pid, i) {
                const pupil = document.getElementById(pid);
                if (!pupil) return;
                const svg = pupil.closest('svg');
                if (!svg) return;

                const rect = svg.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return; // element is hidden

                // Convert the eye-socket centre to page coordinates
                const scaleX = rect.width  / 56;
                const scaleY = rect.height / 56;
                const eyePx  = rect.left + eye.cx * scaleX;
                const eyePy  = rect.top  + eye.cy * scaleY;

                // Direction from eye to mouse; clamp movement to maxR
                const dx   = mx - eyePx;
                const dy   = my - eyePy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                // Full rotation achieved when mouse is ≥ 60 px away from the eye
                const travel = eye.maxR * Math.min(1, dist / 60);
                const ox = dist > 0 ? (dx / dist) * travel : 0;
                const oy = dist > 0 ? (dy / dist) * travel : 0;

                pupil.setAttribute('cx', eye.cx + ox);
                pupil.setAttribute('cy', eye.cy + oy);

                // Glint follows at half the pupil offset (stays on the bright edge)
                const glint = document.getElementById(eye.glints[i]);
                if (glint) {
                    glint.setAttribute('cx', eye.glintBaseCx + ox * 0.5);
                    glint.setAttribute('cy', eye.glintBaseCy + oy * 0.5);
                }
            });
        });
    }

    document.addEventListener('mousemove', movePupils, { passive: true });
}());