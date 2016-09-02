var TimerId, controls,
	fileName;

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
        bspByTypes = {},
        planeObj;

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
    var setGrid = function (pW, pH, bI) {
        if (planeObj) {
            scene.remove(planeObj);
        }

        var planeW = pW,
            planeH = pH,
			planeBG = (bI) ? '/images/indooreditor/' + bI : null,
            planeNumberW = 10,
            pleneNumberH = 10,
			planeMaterial;
		if (bI) {
			planeMaterial = new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture(planeBG),
				wireframe: true
			});
			planeMaterial.map.needsUpdate = true;
		} else {
			planeMaterial = new THREE.MeshBasicMaterial({
				color: 0x777777,
				wireframe: true
			});
		}
        planeObj = new THREE.Mesh(new THREE.PlaneGeometry(planeW * planeNumberW, planeH * pleneNumberH, planeW, planeH), planeMaterial);
		planeObj.overdraw = true;
        planeObj.rotation.x = -(Math.PI * 90 / 180);
        scene.add(planeObj);
    };

    setGrid(10, 10);
	
	var mouse2D = new THREE.Vector2(),
		raycaster = new THREE.Raycaster(),
		ambientLight = new THREE.AmbientLight(0x606060),
		directionalLight = new THREE.DirectionalLight(0xffffff);
	scene.add(ambientLight);
	directionalLight.position.set(1, 1, -1).normalize();
	scene.add(directionalLight);
	
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
		isAltDown = false;

    var onDocumentKeyDown = function (e) {
		switch (e.keyCode) {
			case 17:
				isCtrlDown = true;
				break;
			case 18:
				isAltDown = true;
				break;
			case 38:
				zoomInOut('in');
				break;
			case 40:
				zoomInOut('out');
				break;
		}	
	};
	
	var onDocumentKeyUp = function (e) {
		switch (e.keyCode) {
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
	
	var saveJSON = function (e) {
		e.preventDefault();
        e.stopPropagation();
		
		var children = scene.children,
			voxels = [],
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
			
			voxels.push({
				x: (child.position.x - 5) / 10,
				y: (child.position.y - 5) / 10,
				z: (child.position.z - 5) / 10,
				p: child.material._cubePattern,
				t: child.material._cubeType
			});
		}
		
		var dataUri = JSON.stringify(voxels);
		var xhr = new XMLHttpRequest();
        var fileName = encodeURIComponent(Date.now().valueOf());
		var params = 'filename=' + fileName + '&content=' + dataUri;
		xhr.open('POST', '/api/json2', true);
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		//xhr.setRequestHeader('content-length', params.length);
		//xhr.setRequestHeader('connection', 'close');
		xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
				//console.log(this.response.message);
				lastSavedFileName = fileName;
                alert('JSON \'' + fileName + '.json\' saved');
			}
		};
		xhr.send(params);
	};

	var saveButtons = document.querySelectorAll('.save a');
	saveButtons[0].addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();


    }, false);

	var loadFile = function() {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/file/indoor/' + fileName, true);
		xhr.responseType = 'text';
		xhr.onload = function (e) {
			if (this.status == 200) {
                loadJSON(this.responseText);
			}
		};
		xhr.send();
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
	
	var animate = function () {
		TimerId = requestAnimationFrame(animate);
		controls.update();
		render();
	};
	
	var render = function () {
		//var mouse3D = projector.unprojectVector(mouse2D.clone(), camera);
		//var mouse3D = mouse2D.clone();
		//mouse3D.unproject(camera);
		//ray.direction = mouse3D.subSelf(camera.position).normalize();
		//ray.direction = mouse3D.sub(camera.position).normalize();
		//var intersects = ray.intersectScene(scene);

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

    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == 'f') {
            fileName = pair[1];
            loadFile();
        }
    }
});
