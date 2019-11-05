const RendererCanvas = function(island, canvas) {
    this.setIsland = newIsland => {
        island = newIsland;
    };

    this.clean = () => {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    };

    this.resize = () => {

    };

    this.render = (angle, pitch, scale) => {
        const context = canvas.getContext("2d");

        context.imageSmoothingEnabled = true;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(canvas.width * 0.5, canvas.height * 0.5);

        for (let z = 0; z < island.getLayers().length; ++z) {
            const layer = island.getLayers()[z];

            context.save();
            context.translate(0, (island.getPlan().getHeight() * 0.5 - z) * scale);
            context.scale(1, pitch);
            context.rotate(angle);
            context.scale(scale, scale);
            context.drawImage(
                layer.canvas,
                island.getPlan().getSize() * -0.5 + layer.x,
                island.getPlan().getSize() * -0.5 + layer.y);
            context.restore();
        }

        context.restore();
    };
};