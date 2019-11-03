const Lighting = function() {
    const ambient = 0.85;
    const angle = new Vector3(1, -1, 2.5).normalize();

    this.get = normal => ambient + 2 * (1 - ambient) * Math.max(0, normal.dot(angle));
};