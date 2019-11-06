const Village = function(height, heightmap, bounds, scale) {
    const suitable = (x, y) => {
        const h = heightmap.getHeight(x, y);

        if (h < Village.HEIGHT_MIN || h > Village.HEIGHT_MAX)
            return false;

        return heightmap.getNormal(x, y).dot(Vector3.UP) >= Village.DOT_MIN;
    };

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

                if (!suitable(xr, yr))
                    continue;

                candidates.push(new Candidate(xr, yr, heightmap.getNormal(xr, yr).dot(Vector3.UP)));
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
            Village.HUT_RADIUS * Village.HUT_ROOF_RADIUS,
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

        shapes.add(walls);
        shapes.add(base);
        shapes.add(roof);
    };

    this.place = shapes => {
        const HutPlan = function(location) {
            this.base = new ShapeCylinder(
                location.copy().subtract(new Vector3(0, 0, Village.HUT_DEPTH)),
                Village.HUT_RADIUS * Village.HUT_ROOF_RADIUS,
                Village.HUT_DEPTH,
                Village.COLOR_HUT_BASE);
            this.walls = new ShapeCone(
                location.copy().add(new Vector3(0, 0, Village.HUT_HEIGHT)),
                Village.HUT_RADIUS * Village.HUT_ROOF_RADIUS,
                Village.HUT_HEIGHT * Village.HUT_ROOF_HEIGHT,
                Village.COLOR_HUT_ROOF);
            this.roof = new ShapeCylinder(
                location.copy(),
                Village.HUT_RADIUS,
                Village.HUT_HEIGHT,
                Village.COLOR_HUT_WALLS);
        };

        const origin = pickLocation();
        const plans = [];

        if (origin === null)
            return;

        plans.push(new HutPlan(new Vector3(origin.x, origin.y, heightmap.getHeight(origin.x, origin.y) * height)));

        let radius = Village.HUT_SPACING;
        let huts = Math.floor(Math.PI * radius * 2 / Village.HUT_SPACING);

        for (let i = 0; i < huts; ++i) {
            const angle = Math.PI * 2 * i / huts;
            const hx = Math.round(origin.x + Math.cos(angle) * radius);
            const hy = Math.round(origin.y + Math.sin(angle) * radius);

            if (!suitable(hx, hy))
                continue;

            plans.push(new HutPlan(new Vector3(hx, hy, heightmap.getHeight(hx, hy) * height)));
        }

        if (plans.length < Village.MIN_SIZE)
            return;

        for (const plan of plans) {
            shapes.cropBounds(plan.walls.bounds);
            shapes.clear(plan.walls.bounds);
        }

        for (const plan of plans) {
            shapes.add(plan.walls);
            shapes.add(plan.base);
            shapes.add(plan.roof);
        }
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
Village.HUT_SPACING = Village.HUT_RADIUS * 2.5;
Village.MIN_SIZE = 3;
Village.PROBE_STRIDE = 24;
Village.COLOR_HUT_BASE = StyleUtils.getColor("--color-hut-base");
Village.COLOR_HUT_WALLS = StyleUtils.getColor("--color-hut-walls");
Village.COLOR_HUT_ROOF = StyleUtils.getColor("--color-hut-roof");