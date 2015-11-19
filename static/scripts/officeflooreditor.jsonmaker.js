document.write('[');
for (var x = -260; x < 260; x++) {
	for (var z = -98; z < 97; z++) {
		if (x < 96 || (x > 95 && z > -38) || x > 187) {
			document.write('{"x":' + x + ',"y":0,"z":' + z + ',"p":"floor","t":"0"},');
		}
	}
}
document.write(']');