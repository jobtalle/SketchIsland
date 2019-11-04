const Island = function(lighting, plan) {
    let layers = null;

    const renderLayers = () => {
        const size = plan.getSize();

        for (let z = 0; z < plan.getHeight(); ++z) {
            const context = layers[z].getContext("2d");
            const data = context.createImageData(plan.getSize(), plan.getSize());
            let index = 0;

            for (let y = 0; y < size; ++y) {
                let shapes = null;
                let shapesRefresh = 1;

                for (let x = 0; x < size; ++x) {
                    if (--shapesRefresh === 0) {
                        shapesRefresh = Shapes.CELL_SIZE;
                        shapes = plan.getShapes().get(x, y, z);
                    }

                    for (const shape of shapes) {
                        if (!shape.bounds || shape.bounds.contains(x, y, z)) {
                            const sample = shape.sample(x, y, z);

                            if (!sample)
                                continue;

                            const l = lighting.get(sample.normal) * 255;

                            data.data[index] = Math.min(Math.round(sample.color.r * l), 255);
                            data.data[index + 1] = Math.min(Math.round(sample.color.g * l), 255);
                            data.data[index + 2] = Math.min(Math.round(sample.color.b * l), 255);
                            data.data[index + 3] = 255;

                            break; // TODO: Continue if alpha is not 1
                        }
                    }

                    index += 4;
                }
            }

            context.putImageData(data, 0, 0);
        }
    };

    this.getLayers = () => layers;

    this.getPlan = () => plan;

    this.setPlan = newPlan => {
        plan = newPlan;
        layers = new Array(plan.getHeight());

        for (let i = 0; i < plan.getHeight(); ++i) {
            const canvas = document.createElement("canvas");

            canvas.width = canvas.height = plan.getSize();

            layers[i] = canvas;
        }

        renderLayers();
    };

    this.setPlan(plan);
};