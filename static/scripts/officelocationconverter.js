var OLC = {
    map: {
        geo: {
            latitude: {
                min: null,
                max: null,
                length: null
            },
            longitude: {
                min: null,
                max: null,
                length: null
            },
            altitude: {
                min: null,
                max: null,
                length: null
            }
        },
        array: {
            x: {
                min: null,
                max: null,
                length: null
            },
            y: {
                min: null,
                max: null,
                length: null
            }
        },
        canvas: {
            x: {
                min: null,
                max: null,
                length: null
            },
            y: {
                min: null,
                max: null,
                length: null
            }
        }
    },
    setMap: function () {
        if (arguments.length === 0) {
            return;
        }
        var unit = arguments[0];
        switch (unit) {
            case 'geo':
                this.map.geo.latitude.min = arguments[1];
                this.map.geo.latitude.max = arguments[2];
                this.map.geo.longitude.min = arguments[3];
                this.map.geo.longitude.max = arguments[4];
                this.map.geo.altitude.min = arguments[5];
                this.map.geo.altitude.max = arguments[6];
                this.map.geo.latitude.length = Math.abs(this.map.geo.latitude.min) + Math.abs(this.map.geo.latitude.max);
                this.map.geo.longitude.length = Math.abs(this.map.geo.longitude.min) + Math.abs(this.map.geo.longitude.max);
                this.map.geo.altitude.length = Math.abs(this.map.geo.altitude.min) + Math.abs(this.map.geo.altitude.max);
                break;
            case 'array':
                this.map.array.x.min = arguments[1];
                this.map.array.x.max = arguments[2];
                this.map.array.y.min = arguments[3];
                this.map.array.y.max = arguments[4];
                this.map.array.x.length = Math.abs(this.map.array.x.min) + Math.abs(this.map.array.x.max);
                this.map.array.y.length = Math.abs(this.map.array.y.min) + Math.abs(this.map.array.y.max);
                break;
            case 'canvas':
                this.map.canvas.x.min = arguments[1];
                this.map.canvas.x.max = arguments[2];
                this.map.canvas.y.min = arguments[3];
                this.map.canvas.y.max = arguments[4];
                this.map.canvas.x.length = Math.abs(this.map.canvas.x.min) + Math.abs(this.map.canvas.x.max);
                this.map.canvas.y.length = Math.abs(this.map.canvas.y.min) + Math.abs(this.map.canvas.y.max);
                break;
        }
    }
};

var GeoUnit = function (latitude, longitude, altitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
};

GeoUnit.prototype = {
    toArray: function() {
        
    },
    toCanvas: function() {
        
    }
};

var ArrayUnit = function (x, y) {
    this.x = x;
    this.y = y;
};

ArrayUnit.prototype = {
    toGeo: function() {
        
    },
    toCanvas: function() {
        var ratioX = OLC.map.canvas.x.length / OLC.map.array.x.length,
            ratioY = OLC.map.canvas.y.length / OLC.map.array.y.length,
            canvasX = (this.x * ratioX) + OLC.map.canvas.x.min,
            canvasY = (this.y * ratioY) + OLC.map.canvas.y.min;
        return new CanvasUnit(canvasX, canvasY);
    }
};

var CanvasUnit = function (x, y) {
    this.x = x;
    this.y = y;
};

CanvasUnit.prototype = {
    toGeo: function() {
        
    },
    toArray: function() {
        var ratioX = OLC.map.array.x.length / OLC.map.canvas.x.length,
            ratioY = OLC.map.array.y.length / OLC.map.canvas.y.length,
            arrayX = Math.ceil((this.x - OLC.map.canvas.x.min) * ratioX),
            arrayY = Math.ceil((this.y - OLC.map.canvas.y.min) * ratioY);
        return new ArrayUnit(arrayX, arrayY);
    }
};