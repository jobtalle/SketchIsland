const Island = function(size, lighting, plan) {
    const layers = [];

    for (let i = 0; i < plan.getHeight(); ++i) {
        const canvas = document.createElement("canvas");

        canvas.width = canvas.height = size;

        layers.push(canvas);
    }

    const renderLayers = () => {
        for (let h = 0; h < plan.getHeight(); ++h) {
            const context = layers[h].getContext("2d");
            const data = context.createImageData(size, size);
            let gradientType = -1;
            let color, r, g, b;

            for (let y = 0; y < size; ++y) for (let x = 0; x < size; ++x) {
                if (plan.getHeightmap().getHeight(x, y) > h / plan.getHeight()) {
                    const type = plan.getHeightmap().getType(x, y);
                    const i = x + y * size << 2;
                    const l = lighting.get(plan.getHeightmap().getNormal(x, y));

                    if (gradientType !== type) {
                        gradientType = type;
                        color = Island.GRADIENTS[type].sample(h / plan.getHeight());
                        r = Math.floor(color.r * 256);
                        g = Math.floor(color.g * 256);
                        b = Math.floor(color.b * 256);
                    }

                    data.data[i] = Math.min(Math.round(r * l), 255);
                    data.data[i + 1] = Math.min(Math.round(g * l), 255);
                    data.data[i + 2] = Math.min(Math.round(b * l), 255);
                    data.data[i + 3] = 255;
                }
            }

            context.putImageData(data, 0, 0);

            for (const plane of plan.getPlanes().getPlanes(h))
                context.drawImage(plane.image, plane.x, plane.y);
        }
    };

    this.setPlan = newPlan => {
        plan = newPlan;

        renderLayers();
    };

    this.draw = (context, angle) => {
        for (let h = 0; h < plan.getHeight(); ++h) {
            context.save();
            context.translate(0, (plan.getHeight() * 0.5 - h) * Island.SCALE);
            context.scale(1, Island.Y_SCALE);
            context.rotate(angle);
            context.scale(Island.SCALE, Island.SCALE);

            context.drawImage(layers[h], size * -0.5, size * -0.5);

            context.restore();
        }
    };

    renderLayers();
};

Island.SCALE = 2.5;
Island.Y_SCALE = 0.4;
Island.GRADIENT_BEACH_START = 0;
Island.GRADIENT_BEACH_END = 0.05;
Island.GRADIENT_GRASS_START = 0.1;
Island.GRADIENT_GRASS_END = 0.7;
Island.GRADIENT_MOUNTAIN_START = 0.75;
Island.GRADIENT_MOUNTAIN_END = 1;
Island.GRADIENT_VOLCANO_SURFACE = 0.9;
Island.GRADIENT_VOLCANO_DEEP = 0.6;
Island.GRADIENTS = [];
Island.GRADIENTS[Heightmap.TYPE_DEFAULT] = new Gradient([
    new Gradient.Stop(Island.GRADIENT_BEACH_START, StyleUtils.getColor("--color-beach-start")),
    new Gradient.Stop(Island.GRADIENT_BEACH_END, StyleUtils.getColor("--color-beach-end")),
    new Gradient.Stop(Island.GRADIENT_GRASS_START, StyleUtils.getColor("--color-grass-start")),
    new Gradient.Stop(Island.GRADIENT_GRASS_END, StyleUtils.getColor("--color-grass-end")),
    new Gradient.Stop(Island.GRADIENT_MOUNTAIN_START, StyleUtils.getColor("--color-mountain-start")),
    new Gradient.Stop(Island.GRADIENT_MOUNTAIN_END, StyleUtils.getColor("--color-mountain-end"))
]);
Island.GRADIENTS[Heightmap.TYPE_VOLCANO] = new Gradient([
    new Gradient.Stop(0, StyleUtils.getColor("--color-volcano-deep")),
    new Gradient.Stop(Island.GRADIENT_VOLCANO_DEEP, StyleUtils.getColor("--color-volcano-deep")),
    new Gradient.Stop(Island.GRADIENT_VOLCANO_SURFACE, StyleUtils.getColor("--color-volcano-surface")),
    new Gradient.Stop(1, StyleUtils.getColor("--color-mountain-end"))
]);