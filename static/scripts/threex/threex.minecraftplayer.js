var THREEx = THREEx || {};

THREEx.MinecraftPlayer = function () {
    var updateFcts = [];
    this.update = function (delta, now) {
        updateFcts.forEach(function (updateFct) {
            updateFct(delta, now);
        });
    }.bind(this);

    var character = new THREEx.MinecraftChar();
    this.character = character;
    
    /*var headAnims = new THREEx.MinecraftCharHeadAnimations(character);
    this.headAnims = headAnims;
    updateFcts.push(function(delta, now) {
        headAnims.update(delta, now);
    });*/
};