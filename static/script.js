let priceData = [];
let chart;

fetch('/api/prices')
    .then(response => response.json())
    .then(data => {
        priceData = data;
        displayPrices(priceData);
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