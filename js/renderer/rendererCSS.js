const RendererCSS = function(island, element) {
    let container, slices;

    const makeSlice = (canvas, z) => {
        const element = document.createElement("div");
        // TODO: Maybe don't wrap a useless div around it
        element.className = RendererCSS.CLASS_SLICE;
        element.appendChild(canvas);
        element.style.top = (island.getPlan().getHeight() * 0.5 - z) + "px";
        element.style.transform = "scale(0)";

        return element;
    };

    const make = () => {
        this.clean();

        container = document.createElement("div");
        container.id = RendererCSS.ID_CONTAINER;

        slices = new Array(island.getPlan().getHeight());

        for (let z = 0; z < island.getPlan().getHeight(); ++z)
            container.appendChild(slices[z] = makeSlice(island.getLayers()[z], z));

        element.appendChild(container);
    };

    this.setIsland = newIsland => {
        island = newIsland;

        make();
    };

    this.clean = () => {
        while (element.firstChild)
            element.removeChild(element.firstChild);
    };

    this.render = (angle, pitch, scale) => {
        const originOffset = Math.round(island.getPlan().getSize() * -0.5);
        const sliceTransform = "scale(1," + pitch + ") rotate(" + angle + "rad) translate(" + originOffset + "px," + originOffset + "px)";

        container.style.transform = "translate( " + (element.clientWidth * 0.5) + "px," + (element.clientHeight * 0.5) + "px) scale(" + scale + ")";

        for (let z = 0; z < island.getPlan().getHeight(); ++z)
            slices[z].style.transform = sliceTransform;
    };

    make();
};

RendererCSS.ID_CONTAINER = "slice-container";
RendererCSS.CLASS_SLICE = "slice";
