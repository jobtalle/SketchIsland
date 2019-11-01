const Plan = function(size) {
    const heightmap = new Heightmap(size);

    this.getHeightmap = () => heightmap;
};