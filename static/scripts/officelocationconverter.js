// This code needs PROJ4JS.

var OLC = {
    map: {
        geo: {
            zeroPoint: {        // array's 0,0 point
                longitude: null,
                latitude: null
            },
            horizontalPoint: {
                longitude: null,
                latitude: null
            },
            verticalPoint: {
                longitude: null,
                latitude: null
            }
        },
        cartesian: {
            zeroPoint: null,    // {x:,y:} format
            horizontalPoint: null,
            verticalPoint: null,
            virtualHorizontalPoint: null,
            virtualVerticalPoint: null,
            rotateDegreeForTransform: null,    // radian unit
            x: {
                length: null
            },
            y: {
                length: null
            },
            objectScale: {
                width: null,
                height: null
            },
            getRotationDeg: function (p1, p2, p3) { // p1: center, p2 - p1 - p3 connection
                var p12 = Math.sqrt(Math.pow((p1.x - p2.x),2) + Math.pow((p1.y - p2.y),2)),
                    p13 = Math.sqrt(Math.pow((p1.x - p3.x),2) + Math.pow((p1.y - p3.y),2)),
                    p23 = Math.sqrt(Math.pow((p2.x - p3.x),2) + Math.pow((p2.y - p3.y),2)),
                    resultDegree = Math.acos(((Math.pow(p12, 2)) + (Math.pow(p13, 2)) - (Math.pow(p23, 2))) / (2 * p12 * p13)) * 180 / Math.PI;
                    
                return resultDegree;
            },
            getRotationRad: function (p1, p2, p3) { // p1: center, p2 - p1 - p3 connection
                var p12 = Math.sqrt(Math.pow((p1.x - p2.x),2) + Math.pow((p1.y - p2.y),2)),
                    p13 = Math.sqrt(Math.pow((p1.x - p3.x),2) + Math.pow((p1.y - p3.y),2)),
                    p23 = Math.sqrt(Math.pow((p2.x - p3.x),2) + Math.pow((p2.y - p3.y),2)),
                    resultRadian = Math.acos(((Math.pow(p12, 2)) + (Math.pow(p13, 2)) - (Math.pow(p23, 2))) / (2 * p12 * p13));
                    
                return resultRadian;
            },
            getDistance: function (p1, p2) {
                var xdf = p2.x - p1.x,
                    ydf = p2.y - p1.y;
                return Math.sqrt(Math.pow(xdf, 2) + Math.pow(ydf, 2));
            }
        },
        array: {
            x: {
                min: null,
                max: null,
                length: null,
                reverseFactor: 1
            },
            y: {
                min: null,
                max: null,
                length: null,
                reverseFactor: 1
            }
        },
        canvas: {
            x: {
                min: null,
                max: null,
                length: null,
                reverseFactor: 1
            },
            y: {
                min: null,
                max: null,
                length: null,
                reverseFactor: 1
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
                var gps = new proj4.Proj('EPSG:4326');    //source coordinates will be in Longitude/Latitude, WGS84
                var cat = new proj4.Proj('EPSG:3785');    //destination coordinates in meters, global spherical mercators projection, see http://spatialreference.org/ref/epsg/3785/
            
                this.map.geo.zeroPoint.longitude = arguments[1];
                this.map.geo.zeroPoint.latitude = arguments[2];
                this.map.geo.horizontalPoint.longitude = arguments[3];
                this.map.geo.horizontalPoint.latitude = arguments[4];
                this.map.geo.verticalPoint.longitude = arguments[5];
                this.map.geo.verticalPoint.latitude = arguments[6];
                
                this.map.cartesian.zeroPoint = proj4.transform(gps, cat, new proj4.toPoint([this.map.geo.zeroPoint.longitude, this.map.geo.zeroPoint.latitude]));
                this.map.cartesian.horizontalPoint = proj4.transform(gps, cat, new proj4.toPoint([this.map.geo.horizontalPoint.longitude, this.map.geo.horizontalPoint.latitude]));
                this.map.cartesian.verticalPoint = proj4.transform(gps, cat, new proj4.toPoint([this.map.geo.verticalPoint.longitude, this.map.geo.verticalPoint.latitude]));
                
                var parallelRotationDirection = -1; // -1 : clock wise, 1: anti clock wise
                var tmpParallelPoint = {x: this.map.cartesian.zeroPoint.x + parallelRotationDirection, y: this.map.cartesian.zeroPoint.y};
                
                this.map.cartesian.rotateDegreeForTransform = parallelRotationDirection * this.map.cartesian.getRotationRad(this.map.cartesian.zeroPoint, this.map.cartesian.horizontalPoint, tmpParallelPoint);
                
                var vX = this.map.cartesian.verticalPoint.x - this.map.cartesian.zeroPoint.x,
                    vY = this.map.cartesian.verticalPoint.y - this.map.cartesian.zeroPoint.y,
                    rX = vX * Math.cos(this.map.cartesian.rotateDegreeForTransform) - vY * Math.sin(this.map.cartesian.rotateDegreeForTransform),
                    rY = vX * Math.sin(this.map.cartesian.rotateDegreeForTransform) + vY * Math.cos(this.map.cartesian.rotateDegreeForTransform);
                    
                this.map.cartesian.virtualVerticalPoint = {x: rX + this.map.cartesian.zeroPoint.x, y: rY + this.map.cartesian.zeroPoint.y};
                
                vX = this.map.cartesian.horizontalPoint.x - this.map.cartesian.zeroPoint.x;
                vY = this.map.cartesian.horizontalPoint.y - this.map.cartesian.zeroPoint.y;
                rX = vX * Math.cos(this.map.cartesian.rotateDegreeForTransform) - vY * Math.sin(this.map.cartesian.rotateDegreeForTransform);
                rY = vX * Math.sin(this.map.cartesian.rotateDegreeForTransform) + vY * Math.cos(this.map.cartesian.rotateDegreeForTransform);
                    
                this.map.cartesian.virtualHorizontalPoint = {x: rX + this.map.cartesian.zeroPoint.x, y: rY + this.map.cartesian.zeroPoint.y};
                
                var xMin = Math.min(this.map.cartesian.virtualHorizontalPoint.x, this.map.cartesian.zeroPoint.x),
                    xMax = Math.max(this.map.cartesian.virtualHorizontalPoint.x, this.map.cartesian.zeroPoint.x),
                    yMin = Math.min(this.map.cartesian.virtualVerticalPoint.y, this.map.cartesian.zeroPoint.y),
                    yMax = Math.max(this.map.cartesian.virtualVerticalPoint.y, this.map.cartesian.zeroPoint.y);
                    
                this.map.cartesian.x.length = xMax - xMin;
                this.map.cartesian.y.length = yMax - yMin;
                break;
            case 'array':
                this.map.array.x.min = arguments[1];
                this.map.array.x.max = arguments[2];
                this.map.array.y.min = arguments[3];
                this.map.array.y.max = arguments[4];
                this.map.array.x.reverseFactor = arguments[5];
                this.map.array.y.reverseFactor = arguments[6];
                this.map.array.x.length = this.map.array.x.max - this.map.array.x.min + 1;
                this.map.array.y.length = this.map.array.y.max - this.map.array.y.min + 1;
                this.map.cartesian.objectScale.width = this.map.array.x.length * 0.1; // meter unit
                this.map.cartesian.objectScale.height = this.map.array.y.length * 0.1; // meter unit
                break;
            case 'canvas':
                this.map.canvas.x.min = arguments[1];
                this.map.canvas.x.max = arguments[2];
                this.map.canvas.y.min = arguments[3];
                this.map.canvas.y.max = arguments[4];
                this.map.canvas.y.reverseFactor = arguments[5];
                this.map.canvas.y.reverseFactor = arguments[6];
                this.map.canvas.x.length = this.map.canvas.x.max - this.map.canvas.x.min;
                this.map.canvas.y.length = this.map.canvas.y.max - this.map.canvas.y.min;
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
        var canvasUnit = this.toCanvas();
        return canvasUnit.toArray();
    },
    toCanvas: function() {
        var gps = new proj4.Proj('EPSG:4326');    //source coordinates will be in Longitude/Latitude, WGS84
        var cat = new proj4.Proj('EPSG:3785');    //destination coordinates in meters, global spherical mercators projection, see http://spatialreference.org/ref/epsg/3785/
        var ratioX = OLC.map.canvas.x.length / OLC.map.cartesian.x.length,
            ratioY = OLC.map.canvas.y.length / OLC.map.cartesian.y.length,
            cP = proj4.transform(gps, cat, new proj4.toPoint([this.longitude, this.latitude])),
            vX = cP.x - OLC.map.cartesian.zeroPoint.x,
            vY = cP.y - OLC.map.cartesian.zeroPoint.y,
            rX = vX * Math.cos(OLC.map.cartesian.rotateDegreeForTransform) - vY * Math.sin(OLC.map.cartesian.rotateDegreeForTransform),
            rY = vX * Math.sin(OLC.map.cartesian.rotateDegreeForTransform) + vY * Math.cos(OLC.map.cartesian.rotateDegreeForTransform),
            canvasX = ((rX * ratioX) - OLC.map.canvas.x.min) * OLC.map.canvas.x.reverseFactor,
            canvasY = ((rY * ratioY) - OLC.map.canvas.y.max) * OLC.map.canvas.y.reverseFactor;
        return new CanvasUnit(canvasX, canvasY);
    }
};

var ArrayUnit = function (x, y) {
    this.x = x;
    this.y = y;
};

ArrayUnit.prototype = {
    toGeo: function() {
        var canvasUnit = this.toCanvas();
        return canvasUnit.toGeo();
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
        var gps = new proj4.Proj('EPSG:4326');    //source coordinates will be in Longitude/Latitude, WGS84
        var cat = new proj4.Proj('EPSG:3785');    //destination coordinates in meters, global spherical mercators projection, see http://spatialreference.org/ref/epsg/3785/
        var ratioX = OLC.map.canvas.x.length / OLC.map.cartesian.x.length,
            ratioY = OLC.map.canvas.y.length / OLC.map.cartesian.y.length,
            rX = ((canvasX / OLC.map.canvas.x.reverseFactor) +  - OLC.map.canvas.x.min) / ratioX,
            rY = ((canvasY / OLC.map.canvas.y.reverseFactor) + OLC.map.canvas.y.max) / ratioY,
            vY = (rY - (rX * Math.tan(OLC.map.cartesian.rotateDegreeForTransform))) / (Math.sin(OLC.map.cartesian.rotateDegreeForTransform) * Math.tan(OLC.map.cartesian.rotateDegreeForTransform) + 1),
            vX = (rX / Math.cos(OLC.map.cartesian.rotateDegreeForTransform)) + (vY * Math.sin(OLC.map.cartesian.rotateDegreeForTransform) / Math.cos(OLC.map.cartesian.rotateDegreeForTransform)),
            cPx = vX + OLC.map.cartesian.zeroPoint.x,
            cPy = vY + OLC.map.cartesian.zeroPoint.y,
            gP = proj4.transform(cat, gps, new proj4.toPoint([cPx, cPy]));
        return new GeoUnit(gP.x, gP.y, 0);
    },
    toArray: function() {
        var ratioX = OLC.map.array.x.length / OLC.map.canvas.x.length,
            ratioY = OLC.map.array.y.length / OLC.map.canvas.y.length,
            arrayX = Math.ceil((this.x - OLC.map.canvas.x.min) * ratioX),
            arrayY = Math.ceil((this.y - OLC.map.canvas.y.min) * ratioY);
        return new ArrayUnit(arrayX, arrayY);
    }
};