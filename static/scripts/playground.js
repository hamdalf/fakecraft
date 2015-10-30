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
	},
	microPhysics;

$(document).ready(function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
	
	microPhysics = new THREEx.Microphysics({
		timestep: 1 / pageOptions.physicsSteps
	});
	microPhysics.start();
	
	var gravity,
		deviceOrientation,
		nBodyGravity,
		handleOption = function () {
			microPhysics._timeStep = 1 / pageOptions.physicsSteps;
			
			if (pageOptions.gravity) {
				if (!gravity) {
					gravity = new Playground.Gravity();
				}
			} else {
				if (gravity) {
					gravity.destroy();
				}
				gravity = null;
			}
			
			if (pageOptions.devOrientation) {
				if (!deviceOrientation) {
					deviceOrientation = new Playground.DevOrientation();
				}
			} else {
				if (deviceOrientation) {
					deviceOrientation.destroy();
				}
				deviceOrientation = null;
			}
			
			if (pageOptions.nBodyGravity.enable) {
				if (!nBodyGravity) {
					nBodyGravity = new Playground.nBodyGravity();
				}
			} else {
				if (nBodyGravity) {
					nBodyGravity.destroy();
				}
				nBodyGravity = null;
			}
			
			
		};
	
	var gui = new dat.GUI({
		height: 10 * 32 - 1
	});
	gui.add(pageOptions, 'physicsSteps').name('physics steps').min(15).max(360).onFinishChange(handleOption);
	gui.add(pageOptions, 'gravity').onChange(handleOption);
	gui.add(pageOptions, 'devOrientation').name('device orientation').onChange(handleOption);
	gui.add(pageOptions.spheres, 'enable').name('Sphere Enable').onChange(handleOption);
	gui.add(pageOptions.spheres, 'quantity').name('Number of Sphere').min(0).max(500).onFinishChange(handleOption);
	gui.add(pageOptions.spheres, 'restitution').name('Sphere Restitution').min(0).max(3).onFinishChange(handleOption);
	gui.add(pageOptions.player, 'enable').name('Player Enable').onChange(handleOption);
	gui.add(pageOptions.player, 'restitution').name('Player Restitution').min(0).max(3).onFinishChange(handleOption);
	gui.add(pageOptions.nBodyGravity, 'enable').name('n-bodies gravity enable').onChange(handleOption);
	gui.add(pageOptions.nBodyGravity, 'strength').name('n-bodies strengh').min(0).max(10.0).onFinishChange(handleOption);
	
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