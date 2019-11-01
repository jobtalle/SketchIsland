const Heightmap = function(size) {
    const heights = new Array(size * size);
    const dx = new Array(size * size);
    const dy = new Array(size * size);

    const calculateDerivatives = () => {
        for (let y = 1; y < size - 1; ++y) for (let x = 1; x < size - 1; ++x) {
            const index = x + size * y;
            const dxl = heights[index] - heights[x + size * y - 1];
            const dxr = heights[x + size * y + 1] - heights[index];
            const dyt = heights[index] - heights[x + size * (y - 1)];
            const dyb = heights[x + size * (y + 1)] - heights[index];

            dx[index] = (dxl + dxr) * 0.5;
            dy[index] = (dyt + dyb) * 0.5;
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

        calculateDerivatives();
    };

    this.getHeight = (x, y) => heights[x + size * y];
    this.getDx = (x, y) => dx[x + size * y];
    this.getDy = (x, y) => dy[x + size * y];

    fill();
};

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