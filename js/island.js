const Island = function(size, height) {
    const heightmap = new Heightmap(size);
    const layers = [];

    for (let i = 0; i < height; ++i) {
        const canvas = document.createElement("canvas");

        canvas.width = canvas.height = size;

        layers.push(canvas);
    }

    const renderLayers = () => {
        for (let h = 0; h < height; ++h) {
            const context = layers[h].getContext("2d");

            context.clearRect(0, 0, layers[h].width, layers[h].height);
            context.fillStyle = Island.GRADIENT.sample(h / height).toHex();

            for (let y = 0; y < size; ++y) for (let x = 0; x < size; ++x)
                if (heightmap.get(x, y) > h / height)
                    context.fillRect(
                        x,
                        y,
                        1,
                        1);
        }
    };

    this.update = timeStep => {

    };

    this.draw = (context, angle) => {
        const s = 4;

        for (let h = 0; h < height; ++h) {
            context.save();
            context.translate(0, -h * s);
            context.scale(1, 0.5);
            context.rotate(angle);
            context.scale(s, s);

            context.drawImage(layers[h], size * -0.5, size * -0.5);

            context.restore();
        }
    };

    renderLayers();
};

Island.GRADIENT_BEACH_START = 0;
Island.GRADIENT_BEACH_END = 0.1;
Island.GRADIENT_GRASS_START = 0.15;
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