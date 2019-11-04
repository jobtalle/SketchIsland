const Plan = function(size, height) {
    const heightmap = new Heightmap(size);
    const shapes = new Shapes(size, height);

    this.getSize = () => size;
    this.getHeight = () => height;
    this.getHeightmap = () => heightmap;
    this.getShapes = () => shapes;

    new Trees(size, height, heightmap, shapes).plant();

    shapes.add(new ShapeHeightmap(heightmap, height, Island.GRADIENTS[0], Island.GRADIENTS[1]));
};