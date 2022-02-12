let tickerData = [];

function getNormalizedRadius(item, data) {
    // find the 50th percentile
    const median = data.map(x => x.changePercent).sort((a, b) => a - b)[Math.floor(data.length / 2)];

    // find the inter quartile range
    const q1 = data.map(x => x.changePercent).sort((a, b) => a - b)[Math.floor(data.length / 4)];
    const q3 = data.map(x => x.changePercent).sort((a, b) => a - b)[Math.floor(data.length * 3 / 4)];
    const iqr = q3 - q1;

    const changePercent = Math.abs(item.changePercent);
    let normlialized = (((changePercent - median) / iqr));// * (MAX_RADIUS - MIN_RADIUS)) + MIN_RADIUS;
    // normlialized = normlialized ? normlialized : MIN_RADIUS;

    return normlialized;
}

async function updateData(mode) {
    if(mode === TOP_GAINERS) {
        tickerData = await getData(TOP_GAINERS_URL);
    } else if(mode === TOP_LOOSERS) {
        tickerData = await getData(TOP_LOOSERS_URL);
    } else if(mode === BOTH5050) {
        const topGainers = (await getData(TOP_GAINERS_URL)).slice(0, 50);
        const topLosers = (await getData(TOP_LOOSERS_URL)).slice(0, 50);
        tickerData = topGainers.concat(topLosers);
    }
}

async function getData(url) {
    const cors_proxy = "https://cors-apni.herokuapp.com/";
    const data = [];

    var headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');

    let response = await fetch(`${cors_proxy}${url}`, {
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
    return data;
}