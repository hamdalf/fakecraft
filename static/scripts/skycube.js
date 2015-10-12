document.addEventListener('DOMContentLoaded', function() {
	if (!Detector.webgl) {
		Detector.addGetWebGLMessage();
	}
	
	var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000),
		scene = new THREE.Scene();
	
	var urlPrefix = '/images/skycube/',
		urls = [
			urlPrefix + 'posx.jpg',
			urlPrefix + 'negx.jpg',
			urlPrefix + 'posy.jpg',
			urlPrefix + 'negy.jpg',
			urlPrefix + 'posz.jpg',
			urlPrefix + 'negz.jpg'
		],
		textureCube = THREE.ImageUtils.loadTextureCube(urls),
		shader = THREE.ShaderLib['cube'],
		uniforms = THREE.UniformsUtils.clone(shader.uniforms);	
	uniforms['tCube'].value = textureCube;
	
	var material = new THREE.ShaderMaterial({
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms,
			depthWrite: false,
			side: THREE.DoubleSide
		}),
		skyboxMesh = new THREE.Mesh(new THREE.BoxGeometry(100000, 100000, 100000, 1, 1, 1), material);
	scene.add(skyboxMesh);
	
	var container = document.createElement('div');
	document.body.appendChild(container);
	
	var renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);
	
	var stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0';
	container.appendChild(stats.domElement);
	
	
	
	var animate = function () {
		render();
		requestAnimationFrame(animate);
		stats.update();
	};
	
	var render = function () {
		var timer = - new Date().getTime() * 0.0002; 
		camera.position.x = 1000 * Math.cos( timer );
		camera.position.z = 1000 * Math.sin( timer );
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		
		//console.log(camera.position.x);
 
		renderer.render( scene, camera );
	};
	
	animate();
});