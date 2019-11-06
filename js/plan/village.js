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

        for (let y = bounds.start.y; y < bounds.end.y; y += Village.PROBE_STRIDE * scale) {
            for (let x = bounds.start.x; x < bounds.end.x; x += Village.PROBE_STRIDE * scale) {
                const xr = Math.round(x);
                const yr = Math.round(y);

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

    this.place = shapes => {
        const HutPlan = function(location) {
            this.base = new ShapeCylinder(
                location.copy().subtract(new Vector3(0, 0, Village.HUT_DEPTH * scale)),
                Village.HUT_RADIUS * Village.HUT_ROOF_RADIUS * scale,
                Village.HUT_DEPTH * scale,
                Village.COLOR_HUT_BASE);
            this.roof = new ShapeCone(
                location.copy().add(new Vector3(0, 0, Village.HUT_HEIGHT * scale)),
                Village.HUT_RADIUS * Village.HUT_ROOF_RADIUS * scale,
                Village.HUT_HEIGHT * Village.HUT_ROOF_HEIGHT * scale,
                Village.COLOR_HUT_ROOF);
            this.walls = new ShapeCylinder(
                location.copy(),
                Village.HUT_RADIUS * scale,
                Village.HUT_HEIGHT * scale,
                Village.COLOR_HUT_WALLS);
        };

        const origin = pickLocation();
        const plans = [];

        if (origin === null)
            return;

        plans.push(new HutPlan(new Vector3(origin.x, origin.y, heightmap.getHeight(origin.x, origin.y) * height)));

        let radius = Village.HUT_SPACING * scale;
        let huts = Math.floor(Math.PI * radius * 2 / Village.HUT_SPACING * scale);

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
            shapes.add(plan.roof);
            shapes.add(plan.walls);
            shapes.add(plan.base);
        }
    };
};

Village.HEIGHT_MIN = 0.15;
Village.HEIGHT_MAX = 0.35;
Village.DOT_MIN = 0.7;
Village.HUT_RADIUS = 10;
Village.HUT_HEIGHT = 12;
Village.HUT_DEPTH = 6;
Village.HUT_ROOF_RADIUS = 1.25;
Village.HUT_ROOF_HEIGHT = 0.8;
Village.HUT_SPACING = Village.HUT_RADIUS * 2.5;
Village.MIN_SIZE = 1;
Village.PROBE_STRIDE = 24;
Village.COLOR_HUT_BASE = StyleUtils.getColor("--color-hut-base");
Village.COLOR_HUT_WALLS = StyleUtils.getColor("--color-hut-walls");
Village.COLOR_HUT_ROOF = StyleUtils.getColor("--color-hut-roof");