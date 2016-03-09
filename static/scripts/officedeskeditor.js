/* global = */
/* global ; */
var TimerId, controls;

document.addEventListener('DOMContentLoaded', function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
	
	var rollOverPosition = new THREE.Vector3(),
        rollOverMesh,
		cbPattern, cbType,
		cbTexture = {},
		zoomFactor = 1,
		zoomIncFactor = 0.01;
        
    var setRollOver = function (geo, mat, rType) {
        scene.remove(rollOverMesh);
        rollOverMesh = new THREE.Mesh(geo, mat);
        switch (rType) {
            case 'desk0':
                rollOverMesh._p = 'desk';
                rollOverMesh._t = 0;
                rollOverMesh._w = 160;
                rollOverMesh._h = 72;
                rollOverMesh._d = 80;
                rollOverMesh._r = false;
                //rollOverMesh.position.set(80, 36, 40);
                rollOverMesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-80, -36, -40));
                break;
            case 'desk1':
                rollOverMesh._p = 'desk';
                rollOverMesh._t = 1;
                rollOverMesh._w = 200;
                rollOverMesh._h = 72;
                rollOverMesh._d = 100;
                rollOverMesh._r = false;
                //rollOverMesh.position.set(100, 36, 50);
                rollOverMesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -70, 0));
                break;
        }
        scene.add(rollOverMesh);
    };
	
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
			//tempCube = new THREE.MeshPhongMaterial(newTexture);
            tempCube = new THREE.MeshLambertMaterial(newTexture);
			tempCube._cubePattern = k;
			tempCube._cubeType = l;
			cubeMaterials[k][l] = tempCube;
		}
	}
    
    // desk deometry
    var totalDeskTypes = 2,
        deskGeo = [];
    var loadDeskGeos = function (idx) {
        if (idx >= totalDeskTypes) {
            var mat = cubeMaterials['desk'][0].clone();
            mat.opacity = 0.6;
            mat.transparent = true;
            setRollOver(deskGeo[0].geometry.clone(), mat, 'desk0');
            //scene.add(rollOverMesh);
        } else {
            var fileName = encodeURIComponent('geometry_desk' + idx),
                xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/json/' + fileName, true);
            xhr.responseType = 'json';
            xhr.onload = function (e) {
                if (this.status == 200) {
                    var geometries = this.response;
                    deskGeo[idx] = THREE.JSONLoader.prototype.parse(geometries[0].g.data);
                    loadDeskGeos(idx + 1);
                }
            };
            xhr.send();
        }
    };
    loadDeskGeos(0);
    
    
    var rotateDesk = function () {
        if (rollOverMesh._r === false) {
            //rollOverMesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
            rollOverMesh.rotation.y += Math.PI / 2;
            rollOverMesh._r = true;
        } else {
            rollOverMesh.rotation.y -= Math.PI / 2;
            rollOverMesh._r = false;
        }
    };
	
	// picking
	var projector = new THREE.Projector();
	
	// grid
	var planeW = 530,
		planeH = 200,
		planeNumberW = 10,
		pleneNumberH = 10,
		plane = new THREE.Mesh(new THREE.PlaneGeometry(planeW * planeNumberW, planeH * pleneNumberH, planeW, planeH), new THREE.MeshBasicMaterial({
			color: 0x777777,
			wireframe: true
		}));
	plane.rotation.x = -(Math.PI * 90 / 180);
	scene.add(plane);
	
	var mouse2D = new THREE.Vector2(),
		raycaster = new THREE.Raycaster(),
		ambientLight = new THREE.AmbientLight(0xa0a0a0),
		directionalLight = new THREE.DirectionalLight(0xffffff);
        //hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
	scene.add(ambientLight);
	directionalLight.position.set(1, 1, -1).normalize();
	scene.add(directionalLight);
    //hemiLight.color.setHSL(0.6, 1, 0.6);
    //hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    //hemiLight.position.set(0, 500, 0);
    //scene.add(hemiLight);
	
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '5px';
	stats.domElement.style.right = '5px';
	container.appendChild(stats.domElement);

	var onDocumentMouseMove = function (e) {
		mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
		mouse2D.y = - (e.clientY / window.innerHeight) * 2 + 1;
	};
	
	var isCtrlDown = false,
		isAltDown = false;
		
	var onDocumentKeyDown = function (e) {
		switch (e.keyCode) {
            case '0'.charCodeAt(0):
                var mat = cubeMaterials['desk'][0].clone();
                mat.opacity = 0.6;
                mat.transparent = true;
                setRollOver(deskGeo[0].geometry.clone(), mat, 'desk0');
				break;
			case '1'.charCodeAt(0):
                var mat = cubeMaterials['desk'][0].clone();
                mat.opacity = 0.6;
                mat.transparent = true;
                setRollOver(deskGeo[1].geometry.clone(), mat, 'desk1');
				break;
			case 'R'.charCodeAt(0):
				rotateDesk();
				break;
			case 17:
				isCtrlDown = true;
				break;
			case 18:
				isAltDown = true;
				break;
			case 38:
				zoomInOut('in');
				break;
			case 40:
				zoomInOut('out');
				break;
		}	
	};
	
	var onDocumentKeyUp = function (e) {
		switch (e.keyCode) {
			case 17:
				isCtrlDown = false;
				break;
			case 18:
				isAltDown = false;
				break;
		}	
	};
	
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('keydown', onDocumentKeyDown, false);
	document.addEventListener('keyup', onDocumentKeyUp, false);

	var getRealIntersector = function (intersects) {
		var intersector;
		for (var i = 0; i < intersects.length; i++) {
			intersector = intersects[i];
			if (intersector.object != rollOverMesh) {
				return intersector;
			}
		}
	};
	
	var setRollOverPosition = function (intersector) {
		var normalMatrix = new THREE.Matrix3();
		normalMatrix.getNormalMatrix(intersector.object.matrixWorld);
		var rotatedNormal = new THREE.Vector3().copy(intersector.face.normal);
		rotatedNormal.applyMatrix3(normalMatrix);
		rollOverPosition.addVectors(intersector.point, rotatedNormal);
        
        if (rollOverMesh) {
            if (rollOverMesh._p === 'desk' && rollOverMesh._t === 0) {
                if (rollOverMesh._r) {
                    rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10 + 2;
                    rollOverPosition.y = Math.floor((rollOverPosition.y + (rollOverMesh._h)) / 10) * 10 + 1;
                    rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10 + 7;
                } else {
                    rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10 + 3.2;
                    //rollOverPosition.y = Math.floor((rollOverPosition.y + rollOverMesh._h) / 10) * 10 - 1;
                    rollOverPosition.y = Math.floor((rollOverPosition.y + (rollOverMesh._h)) / 10) * 10 + 1;
                    rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10 + 2;
                }
            } else if (rollOverMesh._p === 'desk' && rollOverMesh._t === 1) {
                rollOverPosition.y = Math.floor((rollOverPosition.y + (rollOverMesh._h)) / 10) * 10 + 1;
            }
        }
	};
	
	var lastPutDelTime = Date.now();
	var putDelDesk = function () {
		if (isCtrlDown === false && isAltDown === false) {
			return;
		}
		
		if (Date.now() - lastPutDelTime < 500) {
			return;
		} else {
			lastPutDelTime = Date.now();
		}
		
		var intersects = raycaster.intersectObjects(scene.children);
		
		if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);
			
			if (isAltDown) {
                if (intersector.object._p) {
                    if (intersector.object._p === 'desk') {
                        scene.remove(intersector.object);
                    }
                }
			} else if (isCtrlDown) {
				setRollOverPosition(intersector);
                var mat = cubeMaterials['desk'][0].clone();
				var desk = new THREE.Mesh(deskGeo[rollOverMesh._t].geometry.clone(), mat);
                switch (rollOverMesh._t) {
                    case 0:
                        desk.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-80, -36, -40));
                        break;
                    case 1:
                        desk.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -70, 0));
                        break;
                }
				desk.position.copy(rollOverPosition);
                if (rollOverMesh._r === true) {
                    desk.rotation.y += Math.PI / 2;
                    desk._r = true;
                } else {
                    desk._r = false;
                }
				desk.matrixAutoUpdate = false;
				desk.updateMatrix();
                desk._p = 'desk';
                desk._t = rollOverMesh._t;
                desk._userID = null;
				scene.add(desk);
			}
		}
	};
	
	var zoomInOut = function (inout) {
			//intersects = raycaster.intersectObjects(scene.children);
		/*if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);
			//var center = intersector.center;
			setVoxelPosition(intersector);
			var distance = voxelPosition.distanceTo(camera.position);
		}*/
		
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
		
		//camera.fov = fov;
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
            
            if (child === rollOverMesh) {
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
        var fileName = encodeURIComponent('desk_floor' + getSelectedFloor() + '_' + Date.now().valueOf());
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
	
	var buttons = document.querySelectorAll('.iofunctions button');
	buttons[0].addEventListener('click', printPNG, false);
	buttons[1].addEventListener('click', printJSON, false);
    buttons[2].addEventListener('click', saveJSON, false);
	
	var onDragOver = function (e) {
		e.preventDefault();
	};
	
	var onDrop = function (e) {
		event.preventDefault();
		var file, reader;
		
		for (var i = 0; i < e.dataTransfer.files.length; i++) {
			file = e.dataTransfer.files[i];
			reader = new FileReader();
			reader.onload = function (e) {
				var dataUri = e.target.result,
					base64 = dataUri.match(/[^,]*,(.*)/)[1],
					json = window.atob(base64);
				loadJSON(json);
			};
			reader.readAsDataURL(file);
		}
	};
	
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
			if (children[i]._p !== 'desk') {
				continue;
			}
			if (children[i] === rollOverMesh) {
				continue;
			}
			scene.remove(children[i]);
		}
        
        var desks = json,
            numDesk = desks.length,
            mesh;
        for (var i = 0; i < numDesk; i++) {
            var mat = cubeMaterials['desk'][0].clone();
            mesh = new THREE.Mesh(deskGeo[desks[i].t].geometry.clone(), mat);
            mesh.position.set(desks[i].x, desks[i].y, desks[i].z);
            switch (desks[i].t) {
                case 0:
                    mesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-80, -36, -40));
                    break;
                case 1:
                    mesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -70, 0));
                    break;
            }
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
    
	document.addEventListener('dragover', onDragOver, false);
	document.addEventListener('drop', onDrop, false);
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
		putDelDesk();
		raycaster.setFromCamera(mouse2D, camera);
		var intersects = raycaster.intersectObjects(scene.children);

		if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);

			if (intersector) {
				setRollOverPosition(intersector);
                if (rollOverMesh) {
				    rollOverMesh.position.copy(rollOverPosition);
                }
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
    
    var makeDesk = function() {
        var group = new THREE.Mesh();
        var topG = new THREE.BoxGeometry(160, 2, 80);
        var mat = cubeMaterials['desk'][0];
        var topM = new THREE.Mesh(topG, mat);
        topM.position.y = 35;
        var bsp1 = new ThreeBSP(topM);
        //group.add(topM);
        var rlG1 = new THREE.BoxGeometry(6, 70, 3);
        var rlM1 = new THREE.Mesh(rlG1, mat);
        rlM1.position.x = 76.8;
        rlM1.position.y = -1;
        rlM1.position.z = 38.2;
        var bsp2 = new ThreeBSP(rlM1);
        var tbsp = bsp1.union(bsp2);
        //group.add(rlM1);
        var rlG2 = new THREE.BoxGeometry(6, 3, 73.4);
        var rlM2 = new THREE.Mesh(rlG2, mat);
        rlM2.position.x = 76.8;
        rlM2.position.y = 32.5;
        //group.add(rlM2);
        var bsp3 = new ThreeBSP(rlM2);
        var tbsp2 = bsp3.union(tbsp);
        var rlG3 = new THREE.BoxGeometry(6, 70, 3);
        var rlM3 = new THREE.Mesh(rlG3, mat);
        rlM3.position.x = 76.8;
        rlM3.position.y = -1;
        rlM3.position.z = -38.2;
        //group.add(rlM3);
        var bsp4 = new ThreeBSP(rlM3);
        var tbsp3 = bsp4.union(tbsp2);
        var rlG4 = new THREE.BoxGeometry(6, 70, 3);
        var rlM4 = new THREE.Mesh(rlG4, mat);
        rlM4.position.x = -76.8;
        rlM4.position.y = -1;
        rlM4.position.z = 38.2;
        //group.add(rlM4);
        var bsp5 = new ThreeBSP(rlM4);
        var tbsp4 = bsp5.union(tbsp3);
        var rlG5 = new THREE.BoxGeometry(6, 3, 73.4);
        var rlM5 = new THREE.Mesh(rlG5, mat);
        rlM5.position.x = -76.8;
        rlM5.position.y = 32.5;
        //group.add(rlM5);
        var bsp6 = new ThreeBSP(rlM5);
        var tbsp5 = bsp6.union(tbsp4);
        var rlG6 = new THREE.BoxGeometry(6, 70, 3);
        var rlM6 = new THREE.Mesh(rlG6, mat);
        rlM6.position.x = -76.8;
        rlM6.position.y = -1;
        rlM6.position.z = -38.2;
        //group.add(rlM6);
        var bsp7 = new ThreeBSP(rlM6);
        var tbsp6 = bsp7.union(tbsp5);
        var fM = tbsp6.toMesh(mat);
        group.position.x = 500;
        group.position.y = 300;
        group.position.z = 200;
        scene.add(fM);
        
        var tObj = [{
            g: fM.geometry.toJSON()
        }];
        
        var dataUri = JSON.stringify(tObj);
		var xhr = new XMLHttpRequest();
        var fileName = encodeURIComponent('desk_' + Date.now().valueOf());
		var params = 'filename=' + fileName + '&content=' + dataUri;
		xhr.open('POST', '/api/json', true);
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		//xhr.setRequestHeader('content-length', params.length);
		//xhr.setRequestHeader('connection', 'close');
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
				//console.log(this.response.message);
                alert('JSON \'' + fileName + '.json\' saved');
			}
		};
		xhr.send(params);
    };
    
    /**
     * Make a Discussion room's desk
     */
    var makeDicussionDesk = function () {
        var material = cubeMaterials['desk'][0],
            topCurve = new THREE.EllipseCurve(0, 0, 200, 100, 0, 2 * Math.PI, false, 0),
            topPath = new THREE.Path(topCurve.getPoints(50)),
            topShape = topPath.toShapes(),
            topGeometry = new THREE.ExtrudeGeometry(topShape, {
                amount: 2,
                bevelEnabled: false,
                steps: 2
            }),
            topMesh = new THREE.Mesh(topGeometry, material);
        topMesh.rotation.x = Math.PI / 2;
        topMesh.position.y = 74;
        var bsp1 = new ThreeBSP(topMesh);
        var midGeometry = new THREE.CylinderGeometry(20, 20, 70, 16),
            midMesh = new THREE.Mesh(midGeometry, material);
        midMesh.position.y = 37;
        var bsp2 = new ThreeBSP(midMesh);
        var unionBsp2 = bsp2.union(bsp1);
        var botGeometry = new THREE.CylinderGeometry(40, 40, 2, 16),
            botMesh = new THREE.Mesh(botGeometry, material);
        botMesh.position.y = 0;
        var bsp3 = new ThreeBSP(botMesh);
        var unionBsp3 = bsp3.union(unionBsp2);
        var finalMesh = unionBsp3.toMesh(material);
        finalMesh.position.z = 500;
        finalMesh.position.y = 10;
        scene.add(finalMesh);
        
        var tObj = [{
            g: finalMesh.geometry.toJSON()
        }];
        
        var dataUri = JSON.stringify(tObj);
		var xhr = new XMLHttpRequest();
        var fileName = encodeURIComponent('desk2_' + Date.now().valueOf());
		var params = 'filename=' + fileName + '&content=' + dataUri;
		xhr.open('POST', '/api/json', true);
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		//xhr.setRequestHeader('content-length', params.length);
		//xhr.setRequestHeader('connection', 'close');
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
				//console.log(this.response.message);
                alert('JSON \'' + fileName + '.json\' saved');
			}
		};
		xhr.send(params);
    };
});