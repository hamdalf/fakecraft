var defaultWidth = 600,		// 605
    defaultHeight = 350;	// 346

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
	var cubeGeo = new THREE.BoxGeometry(10, 10, 10),
		cubeMaterials = {},
		tempCube, newTexture;
	for (var k in cubePattern) {
		if (!cubeMaterials[k]) {
			cubeMaterials[k] = {};
		}
		for (var l in cubePattern[k]) {
			newTexture = {
				shading: THREE.FlatShading
			};
			for (var m in cubePattern[k][l]) {
				newTexture[m] = cubePattern[k][l][m];
			}
			tempCube = new THREE.MeshPhongMaterial(newTexture);
			tempCube._cubePattern = k;
			tempCube._cubeType = l;
			cubeMaterials[k][l] = tempCube;
		}
	}

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
    loadDeskGeos(0);
	
	// picking
	var projector = new THREE.Projector();
	var mouse2D = new THREE.Vector2(),
		raycaster = new THREE.Raycaster(),
		ambientLight = new THREE.AmbientLight(0x606060),
		directionalLight = new THREE.DirectionalLight(0xffffff);
	scene.add(ambientLight);
	directionalLight.position.set(1, 1, -1).normalize();
	scene.add(directionalLight);
	
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
	
	var isCtrlDown = false,
		isAltDown = false,
		isADown = false,
		isSDown = false,
		isDDown = false;
		
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
	
	document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
	document.addEventListener('keydown', onDocumentKeyDown, false);

	var getRealIntersector = function (intersects) {
		var intersector;
		for (var i = 0; i < intersects.length; i++) {
			intersector = intersects[i];
			if (intersector.object.name == 'desk') {
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

	var loadButtons = document.querySelectorAll('.load a');
	loadButtons[0].addEventListener('click', function(e) {
		e.preventDefault();
        e.stopPropagation();

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/files/indoor', true);
		xhr.responseType = 'text';
		xhr.onload = function (e) {
			if (this.status == 200) {
                var files = JSON.parse(this.responseText),
					wrapper = document.querySelector('.lists'),
					tr;
				wrapper.innerHTML = '';
				for (var i = 0; i < files.length; i++) {
					tr = document.createElement('li');
					ta = document.createElement('a');
					ta.setAttribute('href', files[i]);
					ta.innerHTML = files[i];
					ta.addEventListener('click', function (e) {
						e.preventDefault();
						e.stopPropagation();
						onFileNameClick(e);
					});
					tr.appendChild(ta);
					wrapper.appendChild(tr);
					navigation.show();
				}
			}
		};
		xhr.send();
	}, false);
	loadButtons[1].addEventListener('click', function(e) {
		e.preventDefault();
        e.stopPropagation();

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/files/indoor', true);
		xhr.responseType = 'text';
		xhr.onload = function (e) {
			if (this.status == 200) {
                var files = JSON.parse(this.responseText),
					wrapper = document.querySelector('.lists'),
					tr;
				wrapper.innerHTML = '';
				for (var i = 0; i < files.length; i++) {
					tr = document.createElement('li');
					ta = document.createElement('a');
					ta.setAttribute('href', files[i]);
					ta.innerHTML = files[i];
					ta.addEventListener('click', function (e) {
						e.preventDefault();
						e.stopPropagation();
						onFileNameClick2(e);
					});
					tr.appendChild(ta);
					wrapper.appendChild(tr);
					navigation.show();
				}
			}
		};
		xhr.send();
	}, false);

	var onFileNameClick = function(e) {
		var fileName = (e.srcElement) ? e.srcElement.getAttribute('href') : e.target.getAttribute('href');
		lastSavedFileName = fileName.replace('.json', '');
        
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/file/indoor/' + fileName.replace('.json', ''), true);
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                createMap(this.response);
			}
		};
		xhr.send();
	};

	var onFileNameClick2 = function(e) {
		var fileName = (e.srcElement) ? e.srcElement.getAttribute('href') : e.target.getAttribute('href');
		lastSavedFileName = fileName.replace('.json', '');
        
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/file/indoor/' + fileName.replace('.json', ''), true);
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                createDesks(this.response);
			}
		};
		xhr.send();
	};

    var navigation = {
        element: document.querySelector('#dimmedbg')
    };
    navigation.show = function () {
        this.element.style.display = 'block';
    };
    navigation.hide = function () {
        this.element.style.display = 'none';
    };

	var popupCloasBtn = document.querySelector('.popupclose');
    popupCloasBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        navigation.hide();
    });

    var usersButtons = document.querySelectorAll('.users a');
	usersButtons[0].addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showUserList(e);
    }, false);

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
			if (children[i] === rollOverMesh) {
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
            scene.add(mesh);
        }
    };

	var createDesks = function(json) {
        var children = scene.children.slice(0);
        
        for (var i = 0; i < children.length; i++) {
			if (typeof children[i]._p === 'undefined') {
				continue;
			}
			if (typeof children[i]._userID === 'undefined') {
				continue;
			}
			scene.remove(children[i]);
		}
        
        var desks = json,
            numDesk = desks.length,
            mesh;
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

    var OfficeDesk = function(p) {
        this.root = new THREE.Object3D();
        this.root.name = 'deskroot';
        var mat = cubeMaterials['desk'][0].clone();
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
	
	var animate = function () {
		TimerId = requestAnimationFrame(animate);
		controls.update();
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
                        findDeskById(preChangedDeskId).setMouseOut();
                    }
                }
                preChangedDeskId = void(0);
            }
		}
		
		renderer.render(scene, camera);
	};
	
	animate();

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
        xhr.open('GET', '/api/maker/', true);
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
            tmpLi, tmpA, tmpImg, tmpStandNo, tmpFloor;
        for (var i = 0; i < json.length; i++) {
            if (json[i].dataType) {
                if (json[i].dataType === '0') {
                    tmpImg = (typeof json[i].pictureUrl === 'undefined' || json[i].pictureUrl === 'undefined' || json[i].pictureUrl === '' || json[i].pictureUrl === null) ? 'images/colleagueeditor/ic_account_box_black_24px.svg' : json[i].pictureUrl;
                } else {
                    tmpImg = 'images/colleagueeditor/ic_place_black_24px.svg';
                }
            } else {
                tmpImg = (typeof json[i].pictureUrl === 'undefined' || json[i].pictureUrl === 'undefined' || json[i].pictureUrl === '' || json[i].pictureUrl === null) ? 'images/colleagueeditor/ic_account_box_black_24px.svg' : json[i].pictureUrl;
            }
            
            tmpStandNo = '<span class="nick">(' + json[i].standno + ')</span>';
            tmpHall = '<span class="floor">Hall ' + json[i].hall + '</span>';
            tmpLi = document.createElement('li');
            tmpA = document.createElement('a');
            tmpA.innerHTML = '<img src="' + tmpImg + '">' + json[i].name + tmpStandNo + tmpHall;
            tmpA.setAttribute('href', '#');
            tmpA.setAttribute('data-id', json[i]._id);
            tmpA.addEventListener('click', clickUserNameActionByContext);
            tmpLi.appendChild(tmpA);
            tmpContainer.appendChild(tmpLi);
        }
        document.querySelector('#userList ul').innerHTML = '';
        document.querySelector('#userList ul').appendChild(tmpContainer);
        
        if (typeof selectedDeskId !== 'undefined') {
            document.querySelector('#userList h3').innerHTML = 'Choose Maker For The Desk';
        } else {
            document.querySelector('#userList h3').innerHTML = 'Maker List';
        }
    };
    
    var clearForm = function () {
        document.querySelector('#userForm select[name=datatype]').selectedIndex = 0;
        document.querySelector('#userForm input[name=username]').value = '';
        document.querySelector('#userForm input[name=standno]').value = '';
        document.querySelector('#userForm input[name=hall]').value = '';
        document.querySelector('#userForm input[name=pictureUrl]').value = '';
        document.querySelector('#userForm input[name=infoUrl]').value = '';
        document.querySelector('#btnSave').setAttribute('data-id', '');
    };
    
    var callUserData = function (id, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/maker/' + id, true);
        xhr.responseType = 'json';
        xhr.onload = function(id) {
            return function (e) {
                if (this.status == 200) {
                    callback(id, this.response);
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
        
        var dataType = (json[0].dataType) ? parseInt(json[0].dataType) : 0;
        document.querySelector('#userForm select[name=datatype]').selectedIndex = dataType;
        document.querySelector('#userForm input[name=username]').value = json[0].name;
        document.querySelector('#userForm input[name=standno]').value = json[0].standno;
        document.querySelector('#userForm input[name=hall]').value = json[0].hall;
        document.querySelector('#userForm input[name=pictureUrl]').value = json[0].pictureUrl;
        document.querySelector('#userForm input[name=infoUrl]').value = json[0].infourl;
        
        document.querySelector('#userForm h3').innerHTML = 'Edit Maker Information';
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
            fileds[1].innerHTML = 'No maker yet';
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
        var dataTypeOptions = document.querySelector('#userForm select[name=datatype]').options,
            dataType = 0;
        for (var i = 0; i < dataTypeOptions.length; i++) {
            if (dataTypeOptions[i].selected === true) {
                dataType = dataTypeOptions[i].value;
            }
        }
        var objData = {
                dataType: dataType,
                name: document.querySelector('#userForm input[name=username]').value,
                standno: document.querySelector('#userForm input[name=standno]').value,
                hall: document.querySelector('#userForm input[name=hall]').value,
                pictureUrl: document.querySelector('#userForm input[name=pictureUrl]').value,
                infourl: document.querySelector('#userForm input[name=infoUrl]').value,
                location: null
            },
            userId = document.querySelector('#btnSave').getAttribute('data-id');
            
        saveUserData(objData, userId, function() {
            alert('Maker data saved');
            goToUserList();
        });
    });
    
    var saveUserData = function (objData, uid, callback) {
        var xhr = new XMLHttpRequest(),
            params = 'datatype=' + objData.dataType
                     + '&username=' + objData.name
                     + '&standno=' + objData.standno
                     + '&hall=' + objData.hall
                     + '&pictureurl=' + objData.pictureUrl
                     + '&infourl=' + objData.infourl,
            userId = uid;
        if (userId) {
            xhr.open('PUT', '/api/maker/' + userId, true);
            xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('X-HTTP-Method-Override', 'PUT');
        } else {
            xhr.open('POST', '/api/maker', true);
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
        xhr.open('DELETE', '/api/maker/' + userId, true);
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE');
        xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                alert('Maker deleted');
                goToUserList();
			}
		};
		xhr.send();
    });

    callUserList(function(res) {});
});
