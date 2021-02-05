let curve = [
    {x: -0.025, y: 0.25},
    {x: 0.025, y: 0.25},
    {x: 0.15, y: 0.2},
    {x: 0.3, y: 0.07},
    {x: 0.6, y: 0.},
    {x: 0.9, y: 0.1},
    {x: 1.2, y: 0.175},
    {x: 1.5, y: 0.3},
    {x: 1.7, y: 0.5},
    {x: 2., y: 1.}
]
const curveWidth = 0.01;
const targetAspect = 18/9;
const centerPoint = 0.6;

/*curve = [
    {x: 0., y: 0.1},
    {x: 0.65-0.075-0.005-1.5*curveWidth, y: 0.},
    {x: 0.65-0.075-1.5*curveWidth, y: 0.5},
    {x: 0.65+0.075+0.47+1.5*curveWidth, y: 0.51},
    {x: 0.65+0.075+0.47+0.005+1.5*curveWidth, y: 0.},
    {x: 1.5, y: 0.3},
    {x: 1.7, y: 0.5},
    {x: 2., y: 1.}
]*/

let currLevel = 1;
levels = [
    { target: 0, maxMaxStamina: 1 },
    { target: 37, maxMaxStamina: 1.2 },
    { target: 65, maxMaxStamina: 1.4 },
    { target: 110, maxMaxStamina: 1.8 },
    { target: 200, maxMaxStamina: 2.1 },
    { target: 1000, maxMaxStamina: 5 },
];

const scale = 0.1;
const fixedDt = 1/60;
let newMaxScore = false;
let newAllTimeScore = false;

let slipping = {
    mag: 0
};
let ball = {
    pos: {
        x: -0.025,
        y: 0,
        r: 0
    },
    radius: 0.075,
    mass: 1,
    bounciness: 0.5,
    friction: 0.5,
    velocity: {
        x: 0,
        y: 0,
        r: 0
    },
    stamina: 0.5,
    maxStamina: 1,
    maxMaxStamina: 1,
    score: 0,
    maxScore: 0,
    maxScoreAllTime: 0,
    scoreMlt: 1
};
function getScoreVel(xPos) {
    return xPos < 0 ? 0 : xPos*xPos*ball.scoreMlt;
}
function getStaminaVel(xPos) {
    return (centerPoint - xPos) * (xPos < centerPoint ? 0.4 : 0.1);
}
function getMaxStaminaVel(xPos, yPos) {
    return xPos < 0 ? 0 : (yPos - (0.25 - ball.radius - 0.5*curveWidth)) * (yPos > (0.25 - ball.radius - 0.5*curveWidth) ? 0.01 : 0.05);
}

save_object = function (name, obj) {
    localStorage.setItem(name, JSON.stringify(obj));
}
load_object = function (name) {
    let value = localStorage.getItem(name);
    return value && JSON.parse(value);
}
function openFullscreen() {
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.webkitRequestFullscreen) { /* Safari */
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) { /* IE11 */
    canvas.msRequestFullscreen();
  }
}
function handleKeyCommands(e) {
    switch (e.key) {
        case "r":
            reset();
            break;
        case "e":
            ball.maxScoreAllTime = 0;
            save_object("HighScore", ball.maxScoreAllTime);
            break;
        case "q":
            ball.radius = Math.max(0.01, ball.radius - 0.005);
            break;
        case "w":
            ball.radius += 0.01;
            break;
        case "a":
            ball.maxMaxStamina -= 0.01;
            ball.maxStamina -= 0.01;
            break;
        case "s":
            ball.maxMaxStamina += 0.01;
            ball.maxStamina += 0.01;
            break;
        case "z":
            ball.maxMaxStamina -= 0.1;
            ball.maxStamina -= 0.1;
            break;
        case "x":
            ball.maxMaxStamina += 0.1;
            ball.maxStamina += 0.1;
            break;
    }
}
let pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.key] = false; };
window.onkeydown = function(e) { pressedKeys[e.key] = true; handleKeyCommands(e); };
function touchHandle(e) {
    openFullscreen();
    if (e.touches[0].pageX < window.innerWidth / 2) {
        pressedKeys["ArrowLeft"] = true;
        pressedKeys["ArrowRight"] = false;
    } else {
        pressedKeys["ArrowLeft"] = false;
        pressedKeys["ArrowRight"] = true;
    }
}
window.ontouchstart = touchHandle;
window.ontouchmove = touchHandle;
window.ontouchend = function() {
    pressedKeys["ArrowLeft"] = false;
    pressedKeys["ArrowRight"] = false;
}
function getInputForce() {
    let force = {
        pos: { x: 0, y: -ball.radius },
        vec: { x: 0, y: 0 }
    }
    if (!(pressedKeys["ArrowLeft"] && pressedKeys["ArrowRight"])) {
        if (pressedKeys["ArrowLeft"]) {
            force.vec.x = -ball.stamina;// /ball.radius;
        } else if (pressedKeys["ArrowRight"]) {
            force.vec.x = ball.stamina;// /ball.radius;
        }
    }
    return forceAtPosToAccel(force);
}

