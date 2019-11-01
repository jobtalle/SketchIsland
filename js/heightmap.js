const Heightmap = function(size) {
    const heights = new Array(size * size);
    const noise = cubicNoiseConfig(Math.random());

    const fill = () => {
        const s = 0.02;
        const m = 3;
        const water = 0.25;

        for (let y = 0; y < size; ++y) for (let x = 0; x < size; ++x) {
            const dx = size * 0.5 - x;
            const dy = size * 0.5 - y;
            const multiplier = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / size * 2);

            let sample = 0;
            let influence = Heightmap.OCTAVE_INFLUENCE_INITIAL;
            let scale = s;

            for (let octave = 0; octave < Heightmap.OCTAVES; ++octave) {
                sample += cubicNoiseSample2(noise, x * scale, y * scale) * influence;

                influence /= Heightmap.OCTAVE_FALLOFF;
                scale *= 2;
            }

            heights[x + size * y] = multiplier * m * Math.pow(sample, 2) - water;
        }
    };

    this.get = (x, y) => heights[x + size * y];

    fill();
};

Heightmap.OCTAVES = 4;
Heightmap.OCTAVE_FALLOFF = 2;
Heightmap.OCTAVE_INFLUENCE_INITIAL = ((Heightmap.OCTAVE_FALLOFF - 1) *
    (Math.pow(Heightmap.OCTAVE_FALLOFF, Heightmap.OCTAVES))) /
    (Math.pow(Heightmap.OCTAVE_FALLOFF, Heightmap.OCTAVES) - 1) / Heightmap.OCTAVE_FALLOFF;