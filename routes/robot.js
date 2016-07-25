var express = require('express'),
    router = express.Router(),
    PathFinder = require('./pathfinder'),
    Robot = require('../includes/robot');


var RobotCenter = {
    robots: {}
};

RobotCenter.countRobots = function() {
    var counter = 0;

    for (var key in this.robots) {
        counter++;
    }

    return counter;
};

RobotCenter.addNewRobot = function (id, name) {
    if (typeof this.robots[id] == 'undefined') {
        this.robots[id] = new Robot();
        this.robots[id].id = id;
        this.robots[id].name = name;
    } else {
        this.robots[id].name = name;
    }
    return this.robots[id];
};

RobotCenter.removeRobot = function (id) {
    if (typeof this.robots[id] == 'undefined') {
        return false;
    } else {
        delete this.robots[id];
    }
};

RobotCenter.setPosition = function (id, floor, x, y, d) {
    if (typeof this.robots[id] == 'undefined') {
        return false;
    } else {
        var aRobot = this.robots[id];
        aRobot.position.f = floor;
        aRobot.position.x = x;
        aRobot.position.y = y;
        aRobot.direction = d;

        return aRobot;
    }
};

RobotCenter.findIdleRobot = function(floor) {
    for (var key in this.robots) {
        if (this.robots[key].position.f == floor && this.robots[key].isBusy == false) {
            return this.robots[key];
        }
    }
    return false;
};

RobotCenter.moveRobot = function(id, floor, x, y) {
    if (typeof this.robots[id] == 'undefined') {
        return false;
    } else {
        var aRobot = this.robots[id];
        aRobot.isBusy = true;
        var aGraph = PathFinder.getGraph(floor);

        var startPoint = aGraph.graph.grid[aRobot.position.x][aRobot.position.y],
            endPoint = aGraph.graph.grid[x][y];

        if (aGraph.graph.grid[x][y].weight == 0) {
            var safePoint = aGraph.getNearestPoint(x, y);
            endPoint = aGraph.graph.grid[safePoint.x][safePoint.y];
            console.log('Change Goal: ' + safePoint.x + '/' + safePoint.y);
        }

        var path = aGraph.astar.search(aGraph.graph, startPoint, endPoint, {closest: false});

        aRobot.routes = path;
        return aRobot;
    }
};

RobotCenter.makeRobotIdle = function(id) {
    if (typeof this.robots[id] == 'undefined') {
        return false;
    } else {
        var aRobot = this.robots[id];
        aRobot.routes = [];
        aRobot.isBusy = false;

        return aRobot;
    }
};

router.route('/robot/handsup/:id/:name').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.addNewRobot(req.params.id, req.params.name);
    res.json(aRobot);
    res.end();
});

router.route('/robot/bye/:id').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.removeRobot(req.params.id);
    res.json(aRobot);
    res.end();
});

router.route('/robot/tellmyposition/:id/:f/:x/:y/:d').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.setPosition(req.params.id, req.params.f, req.params.x, req.params.y, req.params.d);
    res.json(aRobot);
    res.end();
});

router.route('/robot/showmerobots/').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    res.json(RobotCenter.robots);
    res.end();
});

router.route('/robot/messageforarobot/:id').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    res.json();
    res.end();
});

router.route('/robot/sendarobot/:floor/:x/:y').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var floor = req.params.floor,
        aRobot = RobotCenter.findIdleRobot(floor);

    if (aRobot == false) {
        res.json({result:false});
        res.end();
    } else {
        aRobot = RobotCenter.moveRobot(aRobot.id, floor, req.params.x, req.params.y);
        aRobot.result = true;
        res.json(aRobot);
        res.end();
    }
});

router.route('/robot/freerobot/:id').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.makeRobotIdle(req.params.id);
    res.json(aRobot);
    res.end();
});

module.exports = router;