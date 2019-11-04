const Plan = function(size, height) {
    const heightmap = new Heightmap(size);
    const shapes = new Shapes(size, height);

    this.getSize = () => size;
    this.getHeight = () => height;
    this.getShapes = () => shapes;

    new Trees(size, height, heightmap).plant(shapes);

    shapes.add(new ShapeHeightmap(heightmap, height));
};