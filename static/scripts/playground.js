$(document).ready(function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
	
	var pageOptions = {
		physicsSteps: 60,
		gravity: true,
		devOrientation: false,
		spheres : {
			enable: true,
			quantity: 120,
			restitution: 1.0
		},
		player: {
			enable: true,
			restitution: 1.0
		},
		nBodyGravity: {
			enable: false,
			strength: 5
		},
		innerCube: {
			enable: false,
			restitution: 1.0
		},
		outterCube: {
			enable: true,
			width: 10000,
			height: 5000,
			restitution: 0.6
		}
	};
	
	var microPhysics = new THREEx.Microphysics({
		timestep: 1 / pageOptions.physicsSteps
	});
	microPhysics.start();
	
	var handleOption = function () {
		microPhysics._timeStep = 1 / pageOptions.physicsSteps;
		
	};
	
	var gui = new dat.GUI({
		height: 10 * 32 - 1
	});
	gui.add(pageOptions, 'physicsSteps').name('physics steps').min(15).max(360).onFinishChange(handleOption);
	
	var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = -7000;
	
	var scene = new THREE.Scene();
	scene.add(new THREE.AmbientLight(0x404040));
	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(1, 1, 0).normalize();
	scene.add(light);
	
	var container = document.querySelector('#container'),
		renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);
	
	var animate = function() {
		requestAnimationFrame(animate);
		render();
	};
	
	var render = function() {
		renderer.render(scene, camera);
	};
});