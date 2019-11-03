const Planes = function(height) {
    const layers = new Array(height);

    for (let i = 0; i < layers.length; ++i)
        layers[i] = [];

    this.add = (x, y, z, image) => layers[z].push(new Planes.Plane(x, y, image));
    this.getPlanes = z => layers[z];
};

Planes.Plane = function(x, y, image) {
    this.x = x;
    this.y = y;
    this.image = image;
};