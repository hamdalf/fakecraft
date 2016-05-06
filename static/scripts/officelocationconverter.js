var OLC = {
    map: {
        geo: {
            zeroPoint: {        // array's 0,0 point
                longitude: null,
                latitude: null
            },
            diagonalPoint: {
                longitude: null,
                latitude: null
            },
            parallelDiagonalPoint: {
                longitude: null,
                latitude: null
            },
            objectScale: {
                width: null,    // meter unit
                height: null    // meter unit
            },
            longitude: {        // the position after rotating by [rotateDegree]
                min: null,
                max: null,
                length: null
            },
            latitude: {        // the position after rotating by [rotateDegree]
                min: null,
                max: null,
                length: null
            },
            rotateDegree: null    // radian unit
            /*latitude: {
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
            }*/
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
                this.map.geo.zeroPoint.longitude = arguments[1];
                this.map.geo.zeroPoint.latitude = arguments[2];
                this.map.geo.diagonalPoint.longitude = arguments[3];
                this.map.geo.diagonalPoint.latitude = arguments[4];
                this.map.geo.parallelDiagonalPoint.longitude = arguments[5];
                this.map.geo.parallelDiagonalPoint.latitude = arguments[6];
                this.map.geo.objectScale.width = arguments[7];
                this.map.geo.objectScale.height = arguments[8];
                this.map.geo.longitude.min = Math.min(this.map.geo.zeroPoint.longitude, this.map.geo.parallelDiagonalPoint.longitude);
                this.map.geo.latitude.min = Math.min(this.map.geo.zeroPoint.latitude, this.map.geo.parallelDiagonalPoint.latitude);
                this.map.geo.longitude.max = Math.max(this.map.geo.zeroPoint.longitude, this.map.geo.parallelDiagonalPoint.longitude);
                this.map.geo.latitude.max = Math.max(this.map.geo.zeroPoint.latitude, this.map.geo.parallelDiagonalPoint.latitude);
                if (this.map.geo.longitude.min < 0 && this.map.geo.longitude.max < 0) {
                    this.map.geo.longitude.length = Math.abs(this.map.geo.longitude.min - this.map.geo.longitude.max);
                } else {
                    this.map.geo.longitude.length = this.map.geo.longitude.max - this.map.geo.longitude.min;
                }
                if (this.map.geo.latitude.min < 0 && this.map.geo.latitude.max < 0) {
                    this.map.geo.latitude.length = Math.abs(this.map.geo.latitude.min - this.map.geo.latitude.max);
                } else {
                    this.map.geo.latitude.length = this.map.geo.latitude.max - this.map.geo.latitude.min;
                }
                var vdX = this.map.geo.diagonalPoint.longitude - this.map.geo.zeroPoint.longitude,
                    vdY = this.map.geo.diagonalPoint.latitude - this.map.geo.zeroPoint.latitude,
                    pdX = this.map.geo.parallelDiagonalPoint.longitude - this.map.geo.zeroPoint.longitude,
                    pdY = this.map.geo.parallelDiagonalPoint.latitude - this.map.geo.zeroPoint.latitude,
                    xdf = vdX - pdX,
                    ydf = vdY - pdY;
                this.map.geo.rotateDegree = Math.atan2(ydf, xdf);
                console.log(this.map.geo.rotateDegree);
                break;
            case 'array':
                this.map.array.x.min = arguments[1];
                this.map.array.x.max = arguments[2];
                this.map.array.y.min = arguments[3];
                this.map.array.y.max = arguments[4];
                this.map.array.x.length = this.map.array.x.max - this.map.array.x.min + 1;
                this.map.array.y.length = this.map.array.y.max - this.map.array.y.min + 1;
                this.map.geo.objectScale.width = this.map.array.x.length * 0.1; // meter unit
                this.map.geo.objectScale.height = this.map.array.y.length * 0.1; // meter unit
                break;
            case 'canvas':
                this.map.canvas.x.min = arguments[1];
                this.map.canvas.x.max = arguments[2];
                this.map.canvas.y.min = arguments[3];
                this.map.canvas.y.max = arguments[4];
                if (this.map.canvas.x.min < 0 && this.map.canvas.x.max < 0) {
                    this.map.canvas.x.length = Math.abs(this.map.canvas.x.min - this.map.canvas.x.max);
                } else {
                    this.map.canvas.x.length = this.map.canvas.x.max - this.map.canvas.x.min;
                }
                if (this.map.canvas.y.min < 0 && this.map.canvas.y.max < 0) {
                    this.map.canvas.y.length = Math.abs(this.map.canvas.y.min - this.map.canvas.y.max);
                } else {
                    this.map.canvas.y.length = this.map.canvas.y.max - this.map.canvas.y.min;
                }
                break;
        }
    }
};

var GeoUnit = function (longitude, latitude, altitude) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.altitude = altitude;
};

GeoUnit.prototype = {
    toArray: function() {
        var ratioX = OLC.map.array.x.length / OLC.map.geo.longitude.length,
            ratioY = OLC.map.array.y.length / OLC.map.geo.latitude.length,
            virtualX = this.longitude - this.map.geo.zeroPoint.longitude,
            virtualY = this.latitude - this.map.geo.zeroPoint.latitude,
            gridX = virtualX * Math.cos(this.map.geo.rotateDegree) - virtualY * Math.sin(this.map.geo.rotateDegree),
            gridY = virtualX * Math.sin(this.map.geo.rotateDegree) - virtualY * Math.cos(this.map.geo.rotateDegree),
            arrayX = Math.ceil((this.x - OLC.map.geo.longitude.min) * ratioX),
            arrayY = Math.ceil((this.y - OLC.map.geo.latitude.min) * ratioY);
        return new ArrayUnit(arrayX, arrayY);
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
        console.log('toArray', arrayX, arrayY);
        return new ArrayUnit(arrayX, arrayY);
    }
};