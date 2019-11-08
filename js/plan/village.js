const Village = function(height, heightmap, bounds, scale) {
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

    const suitableVillage = (x, y) => {
        if (x < 0 || y < 0 || x >= heightmap.getSize() || y >= heightmap.getSize())
            return false;

        const h = heightmap.getHeight(x, y);

        if (h < Village.VILLAGE_HEIGHT_MIN || h > Village.VILLAGE_HEIGHT_MAX)
            return false;

        return heightmap.getNormal(x, y).dot(Vector3.UP) >= Village.VILLAGE_DOT_MIN;
    };

    const suitableHut = (x, y) => {
        if (x < 0 || y < 0 || x >= heightmap.getSize() || y >= heightmap.getSize())
            return false;

        const h = heightmap.getHeight(x, y);

        if (h < Village.HUT_HEIGHT_MIN || h > Village.HUT_HEIGHT_MAX)
            return false;

        return heightmap.getNormal(x, y).dot(Vector3.UP) >= Village.HUT_DOT_MIN;
    };

    const getSuitableLocations = () => {
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

                if (!suitableVillage(xr, yr))
                    continue;

                candidates.push(new Candidate(xr, yr, heightmap.getNormal(xr, yr).dot(Vector3.UP)));
            }
        }

        return candidates.sort((a, b) => b.score - a.score);
    };

    const growVillage = (x, y, shapes) => {
        const plans = [];

        plans.push(new HutPlan(new Vector3(x, y, heightmap.getHeight(x, y) * height)));

        const spacingAverage = (Village.HUT_SPACING_MIN + Village.HUT_SPACING_MAX) * 0.5 * scale;
        const spacingDeviation = (Village.HUT_SPACING_MAX - Village.HUT_SPACING_MIN) * 0.5 * scale;
        const area = heightmap.getSize() * heightmap.getSize();
        const hutCount = Math.round((Village.HUTS_MIN + (Village.HUTS_MAX - Village.HUTS_MIN) * Math.pow(Math.random(), Village.HUTS_POWER) * area));
        let emptyRings = 0;

        for (let ring = 0; ring < Village.RINGS_MAX && plans.length < hutCount; ++ring) {
            const angleOffset = Math.random();
            const huts = Math.floor(Math.PI * ring * Village.HUT_SPACING_MIN * 2 / spacingAverage);
            let placed = false;

            for (let i = 0; i < huts && plans.length < hutCount; ++i) {
                const radius = ring * spacingAverage - spacingDeviation + spacingDeviation * Math.random() * 2;
                const angle = Math.PI * 2 * (i + angleOffset) / huts;
                const hx = Math.round(x + Math.cos(angle) * radius);
                const hy = Math.round(y + Math.sin(angle) * radius);

                if (!suitableHut(hx, hy) || Math.random() < Village.HUT_SKIP_CHANCE)
                    continue;

                plans.push(new HutPlan(new Vector3(hx, hy, heightmap.getHeight(hx, hy) * height)));
                placed = true;
            }

            if (!placed) {
                if (++emptyRings > Village.RINGS_EMPTY_MAX)
                    return false;
            }
            else
                emptyRings = 0;
        }

        if (plans.length < Village.MIN_SIZE)
            return false;

        for (const plan of plans) {
            shapes.cropBounds(plan.roof.bounds);
            shapes.clear(plan.roof.bounds);
        }

        for (const plan of plans) {
            shapes.add(plan.roof);
            shapes.add(plan.walls);
            shapes.add(plan.base);
        }

        return true;
    };

    this.place = shapes => {
        const locations = getSuitableLocations();

        while (locations.length !== 0) {
            const location = locations.shift();

            if (growVillage(location.x, location.y, shapes))
                return;
        }
    };
};

Village.RINGS_MAX = 8;
Village.RINGS_EMPTY_MAX = 1;
Village.HUTS_MIN = 0.0025;
Village.HUTS_MAX = 0.015;
Village.HUTS_POWER = 2;
Village.VILLAGE_HEIGHT_MIN = 0.1;
Village.VILLAGE_HEIGHT_MAX = 0.15;
Village.VILLAGE_DOT_MIN = 0.7;
Village.HUT_SKIP_CHANCE = 0.15;
Village.HUT_HEIGHT_MIN = 0.15;
Village.HUT_HEIGHT_MAX = 0.5;
Village.HUT_DOT_MIN = 0.45;
Village.HUT_RADIUS = 9;
Village.HUT_HEIGHT = Village.HUT_RADIUS * 1.2;
Village.HUT_DEPTH = Village.HUT_HEIGHT;
Village.HUT_ROOF_RADIUS = 1.3;
Village.HUT_ROOF_HEIGHT = 1;
Village.HUT_SPACING_MIN = Village.HUT_RADIUS * 2.5;
Village.HUT_SPACING_MAX = Village.HUT_SPACING_MIN * 2;
Village.MIN_SIZE = 3;
Village.PROBE_STRIDE = 24;
Village.COLOR_HUT_BASE = StyleUtils.getColor("--color-hut-base");
Village.COLOR_HUT_WALLS = StyleUtils.getColor("--color-hut-walls");
Village.COLOR_HUT_ROOF = StyleUtils.getColor("--color-hut-roof");