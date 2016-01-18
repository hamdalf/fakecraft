var TimerId, controls;

document.addEventListener('DOMContentLoaded', function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
	
	var voxelPosition = new THREE.Vector3(),
		cbPattern, cbType,
		cbTexture = {},
		zoomFactor = 1,
		zoomIncFactor = 0.01,
        numberOfFloorCubes = 0,
        bspByTypes = {};

    var setBsp = function (p, t, bsp) {
        if (typeof bspByTypes[p] === 'undefined') {
            bspByTypes[p] = {};
            bspByTypes[p][t] = null;
        } else {
            if (typeof bspByTypes[p][t] === 'undefined') {
                bspByTypes[p][t] = null;
            }
        }
        
        if (bsp) {
            bspByTypes[p][t] = bsp;
        }
    };
    
    var getBsp = function (p, t) {
        setBsp(p, t);
        return bspByTypes[p][t];
    };
    
    var mergeMeshe = function (mesh, p, t) {
        var bsp = new ThreeBSP(mesh),
            targetBsp = getBsp(p, t),
            mergedBsp;
        
        if (targetBsp === null) {
            setBsp(p, t, bsp);
        } else {
            mergedBsp = targetBsp.union(bsp);
            setBsp(p, t, mergedBsp);
        }
    };
		
	var setCubeType = function (cPattern, cType) {
		//document.querySelector('.boxcolor').style.backgroundColor = '#' + cubeColors[cType].getHexString();
		//rollOverMesh.material.color = cubeColors[cType];
		cbPattern = cPattern;
		cbType = cType;
		var selectedTexture = cubePattern[cPattern][cType],
			newTexture = {};
		for (var k in rollOverTexture) {
			newTexture[k] = rollOverTexture[k];
		}
		
		for (var k in selectedTexture) {
			newTexture[k] = selectedTexture[k];
			cbTexture[k] = selectedTexture[k];
		}

		var rollOverMaterial = new THREE.MeshPhongMaterial(newTexture);
		if (!rollOverMesh) {
			rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
		} else {
			rollOverMesh.material = rollOverMaterial;
		}
	};
	
	// roll-over helper
	var rollOverGeo = new THREE.BoxGeometry(10, 10, 10),
		rollOverTexture = {
			opacity: 0.6,
			transparent: true
		},
		rollOverMesh;
		
	setCubeType('floor', 0);
	
	var container = document.querySelector('#container'),
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true
		});
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);
	
	var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 50, 1e7);
	camera.position.x = 500;
	camera.position.y = 800;
	camera.position.z = 800;
	camera.lookAt(new THREE.Vector3(0, 200, 0));
	
	controls = new THREE.TrackballControls(camera, renderer.domElement);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 3.6;
	controls.panSpeed = 2;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [65, 83, 68];	// a:rotate, s:zoom, d:pan
	
	THREEx.WindowResize(renderer, camera);
	
	var scene = new THREE.Scene();
	scene.add(rollOverMesh);
	
	// cubes
	var cubeGeo = new THREE.BoxGeometry(10, 10, 10),
		cubeMaterials = {},
		tempCube, newTexture;
	for (var k in cubePattern) {
		if (!cubeMaterials[k]) {
			cubeMaterials[k] = {};
		}
		for (var l in cubePattern[k]) {
			newTexture = {
				shading: THREE.FlatShading
			};
			for (var m in cubePattern[k][l]) {
				newTexture[m] = cubePattern[k][l][m];
			}
			tempCube = new THREE.MeshPhongMaterial(newTexture);
			tempCube._cubePattern = k;
			tempCube._cubeType = l;
			cubeMaterials[k][l] = tempCube;
		}
	}
	
	// picking
	var projector = new THREE.Projector();
	
	// grid
	var planeW = 530,
		planeH = 200,
		planeNumberW = 10,
		pleneNumberH = 10,
		plane = new THREE.Mesh(new THREE.PlaneGeometry(planeW * planeNumberW, planeH * pleneNumberH, planeW, planeH), new THREE.MeshBasicMaterial({
			color: 0x777777,
			wireframe: true
		}));
	plane.rotation.x = -(Math.PI * 90 / 180);
	scene.add(plane);
	
	var mouse2D = new THREE.Vector2(),
		raycaster = new THREE.Raycaster(),
		ambientLight = new THREE.AmbientLight(0xa0a0a0),
		directionalLight = new THREE.DirectionalLight(0xffffff);
        //hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
	scene.add(ambientLight);
	directionalLight.position.set(1, 1, -1).normalize();
	scene.add(directionalLight);
    //hemiLight.color.setHSL(0.6, 1, 0.6);
    //hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    //hemiLight.position.set(0, 500, 0);
    //scene.add(hemiLight);
	
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '5px';
	stats.domElement.style.right = '5px';
	container.appendChild(stats.domElement);

	var onDocumentMouseMove = function (e) {
		mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
		mouse2D.y = - (e.clientY / window.innerHeight) * 2 + 1;
	};

	var translateCubes = function (dx, dy, dz) {
		var children = scene.children,
			child;
			
		for (var i = 0; i < children.length; i++) {
			child = children[i];
			if (child instanceof THREE.Mesh === false) {
				continue;
			}
			if (child.geometry instanceof THREE.BoxGeometry === false) {
				continue;
			}
			if (child === rollOverMesh) {
				continue;
			}
			child.position.x += dx * 10;
			child.position.y += dy * 10;
			child.position.z += dz * 10;
			
			child.updateMatrix();
		}
	};
	
	var isCtrlDown = false,
		isAltDown = false,
		isADown = false,
		isSDown = false,
		isDDown = false;
		
	var onDocumentKeyDown = function (e) {
		switch (e.keyCode) {
			case '0'.charCodeAt(0):
				setCubeType('floor', 0);
				break;
			case '1'.charCodeAt(0):
				setCubeType('floor', 1);
				break;
			case '2'.charCodeAt(0):
				setCubeType('floor', 2);
				break;
			case '3'.charCodeAt(0):
				setCubeType('wall', 0);
				break;
			case 'A'.charCodeAt(0):
				isADown = true;
				break;
			case 'S'.charCodeAt(0):
				isSDown = true;
				break;
			case 'D'.charCodeAt(0):
				isDDown = true;
				break;
			case 'I'.charCodeAt(0):
				translateCubes(0, +1, 0);
				break;
			case 'K'.charCodeAt(0):
				translateCubes(0, -1, 0);
				break;
			case 17:
				isCtrlDown = true;
				break;
			case 18:
				isAltDown = true;
				break;
			case 38:
				zoomInOut('in');
				//controls.position0.setZ(controls.position0.z - 100);
				//controls.reset();
				break;
			case 40:
				zoomInOut('out');
				//controls.position0.setZ(controls.position0.z + 100);
				//controls.reset();
				break;
		}	
	};
	
	var onDocumentKeyUp = function (e) {
		switch (e.keyCode) {
			case 'A'.charCodeAt(0):
				isADown = false;
				break;
			case 'S'.charCodeAt(0):
				isSDown = false;
				break;
			case 'D'.charCodeAt(0):
				isDDown = false;
				break;
			case 17:
				isCtrlDown = false;
				break;
			case 18:
				isAltDown = false;
				break;
		}	
	};
	
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('keydown', onDocumentKeyDown, false);
	document.addEventListener('keyup', onDocumentKeyUp, false);

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
		voxelPosition.x = Math.floor(voxelPosition.x / 10) * 10 + 5;
		voxelPosition.y = Math.floor(voxelPosition.y / 10) * 10 + 5;
		voxelPosition.z = Math.floor(voxelPosition.z / 10) * 10 + 5;
	};
	
	var lastPutDelTime = Date.now();
	var putDelVoxel = function () {
		if (isCtrlDown === false && isAltDown === false) {
			return;
		}
		
		if (Date.now() - lastPutDelTime < 500) {
			return;
		} else {
			lastPutDelTime = Date.now();
		}
		
		var intersects = raycaster.intersectObjects(scene.children);
		
		if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);
			
			if (isAltDown) {
				if (intersector.object != plane) {
					scene.remove(intersector.object);
				}
			} else if (isCtrlDown) {
				setVoxelPosition(intersector);
				
				var voxel = new THREE.Mesh(cubeGeo, cubeMaterials[cbPattern][cbType]);
				voxel.position.copy(voxelPosition);
				voxel.matrixAutoUpdate = false;
				voxel.updateMatrix();
				scene.add(voxel);
			}
		}
	};
	
	var zoomInOut = function (inout) {
			//intersects = raycaster.intersectObjects(scene.children);
		/*if (intersects.length > 0) {
			var intersector = getRealIntersector(intersects);
			//var center = intersector.center;
			setVoxelPosition(intersector);
			var distance = voxelPosition.distanceTo(camera.position);
		}*/
		
		switch (inout) {
			case 'in':
				zoomFactor = (zoomFactor > 1) ? 1 : zoomFactor;
				zoomFactor = zoomFactor - zoomIncFactor;
				zoomFactor = (zoomFactor <= 0.2) ? 0.2 : zoomFactor;
				break;
			case 'out':
				zoomFactor = (zoomFactor < 1) ? 1 : zoomFactor;
				zoomFactor = zoomFactor + zoomIncFactor;
				zoomFactor = (zoomFactor >= 2) ? 1 : zoomFactor;
				break;
		}
		
		//console.log(zoomFactor);
		//camera.fov = fov;
		camera.fov *= zoomFactor;
		camera.updateProjectionMatrix();
		//console.log(distance);
	};
	
	var printPNG = function () {
		window.open(renderer.domElement.toDataURL('image/png'), 'pngwindow');	
	};
	
	var printJSON = function () {
		var children = scene.children,
			voxels = [],
			child;

		for (var i = 0; i < children.length; i++) {
			child = children[i];
			if (child instanceof THREE.Mesh === false) {
				continue;
			}
			/*if (child.geometry instanceof THREE.BoxGeometry === false) {
				continue;
			}*/
			if (child === rollOverMesh) {
				continue;
			}
            if (child.name !== 'map') {
                continue;
            }
			
			voxels.push({
				p: child.material._cubePattern,
				t: child.material._cubeType,
                g: child.geometry.toJSON()
			});
		}
		
		var dataUri = "data:application/json;charset=utf-8," + JSON.stringify(voxels);
		window.open(dataUri, 'jsonwindow');
	};
    
    var saveJSON = function () {
		var children = scene.children,
			voxels = [],
			child;

		for (var i = 0; i < children.length; i++) {
			child = children[i];
			if (child instanceof THREE.Mesh === false) {
				continue;
			}
			/*if (child.geometry instanceof THREE.BoxGeometry === false) {
				continue;
			}*/
			if (child === rollOverMesh) {
				continue;
			}
            if (child.name !== 'map') {
                continue;
            }
			
			voxels.push({
				p: child.material._cubePattern,
				t: child.material._cubeType,
                x: child.position.x,
				y: child.position.y,
				z: child.position.z,
                g: child.geometry.toJSON()
			});
		}
		
		var dataUri = JSON.stringify(voxels);
		var xhr = new XMLHttpRequest();
        var fileName = encodeURIComponent('optimized_' + Date.now().valueOf());
		var params = 'filename=' + fileName + '&content=' + dataUri;
		xhr.open('POST', '/api/json', true);
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		//xhr.setRequestHeader('content-length', params.length);
		//xhr.setRequestHeader('connection', 'close');
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
				//console.log(this.response.message);
                alert('JSON \'' + fileName + '.json\' saved');
			}
		};
		xhr.send(params);
	};
	
	var buttons = document.querySelectorAll('.iofunctions button');
	buttons[0].addEventListener('click', printPNG, false);
	buttons[1].addEventListener('click', printJSON, false);
    buttons[2].addEventListener('click', saveJSON, false);
    
	
	var onDragOver = function (e) {
		e.preventDefault()
	};
	
	var onDrop = function (e) {
		event.preventDefault();
		var file, reader;
		
		for (var i = 0; i < e.dataTransfer.files.length; i++) {
			file = e.dataTransfer.files[i];
			reader = new FileReader();
			reader.onload = function (e) {
				var dataUri = e.target.result,
					base64 = dataUri.match(/[^,]*,(.*)/)[1],
					json = window.atob(base64);
				loadJSON(json);
			};
			reader.readAsDataURL(file);
		}
	};
    
    var checkVoxDiffer = function(vox1, vox2) {
        var dX = vox2.x - vox1.x,
            dY = vox2.y - vox1.y,
            dZ = vox2.z - vox1.z,
            score = Math.abs(dX) + Math.abs(dY) + Math.abs(dZ);

        return {
            'dX': dX,
            'dY': dY,
            'dZ': dZ,
            'score': score
        };
    };
	
	var loadJSON = function (mapJSON) {
		var children = scene.children.slice(0);
		
		for (var i = 0; i < children.length; i++) {
			if (children[i].name === 'floorplan') {
				scene.remove(children[i]);
				continue;
			}
			if (children[i] instanceof THREE.Mesh === false) {
				continue;
			}
			if (children[i].geometry instanceof THREE.BoxGeometry === false) {
				continue;
			}
			if (children[i] === rollOverMesh) {
				continue;
			}
			
			scene.remove(children[i]);
		}
		
		var voxels = JSON.parse(mapJSON),
            numberOfFloorCubes = voxels.length,
            structuredVoxels = {},
            scaleFactor = 10,
			voxel, box, mesh, dObj;

        // group by height(y) include column(x) include row(z)
        for (var i = 0; i < numberOfFloorCubes; i++) {
            voxel = voxels[i];
            
            if (typeof structuredVoxels[voxel.p] === 'undefined') {
                structuredVoxels[voxel.p] = {};
            }
            
            /*if (typeof structuredVoxels[voxel.p][voxel.t] === 'undefined') {
                structuredVoxels[voxel.p][voxel.t] = [];
            }
            
            structuredVoxels[voxel.p][voxel.t].push(voxel);*/
            
            if (typeof structuredVoxels[voxel.p][voxel.t] === 'undefined') {
                structuredVoxels[voxel.p][voxel.t] = {};
            }
            
            if (typeof structuredVoxels[voxel.p][voxel.t][voxel.y] === 'undefined') {
                structuredVoxels[voxel.p][voxel.t][voxel.y] = {};
            }
            
            if (typeof structuredVoxels[voxel.p][voxel.t][voxel.y][voxel.x] === 'undefined') {
                structuredVoxels[voxel.p][voxel.t][voxel.y][voxel.x] = [];
            }

            structuredVoxels[voxel.p][voxel.t][voxel.y][voxel.x].push(voxel);
        }
        
        voxels = [];
        for (var p in structuredVoxels) {
            for (var t in structuredVoxels[p]) {
                for (var y in structuredVoxels[p][t]) {
                    for (var x in structuredVoxels[p][t][y]) {
                        structuredVoxels[p][t][y][x].sort(function (a, b) {
                            if (a.z < b.z) {
                                return -1;
                            } else if (a.z > b.z) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        voxels = voxels.concat(structuredVoxels[p][t][y][x]);
                    }
                }
            }
        }
        
        var rawBoxStructure = function () {
            return {
                size: {
                    x: 10,
                    y: 10,
                    z: 10
                },
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            }
        };
        
		for (var i = 0; i < numberOfFloorCubes; i++) {
            voxel = voxels[i];
            
            if (i === 0) {
                box = rawBoxStructure();
                box.position.x = voxel.x * scaleFactor + (scaleFactor / 2);
                box.position.y = voxel.y * scaleFactor + (scaleFactor / 2);
                box.position.z = voxel.z * scaleFactor + (scaleFactor / 2);
                box.__p = voxel.p;
                box.__t = voxel.t;
                continue;
            }
            
            dObj = checkVoxDiffer(voxels[i - 1], voxel);
            
            if (box.__p === voxel.p && box.__t === voxel.t && dObj.score === 1 && Math.abs(dObj.dZ) === 1) {
                /*if (dObj.dX !== 0) {
                    mesh.scale.x += Math.abs(dObj.dX);
                    mesh.position.x += dObj.dX * scaleFactor;
                }
                if (dObj.dY !== 0) {
                    mesh.scale.y += Math.abs(dObj.dY);
                    mesh.position.y += dObj.dY * scaleFactor;
                }*/
                if (dObj.dZ !== 0) {
                    box.size.z += Math.abs(dObj.dZ) * scaleFactor;
                    box.position.z += (dObj.dZ * scaleFactor) / 2;
                }
            } else {
                if (box.__p === 'wall') {
                    box.size.y = 200;
                    box.position.y = 110;
                }
                
                //if (box.__p === 'floor') {
                //    mesh = new THREE.Mesh(new THREE.BoxGeometry(box.size.x, box.size.y, box.size.z, 1, 1, Math.floor(box.size.z / 10)));
                //} else {
                    mesh = new THREE.Mesh(new THREE.BoxGeometry(box.size.x, box.size.y, box.size.z));
                //}
                
                mesh.position.x = box.position.x;
                mesh.position.y = box.position.y;
                mesh.position.z = box.position.z;
                mesh.__p = box.__p;
                mesh.__t = box.__t;
                
                mergeMeshe(mesh, mesh.__p, mesh.__t);
                
                box = rawBoxStructure();
                box.position.x = voxel.x * scaleFactor + (scaleFactor / 2);
                box.position.y = voxel.y * scaleFactor + (scaleFactor / 2);
                box.position.z = voxel.z * scaleFactor + (scaleFactor / 2);
                box.__p = voxel.p;
                box.__t = voxel.t;
            }
		}

        for (var p in bspByTypes) {
            for (var t in bspByTypes[p]) {
                var tempMesh = getBsp(p, t).toMesh(cubeMaterials[p][t]);
                /*if (tempMesh.material.map) {
                    tempMesh.material.map.wrapS = THREE.RepeatWrapping;
                    tempMesh.material.map.wrapT = THREE.RepeatWrapping;
                    tempMesh.material.map.repeat.x = 1;
                    //tempMesh.material.map.repeat.y = tempMesh.geometry.parameters.depth / 10;
                }*/
                tempMesh.name = 'map';
                //tempMesh.material.map.needsUpdate = true;
                scene.add(tempMesh);
            }
        }
	};
    
	document.addEventListener('dragover', onDragOver, false);
	document.addEventListener('drop', onDrop, false);
	
	var animate = function () {
		TimerId = requestAnimationFrame(animate);
		controls.update();
		render();
		stats.update();
	};
	
	var render = function () {
		putDelVoxel();
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