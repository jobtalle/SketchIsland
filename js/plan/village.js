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

    this.place = shapes => {
        const origin = pickLocation();

        if (origin === null)
            return;

        shapes.add(new ShapeCylinder(
            new Vector3(origin.x, origin.y, heightmap.getHeight(origin.x, origin.y) * height),
            Village.HUT_RADIUS,
            100,
            new Color(0.8, 0, 0)));
    };
};

Village.HEIGHT_MIN = 0.15;
Village.HEIGHT_MAX = 0.35;
Village.DOT_MIN = 0.7;
Village.HUT_RADIUS = 5;
Village.PROBE_STRIDE = 30;