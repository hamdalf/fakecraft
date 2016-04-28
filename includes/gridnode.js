var GridNode = function (x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
};

GridNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
};

GridNode.prototype.getCost = function() {
    return this.weight;
};

GridNode.prototype.isWall = function() {
    return this.weight === 0;
};

module.exports = GridNode;