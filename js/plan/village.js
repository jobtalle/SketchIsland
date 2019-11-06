const Village = function(height, heightmap, bounds, scale) {
    const pickLocation = () => {
        const Candidate = function(x, y, score) {
            this.x = x;
            this.y = y;
            this.score = score;
        };

        const candidates = [];

        for (let y = bounds.start.y; y < bounds.end.y; y += Village.PROBE_STRIDE) {
            for (let x = bounds.start.x; x < bounds.end.x; x += Village.PROBE_STRIDE) {
                const xr = Math.round(x);
                const yr = Math.round(y);
                const h = heightmap.getHeight(xr, yr);

                if (h < Village.HEIGHT_MIN || h > Village.HEIGHT_MAX)
                    continue;

                const dot = heightmap.getNormal(xr, yr).dot(Vector3.UP);

                if (dot < Village.DOT_MIN)
                    continue;

                candidates.push(new Candidate(xr, yr, dot));
            }
        }

        candidates.sort((a, b) => b.score - a.score);

        if (candidates.length === 0)
            return null;

        return candidates[0];
    };

    const placeHut = (shapes, at) => {
        const base = new ShapeCylinder(
            at.copy().subtract(new Vector3(0, 0, Village.HUT_DEPTH)),
            Village.HUT_RADIUS,
            Village.HUT_DEPTH,
            Village.COLOR_HUT_BASE);
        const walls = new ShapeCone(
            at.copy().add(new Vector3(0, 0, Village.HUT_HEIGHT)),
            Village.HUT_RADIUS * Village.HUT_ROOF_RADIUS,
            Village.HUT_HEIGHT * Village.HUT_ROOF_HEIGHT,
            Village.COLOR_HUT_ROOF);
        const roof = new ShapeCylinder(
            at,
            Village.HUT_RADIUS,
            Village.HUT_HEIGHT,
            Village.COLOR_HUT_WALLS);

        shapes.cropBounds(walls.bounds);
        shapes.clear(walls.bounds);

        shapes.add(new ShapeCylinder(
            at.copy().subtract(new Vector3(0, 0, Village.HUT_DEPTH)),
            Village.HUT_RADIUS,
            Village.HUT_DEPTH,
            Village.COLOR_HUT_BASE), true);
        shapes.add(new ShapeCone(
            at.copy().add(new Vector3(0, 0, Village.HUT_HEIGHT)),
            Village.HUT_RADIUS * Village.HUT_ROOF_RADIUS,
            Village.HUT_HEIGHT * Village.HUT_ROOF_HEIGHT,
            Village.COLOR_HUT_ROOF));
        shapes.add(new ShapeCylinder(
            at,
            Village.HUT_RADIUS,
            Village.HUT_HEIGHT,
            Village.COLOR_HUT_WALLS));
    };

    this.place = shapes => {
        const origin = pickLocation();

        if (origin === null)
            return;

        placeHut(shapes, new Vector3(origin.x, origin.y, heightmap.getHeight(origin.x, origin.y) * height));
    };
};

Village.HEIGHT_MIN = 0.15;
Village.HEIGHT_MAX = 0.35;
Village.DOT_MIN = 0.7;
Village.HUT_RADIUS = 5;
Village.HUT_HEIGHT = 6;
Village.HUT_DEPTH = 8;
Village.HUT_ROOF_RADIUS = 1.25;
Village.HUT_ROOF_HEIGHT = 0.8;
Village.PROBE_STRIDE = 30;
Village.COLOR_HUT_BASE = StyleUtils.getColor("--color-hut-base");
Village.COLOR_HUT_WALLS = StyleUtils.getColor("--color-hut-walls");
Village.COLOR_HUT_ROOF = StyleUtils.getColor("--color-hut-roof");