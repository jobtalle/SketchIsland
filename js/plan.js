const Plan = function(size, height, scale, lighting) {
    const heightmap = new Heightmap(size);
    const shapes = new Shapes(size, height);
    const shapeHeightmap = new ShapeHeightmap(heightmap, height);

    this.getSize = () => size;
    this.getHeight = () => height;
    this.getShapes = () => shapes;

    new Trees(size, height, heightmap, shapeHeightmap.bounds, lighting, scale).plant(shapes);

    shapes.add(shapeHeightmap);
};