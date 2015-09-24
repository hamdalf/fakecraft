(function () {
	var mixerPlane = addPage({
		url: 'http://www.nexoneu.com/',
		position: new THREE.Vector3(0, 2, 4)
	});
	mixerPlane.scale.multiplyScalar(2);
	
	mixerPlane = addPage({
		url: 'http://en.combatarms.nexoneu.com/',
		position: new THREE.Vector3(4, 2, 5)
	});
	mixerPlane.scale.multiplyScalar(2);
	
	mixerPlane = addPage({
		url: 'http://en.warrock.nexoneu.com/',
		position: new THREE.Vector3(-4, 2, 5)
	});
	mixerPlane.scale.multiplyScalar(2);
})();