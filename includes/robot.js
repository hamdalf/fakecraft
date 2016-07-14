var Robot = function() {
    this.id = 0;
    this.name = '';
    this.position = {
        x: 0,
        y: 0,
        f: 0
    };
    this.direction = '';    // x+, x-, y+, y-
    this.isBusy = false;
};

module.exports = Robot;