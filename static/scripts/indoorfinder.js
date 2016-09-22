document.addEventListener('DOMContentLoaded', function() {
    
    var container3D, renderer, camera, scene,
        materials,
        geoDesk = [],
        mouse2D, raycaster, timerAnimationFrame, lastMsec,
        users, deskObjs, preChangedDeskId, selectedDeskId,
        cameraAct, userInfo, planeNav,
        startPoint, endPoint, routeMesh, pointMesh,
        robotMeshs = {},
        robotTrafficTimer,
        floorVersion = 'optimized_1474229147381',
        deskVersion = 'object_1473562024295',
        originCameraPosition = [3000, 5000, 6500],
        floorNow = 0,
        space = 'indoor',
        eventIgnoringSignalForCanvas = false;

    var lightInit = false;
    
    var topNavs = document.querySelectorAll('.topnav a');
    topNavs[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        userInfo.hide();
        navigation.sceneDefault();
        navigation.show();
    });
    
    
    var navMenus = document.querySelectorAll('nav .navs');
    navMenus[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        navigation.sceneSearch();
    });
    navMenus[1].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        navigation.sceneList();
        makeAllUserList();
    });
    navMenus[2].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        initOfficeMap();
    });
    
    var backMenu = document.querySelector('.navback');
    backMenu.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        navigation.sceneDefault();
    });
    
    var navigation = {
        element: document.querySelector('nav')
    };
    navigation.show = function () {
        this.element.style.display = 'block';
    };
    navigation.hide = function () {
        this.element.style.display = 'none';
    };
    navigation.sceneDefault = function() {
        this.element.classList.remove('s');
        this.element.classList.remove('l');
        document.querySelector('nav span').innerHTML = 'Please choose service';
    };
    navigation.sceneSearch = function() {
        this.element.classList.add('s');
        this.element.classList.remove('l');
        document.querySelector('nav span').innerHTML = 'Input name (min. 3 letters)';
        document.querySelector('#s').value = '';
        document.querySelector('.quickresult').classList.remove('show');
    };
    navigation.sceneList = function() {
        this.element.classList.remove('s');
        this.element.classList.add('l');
        document.querySelector('nav span').innerHTML = 'Select a name in the list';
    };
    
    var exploreMenus = document.querySelectorAll('.floornav a');
    exploreMenus[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        eventIgnoringSignalForCanvas = true;
        cameraAct.move('rotateleft');
    });
    exploreMenus[1].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('pedestalleft');
    });
    exploreMenus[2].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('pedestalup');
    });
    exploreMenus[3].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('pedestaldown');
    });
    exploreMenus[4].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('pedestalright');
    });
    exploreMenus[5].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        eventIgnoringSignalForCanvas = true;
        cameraAct.move('rotateright');
    });
    exploreMenus[6].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('zoomin');
    });
    exploreMenus[7].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        //cameraAct.move('zoomout');
        //cameraAct.setSpinPoint(0, 0, 0);
        cameraAct.backToPoint(originCameraPosition[0], originCameraPosition[1], originCameraPosition[2]);
        
    });
    
    var turnOnFloorBtn = function(floor) {
        switch (floor) {
            case 19:
                exploreMenus[0].classList.add('on');
                exploreMenus[1].classList.remove('on');
                break;
            case 20:
                exploreMenus[1].classList.add('on');
                exploreMenus[0].classList.remove('on');
                break;
        }
    };
    
    var inputKeyword = document.querySelector('#s');
    inputKeyword.addEventListener('keyup', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var inputWord = (e.srcElement) ? e.srcElement.value : e.target.value;
        if (inputWord.length > 2) {
            makeListByKeyword(inputWord);
        } else {
            
        }
    });
    
    var makeListByKeyword = function (kw) {
        var keyword = kw.toLowerCase(),
            wrapper = document.querySelector('.quickresult'),
            df = document.createDocumentFragment(),
            tr, ta, counter = 0;
        
        wrapper.classList.remove('show');
        wrapper.innerHTML = '';
        for (var i = 0; i < users.length; i++) {
            if (users[i].name.toLowerCase().search(keyword.replace(/_amp_/g, '&')) > -1) {
                tr = document.createElement('li');
                switch (users[i].dataType) {
                    case '0':
                        tr.classList.add('people');
                        break;
                    case '1':
                        tr.classList.add('position');
                        break;
                    default:
                        tr.classList.add('people');
                        break;
                }
                ta = document.createElement('a');
                ta.setAttribute('href', '#');
                ta.setAttribute('data-id', users[i]._id);
                ta.innerHTML = users[i].name.replace(/_amp_/g, '&');
                ta.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    onUserNameClick(e);
                });
                tr.appendChild(ta);
                df.appendChild(tr);
                counter++;
            }
        }
        
        if (counter === 0) {
            tr = document.createElement('li');
            ta = document.createElement('a');
            ta.setAttribute('href', '#');
            ta.innerHTML = 'Nobody matched';
            tr.appendChild(ta);
            df.appendChild(tr);
        }
        wrapper.appendChild(df);
        wrapper.classList.add('show');
    };
    
    var onUserNameClick = function (e) {
        var userID = (e.srcElement) ? e.srcElement.getAttribute('data-id') : e.target.getAttribute('data-id'),
            user = findUserDataById(userID);
        
        initOfficeMap(function(uid) {
            return function () {
                var objDesk = findDeskByUserId(userID);
                if (objDesk) {
                    objDesk.select();
                    cameraAct.closeToDesk(objDesk);
                }
            };
        }(userID));
    };
    
    var makeAllUserList = function () {
        var wrapper = document.querySelector('.lists'),
            df = document.createDocumentFragment(),
            tr, ta, counter = 0;
        
        wrapper.innerHTML = '';
        for (var i = 0; i < users.length; i++) {
            tr = document.createElement('li');
            switch (users[i].dataType) {
                case '0':
                    tr.classList.add('people');
                    break;
                case '1':
                    tr.classList.add('position');
                    break;
                default:
                    tr.classList.add('people');
                    break;
            }
            ta = document.createElement('a');
            ta.setAttribute('href', '#');
            ta.setAttribute('data-id', users[i]._id);
            ta.innerHTML = users[i].name.replace(/_amp_/g, '&');
            ta.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                onUserNameClick(e);
            });
            tr.appendChild(ta);
            df.appendChild(tr);
            counter++;
        }

        wrapper.appendChild(df);
    };

    // desk deometry
    var objectType = ['desk', '2x2',  '2x3', '2x4', '2x5', '2x6', '3x3', '3x4', '3x5', '3x6', '3x7', '3x8',
                    '4x4', '4x5', '4x6', '4x7', '4x8', '4x9', '4x10', '5x5', '5x6', '5x7', '5x8', '5x9', '5x10',
                    '6x6', '6x7', '6x8', '6x9', '6x10', '8x9', '8x10', '10x15', '12x18'];
    var deskGeo = {};
    var loadDeskGeos = function (idx) {
        if (idx >= objectType.length) {
            return;
        }
        var rType = objectType[idx],
            fileName = encodeURIComponent('desk_' + rType),
            xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/file/indoor/' + fileName, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
            if (this.status == 200) {
                var geometries = this.response;
                deskGeo[rType] = THREE.JSONLoader.prototype.parse(geometries[0].g.data);
                loadDeskGeos(idx + 1);
            }
        };
        xhr.send();
    };
    
    // Initialization
    var init = function() {
        // user data
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/maker/', true);
        xhr.responseType = 'json';
        //xhr.responseType = 'text';
        xhr.onload = function (e) {
			if (this.status == 200) {
                users = this.response;
                //users = JSON.parse(this.responseText);
			}
		};
		xhr.send();
        
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
        }
        
        container3D = document.querySelector('#canvasContainer');
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true
		});
        renderer.setSize(window.innerWidth, window.innerHeight);
	    container3D.appendChild(renderer.domElement);
        
        /**
         * Camera
         */
        camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 50, 1e7);
        //camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -500, 10000);
        //camera.fov == 30;

        scene = new THREE.Scene();
        scene.add(camera);
        
        planeNav = new PlaneNavigator();
        scene.add(planeNav.root);
        
        THREEx.WindowResize(renderer, camera);
        window.addEventListener('resize', function (e) {
            planeNav.moveAtTheFrontOf(camera);
        });
        
        /**
         * Global Materials
         */
        materials = {};
        var tmpTex, tmpMat;
        
        for (var k in cubePattern) {
            if (!materials[k]) {
                materials[k] = {};
            }
            for (var l in cubePattern[k]) {
                tmpTex = {};
                for (var m in cubePattern[k][l]) {
                    tmpTex[m] = cubePattern[k][l][m];
                }
                tmpMat = new THREE.MeshLambertMaterial(tmpTex);
                tmpMat._p = k;
                tmpMat._t = l;
                materials[k][l] = tmpMat;
            }
        }

        loadDeskGeos(0);
        
        
        // Mouse, Raycaster
        mouse2D = new THREE.Vector2();
		raycaster = new THREE.Raycaster();
        
        var onDocumentMouseMove = function (e) {
            mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse2D.y = - (e.clientY / window.innerHeight) * 2 + 1;
        };
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        
        var onDocumentClick = function (e) {
            if (eventIgnoringSignalForCanvas) {
                eventIgnoringSignalForCanvas = false;
                return;
            }

            if (e.altKey) {
                return makePath(e);
            }
            
            raycaster.setFromCamera(mouse2D, camera);
            var intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
                var intersector = getRealIntersector(intersects);

                if (intersector) {
                    if (intersector.object.name === 'desk') {
                        var desk = findDeskById(intersector.object.uuid);
                        desk.select();
                        cameraAct.closeToDesk(desk);
                    } else if (intersector.object.name === 'btnUp') {
                        cameraAct.hedgehop(400, 0, 0);
                    } else if (intersector.object.name === 'btnDown') {
                        cameraAct.hedgehop(-400, 0, 0);
                    } else if (intersector.object.name === 'btnLeft') {
                        cameraAct.hedgehop(0, 0, -400);
                    } else if (intersector.object.name === 'btnRight') {
                        cameraAct.hedgehop(0, 0, 400);
                    }
                    //goToDeskInfo(intersector.desk._userID, intersector.desk.uuid);
                }
            }
        };

        var makePath = function (e) {
            raycaster.setFromCamera(mouse2D, camera);
            var intersects = raycaster.intersectObjects(scene.children, true);
            
            if (intersects.length > 0) {
                var intersector = getMapIntersector(intersects);
                
                if (intersector) {
                    if (!startPoint) {
                        startPoint = new CanvasUnit(intersector.point.x, intersector.point.z);
                    } else if (!endPoint) {
                        endPoint = new CanvasUnit(intersector.point.x, intersector.point.z);
                        var startArray = startPoint.toArray(),
                            endArray = endPoint.toArray();
                            //flipSArray = {x: 529 - startArray.x, y: 199 - startArray.y},
                            //flipEArray = {x: 529 - endArray.x, y: 199 - endArray.y};
                            console.log(startPoint, endPoint);
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', '/api/passfinder/' + floorNow + '/' + startArray.x + '/' + startArray.y + '/' + endArray.x + '/' + endArray.y, true);
                        xhr.responseType = 'json';
                        xhr.onload = function (e) {
                            if (this.status == 200) {
                                console.log(this.response);
                                createRoute(this.response);
                                startPoint = null;
                                endPoint = null;
                            }
                        };
                        xhr.send();
                    }
                }
            }
        };
        //document.addEventListener('click', onDocumentClick, false);
        container3D.addEventListener('click', onDocumentClick, false);
        
        if (OLC) {
            OLC.setMap('array', 0, 599, 0, 349);
            OLC.setMap('canvas', -3000, 3000, -1750, 1750);
            OLC.setMap('geo', 13.421238, 52.525556, 13.420783, 52.525176, 13.421007, 52.525659);
        }
    };
    
    var findUserDataById = function(id) {
        var result = null;
        
        for (var i = 0; i < users.length; i++) {
            if (users[i]._id === id) {
                result = users[i];
            }
        }
        
        return result;
    };
    
    var getRealIntersector = function (intersects) {
		var intersector;
		for (var i = 0; i < intersects.length; i++) {
			intersector = intersects[i];
            if (intersector.object.name) {
                switch (intersector.object.name) {
                    case 'desk':
                    case 'btnUp':
                    case 'btnDown':
                    case 'btnLeft':
                    case 'btnRight':
                        return intersector;
                        break;
                }
            }
		}
	};
    
    var getMapIntersector = function (intersects) {
        var intersector;
		for (var i = 0; i < intersects.length; i++) {
			intersector = intersects[i];
            if (intersector.object.name) {
                switch (intersector.object.name) {
                    case 'map':
                        return intersector;
                        break;
                }
            }
		}
    };
    
    var cameraAction = function () {
        this.isMoving = false;
        this.moveType = null;
        this.heightLimit = 1000;
        this.heightMax = 8500;
        this.startPosition = null;
        this.speedDistance = 3;
        this.speedAngle = Math.PI * 0.001;
        this.totalDistance = null;
        this.totalAngle = null;
        this.spinPoint = null;
        this.finalPosition = null;
        this.speedDistanceX = null;
        this.speedDistanceY = null;
        this.speedDistanceZ = null;
    };
    
    cameraAction.prototype.move = function (op) {
        if (this.isMoving === false) {
            this.startPosition = camera.position.clone();
            this.moveType = op;
            this.isMoving = true;
            switch (this.moveType) {
                case 'zoomin':
                    this.totalDistance = 1000;
                    break;
                case 'zoomout':
                    this.totalDistance = 1000;
                    break;
                case 'pedestalleft':
                    this.totalDistance = 1000;
                    break;
                case 'pedestalright':
                    this.totalDistance = 1000;
                    break;
                case 'pedestalup':
                    this.totalDistance = 1000;
                    break;
                case 'pedestaldown':
                    this.totalDistance = 1000;
                    break;
                case 'rotateleft': // see left, move right
                    this.totalAngle = Math.PI / 3;
                    var crossingPoint = this.getCrossingPointOnPlane();
                    crossingPoint.y = 10;
                    this.spinPoint = crossingPoint;
                    break;
                case 'rotateright':  // see right, move left
                    this.totalAngle = Math.PI / 3;
                    var crossingPoint = this.getCrossingPointOnPlane();
                    crossingPoint.y = 10;
                    this.spinPoint = crossingPoint;
                    break;
            }
        }
    };
    
    cameraAction.prototype.hedgehop = function(x, y, z) {
        if (this.isMoving === false) {
            //if (camera.position.y <= this.heightLimit) {
                this.isMoving = true;
                this.startPosition = camera.position.clone();
                this.moveType = 'hedgehop';
                var dx = x, dy = 0, dz = z;
                this.finalPosition = new THREE.Vector3();
                this.finalPosition.x = camera.position.x + dx;
                this.finalPosition.y = this.heightLimit;
                this.finalPosition.z = camera.position.z + dz;
                this.speedDistanceX = Math.abs(dx / 500);
                this.speedDistanceY = Math.abs(dy / 500);
                this.speedDistanceZ = Math.abs(dz / 500);
                this.spinPoint.x = this.spinPoint.x + dx;
                this.spinPoint.y = 10;
                this.spinPoint.z = this.spinPoint.z + dz;
            //}
        }
    };
    
    cameraAction.prototype.closeToDesk = function (deskObj) {
        if (this.isMoving === false) {
            this.startPosition = camera.position.clone();
            this.isMoving = true;
            if (camera.position.y <= this.heightLimit) {
                this.moveType = 'hedgehop';
                var dx = deskObj.desk.position.x - this.spinPoint.x;
                var dy = 0;    // no meaning. because 'hedgehop' will keep y position.
                var dz = deskObj.desk.position.z - this.spinPoint.z;
                this.finalPosition = new THREE.Vector3();
                this.finalPosition.x = camera.position.x + dx;
                this.finalPosition.y = this.heightLimit;
                this.finalPosition.z = camera.position.z + dz;
                this.speedDistanceX = Math.abs(dx / 500);
                this.speedDistanceY = Math.abs(dy / 500);
                this.speedDistanceZ = Math.abs(dz / 500);
                this.spinPoint.x = this.spinPoint.x + dx;
                this.spinPoint.y = 10;
                this.spinPoint.z = this.spinPoint.z + dz;
            } else {
                this.moveType = 'closetodesk';
                var tmpCameraClone = new THREE.Object3D();
                //var tmpCameraClone = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 50), new THREE.MeshLambertMaterial({color: 0xff6600}));
                tmpCameraClone.applyMatrix(camera.matrix);
                tmpCameraClone.position.set(deskObj.desk.position.x, deskObj.desk.position.y, deskObj.desk.position.z);
                tmpCameraClone.translateZ(500);
                this.finalPosition = new THREE.Vector3();
                this.finalPosition.x = tmpCameraClone.position.x;
                this.finalPosition.y = tmpCameraClone.position.y;
                this.finalPosition.z = tmpCameraClone.position.z;
                var dx = this.startPosition.x - this.finalPosition.x;
                var dy = this.startPosition.y - this.finalPosition.y;
                var dz = this.startPosition.z - this.finalPosition.z;
                //this.totalDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                this.speedDistanceX = Math.abs(dx / 1000);
                this.speedDistanceY = Math.abs(dy / 1000);
                this.speedDistanceZ = Math.abs(dz / 1000);
                this.spinPoint.x = deskObj.desk.position.x;
                this.spinPoint.y = 10;
                this.spinPoint.z = deskObj.desk.position.z;
            }
        }
    };
    
    cameraAction.prototype.forwardToPoint = function (px, py, pz) {
        if (this.isMoving === false) {
            this.moveType = 'forwardtopoint';
            this.startPosition = camera.position.clone();
            this.isMoving = true;
            this.finalPosition = new THREE.Vector3();
            this.finalPosition.x = px;
            this.finalPosition.y = py;
            this.finalPosition.z = pz;
            var dx = this.startPosition.x - this.finalPosition.x;
            var dy = this.startPosition.y - this.finalPosition.y;
            var dz = this.startPosition.z - this.finalPosition.z;
            this.speedDistanceX = Math.abs(dx / 1000);
            this.speedDistanceY = Math.abs(dy / 1000);
            this.speedDistanceZ = Math.abs(dz / 1000);
            this.spinPoint.x = this.spinPoint.x + dx;
            this.spinPoint.y = 10;
            this.spinPoint.z = this.spinPoint.x + dz;
        }
    };
    
    cameraAction.prototype.backToPoint = function (px, py, pz) {
        if (this.isMoving === false) {
            this.moveType = 'backwardtopoint';
            this.startPosition = camera.position.clone();
            this.isMoving = true;
            this.finalPosition = new THREE.Vector3();
            this.finalPosition.x = px;
            this.finalPosition.y = py;
            this.finalPosition.z = pz;
            var dx = this.startPosition.x - this.finalPosition.x;
            var dy = this.startPosition.y - this.finalPosition.y;
            var dz = this.startPosition.z - this.finalPosition.z;
            this.speedDistanceX = Math.abs(dx / 1000);
            this.speedDistanceY = Math.abs(dy / 1000);
            this.speedDistanceZ = Math.abs(dz / 1000);
            this.spinPoint.x = 0;
            this.spinPoint.y = 0;
            this.spinPoint.z = 0;
        }
    };
    
    cameraAction.prototype.animate = function (delta) {
        var distanceFromMap = Math.sqrt(camera.position.x * camera.position.x + camera.position.y * camera.position.y + camera.position.z * camera.position.z);
        
        if (this.totalDistance && this.finalPosition === null) {
            var dx = camera.position.x - this.startPosition.x;
            var dy = camera.position.y - this.startPosition.y;
            var dz = camera.position.z - this.startPosition.z;
            var distanceUntilNow = Math.sqrt(dx * dx + dy * dy + dz * dz);
            var distanceAtOnce = this.speedDistance * delta;
            if (distanceUntilNow + distanceAtOnce >= this.totalDistance) {
                distanceAtOnce = this.totalDistance - distanceUntilNow;
                this.totalDistance = null;
                this.isMoving = false;
            }
        }

        if (this.totalAngle) {
            var vs = this.startPosition.clone();
            var vc = camera.position.clone();
            // angle is caculated on plane (y = 0)
            vs.y = 0;
            vc.y = 0;
            var dot = vs.dot(vc);
            var angleUntilNow = Math.acos(dot / (vs.length() * vc.length()));
            var angleAtOnce = this.speedAngle * delta;
            if (angleUntilNow + angleAtOnce >= this.totalAngle) {
                angleAtOnce = this.totalAngle - angleUntilNow;
                this.totalAngle = null;
                this.isMoving = false;
            }
        }
        
        if (this.finalPosition) {
            var tmpPosition = new THREE.Vector3();
            tmpPosition.set(camera.position.x, camera.position.y, camera.position.z);
            tmpPosition.x = (tmpPosition.x > this.finalPosition.x) ? tmpPosition.x - this.speedDistanceX * delta : tmpPosition.x + this.speedDistanceX * delta;
            tmpPosition.y = (tmpPosition.y > this.finalPosition.y) ? tmpPosition.y - this.speedDistanceY * delta : tmpPosition.y + this.speedDistanceY * delta;
            if (tmpPosition.y < this.heightLimit) {
                tmpPosition.y = this.heightLimit;
            }
            tmpPosition.z = (tmpPosition.z > this.finalPosition.z) ? tmpPosition.z - this.speedDistanceZ * delta : tmpPosition.z + this.speedDistanceZ * delta;
            var dx = Math.abs(tmpPosition.x - this.finalPosition.x);
            var dy = Math.abs(tmpPosition.y - this.finalPosition.y);
            var dz = Math.abs(tmpPosition.z - this.finalPosition.z);
            var distanceUntilNow = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
//console.log(dx, dy, dz, distanceUntilNow);
            //if (distanceUntilNow <= this.heightLimit || camera.position.y <= this.heightLimit) {
            if (this.moveType === 'closetodesk' && camera.position.y <= this.heightLimit) {
                //tmpPosition.set(camera.position.x, camera.position.y, camera.position.z);
                container3D.classList.add('hedgehop');
                planeNav.show();
                this.isMoving = false;
            } else if (this.moveType === 'hedgehop' && dx <= this.speedDistanceX * delta && dz <= this.speedDistanceZ * delta) {
                tmpPosition.x = this.finalPosition.x;
                tmpPosition.y = this.finalPosition.y;
                tmpPosition.z = this.finalPosition.z;
                container3D.classList.add('hedgehop');
                planeNav.show();
                this.isMoving = false;
            } else if (this.moveType === 'backwardtopoint' && ((dx <= this.speedDistanceX * delta && dz <= this.speedDistanceZ * delta) || distanceFromMap >= this.heightMax)) {
                this.isMoving = false;
            } else if (this.moveType === 'forwardtopoint' && ((dx <= this.speedDistanceX * delta && dz <= this.speedDistanceZ * delta) || camera.position.y <= this.heightLimit)) {
                this.isMoving = false;
            }
        }

        switch (this.moveType) {
            case 'zoomin':
                camera.translateZ(-distanceAtOnce);
                break;
            case 'zoomout':
                camera.translateZ(distanceAtOnce);
                break;
            case 'pedestalleft':
                camera.translateX(-distanceAtOnce);
                break;
            case 'pedestalright':
                camera.translateX(distanceAtOnce);
                break;
            case 'pedestalup':
                camera.translateY(distanceAtOnce);
                break;
            case 'pedestaldown':
                camera.translateY(-distanceAtOnce);
                break;
            case 'rotateleft': // see left, move right
                var positionNow = camera.position.clone();
                var tx = positionNow.x - this.spinPoint.x;
                var tz = positionNow.z - this.spinPoint.z;
                positionNow.x = (tx * Math.cos(angleAtOnce)) - (tz * Math.sin(angleAtOnce));
                positionNow.z = (tz * Math.cos(angleAtOnce)) + (tx * Math.sin(angleAtOnce));
                positionNow.x += this.spinPoint.x;
                positionNow.z += this.spinPoint.z;
                this.setPosition(positionNow.x, positionNow.y, positionNow.z);
                this.lookAt(this.spinPoint);
                break;
            case 'rotateright':  // see right, move left
                var positionNow = camera.position.clone();
                var tx = positionNow.x - this.spinPoint.x;
                var tz = positionNow.z - this.spinPoint.z;
                positionNow.x = (tx * Math.cos(-angleAtOnce)) - (tz * Math.sin(-angleAtOnce));
                positionNow.z = (tz * Math.cos(-angleAtOnce)) + (tx * Math.sin(-angleAtOnce));
                positionNow.x += this.spinPoint.x;
                positionNow.z += this.spinPoint.z;
                this.setPosition(positionNow.x, positionNow.y, positionNow.z);
                this.lookAt(this.spinPoint);
                break;
            case 'closetodesk':
                this.setPosition(tmpPosition.x, tmpPosition.y, tmpPosition.z);
                break;
            case 'hedgehop':
                this.setPosition(tmpPosition.x, tmpPosition.y, tmpPosition.z);
                break;
            case 'forwardtopoint':
            case 'backwardtopoint':
                this.setPosition(tmpPosition.x, tmpPosition.y, tmpPosition.z);
                this.lookAt(this.spinPoint);
                break;
        }
        
        if (this.isMoving === false) {
            if (this.moveType === 'pedestalleft' || this.moveType === 'pedestalright' || this.moveType === 'pedestalup' || this.moveType === 'pedestaldown') {
                var dx = camera.position.x - this.startPosition.x;
                var dy = camera.position.y - this.startPosition.y;
                var dz = camera.position.z - this.startPosition.z;
                this.spinPoint.x += dx;
                this.spinPoint.y += dy;
                this.spinPoint.z += dz;
            } else if (this.moveType === 'closetodesk' || this.moveType === 'hedgehop') {
                if (selectedDeskId) {
                    var objDesk = findDeskById(selectedDeskId);
                    if (objDesk) {
                        var user = findUserDataById(objDesk.desk._userID);
                        if (user) {
                            userInfo.set(user);
                            userInfo.show();
                        }
                    }
                }
            } else if (this.moveType === 'forwardtopoint' || this.moveType === 'backwardtopoint') {
                //camera.lookAt(this.spinPoint);
                //this.finalPosition = null;
            }
            this.finalPosition = null;
            
            if (camera.position.y > this.heightLimit) {
                container3D.classList.remove('hedgehop');
            } else {
                container3D.classList.add('hedgehop');
                planeNav.show();
            }
            
            if (distanceFromMap < this.heightMax) {
                container3D.classList.remove('stratosphere');
            } else {
                container3D.classList.add('stratosphere');
                planeNav.hide();
            }
        }
    };
    
    cameraAction.prototype.setSpinPoint = function (x, y, z) {
        if (this.spinPoint === null) {
            this.spinPoint = new THREE.Vector3(x, y, z);
        } else {
            this.spinPoint.x = x;
            this.spinPoint.y = y;
            this.spinPoint.z = z;
        }
        //camera.lookAt(this.spinPoint);
        this.lookAt(this.spinPoint);
        camera.updateProjectionMatrix();
    };
    
    cameraAction.prototype.setPosition = function (x, y, z) {
        camera.position.set(x, y, z);
        planeNav.moveAtTheFrontOf(camera);
    };
    
    cameraAction.prototype.lookAt = function (obj) {
        camera.lookAt(obj);
        planeNav.moveAtTheFrontOf(camera);
    };
    
    cameraAction.prototype.getCrossingPointOnPlane = function () {
        var centerPosition = new THREE.Vector2();
        centerPosition.set(0, 0);
        raycaster.setFromCamera(centerPosition, camera);
        var intersects = raycaster.intersectObjects(scene.children, true),
            point;
        if (intersects.length > 0) {
            for (var i = 0; i < intersects.length; i++) {
                if (intersects[i].object.pattern) {
                    if (intersects[i].object.pattern === 'floor') {
                        point = intersects[i].point;
                        return point;
                    }
                }
            }
        }
    };
    
    cameraAct = new cameraAction();
    
    var loadJSONMap = function (callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/file/indoor/' + floorVersion, true);
        xhr.responseType = 'json';
        //xhr.responseType = 'text';
        xhr.onload = function (e) {
			if (this.status == 200) {
                createMap(this.response);
                //createMap( JSON.parse(this.responseText));
                loadDesks(callback);
			}
		};
		xhr.send();
    };
    
    var createMap = function (json) {
        var children = scene.children.slice(0);
		
		for (var i = 0; i < children.length; i++) {
			if (children[i].name === 'map') {
				scene.remove(children[i]);
				continue;
			}
			if (children[i] instanceof THREE.Mesh === false) {
				continue;
			}
			if (children[i].geometry instanceof THREE.BoxGeometry === false) {
				continue;
			}
			
			scene.remove(children[i]);
		}
        
        var geometries = json,
            numGeo = geometries.length,
            mesh, geo;
        for (var i = 0; i < numGeo; i++) {
            if (geometries[i].p == 'path') {

            } else {
                geo = THREE.JSONLoader.prototype.parse(geometries[i].g.data);
                mesh = new THREE.Mesh(geo.geometry, materials[geometries[i].p][geometries[i].t]);
                mesh.position.x = geometries[i].x;
                mesh.position.y = geometries[i].y;
                mesh.position.z = geometries[i].z;
                mesh.name = 'map';
                mesh.pattern = geometries[i].p;
                scene.add(mesh);
            }
        }
    };
    
    var loadDesks = function (callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/file/indoor/' + deskVersion, true);
        xhr.responseType = 'json';
        //xhr.responseType = 'text';
        xhr.onload = function (e) {
			if (this.status == 200) {
                createDesks(this.response);
                //createDesks( JSON.parse(this.responseText));
                if (callback) {
                    callback();
                }
			}
		};
		xhr.send();
	};
    
    var createDesks = function(json) {
        var children = scene.children.slice(0);
        
        for (var i = 0; i < children.length; i++) {
			if (children[i].name !== 'deskroot') {
				continue;
			}
			
			scene.remove(children[i]);
		}
        
        deskObjs = {};
        
        var desks = json,
            numDesk = desks.length,
            objDesk;
        for (var i = 0; i < numDesk; i++) {
            objDesk = new OfficeDesk(desks[i].p);
            objDesk.setPosition(desks[i].x, desks[i].y, desks[i].z);
            objDesk.setRotation(desks[i].r);
            objDesk.setUser(desks[i].i);
            objDesk.update();
            deskObjs[objDesk.desk.uuid] = objDesk;
            scene.add(objDesk.root);
        }
    };
    
    var createRoute = function (node, rId, color) {
        var robotId = rId? rId : '';

        if (routeMesh) {
            if (routeMesh._rId == robotId) {
                scene.remove(routeMesh);
            }
        }
        var nodes = [],
            lineColor = color? color : {color: 0xff6600},
            posArray, posCanvas;
        //console.log(node);
        lineColor.opacity = 0.4;
        lineColor.transparent = true;

        for (var i = 0; i < node.length; i++) {
            posArray = new ArrayUnit(node[i].x, node[i].y);
            posCanvas = posArray.toCanvas();
            nodes.push(new THREE.Vector3(posCanvas.x, 20, posCanvas.y));
        }
        //console.log(nodes);
        var curve = new THREE.CatmullRomCurve3(nodes),
            shape = new THREE.Shape([
                new THREE.Vector2(-5, 2),
                new THREE.Vector2(5, 2),
                new THREE.Vector2(5, -2),
                new THREE.Vector2(-5, -2)
            ]),
            curveGeo = new THREE.ExtrudeGeometry(shape, {
                steps: 200,
				bevelEnabled: false,
				extrudePath: curve
            }),
            curveMat = new THREE.MeshBasicMaterial(lineColor);
        routeMesh = new THREE.Mesh(curveGeo, curveMat);
        routeMesh._rId = robotId;
        scene.add(routeMesh);
    };
    
    var createPointByCanvasCoordinates = function (cP) {
        if (pointMesh) {
            scene.remove(pointMesh);
        }
        var posCanvas = new THREE.Vector3(cP.x, 50, cP.y),
            pGeo = new THREE.SphereGeometry(30, 32, 32),
            pMat = new THREE.MeshBasicMaterial({color: 0xff3300});
        pointMesh = new THREE.Mesh(pGeo, pMat);
        pointMesh.position.copy(posCanvas);
        scene.add(pointMesh);
        console.debug('createPointByCanvasCoordinates done', cP);
    };

    var createRobotsByRobotList = function (rl) {
        for (var k in robotMeshs) {
            scene.remove(robotMeshs[k]);
        }
        var robotShape = new THREE.Shape();
        robotShape.moveTo(0, 20);
        robotShape.lineTo(-10, -20);
        robotShape.lineTo(10, -20);
        robotShape.lineTo(0, 20);
        var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 },
            robotGeo = new THREE.ExtrudeGeometry(robotShape, extrudeSettings),
            tempGeo, posArray, posCanvas;
        robotGeo.rotateX(Math.PI / 2);
        //robotGeo.translate(0, 0, 100);
        //robotGeo.applyMatrix( new THREE.Matrix4().makeTranslation(x, y, z) );
        for (var k in rl) {
            //tempGeo = robotGeo.clone();
            //tempGeo.center();
            robotMeshs[k] = new THREE.Mesh(robotGeo, new THREE.MeshLambertMaterial({color:0x3b7fc4}));
            posArray = new ArrayUnit(parseInt(rl[k].position.x), parseInt(rl[k].position.y));
            posCanvas = posArray.toCanvas();
            robotMeshs[k].position.copy(new THREE.Vector3(posCanvas.x, 20, posCanvas.y));
            //robotMeshs[k].geometry.center();
            switch (rl[k].direction) {
                case 'x+':
                    robotMeshs[k].rotateY(Math.PI / 2);
                    break;
                case 'x-':
                    robotMeshs[k].rotateY(- Math.PI / 2);
                    break;
                case 'y+':
                    robotMeshs[k].rotateY(0);
                    break;
                case 'y-':
                    robotMeshs[k].rotateY(Math.PI);
                    break;
            }

            scene.add(robotMeshs[k]);
            //robotMeshs[k].geometry.center();
            if (routeMesh) {
                if (rl[k].isBusy === false && routeMesh._rId == k) {
                    scene.remove(routeMesh);
                }
            }

            console.debug('A robot "' + k + '" was added on map');
        }
    };
    
    var animate = function (nowMsec) {
        lastMsec = lastMsec || nowMsec;
        var deltaMsec = nowMsec - lastMsec;
        if (cameraAct.isMoving === true) {
            cameraAct.animate(deltaMsec);
        }
        lastMsec = nowMsec;
        timerAnimationFrame = requestAnimationFrame(animate);
        render();
    };
    
    var render = function () {
        raycaster.setFromCamera(mouse2D, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);
            if (intersector) {
                if (intersector.object.name === 'desk') {
                    findDeskById(intersector.object.uuid).setMouseOver();
                }
			} else {
                if (typeof preChangedDeskId !== 'undefined') {
                    if (preChangedDeskId !== selectedDeskId) {
                        if (findDeskById(preChangedDeskId)) {
                            findDeskById(preChangedDeskId).setMouseOut();
                        }
                    }
                }
                preChangedDeskId = void(0);
            }
        }
        renderer.render(scene, camera);
    };
    
    /**
     * Plane Navigator
     */
    var PlaneNavigator = function () {
        this.root = new THREE.Object3D();
        this.background = new THREE.Mesh(new THREE.PlaneGeometry(55, 35), new THREE.MeshBasicMaterial({
			color: 0x000000,
            transparent: true,
            opacity: 0.3
		}));
        this.background.rotateOnAxis(new THREE.Vector3(1, 0, 0), - Math.PI / 2);
        this.background.translateZ(-0.1);
        this.root.add(this.background);
        var btnShape = new THREE.Shape();
        btnShape.moveTo(0, 0);
        btnShape.lineTo(-8, -4);
        btnShape.lineTo(8, -4);
        btnShape.lineTo(0, 0);
        var btnGeo = new THREE.ShapeGeometry(btnShape);
        this.btnUp = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        }));
        this.btnUp.name = 'btnUp';
        this.btnUp.rotateOnAxis(new THREE.Vector3(1, 0, 0), - Math.PI / 2);
        this.btnUp.rotateOnAxis(new THREE.Vector3(0, 0, 1), - Math.PI / 2);
        this.btnUp.translateY(25);
        this.root.add(this.btnUp);
        this.btnDown = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        }));
        this.btnDown.name = 'btnDown';
        this.btnDown.rotateOnAxis(new THREE.Vector3(1, 0, 0), - Math.PI / 2);
        this.btnDown.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.btnDown.translateY(25);
        this.root.add(this.btnDown);
        this.btnLeft = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        }));
        this.btnLeft.name = 'btnLeft';
        this.btnLeft.rotateOnAxis(new THREE.Vector3(1, 0, 0), - Math.PI / 2);
        //this.btnDown.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.btnLeft.translateY(15);
        this.root.add(this.btnLeft);
        this.btnRight = new THREE.Mesh(btnGeo, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        }));
        this.btnRight.name = 'btnRight';
        this.btnRight.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        //this.btnDown.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.btnRight.translateY(15);
        this.root.add(this.btnRight);
        var lineGeo1 = new THREE.Geometry();
        lineGeo1.vertices.push(
            new THREE.Vector3(-21, 0, 0),
            new THREE.Vector3(21, 0, 0)
        );
        this.lineUpDown = new THREE.Line(lineGeo1, new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        }));
        this.root.add(this.lineUpDown);
        var lineGeo2 = new THREE.Geometry();
        lineGeo2.vertices.push(
            new THREE.Vector3(0, 0, 12),
            new THREE.Vector3(0, 0, -12)
        );
        this.lineLeftRight = new THREE.Line(lineGeo2, new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        }));
        this.root.add(this.lineLeftRight);
    };
    
    PlaneNavigator.prototype.moveAtTheFrontOf = function (obj) {
        var tmpCameraClone = new THREE.Object3D();
        tmpCameraClone.rotation.copy(obj.rotation);
        tmpCameraClone.position.set(obj.position.x, obj.position.y, obj.position.z);
        tmpCameraClone.translateZ(-500);
        tmpCameraClone.translateX(window.innerWidth / 13);
        tmpCameraClone.translateY(-(window.innerHeight / 10));
        this.root.position.copy(tmpCameraClone.position);
        this.root.updateMatrix();
    };
    
    PlaneNavigator.prototype.show = function () {
        this.root.visible = true;
    };
    
    PlaneNavigator.prototype.hide = function () {
        this.root.visible = false;
    };
    
    /**
     * Desk Object
     */
    var OfficeDesk = function(p) {
        this.root = new THREE.Object3D();
        this.root.name = 'deskroot';
        var mat = materials['desk'][0].clone();
        var desk = new THREE.Mesh(deskGeo[p].geometry.clone(), mat);

        switch (p) {
            case 'desk':
                desk.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-80, -36, -40));
                break;
            default:
                desk.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -5, 0));
                break;
        }
        this.desk = desk;
        this.desk.name = 'desk';
        this.desk._p = p;
        this.root.desk = desk;
        this._objNamePanel = null;
        this._heightNamePanel = null;
        this.update = function() {
            if (this.desk._r === true) {
                this.desk.rotation.y += Math.PI / 2;
            }
            this.desk.matrixAutoUpdate = false;
            this.desk.updateMatrix();
        };
        this.root.add(this.desk);
    };
    
    OfficeDesk.prototype.setPosition = function(x, y, z) {
        this.desk.position.set(x, y, z);
    };
    
    OfficeDesk.prototype.setRotation = function(r) {
        this.desk._r = r;
    };
    
    OfficeDesk.prototype.setUser = function(uid) {
        this.desk._userID = uid;
        var user = findUserDataById(uid);
        if (user) {
            this.setNamePanel(user.name.replace(/_amp_/g, '&'), user.dataType);
        }
    };
    
    OfficeDesk.prototype.clearUser = function(uid) {
        this.desk._userID = void(0);
        this.clearNamePanel();
    };
    
    OfficeDesk.prototype.setMouseOver = function() {
        if (this.desk.uuid === preChangedDeskId) {
            return;
        } else if (this.desk.uuid !== preChangedDeskId) {
            if (typeof preChangedDeskId !== 'undefined') {
                if (preChangedDeskId !== selectedDeskId) {
                    findDeskById(preChangedDeskId).setMouseOut();
                }
            }
        }
        if (this.desk.uuid !== selectedDeskId) {
            preChangedDeskId = this.desk.uuid;
            this.desk.material.color.setHex(0xe3983b);
        } else {
            preChangedDeskId = void(0);
        }
    };
    
    OfficeDesk.prototype.setMouseOut = function() {
        this.desk.material.color.setRGB(0.98, 0.98, 0.90);
    };
    
    OfficeDesk.prototype.select = function() {
        if (this.desk.uuid !== selectedDeskId) {
            if (typeof selectedDeskId !== 'undefined') {
                if (findDeskById(selectedDeskId)) {
                    findDeskById(selectedDeskId).setMouseOut();
                    userInfo.hide();
                }
            }
        }
        selectedDeskId = this.desk.uuid;
        this.desk.material.color.setHex(0xdd4477);
        //goToDeskInfo(this.desk._userID, this.desk.uuid);
    };

    OfficeDesk.prototype.setNamePanel = function(txt, dataType) {
        if (this._objNamePanel) {
            this.clearNamePanel();
        }
        var canvas = this.buildNameCanvas(txt, dataType),
            texture = new THREE.Texture(canvas);
        texture.needsUpdate	= true;
        var material = new THREE.SpriteMaterial({
                map: texture,
                useScreenCoordinates: false
            }),
            sprite = new THREE.Sprite(material);
        //sprite.position.set(this.desk.position.x, this.desk.position.y + 50, this.desk.position.z);
        sprite.position.set(this.desk.position.x, this.desk.position.y + this._heightNamePanel, this.desk.position.z);
        sprite.scale.set(150, 150, 150);
        this._objNamePanel = sprite;
        this.root.add(this._objNamePanel);
    };
    
    OfficeDesk.prototype.clearNamePanel = function() {
        if (this._objNamePanel === null) {
            return;
        }
        this.root.remove(this._objNamePanel);
        this._objNamePanel = null;
        this._heightNamePanel = null;
    };
    
    OfficeDesk.prototype.buildNameCanvas = function(txt, dataType) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            fontSize = 25,
            lineHeight = 30,
            fontFamily = 'Arial',
            bgColor,
            fontColor = 'rgba(255,255,255,1.0)',
            scale = 1.3,
            fontH = lineHeight,
            tmpWidth,
            line = '',
            words = txt.split(' '),
            maxWidth = 300,
            y = 1,
            panelHeight;

        switch (dataType) {
            case '0':
                bgColor = 'rgba(0,0,255,0.3)';
                break;
            case '1':
                bgColor = 'rgba(20,137,44,0.3)';
                break;
            default:
                bgColor = 'rgba(0,0,255,0.3)';
                break;
        }
        canvas.width = 300;
        canvas.height = 300;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.font = '600 ' + fontSize + 'px "' + fontFamily + '"';
        //context.fillStyle = fontColor;

        // first background, next Text
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ',
                matrix = context.measureText(testLine),
                testWidth = matrix.width;
            if (testWidth > maxWidth && n > 0) {
                //tmpWidth = context.measureText(line).width;
                //context.fillText(line, -tmpWidth/2, lineHeight * (y - 1));
                line = words[n] + ' ';
                y += 1;
            } else {
                line = testLine;
            }
        }
        tmpWidth = context.measureText(line).width;
        //context.fillText(line, -tmpWidth/2, lineHeight * (y - 1));
        context.fillStyle = bgColor;
        panelHeight = fontH*y+10;
        context.fillRect(-maxWidth*scale/2, -lineHeight, maxWidth*scale, panelHeight);
        //this._heightNamePanel = Math.round((panelHeight - 40) / 2) + 50;

        y = 1, line= '';
        context.fillStyle = fontColor;
        //context.font = '600 ' + fontSize + 'px "' + fontFamily + '"';
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ',
                matrix = context.measureText(testLine),
                testWidth = matrix.width;
            if (testWidth > maxWidth && n > 0) {
                tmpWidth = context.measureText(line).width;
                context.fillText(line, -tmpWidth/2, lineHeight * (y - 1));
                line = words[n] + ' ';
                y += 1;
            } else {
                line = testLine;
            }
        }
        tmpWidth = context.measureText(line).width;
        context.fillText(line, -tmpWidth/2, lineHeight * (y - 1));
        this._heightNamePanel = Math.round((panelHeight - 40) / 2) + 50;
        
        return canvas;
    };
    
    var findDeskById = function(objId) {
        if (typeof deskObjs[objId] !== 'undefined') {
            return deskObjs[objId];
        }
    };
    
    var findDeskByUserId = function(userId) {
        for (var k in deskObjs) {
            if (deskObjs[k].desk._userID === userId) {
                return deskObjs[k];
            }
        }
        return void(0);
    };
    
    /**
     * User Detail Info
     */
    var UserInfo = function () {
        this.element = document.querySelector('.userinfo');
        this.img = document.querySelector('.userinfo img');
        this.makername = document.querySelector('.userinfo h3');
        this.standno = document.querySelector('.userinfo h4');
        this.email = document.querySelector('.userinfo dd.email');
        this.btnClose = document.querySelector('.userinfo .btnClose');
        this.emailLabel = document.querySelector('.userinfo dt.email');
        this.btnCallRobot = document.querySelector('.userinfo .btnCallRobot');
        this.btnSendRobot = document.querySelector('.userinfo .btnSendRobot');
        
        this.btnClose.addEventListener('click', function(t) {
            return function(e) {
                e.preventDefault();
                e.stopPropagation();
                eventIgnoringSignalForCanvas = true;
                t.hide();
                if (typeof selectedDeskId !== 'undefined') {
                    if (findDeskById(selectedDeskId)) {
                        findDeskById(selectedDeskId).setMouseOut();
                        selectedDeskId = void(0);
                    }
                }
            };
        }(this));

        this.btnSendRobot.addEventListener('click', function(t) {
            return function(e) {
                e.preventDefault();
                e.stopPropagation();
                eventIgnoringSignalForCanvas = true;
                t.hide();
                if (typeof selectedDeskId !== 'undefined') {
                    var objSelected = findDeskById(selectedDeskId);
                    if (objSelected) {
                        sendRobot(objSelected.desk.position.x, objSelected.desk.position.z);
                        findDeskById(selectedDeskId).setMouseOut();
                        selectedDeskId = void(0);
                    }
                }
            }
        }(this));

        this.btnCallRobot.addEventListener('click', function(t) {
            return function(e) {
                e.preventDefault();
                e.stopPropagation();
                eventIgnoringSignalForCanvas = true;
                t.hide();
                if (typeof selectedDeskId !== 'undefined') {
                    var objSelected = findDeskById(selectedDeskId);
                    if (objSelected) {
                        //sendRobot(objSelected.desk.position.x, objSelected.desk.position.z);
                        alert('hohoho, please call a robot to your place');
                        findDeskById(selectedDeskId).setMouseOut();
                        selectedDeskId = void(0);
                    }
                }
            }
        }(this));
    };
    
    UserInfo.prototype.set = function (data) {
        if (typeof data.dataType === 'undefined' || data.dataType === '0') {
            if (data.pictureUrl) {
                this.img.setAttribute('src', data.pictureUrl);
            } else {
                this.img.setAttribute('src', 'images/colleagueeditor/ic_account_box_white_24px.svg');
            }
            this.makername.innerHTML = data.name;
            this.img.style.boxShadow = '';
            this.email.style.display = '';
            this.emailLabel.style.display = '';
        } else if (data.dataType === '1') {
            if (data.pictureUrl) {
                this.img.setAttribute('src', data.pictureUrl);
            } else {
                this.img.setAttribute('src', 'images/colleagueeditor/ic_place_white_24px.svg');
            }
            this.img.style.boxShadow = 'none';
            //this.email.style.display = 'none';
            //this.emailLabel.style.display = 'none';
        }
        
        var positionStr = data.standno;
        positionStr = 'Stand No. ' + positionStr + '<span>(Hall ' + data.hall + ')</span>';
        this.standno.innerHTML = positionStr;
        
        var preferredName = 'Open details';
        if (data.infourl) {
            this.email.innerHTML = '<a href="' + data.infourl + '" target="_blank">' + preferredName + '</a>';
        } else {
            this.email.innerHTML = '...';
        }
    };
    
    UserInfo.prototype.show = function (data) {
        this.element.style.display = 'block';
    };
    
    UserInfo.prototype.hide = function (data) {
        this.element.style.display = 'none';
    };
    
    userInfo = new UserInfo();
    
    var initOfficeMap = function(callback) {
        navigation.hide();
        userInfo.hide();

        // Lights
        if (lightInit === false) {
            var ambientLight = new THREE.AmbientLight(0xe0e0e0),
                lightPositions = [
                    {x:2350,y:250,z:-750},
                    {x:2350,y:250,z:-350},
                    {x:2350,y:250,z:350},
                    {x:2350,y:250,z:750},
                    {x:1400,y:250,z:-750},
                    {x:1400,y:250,z:-350},
                    {x:1400,y:250,z:350},
                    {x:1400,y:250,z:750},
                    {x:600,y:250,z:-700},
                    {x:600,y:250,z:0},
                    {x:600,y:250,z:700},
                    {x:-200,y:250,z:-700},
                    {x:-200,y:250,z:0},
                    {x:-200,y:250,z:700},
                    {x:-1000,y:250,z:-700},
                    {x:-1000,y:250,z:0},
                    {x:-1000,y:250,z:700},
                    {x:-1800,y:250,z:-700},
                    {x:-1800,y:250,z:0},
                    {x:-1800,y:250,z:700}
                ],
                tmpLight;
                
            scene.add(ambientLight);
            for (var i = 0; i < lightPositions.length; i++) {
                tmpLight = new THREE.PointLight(0xffffff, 0.2, 1600, 1); // hex, intensity, distance, decay
                tmpLight.position.set(lightPositions[i].x, lightPositions[i].y, lightPositions[i].z);
                scene.add(tmpLight);
            }
            
            lightInit = true;
        }
        
        loadJSONMap(callback);
        
        if (!timerAnimationFrame) {
            animate();
        }
        
        //camera.position.x = -3000;
        //camera.position.y = 5000;
        //camera.position.z = -6500;
        cameraAct.setPosition(originCameraPosition[0], originCameraPosition[1], originCameraPosition[2]);
        cameraAct.setSpinPoint(0, 0, 0);
        container3D.classList.remove('hedgehop');
        container3D.classList.add('stratosphere');
        container3D.style.display = 'block';
        planeNav.hide();
        
        /*planeNav.position.copy(camera.position);
        planeNav.rotation.copy(camera.rotation);
        planeNav.updateMatrix();
        planeNav.translateZ(-1000);
        planeNav.translateY(-100);
        planeNav.translateX(300);*/
        planeNav.moveAtTheFrontOf(camera);
    };
    
    init();

    var sendRobot = function(x, y) {
        var startPoint = new CanvasUnit(x, y),
            startArray = startPoint.toArray(),
            xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/robot/sendarobot2/' + space + '/' + floorNow + '/' + startArray.x + '/' + startArray.y, true);
        xhr.responseType = 'text';
        xhr.onload = function (e) {
			if (this.status == 200) {
                var robot = JSON.parse(this.responseText);
                if (robot.result == false) {
                    alert('All robots are busy now. Please try later.');
                } else {
                    createRoute(robot.routes, robot.id, {color: 0x0072c6});
                }
			}
		};
		xhr.send();
    };

    var getRobotsStatus = function() {
        if (robotTrafficTimer) {
            clearTimeout(robotTrafficTimer);
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/robot/showmerobots/', true);
        xhr.responseType = 'text';
        xhr.onload = function (e) {
			if (this.status == 200) {
                var robots = JSON.parse(this.responseText);
                createRobotsByRobotList(robots);
                robotTrafficTimer = setTimeout(getRobotsStatus, 5000);
			}
		};
		xhr.send();
    };
    robotTrafficTimer = setTimeout(getRobotsStatus, 5000);
});