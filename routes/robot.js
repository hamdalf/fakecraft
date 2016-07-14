var express = require('express'),
    router = express.Router(),
    Robot = require('../includes/robot');

var RobotCenter = {
    robots: {}
};

RobotCenter.addNewRobot = function (id, name) {
    if (typeof this.robots[id] == 'undefined') {
        this.robots[id] = new Robot();
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

router.route('/handsup/:id/:name').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.addNewRobot(req.params.id, req.params.name);
    res.json(aRobot);
    res.end();
});

router.route('/bye/:id').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.removeRobot(req.params.id);
    res.json(aRobot);
    res.end();
});

router.route('/tellmyposition/:id/:f/:x/:y/:d').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    var aRobot = RobotCenter.setPosition(req.params.id, req.params.f, req.params.x, req.params.y, req.params.d);
    res.json(aRobot);
    res.end();
});

router.route('/showmerobots/').all(function(req, res, next) {
    next();
}).get(function(req, res) {
    res.json(RobotCenter.robots);
    res.end();
});

module.exports = router;