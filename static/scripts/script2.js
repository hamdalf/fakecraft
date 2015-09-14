require(
    [
        '/scripts/threex/threex.windowresize.js',
        '/scripts/threex/threex.animation.js',
        '/scripts/threex/threex.animations.js',
//        '/scripts/threex/threex.grassground.js',
//        '/scripts/threex/threex.terrain.js',
//        '/scripts/threex/threex.mountainsarena.js',
        '/scripts/threex/threex.daynight.js',
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
        camera.position.z = 3;
        //camera.position.y = 0.3;

        /*var ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);
        var frontLight = new THREE.DirectionalLight('white', 5);
        frontLight.position.set(0.5, 0.0, 2);
        scene.add(frontLight);
        var backLight = new THREE.DirectionalLight('white', 0.75*2);
        backLight.position.set(-0.5, -0.5, -2);
        scene.add(backLight);*/
        
        var sunAngle = -3/6*Math.PI*2;
        onRenderFcts.push(function(delta, now) {
            var dayDuration = 10;
            sunAngle += delta / dayDuration * Math.PI*2;
        });
        
        var starField = new THREEx.DayNight.StarField();
        scene.add(starField.object3d);
        onRenderFcts.push(function(delta, now) {
            starField.update(sunAngle);
        });
        
        var sunSphere = new THREEx.DayNight.SunSphere();
        scene.add(sunSphere.object3d);
        onRenderFcts.push(function(delta, now) {
            sunSphere.update(sunAngle);
        });
        
        var sunLight = new THREEx.DayNight.SunLight();
        scene.add(sunLight.object3d);
        onRenderFcts.push(function(delta, now) {
            sunLight.update(sunAngle);
        });
        
        var skydom = new THREEx.DayNight.Skydom();
        scene.add(skydom.object3d);
        onRenderFcts.push(function(delta, now) {
            skydom.update(sunAngle);
        });

        /*var container = new THREE.Object3D();
        container.position.x = 0;
        container.position.y = -0.5;
        scene.add(container);*/
        
        /*var groundMesh = new THREEx.GrassGround({
            width		: 10,
            height		: 10,
            repeatX		: 10,
            repeatY		: 10,
        });
        groundMesh.scale.multiplyScalar(10);
        scene.add(groundMesh);*/
        
        /*var heightMap = THREEx.Terrain.allocateHeightMap(128, 128);
        THREEx.Terrain.simplexHeightMap(heightMap);
        var geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
        THREEx.Terrain.heightMapToVertexColor(heightMap, geometry);
        var material = new THREE.MeshPhongMaterial({
            //shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        });
        var groundMesh = new THREE.Mesh(geometry, material);
        scene.add(groundMesh);
        groundMesh.rotateX(-Math.PI/2);
        groundMesh.scale.x = 20 * 10;
        groundMesh.scale.y = 20 * 10;
        groundMesh.scale.z = 1 * 10;
        //groundMesh.scale.multiplyScalar(10);*/
        
        /*var mountainMesh = new THREEx.MontainsArena();
        scene.add(mountainMesh);*/

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
        
        var switchHeadValue	= function(value) {
            player.headAnims.start(value);
        };
        
        var switchBodyValue	= function(value) {
            player.bodyAnims.start(value);
        };
        
        /*onRenderFcts.push(function (delta, now) {
            var position = player.character.root.position;
            position.y = THREEx.Terrain.planeToHeightMapCoords(heightMap, groundMesh, position.x, position.z);
        });*/
        
        /*player.character.root.add(camera);
        camera.position.z = -2;
        camera.position.y = 1;
        camera.lookAt(new THREE.Vector3(0,0.5,2));*/

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
            camera.position.x += (mouse.x*1.5 - camera.position.x) * (delta*3);
            camera.position.y += (mouse.y*0.3 - camera.position.y) * (delta*3);
            camera.lookAt( scene.position );
            //camera.lookAt(player.character.root.position);
        });
        /*
        document.body.addEventListener('keydown', function(e) {
            var input = player.controls.input;
            if( e.keyCode === 'W'.charCodeAt(0) )	input.up	= true;
            if( e.keyCode === 'S'.charCodeAt(0) )	input.down	= true;
            if( e.keyCode === 'A'.charCodeAt(0) )	input.left	= true;
            if( e.keyCode === 'D'.charCodeAt(0) )	input.right	= true;
        });
        document.body.addEventListener('keyup', function(e) {
            var input = player.controls.input;
            if( e.keyCode === 'W'.charCodeAt(0) )	input.up	= false;
            if( e.keyCode === 'S'.charCodeAt(0) )	input.down	= false;
            if( e.keyCode === 'A'.charCodeAt(0) )	input.left	= false;
            if( e.keyCode === 'D'.charCodeAt(0) )	input.right	= false;
        });*/
    });