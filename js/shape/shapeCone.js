const ShapeCone = function(origin, radius, height, color) {
    this.bounds = new Bounds(
        new Vector3(
            Math.floor(origin.x - radius),
            Math.floor(origin.y - radius),
            Math.floor(origin.z)),
        new Vector3(
            Math.ceil(origin.x + radius),
            Math.ceil(origin.y + radius),
            Math.ceil(origin.z + height)));

    this.sample = (x, y, z) => {
        const dx = x - origin.x;
        const dy = y - origin.y;
        const dz = z - origin.z;
        const distSquared = dx * dx + dy * dy;
        const r = radius * (1 - dz / height);

        if (distSquared > r * r)
            return null;

        if (distSquared === 0)
            return new Sample(
                color,
                ShapeCone.NORMAL_CENTER);

        return new Sample(
            color,
            new Vector3(dx, dy, 0).normalize());
    };
};

ShapeCone.NORMAL_CENTER = new Vector3(1, 0, 0);