function applyRandomForce(body) {
    const fx = getRandomIntInRange(0, 3) * getRandomFromArray(SIGN);
    const fy = getRandomIntInRange(0, 3) * getRandomFromArray(SIGN);
    
    Matter.Body.applyForce(body, body.position, {x: fx, y: fy});
}

function limitMaxVelocity(body) {
    let vx = body.velocity.x;
    let vy = body.velocity.y;
    const signx = vx > 0 ? 1 : -1;
    const signy = vy > 0 ? 1 : -1;

    if(Math.abs(vx) > MAX_VELOCITY) {
        vx = signx * MAX_VELOCITY;
    }

    if(Math.abs(vy) > MAX_VELOCITY) {
        vy = signy * MAX_VELOCITY;
    }

    Matter.Body.setVelocity(body, {x: vx, y: vy});
}
             
function useMatterJSRender(engine, canvasWidth, canvasHeight) {
    var render = Matter.Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: canvasWidth,
            height: canvasHeight,
            wireframes: false
        }
    });

    var runner = Matter.Runner.create();

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);
}

function renderWallsUI(canvasWidth, canvasHeight) {
    canvasWidth = canvasWidth - 10;
    canvasHeight = canvasHeight - 10;
    console.log("rendering walls");
    var topWall = document.getElementById('topWall');
    var bottomWall = document.getElementById('bottomWall');
    var leftWall = document.getElementById('leftWall');
    var rightWall = document.getElementById('rightWall');

    topWall.style.top = 0;
    topWall.style.left = 0;
    topWall.style.width = canvasWidth;
    topWall.style.height = WALL_WIDTH;

    bottomWall.style.top = canvasHeight - WALL_WIDTH;
    bottomWall.style.left = 0;
    bottomWall.style.width = canvasWidth;
    bottomWall.style.height = WALL_WIDTH;

    leftWall.style.top = 0;
    leftWall.style.left = 0;
    leftWall.style.width = WALL_WIDTH;
    leftWall.style.height = canvasHeight;

    rightWall.style.top = 0;
    rightWall.style.left = canvasWidth - WALL_WIDTH;
    rightWall.style.width = WALL_WIDTH;
    rightWall.style.height = canvasHeight;
}

function renderWallsMatterJs(world, canvasWidth, canvasHeight) {
    const width = (canvasWidth);
    const height = (canvasHeight);
    const posX = width / 2;
    const posY = height / 2;
    const wallOption = {
        isStatic: true,
        render: {
            fillStyle: 'red',
        }
    }
    var topWall = Matter.Bodies.rectangle(posX, 0, width, WALL_WIDTH * 2, {
        isStatic: true,
        render: {
            fillStyle: 'red',
        }
    });
    var bottomWall = Matter.Bodies.rectangle(posX, canvasHeight - WALL_WIDTH, width, WALL_WIDTH, {
        isStatic: true,
        render: {
            fillStyle: 'blue',
        }
    });
    var leftWall = Matter.Bodies.rectangle(0, posY, WALL_WIDTH, height, {
        isStatic: true,
        render: {
            fillStyle: 'green',
        }
    });
    var rightWall = Matter.Bodies.rectangle(canvasWidth - WALL_WIDTH, posY, WALL_WIDTH, height, {
        isStatic: true,
        render: {
            fillStyle: 'yellow',
        }
    });

    let existingWallsComposite;
    if (runningState.existingWallsCompositeId) {
        existingWallsComposite = Matter.Composite.get(world, runningState.existingWallsCompositeId, "composite");
    }

    const newWallComposite = Matter.Composite.create();
    Matter.Composite.add(newWallComposite, [topWall, bottomWall, leftWall, rightWall]);
    Matter.World.add(world, [newWallComposite]);
    runningState.existingWallsCompositeId = newWallComposite.id;

    if (existingWallsComposite) {
        Matter.Composite.remove(world, existingWallsComposite);
    }

    // TODO : Translate all bodies that are outside walls to be inside walls
}