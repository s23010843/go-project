let priceData = [];
let chart;

// Load prices from the repo's static file
fetch('/prices.json')
    .then(response => {
        if (!response.ok) throw new Error(`Failed to load prices (HTTP ${response.status})`);
        return response.json();
    })
    .then(data => {
        priceData = data;
        displayPrices(priceData);
    })
    .catch(err => {
        console.error('Price data unavailable:', err);
        const table = document.getElementById('priceTable');
        if (table) table.innerHTML = '<tr><td colspan="3">Could not load price data.</td></tr>';
    });

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

document.addEventListener('DOMContentLoaded', setupChat);

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
    const tableBody = document.querySelector("#priceTable tbody");
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='3'>No data found</td></tr>";
        return;
    }

    let prices = data.map(item => item.price);
    let maxPrice = Math.max(...prices);
    let minPrice = Math.min(...prices);

    data.forEach(item => {
        const row = document.createElement("tr");

        if (item.price === maxPrice) row.classList.add("highest");
        if (item.price === minPrice) row.classList.add("lowest");

        row.innerHTML = `
            <td>${item.crop}</td>
            <td>${item.market}</td>
            <td>${item.price}</td>
        `;

        tableBody.appendChild(row);
    });

    updateChart(data);
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
    let csv = "Crop,Market,Price\n";
    priceData.forEach(item => {
        csv += `${item.crop},${item.market},${item.price}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "farm_prices.csv";
    a.click();
}

function setAlert() {
    const target = document.getElementById("alertPrice").value;
    const message = document.getElementById("alertMessage");

    if (!target) {
        message.innerText = "Please enter a price.";
        return;
    }

    message.innerText = `Alert set for ₹${target} (Simulation only).`;
}