const Plan = function(size, height, scale, lighting) {
    let heightmap = null;
    let shapes = null;
    let shapeHeightmap = null;
    let step = 0;
    let ready = false;
    let firstLoadFrame = true;

    const steps = [
        () => {
            heightmap = new Heightmap(size);
        },
        () => {
            shapes = new Shapes(size, height);
            shapeHeightmap = new ShapeHeightmap(heightmap, height);
        },
        () => {
            new Trees(height, heightmap, shapeHeightmap.bounds, lighting, scale).plant(shapes);
        },
        () => {
            new Village(height, heightmap, shapeHeightmap.bounds, scale).place(shapes);
        },
        () => {
            shapes.add(shapeHeightmap);
        }
    ];

    this.isReady = () => ready;

    this.generate = maxRate => {
        if (firstLoadFrame) {
            firstLoadFrame = false;

            return 0;
        }

        const startTime = new Date();

        while ((new Date() - startTime) * 0.001 < maxRate && step < steps.length)
            steps[step++]();

        if (step === steps.length)
            ready = true;

        return step / steps.length;
    };

    this.getSize = () => size;
    this.getHeight = () => height;
    this.getShapes = () => shapes;
};