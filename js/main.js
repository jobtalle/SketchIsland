const ANGLE_SPEED = 0.3;
const DRAG_SPEED = 0.006;
const X_FILL = 1;
const HEIGHT_RATIO = 0.18;
const TIME_STEP_MAX = 0.1;

const island = new Island(new Lighting());
const loader = new Loader(document.getElementById("loader"));
const wrapper = document.getElementById("wrapper");
const canvas = document.getElementById("renderer");
let lastDate = new Date();
let renderer = null;
let size = 0;
let height = 0;
let angle = 0;
let pitch = 0.4;
let scale = 2;
let angleDelta = ANGLE_SPEED;
let updated = false;
let dragging = false;
let xDrag = 0;

const resize = () => {
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    size = Math.floor(canvas.width * X_FILL / scale);
    height = Math.ceil(size * HEIGHT_RATIO);
    renderer = new RendererCanvas(island, canvas);
    updated = true;
};

const update = timeStep => {
    if (!island.isReady()) {
        loader.update(island.generate());

        if (island.isReady())
            updated = true;
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
    island.setPlan(new Plan(size, height));
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
replan();