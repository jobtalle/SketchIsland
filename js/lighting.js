const Lighting = function() {
    const ambient = 0.75;
    const angle = new Vector3(1, -1, 2.5).normalize();

    this.get = normal => ambient + 2 * (1 - ambient) * Math.max(0, normal.dot(angle));
    this.getAmbient = (normal, ambient) => ambient + 2 * (1 - ambient) * Math.max(0, normal.dot(angle));
};