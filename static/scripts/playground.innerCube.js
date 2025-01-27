var Playground	= Playground	|| {};

Playground.InnerCube	= function()
{
	var size	= {
		x	: 4*200,
		y	: 4*200,
		z	: 4*200
	};
	var restitution	= pageOptions.innerCube.restitution;
	
	var geometry	= new THREE.CubeGeometry(size.x, size.y, size.z);
	/*var material	= [
		new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ),
		new THREE.MeshNormalMaterial()
	];*/
	var material	=  new THREE.MeshBasicMaterial( { color: 0x00aaff, wireframe: true } );
	var mesh	= new THREE.Mesh(geometry, material);
	mesh.position.x	= 200; 
	mesh.position.y	= -200 - size.y/2;
	scene.add(mesh);
	this._mesh	= mesh;

	microPhysics.bindMesh(mesh, {
		restitution	: restitution
	});
}

Playground.InnerCube.prototype.destroy	= function()
{
	scene.remove(this._mesh);
	microPhysics.unbindMesh(this._mesh);
	this._mesh	= null;
}
