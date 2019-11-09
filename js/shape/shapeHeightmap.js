const ShapeHeightmap = function(heightmap, height) {
    const bufferedColors = new Array(heightmap.getSize() * heightmap.getSize());

    this.bounds = heightmap.getBounds(height);

    this.sample = (x, y, z) => {
        const h = heightmap.getHeight(x, y) * height;

        if (z >= h)
            return null;

        const index = x + y * heightmap.getSize();

        if (!bufferedColors[index]) {
            if (heightmap.getType(x, y) === Heightmap.TYPE_DEFAULT)
                bufferedColors[index] = Heightmap.GRADIENTS[Heightmap.TYPE_DEFAULT].sample(
                    Math.pow(
                        heightmap.getHeight(x, y),
                        Math.pow(heightmap.getNormal(x, y).dot(Vector3.UP), ShapeHeightmap.GRADIENT_POWER)));
            else
                bufferedColors[index] = Heightmap.GRADIENTS[Heightmap.TYPE_VOLCANO].sample(heightmap.getHeight(x, y));
        }

        return new Sample(
            bufferedColors[index],
            heightmap.getNormal(x, y));
    };
};

ShapeHeightmap.GRADIENT_POWER = 0.35;