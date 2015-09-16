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
        '/scripts/threex.volumetricspotlight/package.require.js'
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
        camera.position.x = 0;
        camera.position.y = 3;
        camera.lookAt(new THREE.Vector3(0,0,-2));
        
        var onRenderFcts = [];
        
        var winResize = new THREEx.WindowResize(renderer, camera);
        
        var ambientLight = new THREE.AmbientLight(0x020202);
        scene.add(ambientLight);
        var frontLight = new THREE.DirectionalLight('white', 0.2);
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
        
        // back wall
        var geometry = new THREE.BoxGeometry(40, 0.1, 20, 20, 1, 20);
        var material = new THREE.MeshPhongMaterial({
            color: new THREE.Color('white')
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.rotateX(Math.PI/2);
        mesh.position.set(0, -geometry.parameters.height/2, -4);
        scene.add(mesh);
        
        // spot light
        (function() {
           var geometry = new THREE.CylinderGeometry(0.1, 1.5, 5, 32*2, 20, true); 
           geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -geometry.parameters.height/2, 0));
           geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
           
           var material = new THREEx.VolumetricSpotLightMaterial();
           
        });
        
        onRenderFcts.push(function() {
            renderer.render(scene, camera);
        });
        
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