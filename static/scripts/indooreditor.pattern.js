var cubePattern = {
	floor: {
		0: {
			shading: THREE.FlatShading,
			//map: THREE.ImageUtils.loadTexture('/images/officeeditor/floor_wood.jpg')
            color: new THREE.Color().setRGB(0.89, 0.71, 0.49)
		},
		1: {
			shading: THREE.FlatShading,
			//map: THREE.ImageUtils.loadTexture('/images/officeeditor/floor_wood2.jpg')
            color: new THREE.Color().setRGB(0.21, 0.15, 0.09)
		},
		2: {
			shading: THREE.FlatShading,
			color: new THREE.Color().setRGB(0.5, 0.5, 0.5)
		},
		3: {
			shading: THREE.FlatShading,
			color: new THREE.Color().setRGB(0.45, 0.7, 0.15)
		}
	},
	wall: {
		0: {
			shading: THREE.FlatShading,
			color: new THREE.Color().setRGB(1, 1, 0.96),
            opacity: 0.4,
            transparent: true
		},
        1: {
            shading: THREE.FlatShading,
			color: new THREE.Color().setRGB(0.3, 0.5, 0.89),
            opacity: 0.3,
			transparent: true
        },
        2: {
			shading: THREE.FlatShading,
			color: new THREE.Color().setRGB(0.96, 0.21, 0.04),
            opacity: 0.4,
            transparent: true
		},
        3: {
			shading: THREE.FlatShading,
			color: new THREE.Color().setRGB(0.8, 0.8, 0.8),
            opacity: 0.4,
            transparent: true
		}
	},
	path: {
		0: {
			shading: THREE.FlatShading,
			color: new THREE.Color().setRGB(0.99, 0.43, 0.51),
            opacity: 0.4,
            transparent: true
		}
	},
    desk: {
        0: {
            shading: THREE.FlatShading,
            //color: new THREE.Color().setRGB(0.98, 0.90, 0.81)
            color: new THREE.Color().setRGB(0.98, 0.98, 0.90)
			//wireframe: true
            //color: new THREE.Color().setRGB(0.89, 0, 0)
        }
    }
};