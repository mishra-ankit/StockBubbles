let tickerData = [];

function getNormalizedRadius(item, data) {
    const max = Math.abs(data[0].changePercent);
    const min = Math.abs(data[data.length - 1].changePercent);
    const changePercent = Math.abs(item.changePercent);

    let normlialized = (((changePercent - min) / (max - min)) * (MAX_RADIUS - MIN_RADIUS)) + MIN_RADIUS;
    normlialized = normlialized ? normlialized : MIN_RADIUS;
    return normlialized;
}

async function updateData() {
    const cors_proxy = "https://cors-apni.herokuapp.com/";
    const data = [];

    var headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    let response = await fetch(`${cors_proxy}https://www.tradingview.com/markets/stocks-usa/market-movers-gainers/`, {
        method: 'GET',
        headers,
    }).then(response => response.text());

    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    const container = doc.getElementById("js-screener-container");
    const table = container.getElementsByTagName("table")[0];
    const tableBody = table.getElementsByTagName("tbody")[0];
    const tableRows = tableBody.getElementsByTagName("tr");

    for (let i = 0; i < tableRows.length; i++) {
        const tableRow = tableRows[i];
        const tableData = tableRow.getElementsByTagName("td");
        const stockInfo = tableData[0];
        const ticker = stockInfo.getElementsByTagName("a")[0].innerText;
        const logo = stockInfo.getElementsByTagName('img').length ? stockInfo.getElementsByTagName('img')[0].src : null;

        const changePercent = tableData[2].innerText;

        data.push({
            ticker,
            changePercent: changePercent.substring(0, changePercent.length - 1),
            radius: changePercent,
            logo
        });
    }
    tickerData = data;
}