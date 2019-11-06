const ShapeHeightmap = function(heightmap, height) {
    const colorsDefault = new Array(height);
    const colorsVolcano = new Array(height);
    const bufferedColors = new Array(heightmap.getSize() * heightmap.getSize());

    this.bounds = heightmap.getBounds(height);

    this.sample = (x, y, z) => {
        const h = heightmap.getHeight(x, y) * height;

        if (z >= h)
            return null;

        if (heightmap.getType(x, y) === Heightmap.TYPE_DEFAULT) {
            const index = x + y * heightmap.getSize();

            if (!bufferedColors[index])
                bufferedColors[index] = Heightmap.GRADIENTS[Heightmap.TYPE_DEFAULT].sample(
                    Math.pow(
                        heightmap.getHeight(x, y),
                        Math.pow(heightmap.getNormal(x, y).dot(Vector3.UP), ShapeHeightmap.GRADIENT_POWER)));

            return new Sample(
                bufferedColors[index],
                heightmap.getNormal(x, y));
        }

        return new Sample(
            colorsVolcano[z],
            heightmap.getNormal(x, y));
    };

    for (let z = 0; z < height; ++z) {
        colorsDefault[z] = Heightmap.GRADIENTS[Heightmap.TYPE_DEFAULT].sample(z / height);
        colorsVolcano[z] = Heightmap.GRADIENTS[Heightmap.TYPE_VOLCANO].sample(z / height);
    }
};

ShapeHeightmap.GRADIENT_POWER = 0.35;