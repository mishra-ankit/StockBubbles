function getRandomFromArray(arr) {
    var random = Math.floor(Math.random() * arr.length);
    return arr[random];
}

function getRandomIntInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function getNormalizedRadius(item, data) {
    // https://machinelearningmastery.com/robust-scaler-transforms-for-machine-learning/
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

function getScale(tickerData, screenWidth, screenHeight) {
    const availableArea = screenWidth * screenHeight;
    const targetFreeArea = availableArea * TARGET_FREE_AREA_FRACTION;
    let currentCircleArea = 0;
    for (let i = 0; i < tickerData.length; i++) {
        currentCircleArea += Math.PI * Math.pow(tickerData[i].radius, 2);
    }
    var targetCircleArea = availableArea - targetFreeArea;
    var scale = targetCircleArea / currentCircleArea;
    scale = Math.sqrt(scale);
    if (scale > MAX_SCALE) {
        scale = MAX_SCALE;
    }
    if (scale < MIN_SCALE) {
        scale = MIN_SCALE;
    }

    return scale
}

function getScaledRadius(item, scale) {
    var scaledRadius = item.radius * scale;
    if(scaledRadius < MIN_RADIUS) {
        scaledRadius = MIN_RADIUS;
    }
    if(scaledRadius > MAX_RADIUS) {
        scaledRadius = MAX_RADIUS;
    }
    return scaledRadius;
}

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
 function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}