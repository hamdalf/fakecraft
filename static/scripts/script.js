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

        var renderer = new THREE.WebGLRenderer({
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        var onRenderFcts = [];
        var winResize = new THREEx.WindowResize(renderer, camera);

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
        camera.position.z = 2;
        camera.position.y = -1;

        var ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);
        var frontLight = new THREE.DirectionalLight('white', 5);
        frontLight.position.set(0.5, 0.0, 2);
        scene.add(frontLight);
        var backLight = new THREE.DirectionalLight('white', 0.75*2);
        backLight.position.set(-0.5, -0.5, -2);
        scene.add(backLight);

        /*var container = new THREE.Object3D();
        container.position.x = 0;
        container.position.y = -0.5;
        scene.add(container);*/

        var player;

        onRenderFcts.push(function (delta, now) {
            if (player === undefined) {
                return;
            }
            player.update(delta, now);
        });

        player = new THREEx.MinecraftPlayer();
        scene.add(player.character.root);
        player.character.root.position.y = -0.5;
        player.controlsEnabled = false;
        
        var switchHeadValue	= function(value) {
            player.headAnims.start(value);
        };
        
        var switchBodyValue	= function(value) {
            player.bodyAnims.start(value);
        };

        onRenderFcts.push(function () {
            renderer.render(scene, camera);
        });

        var lastTimeMsec = null;
        var animate = function (nowMsec) {
                lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
                var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
                lastTimeMsec = nowMsec;
                onRenderFcts.forEach(function (onRenderFct) {
                    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
                });
                requestAnimationFrame(animate);
            };
        requestAnimationFrame(animate);
        
        document.querySelector('canvas').addEventListener('click', function() {
            player.character.loadWellKnownSkinRandomly();
        });
        
        var forEach = Array.prototype.forEach;
        forEach.call(document.querySelectorAll('.btn_head_anim'), function( el ){
            el.addEventListener('click', function(e) {
                switchHeadValue(this.innerText.toLowerCase());
            });
        });
        forEach.call(document.querySelectorAll('.btn_body_anim'), function( el ){
            el.addEventListener('click', function(e) {
                switchBodyValue(this.innerText.toLowerCase());
            });
        });

        var mouse = {x : 0, y : 0}
        document.addEventListener('mousemove', function(event) {
            mouse.x	= (event.clientX / window.innerWidth ) - 0.5;
            mouse.y	= (event.clientY / window.innerHeight) - 0.5;
        }, false);
        onRenderFcts.push(function(delta, now) {
            camera.position.x += (mouse.x*3.0 - camera.position.x) * (delta*3);
            camera.position.y -= (mouse.y*1.5 + camera.position.y) * (delta*3);
            camera.lookAt( scene.position );
            //camera.lookAt(player.character.root.position);
        });
    });