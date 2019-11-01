const Island = function(size, plan) {
    const height = Math.ceil(size * Island.HEIGHT);
    const layers = [];

    for (let i = 0; i < height; ++i) {
        const canvas = document.createElement("canvas");

        canvas.width = canvas.height = size;

        layers.push(canvas);
    }

    const renderLayers = () => {
        for (let h = 0; h < height; ++h) {
            const context = layers[h].getContext("2d");
            const data = context.createImageData(size, size);
            const color = Island.GRADIENT.sample(h / height);
            const r = Math.floor(color.r * 256);
            const g = Math.floor(color.g * 256);
            const b = Math.floor(color.b * 256);

            for (let y = 0; y < size; ++y) for (let x = 0; x < size; ++x) {
                if (plan.getHeightmap().getHeight(x, y) > h / height) {
                    const i = x + y * size << 2;
                    const exposure = Math.max(0, plan.getHeightmap().getNormal(x, y).dot(Island.LIGHTING_ANGLE));
                    const l = Island.LIGHTING_AMBIENT + 2 * (1 - Island.LIGHTING_AMBIENT) * exposure;

                    data.data[i] = Math.min(Math.round(r * l), 255);
                    data.data[i + 1] = Math.min(Math.round(g * l), 255);
                    data.data[i + 2] = Math.min(Math.round(b * l), 255);
                    data.data[i + 3] = 255;
                }
            }

            context.putImageData(data, 0, 0);
        }
    };

    this.setPlan = newPlan => {
        plan = newPlan;

        renderLayers();
    };

    this.draw = (context, angle) => {
        for (let h = 0; h < height; ++h) {
            context.save();
            context.translate(0, (height * 0.5 - h) * Island.SCALE);
            context.scale(1, Island.Y_SCALE);
            context.rotate(angle);
            context.scale(Island.SCALE, Island.SCALE);

            context.drawImage(layers[h], size * -0.5, size * -0.5);

            context.restore();
        }
    };

    renderLayers();
};

Island.SCALE = 3.5;
Island.Y_SCALE = 0.35;
Island.HEIGHT = 0.22;
Island.LIGHTING_AMBIENT = 0.9;
Island.LIGHTING_ANGLE = new Vector3(1, -1, 2.5).normalize();
Island.GRADIENT_BEACH_START = 0;
Island.GRADIENT_BEACH_END = 0.05;
Island.GRADIENT_GRASS_START = 0.1;
Island.GRADIENT_GRASS_END = 0.7;
Island.GRADIENT_MOUNTAIN_START = 0.75;
Island.GRADIENT_MOUNTAIN_END = 1;
Island.GRADIENT = new Gradient([
    new Gradient.Stop(Island.GRADIENT_BEACH_START, StyleUtils.getColor("--color-beach-start")),
    new Gradient.Stop(Island.GRADIENT_BEACH_END, StyleUtils.getColor("--color-beach-end")),
    new Gradient.Stop(Island.GRADIENT_GRASS_START, StyleUtils.getColor("--color-grass-start")),
    new Gradient.Stop(Island.GRADIENT_GRASS_END, StyleUtils.getColor("--color-grass-end")),
    new Gradient.Stop(Island.GRADIENT_MOUNTAIN_START, StyleUtils.getColor("--color-mountain-start")),
    new Gradient.Stop(Island.GRADIENT_MOUNTAIN_END, StyleUtils.getColor("--color-mountain-end"))
]);