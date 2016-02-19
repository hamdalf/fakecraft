document.addEventListener('DOMContentLoaded', function() {
    
    var container3D, renderer, camera, scene,
        materials, geoDesk, meshDesk,
        mouse2D, raycaster, timerAnimationFrame, lastMsec,
        users, deskObjs, preChangedDeskId, selectedDeskId,
        cameraAct, floorNow, userInfo;

    var lightInit = false,
        cameraInit = false;
    
    var topNavs = document.querySelectorAll('.topnav a');
    topNavs[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
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
        initOfficeMap(20);
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
        initOfficeMap(19);
    });
    exploreMenus[1].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        initOfficeMap(20);
    });
    exploreMenus[2].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('rotateleft');
    });
    exploreMenus[3].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('pedestalleft');
    });
    exploreMenus[4].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('pedestalup');
    });
    exploreMenus[5].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('pedestaldown');
    });
    exploreMenus[6].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('pedestalright');
    });
    exploreMenus[7].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('rotateright');
    });
    exploreMenus[8].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cameraAct.move('zoomin');
    });
    exploreMenus[9].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        //cameraAct.move('zoomout');
        //cameraAct.setSpinPoint(0, 0, 0);
        cameraAct.backToPoint(-3000, 5000, -6500);
        
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
            if (users[i].name.toLowerCase().search(keyword) > -1 || users[i].nick.toLowerCase().search(keyword) > -1) {
                tr = document.createElement('li');
                ta = document.createElement('a');
                ta.setAttribute('href', '#');
                ta.setAttribute('data-id', users[i]._id);
                ta.innerHTML = (users[i].nick) ? users[i].name + ' (' + users[i].nick + ')' : users[i].name;
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
            user = findUserDataById(userID),
            floor;
        if (user.floor && user.floor !== 'null') {
            floor = parseInt(user.floor);
        }
        
        initOfficeMap(floor, function(uid) {
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
            ta = document.createElement('a');
            ta.setAttribute('href', '#');
            ta.setAttribute('data-id', users[i]._id);
            ta.innerHTML = (users[i].nick) ? users[i].name + ' (' + users[i].nick + ')' : users[i].name;
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
    
    // Initialization
    var init = function() {
        // user data
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/user/', true);
        //xhr.responseType = 'json';
        xhr.responseType = 'text';
        xhr.onload = function (e) {
			if (this.status == 200) {
                //users = this.response;
                users = JSON.parse(this.responseText);
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
        
        camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 50, 1e7);
        //camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -500, 10000);
        //camera.fov == 30;
        
        THREEx.WindowResize(renderer, camera);
        
        scene = new THREE.Scene();
        
        // Materials
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
        
        // Geometry of Desk
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/json/geometry_desk', true);
        //xhr.responseType = 'json';
        xhr.responseType = 'text';
        xhr.onload = function (e) {
            if (this.status == 200) {
                //var geometries = this.response;
                var geometries = JSON.parse(this.responseText);
                geoDesk = THREE.JSONLoader.prototype.parse(geometries[0].g.data);
                meshDesk = new THREE.Mesh(geoDesk.geometry, materials['desk'][0].clone());
                meshDesk.position.set(80, 36, 40);
                meshDesk.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-80, -36, -40));
            }
        };
        xhr.send();
        
        // Mouse, Raycaster
        mouse2D = new THREE.Vector2();
		raycaster = new THREE.Raycaster();
        
        var onDocumentMouseMove = function (e) {
            mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse2D.y = - (e.clientY / window.innerHeight) * 2 + 1;
        };
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        
        var onDocumentClick = function (e) {
            raycaster.setFromCamera(mouse2D, camera);
            var intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
                var intersector = getRealIntersector(intersects);

                if (intersector) {
                    intersector.select();
                    cameraAct.closeToDesk(intersector);
                    //goToDeskInfo(intersector.desk._userID, intersector.desk.uuid);
                }
            }
        };
        document.addEventListener('click', onDocumentClick, false);
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
			if (intersector.object.name === 'desk') {
                return findDeskById(intersector.object.uuid);
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
                    break;
                case 'rotateright':  // see right, move left
                    this.totalAngle = Math.PI / 3;
                    break;
            }
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
            //var vs = this.startPosition.sub(scene.position).normalize();
            //var vc = camera.position.clone().sub(scene.position).normalize();
            var vs = this.startPosition;
            var vc = camera.position.clone();
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
                this.isMoving = false;
            } else if (this.moveType === 'hedgehop' && dx <= this.speedDistanceX * delta && dz <= this.speedDistanceZ * delta) {
                tmpPosition.x = this.finalPosition.x;
                tmpPosition.y = this.finalPosition.y;
                tmpPosition.z = this.finalPosition.z;
                container3D.classList.add('hedgehop');
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
                var positionNow = camera.position.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -angleAtOnce);
                camera.position.set(positionNow.x, positionNow.y, positionNow.z);
                camera.lookAt(this.spinPoint);
                break;
            case 'rotateright':  // see right, move left
                var positionNow = camera.position.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angleAtOnce);
                camera.position.set(positionNow.x, positionNow.y, positionNow.z);
                camera.lookAt(this.spinPoint);
                break;
            case 'closetodesk':
                camera.position.set(tmpPosition.x, tmpPosition.y, tmpPosition.z);
                break;
            case 'hedgehop':
                camera.position.set(tmpPosition.x, tmpPosition.y, tmpPosition.z);
                break;
            case 'forwardtopoint':
            case 'backwardtopoint':
                camera.position.set(tmpPosition.x, tmpPosition.y, tmpPosition.z);
                camera.lookAt(this.spinPoint);
                break;
        }
        
        if (this.isMoving === false) {
            console.log(this.moveType,camera.position.y, distanceFromMap);
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
            }
            
            if (distanceFromMap < this.heightMax) {
                container3D.classList.remove('stratosphere');
            } else {
                container3D.classList.add('stratosphere');
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
        camera.lookAt(this.spinPoint);
        camera.updateProjectionMatrix();
    };
    
    cameraAct = new cameraAction();
    
    var loadJSONMap = function (floor, callback) {
        var fileName = encodeURIComponent('optimized_floor' + floor);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/json/' + fileName, true);
        //xhr.responseType = 'json';
        xhr.responseType = 'text';
        xhr.onload = function (e) {
			if (this.status == 200) {
                floorNow = floor;
                //createMap(this.response);
                createMap( JSON.parse(this.responseText));
                loadDesks(floor, callback);
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
            geo = THREE.JSONLoader.prototype.parse(geometries[i].g.data);
            mesh = new THREE.Mesh(geo.geometry, materials[geometries[i].p][geometries[i].t]);
            mesh.position.x = geometries[i].x;
			mesh.position.y = geometries[i].y;
			mesh.position.z = geometries[i].z;
            mesh.name = 'map';
            scene.add(mesh);
        }
    };
    
    var loadDesks = function (floor, callback) {
        var fileName = encodeURIComponent('desk_floor' + floor);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/json/' + fileName, true);
        //xhr.responseType = 'json';
        xhr.responseType = 'text';
        xhr.onload = function (e) {
			if (this.status == 200) {
                //createDesks(this.response);
                createDesks( JSON.parse(this.responseText));
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
            objDesk = new OfficeDesk(desks[i].p, desks[i].t);
            objDesk.setPosition(desks[i].x, desks[i].y, desks[i].z);
            objDesk.setRotation(desks[i].r);
            objDesk.setUser(desks[i].i);
            objDesk.update();
            deskObjs[objDesk.desk.uuid] = objDesk;
            scene.add(objDesk.root);
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
                intersector.setMouseOver();
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
     * Desk Object
     */
    var OfficeDesk = function(p, t) {
        this.root = new THREE.Object3D();
        this.root.name = 'deskroot';
        var mat = materials['desk'][0].clone();
        var desk = new THREE.Mesh(geoDesk.geometry, mat);
        this.desk = desk;
        this.desk.name = 'desk';
        this.desk._p = p;
        this.desk._t = t;
        this.root.desk = desk;
        this._objNamePanel = null;
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
            this.setNamePanel(user.name);
        }
    };
    
    OfficeDesk.prototype.clearUser = function(uid) {
        this.desk._userID = void(0);
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

    OfficeDesk.prototype.setNamePanel = function(txt) {
        if (this._objNamePanel) {
            this.clearNamePanel();
        }
        var canvas = this.buildNameCanvas(txt),
            texture = new THREE.Texture(canvas);
        texture.needsUpdate	= true;
        var material = new THREE.SpriteMaterial({
                map: texture,
                useScreenCoordinates: false
            }),
            sprite = new THREE.Sprite(material);
        sprite.position.set(this.desk.position.x, this.desk.position.y + 50, this.desk.position.z);
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
    };
    
    OfficeDesk.prototype.buildNameCanvas = function(txt) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            fontSize = 20,
            fontFamily = 'Arial',
            bgColor = 'rgba(0,0,255,0.5)',
            fontColor = 'rgba(255,255,255,0.9)',
            scale = 1.3,
            fontH = fontSize,
            fontW;
        canvas.width = 256;
        canvas.height = 256;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.font = '600 ' + fontSize + 'px "' + fontFamily + '"';
        fontW = context.measureText(txt).width;
        context.fillStyle = bgColor;
        context.fillRect(-fontW*scale/2,-fontH*scale/1.3,fontW*scale,fontH*scale);
        context.fillStyle = fontColor;
        context.fillText(txt, -fontW/2, 0);
        
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
        this.fullname = document.querySelector('.userinfo h3');
        this.job = document.querySelector('.userinfo h4');
        this.email = document.querySelector('.userinfo dd.email');
        this.skype = document.querySelector('.userinfo dd.skype');
        this.mobile = document.querySelector('.userinfo dd.mobile');
    };
    
    UserInfo.prototype.set = function (data) {
        console.log(data);
        if (data.pictureUrl) {
            this.img.setAttribute('src', data.pictureUrl);
        } else {
            this.img.setAttribute('src', 'images/colleagueeditor/ic_account_box_white_24px.svg');
        }
        var fullName = data.name;
        fullName += (data.nick) ? '<span>(' + data.nick + ')</span>' : '';
        this.fullname.innerHTML = fullName;
        if (data.jobTitle) {
            this.job.innerHTML = data.jobTitle;
        } else {
            this.job.innerHTML = '...';
        }
        if (data.email) {
            this.email.innerHTML = data.email;
        } else {
            this.email.innerHTML = '...';
        }
        if (data.skype) {
            this.skype.innerHTML = data.skype;
        } else {
            this.skype.innerHTML = '...';
        }
        if (data.mobile) {
            this.mobile.innerHTML = data.mobile;
        } else {
            this.mobile.innerHTML = '...';
        }
    };
    
    UserInfo.prototype.show = function (data) {
        this.element.style.display = 'block';
    };
    
    UserInfo.prototype.hide = function (data) {
        this.element.style.display = 'none';
    };
    
    userInfo = new UserInfo();
    
    var initOfficeMap = function(floor, callback) {
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
        
        turnOnFloorBtn(floor);
        loadJSONMap(floor, callback);
        
        if (!timerAnimationFrame) {
            animate();
        }
        
        camera.position.x = -3000;
        camera.position.y = 5000;
        camera.position.z = -6500;
        cameraAct.setSpinPoint(0, 0, 0);
        container3D.classList.remove('hedgehop');
        container3D.classList.add('stratosphere');
        container3D.style.display = 'block';
    };
    
    init();
});