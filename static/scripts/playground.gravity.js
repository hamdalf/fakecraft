var Playground	= Playground	|| {};

Playground.Gravity	= function()
{
	this._accelerator	= new vphy.LinearAccelerator({
		x	: 0, 
		y	: -9.8 * 250,
		z	: 0
	});		
	microPhysics.world().add(this._accelerator);	
}

Playground.Gravity.prototype.destroy	= function()
{
	microPhysics.world().remove(this._accelerator);
	this._accelerator	= null;
}