const Plan = function(size, height, lighting) {
    const heightmap = new Heightmap(size);
    const shapes = [];

    this.getSize = () => size;
    this.getHeight = () => height;
    this.getHeightmap = () => heightmap;
    this.getShapes = () => shapes;

    new Trees(size, height, heightmap, lighting, shapes).plant();
};