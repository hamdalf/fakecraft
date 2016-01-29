document.addEventListener('DOMContentLoaded', function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
    
    var zoomFactor = 1,
		zoomIncFactor = 0.01;
    
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
			//tempCube = new THREE.MeshPhongMaterial(newTexture);
            tempCube = new THREE.MeshLambertMaterial(newTexture);
			tempCube._cubePattern = k;
			tempCube._cubeType = l;
			cubeMaterials[k][l] = tempCube;
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
    
    var mouse2D = new THREE.Vector2(),
		raycaster = new THREE.Raycaster(),
		ambientLight = new THREE.AmbientLight(0xa0a0a0),
		directionalLight = new THREE.DirectionalLight(0xffffff);
	scene.add(ambientLight);
	directionalLight.position.set(1, 1, -1).normalize();
	scene.add(directionalLight);
    
    var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '5px';
	stats.domElement.style.right = '5px';
	container.appendChild(stats.domElement);
    
    var onDocumentMouseMove = function (e) {
		mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
		mouse2D.y = - (e.clientY / window.innerHeight) * 2 + 1;
	};
    
    var onDocumentMouseUp = function (e) {
        raycaster.setFromCamera(mouse2D, camera);
        var intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);

			if (intersector) {
                var desk = intersector.object;
                selectDesk(desk);
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
    
    var selectDesk = function (desk) {
        if (desk.uuid !== selectedDeskId) {
            if (typeof selectedDeskId !== 'undefined') {
                findDeskById(selectedDeskId).material.color.setRGB(0.98, 0.90, 0.81);
            }
        }
        selectedDeskId = desk.uuid;
        desk.material.color.setHex(0xdd4477);
        goToDeskInfo(desk._userID, desk.uuid);
    };
    
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    
    var getRealIntersector = function (intersects) {
		var intersector;
		for (var i = 0; i < intersects.length; i++) {
			intersector = intersects[i];
			if (intersector.object._p === 'desk') {
				return intersector;
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
			if (child._p !== 'desk') {
				continue;
			}
			
			desks.push({
				x: child.position.x,
				y: child.position.y,
				z: child.position.z,
				p: child._p,
				t: child._t,
                r: child._r,
                i: child._userID
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
			if (child._p !== 'desk') {
				continue;
			}
			
			desks.push({
				x: child.position.x,
				y: child.position.y,
				z: child.position.z,
				p: child._p,
				t: child._t,
                r: child._r,
                i: child._userID
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
    var selectedDeskId;
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
                callback(this.response);
                //drawUserList(this.response);
			}
		};
		xhr.send();
    };
    
    var drawUserList = function (json) {
        var tmpContainer = document.createDocumentFragment(),
            tmpLi, tmpA, tmpImg, tmpNick;
        for (var i = 0; i < json.length; i++) {
            tmpImg = (json[i].pictureUrl) ? json[i].pictureUrl : 'images/colleagueeditor/ic_account_box_black_24px.svg';
            tmpNick = (json[i].nick) ? '<span class="nick">(' + json[i].nick + ')</span>' : '';
            tmpLi = document.createElement('li');
            tmpA = document.createElement('a');
            tmpA.innerHTML = '<img src="' + tmpImg + '">' + json[i].name + tmpNick;
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
        document.querySelector('#btnSave').setAttribute('data-id', '');
    };
    
    var callUserData = function (id, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/user/' + id, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                callback(id, this.response);
                //makeUserForm(this.response);
			}
		};
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
                findDeskById(selectedDeskId).material.color.setRGB(0.98, 0.90, 0.81);
                selectedDeskId = void(0);
        }
        document.querySelector('#floatPannel').style.display = 'none';
    };
    
    document.querySelector('#btnClose').addEventListener('click', closePanel);
    
    document.querySelector('#btnCancel').addEventListener('click', function (e) {
        goToUserList();
    });
    
    document.querySelector('#btnSave').addEventListener('click', function (e) {
        var xhr = new XMLHttpRequest(),
            username = document.querySelector('#userForm input[name=username]').value,
            nickname = document.querySelector('#userForm input[name=nickname]').value,
            jobtitle = document.querySelector('#userForm input[name=role]').value,
            email = document.querySelector('#userForm input[name=email]').value,
            skype = document.querySelector('#userForm input[name=skype]').value,
            mobile = document.querySelector('#userForm input[name=mobile]').value,
            pictureurl = document.querySelector('#userForm input[name=pictureUrl]').value,
            floor = null,
            location = null,
            params = 'username=' + username
                     + '&nickname=' + nickname
                     + '&jobtitle=' + jobtitle
                     + '&email=' + email
                     + '&skype=' + skype
                     + '&mobile=' + mobile
                     + '&pictureurl=' + pictureurl
                     + '&floor=' + floor
                     + '&location=' + location,
            userId = document.querySelector('#btnSave').getAttribute('data-id');
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
                alert('User \'' + username + '\' saved');
                goToUserList();
			}
		};
		xhr.send(params);
    });
    
    document.querySelector('#btnAssign').addEventListener('click', goToUserList);
    
    var setUserIdToDesk = function (deskId, uid) {
        findDeskById(deskId)._userID = uid;
        closePanel();
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
                alert('User \'' + username + '\' deleted');
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
            scene.add(mesh);
        }
    };
    
    var createDesks = function(json) {
        var children = scene.children.slice(0);
        
        for (var i = 0; i < children.length; i++) {
			if (children[i]._p !== 'desk') {
				continue;
			}
			
			scene.remove(children[i]);
		}
        
        var desks = json,
            numDesk = desks.length,
            mesh;
        for (var i = 0; i < numDesk; i++) {
            var mat = cubeMaterials['desk'][0].clone();
            mesh = new THREE.Mesh(deskGeo.geometry, mat);
            mesh.position.set(desks[i].x, desks[i].y, desks[i].z);
            if (desks[i].r === true) {
                mesh.rotation.y += Math.PI / 2;
                mesh._r = true;
            } else {
                mesh._r = false;
            }
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();
            mesh._p = desks[i].p;
            mesh._t = desks[i].t;
            mesh._userID = desks[i].i;
            scene.add(mesh);
        }
    };
    
    var preChangedDeskId;
    var changeDeskColor = function(intersector) {
        var desk = intersector.object;
        if (desk.uuid === preChangedDeskId) {
            return;
        }
        if (desk.uuid !== preChangedDeskId) {
            if (typeof preChangedDeskId !== 'undefined') {
                if (preChangedDeskId !== selectedDeskId) {
                    findDeskById(preChangedDeskId).material.color.setRGB(0.98, 0.90, 0.81);
                }
            }
        }
        if (intersector.object.uuid !== selectedDeskId) {
            preChangedDeskId = desk.uuid;
            desk.material.color.setHex(0xe3983b);
        } else {
            preChangedDeskId = void(0);
        }
    };
    
    var findDeskById = function(objId) {
        var children = scene.children.slice(0);
		
		for (var i = 0; i < children.length; i++) {
			if (children[i].uuid === objId) {
				return children[i];
			}
		}
    };
    
    document.querySelector('dd.floor select').addEventListener('change', function(e) {
        var options = e.target.children;
        for (var i = 0; i < options.length; i++) {
            if (options[i].selected === true) {
                loadJSONMap(options[i].value);
            }
        }
    }, false);
    
    var animate = function () {
		TimerId = requestAnimationFrame(animate);
		controls.update();
		render();
		stats.update();
	};
	
	var render = function () {
        raycaster.setFromCamera(mouse2D, camera);
        var intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);

			if (intersector) {
    		    changeDeskColor(intersector);
			} else {
                if (typeof preChangedDeskId !== 'undefined') {
                    if (preChangedDeskId !== selectedDeskId) {
                        findDeskById(preChangedDeskId).material.color.setRGB(0.98, 0.90, 0.81);
                    }
                }
                preChangedDeskId = void(0);
            }
		}
		renderer.render(scene, camera);
	};
    
	animate();
    var floorOptions = document.querySelector('dd.floor select').options;
    for (var i = 0; i < floorOptions.length; i++) {
        if (floorOptions[i].selected === true) {
            loadJSONMap(floorOptions[i].value);
            break;
        }
    }
});