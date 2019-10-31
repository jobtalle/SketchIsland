const Heightmap = function(size) {
    const heights = new Array(size * size);
    const noise = cubicNoiseConfig(Math.random());

    const fill = () => {
        const s = 0.05;

        for (let y = 0; y < size; ++y) for (let x = 0; x < size; ++x)
            heights[x + size * y] = Math.pow(cubicNoiseSample2(noise, x * s, y * s), 4) - 0.08;
    };

    this.get = (x, y) => heights[x + size * y];

    fill();
};