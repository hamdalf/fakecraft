document.addEventListener('DOMContentLoaded', function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
    
    var zoomFactor = 1,
		zoomIncFactor = 0.01,
        deskObjs = {};
    
    var container = document.querySelector('#container'),
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true
		});
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);
    
    var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 50, 1e7);
	camera.position.x = 500;
	camera.position.y = 800;
	camera.position.z = 800;
	camera.lookAt(new THREE.Vector3(0, 200, 0));
	
	controls = new THREE.TrackballControls(camera, renderer.domElement);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 3.6;
	controls.panSpeed = 2;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [65, 83, 68];	// a:rotate, s:zoom, d:pan
	
	THREEx.WindowResize(renderer, camera);
	
	var scene = new THREE.Scene();
    
    // cubes
	var cubeMaterials = {},
		tempMaterial, newTexture;
	for (var k in cubePattern) {
		if (!cubeMaterials[k]) {
			cubeMaterials[k] = {};
		}
		for (var l in cubePattern[k]) {
			newTexture = {};
			for (var m in cubePattern[k][l]) {
				newTexture[m] = cubePattern[k][l][m];
			}
			//tempMaterial = new THREE.MeshPhongMaterial(newTexture);
            tempMaterial = new THREE.MeshLambertMaterial(newTexture);
			tempMaterial._p = k;
			tempMaterial._t = l;
			cubeMaterials[k][l] = tempMaterial;
		}
	}

    // desk deometry
    var deskGeo, deskMesh;
    var fileName = encodeURIComponent('geometry_desk');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/json/' + fileName, true);
    xhr.responseType = 'json';
    xhr.onload = function (e) {
        if (this.status == 200) {
            var geometries = this.response;
            deskGeo = THREE.JSONLoader.prototype.parse(geometries[0].g.data);
            deskMesh = new THREE.Mesh(deskGeo.geometry, cubeMaterials['desk'][0].clone());
            deskMesh.position.set(80, 36, 40);
            deskMesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-80, -36, -40));
        }
    };
    xhr.send();
    
    // Lights
    var ambientLight = new THREE.AmbientLight(0xe0e0e0),
		directionalLight = new THREE.DirectionalLight(0xffffff),
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
        tempLight;
        //spotLight1 = new THREE.SpotLight(0xffffff, 2, 0, Math.PI/2, 2, 1),  // hex, intensity, distance, angle, exponent, decay
        //lightTarget1 = new THREE.Object3D();
    scene.add(ambientLight);
	//directionalLight.position.set(1, 1, -1).normalize();
	//scene.add(directionalLight);
    
    for (var i = 0; i < lightPositions.length; i++) {
        tempLight = new THREE.PointLight(0xffffff, 0.2, 1600, 1); // hex, intensity, distance, decay
        tempLight.position.set(lightPositions[i].x, lightPositions[i].y, lightPositions[i].z);
        scene.add(tempLight);
    }
    
    /*spotLight1.position.set(2300, 400, 0);
    spotLight1.shadowCameraVisible = true;
    spotLight1.shadowDarkness = 0.95;
    spotLight1.castShadow = true;
    scene.add(spotLight1);
    lightTarget1.position.set(2300, 200, 0);
    scene.add(lightTarget1);
    spotLight1.target = lightTarget1;
    
    var spotLight2 = spotLight1.clone(),
        lightTarget2 = lightTarget1.clone();
    spotLight2.position.set(2300, 400, 800);
    scene.add(spotLight2);
    lightTarget2.position.set(2300, 0, 800);
    scene.add(lightTarget2);
    spotLight2.target = lightTarget2;*/
    
    

    // stats
    /*var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '5px';
	stats.domElement.style.right = '5px';
	container.appendChild(stats.domElement);*/
    
    // Mouse, Raycaster
    var mouse2D = new THREE.Vector2(),
		raycaster = new THREE.Raycaster();
        
    var onDocumentMouseMove = function (e) {
		mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
		mouse2D.y = - (e.clientY / window.innerHeight) * 2 + 1;
	};
    
    var onDocumentMouseUp = function (e) {
        raycaster.setFromCamera(mouse2D, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);

			if (intersector) {
                intersector.select();
                goToDeskInfo(intersector.desk._userID, intersector.desk.uuid);
			} else {
                /*if (typeof preChangedDeskId !== 'undefined') {
                    findDeskById(preChangedDeskId).material.color.setRGB(0.98, 0.90, 0.81);
                }
                preChangedDeskId = void(0);*/
            }
		}
    };
    
    var onDocumentKeyDown = function (e) {
		switch (e.keyCode) {
			case 38:
				zoomInOut('in');
				break;
			case 40:
				zoomInOut('out');
				break;
		}	
	};
    
    //document.addEventListener('mousemove', onDocumentMouseMove, false);
    //document.addEventListener('mouseup', onDocumentMouseUp, false);
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    
    var getRealIntersector = function (intersects) {
		var intersector;
		for (var i = 0; i < intersects.length; i++) {
			intersector = intersects[i];
			if (intersector.object.name === 'desk') {
                return findDeskById(intersector.object.uuid);
			}
		}
	};
    
    var zoomInOut = function (inout) {
		switch (inout) {
			case 'in':
				zoomFactor = (zoomFactor > 1) ? 1 : zoomFactor;
				zoomFactor = zoomFactor - zoomIncFactor;
				zoomFactor = (zoomFactor <= 0.2) ? 0.2 : zoomFactor;
				break;
			case 'out':
				zoomFactor = (zoomFactor < 1) ? 1 : zoomFactor;
				zoomFactor = zoomFactor + zoomIncFactor;
				zoomFactor = (zoomFactor >= 2) ? 1 : zoomFactor;
				break;
		}

		camera.fov *= zoomFactor;
		camera.updateProjectionMatrix();
	};
    
    var printPNG = function () {
		window.open(renderer.domElement.toDataURL('image/png'), 'pngwindow');	
	};
    
    var printJSON = function () {
        var children = scene.children,
			desks = [],
			child;
            
        for (var i = 0; i < children.length; i++) {
			child = children[i];
			if (child.name !== 'deskroot') {
				continue;
			}
			
			desks.push({
				x: child.desk.position.x,
				y: child.desk.position.y,
				z: child.desk.position.z,
				p: child.desk._p,
				t: child.desk._t,
                r: child.desk._r,
                i: child.desk._userID
			});
		}
        
        var dataUri = "data:application/json;charset=utf-8," + JSON.stringify(desks);
		window.open(dataUri, 'jsonwindow');
    };
    
    var saveJSON = function () {
		var children = scene.children,
			desks = [],
			child;
            
        for (var i = 0; i < children.length; i++) {
			child = children[i];
			if (child.name !== 'deskroot') {
				continue;
			}
			
			desks.push({
				x: child.desk.position.x,
				y: child.desk.position.y,
				z: child.desk.position.z,
				p: child.desk._p,
				t: child.desk._t,
                r: child.desk._r,
                i: child.desk._userID
			});
		}
        
        var dataUri = JSON.stringify(desks);
		var xhr = new XMLHttpRequest();
        var fileName = encodeURIComponent('desk_floor' + getSelectedFloor());
		var params = 'filename=' + fileName + '&content=' + dataUri;
		xhr.open('POST', '/api/json', true);
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                alert('JSON \'' + fileName + '.json\' saved');
			}
		};
		xhr.send(params);
	};
    
    
    // for user list
    var selectedDeskId, userData;
    
    var findUserDataById = function(id) {
        var result = null;
        
        for (var i = 0; i < userData.length; i++) {
            if (userData[i]._id === id) {
                result = userData[i];
            }
        }
        
        return result;
    };
    
    var showUserList = function () {
        document.querySelector('#floatPannel').style.display = 'block';
        document.querySelector('#userList').style.display = 'block';
        document.querySelector('#userForm').style.display = 'none';
        document.querySelector('#deskInfo').style.display = 'none';
        
        callUserList(drawUserList);
    };
    
    var callUserList = function(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/user/', true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                userData = this.response;
                callback(this.response);
			}
		};
		xhr.send();
    };
    
    var drawUserList = function (json) {
        var tmpContainer = document.createDocumentFragment(),
            tmpLi, tmpA, tmpImg, tmpNick, tmpFloor;
        for (var i = 0; i < json.length; i++) {
            tmpImg = (typeof json[i].pictureUrl === 'undefined' || json[i].pictureUrl === 'undefined' || json[i].pictureUrl === '' || json[i].pictureUrl === null) ? 'images/colleagueeditor/ic_account_box_black_24px.svg' : json[i].pictureUrl;
            tmpNick = (json[i].nick) ? '<span class="nick">(' + json[i].nick + ')</span>' : '';
            tmpFloor = (json[i].floor && json[i].floor !== 'null') ? '<span class="floor">' + json[i].floor + 'F</span>' : '';
            tmpLi = document.createElement('li');
            tmpA = document.createElement('a');
            tmpA.innerHTML = '<img src="' + tmpImg + '">' + json[i].name + tmpNick + tmpFloor;
            tmpA.setAttribute('href', '#');
            tmpA.setAttribute('data-id', json[i]._id);
            tmpA.addEventListener('click', clickUserNameActionByContext);
            tmpLi.appendChild(tmpA);
            tmpContainer.appendChild(tmpLi);
        }
        document.querySelector('#userList ul').innerHTML = '';
        document.querySelector('#userList ul').appendChild(tmpContainer);
        
        if (typeof selectedDeskId !== 'undefined') {
            document.querySelector('#userList h3').innerHTML = 'Choose User For The Desk';
        } else {
            document.querySelector('#userList h3').innerHTML = 'User List';
        }
    };
    
    var clearForm = function () {
        document.querySelector('#userForm input[name=username]').value = '';
        document.querySelector('#userForm input[name=nickname]').value = '';
        document.querySelector('#userForm input[name=role]').value = '';
        document.querySelector('#userForm input[name=email]').value = '';
        document.querySelector('#userForm input[name=skype]').value = '';
        document.querySelector('#userForm input[name=mobile]').value = '';
        document.querySelector('#userForm input[name=pictureUrl]').value = '';
        document.querySelector('#userForm input[name=floor]').value = '';
        document.querySelector('#btnSave').setAttribute('data-id', '');
    };
    
    var callUserData = function (id, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/user/' + id, true);
        xhr.responseType = 'json';
        xhr.onload = function(id) {
            return function (e) {
                if (this.status == 200) {
                    callback(id, this.response);
                    //makeUserForm(this.response);
                }
            };
		}(id);
		xhr.send();
    };
    
    var makeUserForm = function (id, json) {
        document.querySelector('#deskInfo').style.display = 'none';
        document.querySelector('#userList').style.display = 'none';
        document.querySelector('#userForm').style.display = 'block';
        document.querySelector('#btnDelete').style.display = 'inline-block';
        document.querySelector('#btnSave').setAttribute('data-id', id);
                
        document.querySelector('#userForm input[name=username]').value = json[0].name;
        document.querySelector('#userForm input[name=nickname]').value = json[0].nick;
        document.querySelector('#userForm input[name=role]').value = json[0].jobTitle;
        document.querySelector('#userForm input[name=email]').value = json[0].email;
        document.querySelector('#userForm input[name=skype]').value = json[0].skype;
        document.querySelector('#userForm input[name=mobile]').value = json[0].mobile;
        document.querySelector('#userForm input[name=pictureUrl]').value = json[0].pictureUrl;
        document.querySelector('#userForm input[name=floor]').value = json[0].floor;
        
        document.querySelector('#userForm h3').innerHTML = 'Edit User Information';
    };
    
    var goToUserList = function () {
        //clearForm();
        document.querySelector('#floatPannel').style.display = 'block';
        document.querySelector('#userForm').style.display = 'none';
        document.querySelector('#deskInfo').style.display = 'none';
        document.querySelector('#userList').style.display = 'block';
        callUserList(drawUserList);
    };
    
    var goToDeskInfo = function (uid, deskMeshId) {
        document.querySelector('#floatPannel').classList.add('dimmed');
        document.querySelector('#floatPannel').style.display = 'block';
        document.querySelector('#userForm').style.display = 'none';
        document.querySelector('#userList').style.display = 'none';
        document.querySelector('#deskInfo').style.display = 'block';
        
        var fileds = document.querySelectorAll('#deskInfo dd');
        fileds[0].innerHTML = deskMeshId;
        
        if (uid) {
            callUserData(uid, function(id, res) {
                fileds[1].innerHTML = res[0].name;
            });
        } else {
            fileds[1].innerHTML = 'No user yet';
        }
    };
    
    document.querySelector('#btnCreateUser').addEventListener('click', function (e) {
        document.querySelector('#floatPannel').style.display = 'block';
        document.querySelector('#deskInfo').style.display = 'none';
        document.querySelector('#userList').style.display = 'none';
        document.querySelector('#userForm').style.display = 'block';
        document.querySelector('#btnDelete').style.display = 'none';
        document.querySelector('#userForm h3').innerHTML = 'Create User Information';
        
        clearForm();
    });
    
    var closePanel = function () {
        if (typeof selectedDeskId !== 'undefined') {
                findDeskById(selectedDeskId).setMouseOut();
                selectedDeskId = void(0);
        }
        document.querySelector('#floatPannel').style.display = 'none';
        document.querySelector('#floatPannel').classList.remove('dimmed');
    };
    
    document.querySelector('#btnClose').addEventListener('click', closePanel);
    
    document.querySelector('#btnCancel').addEventListener('click', function (e) {
        goToUserList();
    });
    
    document.querySelector('#btnSave').addEventListener('click', function (e) {
        var objData = {
                name: document.querySelector('#userForm input[name=username]').value,
                nick: document.querySelector('#userForm input[name=nickname]').value,
                jobTitle: document.querySelector('#userForm input[name=role]').value,
                email: document.querySelector('#userForm input[name=email]').value,
                skype: document.querySelector('#userForm input[name=skype]').value,
                mobile: document.querySelector('#userForm input[name=mobile]').value,
                pictureUrl: document.querySelector('#userForm input[name=pictureUrl]').value,
                floor: document.querySelector('#userForm input[name=floor]').value,
                location: null
            },
            userId = document.querySelector('#btnSave').getAttribute('data-id');
            
        saveUserData(objData, userId, function() {
            alert('User data saved');
            goToUserList();
        });
    });
    
    var saveUserData = function (objData, uid, callback) {
        var xhr = new XMLHttpRequest(),
            params = 'username=' + objData.name
                     + '&nickname=' + objData.nick
                     + '&jobtitle=' + objData.jobTitle
                     + '&email=' + objData.email
                     + '&skype=' + objData.skype
                     + '&mobile=' + objData.mobile
                     + '&pictureurl=' + objData.pictureUrl
                     + '&floor=' + objData.floor
                     + '&location=' + objData.location,
            userId = uid;
        if (userId) {
            xhr.open('PUT', '/api/user/' + userId, true);
            xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('X-HTTP-Method-Override', 'PUT');
        } else {
            xhr.open('POST', '/api/user', true);
            xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        }
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                callback();
			}
		};
		xhr.send(params);
    };
    
    var clearUser = function () {
        findDeskById(selectedDeskId).clearUser();
        goToDeskInfo(null, selectedDeskId);
    };
    
    document.querySelector('#btnAssign').addEventListener('click', goToUserList);
    document.querySelector('#btnClear').addEventListener('click', clearUser);
    
    var setUserIdToDesk = function (deskId, uid) {
        //console.log(deskId, uid);
        findDeskById(deskId).setUser(uid);
        var user = findUserDataById(uid);
        //console.log(uid, user);
        user.floor = getSelectedFoor();
        saveUserData(user, uid, function() {
            closePanel();
        });
    };
    
    var clickUserNameActionByContext = function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (selectedDeskId) {
            setUserIdToDesk(selectedDeskId, e.srcElement.getAttribute('data-id'));
        } else {
            callUserData(e.srcElement.getAttribute('data-id'), makeUserForm);
        }
    };
    
    document.querySelector('#btnDelete').addEventListener('click', function (e) {
        var xhr = new XMLHttpRequest(),
            userId = document.querySelector('#btnSave').getAttribute('data-id');
        xhr.open('DELETE', '/api/user/' + userId, true);
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
        xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                alert('User deleted');
                goToUserList();
			}
		};
		xhr.send();
    });
	
	var buttons = document.querySelectorAll('.iofunctions button');
    buttons[0].addEventListener('click', showUserList, false);
	buttons[1].addEventListener('click', printPNG, false);
	buttons[2].addEventListener('click', printJSON, false);
    buttons[3].addEventListener('click', saveJSON, false);
    
    var loadJSON = function (floor) {
        var fileName = encodeURIComponent('desk_floor' + floor);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/json/' + fileName, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                createDesks(this.response);
			}
		};
		xhr.send();
	};
    
    var loadJSONMap = function (floor) {
        var fileName = encodeURIComponent('optimized_floor' + floor);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/json/' + fileName, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                createMap(this.response);
                loadJSON(floor);
			}
		};
		xhr.send();
    };
    
    var getSelectedFloor = function() {
        var floorOptions = document.querySelector('dd.floor select').options;
        for (var i = 0; i < floorOptions.length; i++) {
            if (floorOptions[i].selected === true) {
                return floorOptions[i].value;
                break;
            }
        }
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
            mesh = new THREE.Mesh(geo.geometry, cubeMaterials[geometries[i].p][geometries[i].t]);
            mesh.position.x = geometries[i].x;
			mesh.position.y = geometries[i].y;
			mesh.position.z = geometries[i].z;
            mesh.name = 'map';
            //mesh.receiveShadow = true;
            //mesh.castShadow = false;
            scene.add(mesh);
        }
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
    
    /**
     * Desk Object
     * .update
     * .setPosition
     * .setRotation
     * .setUser
     */
    var OfficeDesk = function(p, t) {
        this.root = new THREE.Object3D();
        this.root.name = 'deskroot';
        //this.root.castShadow = true;
        //this.root.receiveShadow = false;
        var mat = cubeMaterials['desk'][0].clone();
        var desk = new THREE.Mesh(deskGeo.geometry, mat);
        //desk.castShadow = true;
        //desk.receiveShadow = false;
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
                findDeskById(selectedDeskId).setMouseOut();
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
        //sprite.position.normalize();
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
            bgColor = 'rgba(0,0,255,0.3)',
            fontColor = 'rgba(0,0,0,0.7)',
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

    var preChangedDeskId;
    
    var findDeskById = function(objId) {
        if (typeof deskObjs[objId] !== 'undefined') {
            return deskObjs[objId];
        }
    };
    
    var getSelectedFoor = function() {
        var floorOptions = document.querySelector('dd.floor select').options;
        for (var i = 0; i < floorOptions.length; i++) {
            if (floorOptions[i].selected === true) {
                return floorOptions[i].value;
            }
        }
    };
    
    document.querySelector('dd.floor select').addEventListener('change', function(e) {
        loadJSONMap(getSelectedFoor());
    }, false);
    
    var animate = function () {
		TimerId = requestAnimationFrame(animate);
		controls.update();
		render();
		//stats.update();
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
                        findDeskById(preChangedDeskId).setMouseOut();
                    }
                }
                preChangedDeskId = void(0);
            }
		}
		renderer.render(scene, camera);
	};
    
	animate();
    
    callUserList(function(res) {
        loadJSONMap(getSelectedFoor());
    });
    
});