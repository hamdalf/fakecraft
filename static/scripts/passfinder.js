document.addEventListener('DOMContentLoaded', function() {
    var startPoint, endPoint, startElement, endElement, cells, selectedFloor;
    
    var init = function () {
        var floorOptions = document.querySelector('dd.floor select').options;
        for (var i = 0; i < floorOptions.length; i++) {
            if (floorOptions[i].selected === true) {
                loadJSONMap(floorOptions[i].value);
                break;
            }
        }
    };
    
    var loadJSONMap = function (floor) {
        selectedFloor = floor;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/gridmaker/' + floor, true);
        xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                createMap(this.response);
			}
		};
		xhr.send();
    };
    
    var createMap = function (json) {
        var nodes = json,
            frag = document.createDocumentFragment();
            
        document.querySelector('#map').innerHTML = '';
        cells = {};
        
        for (var x = 0; x < nodes.length; x++) {
            cells[x] = {};
            for (var y = 0; y < nodes[x].length; y++) {
                var cell = document.createElement('div');
                cell.className = 'cubeCell';
                cell.style.left = (x * 5) + 'px';
                cell.style.top = (y * 5) + 'px';
                if (nodes[x][y].weight == 0) {
                    cell.classList.add('wall');
                }
                cell.setAttribute('data-x', x);
                cell.setAttribute('data-y', y);
                cell.addEventListener('click', cellOnClick, false);
                frag.appendChild(cell);
                cells[x][y] = cell;
            }
        }
        
        document.querySelector('#map').appendChild(frag);
    };
    
    var cellOnClick = function (e) {
        if (!startPoint) {
            startPoint = {x: e.srcElement.getAttribute('data-x'), y: e.srcElement.getAttribute('data-y')};
            startElement = e.srcElement;
            startElement.classList.add('start');
        } else if (!endPoint) {
            endPoint = {x: e.srcElement.getAttribute('data-x'), y: e.srcElement.getAttribute('data-y')};
            endElement = e.srcElement;
            endElement.classList.add('end');
            askPath(function (path) {
                showPath(path);
                startPoint = null;
                endPoint = null;
                startElement.classList.remove('start');
                endElement.classList.remove('end');
            });
            
        }
    };
    
    var askPath = function(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/passfinder/' + selectedFloor + '/' + startPoint.x + '/' + startPoint.y + '/' + endPoint.x + '/' + endPoint.y, true);
        xhr.responseType = 'json';
		xhr.onload = function (e) {
			if (this.status == 200) {
                callback(this.response);
			}
		};
		xhr.send();
    };
    
    var showPath = function (node) {
        var removeRoute = function (node, i) {
            if (i >= node.length) {
                return;
            }
            var theNode = node[i];
            cells[theNode.x][theNode.y].classList.remove('route');
            removeRoute(node, i + 1);
        };
        
        var addRoute = function (node, i) {
            if (i >= node.length) {
                return setTimeout(function () {
                    removeRoute(node, 0);
                }, 2000);
            }
            var theNode = node[i];
            cells[theNode.x][theNode.y].classList.add('route');
            addRoute(node, i + 1);
        };
        addRoute(node, 0);
    };
    
    document.querySelector('dd.floor select').addEventListener('change', function(e) {
        var options = e.target.children;
        for (var i = 0; i < options.length; i++) {
            if (options[i].selected === true) {
                loadJSONMap(options[i].value);
            }
        }
    }, false);
    
    init();
});