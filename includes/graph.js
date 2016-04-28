var gridNode = require('./gridnode'),
    aStar = require('./astar');

var astar = new aStar();

/**
* A graph memory structure
* @param {Array} gridIn 2D array of input weights
* @param {Object} [options]
* @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
*/
var Graph = function (gridIn, options) {
    options = options || {};
    this.nodes = [];
    this.diagonal = !!options.diagonal;
    this.grid = [];
    for (var x = 0; x < gridIn.length; x++) {
        this.grid[x] = [];

        for (var y = 0, row = gridIn[x]; y < row.length; y++) {
            var node = new gridNode(x, y, row[y]);
            this.grid[x][y] = node;
            this.nodes.push(node);
        }
    }
    this.init();
};

Graph.prototype.init = function() {
    this.dirtyNodes = [];
    for (var i = 0; i < this.nodes.length; i++) {
        astar.cleanNode(this.nodes[i]);
    }
};

Graph.prototype.cleanDirty = function() {
    for (var i = 0; i < this.dirtyNodes.length; i++) {
        astar.cleanNode(this.dirtyNodes[i]);
    }
    this.dirtyNodes = [];
};

Graph.prototype.markDirty = function(node) {
    this.dirtyNodes.push(node);
};

Graph.prototype.neighbors = function(node) {
    var ret = [],
        x = node.x,
        y = node.y,
        grid = this.grid;

    // West
    if(grid[x-1] && grid[x-1][y]) {
        ret.push(grid[x-1][y]);
    }

    // East
    if(grid[x+1] && grid[x+1][y]) {
        ret.push(grid[x+1][y]);
    }

    // South
    if(grid[x] && grid[x][y-1]) {
        ret.push(grid[x][y-1]);
    }

    // North
    if(grid[x] && grid[x][y+1]) {
        ret.push(grid[x][y+1]);
    }

    if (this.diagonal) {
        // Southwest
        if(grid[x-1] && grid[x-1][y-1]) {
            ret.push(grid[x-1][y-1]);
        }

        // Southeast
        if(grid[x+1] && grid[x+1][y-1]) {
            ret.push(grid[x+1][y-1]);
        }

        // Northwest
        if(grid[x-1] && grid[x-1][y+1]) {
            ret.push(grid[x-1][y+1]);
        }

        // Northeast
        if(grid[x+1] && grid[x+1][y+1]) {
            ret.push(grid[x+1][y+1]);
        }
    }

    return ret;
};

Graph.prototype.toString = function() {
    var graphString = [],
        nodes = this.grid, // when using grid
        rowDebug, row, y, l;
    for (var x = 0, len = nodes.length; x < len; x++) {
        rowDebug = [];
        row = nodes[x];
        for (y = 0, l = row.length; y < l; y++) {
            rowDebug.push(row[y].weight);
        }
        graphString.push(rowDebug.join(" "));
    }
    return graphString.join("\n");
};

module.exports = Graph;