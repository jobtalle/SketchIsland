const Heightmap = function(size) {
    const heights = new Array(size * size);
    const noise = cubicNoiseConfig(Math.random());

    const fill = () => {
        for (let y = 0; y < size; ++y) for (let x = 0; x < size; ++x) {
            const dx = size * 0.5 - x;
            const dy = size * 0.5 - y;
            const peakDistance = Math.min(1, Math.sqrt(dx * dx + dy * dy) / size * 2);
            const multiplier = Heightmap.MULTIPLIER * Math.pow(0.5 + 0.5 * Math.cos(Math.PI * peakDistance), Heightmap.PEAK_POWER);

            let sample = 0;
            let influence = Heightmap.OCTAVE_INFLUENCE_INITIAL;
            let scale = Heightmap.SCALE_INITIAL;

            for (let octave = 0; octave < Heightmap.OCTAVES; ++octave) {
                sample += cubicNoiseSample2(noise, x * scale, y * scale) * influence;

                influence /= Heightmap.OCTAVE_FALLOFF;
                scale *= Heightmap.SCALE_FALLOFF;
            }

            heights[x + size * y] = multiplier * Math.pow(sample, Heightmap.POWER) - Heightmap.WATER_THRESHOLD;
        }
    };

    this.get = (x, y) => heights[x + size * y];

    fill();
};

Heightmap.WATER_THRESHOLD = 0.1;
Heightmap.POWER = 4;
Heightmap.MULTIPLIER = 7;
Heightmap.PEAK_POWER = 0.7;
Heightmap.SCALE_INITIAL = 0.008;
Heightmap.SCALE_FALLOFF = 1.75;
Heightmap.OCTAVES = 6;
Heightmap.OCTAVE_FALLOFF = 1.5;
Heightmap.OCTAVE_INFLUENCE_INITIAL = ((Heightmap.OCTAVE_FALLOFF - 1) *
    (Math.pow(Heightmap.OCTAVE_FALLOFF, Heightmap.OCTAVES))) /
    (Math.pow(Heightmap.OCTAVE_FALLOFF, Heightmap.OCTAVES) - 1) / Heightmap.OCTAVE_FALLOFF;