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

router.route('/passfinder/:space/:floor/:x1/:y1/:x2/:y2').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    console.log('pass finder 2 act');
    var space = req.params.space,
        floor = req.params.floor,
        x1 = req.params.x1,
        y1 = req.params.y1,
        x2 = req.params.x2,
        y2 = req.params.y2;
        
    var aGraph = PathFinder.getGraph(rreq.params.space, eq.params.floor);
        
    var startPoint = aGraph.graph.grid[x1][y1],
        endPoint = aGraph.graph.grid[x2][y2];

    if (aGraph.graph.grid[x2][y2].weight == 0) {
        var safePoint = aGraph.getNearestPoint(x2, y2);
        endPoint = aGraph.graph.grid[safePoint.x][safePoint.y];
        console.log('Change Goal: ' + safePoint.x + '/' + safePoint.y);
    }

    var path = aGraph.astar.search(aGraph.graph, startPoint, endPoint, {closest: false});
    
    res.json(path);
    res.end();
});

module.exports = router;