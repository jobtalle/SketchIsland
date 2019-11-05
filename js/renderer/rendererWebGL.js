const RendererWebGL = function(island, canvas) {
    const myr = new Myr(canvas, false, true);
    const surfaces = [];
    const clearColor = new Myr.Color(
        RendererWebGL.CLEAR_COLOR.r,
        RendererWebGL.CLEAR_COLOR.g,
        RendererWebGL.CLEAR_COLOR.b);

    const clear = () => {
        for (const surface of surfaces)
            surface.free();

        surfaces.length = 0;

        myr.setClearColor(new Myr.Color(0, 0, 0, 0));
        myr.clear();
        myr.flush();
        myr.setClearColor(clearColor);
    };

    const make = () => {
        clear();

        for (let z = 0; z < island.getPlan().getHeight(); ++z) {
            const canvas = island.getLayers()[z];
            const context = canvas.getContext("2d");
            const data = context.getImageData(0, 0, canvas.width, canvas.height);

            // TODO: It'd be nice if myr.js accepts a canvas directly, or unpacks it under the hood
            surfaces.push(new myr.Surface(canvas.width, canvas.height, data.data, true, false));
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

        for (let z = 0; z < island.getPlan().getHeight(); ++z) {
            myr.push();
            myr.translate(0, (island.getPlan().getHeight() * 0.5 - z) * scale);
            myr.scale(1, pitch);
            myr.rotate(-angle);
            myr.scale(scale, scale);

            surfaces[z].draw(island.getPlan().getSize() * -0.5, island.getPlan().getSize() * -0.5);

            myr.pop();
        }

        myr.pop();
        myr.flush();
    };

    make();
};

RendererWebGL.CLEAR_COLOR = StyleUtils.getColor("--color-ocean");