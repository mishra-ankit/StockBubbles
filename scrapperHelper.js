let tickerData = [];

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
            changePercent: parseFloat(changePercent.substring(0, changePercent.length - 1)),
            radius: parseFloat(changePercent),
            logo
        });
    }

    // remove impactical changePercent
    return data.filter(i => i.changePercent < 10000);
}