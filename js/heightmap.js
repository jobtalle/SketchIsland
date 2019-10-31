const Heightmap = function(size) {
    const heights = new Array(size * size);
    const noise = cubicNoiseConfig(Math.random());

    const fill = () => {
        const s = 0.05;
        const m = 1.5;
        const water = 0.1;

        for (let y = 0; y < size; ++y) for (let x = 0; x < size; ++x) {
            const dx = size * 0.5 - x;
            const dy = size * 0.5 - y;
            const multiplier = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / size * 2);

            heights[x + size * y] = multiplier * m * Math.pow(cubicNoiseSample2(noise, x * s, y * s), 1.5) - water;
        }
    };

    this.get = (x, y) => heights[x + size * y];

    fill();
};