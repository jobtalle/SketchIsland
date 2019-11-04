const Renderer = function(canvas, element) {
    let island = null;
    let current = null;
    let type = Renderer.TYPE_DEFAULT;

    const instantiate = () => {
        if (current)
            current.clean();

        switch (type) {
            case Renderer.TYPE_CANVAS:
                current = new RendererCanvas(island, canvas);

                break;
            case Renderer.TYPE_CSS:
                current = new RendererCSS(island, element);

                break;
        }
    };

    this.setType = typeName => {
        type = typeName;

        instantiate();
    };

    this.update = newIsland => {
        island = newIsland;

        instantiate();
    };

    this.resize = (width, height) => {

    };

    this.render = (angle, pitch, scale) => {
        current.render(angle, pitch, scale);
    };
};

Renderer.TYPE_CANVAS = "canvas";
Renderer.TYPE_CSS = "css";
Renderer.TYPE_DEFAULT = Renderer.TYPE_CANVAS;