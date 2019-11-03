const Plan = function(size, height) {
    const heightmap = new Heightmap(size);
    const planes = new Planes(height);

    this.getHeight = () => height;
    this.getHeightmap = () => heightmap;
    this.getPlanes = () => planes;

    new Trees(size, height, heightmap, planes).plant();
};