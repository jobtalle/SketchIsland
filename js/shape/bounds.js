const Bounds = function(start, end) {
    this.start = start;
    this.end = end;
};

Bounds.prototype.contains = function(x, y, z) {
    return x >= this.start.x && x <= this.end.x && y >= this.start.y && y < this.end.y && z >= this.start.z && z < this.end.z;
};