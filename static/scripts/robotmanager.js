document.addEventListener('DOMContentLoaded', function() {
    var robotTrafficTimer;

    var addRobot = function(space, id, name) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/robot/handsup2/' + id + '/' + name + '/' + space, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
            if (this.status == 200) {
                console.log(this.response);
            }
        };
        xhr.send();
    };

    document.querySelector('.robot button').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var params = document.querySelectorAll('.robot input');

        addRobot(params[0].value, params[1].value, params[2].value);
    }, false);

    var setRobotPosition = function(id, f, x, y, d) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/robot/tellmyposition/' + id + '/' + f + '/' + x + '/' + y + '/' + d, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                console.log(this.response);
			}
		};
		xhr.send();
    };

    var onClickSet = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var btn = (e.srcElement) ? e.srcElement : e.target,
            robotId = btn.getAttribute('data-row').replace('id_', ''),
            row = document.querySelector('.' + btn.getAttribute('data-row')),
            position = row.querySelectorAll('.position input'),
            direction = row.querySelectorAll('.direction input');

        setRobotPosition(robotId, position[0].value, position[1].value, position[2].value, direction[0].value);
    };

    var idleRobot = function(id) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/robot/freerobot/' + id, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                console.log(this.response);
			}
		};
		xhr.send();
    };

    var onClickIdle = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var btn = (e.srcElement) ? e.srcElement : e.target,
            robotId = btn.getAttribute('data-row').replace('id_', ''),
            row = document.querySelector('.' + btn.getAttribute('data-row'));

        idleRobot(robotId);
    };

    var byeRobot = function(id) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/robot/bye/' + id, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                console.log(this.response);
			}
		};
		xhr.send();
    };

    var onClickBye = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var btn = (e.srcElement) ? e.srcElement : e.target,
            robotId = btn.getAttribute('data-row').replace('id_', ''),
            row = document.querySelector('.' + btn.getAttribute('data-row'));

        byeRobot(robotId);
    };

    var eraseRoute = function(id) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/robot/eraseroute/' + id, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                console.log(this.response);
			}
		};
		xhr.send();
    };

    var onClickEraseRoute = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var btn = (e.srcElement) ? e.srcElement : e.target,
            robotId = btn.getAttribute('data-row').replace('id_', ''),
            row = document.querySelector('.' + btn.getAttribute('data-row'));

        eraseRoute(robotId);
    };

    var showRoute = function(id) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/robot/messageforarobot/' + id, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
			if (this.status == 200) {
                console.log(this.response);
                var robotInfo = this.response;
                popup.msg('[' + robotInfo.routes[0].x + ',' + robotInfo.routes[0].y + '] ~ [' + robotInfo.routes[robotInfo.routes.length-1].x + ',' + robotInfo.routes[robotInfo.routes.length-1].y + ']');
                popup.show();
			}
		};
		xhr.send();
    };

    var onClickShowRoute = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var btn = (e.srcElement) ? e.srcElement : e.target,
            robotId = btn.getAttribute('data-row').replace('id_', ''),
            row = document.querySelector('.' + btn.getAttribute('data-row'));

        showRoute(robotId);
    };

    var drawRobotStatus = function(rl) {
        var table = document.querySelector('#robotlist tbody'),
            df = document.createDocumentFragment(),
            tempTr, tempTd, tempIn;

        table.innerHTML = '';

        for (var k in rl) {
            tempTr = document.createElement('tr');
            tempTr.classList.add('id_' + rl[k].id);
            tempTd = document.createElement('td');
            tempTd.classList.add('robotid');
            tempTd.innerHTML = rl[k].id;
            tempTr.appendChild(tempTd);
            tempTd = document.createElement('td');
            tempTd.classList.add('robotname');
            tempTd.innerHTML = rl[k].name;
            tempTr.appendChild(tempTd);
            tempTd = document.createElement('td');
            tempTd.classList.add('space');
            tempTd.innerHTML = rl[k].space;
            tempTr.appendChild(tempTd);
            tempTd = document.createElement('td');
            tempTd.classList.add('busy');
            tempTd.innerHTML = rl[k].isBusy;
            tempTr.appendChild(tempTd);
            tempTd = document.createElement('td');
            tempTd.classList.add('position');
            tempIn = document.createElement('input');
            tempIn.type = 'text';
            tempIn.value = rl[k].position.f;
            tempTd.appendChild(tempIn);
            tempIn = document.createElement('input');
            tempIn.type = 'text';
            tempIn.value = rl[k].position.x;
            tempTd.appendChild(tempIn);
            tempIn = document.createElement('input');
            tempIn.type = 'text';
            tempIn.value = rl[k].position.y;
            tempTd.appendChild(tempIn);
            tempIn = document.createElement('button');
            tempIn.innerHTML = 'Set';
            tempIn.setAttribute('data-row', 'id_' + rl[k].id);
            tempIn.addEventListener('click', onClickSet, false);
            tempTd.appendChild(tempIn);
            tempTr.appendChild(tempTd);
            tempTd = document.createElement('td');
            tempTd.classList.add('direction');
            tempIn = document.createElement('input');
            tempIn.type = 'text';
            tempIn.value = rl[k].direction;
            tempTd.appendChild(tempIn);
            tempIn = document.createElement('button');
            tempIn.innerHTML = 'Set';
            tempIn.setAttribute('data-row', 'id_' + rl[k].id);
            tempIn.addEventListener('click', onClickSet, false);
            tempTd.appendChild(tempIn);
            tempTr.appendChild(tempTd);
            tempTd = document.createElement('td');
            tempTd.classList.add('route');
            tempIn = document.createElement('button');
            tempIn.innerHTML = 'Show';
            tempIn.setAttribute('data-row', 'id_' + rl[k].id);
            tempIn.addEventListener('click', onClickShowRoute, false);
            tempTd.appendChild(tempIn);
            tempIn = document.createElement('button');
            tempIn.innerHTML = 'Clear';
            tempIn.setAttribute('data-row', 'id_' + rl[k].id);
            tempIn.addEventListener('click', onClickEraseRoute, false);
            tempTd.appendChild(tempIn);
            tempTr.appendChild(tempTd);
            tempTd = document.createElement('td');
            tempTd.classList.add('control');
            tempIn = document.createElement('button');
            tempIn.innerHTML = 'Idle';
            tempIn.setAttribute('data-row', 'id_' + rl[k].id);
            tempIn.addEventListener('click', onClickIdle, false);
            tempTd.appendChild(tempIn);
            tempIn = document.createElement('button');
            tempIn.innerHTML = 'Bye';
            tempIn.setAttribute('data-row', 'id_' + rl[k].id);
            tempIn.addEventListener('click', onClickBye, false);
            tempTd.appendChild(tempIn);
            tempTr.appendChild(tempTd);
            df.appendChild(tempTr);
        }

        table.appendChild(df);
    };

    var getRobotsStatus = function() {
        if (robotTrafficTimer) {
            clearTimeout(robotTrafficTimer);
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/robot/showmerobots/', true);
        xhr.responseType = 'text';
        xhr.onload = function (e) {
			if (this.status == 200) {
                var robots = JSON.parse(this.responseText);
                drawRobotStatus(robots);
                robotTrafficTimer = setTimeout(getRobotsStatus, 10000);
			}
		};
		xhr.send();
    };

    var popup = {
        element: document.querySelector('#popup'),
        show: function() {
            this.element.style.display = 'block';
        },
        hide: function() {
            this.element.style.display = 'none';
        },
        msg: function(str) {
            this.element.querySelector('p').innerHTML = str;
        }
    };
    popup.element.querySelector('.btnClose').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        popup.hide();
    }, false);

    robotTrafficTimer = setTimeout(getRobotsStatus, 5000);
});