function forceAtPosToAccel (force) {
    if (force.pos.x === 0 && force.pos.y === 0) {
        return { x: force.vec.x, y: force.vec.y, r: 0 }
    }
    let posNorm = normalise(force.pos);
    let vecAlign = dot(posNorm, force.vec);

    let posRotNorm = { x: -force.pos.y, y: +force.pos.x };
    let perpendicular = dot(posRotNorm, force.vec);
    return {
        x: posNorm.x * vecAlign,
        y: posNorm.y * vecAlign,
        r: perpendicular
    }
}

function addAccel(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        r: a.r + b.r
    };
}
function applyAccel(vel, accel, dt) {
    return {
        x: vel.x + accel.x * dt / ball.mass,
        y: vel.y + accel.y * dt / ball.mass,
        r: vel.r + accel.r * dt / (ball.mass * ball.radius * ball.radius) * 57.2957795131
    };
}

function toSeg(point, seg1, seg2) {
    let AB = {
        x: point.x - seg1.x,
        y: point.y - seg1.y
    };
    let CD = {
        x: seg2.x - seg1.x,
        y: seg2.y - seg1.y
    };

    let dotProd = dot(AB, CD);
    let len_sq = CD.x * CD.x + CD.y * CD.y;
    let param = -1;
    if (len_sq !== 0) //in case of 0 length line
        param = dotProd / len_sq;

    let xx, yy;

    if (param < 0) {
        xx = seg1.x;
        yy = seg1.y;
    }
    else if (param > 1) {
        xx = seg2.x;
        yy = seg2.y;
    }
    else {
        xx = seg1.x + param * CD.x;
        yy = seg1.y + param * CD.y;
    }

    return {
        x: point.x - xx,
        y: point.y - yy
    };
}
function magnitude(a) {
    return Math.sqrt(a.x*a.x + a.y*a.y);
}
function dot(a, b) {
    return (a.x * b.x) + (a.y * b.y);
}
function normalise(a) {
    let mag = magnitude(a);
    return {
        x: a.x / mag,
        y: a.y / mag
    };
}
function add_vec(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}
function getPostCollisionVel(vel, accel, dt) {
    let collisions = [];
    for (let i = 0; i < curve.length-1; i++) {
        let normal = toSeg(ball.pos, curve[i], curve[i+1]);
        let dist = magnitude(normal);
        if (dist < (ball.radius + 0.5*curveWidth)) {
            let correction = (ball.radius + 0.5*curveWidth) - dist;
            ball.pos.x += normal.x * correction;
            ball.pos.y += normal.y * correction;
            let normNormal = {
                x: normal.x / dist,
                y: normal.y / dist
            }
            collisions.push(normNormal);
        }
    }
    slipping = {
        mag: 0
    };
    if (collisions.length === 0) return applyAccel(vel, accel, dt);
    let normal = { x: 0, y: 0 };
    for (let i = 0; i < collisions.length; i++) {
        normal = add_vec(normal, collisions[i]);
    }
    normal = normalise(normal);

    let velInto = -dot(vel, normal);
    if (velInto > 0) {
        vel = {
            x: vel.x + normal.x * velInto,
            y: vel.y + normal.y * velInto,
            r: vel.r
        }
    }

    let accelInto = -dot(accel, normal);
    if (accelInto > 0) {
        let normalRight = {
            x: -normal.y,
            y: +normal.x
        }
        let accelSurf = dot(accel, normalRight);
        let maxFriction = {
            x: -normalRight.x * accelSurf,
            y: -normalRight.y * accelSurf
        }
        let maxFrictionMag = magnitude(maxFriction);
        let frictionForce = accelInto * ball.friction;
        let currFrictionRatio = frictionForce / maxFrictionMag;
        if (currFrictionRatio < 1) {
            maxFriction.x *= currFrictionRatio;
            maxFriction.y *= currFrictionRatio;
        }

        let normAgainst = {
            x: accelInto * normal.x,
            y: accelInto * normal.y
        };
        let normFrictionAccel = forceAtPosToAccel({
            pos: { x: -normal.x * ball.radius, y: -normal.y * ball.radius },
            vec: {
                x: normAgainst.x + maxFriction.x,
                y: normAgainst.y + maxFriction.y
            }
        });
        accel = addAccel(accel, normFrictionAccel);

        let surfaceVelocity = (vel.r / 360) * 2 * Math.PI * ball.radius;
        let velAccordingToRot = {
            x: normalRight.x * surfaceVelocity,
            y: normalRight.y * surfaceVelocity
        }
        let velDifference = {
            x : velAccordingToRot.x - vel.x,
            y : velAccordingToRot.y - vel.y
        }
        slipping = {
            mag: magnitude(velDifference) + (dot(velAccordingToRot, vel) < 0 ? 0.8 : 0),
            contactPos: { x: ball.pos.x - normal.x*ball.radius, y: ball.pos.y - normal.y*ball.radius },
            contact: normal,
            dir: velDifference
        };
        let rotAccel = forceAtPosToAccel({
            pos: { x: 0, y: 0 },
            vec: {
                x: velDifference.x * ball.friction * 5 * accelInto,
                y: velDifference.y * ball.friction * 5 * accelInto
            }
        });
        let rotDeceleration = forceAtPosToAccel({
            pos: { x: -normal.x * ball.radius, y: -normal.y * ball.radius },
            vec: {
                x: velDifference.x * ball.friction * 5 * accelInto,
                y: velDifference.y * ball.friction * 5 * accelInto
            }
        });
        accel = addAccel(accel, rotAccel);
        accel = addAccel(accel, rotDeceleration);
    }
    return applyAccel(vel, accel, dt);
}

