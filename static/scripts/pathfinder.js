document.addEventListener('DOMContentLoaded', function() {
    var container = document.querySelector('#container'),
        canvas = document.querySelector('#stage canvas'),
        ctx = canvas.getContext('2d');

    //ctx.scale(0.1, 0.1);

    var loadJSONMap = function (space, floor) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/gridmaker/' + space + '/' + floor, true);
        xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                createMap(this.response);
			}
		};
		xhr.send();
    };

    var createMap = function (json) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var nodes = json,
            cellX, cellY, scale;

        canvas.width = document.querySelector('#stage').clientWidth * parseInt(document.querySelectorAll('.space input')[1].value);
        scale = canvas.width / (nodes.length * 10);
        canvas.height = nodes[0].length * 10 * scale;
        ctx.scale(scale, scale);
        
        for (var x = 0; x < nodes.length; x++) {
            for (var y = 0; y < nodes[x].length; y++) {
                if (nodes[x][y].weight == 0) {
                    ctx.fillStyle = "rgba(200, 0, 0, 1)";
                } else {
                    ctx.fillStyle = "rgba(0, 200, 0, 1)";
                }
                ctx.strokeStyle = "rgba(0, 0, 0, 1)";
                cellX = nodes[x][y].x * 10 + 1;
                cellY = nodes[x][y].y * 10 + 1;
                
                ctx.fillRect(cellX, cellY, cellX + 9, cellY + 9);
                ctx.strokeRect(cellX, cellY, cellX + 9, cellY + 9);
            }
        }
    };

    var spaceSetter = document.querySelectorAll('.space input');
    document.querySelector('.space button').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (spaceSetter[0].value) {
            loadJSONMap(spaceSetter[0].value, 0);
        }
    });


});