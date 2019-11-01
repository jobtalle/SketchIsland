const ANGLE_SPEED = 0.3;
const DRAG_SPEED = 0.006;
const H_FILL = 0.8;

const wrapper = document.getElementById("wrapper");
const canvas = document.getElementById("renderer");
let lastDate = new Date();
let island = null;
let size = 0;
let angle = 0;
let angleDelta = ANGLE_SPEED;
let updated = false;
let dragging = false;
let xDrag = 0;
let timeStepLast = 0;

const resize = () => {
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    size = Math.floor(canvas.width * H_FILL / Island.SCALE);
    island = new Island(size, 60, new Plan(size));
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

window.onresize = resize;

canvas.addEventListener("mousedown", event => {
    if (event.button === 1) {
        island.setPlan(new Plan(size));
        updated = true;
    }
    else {
        xDrag = event.clientX;
        dragging = true;
        angleDelta = 0;
    }
});

canvas.addEventListener("mouseup", event => {
    dragging = false;

    if (updated)
        angleDelta = ANGLE_SPEED * Math.sign(angleDelta);
    else
        angleDelta = 0;
});

canvas.addEventListener("mousemove", event => {
    if (dragging) {
        angleDelta = (xDrag - event.clientX) * DRAG_SPEED;
        angle += angleDelta;
        xDrag = event.clientX;
        updated = true;
    }
});

resize();
requestAnimationFrame(loopFunction);