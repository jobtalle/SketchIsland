const ANGLE_SPEED = 0.3;
const DRAG_SPEED = 0.006;
const X_FILL = 1;
const HEIGHT_RATIO = 0.18;

const lighting = new Lighting();
const wrapper = document.getElementById("wrapper");
const canvas = document.getElementById("renderer");
let lastDate = new Date();
let island = null;
let size = 0;
let height = 0;
let angle = 0;
let angleDelta = ANGLE_SPEED;
let updated = false;
let dragging = false;
let xDrag = 0;
let timeStepLast = 0;

const resize = () => {
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    size = Math.floor(canvas.width * X_FILL / Island.SCALE);
    height = Math.ceil(size * HEIGHT_RATIO);
    island = new Island(size, lighting, new Plan(size, height));
    updated = true;
};

const update = timeStep => {
    const context = canvas.getContext("2d");

    //island.update(Math.min(timeStep, TIME_STEP_MAX));

    if (updated || (!dragging && angleDelta !== 0)) {
        context.imageSmoothingEnabled = true;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(canvas.width * 0.5, canvas.height * 0.5);

        if (!dragging && angleDelta !== 0)
            if ((angle += timeStep * angleDelta) > Math.PI + Math.PI)
                angle -= Math.PI + Math.PI;
            else if (angle < 0)
                angle += Math.PI + Math.PI;

        island.draw(context, angle);

        context.restore();

        updated = false;
    }

    timeStepLast = timeStep;
};

const loopFunction = () => {
    const date = new Date();

    update((date - lastDate) * 0.001);
    requestAnimationFrame(loopFunction);

    lastDate = date;
};

const mouseDown = (x, y, drag) => {
    if (drag) {
        xDrag = x;
        dragging = true;
        angleDelta = 0;
    }
    else {
        island.setPlan(new Plan(size, height));
        updated = true;
    }
};

const mouseUp = () => {
    dragging = false;

    if (updated)
        angleDelta = ANGLE_SPEED * Math.sign(angleDelta);
    else
        angleDelta = 0;
};

const mouseMove = (x, y) => {
    if (dragging) {
        angleDelta = (xDrag - x) * DRAG_SPEED;
        angle += angleDelta;
        xDrag = x;
        updated = true;
    }
};

window.onresize = resize;

canvas.addEventListener("mousedown", event =>
    mouseDown(event.clientX, event.clientY, event.button === 0));
canvas.addEventListener("touchstart", event =>
    mouseDown(event.touches[0].clientX, event.touches[0].clientY, true));
canvas.addEventListener("mousemove", event =>
    mouseMove(event.clientX, event.clientY));
canvas.addEventListener("touchmove", event =>
    mouseMove(event.touches[0].clientX, event.touches[0].clientY));
canvas.addEventListener("mouseup", event =>
    mouseUp());
canvas.addEventListener("touchend", event =>
    mouseUp());

resize();
requestAnimationFrame(loopFunction);