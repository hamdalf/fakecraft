var TimerId, controls,
	defaultWidth = 600,		// 605
    defaultHeight = 350,	// 346
	lastSavedFileName;

document.addEventListener('DOMContentLoaded', function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
	
	var rollOverPosition = new THREE.Vector3(),
        rollOverMesh,
		cbPattern, cbType,
		cbTexture = {},
		zoomFactor = 1,
		zoomIncFactor = 0.01,
        planeObj, bgObj;
		
	var setRollOver = function (geo, mat, rType) {
        scene.remove(rollOverMesh);
        rollOverMesh = new THREE.Mesh(geo, mat);
        switch (rType) {
            case 'desk':
                rollOverMesh._p = 'desk';
                rollOverMesh._w = 200;
                rollOverMesh._h = 72;
                rollOverMesh._d = 100;
                rollOverMesh._r = false;
                rollOverMesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-80, -36, -40));
                break;
            default:
                var typeArr = rType.split('x');
                rollOverMesh._p = rType;
                rollOverMesh._w = parseInt(typeArr[0]) * 50;
                rollOverMesh._h = 10;
                rollOverMesh._d = parseInt(typeArr[1]) * 50;
                rollOverMesh._r = false;
				rollOverMesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -5, 0));
                break;
        }
        scene.add(rollOverMesh);
		document.querySelector('footer .now').innerHTML = rType;
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
			setRollOver(deskGeo[objectType[1]].geometry.clone(), cubeMaterials['desk'][0].clone(), '2x2');
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

	var rotateDesk = function () {
        if (rollOverMesh._r === false) {
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
    var setGrid = function (pW, pH, bI) {
        if (planeObj) {
            scene.remove(planeObj);
        }

        var planeW = pW,
            planeH = pH,
			planeBG = (bI) ? '/images/indooreditor/' + bI : null,
            planeNumberW = 10,
            pleneNumberH = 10,
			planeMaterial;
		if (bI) {
			planeMaterial = new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture(planeBG),
				wireframe: true
			});
			planeMaterial.map.needsUpdate = true;
		} else {
			planeMaterial = new THREE.MeshBasicMaterial({
				color: 0x777777,
				wireframe: true
			});
		}
        planeObj = new THREE.Mesh(new THREE.PlaneGeometry(planeW * planeNumberW, planeH * pleneNumberH, planeW, planeH), planeMaterial);
		planeObj.overdraw = true;
        planeObj.rotation.x = -(Math.PI * 90 / 180);
        scene.add(planeObj);
    };
	// gb layer
	var addBGLayer = function(pW, pH, pL, bI) {
		if (bgObj) {
			scene.remove(bgObj);
		}

		var planeW = pW,
            planeH = pH,
			planeBG = (bI) ? '/images/indooreditor/' + bI : null,
            planeNumberW = 10,
            pleneNumberH = 10,
			planeMaterial;
		if (bI) {
			planeMaterial = new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture(planeBG),
				wireframe: true
			});
			planeMaterial.map.needsUpdate = true;
		} else {
			planeMaterial = new THREE.MeshBasicMaterial({
				color: 0x777777,
				wireframe: true
			});
		}
        bgObj = new THREE.Mesh(new THREE.PlaneGeometry(planeW * planeNumberW, planeH * pleneNumberH, planeW, planeH), planeMaterial);
		bgObj.overdraw = true;
        bgObj.rotation.x = -(Math.PI * 90 / 180);
		bgObj.position.y = pL * 10;
        scene.add(bgObj);
	};
    setGrid(defaultWidth, defaultHeight);
    var sizeSetter = document.querySelectorAll('.size input');
    sizeSetter[0].value = defaultWidth;
    sizeSetter[1].value = defaultHeight;
	var bgSetter = document.querySelectorAll('.bgimg input');
    document.querySelector('.size button').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
		if (parseInt(bgSetter[0].value) == 0) {
        	setGrid(sizeSetter[0].value, sizeSetter[1].value, bgSetter[1].value);
		} else {
			addBGLayer(sizeSetter[0].value, sizeSetter[1].value, bgSetter[0].value, bgSetter[1].value);
		}
    }, false);

	// BG image
	document.querySelector('.bgimg button').addEventListener('click', function(e) {
		e.preventDefault();
        e.stopPropagation();
		if (parseInt(bgSetter[0].value) == 0) {
			setGrid(sizeSetter[0].value, sizeSetter[1].value, bgSetter[0].value);
		} else {
			addBGLayer(sizeSetter[0].value, sizeSetter[1].value, bgSetter[0].value, bgSetter[1].value);
		}
	});
	
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

	var translateCubes = function (dx, dy, dz) {
		var children = scene.children,
			child;
			
		for (var i = 0; i < children.length; i++) {
			child = children[i];
			if (child instanceof THREE.Mesh === false) {
				continue;
			}
			if (child.geometry instanceof THREE.BoxGeometry === false) {
				continue;
			}
			if (child === rollOverMesh) {
				continue;
			}
			child.position.x += dx * 10;
			child.position.y += dy * 10;
			child.position.z += dz * 10;
			
			child.updateMatrix();
		}
	};
	
	var isCtrlDown = false,
		isAltDown = false,
		isADown = false,
		isSDown = false,
		isDDown = false;
		
	var onDocumentKeyDown = function (e) {
		switch (e.keyCode) {
			case 'A'.charCodeAt(0):
				isADown = true;
				break;
			case 'S'.charCodeAt(0):
				isSDown = true;
				break;
			case 'D'.charCodeAt(0):
				isDDown = true;
				break;
			case 'I'.charCodeAt(0):
				translateCubes(0, +1, 0);
				break;
			case 'K'.charCodeAt(0):
				translateCubes(0, -1, 0);
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
			case 'A'.charCodeAt(0):
				isADown = false;
				break;
			case 'S'.charCodeAt(0):
				isSDown = false;
				break;
			case 'D'.charCodeAt(0):
				isDDown = false;
				break;
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
			if (rollOverMesh._p === 'desk') {
				rollOverPosition.y = Math.floor((rollOverPosition.y + (rollOverMesh._h)) / 10) * 10 + 1;
				if (rollOverMesh._r) {
					rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10 + 2;
                    rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10 + 7;
				} else {
					rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10 + 3.2;
                    rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10 + 2;
				}
			} else {
				rollOverPosition.y = Math.floor((rollOverPosition.y + (rollOverMesh._h)) / 10) * 10;
				var typeArr = rollOverMesh._p.split('x');
				if (rollOverMesh._r) {
					if (typeArr[0] % 2 === 0) {
						if (typeArr[1] % 2 === 0) {
							rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10;
							rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10;
						} else {
							rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10 + 5;
							rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10;
						}
					} else {
						if (typeArr[1] % 2 === 0) {
							rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10;
							rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10 + 5;
						} else {
							rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10 + 5;
							rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10 + 5;
						}
					}
				} else {
					if (typeArr[0] % 2 === 0) {
						rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10;
					} else {
						rollOverPosition.x = Math.floor((rollOverPosition.x) / 10) * 10 + 5;
					}
					if (typeArr[1] % 2 === 0) {
						rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10;
					} else {
						rollOverPosition.z = Math.floor((rollOverPosition.z) / 10) * 10 + 5;
					}
				}
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
                    } else {
						for (var i = 0; i < objectType.length; i++) {
							if (intersector.object._p === objectType[i]) {
								scene.remove(intersector.object);
							}
						}
					}
                }
			} else if (isCtrlDown) {
				setRollOverPosition(intersector);
                var mat = cubeMaterials['desk'][0].clone();
				var desk = new THREE.Mesh(deskGeo[rollOverMesh._p].geometry.clone(), mat);
                switch (rollOverMesh._p) {
                    case 'desk':
                        desk.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-80, -36, -40));
                        break;
                    default:
                        desk.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -5, 0));
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
                desk._p = rollOverMesh._p;
                desk._userID = null;
				scene.add(desk);
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
	
	var printPNG = function (e) {
		e.preventDefault();
        e.stopPropagation();

		window.open(renderer.domElement.toDataURL('image/png'), 'pngwindow');	
	};
	
	var printJSON = function (e) {
		e.preventDefault();
        e.stopPropagation();
		
		var children = scene.children,
			voxels = [],
			child;

		for (var i = 0; i < children.length; i++) {
			child = children[i];
			if (child instanceof THREE.Mesh === false) {
				continue;
			}
			if (child.geometry instanceof THREE.BoxGeometry === false) {
				continue;
			}
			if (child === rollOverMesh) {
				continue;
			}
			
			voxels.push({
				x: (child.position.x - 5) / 10,
				y: (child.position.y - 5) / 10,
				z: (child.position.z - 5) / 10,
				p: child.material._cubePattern,
				t: child.material._cubeType
			});
		}
		
		var dataUri = "data:application/json;charset=utf-8," + JSON.stringify(voxels);
		window.open(dataUri, 'jsonwindow');
	};
	
	var saveJSON = function (e) {
		e.preventDefault();
        e.stopPropagation();
		
		var children = scene.children,
			voxels = [],
			child, isDesk;

		for (var i = 0; i < children.length; i++) {
			child = children[i];
			isBooth = false;
			if (child._p !== 'desk') {
				for (var i = 0; i < objectType.length; i++) {
					if (child._p === objectType[i]) {
						isBooth = true;
					}
				}

				if (!isBooth) {
					continue;
				}
			}
            
            if (child === rollOverMesh) {
				continue;
			}
			
			voxels.push({
				x: (child.position.x - 5) / 10,
				y: (child.position.y - 5) / 10,
				z: (child.position.z - 5) / 10,
				p: child.material._cubePattern,
				t: child.material._cubeType
			});
		}
		
		var dataUri = JSON.stringify(voxels);
		var xhr = new XMLHttpRequest();
        var fileName = encodeURIComponent('object_' + Date.now().valueOf());
		var params = 'filename=' + fileName + '&position=indoor&content=' + dataUri;
		xhr.open('POST', '/api/file', true);
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
				lastSavedFileName = fileName;
                alert('JSON \'' + fileName + '.json\' saved');
			}
		};
		xhr.send(params);
	};
	
	var printButtons = document.querySelectorAll('.print a');
	printButtons[0].addEventListener('click', printPNG, false);
	printButtons[1].addEventListener('click', printJSON, false);

	var saveButtons = document.querySelectorAll('.save a');
	saveButtons[0].addEventListener('click', saveJSON, false);

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
                createMap(this.response);
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
	
	var loadJSON = function (mapJSON) {
		var children = scene.children.slice(0);
		
		for (var i = 0; i < children.length; i++) {
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
		
		var voxels = JSON.parse(mapJSON),
			voxel, mesh;
		for (var i = 0; i < voxels.length; i++) {
            voxel = voxels[i];
			mesh = new THREE.Mesh(cubeGeo, cubeMaterials[voxel.p][voxel.t]);
			mesh.position.x = voxel.x * 10 + 5;
			mesh.position.y = voxel.y * 10 + 5;
			mesh.position.z = voxel.z * 10 + 5;
			mesh.matrixAutoUpdate = true;
			mesh.updateMatrix();
			scene.add(mesh);
		}
	};
	
	var animate = function () {
		TimerId = requestAnimationFrame(animate);
		controls.update();
		render();
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

    var desk2Buttons = document.querySelectorAll('.desk2series a');
    desk2Buttons[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['2x2'].geometry.clone(), cubeMaterials['desk'][0].clone(), '2x2');
    });
    desk2Buttons[1].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['2x3'].geometry.clone(), cubeMaterials['desk'][0].clone(), '2x3');
    });
    desk2Buttons[2].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['2x4'].geometry.clone(), cubeMaterials['desk'][0].clone(), '2x4');
    });
    desk2Buttons[3].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['2x5'].geometry.clone(), cubeMaterials['desk'][0].clone(), '2x5');
    });
    desk2Buttons[4].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['2x6'].geometry.clone(), cubeMaterials['desk'][0].clone(), '2x6');
    });

	var desk3Buttons = document.querySelectorAll('.desk3series a');
    desk3Buttons[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['3x3'].geometry.clone(), cubeMaterials['desk'][0].clone(), '3x3');
    });
    desk3Buttons[1].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['3x4'].geometry.clone(), cubeMaterials['desk'][0].clone(), '3x4');
    });
    desk3Buttons[2].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['3x5'].geometry.clone(), cubeMaterials['desk'][0].clone(), '3x5');
    });
    desk3Buttons[3].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['3x6'].geometry.clone(), cubeMaterials['desk'][0].clone(), '3x6');
    });
    desk3Buttons[4].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['3x7'].geometry.clone(), cubeMaterials['desk'][0].clone(), '3x7');
    });
	desk3Buttons[5].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['3x8'].geometry.clone(), cubeMaterials['desk'][0].clone(), '3x8');
    });

	var desk4Buttons = document.querySelectorAll('.desk4series a');
    desk4Buttons[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['4x4'].geometry.clone(), cubeMaterials['desk'][0].clone(), '4x4');
    });
    desk4Buttons[1].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['4x5'].geometry.clone(), cubeMaterials['desk'][0].clone(), '4x5');
    });
    desk4Buttons[2].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['4x6'].geometry.clone(), cubeMaterials['desk'][0].clone(), '4x6');
    });
    desk4Buttons[3].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['4x7'].geometry.clone(), cubeMaterials['desk'][0].clone(), '4x7');
    });
    desk4Buttons[4].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['4x8'].geometry.clone(), cubeMaterials['desk'][0].clone(), '4x8');
    });
	desk4Buttons[5].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['4x9'].geometry.clone(), cubeMaterials['desk'][0].clone(), '4x9');
    });
	desk4Buttons[6].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['4x10'].geometry.clone(), cubeMaterials['desk'][0].clone(), '4x10');
    });

	var desk5Buttons = document.querySelectorAll('.desk5series a');
    desk5Buttons[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['5x5'].geometry.clone(), cubeMaterials['desk'][0].clone(), '5x5');
    });
    desk5Buttons[1].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['5x6'].geometry.clone(), cubeMaterials['desk'][0].clone(), '5x6');
    });
    desk5Buttons[2].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['5x7'].geometry.clone(), cubeMaterials['desk'][0].clone(), '5x7');
    });
    desk5Buttons[3].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['5x8'].geometry.clone(), cubeMaterials['desk'][0].clone(), '5x8');
    });
    desk5Buttons[4].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['5x9'].geometry.clone(), cubeMaterials['desk'][0].clone(), '5x9');
    });
	desk5Buttons[5].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['5x10'].geometry.clone(), cubeMaterials['desk'][0].clone(), '5x10');
    });

	var desk6Buttons = document.querySelectorAll('.desk6series a');
    desk6Buttons[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['6x6'].geometry.clone(), cubeMaterials['desk'][0].clone(), '6x6');
    });
    desk6Buttons[1].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['6x7'].geometry.clone(), cubeMaterials['desk'][0].clone(), '6x7');
    });
    desk6Buttons[2].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['6x8'].geometry.clone(), cubeMaterials['desk'][0].clone(), '6x8');
    });
    desk6Buttons[3].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['6x9'].geometry.clone(), cubeMaterials['desk'][0].clone(), '6x9');
    });
    desk6Buttons[4].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['6x10'].geometry.clone(), cubeMaterials['desk'][0].clone(), '6x10');
    });

	var desk8Buttons = document.querySelectorAll('.desk8series a');
    desk8Buttons[0].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['8x9'].geometry.clone(), cubeMaterials['desk'][0].clone(), '8x9');
    });
    desk8Buttons[1].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['8x10'].geometry.clone(), cubeMaterials['desk'][0].clone(), '8x10');
    });
    desk8Buttons[2].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['10x15'].geometry.clone(), cubeMaterials['desk'][0].clone(), '10x15');
    });
    desk8Buttons[3].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['12x18'].geometry.clone(), cubeMaterials['desk'][0].clone(), '12x18');
		//makeDesk(12, 18);
    });
	desk8Buttons[4].addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setRollOver(deskGeo['desk'].geometry.clone(), cubeMaterials['desk'][0].clone(), 'desk');
    });

    /*var makeDesk = function(w, h) {
        var group = new THREE.Mesh();
        var topG = new THREE.BoxGeometry(w * 50, 10, h * 50);
        var mat = cubeMaterials['desk'][0];
        var topM = new THREE.Mesh(topG, mat);
        topM.position.y = 5
        var bsp1 = new ThreeBSP(topM);
        var fM = bsp1.toMesh(mat);
        scene.add(fM);

        var tObj = [{
            g: fM.geometry.toJSON()
        }];

        var dataUri = JSON.stringify(tObj);
		var xhr = new XMLHttpRequest();
        var fileName = encodeURIComponent('desk_' + w + 'x' + h);
		var params = 'filename=' + fileName + '&position=indoor&content=' + dataUri;
		xhr.open('POST', '/api/file', true);
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                alert('JSON \'' + fileName + '.json\' saved');
			}
		};
		xhr.send(params);
    };*/
});
