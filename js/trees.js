const Trees = function(size, height, heightmap, planes, lighting) {
    this.plant = () => {
        for (let i = 0; i < 2000; ++i) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            const h = heightmap.getHeight(x, y);
            const z = Math.round(h * height);

            if (h < 0.1 || h > 0.4)
                continue;

            const l = 12;
            for (let j = 0; j < l; ++j) {
                const radius = 6 * (1 - j / l);
                const canvas = document.createElement("canvas");
                canvas.width = canvas.height = radius * 2;

                const context = canvas.getContext("2d");
                /*
                context.fillStyle = "rgba(37,123,37,0.8)";
                context.beginPath();
                context.arc(radius, radius, radius, 0, Math.PI * 2);
                context.fill();
                */

                const data = context.createImageData(canvas.width, canvas.height);

                for (let y = 0; y < canvas.height; ++y) for (let x = 0; x < canvas.width; ++x) {
                    const index = x + y * canvas.width << 2;
                    const color = new Color(37 / 256, 123 / 256, 37 / 256);
                    let r, g, b;
                    let l = 1;

                    const dx = x - radius;
                    const dy = y - radius;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    r = Math.floor(color.r * 256);
                    g = Math.floor(color.g * 256);
                    b = Math.floor(color.b * 256);

                    if (dx !== 0 || dy !== 0)
                        l = lighting.get(new Vector3(dx, dy, 0).normalize());

                    data.data[index] = Math.min(Math.round(r * l), 255);
                    data.data[index + 1] = Math.min(Math.round(g * l), 255);
                    data.data[index + 2] = Math.min(Math.round(b * l), 255);

                    if (dist < radius)
                        data.data[index + 3] = 255;
                    else
                        data.data[index + 3] = 0;
                }

                context.putImageData(data, 0, 0);

                planes.add(
                    x - radius,
                    y - radius,
                    z + j,
                    canvas);
            }
        }
    };
};