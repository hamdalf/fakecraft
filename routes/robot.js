var express = require('express'),
    router = express.Router(),
    PathFinder = require('./pathfinder'),
    PathFinder2 = require('./pathfinder2'),
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

RobotCenter.addNewRobotInSpace = function (id, name, space) {
    if (typeof this.robots[id] == 'undefined') {
        this.robots[id] = new Robot();
        this.robots[id].id = id;
        this.robots[id].name = name;
        this.robots[id].space = space;
    } else {
        this.robots[id].name = name;
        this.robots[id].space = space;
    }
    return this.robots[id];
};

RobotCenter.removeRobot = function (id) {
    if (typeof this.robots[id] == 'undefined') {
        return false;
    } else {
        var deletedRobot = new Robot();
        deletedRobot.id = id;
        //deletedRobot.name = this.robots[id].name;
        //deletedRobot.space = this.robots[id].space;
        delete this.robots[id];
        return deletedRobot;
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

RobotCenter.findIdleRobotInSpace = function(space, floor) {
    for (var key in this.robots) {
        if (this.robots[key].space == space && this.robots[key].position.f == floor && this.robots[key].isBusy == false) {
            return this.robots[key];
        }
    }
    return false;
};

RobotCenter.findIdleRobotInSpace = function(space, floor) {
    for (var key in this.robots) {
        if (this.robots[key].space == space && this.robots[key].position.f == floor && this.robots[key].isBusy == false) {
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
            //console.log(x, y);
            var safePoint = aGraph.getNearestPoint(x, y);
            endPoint = aGraph.graph.grid[safePoint.x][safePoint.y];
            //console.log('Change Goal: ' + safePoint.x + '/' + safePoint.y);
        }

        var path = aGraph.astar.search(aGraph.graph, startPoint, endPoint, {closest: false});
        console.log('move robot:' + path.length);
        aRobot.routes = path;
        return aRobot;
    }
};

RobotCenter.moveRobotInSpace = function(id, space, floor, x, y) {
    if (typeof this.robots[id] == 'undefined') {
        return false;
    } else {
        var aRobot = this.robots[id];
        aRobot.isBusy = true;
        var aGraph = PathFinder2.getGraph(space, floor);

        var startPoint = aGraph.graph.grid[aRobot.position.x][aRobot.position.y],
            endPoint = aGraph.graph.grid[x][y];

        if (aGraph.graph.grid[x][y].weight == 0) {
            console.log(x, y);
            var safePoint = aGraph.getNearestPoint(x, y);
            endPoint = aGraph.graph.grid[safePoint.x][safePoint.y];
            console.log('Change Goal: ' + safePoint.x + '/' + safePoint.y);
        }

        var path = aGraph.astar.search(aGraph.graph, startPoint, endPoint, {closest: false});

        aRobot.routes = path;
        return aRobot;
    }
};

RobotCenter.removeRoute = function(id) {
    if (typeof this.robots[id] == 'undefined') {
        return false;
    } else {
        var aRobot = this.robots[id];
        aRobot.routes = [];

        return aRobot;
    }
}

RobotCenter.makeRobotIdle = function(id) {
    if (typeof this.robots[id] == 'undefined') {
        return false;
    } else {
        var aRobot = this.robots[id];
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

router.route('/robot/handsup2/:id/:name/:space').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.addNewRobotInSpace(req.params.id, req.params.name, req.params.space);
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
    var aRobot = RobotCenter.setPosition(req.params.id, parseInt(req.params.f), parseInt(req.params.x), parseInt(req.params.y), req.params.d);
    res.json(aRobot);
    res.end();
});

router.route('/robot/showmerobots/').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var simplifiedResult = {};
    for (var item in RobotCenter.robots) {
        simplifiedResult[item] = {};
        for (var attr in RobotCenter.robots[item]) {
            if (attr != 'routes' && RobotCenter.robots[item].hasOwnProperty(attr)) {
                simplifiedResult[item][attr] = RobotCenter.robots[item][attr];
            } else if (attr == 'routes') {
                simplifiedResult[item][attr] = [];
            }
        }
    }
    res.json(simplifiedResult);
    res.end();
});

router.route('/robot/messageforarobot/:id').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = {};
    for (var attr in RobotCenter.robots[req.params.id]) {
        if (RobotCenter.robots[req.params.id].hasOwnProperty(attr)) {
            if (attr == 'routes') {
                var routes = RobotCenter.robots[req.params.id]['routes'];
                aRobot['routes'] = [];
                for (var i = 0; i < routes.length; i++ ) {
                    aRobot['routes'].push({
                        x: routes[i].x,
                        y: routes[i].y,
                        weight: routes[i].weight,
                        f: routes[i].f
                    });
                }
            } else {
                aRobot[attr] = RobotCenter.robots[req.params.id][attr];
            }
        }
    }
    res.json(aRobot);
    res.end();
});

router.route('/robot/sendarobot/:floor/:x/:y').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var floor = parseInt(req.params.floor),
        aRobot = RobotCenter.findIdleRobot(floor);

    if (aRobot == false) {
        res.json({result:false});
        res.end();
    } else {
        aRobot = RobotCenter.moveRobot(aRobot.id, floor, parseInt(req.params.x), parseInt(req.params.y));
        aRobot.result = true;
        res.json(aRobot);
        res.end();
    }
});

router.route('/robot/sendarobot2/:space/:floor/:x/:y').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var floor = parseInt(req.params.floor),
        aRobot = RobotCenter.findIdleRobotInSpace(req.params.space, floor);

    if (aRobot == false) {
        res.json({result:false});
        res.end();
    } else {
        aRobot = RobotCenter.moveRobotInSpace(aRobot.id, req.params.space, floor, parseInt(req.params.x), parseInt(req.params.y));
        aRobot.result = true;
        res.json(aRobot);
        res.end();
    }
});

router.route('/robot/eraseroute/:id').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.removeRoute(req.params.id);
    res.json(aRobot);
    res.end();
});

router.route('/robot/freerobot/:id').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.makeRobotIdle(req.params.id);
    res.json(aRobot);
    res.end();
});

module.exports = router;