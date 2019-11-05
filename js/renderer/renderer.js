const Renderer = function(canvas2d, canvas3d, element) {
    let island = null;
    let current = null;
    let type = Renderer.TYPE_DEFAULT;

    this.supportsWebGL = canvas3d.getContext("webgl2") !== null;

    const instantiate = () => {
        if (current)
            current.clean();

        switch (type) {
            case Renderer.TYPE_CANVAS:
                current = new RendererCanvas(island, canvas2d);

                break;
            case Renderer.TYPE_CSS:
                current = new RendererCSS(island, element);

                break;
            case Renderer.TYPE_WEBGL:
                current = new RendererWebGL(island, canvasWebgl);

                break;
        }
    };

    this.setType = typeName => {
        type = typeName;

        instantiate();
    };

    this.update = newIsland => {
        island = newIsland;

        if (!current)
            instantiate();

        current.setIsland(island);
    };

    this.resize = (width, height) => {
        if (current)
            current.resize(width, height);
    };

    this.render = (angle, pitch, scale) => {
        current.render(angle, pitch, scale);
    };
};

Renderer.TYPE_CANVAS = "canvas";
Renderer.TYPE_CSS = "css";
Renderer.TYPE_WEBGL = "webgl";
Renderer.TYPE_DEFAULT = Renderer.TYPE_CANVAS;