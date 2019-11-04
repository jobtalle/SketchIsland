const Island = function(lighting, plan) {
    let layers = null;

    const renderLayers = () => {
        const size = plan.getSize();

        for (let z = 0; z < plan.getHeight(); ++z) {
            const context = layers[z].getContext("2d");
            const data = context.createImageData(plan.getSize(), plan.getSize());

            for (let y = 0; y < size; ++y) {
                for (let x = 0; x < size; ++x) {
                    for (const shape of plan.getShapes().get(x, y, z)) {
                        if (!shape.bounds || shape.bounds.contains(x, y, z)) {
                            const index = x + y * size << 2;
                            const sample = shape.sample(x, y, z);

                            if (!sample)
                                continue;

                            const l = lighting.get(sample.normal);

                            data.data[index] = Math.min(Math.round(Math.floor(sample.color.r * 255) * l), 255);
                            data.data[index + 1] = Math.min(Math.round(Math.floor(sample.color.g * 255) * l), 255);
                            data.data[index + 2] = Math.min(Math.round(Math.floor(sample.color.b * 255) * l), 255);
                            data.data[index + 3] = 255;

                            break; // TODO: Continue if alpha is not 1
                        }
                    }
                }
            }

            context.putImageData(data, 0, 0);
        }
    };

    this.setPlan = newPlan => {
        plan = newPlan;
        layers = new Array(plan.getHeight());

        for (let i = 0; i < plan.getHeight(); ++i) {
            const canvas = document.createElement("canvas");

            canvas.width = canvas.height = plan.getSize();

            layers[i] = canvas;
        }

        renderLayers();
    };

    this.draw = (context, angle) => {
        for (let h = 0; h < plan.getHeight(); ++h) {
            context.save();
            context.translate(0, (plan.getHeight() * 0.5 - h) * Island.SCALE);
            context.scale(1, Island.Y_SCALE);
            context.rotate(angle);
            context.scale(Island.SCALE, Island.SCALE);

            context.drawImage(layers[h], plan.getSize() * -0.5, plan.getSize() * -0.5);

            context.restore();
        }
    };

    this.setPlan(plan);
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