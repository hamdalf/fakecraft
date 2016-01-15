/* global = */
/* global ; */
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
        meshesByTypes = {},
        groups = {},
        mergedGeos = {};
        
    var addMesh = function (m) {
        if (typeof meshesByTypes[m.__p] === 'undefined') {
            meshesByTypes[m.__p] = {};
            meshesByTypes[m.__p][m.__t] = [];
        } else {
            if (typeof meshesByTypes[m.__p][m.__t] === 'undefined') {
                meshesByTypes[m.__p][m.__t] = [];
            }
        }
        
        meshesByTypes[m.__p][m.__t].push(m);
    };
        
    var setGroup = function (mgs) {
        for (var p in mgs) {
            groups[p] = {};
            for (var t in mgs[p]) {
                groups[p][t] = new THREE.Mesh(mgs[p][t], cubeMaterials[p][t]);
                groups[p][t].name = 'floorplan';
            }
        }

        //mgs[i].computeFaceNormals();
    };
    
    var setMergedGeo = function (ms) {
        var tempCounter, tempArray, triangles, tempGeometry, tempVector, tG,
            positions, normals, colors, uvs, faces,
            attrIndex, attrLocalIndex;
            //tempNormals;
        
        for (var p in ms) {
            for (var t in ms[p]) {
                if (typeof mergedGeos[p] === 'undefined') {
                    mergedGeos[p] = {};
                }
                
                if (typeof mergedGeos[p][t] === 'undefined') {
                    mergedGeos[p][t] = new THREE.BufferGeometry();
                }
                
                tempArray = ms[p][t];
                tempCounter = tempArray.length;
                triangles = 12 * tempCounter;   // 12 triangles per cube (6 quads)
                
                for (var i = 0; i < tempCounter; i++) {
                    
                    if (i === 0) {
                        mergedGeos[p][t].addAttribute('position', new THREE.BufferAttribute(new Float32Array(triangles * 3 * 3), 3).setDynamic( true ));
                        mergedGeos[p][t].addAttribute('normal', new THREE.BufferAttribute(new Float32Array(triangles * 3 * 3), 3).setDynamic( true ));
                        mergedGeos[p][t].addAttribute('color', new THREE.BufferAttribute(new Float32Array(triangles * 3 * 3), 3).setDynamic( true ));
                        mergedGeos[p][t].addAttribute('uv', new THREE.BufferAttribute(new Float32Array(triangles * 3 * 2), 2).setDynamic( true ));
                        //mergedGeos[p][t].faces = [];
                        mergedGeos[p][t].faces = new Float32Array(triangles);
                        //mergedGeos[p][t].dynamic = true;
                        //mergedGeos[p][t].attributes.position.needsUpdate = true;
                        // also same settings may be needed for each properties
                        // 
                        positions = mergedGeos[p][t].attributes.position.array;
                        normals = mergedGeos[p][t].attributes.normal.array;
                        colors = mergedGeos[p][t].attributes.color.array;
                        uvs = mergedGeos[p][t].attributes.uv.array;
                        mergedGeos[p][t].clearGroups();
                        faces = mergedGeos[p][t].faces;
                        //tempNormals = [];
                    }
                    
                    tempArray[i].updateMatrix();
                    tempArray[i].updateMatrixWorld();
                    tG = new THREE.BufferGeometry().fromGeometry(tempArray[i].geometry);
                    tempGeometry = tempArray[i].geometry.__directGeometry;
                    
                    
                    if (i === 0) {
                        console.log(tempArray[i]);
                        console.log(tG);
                    }
                    
                    attrIndex = i * 108;
                    for (var j = attrIndex; j < attrIndex + 107; j += 3) {
                        attrLocalIndex = Math.floor((j - (108 * i)) / 3);
                        tempVector = tempGeometry.vertices[attrLocalIndex].clone();
                        tempVector.applyMatrix4(tempArray[i].matrixWorld);
                        positions[j] = tempVector.x;
                        positions[j + 1] = tempVector.y;
                        positions[j + 2] = tempVector.z;
                        normals[j] = tempGeometry.normals[attrLocalIndex].x;
                        normals[j + 1] = tempGeometry.normals[attrLocalIndex].y;
                        normals[j + 2] = tempGeometry.normals[attrLocalIndex].z;
                        colors[j] = tempGeometry.colors[attrLocalIndex].r;
                        colors[j + 1] = tempGeometry.colors[attrLocalIndex].g;
                        colors[j + 2] = tempGeometry.colors[attrLocalIndex].b;
                        normals[j] = tempGeometry.normals[attrLocalIndex].x;
                        //tempNormals.push(new THREE.Vector3(normals[j], normals[j + 1], normals[j + 2]));
                    }
                    
                    attrIndex = i * 72;
                    for (var j = attrIndex; j < attrIndex + 72; j += 2) {
                        attrLocalIndex = Math.floor((j - (72 * i)) / 2);
                        uvs[j] = tG.attributes.uv.array[attrLocalIndex].x;
                        uvs[j + 1] = tG.attributes.uv.array[attrLocalIndex].y;
                    }
                    
                    attrIndex = i * 6 * 6;
                    for (var j = attrIndex; j < attrIndex + 36; j += 6) {
                        mergedGeos[p][t].addGroup(j, 6, 0); // one boxMaterial has 6 groups. material is only 1 (0)
                    }
                    
                    attrIndex = i * 12;
                    for (var j = attrIndex; j < attrIndex + 12; j += 3) {
                        //var a = j, b = j + 1, c = j + 2;
                        
                        //var vertexNormals = normals !== undefined ? [ tempNormals[ a ].clone(), tempNormals[ b ].clone(), tempNormals[ c ].clone() ] : [];
                        //var vertexColors = colors !== undefined ? [ scope.colors[ a ].clone(), scope.colors[ b ].clone(), scope.colors[ c ].clone() ] : [];

                        faces[j] = new THREE.Face3(j, j+1, j+2, [], []);

                        //if ( uvs !== undefined ) {

                            //scope.faceVertexUvs[ 0 ].push( [ tempUVs[ a ].clone(), tempUVs[ b ].clone(), tempUVs[ c ].clone() ] );

                        //}

                        //if ( uvs2 !== undefined ) {

                            //scope.faceVertexUvs[ 1 ].push( [ tempUVs2[ a ].clone(), tempUVs2[ b ].clone(), tempUVs2[ c ].clone() ] );

                        //}
                    }

                    // floor use same geometry 'box'. So, don't need merge geometry.
                    //tempGeometry = new THREE.BufferGeometry().fromGeometry(tempArray[i].geometry);
                    //mergedGeos[p][t].merge(tempGeometry);
                }

                mergedGeos[p][t].computeBoundingSphere();
                mergedGeos[p][t].computeBoundingBox();
                
                
                
                console.log(mergedGeos[p][t]);
            }
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
	
	var savePNG = function () {
		window.open(renderer.domElement.toDataURL('image/png'), 'pngwindow');	
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
		
		var dataUri = "data:application/json;charset=utf-8," + JSON.stringify(voxels);
		window.open(dataUri, 'jsonwindow');
	};
	
	var buttons = document.querySelectorAll('.iofunctions button');
	buttons[0].addEventListener('click', savePNG, false);
	buttons[1].addEventListener('click', saveJSON, false);
	
	var onDragOver = function (e) {
        console.log(e);
		e.preventDefault();
	};
	
	var onDrop = function (e) {
        console.log(e);
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
			voxel, mesh;
            
        numberOfFloorCubes = voxels.length;
		
		for (var i = 0; i < numberOfFloorCubes; i++) {
			voxel = voxels[i];
			if (voxel.p == 'wall') {
				for (var h = voxel.y; h < voxel.y + 20; h++) {
					mesh = new THREE.Mesh(cubeGeo, cubeMaterials[voxel.p][voxel.t]);
					mesh.position.x = voxel.x * 10 + 5;
					mesh.position.y = h * 10 + 5;
					mesh.position.z = voxel.z * 10 + 5;
                    mesh.matrixAutoUpdate = true;
			        //mesh.updateMatrix();
                    mesh.__p = voxel.p;
                    mesh.__t = voxel.t;
                    addMesh(mesh);
				}
			} else {
				mesh = new THREE.Mesh(cubeGeo, cubeMaterials[voxel.p][voxel.t]);
				mesh.position.x = voxel.x * 10 + 5;
				mesh.position.y = voxel.y * 10 + 5;
				mesh.position.z = voxel.z * 10 + 5;
                mesh.matrixAutoUpdate = true;
			    //mesh.updateMatrix();
                mesh.__p = voxel.p;
                mesh.__t = voxel.t;
                addMesh(mesh);
			}
		}

        setMergedGeo(meshesByTypes);
        setGroup(mergedGeos);
        console.log(groups);
        
        for (var p in groups) {
            for (var t in groups[p]) {
                scene.add(groups[p][t]);
            }
        }
	};
    
    var loadJSONMap = function (floor) {
        var fileName = encodeURIComponent('optimized_floor' + floor);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/json/' + fileName, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                createMap(this.response);
			}
		};
		xhr.send();
    };
    
    var createMap = function (json) {
         var children = scene.children.slice(0);
		
		for (var i = 0; i < children.length; i++) {
			if (children[i].name === 'map') {
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
        
        var geometries = json.d,
            numGeo = geometries.length;
        for (var i = 0; i < numGeo; i++) {
            console.log(geometries[i]);
        }
    };
    
	document.addEventListener('dragover', onDragOver, false);
	document.addEventListener('drop', onDrop, false);
    document.querySelector('dd.floor select').addEventListener('change', function(e) {
        var options = e.target.children;
        for (var i = 0; i < options.length; i++) {
            if (options[i].selected === true) {
                loadJSONMap(options[i].value);
            }
        }
    }, false);
	
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
    var floorOptions = document.querySelector('dd.floor select').options;
    for (var i = 0; i < floorOptions.length; i++) {
        if (floorOptions[i].selected === true) {
            loadJSONMap(floorOptions[i].value);
            break;
        }
    }
});