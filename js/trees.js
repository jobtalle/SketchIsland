const Trees = function(size, height, heightmap, planes) {

    this.plant = () => {
        for (let i = 0; i < 2000; ++i) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            const h = heightmap.getHeight(x, y);
            const z = Math.round(h * height);

            if (h < 0.1 || h > 0.4)
                continue;

            const l = 8;
            for (let j = 0; j < l; ++j) {
                const radius = 4 * (1 - j / l);
                const canvas = document.createElement("canvas");
                canvas.width = canvas.height = radius * 2;

                const context = canvas.getContext("2d");
                context.fillStyle = "rgba(37,123,37,0.8)";
                context.beginPath();
                context.arc(radius, radius, radius, 0, Math.PI * 2);
                context.fill();

                planes.add(
                    x - radius,
                    y - radius,
                    z + j,
                    canvas);
            }
        }
    };
};