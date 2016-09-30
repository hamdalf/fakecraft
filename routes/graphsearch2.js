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
    this.space = null;
    this.floor = null;
    this.fileFolder = null;
    this.floorFile = null;
    this.deskFile = null;
    this.xLength = null;
    this.yLength = null;
    this.optimized = false;
};

GraphSearch.prototype = {
    init: function (nodes) {
        this.graph = new graph(nodes);
    },
    setPoint: function (x1, y1, x2, y2) {
        this.startPoint = this.graph.grid[x1][y1];
        this.endPoint = this.graph.grid[x2][y2];
    },
    set: function (s, f, r) {
        var r = r? r : false;
        if (this.space == null || this.floor == null || reload == true) {
            this.space = s;
            this.floor = f;
            console.log('a GraphSearch2 set : ' + this.space + ' / ' + this.floor);
            var filename = this.fileName,
                nodeRow, nodes = [];
            
            for (var x = 0; x < this.xLength; x++) {
                nodeRow = [];
                for (var y = 0; y < this.yLength; y++) {
                    nodeRow.push(WALL);
                }
                nodes.push(nodeRow);
            }

            var floorData = JSON.parse(fs.readFileSync(path.join(__dirname, '../saves/' + this.fileFolder + '/') + this.floorFile + '.json', 'utf8')),
                xHalf = Math.round(this.xLength / 2),
                yHalf = Math.round(this.yLength / 2);

            if (this.optimized) {
                for (var i = 0; i < floorData.length; i++) {
                    if (floorData[i].p == 'path') {
                        nodes[floorData[i].x + xHalf][floorData[i].z + yHalf] = 1;
                    }
                }
            } else {
                for (var i = 0; i < floorData.length; i++) {
                    if (floorData[i].p == 'floor') {
                        nodes[floorData[i].x + xHalf][floorData[i].z + yHalf] = 1;
                    } else if (floorData[i].p == 'wall') {
                        nodes[floorData[i].x + xHalf][floorData[i].z + yHalf] = WALL;
                    }
                }

                floorData = null;
                var deskData = JSON.parse(fs.readFileSync(path.join(__dirname, '../saves/' + this.fileFolder + '/') + this.deskFile + '.json', 'utf8')),
                    fW, tW, fH, tH, typeArr, minW, maxW, minH, maxH;
                
                for (var i = 0; i < deskData.length; i++) {
                    if (deskData[i].p == 'desk') {
                        if (deskData[i].r == true) {
                            fW = Math.ceil(deskData[i].x / 10) + xHalf - 5;
                            tW = Math.ceil(deskData[i].x / 10) + xHalf + 3;
                            fH = Math.ceil(deskData[i].z / 10) + yHalf - 8;
                            tH = Math.ceil(deskData[i].z / 10) + yHalf + 8;
                        } else {
                            fW = Math.ceil(deskData[i].x / 10) + xHalf - 8;
                            tW = Math.ceil(deskData[i].x / 10) + xHalf + 8;
                            fH = Math.ceil(deskData[i].z / 10) + yHalf - 5;
                            tH = Math.ceil(deskData[i].z / 10) + yHalf + 3;
                        }
                    } else {
                        typeArr = deskData[i].p.split('x');
                        if (deskData[i].r == true) {
                            if (typeArr[0] % 2 === 0) {
                                if (typeArr[1] % 2 === 0) {
                                    minW = Math.floor(typeArr[1] / 2);
                                    maxW = minW;
                                    minH = Math.floor(typeArr[0] / 2);
                                    maxH = minH;
                                } else {
                                    minW = Math.floor(typeArr[1] / 2);
                                    maxW = minW + 1;
                                    minH = Math.floor(typeArr[0] / 2);
                                    maxH = minH;
                                }
                            } else {
                                if (typeArr[1] % 2 === 0) {
                                    minW = Math.floor(typeArr[1] / 2);
                                    maxW = minW;
                                    minH = Math.floor(typeArr[0] / 2);
                                    maxH = minH + 1;
                                } else {
                                    minW = Math.floor(typeArr[1] / 2);
                                    maxW = minW + 1;
                                    minH = Math.floor(typeArr[0] / 2);
                                    maxH = minH + 1;
                                }
                            }
                            fW = Math.ceil(deskData[i].x / 10) + xHalf - (minW * 5);
                            tW = Math.ceil(deskData[i].x / 10) + xHalf + (maxW * 5);
                            fH = Math.ceil(deskData[i].z / 10) + yHalf - (minH * 5);
                            tH = Math.ceil(deskData[i].z / 10) + yHalf + (maxH * 5);
                        } else {
                            if (typeArr[0] % 2 === 0) {
                                minW = Math.floor(typeArr[0] / 2);
                                maxW = minW;
                                fW = Math.ceil(deskData[i].x / 10) + xHalf - (minW * 5);
                                tW = Math.ceil(deskData[i].x / 10) + xHalf + (maxW * 5);
                            } else {
                                minW = Math.floor(typeArr[0] / 2);
                                maxW = minW + 1;
                                fW = Math.ceil(deskData[i].x / 10) + xHalf - (minW * 5);
                                tW = Math.ceil(deskData[i].x / 10) + xHalf + (maxW * 5);
                            }
                            if (typeArr[1] % 2 === 0) {
                                minH = Math.floor(typeArr[1] / 2);
                                maxH = minH;
                                fH = Math.ceil(deskData[i].z / 10) + yHalf - (minH * 5);
                                tH = Math.ceil(deskData[i].z / 10) + yHalf + (maxH * 5);
                            } else {
                                minH = Math.floor(typeArr[1] / 2);
                                maxH = minH + 1;
                                fH = Math.ceil(deskData[i].z / 10) + yHalf - (minH * 5);
                                tH = Math.ceil(deskData[i].z / 10) + yHalf + (maxH * 5);
                            }
                        }
                    }
                    
                    for (var x = fW; x < tW; x++) {
                        for (var y = fH; y < tH; y++) {
                            nodes[x][y] = WALL;
                        }
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
            x, y, tmpLmt;
            console.log('find nearest point: ' + x1 + ', ' + y1);
        for (var l = 0; l < 50; l++) {
            //console.log(l);
            x = (x1 - l >= 0) ? x1 - l : 0;
            tmpLmt = (y1 + l < this.yLength) ? y1 + l : this.yLength - 1;
            for (y = (y1 - l >= 0) ? y1 - l : 0; y <= tmpLmt; y++) {
                //console.log('part1:',x, y, y1+l);
                if (this.graph.grid[x][y].weight > 0) {
                    return {"x": x, "y": y};
                }
            }
            y = (y1 - l >= 0) ? y1 - l : 0;
            tmpLmt = (x1 + l < this.xLength) ? x1 + l : this.xLength;
            for (x = (x1 - l + 1 >= 0) ? x1 - l + 1 : 0; x < tmpLmt; x++) {
                //console.log(x, y);
                if (this.graph.grid[x][y].weight > 0) {
                    return {"x": x, "y": y};
                }
            }
            y = (y1 + l < this.yLength) ? y1 + l : this.yLength - 1;
            tmpLmt = (x1 + l < this.xLength) ? x1 + l : this.xLength;
            for (x = (x1 - l + 1 >= 0) ? x1 - l + 1 : 0; x < tmpLmt; x++) {
                //console.log(x, y);
                if (this.graph.grid[x][y].weight > 0) {
                    return {"x": x, "y": y};
                }
            }
            x = (x1 + l < this.xLength) ? x1 + l  : this.xLength - 1;
            tmpLmt = (y1 + l < this.yLength) ? y1 + l : this.yLength - 1;
            for (y = (y1 - l >= 0) ? y1 - l : 0; y <= tmpLmt; y++) {
                //console.log(x, y);
                if (this.graph.grid[x][y].weight > 0) {
                    return {"x": x, "y": y};
                }
            }
        }
        return false;
    },
    reload: function() {
        this.set(this.space, this.floor, true);
    }
};

module.exports = GraphSearch;