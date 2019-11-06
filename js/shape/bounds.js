const Bounds = function(start, end) {
    this.start = start;
    this.end = end;
};

Bounds.prototype.contains = function(x, y, z) {
    return x >= this.start.x && x <= this.end.x && y >= this.start.y && y < this.end.y && z >= this.start.z && z < this.end.z;
};

Bounds.prototype.overlaps = function(other) {
    if (this.start.x > other.end.x || other.start.x > this.end.x)
        return false;

    if (this.start.y > other.end.y || other.start.y > this.end.y)
        return false;

    return !(this.start.z > other.end.z || other.start.z > this.end.z);
};