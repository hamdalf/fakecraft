var Playground	= Playground	|| {};

Playground.OutterCube = function () {
	this._meshes	= [];
	
	var thickness	= 100;
	var size	= new THREE.Vector3(pageOptions.outterCube.width, pageOptions.outterCube.height, pageOptions.outterCube.depth)
	var restitution	= pageOptions.outterCube.restitution;
	var geometry	= new THREE.BoxGeometry(size.x, thickness, size.z, 10, 10, 10, [], true);
	//var material	= [new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ), new THREE.MeshNormalMaterial()];
	//var mesh	= new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(material));
	var material	= new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
	var mesh	= new THREE.Mesh(geometry, material);
	mesh.position.y	= -size.y/2;
	scene.add(mesh);
	this._meshes.push(mesh);
	microPhysics.bindMesh(mesh, {
		restitution	: restitution
	});

	var geometry	= new THREE.BoxGeometry(size.x,thickness,size.z, 10, 10, 10, [], true);
	//var material	= [new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ),new THREE.MeshNormalMaterial()];
	var material	= new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
	var mesh	= new THREE.Mesh(geometry, material);
	mesh.position.y	= +size.y/2;
	scene.add(mesh);
	this._meshes.push(mesh);
	microPhysics.bindMesh(mesh, {
		restitution	: restitution
	})

	var geometry	= new THREE.BoxGeometry(thickness, size.y, size.z, 10, 10, 10, [], true);
	//var material	= [new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ),new THREE.MeshNormalMaterial()];
	var material	= new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
	var mesh	= new THREE.Mesh(geometry, material);
	mesh.position.x	= +size.x/2;
	scene.add(mesh);
	this._meshes.push(mesh);
	microPhysics.bindMesh(mesh, {
		restitution	: restitution
	})

	var geometry	= new THREE.BoxGeometry(thickness,size.y,size.z, 10, 10, 10, [], true);
	//var material	= [new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ),new THREE.MeshNormalMaterial()];
	var material	= new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
	var mesh	= new THREE.Mesh(geometry, material);
	mesh.position.x	= -size.x/2;
	scene.add(mesh);
	this._meshes.push(mesh);
	microPhysics.bindMesh(mesh, {
		restitution	: restitution
	})

	var geometry	= new THREE.BoxGeometry(size.x,size.y,thickness, 10, 10, 10, [], true);
	//var material	= [new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ),new THREE.MeshNormalMaterial()];
	var material	= new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
	var mesh	= new THREE.Mesh(geometry, material);
	mesh.position.z	= +size.z/2;
	scene.add(mesh);
	this._meshes.push(mesh);
	microPhysics.bindMesh(mesh, {
		restitution	: restitution
	})

	var geometry	= new THREE.BoxGeometry(size.x, size.y, thickness, 10, 10, 10, [], true);
	//var material	= [new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } )];
	var material	= new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } );
	var mesh	= new THREE.Mesh(geometry, material);
	mesh.position.z	= -size.z/2;
	scene.add(mesh);
	this._meshes.push(mesh);
	microPhysics.bindMesh(mesh, {
		restitution	: restitution
	})
}

Playground.OutterCube.prototype.destroy	= function()
{
	this._meshes.forEach(function(mesh){
		scene.remove(mesh);
		microPhysics.unbindMesh(mesh);
	});
	this._meshes	= null;
}

