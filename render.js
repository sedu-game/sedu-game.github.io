const canvas = document.querySelector('.myCanvas');
const ctx = canvas.getContext('2d');

function relToAbsPos(relPos, box) {
    return [box.offset.x + relPos.x*box.size.x/targetAspect, box.offset.y + relPos.y*box.size.y];
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function setAspect(vec, tAspect) {
    let currAspect = vec.x / vec.y;
    let newVec = {
        x: vec.x,
        y: vec.y
    }
    if (currAspect > tAspect) {
        newVec.x *= tAspect / currAspect;
    } else {
        newVec.y *= currAspect / tAspect;
    }
    return newVec;
}

function setOffsetBox(box, newVec, align) {
    return {
        offset: {
            x: box.offset.x + (box.size.x - newVec.x) * align[0],
            y: box.offset.y + (box.size.y - newVec.y) * align[1]
        },
        size: newVec
    };
}
const perSecs = 1;
const staminaMlt = 1000;
const scoreMlt = 100;
function renderMaxStaminaChart(box, ballGap) {
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.lineWidth = 1;
    ctx.rotate(-Math.PI/2);

    ctx.beginPath();
    let absPosTxt = relToAbsPos({ x: -0.02, y: 1.04 }, box);
    ctx.fillText("Max Stamina:", -absPosTxt[1]+22, absPosTxt[0]-25);
    ctx.lineTo(-absPosTxt[1]+85, absPosTxt[0]-42);
    for (let i = 1.04 - 100/box.size.y; i >= -ballGap; i -= 50/box.size.y) {
        absPosTxt = relToAbsPos({ x: -0.02, y: i }, box);
        if (Math.abs(i - ball.pos.y) > 0.03) {
            ctx.fillText((Math.round(perSecs * staminaMlt * getMaxStaminaVel(1, i))).toString(), -absPosTxt[1], absPosTxt[0]-25);
        }
        ctx.lineTo(-absPosTxt[1]+20, absPosTxt[0]-42);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.font = "bold 20px Arial";
    absPosTxt = relToAbsPos({ x: -0.02, y: ball.pos.y }, box);
    if (ball.pos.y < 1.04 - 80/box.size.y) {
        let currMSVel = perSecs * staminaMlt * getMaxStaminaVel(ball.pos.x, ball.pos.y);
        if (Math.abs(currMSVel) < 1) currMSVel = Math.round(currMSVel * 10) / 10;
        else currMSVel = Math.round(currMSVel);
        ctx.fillText(currMSVel.toString(), -absPosTxt[1], absPosTxt[0]-22);
    }
    ctx.beginPath();
    ctx.arc(-absPosTxt[1], absPosTxt[0]-42, 2, 0, 360, false);
    ctx.fill()

    ctx.rotate(Math.PI/2);
}
function renderScoreStaminaChart(box) {
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    let absPosTxt = relToAbsPos({ x: 0, y: 1.04 }, box);
    ctx.fillText("Score/" + perSecs + "s:", absPosTxt[0] + 20, absPosTxt[1] + 30);
    for (let i = 150/box.size.x + 0.05; i <= 2.1; i += 100/box.size.x) {
        absPosTxt = relToAbsPos({ x: i, y: 1.04 }, box);
        if (Math.abs(i - ball.pos.x) > 0.03) {
            ctx.fillText((Math.round(perSecs * scoreMlt * getScoreVel(i))).toString(), absPosTxt[0], absPosTxt[1] + 30);
        }
    }

    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.font = "bold 20px Arial";
    absPosTxt = relToAbsPos({ x: ball.pos.x, y: 1.04 }, box);
    if (ball.pos.x > 150/box.size.x + 0.02) {
        ctx.fillText((Math.round(perSecs * scoreMlt * getScoreVel(ball.pos.x))).toString(), absPosTxt[0], absPosTxt[1] + 34);
    }


    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.font = "bold 16px Arial";
    absPosTxt = relToAbsPos({ x: 0, y: 1.01 }, box);
    ctx.fillText("Stamina:", absPosTxt[0] + 20, absPosTxt[1] + 20);
    for (let i = 150/box.size.x + 0.05; i <= 2.1; i += 100/box.size.x) {
        absPosTxt = relToAbsPos({ x: i, y: 1.01 }, box);
        if (Math.abs(i - ball.pos.x) > 0.03) {
            ctx.fillText((Math.round(perSecs * staminaMlt * getStaminaVel(i))).toString(), absPosTxt[0], absPosTxt[1] + 20);
        }
    }
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 150/box.size.x + 0.02; i <= 2.07 + 100/box.size.x; i += 100/box.size.x) {
        absPosTxt = relToAbsPos({ x: i, y: 1.025 }, box);
        ctx.lineTo(absPosTxt[0], absPosTxt[1] + 19);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgb(255,0,0)';
    ctx.font = "bold 20px Arial";
    absPosTxt = relToAbsPos({ x: ball.pos.x, y: 1.01 }, box);
    if (ball.pos.x > 150/box.size.x + 0.02) {
        ctx.fillText((Math.round(perSecs * staminaMlt * getStaminaVel(ball.pos.x))).toString(), absPosTxt[0], absPosTxt[1] + 19);
    }
    ctx.beginPath();
    absPosTxt = relToAbsPos({ x: ball.pos.x, y: 1.025 }, box);
    if (ball.pos.x > 150/box.size.x + 0.02) {
        ctx.arc(absPosTxt[0], absPosTxt[1] + 19, 2, 0, 360, false);
    }
    ctx.fill();
}

let dust_img = new Image();
dust_img.src = 'dust.png';
let dust_r_img = new Image();
dust_r_img.src = 'dust_r.png';
let drawingDust = {
    time: 0,
    maxTime: 50
};

function render() {
    let width = window.innerWidth;
    canvas.style.width = width + "px";
    let height = window.innerHeight;
    canvas.style.height = height + "px";
    let scale = window.devicePixelRatio;
    canvas.width = scale*canvas.clientWidth;
    canvas.height = scale*canvas.clientHeight;
    ctx.scale(scale, scale);
    let windowBox = {
        offset: { x: 0, y: 0 },
        size: { x: width, y: height }
    }
    let fullVec = setAspect({
        x: width*0.95-50,
        y: height*0.9-50
    }, targetAspect);
    let gameBox = setOffsetBox(windowBox, fullVec, [0.5, 0.5]);

    let ballGap = ball.radius;
    let lineVec = {
        x: fullVec.x*(1-ballGap),
        y: fullVec.y*(1-ballGap)
    };
    let lineBox = setOffsetBox(gameBox, lineVec, [0.5, 1]);
    let lineWidth = lineBox.size.y * curveWidth;

    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0,0,width,height);

    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    if (currLevel < levels.length && levels[currLevel].target < ball.score) ctx.fillStyle = 'rgb(0,255,0)';
    ctx.fillText("Score: " + Math.round(scoreMlt*ball.score) + (currLevel < levels.length ? "/" + Math.round(scoreMlt*levels[currLevel].target) : ""), 10, 30);
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillText("Stamina: " + Math.round(staminaMlt*ball.stamina) + "/" + Math.round(staminaMlt*ball.maxStamina), 10, 60);
    if (newMaxScore) {
        ctx.fillStyle = 'rgb(255,0,0)';
    }
    ctx.textAlign = "right";
    ctx.fillText("Max Score: " + Math.round(scoreMlt*ball.maxScore), windowBox.size.x - 20, 30);
    ctx.fillStyle = 'rgb(255,255,255)';
    if (newAllTimeScore) {
        ctx.fillStyle = 'rgb(255,0,0)';
    }
    ctx.fillText("All Time: " + Math.round(scoreMlt*ball.maxScoreAllTime), windowBox.size.x - 20, 60);


    ctx.fillStyle = 'rgb(224,138,103)';
    ctx.beginPath();
    let absPosBall = relToAbsPos(ball.pos, lineBox);
    let radius = ball.radius * lineBox.size.y;
    ctx.arc(absPosBall[0], absPosBall[1], radius, 0, 360, false);
    ctx.fill();
    if (slipping.mag < 0.2) {
        drawingDust.time--;
    } else {
        drawingDust.time = drawingDust.maxTime;
        drawingDust.slip = slipping;
    }
    if (drawingDust.time > 0) {
        let slip = drawingDust.slip;
        //let dustPos = { x: ball.pos.x - slip.contact.x*ball.radius, y: ball.pos.y - slip.contact.y*ball.radius };
        let absPosDust = relToAbsPos(slip.contactPos, lineBox);
        let slipPositive = slip.dir.x > 0;
        let mirrorImg = slipPositive ? dust_r_img : dust_img;
        let angle = Math.atan2(slip.dir.y * (slipPositive ? 1 : -1), slip.dir.x * (slipPositive ? 1 : -1));
        ctx.save();
        ctx.translate(absPosDust[0] + slip.contact.x*mirrorImg.height/2, absPosDust[1] + slip.contact.y*mirrorImg.height/2);
        ctx.rotate(angle);
        ctx.globalAlpha = drawingDust.time/drawingDust.maxTime;
        ctx.drawImage(mirrorImg, -mirrorImg.width*slipPositive + (slipPositive ? -15 : 15) - slipPositive*mirrorImg.width*(1-drawingDust.time/drawingDust.maxTime), -mirrorImg.height/2*(2-drawingDust.time/drawingDust.maxTime),
            mirrorImg.width*(2-drawingDust.time/drawingDust.maxTime), mirrorImg.height*(2-drawingDust.time/drawingDust.maxTime));
        ctx.restore();
    }
    ctx.strokeStyle = 'rgb(121,70,46)';
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    let plusX = Math.cos(degToRad(ball.pos.r)) * radius;
    let plusY = Math.sin(degToRad(ball.pos.r)) * radius;
    ctx.lineTo(absPosBall[0]+plusX, absPosBall[1]+plusY);
    ctx.lineTo(absPosBall[0], absPosBall[1]);
    ctx.stroke();

    ctx.strokeStyle = 'white';
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let i = 0; i < curve.length; i++) {
        let absPosCurve = relToAbsPos(curve[i], lineBox);
        ctx.lineTo(absPosCurve[0], absPosCurve[1]);
    }
    //ctx.arc(200, 106, 50, degToRad(-45), degToRad(45), true);
    //ctx.lineTo(200,106);
    ctx.stroke();

    renderScoreStaminaChart(lineBox);
    renderMaxStaminaChart(lineBox, ballGap);
}

requestAnimationFrame(mainLoop);
//window.addEventListener('resize', render);