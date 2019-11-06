const Vector3 = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Vector3.UP = new Vector3(0, 0, 1);

Vector3.prototype.dot = function(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
};

Vector3.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

Vector3.prototype.multiply = function(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;

    return this;
};

Vector3.prototype.divide = function(scalar) {
    return this.multiply(1 / scalar);
};

Vector3.prototype.normalize = function() {
    return this.divide(this.length());
};

Vector3.prototype.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;

    return this;
};

Vector3.prototype.subtract = function(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;

    return this;
};

Vector3.prototype.copy = function() {
    return new Vector3(this.x, this.y, this.z);
};

Vector3.prototype.cross = function(vector) {
    return new Vector3(
        this.y * vector.z - this.z * vector.y,
        this.z * vector.x - this.x * vector.z,
        this.x * vector.y - this.y * vector.x);
};