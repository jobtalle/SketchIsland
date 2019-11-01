const Heightmap = function(size) {
    const heights = new Array(size * size);
    const normals = new Array(heights.length);

    const calculateNormals = () => {
        const step = 1 / size;

        for (let y = 1; y < size - 1; ++y) for (let x = 1; x < size - 1; ++x) {
            const index = x + size * y;
            const left = new Vector3(-step, 0, heights[index] - heights[index - 1]);
            const right = new Vector3(step, 0, heights[index] - heights[index + 1]);
            const top = new Vector3(0, -step, heights[index] - heights[index - size]);
            const bottom = new Vector3(0, step, heights[index] - heights[index + size]);
            const normal = new Vector3(0, 0, 0);

            normal.add(bottom.cross(left));
            normal.add(right.cross(bottom));
            normal.add(top.cross(right));
            normal.add(left.cross(top));

            normals[index] = normal.normalize();
        }
    };

    const fill = () => {
        const noises = new Array(Heightmap.OCTAVES);

        for (let i = 0; i < Heightmap.OCTAVES; ++i)
            noises[i] = cubicNoiseConfig(Math.random());

        for (let y = 0; y < size; ++y) for (let x = 0; x < size; ++x) {
            const dx = size * 0.5 - x;
            const dy = size * 0.5 - y;
            const peakDistance = Math.min(1, Math.sqrt(dx * dx + dy * dy) / size * 2);
            const multiplier = Heightmap.MULTIPLIER * Math.pow(0.5 + 0.5 * Math.cos(Math.PI * peakDistance), Heightmap.PEAK_POWER);

            let sample = 0;
            let influence = Heightmap.OCTAVE_INFLUENCE_INITIAL;
            let scale = Heightmap.SCALE_INITIAL;

            for (let octave = 0; octave < Heightmap.OCTAVES; ++octave) {
                sample += cubicNoiseSample2(noises[octave], x * scale, y * scale) * influence;

                influence /= Heightmap.OCTAVE_FALLOFF;
                scale *= Heightmap.SCALE_FALLOFF;
            }

            heights[x + size * y] = multiplier * Math.pow(sample, Heightmap.POWER) - Heightmap.WATER_THRESHOLD;
        }

        calculateNormals();
    };

    this.getHeight = (x, y) => heights[x + size * y];
    this.getNormal = (x, y) => normals[x + size * y];

    fill();
};

Heightmap.NORMAL_EDGE = new Vector3(0, 0, -1);
Heightmap.WATER_THRESHOLD = 0.1;
Heightmap.POWER = 4;
Heightmap.MULTIPLIER = 7;
Heightmap.PEAK_POWER = 0.7;
Heightmap.SCALE_INITIAL = 0.01;
Heightmap.SCALE_FALLOFF = 1.75;
Heightmap.OCTAVES = 6;
Heightmap.OCTAVE_FALLOFF = 2.1;
Heightmap.OCTAVE_INFLUENCE_INITIAL = ((Heightmap.OCTAVE_FALLOFF - 1) *
    (Math.pow(Heightmap.OCTAVE_FALLOFF, Heightmap.OCTAVES))) /
    (Math.pow(Heightmap.OCTAVE_FALLOFF, Heightmap.OCTAVES) - 1) / Heightmap.OCTAVE_FALLOFF;