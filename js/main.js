const TIME_STEP_MAX = 0.1;
const ANGLE_SPEED = 0.6;

const wrapper = document.getElementById("wrapper");
const canvas = document.getElementById("renderer");
let lastDate = new Date();
let island = null;
let angle = 0;

const resize = () => {
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    island = new Island(150, 60);
};

const update = timeStep => {
    const context = canvas.getContext("2d");

    island.update(Math.min(timeStep, TIME_STEP_MAX));

    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width * 0.5, canvas.height * 0.5);

    if ((angle += timeStep * ANGLE_SPEED) > Math.PI * 2)
        angle -= Math.PI * 2;

    island.draw(context, angle);

    context.restore();
};

const loopFunction = () => {
    const date = new Date();

    update((date - lastDate) * 0.001);
    requestAnimationFrame(loopFunction);

    lastDate = date;
};

window.onresize = resize;

resize();
requestAnimationFrame(loopFunction);