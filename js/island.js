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
        }
    };

    this.update = timeStep => {

    };

    this.draw = (context, angle) => {
        context.save();
        context.scale(1, 0.5);
        context.rotate(angle);

        context.beginPath();
        context.moveTo(0, 0);
        context.arc(0, 0, 64, 0, Math.PI * 2);
        context.strokeStyle = "red";
        context.stroke();

        context.restore();
    };

    renderLayers();
};