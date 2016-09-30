var TimerId, controls,
    defaultWidth = 600,		// 605
    defaultHeight = 350,	// 346
	lastSavedFileName;

document.addEventListener('DOMContentLoaded', function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
	
	var voxelPosition = new THREE.Vector3(),
		cbPattern, cbType,
		cbTexture = {},
		zoomFactor = 1,
		zoomIncFactor = 0.01,
        planeObj, bgObj;
		
	var setCubeType = function (cPattern, cType) {
		//document.querySelector('.boxcolor').style.backgroundColor = '#' + cubeColors[cType].getHexString();
		//rollOverMesh.material.color = cubeColors[cType];
		cbPattern = cPattern;
		cbType = cType;
		var selectedTexture = cubePattern[cPattern][cType],
			newTexture = {};
		for (var k in rollOverTexture) {
			newTexture[k] = rollOverTexture[k];
		}
		
		for (var k in selectedTexture) {
			newTexture[k] = selectedTexture[k];
			cbTexture[k] = selectedTexture[k];
		}

		var rollOverMaterial = new THREE.MeshPhongMaterial(newTexture);
		if (!rollOverMesh) {
			rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
		} else {
			rollOverMesh.material = rollOverMaterial;
		}
	};
	
	// roll-over helper
	var rollOverGeo = new THREE.BoxGeometry(10, 10, 10),
		rollOverTexture = {
			opacity: 0.6,
			transparent: true
		},
		rollOverMesh;
		
	setCubeType('floor', 0);
	
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
	scene.add(rollOverMesh);
	
	// cubes
	var cubeGeo = new THREE.BoxGeometry(10, 10, 10),
		cubeMaterials = {},
		tempCube, newTexture;
	for (var k in cubePattern) {
		if (!cubeMaterials[k]) {
			cubeMaterials[k] = {};
		}
		for (var l in cubePattern[k]) {
			/*newTexture = {
				shading: THREE.FlatShading
			};*/
			newTexture = {};
			for (var m in cubePattern[k][l]) {
				newTexture[m] = cubePattern[k][l][m];
			}
			//delete newTexture.shading;	// for performance
			//delete newTexture.transparent;	// for performance
			//newTexture.opacity = 1.0;	// for performance
			tempCube = new THREE.MeshPhongMaterial(newTexture);
			//tempCube = new THREE.MeshBasicMaterial(newTexture);	// for performance
			tempCube._cubePattern = k;
			tempCube._cubeType = l;
			cubeMaterials[k][l] = tempCube;
		}
	}
	
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
		if (!bgSetter[0].value) {
			setGrid(sizeSetter[0].value, sizeSetter[1].value);
		} else if (parseInt(bgSetter[0].value) == 0) {
        	setGrid(sizeSetter[0].value, sizeSetter[1].value, bgSetter[1].value);
		} else {
			addBGLayer(sizeSetter[0].value, sizeSetter[1].value, bgSetter[0].value, bgSetter[1].value);
		}
    }, false);

	var bgSetter = document.querySelectorAll('.bgimg input');
	bgSetter[1].addEventListener('click', function(e) {
		e.preventDefault();
        e.stopPropagation();

		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/images/indoor', true);
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
						var fileName = (e.srcElement) ? e.srcElement.getAttribute('href') : e.target.getAttribute('href');
						document.querySelectorAll('.bgimg input')[1].value = fileName;
					});
					tr.appendChild(ta);
					wrapper.appendChild(tr);
					navigation.show();
				}
			}
		};
		xhr.send();
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
			case '0'.charCodeAt(0):
				setCubeType('floor', 0);
				break;
			case '1'.charCodeAt(0):
				setCubeType('floor', 1);
				break;
			case '2'.charCodeAt(0):
				setCubeType('floor', 2);
				break;
			case '3'.charCodeAt(0):
				setCubeType('wall', 0);
				break;
            case '4'.charCodeAt(0):
				setCubeType('wall', 1);
				break;
            case '5'.charCodeAt(0):
				setCubeType('wall', 2);
				break;
            case '6'.charCodeAt(0):
				setCubeType('wall', 3);
				break;
			case '7'.charCodeAt(0):
				setCubeType('path', 0);
				break;
			case '8'.charCodeAt(0):
				setCubeType('floor', 3);
				break;
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
			case 17:
				isCtrlDown = true;
				break;
			case 18:
				isAltDown = true;
				break;
			case 38:
				zoomInOut('in');
				//controls.position0.setZ(controls.position0.z - 100);
				//controls.reset();
				break;
			case 40:
				zoomInOut('out');
				//controls.position0.setZ(controls.position0.z + 100);
				//controls.reset();
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
	
	var setVoxelPosition = function (intersector) {
		var normalMatrix = new THREE.Matrix3();
		normalMatrix.getNormalMatrix(intersector.object.matrixWorld);
		var rotatedNormal = new THREE.Vector3().copy(intersector.face.normal);
		rotatedNormal.applyMatrix3(normalMatrix);
		//var tmpVec = new THREE.Vector3().copy(intersector.face.normal),
		//voxelPosition.add(intersector.point, intersector.object.matrixRotationWorld.multiplyVector3(tmpVec));
		voxelPosition.addVectors(intersector.point, rotatedNormal);
		voxelPosition.x = Math.floor(voxelPosition.x / 10) * 10 + 5;
		voxelPosition.y = Math.floor(voxelPosition.y / 10) * 10 + 5;
		voxelPosition.z = Math.floor(voxelPosition.z / 10) * 10 + 5;
	};
	
	var lastPutDelTime = Date.now();
	var putDelVoxel = function () {
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
				if (intersector.object != planeObj) {
					scene.remove(intersector.object);
				}
			} else if (isCtrlDown) {
				setVoxelPosition(intersector);
				
				var voxel = new THREE.Mesh(cubeGeo, cubeMaterials[cbPattern][cbType]);
				voxel.position.copy(voxelPosition);
				voxel.matrixAutoUpdate = false;
				voxel.updateMatrix();
				scene.add(voxel);
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
		
		//console.log(zoomFactor);
		//camera.fov = fov;
		camera.fov *= zoomFactor;
		camera.updateProjectionMatrix();
		//console.log(distance);
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
		
		var dataUri = JSON.stringify(voxels);
		var xhr = new XMLHttpRequest();
        var fileName = encodeURIComponent(Date.now().valueOf());
		var params = 'filename=' + fileName + '&content=' + dataUri;
		xhr.open('POST', '/api/json2', true);
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		//xhr.setRequestHeader('content-length', params.length);
		//xhr.setRequestHeader('connection', 'close');
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
				//console.log(this.response.message);
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
	saveButtons[1].addEventListener('click', function(e) {
		e.preventDefault();
        e.stopPropagation();

		if (!lastSavedFileName) {

		} else {
			document.location.href = '/indooroptimizer.html?f=' + lastSavedFileName.replace('.json', '');
		}
	}, false);

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

	var onFileNameClick = function(e) {
		var fileName = (e.srcElement) ? e.srcElement.getAttribute('href') : e.target.getAttribute('href');
		lastSavedFileName = fileName.replace('.json', '');
        
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/file/indoor/' + fileName.replace('.json', ''), true);
		xhr.responseType = 'text';
		xhr.onload = function (e) {
			if (this.status == 200) {
                loadJSON(this.responseText);
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
	
	var onDragOver = function (e) {
		e.preventDefault()
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
			voxel, mesh, tmpMaterial;
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
    
	document.addEventListener('dragover', onDragOver, false);
	document.addEventListener('drop', onDrop, false);
	
	var animate = function () {
		TimerId = requestAnimationFrame(animate);
		controls.update();
		render();
	};
	
	var render = function () {
		//var mouse3D = projector.unprojectVector(mouse2D.clone(), camera);
		//var mouse3D = mouse2D.clone();
		//mouse3D.unproject(camera);
		//ray.direction = mouse3D.subSelf(camera.position).normalize();
		//ray.direction = mouse3D.sub(camera.position).normalize();
		//var intersects = ray.intersectScene(scene);
		putDelVoxel();
		raycaster.setFromCamera(mouse2D, camera);
		var intersects = raycaster.intersectObjects(scene.children);

		if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);

			if (intersector) {
				setVoxelPosition(intersector);
				//rollOverMesh.position = voxelPosition;
				rollOverMesh.position.copy(voxelPosition);
			}
		}
		
		renderer.render(scene, camera);
	};
	
	animate();
});
