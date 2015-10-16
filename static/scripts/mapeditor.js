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
		voxelPosition = new THREE.Vector3();
	
	var setCubeType = function (cubeType) {
		document.querySelector('.boxcolor').style.backgroundColor = '#' + cubeColors[cubeType].getHexString();
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
	
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	
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
	
	var animate = function () {
		requestAnimationFrame(animate);
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