var express = require('express'),
    router = express.Router(),
    GraphSearch = require('./graphsearch2');

var PathFinder2 = {
    graphSearchs: {},
    latestVersion: {
        'indoor': {
            //floor: '1475237203275',
            floor: '1475307889009',
            desks: 'object_1473562024295',
            folder: 'indoor',
            optimized: true,
            width: 600,
            height: 350
        }
    }
};

PathFinder2.addGraph = function(space, floor) {
    if (typeof this.graphSearchs[space] == 'undefined') {
        this.graphSearchs[space] = {};
    }
    if (typeof this.graphSearchs[space][floor] == 'undefined') {
        this.graphSearchs[space][floor] = new GraphSearch();
        this.graphSearchs[space][floor].fileFolder = this.latestVersion[space].folder;
        this.graphSearchs[space][floor].floorFile = this.latestVersion[space].floor;
        this.graphSearchs[space][floor].deskFile = this.latestVersion[space].desks;
        this.graphSearchs[space][floor].optimized = this.latestVersion[space].optimized;
        this.graphSearchs[space][floor].xLength = this.latestVersion[space].width;
        this.graphSearchs[space][floor].yLength = this.latestVersion[space].height;
        this.graphSearchs[space][floor].set(space, floor);
    }

    return this.graphSearchs[space][floor];
};

PathFinder2.getGraph = function(space, floor) {
    if (typeof this.graphSearchs[space] == 'undefined' || typeof this.graphSearchs[space][floor] == 'undefined') {
        return this.addGraph(space, floor);
    } else {
        return this.graphSearchs[space][floor];
    }
};

module.exports = PathFinder2;