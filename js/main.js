const ANGLE_SPEED = 0.3;
const DRAG_SPEED = 0.006;
const X_FILL = 1;
const Y_FILL = 0.65;
const HEIGHT_RATIO = 0.18;
const TIME_STEP_MAX = 0.1;
const SIZE_MAX = 1500;
const GEN_RATE = 1 / 60;
const PLAN_PERCENTAGE = 0.1;

const lighting = new Lighting();
const island = new Island(lighting);
const loader = new Loader(document.getElementById("loader"));
const canvasWrapper = document.getElementById("canvas-wrapper");
const canvasWebgl = document.getElementById("renderer-webgl");
const canvas2d = document.getElementById("renderer-2d");
const divRenderer = document.getElementById("div-renderer");
const renderer = new Renderer(canvas2d, canvasWebgl, divRenderer);
let lastDate = new Date();
let plan = null;
let size = 0;
let height = 0;
let angle = Math.PI * 0.5;
let pitch = 0.4;
let scale = 2;
let angleDelta = 0;
let updated = false;
let dragging = false;
let xDrag = 0;

if (!renderer.supportsWebGL) {
    const webGlOption = document.getElementById("option-webgl");

    webGlOption.parentElement.removeChild(webGlOption);
}

const updateParameters = () => {
    size = Math.min(SIZE_MAX, Math.min(
        Math.floor(canvas2d.width * X_FILL / scale),
        Math.floor((canvas2d.height * Y_FILL / pitch) / scale)));
    height = Math.ceil(size * HEIGHT_RATIO);
    updated = true;
};

const resize = () => {
    canvas2d.width = canvasWebgl.width = canvasWrapper.offsetWidth;
    canvas2d.height = canvasWebgl.height = canvasWrapper.offsetHeight;
    divRenderer.style.width = canvas2d.width + "px";
    divRenderer.style.height = canvas2d.height + "px";

    renderer.resize(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);

    updateParameters();
};

const update = timeStep => {
    if (plan && !plan.isReady()) {
        loader.update(plan.generate(GEN_RATE) * PLAN_PERCENTAGE);

        if (plan.isReady()) {
            island.setPlan(plan);
        }
    }
    else if (!island.isReady()) {
        loader.update(PLAN_PERCENTAGE+ island.generate(GEN_RATE) * (1 - PLAN_PERCENTAGE));

        if (island.isReady()) {
            updated = true;

            renderer.update(island);
        }
    }

    if (updated || (!dragging && angleDelta !== 0)) {
        if (!dragging && angleDelta !== 0)
            if ((angle += timeStep * angleDelta) > Math.PI + Math.PI)
                angle -= Math.PI + Math.PI;
            else if (angle < 0)
                angle += Math.PI + Math.PI;

        if (plan.isReady() && island.isReady())
            renderer.render(angle, pitch, scale);

        updated = false;
    }
};

const loopFunction = () => {
    const date = new Date();

    update(Math.min(TIME_STEP_MAX, (date - lastDate) * 0.001));
    requestAnimationFrame(loopFunction);

    lastDate = date;
};

const replan = () => {
    loader.update(0);
    plan = new Plan(size, height, 1 / scale, lighting);
};

const mouseDown = (x, y, drag) => {
    if (drag) {
        xDrag = x;
        dragging = true;
        angleDelta = 0;
    }
    else
        replan();
};

const mouseUp = touch => {
    dragging = false;

    if (updated && !touch)
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

canvas2d.addEventListener("mousedown", event =>
    mouseDown(event.clientX, event.clientY, event.button === 0));
canvas2d.addEventListener("touchstart", event =>
    mouseDown(event.touches[0].clientX, event.touches[0].clientY, true));
canvas2d.addEventListener("mousemove", event =>
    mouseMove(event.clientX, event.clientY));
canvas2d.addEventListener("touchmove", event =>
    mouseMove(event.touches[0].clientX, event.touches[0].clientY));
canvas2d.addEventListener("mouseup", event =>
    mouseUp(false));
canvas2d.addEventListener("touchend", event =>
    mouseUp(true));

requestAnimationFrame(loopFunction);
resize();
replan();