var Robot = function() {
    this.id = '';
    this.name = '';
    this.space = '';
    this.position = {
        x: 0,
        y: 0,
        f: 0
    };
    this.direction = '';    // x+, x-, y+, y-
    this.isBusy = false;
    this.routes = [];
};

module.exports = Robot;