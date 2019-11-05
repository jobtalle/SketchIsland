const ANGLE_SPEED = 0.3;
const DRAG_SPEED = 0.006;
const X_FILL = 1;
const Y_FILL = 0.75;
const HEIGHT_RATIO = 0.18;
const TIME_STEP_MAX = 0.1;

const island = new Island(new Lighting());
const loader = new Loader(document.getElementById("loader"));
const canvasWrapper = document.getElementById("canvas-wrapper");
const canvasWebgl = document.getElementById("renderer-webgl");
const canvas2d = document.getElementById("renderer-2d");
const divRenderer = document.getElementById("div-renderer");
const renderer = new Renderer(canvas2d, canvasWebgl, divRenderer);
let lastDate = new Date();
let size = 0;
let height = 0;
let angle = Math.PI * 0.5;
let pitch = 0.4;
let scale = 2;
let angleDelta = 0;
let updated = false;
let dragging = false;
let xDrag = 0;

const updateParameters = () => {
    size = Math.min(
        Math.floor(canvas2d.width * X_FILL / scale),
        Math.floor((canvas2d.height * Y_FILL / pitch) / scale));
    height = Math.ceil(size * HEIGHT_RATIO);
    updated = true;
};

const resize = () => {
    canvas2d.width = canvasWebgl.width = canvasWrapper.offsetWidth;
    canvas2d.height = canvasWebgl.height = canvasWrapper.offsetHeight;
    divRenderer.style.width = canvas2d.width + "px";
    divRenderer.style.height = canvas2d.height + "px";

    updateParameters();
};

const update = timeStep => {
    if (!island.isReady()) {
        loader.update(island.generate());

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

        if (island.isReady())
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
    island.setPlan(new Plan(size, height, 1 / scale));
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

canvas2d.addEventListener("mousedown", event =>
    mouseDown(event.clientX, event.clientY, event.button === 0));
canvas2d.addEventListener("touchstart", event =>
    mouseDown(event.touches[0].clientX, event.touches[0].clientY, true));
canvas2d.addEventListener("mousemove", event =>
    mouseMove(event.clientX, event.clientY));
canvas2d.addEventListener("touchmove", event =>
    mouseMove(event.touches[0].clientX, event.touches[0].clientY));
canvas2d.addEventListener("mouseup", event =>
    mouseUp());
canvas2d.addEventListener("touchend", event =>
    mouseUp());

requestAnimationFrame(loopFunction);
resize();
replan();