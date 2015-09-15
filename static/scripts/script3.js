require(
    [
        '/scripts/threex/threex.windowresize.js',
        '/scripts/threex/threex.animation.js',
        '/scripts/threex/threex.animations.js',
        '/scripts/threex/threex.minecraft.js',
        '/scripts/threex/threex.minecraftcharheadanim.js',
        '/scripts/threex/threex.minecraftcharbodyanim.js',
        '/scripts/threex/threex.minecraftcontrols.js',
        '/scripts/threex/threex.minecraftplayer.js'
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

                })();
            }
        }
        
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