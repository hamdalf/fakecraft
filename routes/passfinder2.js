var express = require('express'),
    router = express.Router(),
    PathFinder = require('./pathfinder2');

router.route('/gridmaker/:space/:floor').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aGraph = PathFinder.getGraph(req.params.space, req.params.floor);

    res.json(aGraph.graph.grid);
    res.end();
});

module.exports = router;