var Playground = Playground || {};

Playground.Player = function () {
	var radius = 300,
		restitution = pageOptions.player.resistration,
		material = new THREE.MeshLambertMaterial({color: 0xff0000}),
		geometry = new THREE.SphereGeometry(radius, 50, 25),
		mesh = new THREE.Mesh(geometry, material);
		
	scene.add(mesh);
	this._mesh = mesh;
	
	microPhysics.bindMesh(mesh, {
		resolution: restitution
	});
	microPhysics.body(mesh).events.on('contact', function(otherBody) {
		var material = mesh.material;
		material.color.setRGB(0, 0, 1);
	});
	
	// keyboard control
	this._keyboard		= new THREEx.KeyboardState();
	// TODO inerit from vphy base accelerator, this no type and no remove
	this._accelerator	= {
		type: vphy.types.ACCELERATOR,
		perform: function(){
			if( !player )	return;
			var acc		= 20*250;
			var body	= microPhysics.body(mesh);
			var keyboard	= this._keyboard;
			if( keyboard.pressed('right') )		body.accelerate(-acc,0,0);
			if( keyboard.pressed('left') )		body.accelerate(+acc,0,0);
			if( keyboard.pressed('shift') ){
				if( keyboard.pressed('up') )	body.accelerate(0, +acc, 0);
				if( keyboard.pressed('down'))	body.accelerate(0, -acc, 0);				
			}else{
				if( keyboard.pressed('up') )	body.accelerate(0,0,+acc);
				if( keyboard.pressed('down') )	body.accelerate(0,0,-acc);
			}
		}.bind(this),
		remove	: function(){
			this.to_remove	= true;
		}
	};
	microPhysics.world().add(this._accelerator);
};

Playground.Player.prototype.destroy	= function() {
	scene.remove(this._mesh);
	microPhysics.unbindMesh(this._mesh);
	this._mesh	= null;
	
	this._keyboard.destroy();
	this._keyboard	= null;
	
	microPhysics.world().remove(this._accelerator);
	this._accelerator	= null;
}

Playground.Player.prototype.config	= function()
{
	var body	= microPhysics.body(this._mesh);
	var restitution	= pageOptions.player.restitution;
// TODO restitution seems buggy
// - no reaction when i move the slider
// - where is the bug ?
	body.restitution= restitution; 
}

Playground.Player.prototype.update	= function()
{
	// set default material color
	/*if (!document.aa) {
		console.log(this._mesh);
		document.aa = true;
	}*/
	//var material = this._mesh.materials[0];
	var material = this._mesh.material;
	material.color.setRGB(0.5, 0.5, 0);
}