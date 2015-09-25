﻿var THREEx = THREEx || {};

THREEx.MinecraftPlayer = function () {
    var updateFcts = [];
    this.update = function (delta, now) {
        updateFcts.forEach(function (updateFct) {
            updateFct(delta, now);
        });
    }.bind(this);

    var character = new THREEx.MinecraftChar();
    this.character = character;
    
    var headAnims	= new THREEx.MinecraftCharHeadAnimations(character);
    this.headAnims = headAnims;
    updateFcts.push(function(delta, now) {
        headAnims.update(delta, now);
    });
    
    var bodyAnims	= new THREEx.MinecraftCharBodyAnimations(character);
    this.bodyAnims = bodyAnims;
    updateFcts.push(function(delta, now) {
        bodyAnims.update(delta, now);
    });
    
    /*
    var previousPos	= new THREE.Vector3();
	updateFcts.push(function (delta, now) {
		var object3d	= character.root;
		var velocity	= object3d.position.clone().sub(previousPos);
		if ( velocity.length() ){
			bodyAnims.start('run');
		} else {
			bodyAnims.start('stand');
	 	}
		// update player.previousPos/player.prevRotation
		previousPos.copy( object3d.position );
	});
    */
	
	var controlsEnabled = true;
	this.controlsEnabled = controlsEnabled;
	
	updateFcts.push(function (delta, now) {
		//console.log(controlsEnabled);
		if (this.controlsEnabled) {
			var input = controls.input;
			if (input.up || input.down) {
				bodyAnims.start('run');
			} else if (input.strafeLeft || input.strafeRight) {
				bodyAnims.start('strafe');
			} else {
				bodyAnims.start('stand');
			}
		}
	}.bind(this));

    var controls	= new THREEx.MinecraftControls(character.root);
	this.controls	= controls;
	updateFcts.push(function(delta, now){
		controls.update(delta, now);
	});
    
    this._nicknameObject3D	= null;
	this.clearNickName	= function() {
		if( this._nicknameObject3D === null )	return;
		character.root.remove(this._nicknameObject3D)
		this._nicknameObject3D	= null;
	};
	this.setNickname= function(nickName) {
		if( this._nicknameObject3D ) this.clearNickName();
		// build the texture
		var canvas	= THREEx.MinecraftPlayer._buildNickCartouche(nickName);
		var texture	= new THREE.Texture(canvas);
		texture.needsUpdate	= true;
		// build the sprite itself
		var material	= new THREE.SpriteMaterial({
			map			: texture,
			useScreenCoordinates	: false
		});
		var sprite		= new THREE.Sprite( material );
		this._nicknameObject3D	= sprite;
		sprite.position.y	= 1.15;
		// add sprite to the character
		character.root.add(this._nicknameObject3D);
	};
    
    this._sayObject3D	= null;
	this._sayBirthDate	= null;
	this.sayTimeout		= 10.0;
	updateFcts.push(function(delta, now) {
		// if there is no say at the moment, do nothing
		if( this._sayBirthDate === null )	return;
		// if the say sprite isnt old enougth to timeout, do nothing
		var sayAge	= (Date.now() - this._sayBirthDate)/1000.0;
		if( sayAge < this.sayTimeout )		return;
		// remove the say sprite
		this.clearSay();
	}.bind(this));
	this.clearSay	= function() {
		if( this._sayObject3D === null )	return;
		character.root.remove(this._sayObject3D);
		this._sayObject3D	= null;
		this._sayBirthDate	= null;
	};
	this.setSay	= function(nickName) {
		if( this._sayObject3D )	this.clearSay();
		// update for timer
		this._sayBirthDate	= Date.now();
		// build the texture
		var canvas	= THREEx.MinecraftPlayer._buildChatBubble(nickName);
		var texture	= new THREE.Texture(canvas);
		texture.needsUpdate	= true;
		// build the sprite itself
		var material	= new THREE.SpriteMaterial({
			map			: texture,
			useScreenCoordinates	: false
		});
		var sprite		= new THREE.Sprite( material );
		this._sayObject3D	= sprite;
		sprite.scale.multiplyScalar(4);
		sprite.position.y	= 1.5;
		// add sprite to the character
		character.root.add(this._sayObject3D);
	};
};

THREEx.MinecraftPlayer._buildChatBubble = function(text) {
	// create the canvas
	var canvas	= document.createElement("canvas");
	var context	= canvas.getContext("2d");
	canvas.width	= 1024;
	canvas.height	= 512;
	// center the origin
	context.translate( canvas.width/2, canvas.height/2 );
	// measure text
	var fontSize	= 24;
	context.font	= "bolder "+fontSize+"px Verdana";
	var fontH	= fontSize;
	var fontW	= context.measureText(text).width;
	// build the background
	context.fillStyle = "rgba(255,255,255,0.3)";
	var scale	= 1.2;
	context.fillRect(-fontW*scale/2,-fontH*scale/1.3,fontW*scale,fontH*scale)
	// display the text
	context.fillStyle = "rgba(0,0,0,0.7)";
	context.fillText(text, -fontW/2, 0);
	// return the canvas element
	return canvas;
};

THREEx.MinecraftPlayer._buildNickCartouche = function(text){
	// create the canvas
	var canvas	= document.createElement("canvas");
	var context	= canvas.getContext("2d");
	canvas.width	= 256;
	canvas.height	= 128;
	// center the origin
	context.translate( canvas.width/2, canvas.height/2 );
	// measure text
	var fontSize	= 36;
	context.font	= "bolder "+fontSize+"px Verdana";
	var fontH	= fontSize;
	var fontW	= context.measureText(text).width;
	// build the background
	context.fillStyle = "rgba(0,0,255,0.3)";
	var scale	= 1.2;
	context.fillRect(-fontW*scale/2,-fontH*scale/1.3,fontW*scale,fontH*scale)
	// display the text
	context.fillStyle = "rgba(0,0,0,0.7)";
	context.fillText(text, -fontW/2, 0);
	// return the canvas element
	return canvas;
};