function physics(dt) {
    let accel = forceAtPosToAccel({
        pos: { x: 0, y: 0 },
        vec: { x: 0, y: 9.807*ball.mass*scale }
    });
    accel = addAccel(accel, getInputForce());
    //ball.velocity = applyAccel(ball.velocity, accel, dt);
    ball.velocity = getPostCollisionVel(ball.velocity, accel, dt);
    ball.pos.x += ball.velocity.x * dt;
    ball.pos.y += ball.velocity.y * dt;
    ball.pos.r += ball.velocity.r * dt;
    if (ball.pos.y > 1) {
        reset();
        return;
    }
    ball.maxStamina = Math.max(0, Math.min(ball.maxMaxStamina, ball.maxStamina + getMaxStaminaVel(ball.pos.x, ball.pos.y) * dt));
    ball.stamina = Math.max(0, Math.min(ball.maxStamina, ball.stamina + getStaminaVel(ball.pos.x) * dt));
    ball.score += getScoreVel(ball.pos.x) * dt;
    if (ball.score > 0) {
        newMaxScore = false;
        newAllTimeScore = false;
    }
    if (ball.score > ball.maxScore) {
        ball.maxScore = ball.score;
        newMaxScore = true;
    }
}

function reset() {
    if (currLevel < levels.length && ball.score > levels[currLevel].target) {
        ball.maxMaxStamina = levels[currLevel].maxMaxStamina;
        currLevel++;
    }
    ball.pos = { x: -0.025, y: 0, r: 0 };
    ball.velocity = { x: 0, y: 0, r: 0 };
    ball.stamina = ball.maxMaxStamina/2;
    ball.maxStamina = ball.maxMaxStamina;
    let allTimeHigh = load_object("HighScore");
    if (allTimeHigh !== null) {
        if (allTimeHigh < ball.maxScore) {
            newAllTimeScore = true;
            allTimeHigh = ball.maxScore;
            save_object("HighScore", allTimeHigh);
        }
        ball.maxScoreAllTime = allTimeHigh;
    } else {
        allTimeHigh = 0;
        save_object("HighScore", allTimeHigh);
    }
    ball.score = 0;
}

let lastFrameTime;
function mainLoop(time) {
    if (lastFrameTime !== undefined) {
        physics((time - lastFrameTime) / 1000);
    } else {
        reset();
    }
    lastFrameTime = time;
    render();
    requestAnimationFrame(mainLoop);
}