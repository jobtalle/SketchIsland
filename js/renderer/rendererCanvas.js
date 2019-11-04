const RendererCanvas = function(island, canvas) {
    this.render = (angle, pitch, scale) => {
        const context = canvas.getContext("2d");

        context.imageSmoothingEnabled = true;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.translate(canvas.width * 0.5, canvas.height * 0.5);

        for (let z = 0; z < island.getPlan().getHeight(); ++z) {
            context.save();
            context.translate(0, (island.getPlan().getHeight() * 0.5 - z) * scale);
            context.scale(1, pitch);
            context.rotate(angle);
            context.scale(scale, scale);
            context.drawImage(island.getLayers()[z], island.getPlan().getSize() * -0.5, island.getPlan().getSize() * -0.5);
            context.restore();
        }

        context.restore();
    };
};