var path = require('path'),
    fs = require('fs'),
    binaryHeap = require('../includes/binaryheap'),
    graph = require('../includes/graph'),
    aStar = require('../includes/astar'),
    WALL = 0;

var GraphSearch = function () {
    this.graph = null;
    this.startPoint = null;
    this.endPoint = null;
    this.astar = new aStar();
    this.floor = null;
};

GraphSearch.prototype = {
    init: function (nodes) {
        this.graph = new graph(nodes);
    },
    setPoint: function (x1, y1, x2, y2) {
        this.startPoint = this.graph.grid[x1][y1];
        this.endPoint = this.graph.grid[x2][y2];
    },
    set: function (f, r) {
        var r = r? r : false;
        if (this.floor == null || reload == true) {
            this.floor = f;
            console.log('a GraphSearch set floor: ' + this.floor);
            var filename = (this.floor == '19') ? 'floor19-v2' : 'floor20-v3',
                nodeRow, nodes = [];
            
            for (var x = 0; x < 530; x++) {
                nodeRow = [];
                for (var y = 0; y < 200; y++) {
                    nodeRow.push(WALL);
                }
                nodes.push(nodeRow);
            }
            
            var floorData = JSON.parse(fs.readFileSync(path.join(__dirname, '../saves/officemap/') + filename + '.json', 'utf8'));
            
            for (var i = 0; i < floorData.length; i++) {
                if (floorData[i].p == 'floor') {
                    nodes[floorData[i].x + 265][floorData[i].z + 100] = 1;
                } else if (floorData[i].p == 'wall') {
                    nodes[floorData[i].x + 265][floorData[i].z + 100] = WALL;
                }
            }
            
            floorData = null;
            
            filename = (this.floor == '19') ? 'desk_floor19' : 'desk_floor20';
            var deskData = JSON.parse(fs.readFileSync(path.join(__dirname, '../saves/officemap/') + filename + '.json', 'utf8')),
                fW, tW, fH, tH;
            
            for (var i = 0; i < deskData.length; i++) {
                if (deskData[i].t == 0) {
                    if (deskData[i].r == true) {
                        fW = Math.ceil(deskData[i].x / 10) + 265 - 5;
                        tW = Math.ceil(deskData[i].x / 10) + 265 + 3;
                        fH = Math.ceil(deskData[i].z / 10) + 100 - 8;
                        tH = Math.ceil(deskData[i].z / 10) + 100 + 8;
                    } else if (deskData[i].r == false) {
                        fW = Math.ceil(deskData[i].x / 10) + 265 - 8;
                        tW = Math.ceil(deskData[i].x / 10) + 265 + 8;
                        fH = Math.ceil(deskData[i].z / 10) + 100 - 5;
                        tH = Math.ceil(deskData[i].z / 10) + 100 + 3;
                    }
                } else if (deskData[i].t == 1) {
                    if (deskData[i].r == true) {
                        fW = Math.ceil(deskData[i].x / 10) + 265 - 10;
                        tW = Math.ceil(deskData[i].x / 10) + 265 + 10;
                        fH = Math.ceil(deskData[i].z / 10) + 100 - 20;
                        tH = Math.ceil(deskData[i].z / 10) + 100 + 20;
                    } else if (deskData[i].r == false) {
                        fW = Math.ceil(deskData[i].x / 10) + 265 - 20;
                        tW = Math.ceil(deskData[i].x / 10) + 265 + 20;
                        fH = Math.ceil(deskData[i].z / 10) + 100 - 10;
                        tH = Math.ceil(deskData[i].z / 10) + 100 + 10;
                    }
                }
                
                for (var x = fW; x < tW; x++) {
                    for (var y = fH; y < tH; y++) {
                        nodes[x][y] = WALL;
                    }
                }
            }

            this.init(nodes);
        } else {
            console.log('return from cache');
        }
    },
    getNearestPoint: function(x1, y1) {
        var x1 = parseInt(x1),
            y1 = parseInt(y1),
            x, y;
        for (var l = 0; l < 20; l++) {
            console.log(l);
            x = x1 - l;
            for (y = y1 - l; y <= y1 + l; y++) {
                console.log('part1:',x, y, y1+l);
                if (this.graph.grid[x][y].weight > 0) {
                    return {"x": x, "y": y};
                }
            }
            y = y1 - l;
            for (x = x1 - l + 1; x < x1 + l; x++) {
                console.log(x, y);
                if (this.graph.grid[x][y].weight > 0) {
                    return {"x": x, "y": y};
                }
            }
            y = y1 + l;
            for (x = x1 - l + 1; x < x1 + l; x++) {
                console.log(x, y);
                if (this.graph.grid[x][y].weight > 0) {
                    return {"x": x, "y": y};
                }
            }
            x = x1 + l;
            for (y = y1 - l; y <= y1 + l; y++) {
                console.log(x, y);
                if (this.graph.grid[x][y].weight > 0) {
                    return {"x": x, "y": y};
                }
            }
        }
        return false;
    },
    reload: function() {
        this.set(this.floor, true);
    }
};

module.exports = GraphSearch;