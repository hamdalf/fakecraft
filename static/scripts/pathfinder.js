document.addEventListener('DOMContentLoaded', function() {
    var container = document.querySelector('#container'),
        canvas = document.querySelector('#m'),
        ctx = canvas.getContext('2d');


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
        if (groupCells) {
            scene.remove(groupCells);
        }

        groupCells = new THREE.Mesh();
        cells = {};

        var nodes = json,
            frag = document.createDocumentFragment(),
            cellMat;
        
        for (var x = 0; x < nodes.length; x++) {
            cells[x] = {};
            for (var y = 0; y < nodes[x].length; y++) {
                if (nodes[x][y].weight == 0) {
                    cellMat = new THREE.MeshBasicMaterial({
                                    color: 0x777777,
                                    wireframe: false
                                });
                } else {
                    cellMat = new THREE.MeshBasicMaterial({
                                    color: 0x2194CE,
                                    wireframe: false
                                });
                }
                var cell = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), cellMat);
                cell.position.x = x * 5;
                cell.position.z = y * 5;
                cell.rotation.x = -(Math.PI * 90 / 180);
                cell._dataX = x;
                cell._dataY = y;
                groupCells.add(cell);
                cells[x][y] = cell;
            }
        }
        
        //groupCells.rotation.x = -(Math.PI * 90 / 180);
        groupCells.position.x = -(nodes.length * 10);
        groupCells.position.z = -(nodes[0].length * 10);
        scene.add(groupCells);
        console.log('done');
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