const runningState = {
    world: null,
    existingWallsCompositeId: 0
};

function handleBubbleClick(e, info) {
    // console.log(e.target);
    setModalContent(info);
    toggleModal(e, 'info-modal');
}

function setModalContent(info) {
    const modelConent = document.getElementById("modal-content");
    const content = `
    <div>
        <h3>${info.ticker}</h3>
        <p>Change percentage - ${info.changePercent}%</p>
    </div>
    `;
    modelConent.innerHTML = content;
}

function addBubbleDivs() {
    const bubbleContainer = document.getElementById("bubbleContainer");
    tickerData.forEach((tickerInfo, index) => {
        const bubbleDiv = createBubbleUI(tickerInfo, index);

        bubbleDiv.addEventListener("touchstart", (e) => handleBubbleClick(e, tickerInfo));
        bubbleDiv.addEventListener("click", (e) => handleBubbleClick(e, tickerInfo));

        bubbleContainer.appendChild(bubbleDiv);

        const bubbleRadius = tickerInfo.scaledRadius;
        const bubbleDiameter = bubbleRadius * 2;
        let bubbleHeight = bubbleDiameter;
        let bubbleWidth = bubbleDiameter;
        bubbleDiv.style.width = bubbleWidth;
        bubbleDiv.style.height = bubbleHeight;

        const shadowSize = bubbleRadius / 10;;
        if (tickerInfo.changePercent > 0) {
            bubbleDiv.style.boxShadow = `inset 0 0 ${shadowSize}px ${shadowSize}px #${POSITIVE_SHADOW_COLOR}`;
        } else {
            bubbleDiv.style.boxShadow = `inset 0 0 ${shadowSize}px ${shadowSize}px #${NEGATIVE_SHADOW_COLOR}`;
        }
    });
}

function createBubbleUI(tickerInfo, index) {
    const num = parseFloat(tickerInfo.changePercent, 10).toFixed(1);
    const changePercent = (num % 1 === 0) ? Math.round(num) : num;
    const edge = ((tickerInfo.scaledRadius * 2) / Math.sqrt(2)) * 0.9;

    const showTickerText = tickerInfo.scaledRadius > 35;

    const tickerContent = `
        <div class="ticker">${tickerInfo.ticker}</div>
        <div class="percent">${changePercent}%</div>
    `;

    const logoDimension = `${showTickerText ? '20%' : '55%'}`;
    const logoStyle = `style="width: ${logoDimension}; height: ${logoDimension}; border-radius: 50%;"`;

    const logoContent = `<img ${logoStyle} src="${tickerInfo.logo}" />`;

    const logoLetter = showTickerText ? '' : `<div class="logo-letter" ${logoStyle}><div class="fitty-letter">${tickerInfo.ticker.charAt(0)}</div></div>`;

    return htmlToElement(`<div class="bubble" id="bubble${index}" data-target="info-modal">
            ${tickerInfo.logo ? logoContent : logoLetter}
            <div class="bubble-content" style="width: ${edge}px;">
                <div class="fitty">${showTickerText ? tickerContent : ''}</div>
            </div>
        </div>`);
}

// add resize event listener
window.addEventListener('resize', () => {
    var canvasWidth = viewportSize.getWidth();
    var canvasHeight = viewportSize.getHeight();
    renderWallsUI(canvasWidth, canvasHeight);
    renderWallsMatterJs(runningState.world, canvasWidth, canvasHeight);
});

window.addEventListener('load', domLoaded);

function domLoaded() {
    const modeDropdown = document.getElementById("mode");
    mode = modeDropdown.value;
    modeDropdown.addEventListener("change", () => {
        mode = modeDropdown.value;
        start(mode);
    });

    setInterval(() => start(modeDropdown.value), REFRESH_INTERVAL);

    start(mode);
}

async function start(mode) {
    document.getElementById("bubbleContainer").innerHTML = ''

    await updateData(mode);

    var canvasWidth = viewportSize.getWidth();
    var canvasHeight = viewportSize.getHeight();

    tickerData = tickerData.map((item) => ({
        ...item,
        radius: getNormalizedRadius(item, tickerData)
    }));

    const scale = getScale(tickerData, canvasWidth, canvasHeight);

    tickerData = tickerData.map(item => ({
        ...item,
        scaledRadius: getScaledRadius(item, scale)
    }));

    addBubbleDivs();

    fitty('.fitty');

    const engine = Matter.Engine.create();
    runningState.world = engine.world;
    engine.gravity.y = 0;

    const bubbles = [];
    const bubblesBodies = [];

    for (let i = 0; i < tickerData.length; i++) {
        const bubbleId = `bubble${i}`;
        const bubbleRadius = tickerData[i].scaledRadius;
        const bubbleDiameter = bubbleRadius * 2;
        let bubbleX = getRandomIntInRange(bubbleDiameter, canvasWidth - bubbleDiameter - 100);
        let bubbleY = getRandomIntInRange(bubbleDiameter, canvasHeight - bubbleDiameter - 100);
        const bubble = {
            body: Matter.Bodies.circle(bubbleX, bubbleY, bubbleRadius,
                {
                    density: (1 / bubbleRadius) * 800,
                }),
            elem: document.getElementById(bubbleId),
            render() {
                const { x, y } = this.body.position;
                this.elem.style.top = `${y - bubbleRadius}px`;
                this.elem.style.left = `${x - bubbleRadius}px`;

                // get weight of body
                // const weight = this.body.mass * this.body.density;
                // console.log(weight);

                applyRandomForce(this.body);
                limitMaxVelocity(this.body);
            }
        };

        bubbles.push(bubble);
        Matter.Body.setInertia(bubble.body, Infinity);
        bubblesBodies.push(bubble.body);
    }

    const mouse = Matter.Mouse.create(document.getElementById('physicalWorld'));
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.0001,
            render: {
                visible: false
            }
        }
    });

    renderWallsMatterJs(runningState.world, canvasWidth, canvasHeight);

    Matter.Composite.add(
        engine.world, [...bubblesBodies, mouseConstraint]
    );

    (function rerender() {
        bubbles.forEach(bubble => {
            bubble.render();
        });

        Matter.Engine.update(engine);
        requestAnimationFrame(rerender);
    })();
};