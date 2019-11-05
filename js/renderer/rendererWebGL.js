const RendererWebGL = function(island, canvas) {
    const myr = new Myr(canvas, false, true);
    const surfaces = [];

    const clear = () => {
        for (const surface of surfaces)
            surface.free();

        surfaces.length = 0;

        myr.clear();
        myr.flush();
    };

    const make = () => {
        clear();

        if (island === null)
            return;

        for (let z = 0; z < island.getLayers().length; ++z) {
            const layer = island.getLayers()[z];
            const context = layer.canvas.getContext("2d");
            const data = context.getImageData(0, 0, layer.canvas.width, layer.canvas.height);

            for (let i = 0; i < data.data.length; i += 4) {
                const alpha = data.data[i + 3] / 255;

                data.data[i] = Math.round(data.data[i] * alpha);
                data.data[i + 1] = Math.round(data.data[i + 1] * alpha);
                data.data[i + 2] = Math.round(data.data[i + 2] * alpha);
            }

            surfaces.push(new myr.Surface(layer.canvas.width, layer.canvas.height, data.data, true, false));
        }
    };

    this.setIsland = newIsland => {
        island = newIsland;

        make();
    };

    this.clean = () => {
        clear();

        myr.free();
    };

    this.resize = (width, height) => {
        myr.resize(width, height);
    };

    this.render = (angle, pitch, scale) => {
        myr.clear();
        myr.bind();
        myr.push();

        myr.translate(myr.getWidth() * 0.5, myr.getHeight() * 0.5);

        for (let z = 0; z < island.getLayers().length; ++z) {
            const layer = island.getLayers()[z];

            myr.push();
            myr.translate(0, (island.getPlan().getHeight() * 0.5 - z) * scale);
            myr.scale(1, pitch);
            myr.rotate(-angle);
            myr.scale(scale, scale);

            surfaces[z].draw(
                island.getPlan().getSize() * -0.5 + layer.x,
                island.getPlan().getSize() * -0.5 + layer.y);

            myr.pop();
        }

        myr.pop();
        myr.flush();
    };

    myr.setClearColor(new Myr.Color(0, 0, 0, 0));

    make();
};