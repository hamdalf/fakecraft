require(
    [
        '/scripts/threex/threex.windowresize.js',
        '/scripts/threejs/tween.min.js',
        '/scripts/threejs/flow.js',
        '/scripts/threex/threex.animation.js',
        '/scripts/threex/threex.animations.js',
        '/scripts/threex/threex.minecraft.js',
        '/scripts/threex/threex.minecraftcharheadanim.js',
        '/scripts/threex/threex.minecraftcharbodyanim.js',
        '/scripts/threex/threex.minecraftcontrols.js',
        '/scripts/threex/threex.minecraftplayer.js',
        '/scripts/threex.volumetricspotlight/package.require.js',
        '/scripts/webaudiox/webaudiox.js'
    ], function () {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
            throw 'WebGL Not Available';
        }
        
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.01, 1000);
        camera.position.z = 3;
        camera.position.x = -0.5;
        camera.position.y = 1;
        camera.lookAt(new THREE.Vector3(-0.5,0,-2));
        
        var onRenderFcts = [];
        
        var winResize = new THREEx.WindowResize(renderer, camera);
        
        var ambientLight = new THREE.AmbientLight(0x020202);
        scene.add(ambientLight);
        var frontLight = new THREE.DirectionalLight('white', 0.4);
        frontLight.position.set(0.5, 0.5, 2);
        scene.add(frontLight);
        var backLight = new THREE.DirectionalLight('white', 2);
        backLight.position.set(-0.5, -0.5, -2);
        scene.add(backLight);
        
        var nRows = 3;
        var nColumns = 5;
        for (var z=0; z < nRows; z++) {
            for (var x=0; x < nColumns; x++) {
                (function() {
                    THREEx.MinecraftChar.defaultMaterial = THREE.MeshPhongMaterial;
                    
                    var character = new THREEx.MinecraftChar();
                    scene.add(character.root);
                    character.root.traverse(function(object3d) {
                        object3d.receiveShadow = true;
                        object3d.castChadow = true;
                    });
                    
                    character.root.position.z = -z*0.6 - 1;
                    character.root.position.x = (x-(nColumns/2))*0.9;
                    character.root.rotation.y = Math.random()*Math.PI*2;
                    
                    character.loadWellKnownSkinRandomly();
                    
                    var headAnims = new THREEx.MinecraftCharHeadAnimations(character);
                    //this.headAnims = headAnims;
                    onRenderFcts.push(function(delta, now) {
                        headAnims.update(delta, now);
                    });
                    var randAction = Math.round(Math.random() * 2);
                    switch (randAction) {
                        case 0:
                            headAnims.start('yes');
                            break;
                        case 1:
                            headAnims.start('no');
                            break;
                        case 2:
                            headAnims.start('still');
                            break;
                    }
                    
                    var bodyAnims = new THREEx.MinecraftCharBodyAnimations(character);
                    //this.bodyAnims = bodyAnims;
                    onRenderFcts.push(function(delta, now) {
                        bodyAnims.update(delta, now);
                    });
                    
                    randAction = Math.round(Math.random() * 2);
                    switch (randAction) {
                        case 0:
                            bodyAnims.start('strafe');
                            break;
                        case 1:
                            bodyAnims.start('wave');
                            break;
                        case 2:
                            bodyAnims.start('hiwave');
                            break;
                    }
                })();
            }
        }
        
        THREEx.MinecraftChar.defaultMaterial = THREE.MeshPhongMaterial;
        
        var player1 = new THREEx.MinecraftPlayer();
        player1.setNickname('Hamdalf');
        player1.controlsEnabled = false;
        scene.add(player1.character.root);
        player1.character.root.traverse(function(object3d) {
            object3d.receiveShadow = true;
            object3d.castShadow = true;
        });
        onRenderFcts.push(function(delta, now) {
            player1.update(delta, now);
        });
        
        var player2 = new THREEx.MinecraftPlayer();
        player2.setNickname('Batman');
        player1.controlsEnabled = false;
        player2.character.loadWellKnownSkin('batman');
        player2.character.root.position.x = -1;
        scene.add(player2.character.root);
        player2.character.root.traverse(function(object3d) {
            object3d.receiveShadow = true;
            object3d.castShadow = true;
        });
        onRenderFcts.push(function(delta, now) {
            player2.update(delta, now);
        });
        
        onRenderFcts.push(function() {
            TWEEN.update();
        });
        
        Flow().seq(
            function (next) {
                var object3d = player1.character.root;
                object3d.position.set(4,0,0);
                object3d.rotation.y = -Math.PI/2;
                player1.bodyAnims.start('walk');
                
                var tween = new TWEEN.Tween({x:4}).to({x:0}, 2000).onUpdate(function() {
                    object3d.position.x = this.x;
                }).onComplete(function() {
                    player1.bodyAnims.start('stand');
                    setTimeout(function() {
                        next();
                    }, 1000 * 1);
                }).start();
            }
        ).seq(
            function (next) {
                player1.clearSay();
                player1.setSay('Hello, My name is Hamdalf');
                setTimeout(function() {
                    player1.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                var object3d = player1.character.root;
                var tween = new TWEEN.Tween({y:-Math.PI/2}).to({y:0}, 2000).onUpdate(function() {
                    object3d.rotation.y = this.y;
                }).onComplete(function() {
                    setTimeout(function() {
                        next();
                    }, 1000 * 1);
                }).start();
            }
        ).seq(
            function (next) {
                player2.clearSay();
                player2.setSay('Hello, my name is Batman');
                setTimeout(function () {
                    player2.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player1.clearSay();
                player1.setSay('How are things ?')	;
                setTimeout(function () {
                    player1.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player2.clearSay();
                player2.setSay('Slow... And i lost Robin :(');
                setTimeout(function () {
                    player2.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player1.clearSay();
                player1.setSay('Hmm OK, have you seen women around ?')	;
                setTimeout(function () {
                    player1.clearSay();
                    next();
                }, 1000 * 3)
            }
        ).seq(
            function (next) {
                player2.clearSay();
                player2.setSay('No...')	;
                setTimeout(function () {
                    player2.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player2.clearSay();
                player2.setSay('I keep thinking about Robin')	;
                setTimeout(function () {
                    player2.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player2.clearSay();
                player2.setSay('And btw for women...');
                setTimeout(function () {
                    player2.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player2.clearSay();
                player2.setSay('I think you miss something...');
                setTimeout(function () {
                    player2.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player1.clearSay();
                player1.setSay('Hue ? What do you mean ?');
                setTimeout(function () {
                    player1.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player2.clearSay();
                player2.setSay('Well Look');
                setTimeout(function () {
                    player2.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                cameraControlsDisabled	= true;
                camera.position.set(1, 1, 0.5);
                camera.lookAt( new THREE.Vector3(0, 0, 0) );
                setTimeout(function() {
                    camera.position.z = 3;
                    cameraControlsDisabled	= false;
                    player2.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player2.clearSay();
                player2.setSay('... flat.');
                setTimeout(function() {
                    player2.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player1.clearSay();
                player1.setSay('oh...');
                setTimeout(function () {
                    player1.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                setTimeout(function () {
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player1.clearSay();
                player1.setSay('(embarrassing)');
                setTimeout(function () {
                    player1.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                setTimeout(function () {
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                player1.clearSay();
                player1.setSay('OK i gonna play video Games.');
                setTimeout(function () {
                    player1.clearSay();
                    next();
                }, 1000 * 3);
            }
        ).seq(
            function (next) {
                var object3d = player1.character.root;
                var tween = new TWEEN.Tween({ y: 0 }).to({ y: Math.PI/2 }, 2000 ).onUpdate(function(){
                        object3d.rotation.y = this.y;
                    }).onComplete(function () {
                        next();
                    }).start();
            }
        ).seq(
            function (next) {
                var object3d = player1.character.root;
                player1.bodyAnims.start('walk');
                var tween = new TWEEN.Tween({ x: 0 }).to({ x: 4 }, 2000 ).onUpdate(function () {
                        object3d.position.x	= this.x;
                    }).onComplete(function () {
                        player1.bodyAnims.start('stand');
                        setTimeout(function () {
                            next();
                        }, 1000 * 1);
                    }).start();
            }
        );
        
        // back wall
        var geometry = new THREE.BoxGeometry(40, 0.1, 20, 20, 1, 20);
        var material = new THREE.MeshPhongMaterial({
            color: new THREE.Color('gray')
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.rotateX(Math.PI/2);
        mesh.position.set(0, -geometry.parameters.height/2, -4);
        scene.add(mesh);
        
        // back wall's wire frame
        var material = new THREE.MeshBasicMaterial({
            wireframe: true,
            wireframeLinewidth: 2,
            color: new THREE.Color('black')
        });
        var mesh = new THREE.Mesh(geometry.clone(), material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.scale.multiplyScalar(1.01);
        mesh.rotateX(Math.PI/2);
        mesh.position.set(0, -geometry.parameters.height/2, -4);
        scene.add(mesh);
        
        // ground
        var geometry = new THREE.BoxGeometry(40, 0.1, 20, 20, 1, 20);
        var material = new THREE.MeshPhongMaterial({
            color: new THREE.Color('gray')
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.position.set(0, -geometry.parameters.height/2, -3);
        scene.add(mesh);
        
        // back wall's wire frame
        var material = new THREE.MeshBasicMaterial({
            wireframe: true,
            wireframeLinewidth: 2,
            color: new THREE.Color('black')
        });
        var mesh = new THREE.Mesh(geometry.clone(), material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.scale.multiplyScalar(1.01);
        mesh.position.set(0, -geometry.parameters.height/2, -3);
        scene.add(mesh);
        
        // spot light #1
        (function() {
            var geometry = new THREE.CylinderGeometry(0.1, 1.5, 5, 32*2, 20, true); 
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -geometry.parameters.height/2, 0));
            geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
            
            var material = new THREEx.VolumetricSpotLightMaterial();
            var mesh	= new THREE.Mesh( geometry, material );
            mesh.position.set(1.5,2,2);
            mesh.lookAt(new THREE.Vector3(0,0,0));
            material.uniforms.lightColor.value.set('red');
            material.uniforms.spotPosition.value	= mesh.position;
            scene.add( mesh );
            
            onRenderFcts.push(function (delta, now) {
                var angle	= 0.3 * Math.PI*2*now;
                var target	= new THREE.Vector3(1*Math.cos(angle),0,1*Math.sin(angle));
                mesh.lookAt(target);
                spotLight.target.position.copy(target);
            });
            
            var spotLight	= new THREE.SpotLight();
            spotLight.position	= mesh.position;
            spotLight.color		= mesh.material.uniforms.lightColor.value;
            spotLight.exponent	= 30;
            spotLight.angle		= Math.PI/3;
            spotLight.intensity	= 2;
            scene.add( spotLight );
            renderer.shadowMapEnabled	= true;
            
            var light	= spotLight;
            light.castShadow	= true;
            light.shadowCameraNear	= 0.01;
            light.shadowCameraFar	= 15;
            light.shadowCameraFov	= 90;
            
            light.shadowCameraLeft	= -8;
            light.shadowCameraRight	=  8;
            light.shadowCameraTop	=  8;
            light.shadowCameraBottom= -8;
            
            light.shadowBias	= 0.0;
            light.shadowDarkness	= 0.5;
            
            light.shadowMapWidth	= 1024;
            light.shadowMapHeight	= 1024;
        })();
        
        // spot light #2
        (function() {
            var geometry = new THREE.CylinderGeometry(0.1, 1.5, 5, 32*2, 20, true); 
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -geometry.parameters.height/2, 0));
            geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
            
            var material = new THREEx.VolumetricSpotLightMaterial();
            var mesh	= new THREE.Mesh( geometry, material );
            mesh.position.set(-1.5,2,2);
            mesh.lookAt(new THREE.Vector3(0,0,0));
            material.uniforms.lightColor.value.set('blue');
            material.uniforms.spotPosition.value	= mesh.position;
            scene.add( mesh );
            
            onRenderFcts.push(function (delta, now) {
                var angle	= 0.3 * Math.PI*2*now - Math.PI;
                var target	= new THREE.Vector3(1*Math.cos(angle),0,1*Math.sin(angle));
                mesh.lookAt(target);
                spotLight.target.position.copy(target);
            });
            
            var spotLight	= new THREE.SpotLight();
            spotLight.position	= mesh.position;
            spotLight.color		= mesh.material.uniforms.lightColor.value;
            spotLight.exponent	= 30;
            spotLight.angle		= Math.PI/3;
            spotLight.intensity	= 2;
            scene.add( spotLight );
            renderer.shadowMapEnabled	= true;
            
            var light	= spotLight;
            light.castShadow	= true;
            light.shadowCameraNear	= 0.01;
            light.shadowCameraFar	= 15;
            light.shadowCameraFov	= 90;
            
            light.shadowCameraLeft	= -8;
            light.shadowCameraRight	=  8;
            light.shadowCameraTop	=  8;
            light.shadowCameraBottom= -8;
            
            light.shadowBias	= 0.0;
            light.shadowDarkness	= 0.5;
            
            light.shadowMapWidth	= 1024;
            light.shadowMapHeight	= 1024;
        })();
        
        // Camera control
        var mouse	= {x : 0, y : 0};
        var cameraControlsDisabled	= false;
        document.addEventListener('mousemove', function(event){
            mouse.x	= (event.clientX / window.innerWidth ) - 0.5;
            mouse.y	= (event.clientY / window.innerHeight) - 0.5;
        }, false);
        onRenderFcts.push(function(delta, now) {
            if( cameraControlsDisabled === true )	return;
            camera.position.x += (mouse.x*2 - camera.position.x) * (delta*3);
            camera.position.y += (mouse.y*5 - camera.position.y) * (delta*3);
            camera.position.y	= Math.max(camera.position.y, 0.4);
            
            var target	= scene.position.clone();
            target.y	+= 1;
            camera.lookAt( target );
        });
        
        onRenderFcts.push(function() {
            renderer.render(scene, camera);
        });
        
        // Sound
        if (AudioContext) {
            var gameSounds	= new WebAudiox.GameSounds()
            gameSounds.lineOut.volume	= 0.2
            onRenderFcts.push(function(delta){
                gameSounds.update(delta)
            })
        
            var url	= '/scripts/webaudiox/sounds/rezoner-7DFPS-2013-2.mp3'
            gameSounds.createSound().load(url, function(sound) {
                sound.play({
                    loop	: true,
                    volume	: 1.0,
                })
            });
        }
        
        var lastTimeMsec = null;
        var animation = function(nowMsec) {
            lastTimeMsec = lastTimeMsec || nowMsec - 1000/60;
            var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
            lastTimeMsec = nowMsec;
            onRenderFcts.forEach(function(func) {
                func(deltaMsec/1000, nowMsec/1000);
            });
            requestAnimationFrame(animation);
        };
        requestAnimationFrame(animation);
	}
);