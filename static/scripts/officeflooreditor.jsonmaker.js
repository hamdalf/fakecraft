document.write('[');
for (var y = 0; y < 2; y++) {
	for (var x = -260; x < 260; x++) {
		for (var z = -98; z < 97; z++) {
			if (y == 0) {
				if (x < 96 || (x > 95 && z > -38) || x > 187) {
					document.write('{"x":' + x + ',"y":0,"z":' + z + ',"p":"floor","t":"0"},');
				}
				if ( x > 170 && x < 188 && z > -56 && z < -37 ) {
					document.write('{"x":' + x + ',"y":0,"z":' + z + ',"p":"floor","t":"1"},');
				}
				if ( x > 168 && x < 171 && z > -56 && z < -38 ) {
					document.write('{"x":' + x + ',"y":0,"z":' + z + ',"p":"floor","t":"1"},');
				}
			} else {
				// Avocado wall #1
				if (x == 188 && z < -54) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				// Avocado wall #2
				if (z == -38 && x > 187) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				// Office pillar #1
				if (z > -38 && z < -32 && x > 187 && x < 192) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (z > -33 && z < -30 && x == 191) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				// office wall #1
				if (z > -19 && z < 19 && x == 191) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
					if (z > -18) {
						document.write('{"x":' + (x - 1) + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
					}
				}
				if (z > -17 && z < 18 && x == 145) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (z > 10 && z < 18 && x == 136) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (z == 10 && x > 123 && x < 145) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (x > 191 && x < 198 && (z == -17 || z == -5 || z == 18)) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (x == 197 && z > -5 && z < 18) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (z == 18 && x < 190 && x > 135) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (z == -17 && ((x < 190 && x > 177) || (x < 169 && x > 144) || (x < 136 && x > 127))) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (z > -17 && z < 10 && x == 133) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				// middle area
				if (z == 10 && ((x < 111 && x > 2) || (x < -13 && x > -72))) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
					if (x < 79 && x > -44) {
						document.write('{"x":' + x + ',"y":' + y + ',"z":' + (z + 1) + ',"p":"wall","t":"0"},');
					}
				}
				if (z == -62 && x > 70 && x < 96) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (x == 95 && z < -62) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (x == 110 && (z > -13 && z < 10)) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (z == -12 && (x > 70 && x < 110)) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (x > 68 && x < 71 && (z < -34 || (z > -19 && z < 10))) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
				if (x > -44 && x < -41 && (z < -34 || (z > -19 && z < 10))) {
					document.write('{"x":' + x + ',"y":' + y + ',"z":' + z + ',"p":"wall","t":"0"},');
				}
			}
		}
	}
}
document.write(']');