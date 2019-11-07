const Trees = function(height, heightmap, bounds, lighting, scale) {
    this.plant = shapes => {
        const stride = Trees.SPACING * scale;

        for (let y = bounds.start.y; y < bounds.end.y - Trees.DISPLACEMENT * scale; y += stride) {
            for (let x = bounds.start.x; x < bounds.end.x - Trees.DISPLACEMENT * scale; x += stride) {
                const plantX = Math.round(x + Math.random() * Trees.DISPLACEMENT * scale);
                const plantY = Math.round(y + Math.random() * Trees.DISPLACEMENT * scale);
                const h = heightmap.getHeight(plantX, plantY);

                if (h < Trees.HEIGHT_MIN || h > Trees.HEIGHT_MAX)
                    continue;

                let heightFactor;

                if (h < Trees.HEIGHT_PEAK)
                    heightFactor = 1 - (h - Trees.HEIGHT_MIN) * (1 / (Trees.HEIGHT_PEAK - Trees.HEIGHT_MIN));
                else
                    heightFactor = (h - Trees.HEIGHT_PEAK) * (1 / (Trees.HEIGHT_MAX - Trees.HEIGHT_PEAK));

                if (Math.random() < Trees.CHANCE_MIN * heightFactor)
                    continue;

                if (heightmap.getNormal(plantX, plantY).dot(Trees.DIRECTION) < Trees.DOT_MIN)
                    continue;

                const radius = (Trees.RADIUS_MIN + (Trees.RADIUS_MAX - Trees.RADIUS_MIN) * Math.random() * (1 - heightFactor)) * scale;
                const tall = radius * (Trees.HEIGHT_FACTOR_MIN + (Trees.HEIGHT_FACTOR_MAX - Trees.HEIGHT_FACTOR_MIN) * Math.random());
                const l = lighting.getAmbient(heightmap.getNormal(plantX, plantY), Trees.AMBIENT);

                shapes.add(new ShapeCone(new Vector3(plantX, plantY, h * height - Trees.INSET), radius, tall, new Color(
                    Math.max(0, Math.min(1, Trees.COLOR_PINE.r * l)),
                    Math.max(0, Math.min(1, Trees.COLOR_PINE.g * l)),
                    Math.max(0, Math.min(1, Trees.COLOR_PINE.b * l)),
                    Trees.COLOR_PINE.a),
                    1 - (1 - Trees.VOLUME_DENSITY) * scale));
            }
        }
    };
};

Trees.VOLUME_DENSITY = 0.5;
Trees.RADIUS_MIN = 8;
Trees.RADIUS_MAX = 18;
Trees.HEIGHT_FACTOR_MIN = 1.8;
Trees.HEIGHT_FACTOR_MAX = 2.5;
Trees.SPACING = Trees.RADIUS_MIN * 1.65;
Trees.DISPLACEMENT = Trees.SPACING;
Trees.COLOR_PINE = StyleUtils.getColor("--color-tree-pine");
Trees.DIRECTION = new Vector3(-0.1, 0.1, 2).normalize();
Trees.DOT_MIN = 0.15;
Trees.HEIGHT_MIN = 0.1;
Trees.HEIGHT_PEAK = 0.2;
Trees.HEIGHT_MAX = 0.65;
Trees.CHANCE_MIN = 0.9;
Trees.AMBIENT = 0.85;
Trees.INSET = 1.5;