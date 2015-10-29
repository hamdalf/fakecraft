document.addEventListener('DOMContentLoaded', function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
	
	var cubeColors = [
			new THREE.Color().setRGB(1, 0, 0),
			new THREE.Color().setRGB(0, 1, 0),
			new THREE.Color().setRGB(0, 0, 1),
			new THREE.Color().setRGB(1, 1, 0),
			new THREE.Color().setRGB(1, 0, 1),
			new THREE.Color().setRGB(0, 1, 1),
			new THREE.Color().setRGB(1, 0.5, 0.5),
			new THREE.Color().setRGB(1, 0.5, 1),
			new THREE.Color().setRGB(0.5, 0.5, 1),
			new THREE.Color().setRGB(0.5, 0.5, 0.5)
		],
		voxelPosition = new THREE.Vector3(),
		cubeType;
	
	var setCubeType = function (cType) {
		document.querySelector('.boxcolor').style.backgroundColor = '#' + cubeColors[cType].getHexString();
		rollOverMesh.material.color = cubeColors[cType];
		cubeType = cType;	
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
	camera.position.y = 800;
	camera.position.z = 800;
	camera.lookAt(new THREE.Vector3(0, 200, 0));
	
	var controls = new THREE.TrackballControls(camera);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [65, 83, 68];	// a:rotate, s:zoom, d:pan
	//controls.addEventListener('change', render);
	
	THREEx.WindowResize(renderer, camera);
	
	var scene = new THREE.Scene();
	
	// roll-over helper
	var rollOverGeo = new THREE.BoxGeometry(50, 50, 50),
		rollOverMaterial = new THREE.MeshBasicMaterial({
			color: 0xff0000,
			opacity: 0.5,
			transparent: true
		}),
		rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
	
	scene.add(rollOverMesh);
	
	// cubes
	var cubeGeo = new THREE.CubeGeometry(50, 50, 50),
		cubeMaterials = [],
		tempCube;
	for (var i = 0; i < cubeColors.length; i++) {
		tempCube = new THREE.MeshPhongMaterial({
			color: 0x00ff80,
			shading: THREE.FlatShading,
			map: THREE.ImageUtils.loadTexture('/images/mapeditor/square-outline-textured.png')
		});
		tempCube.color.copy(cubeColors[i]);
		tempCube._cubeType = i;
		cubeMaterials.push(tempCube);
	}
	setCubeType(0);
	
	// picking
	var projector = new THREE.Projector();
	
	// grid
	var planeW = 50,
		planeH = 50,
		planeNumberW = 50,
		pleneNumberH = 50,
		plane = new THREE.Mesh(new THREE.PlaneGeometry(planeW * planeNumberW, planeH * pleneNumberH, planeW, planeH), new THREE.MeshBasicMaterial({
			color: 0x555555,
			wireframe: true
		}));
	plane.rotation.x = -(Math.PI * 90 / 180);
	scene.add(plane);
	
	//var mouse2D = new THREE.Vector3(0, 10000, 0.5),
		//ray = new THREE.Ray(camera.position, null),
	var mouse2D = new THREE.Vector2(),
		raycaster = new THREE.Raycaster(),
		ambientLight = new THREE.AmbientLight(0x606060),
		directionalLight = new THREE.DirectionalLight(0xffffff);
	scene.add(ambientLight);
	directionalLight.position.set(1, 1, 1).normalize();
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
	
	var translateCubes = function (dx, dy, dz) {
		var children = scene.children,
			child;
			
		for (var i = 0; i < children.length; i++) {
			child = children[i];
			if (child instanceof THREE.Mesh === false) {
				continue;
			}
			if (child.geometry instanceof THREE.CubeGeometry === false) {
				continue;
			}
			if (child === rollOverMesh) {
				continue;
			}
			child.position.x += dx * 50;
			child.position.y += dy * 50;
			child.position.z += dz * 50;
			
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
				setCubeType(0);
				break;
			case '1'.charCodeAt(0):
				setCubeType(1);
				break;
			case '2'.charCodeAt(0):
				setCubeType(2);
				break;
			case '3'.charCodeAt(0):
				setCubeType(3);
				break;
			case '4'.charCodeAt(0):
				setCubeType(4);
				break;
			case '5'.charCodeAt(0):
				setCubeType(5);
				break;
			case '6'.charCodeAt(0):
				setCubeType(6);
				break;
			case '7'.charCodeAt(0):
				setCubeType(7);
				break;
			case '8'.charCodeAt(0):
				setCubeType(8);
				break;
			case '9'.charCodeAt(0):
				setCubeType(9);
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
		voxelPosition.x = Math.floor(voxelPosition.x / 50) * 50 + 25;
		voxelPosition.y = Math.floor(voxelPosition.y / 50) * 50 + 25;
		voxelPosition.z = Math.floor(voxelPosition.z / 50) * 50 + 25;
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
				if (intersector.object != plane) {
					scene.remove(intersector.object);
				}
			} else if (isCtrlDown) {
				setVoxelPosition(intersector);
				var voxel = new THREE.Mesh(cubeGeo, cubeMaterials[cubeType]);
				voxel.position.copy(voxelPosition);
				voxel.matrixAutoUpdate = false;
				voxel.updateMatrix();
				scene.add(voxel);
			}
		}
	};
	
	var savePNG = function () {
		window.open(renderer.domElement.toDataURL('image/png'), 'pngwindow');	
	};
	
	var saveJSON = function () {
		var children = scene.children,
			voxels = [],
			child;

		for (var i = 0; i < children.length; i++) {
			child = children[i];
			if (child instanceof THREE.Mesh === false) {
				continue;
			}
			if (child.geometry instanceof THREE.CubeGeometry === false) {
				continue;
			}
			if (child === rollOverMesh) {
				continue;
			}
			
			voxels.push({
				x: (child.position.x - 25) / 50,
				y: (child.position.y - 25) / 50,
				z: (child.position.z - 25) / 50,
				t: child.material._cubeType
			});
		}
		
		var dataUri = "data:application/json;charset=utf-8," + JSON.stringify(voxels);
		window.open(dataUri, 'jsonwindow');
	};
	
	var buttons = document.querySelectorAll('.iofunctions button');
	buttons[0].addEventListener('click', savePNG, false);
	buttons[1].addEventListener('click', saveJSON, false);
	
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
			if (children[i].geometry instanceof THREE.CubeGeometry === false) {
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
			mesh = new THREE.Mesh(cubeGeo, cubeMaterials[voxel.t]);
			mesh.position.x = voxel.x * 50 + 25;
			mesh.position.y = voxel.y * 50 + 25;
			mesh.position.z = voxel.z * 50 + 25;
			mesh.matrixAutoUpdate = true;
			mesh.updateMatrix();
			scene.add(mesh);
		}
	};
	document.addEventListener('dragover', onDragOver, false);
	document.addEventListener('drop', onDrop, false);
	
	var animate = function () {
		requestAnimationFrame(animate);
		controls.update();
		render();
		stats.update();
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