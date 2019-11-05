const Island = function(lighting) {
    let ready = false;
    let plan = null;
    let layers = null;
    let z;

    this.generate = () => {
        const startTime = new Date();
        const size = plan.getSize();

        while ((new Date() - startTime) * 0.001 < Island.GEN_RATE) {
            let xMin = plan.getSize();
            let xMax = 0;
            let yMin = plan.getSize();
            let yMax = 0;

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const data = context.createImageData(plan.getSize(), plan.getSize());
            let index = 0;

            for (let y = 0; y < size; ++y) {
                let shapes = plan.getShapes().get(0, y, z);
                let shapesRefresh = Shapes.CELL_SIZE + 1;

                for (let x = 0; x < size; ++x) {
                    if (--shapesRefresh === 0) {
                        shapesRefresh = Shapes.CELL_SIZE;
                        shapes = plan.getShapes().get(x, y, z);
                    }

                    for (let shape = 0; shape < shapes.length; ++shape) {
                        if (shapes[shape].bounds.contains(x, y, z)) {
                            const sample = shapes[shape].sample(x, y, z);

                            if (!sample)
                                continue;

                            const l = lighting.get(sample.normal) * 255;

                            data.data[index] = Math.min(Math.round(sample.color.r * l), 255);
                            data.data[index + 1] = Math.min(Math.round(sample.color.g * l), 255);
                            data.data[index + 2] = Math.min(Math.round(sample.color.b * l), 255);
                            data.data[index + 3] = Math.round(sample.color.a * 255);

                            if (x < xMin)
                                xMin = x;

                            if (y < yMin)
                                yMin = y;

                            if (x > xMax)
                                xMax = x;

                            if (y > yMax)
                                yMax = y;

                            break;
                        }
                    }

                    index += 4;
                }
            }

            canvas.width = xMax - xMin;
            canvas.height = yMax - yMin;
            context.putImageData(data, -xMin, -yMin);

            if (xMin < xMax)
                layers.push(new Layer(xMin, yMin, canvas));

            if (++z === plan.getHeight()) {
                ready = true;

                break;
            }
        }

        return z / plan.getHeight();
    };

    this.isReady = () => ready;
    this.getLayers = () => layers;
    this.getPlan = () => plan;

    this.setPlan = newPlan => {
        z = 0;
        ready = false;
        plan = newPlan;
        layers = [];
    };
};

Island.GEN_RATE = 1 / 60;