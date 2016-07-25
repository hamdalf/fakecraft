var express = require('express'),
    router = express.Router(),
    GraphSearch = require('./graphsearch');

var PathFinder = {
    graphSearchs: {}
};

PathFinder.addGraph = function(floor) {
    if (typeof this.graphSearchs[floor] == 'undefined') {
        this.graphSearchs[floor] = new GraphSearch();
        this.graphSearchs[floor].set(floor);
    }

    return this.graphSearchs[floor];
};

PathFinder.getGraph = function(floor) {
    if (typeof this.graphSearchs[floor] == 'undefined') {
        return this.addGraph(floor);
    } else {
        return this.graphSearchs[floor];
    }
};

module.exports = PathFinder;