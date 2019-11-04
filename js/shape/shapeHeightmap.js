const ShapeHeightmap = function(heightmap, height, gradientDefault, gradientVolcano) {
    const colorsDefault = new Array(height);
    const colorsVolcano = new Array(height);

    this.bounds = null;

    this.sample = (x, y, z) => {
        const h = heightmap.getHeight(x, y) * height;

        if (z >= h)
            return null;

        if (heightmap.getType(x, y) === Heightmap.TYPE_DEFAULT)
            return new Sample(
                colorsDefault[z],
                heightmap.getNormal(x, y));

        return new Sample(
            colorsVolcano[z],
            heightmap.getNormal(x, y));
    };

    for (let z = 0; z < height; ++z) {
        colorsDefault[z] = gradientDefault.sample(z / height);
        colorsVolcano[z] = gradientVolcano.sample(z / height);
    }
};