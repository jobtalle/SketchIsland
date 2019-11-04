const RendererCSS = function(island, element) {
    const container = document.createElement("div");
    const slices = new Array(island.getPlan().getHeight());

    const makeSlice = (canvas, z) => {
        const element = document.createElement("div");

        element.className = RendererCSS.CLASS_SLICE;
        element.appendChild(canvas);
        element.style.top = (island.getPlan().getHeight() * 0.5 - z) + "px";

        return element;
    };

    const make = () => {
        this.clean();

        container.id = RendererCSS.ID_CONTAINER;

        for (let z = 0; z < island.getPlan().getHeight(); ++z)
            container.appendChild(slices[z] = makeSlice(island.getLayers()[z], z));

        element.appendChild(container);
    };

    this.clean = () => {
        while (element.firstChild)
            element.removeChild(element.firstChild);
    };

    this.render = (angle, pitch, scale) => {
        container.style.transform = "translate( " + (element.clientWidth * 0.5) + "px," + (element.clientHeight * 0.5) + "px) scale(" + scale + ")";

        for (let z = 0; z < island.getPlan().getHeight(); ++z)
            slices[z].style.transform = "scale(1," + pitch + ") rotate(" + angle + "rad) translate(" + (island.getPlan().getSize() * -0.5) + "px," + (island.getPlan().getSize() * -0.5) + "px)";
    };

    make();
};

RendererCSS.ID_CONTAINER = "slice-container";
RendererCSS.CLASS_SLICE = "slice";
