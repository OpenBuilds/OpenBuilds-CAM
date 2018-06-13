// setup GCView with the div element to display the gcode in
var gcview = new GCView(document.getElementById('gcview'));

// var r = new XMLHttpRequest();
// r.open('GET','output.gcode',true);
// r.send();
//
// r.onreadystatechange = function() {
// 	if (r.status == 200 && r.readyState == 4) {
// 		// load some GCode, this will return some data
// 		var loaded = gcview.loadGC(r.responseText);
// 		console.log(loaded);
// 	}
// }