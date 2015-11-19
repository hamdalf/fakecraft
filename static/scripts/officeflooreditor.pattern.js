var cubePattern = {
	floor: {
		0: {
			shading: THREE.FlatShading,
			map: THREE.ImageUtils.loadTexture('/images/officeeditor/floor_wood.jpg')
		},
		1: {
			shading: THREE.FlatShading,
			map: THREE.ImageUtils.loadTexture('/images/officeeditor/floor_wood2.jpg')
		},
		2: {
			shading: THREE.FlatShading,
			color: new THREE.Color().setRGB(0.5, 0.5, 0.5)
		}
	},
	wall: {
		0: {
			shading: THREE.FlatShading,
			color: new THREE.Color().setRGB(1, 1, 0.96)
		}
	}
};