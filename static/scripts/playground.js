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
			depth: 5000,
			restitution: 0.6
		}
	},
	microPhysics,
	scene,
	spheres,
	nBodyGravity,
	player;

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
		innerCube,
		outterCube,
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
			
			if (pageOptions.player.enable) {
				if (!player) {
					player = new Playground.Player();
				}
				player.config();
			} else {
				if (player) {
					player.destroy();
				}
				player = null;
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
			
			if (pageOptions.spheres.enable) {
				if (!spheres) {
					spheres	= new Playground.Spheres();
				}
				spheres.config();
			} else {
				if (spheres) {
					spheres.destroy();
				}
				spheres	= null;
			}
	
			if (pageOptions.innerCube.enable) {
				if (!innerCube) {
					innerCube = new Playground.InnerCube();
				}
			} else {
				if (innerCube) {
					innerCube.destroy();
				}
				innerCube = null;
			}
	
			if (pageOptions.outterCube.enable) {
				if (!outterCube) {
					outterCube = new Playground.OutterCube();
				}
			} else {
				if (outterCube) {
					outterCube.destroy();
				}
				outterCube = null;
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
	gui.add(pageOptions.outterCube, 'enable').name('Outter Box').onChange(handleOption);
	gui.add(pageOptions.innerCube, 'enable').name('Inner Box').onChange(handleOption);
	
	var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = -7000;
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	
	scene = new THREE.Scene();
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
	
	handleOption();
	
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
	
	var animate = function() {
		requestAnimationFrame(animate);
		render();
		stats.update();
	};
	
	var render = function() {
		if (player) {
			player.update();
		}
		microPhysics.update(scene);	
		renderer.render(scene, camera);
	};
	
	animate();
});