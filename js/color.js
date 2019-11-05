const Color = function(r, g, b, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
};

Color.fromHex = hex => {
    const integer = parseInt(hex, 16);

    if (hex.length === 6)
        return new Color(
            ((integer >> 16) & 0xFF) / 255,
            ((integer >> 8) & 0xFF) / 255,
            (integer & 0xFF) / 255);

    return new Color(
        ((integer >> 24) & 0xFF) / 255,
        ((integer >> 16) & 0xFF) / 255,
        ((integer >> 8) & 0xFF) / 255,
        (integer & 0xFF) / 255);
};