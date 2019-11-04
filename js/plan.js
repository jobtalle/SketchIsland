const Plan = function(size, height, scale) {
    const heightmap = new Heightmap(size);
    const shapes = new Shapes(size, height);

    this.getSize = () => size;
    this.getHeight = () => height;
    this.getShapes = () => shapes;

    new Trees(size, height, heightmap, scale).plant(shapes);

    shapes.add(new ShapeHeightmap(heightmap, height));
};