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
	];
	
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
	
	var mouse2D = new THREE.Vector3(0, 10000, 0.5),
		ray = new THREE.Ray(camera.position, null),
		ambientLight = new THREE.AmbientLight(0x606060);
	
	var animate = function () {
		requestAnimationFrame(animate);
		render();
	};
	
	var render = function () {
		renderer.render(scene, camera);
	};
	
	animate();
});