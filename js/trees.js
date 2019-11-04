const Trees = function(size, height, heightmap, lighting, shapes) {
    this.plant = () => {
        for (let i = 0; i < 1000; ++i) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            const h = heightmap.getHeight(x, y);
            const z = h * height;

            if (h < 0.1 || h > 0.4)
                continue;

            const radius = 4 + Math.random() * 2;
            const tall = radius * 2;

            shapes.push(new ShapeCone(new Vector3(x, y, z), radius, tall, Trees.COLOR_PINE));
        }
    };
};

Trees.COLOR_PINE = new Color(37 / 255, 123 / 255, 37 / 255);