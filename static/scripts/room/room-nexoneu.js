(function () {
	var mixerPlane = addPage({
		url: 'http://en.combatarms.nexoneu.com/',
		position: new THREE.Vector3(4, 2, 2)
	});
	mixerPlane.scale.multiplyScalar(2);
	
	/*mixerPlane = addPage({
		url: 'http://en.warrock.nexoneu.com/',
		position: new THREE.Vector3(-4, 2, 2)
	});
	mixerPlane.scale.multiplyScalar(2);*/
	
	var tvSet = new THREEx.TvSet();
	tvSet.object3d.position.set(0, 0, -3);
	tvSet.object3d.scale.multiplyScalar(5);
	scene.add(tvSet.object3d);
	
	// create the iframe element
	var domElement	= document.createElement('iframe');
	domElement.src	= 'http://www.nexoneu.com/';
	domElement.style.border	= 'none';
	// create the plane
	var mixerPlane	= new THREEx.HtmlMixer.Plane(mixerContext, domElement, {
		planeW	: 1/2.2,
		planeH	: 1/2.85
	});
	
	onRenderFcts.push(function(delta, now) {
		mixerPlane.update(delta, now);
	});
	tvSet.setScreenPlane(mixerPlane.object3d);
	
	var state = 'walking';
	onRenderFcts.push(function(delta, now) {
		var distanceTo = player.character.root.position.distanceTo(tvSet.object3d.position);
		if (state === 'walking' && distanceTo < 4) {
			gotoWatching();
		}
	});
	
	var gotoWatching = function () {
		state = 'watching';
		cameraControlDisabled = true;
		camera.position.copy(tvSet.object3d.position);
		camera.position.add(new THREE.Vector3(0, 0.31, 0.6).multiply(tvSet.object3d.scale));
		camera.lookAt(new THREE.Vector3(0, camera.position.y, 1));
		
		document.querySelector('#homeOsd').classList.toggle('visible');
		document.querySelector('#exitOsd').classList.toggle('visible');
	};
})();