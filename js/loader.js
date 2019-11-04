const Loader = function(element) {
    const loaded = document.getElementById("loaded");

    this.update = status => {
        loaded.style.width = (status * 100).toFixed(2) + "%";
    };
};