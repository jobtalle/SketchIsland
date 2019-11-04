const Color = function(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
};

Color.fromHex = hex => {
    const integer = parseInt(hex, 16);

    return new Color(
        ((integer >> 16) & 0xFF) / 255,
        ((integer >> 8) & 0xFF) / 255,
        (integer & 0xFF) / 255);
};