require([
	'/scripts/threex/threex.windowresize.js',
	'/scripts/threex/threex.animation.js',
	'/scripts/threex/threex.animations.js',
	'/scripts/threex/threex.daynight.js',
	'/scripts/threex/threex.mountainsarena.js',
	'/scripts/threex/threex.minecraft.js',
	'/scripts/threex/threex.minecraftcharheadanim.js',
	'/scripts/threex/threex.minecraftcharbodyanim.js',
	'/scripts/threex/threex.minecraftcontrols.js',
	'/scripts/threex/threex.minecraftplayer.js',
	'/scripts/threex/htmlmixer/package.require.js',
	'/scripts/threex/domevents/threex.domevents.js'
], function () {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
		throw 'WebGL Not Available';
	}
	
	var renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	
	var onRenderFcts = [];
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.01, 30000);
	camera.position.z = 2;
	
	THREEx.WindowResize(renderer, camera);
	
	var light = new THREE.AmbientLight(0x020202);
	scene.add(light);
	light = new THREE.DirectionalLight('white', 1);
	light.position.set(0.5, 0.5, 2);
	scene.add(light);
	light = new THREE.DirectionalLight('white', 0.75);
	light.position.set(-0.5, -0.5, -2);
	scene.add(light);
	
	var sunAngle = Math.PI + Math.PI / 2,
		starField = new THREEx.DayNight.StarField(),
		sunSphere = new THREEx.DayNight.SunSphere(),
		sunLight = new THREEx.DayNight.SunLight(),
		skyDom = new THREEx.DayNight.Skydom();
	scene.add(starField.object3d);
	scene.add(sunSphere.object3d);
	scene.add(sunLight.object3d);
	scene.add(skyDom.object3d);
	onRenderFcts.push(function (delta, now) {
		var dayDuration = 20;
		sunAngle -= delta / dayDuration * Math.PI / 2;
		starField.update(sunAngle);
		sunSphere.update(sunAngle);
		sunLight.update(sunAngle);
		skyDom.update(sunAngle);
	});
	
	THREEx.MontainsArena.defaultMaterial = THREE.MeshPhongMaterial;
	var mesh = new THREEx.MontainsArena();
	mesh.scale.multiplyScalar(30);
	scene.add(mesh);
	
	var groundTextureUrl = '/scripts/threex/images/grasslight-small.jpg',
		texture = THREE.ImageUtils.loadTexture(groundTextureUrl);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.x = 10;
	texture.repeat.y = 10;
	texture.anisotropy = 16;
	
	var geometry = new THREE.CircleGeometry(30, 32),
		material = new THREE.MeshPhongMaterial({
			map: texture
		}),
		mesh = new THREE.Mesh(geometry, material);
	mesh.lookAt(new THREE.Vector3(0, 1, 0));
	scene.add(mesh);
	
	THREEx.MinecraftChar.defaultMaterial = THREE.MeshPhongMaterial;
	
	var player = new THREEx.MinecraftPlayer();
	player.character.loadWellKnownSkin('iron-man');
	player.character.root.rotation.y = Math.PI;
	player.character.root.position.x = 0;
	player.character.root.position.z = 10;
	scene.add(player.character.root);
	onRenderFcts.push(function (delta, now) {
		player.update(delta, now);
		var position = player.character.root.position,
			maxRadius = 12;
		if (position.length() > maxRadius) {
			position.setLength(maxRadius);
		}
	});
	
	var cameraControlDisabled = false;
	onRenderFcts.push(function (delta, now) {
		if (cameraControlDisabled) {
			return;
		}
		var object3d= player.character.root,
			vector = new THREE.Vector3(0, 1.2, -2),
			matrix = new THREE.Matrix4().makeRotationY(object3d.rotation.y);
		vector.applyMatrix4(matrix);
		var position = object3d.position.clone().add(vector);
		camera.position.copy(position);

		vector = new THREE.Vector3(0, 1.2, 3),
		matrix = new THREE.Matrix4().makeRotationY(object3d.rotation.y),
		vector.applyMatrix4(matrix);
		var target	= object3d.position.clone().add(vector);
		camera.lookAt(target);
	});
	
	document.body.addEventListener('keydown', function(e) {
		var input = player.controls.input;
		if( e.keyCode === 'W'.charCodeAt(0) )	input.up	= true;
		if( e.keyCode === 'S'.charCodeAt(0) )	input.down	= true;
		if( e.keyCode === 'Q'.charCodeAt(0) )	input.strafeLeft= true;
		if( e.keyCode === 'E'.charCodeAt(0) )	input.strafeRight= true;
		if( e.keyCode === 'A'.charCodeAt(0) && !e.shiftKey )	input.left	= true;
		if( e.keyCode === 'D'.charCodeAt(0) && !e.shiftKey )	input.right	= true;
		if( e.keyCode === 'A'.charCodeAt(0) &&  e.shiftKey )	input.strafeLeft= true;
		if( e.keyCode === 'D'.charCodeAt(0) &&  e.shiftKey )	input.strafeRight= true;

		if( e.keyCode === 38 )			input.up	= true;
		if( e.keyCode === 40 )			input.down	= true;
		if( e.keyCode === 37 && !e.shiftKey )	input.left	= true;
		if( e.keyCode === 39 && !e.shiftKey )	input.right	= true;
		if( e.keyCode === 37 &&  e.shiftKey )	input.strafeLeft= true;
		if( e.keyCode === 39 &&  e.shiftKey )	input.strafeRight= true;
	});
	
	document.body.addEventListener('keyup', function(e) {
		var input = player.controls.input;
		if( e.keyCode === 'W'.charCodeAt(0) )	input.up	= false;
		if( e.keyCode === 'S'.charCodeAt(0) )	input.down	= false;
		if( e.keyCode === 'Q'.charCodeAt(0) )	input.strafeLeft= false;
		if( e.keyCode === 'E'.charCodeAt(0) )	input.strafeRight= false;
		if( e.keyCode === 'A'.charCodeAt(0) && !e.shiftKey )	input.left	= false;
		if( e.keyCode === 'D'.charCodeAt(0) && !e.shiftKey )	input.right	= false;
		if( e.keyCode === 'A'.charCodeAt(0) &&  e.shiftKey )	input.strafeLeft= false;
		if( e.keyCode === 'D'.charCodeAt(0) &&  e.shiftKey )	input.strafeRight= false;

		if( e.keyCode === 38 )			input.up	= false;
		if( e.keyCode === 40 )			input.down	= false;
		if( e.keyCode === 37 && !e.shiftKey )	input.left	= false;
		if( e.keyCode === 39 && !e.shiftKey )	input.right	= false;
		if( e.keyCode === 37 &&  e.shiftKey )	input.strafeLeft= false;
		if( e.keyCode === 39 &&  e.shiftKey )	input.strafeRight= false;
	});
	
	
	
	var mixerContext = new THREEx.HtmlMixer.Context(renderer, scene, camera);
	onRenderFcts.push(function (delta, now) {
		mixerContext.update(delta, now);
	});
	
	window.addEventListener('resize', function(e) {
		mixerContext.rendererCSS.setSize(window.innerWidth, window.innerHeight);
	});
	
	var domEvents = new THREEx.DomEvents(camera, renderer.domElement),
		roomNames = [
			'nexoneu',
			'combatarms'
		],
		homeRoomName = 'nexoneu',
		roomName = location.hash.substr(1);
		
	if (roomNames.indexOf(roomName) === -1) {
		roomName = homeRoomName;
	}
	var roomScriptUrl = '/scripts/room/room-' + roomName + '.js';
	location.hash = '#' + roomName;
	
	var gotoRoom = function (roomName) {
		if (roomNames.indexOf(roomName) !== -1) {
			roomName = homeRoomName;
		}
		location.hash = '#' + roomName;
		location.reload(true);
	};
	window.gotoRoom = gotoRoom;
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', roomScriptUrl, true);
	xhr.onreadystatechange = function(e) {
		if (this.readyState == 4 && this.status == 200) {
			var jsCode = this.responseText;
			eval(jsCode);
		}
	};
	xhr.send();
	
	var addPage = function (options) {
		var position = options.position,
			mixerPlaneOpts = options.mixerPlaneOpts || {
				elementW: 1024	
			};
			
		if (options.url) {
			var domElement = document.createElement('iframe');
			domElement.src = options.url;
			domElement.style.border = 'none';
		} else if (options.domElement) {
			var domElement = options.domElement;
		} else {
			console.assert(false);
		}
		
		var mixerPlane = new THREEx.HtmlMixer.Plane(mixerContext, domElement, mixerPlaneOpts),
			object3d = mixerPlane.object3d;
		scene.add(object3d);
		onRenderFcts.push(function (delta, now) {
			mixerPlane.update(delta, now);
		});
		object3d.position.copy(position);
		object3d.scale.multiplyScalar(2);
		
		var target = player.character.root.position.clone();
		target.y = object3d.position.y;
		object3d.lookAt(target);
		
		return object3d;
	};
	
	onRenderFcts.push(function () {
		renderer.render(scene, camera);
	});
	
	var lastTimeMsec = null,
		animate = function(nowMsec) {
			lastTimeMsec = lastTimeMsec || nowMsec-1000/60;
			var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
			lastTimeMsec = nowMsec;
			onRenderFcts.forEach(function(fnc) {
				fnc(deltaMsec/1000, nowMsec/1000);
			});
			requestAnimationFrame(animate);
		};
	requestAnimationFrame(animate);
});