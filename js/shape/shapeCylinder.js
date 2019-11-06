const ShapeCylinder = function(origin, radius, height, color, density = 1) {
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
        if (density !== 1 && density < Math.random())
            return null;

        const dx = x - origin.x;
        const dy = y - origin.y;
        const distSquared = dx * dx + dy * dy;

        if (distSquared > radius * radius)
            return null;

        if (distSquared === 0)
            return new Sample(
                color,
                ShapeCylinder.NORMAL_CENTER);

        return new Sample(
            color,
            new Vector3(dx, dy, 0).normalize());
    };
};

ShapeCylinder.NORMAL_CENTER = new Vector3(1, 0, 0);