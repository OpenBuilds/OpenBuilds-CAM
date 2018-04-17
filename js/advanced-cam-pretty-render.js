// borrowed code from https://github.com/chilipeppr/widget-eagle/blob/master/widget.js

function getMeshLineFromClipperPath(opts) {
	var width = opts.width ? opts.width : 1;
	var paths = opts.clipperPath;
	var isSolid = 'isSolid' in opts ? opts.isSolid : true;
	var color = opts.color ? opts.color : 0x0000ff;
	var opacity = opts.opacity ? opts.opacity : 0.3;
	var isShowOutline = 'isShowOutline' in opts ? opts.isShowOutline : false;

	var retGrp = new THREE.Group();
	// console.log("getMeshLineFromClipperPath", opts);
	var localInflateBy = width / 2;

	// loop thru all paths and draw a mesh stroke
	// around the path with opacity set, such that when
	// multiples meshes are overlaid, their colors are darker
	// to visualize the toolpath. that means creating normals
	// for each pt and generating triangles to create mesh

	var group = new THREE.Object3D();
	var pathCtr = 0;

	paths.forEach(function(path) {

		// create a clipper stroke path for each line segment
		// we won't create one for the last pt because there's no line
		// after it
		// var clipperStrokes = [];
		var csThisPath = [];
		//console.log("calculating stroke paths for each path");
		for (var pi = 0; pi < path.length; pi++) {
			// console.log(path[pi])
			var pt = path[pi];
			var pt2 = (pi + 1 < path.length) ? path[pi + 1] : path[0];
			// console.log(pt, pt2)
			if (pt2 != null) {
				var clipperStroke = addStrokeCapsToLine(pt.X, pt.Y, pt2.X, pt2.Y, localInflateBy * 2, "round", color);
				// console.log(clipperStroke)
				if (clipperStroke.length > 1) console.warn("got more than 1 path on clipperStroke");
				if (clipperStroke.length < 1) console.warn("got less than 1 path on clipperStroke");
				csThisPath.push(clipperStroke[0]);
			}
		}
		// console.log(csThisPath);
		var csUnion = getUnionOfClipperPaths(csThisPath);
		// var csUnion = csThisPath

		if (isShowOutline) {
			// console.log("isShowOutline")
			var threeObj = drawClipperPaths(csUnion, color, opacity + 0.25, 0);
			retGrp.add(threeObj);
		}

		// This is SUPER SLOW cuz of the triangle calculation
		if (isSolid) {
			//if (csUnion.length > 1) console.warn("got more than 1 path on union");
			// investigate holes
			var csUnionHoles = [];
			var csUnionOuter = [];
			var ctr = 0;
			csUnion.forEach(function(path) {
				if (ClipperLib.Clipper.Orientation(path)) {
					// do nothing.
					//console.log("outer path:", path);
					csUnionOuter.push(path);
				} else {
					//console.warn("found a hole:", path);
					csUnionHoles.push(path);
				}
				ctr++;
			}, this);
			if (csUnionOuter.length > 1) console.warn("got more than 1 outer path");
			var mesh = this.createClipperPathsAsMesh(csUnionOuter, color, opacity, csUnionHoles);
			// this.sceneAdd(mesh);
			retGrp.add(mesh);
		}

		pathCtr++;
	}, this);
	retGrp.name = "retGrp"
	return retGrp;

}


function addStrokeCapsToLine(x1, y1, x2, y2, width, capType, color) {

	// console.log(x1, y1, x2, y2, width, capType)
	if (width < 0) {
		width = width * -1;
	}

	var cap = capType != null ? capType : "round";

	// we are given a line with two points. to stroke and cap it
	// we will draw the line in THREE.js and then shift x1/y1 to 0,0
	// for the whole line
	// then we'll rotate it to 3 o'clock
	// then we'll shift it up on x to half width
	// we'll create new vertexes on -x for half width
	// we then have a drawn rectangle that's the stroke
	// we'll add a circle at the start and end point for the cap
	// then we'll unrotate it
	// then we'll unshift it
	var group = new THREE.Object3D();
	group.name = "addStrokeCapsToLine"

	var lineGeo = new THREE.Geometry();
	lineGeo.vertices.push(new THREE.Vector3(x1, y1, 0));
	lineGeo.vertices.push(new THREE.Vector3(x2, y2, 0));
	var lineMat = new THREE.LineBasicMaterial({
		color: color,
		transparent: true,
		opacity: 0.5
	});
	var line = new THREE.Line(lineGeo, lineMat);
	line.name = "Line with cap"

	// shift to make x1/y1 zero
	line.position.set(x1 * -1, y1 * -1, 0);
	//line.updateMatrixWorld();
	group.add(line);

	// figure out angle to rotate to 0 degrees
	var x = x2 - x1;
	var y = y2 - y1;
	var theta = Math.atan2(-y, x);
	group.rotateZ(theta);

	// get our new xy coords for start/end of line
	//line.updateMatrixWorld();
	group.updateMatrixWorld();
	var v1 = line.localToWorld(line.geometry.vertices[0].clone());
	var v2 = line.localToWorld(line.geometry.vertices[1].clone());
	//console.log("v1,v2", v1, v2);

	// draw rectangle along line. apply width to y axis.
	var wireGrp = new THREE.Object3D();
	wireGrp.name = "wireGrp"

	var rectGeo = new THREE.Geometry();
	rectGeo.vertices.push(new THREE.Vector3(v1.x, v1.y - width / 2, 0));
	rectGeo.vertices.push(new THREE.Vector3(v2.x, v1.y - width / 2, 0));
	rectGeo.vertices.push(new THREE.Vector3(v2.x, v1.y + width / 2, 0));
	rectGeo.vertices.push(new THREE.Vector3(v1.x, v1.y + width / 2, 0));
	rectGeo.vertices.push(new THREE.Vector3(v1.x, v1.y - width / 2, 0));
	var rectLines = new THREE.Line(rectGeo, lineMat);
	wireGrp.add(rectLines);
	//rectLines.position.set(x1 * -1, y1 * -1, 0);
	//group.add(rectLines);

	// now add circle caps
	if (cap == "round") {
		var radius = width / 2;
		var segments = 16;
		var circleGeo = new THREE.CircleGeometry(radius, segments);
		// Remove center vertex
		circleGeo.vertices.shift();
		var circle = new THREE.Line(circleGeo, lineMat);
		// clone the circle
		var circle2 = circle.clone();

		// shift left (rotate 0 is left/right)
		var shiftX = 0; //radius * -1;
		var shiftY = 0;
		circle.position.set(shiftX + v1.x, shiftY + v1.y, 0);
		wireGrp.add(circle);

		// shift right
		var shiftX = 0; //radius * 1;
		var shiftY = 0;
		circle2.position.set(shiftX + v2.x, shiftY + v2.y, 0);
		wireGrp.add(circle2);
	}
	// now reverse rotate
	wireGrp.rotateZ(-theta);

	// unshift postion
	wireGrp.position.set(x1 * 1, y1 * 1, 0);

	//this.sceneAdd(wireGrp);

	// now simplify via Clipper
	var subj_paths = [];
	wireGrp.updateMatrixWorld();
	var lineCtr = 0;
	// console.log(wireGrp)
	wireGrp.children.forEach(function(line) {
		//console.log("line in group:", line);
		subj_paths.push([]);
		line.geometry.vertices.forEach(function(v) {
			//line.updateMatrixWorld();
			//console.log("pushing v onto clipper:", v);
			var vector = v.clone();
			var vec = line.localToWorld(vector);
			var xval = round(vec.x, 1)
			var yval = round(vec.y, 1)
			subj_paths[lineCtr].push({
				X: xval,
				Y: yval
			});
		}, this);
		lineCtr++;
	}, this);

	// console.log(subj_paths)

	var sol_paths = getUnionOfClipperPaths(subj_paths);
	//this.drawClipperPaths(sol_paths, this.colorSignal, 0.8);
	// this.sceneAdd(group);

	return sol_paths;

}

function round(number, precision) {
	var shift = function(number, precision, reverseShift) {
		if (reverseShift) {
			precision = -precision;
		}
		numArray = ("" + number).split("e");
		return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
	};
	return shift(Math.round(shift(number, precision, false)), precision, true);
}


function getUnionOfClipperPaths(subj_paths) {
	// console.log("getUnionOfClipperPaths", subj_paths);
	var cpr = new ClipperLib.Clipper();
	var scale = 100000;
	subj_paths = ClipperLib.JS.Clean(subj_paths, cleandelta * scale);
	ClipperLib.JS.ScaleUpPaths(subj_paths, scale);
	cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);
	var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
	var clip_fillType = ClipperLib.PolyFillType.pftNonZero;
	var solution_paths = new ClipperLib.Paths();
	cpr.Execute(ClipperLib.ClipType.ctUnion, solution_paths, subject_fillType, clip_fillType);
	var cleandelta = 0.1; // 0.1 should be the appropriate delta in different cases
	// console.log(JSON.stringify(solution_paths));
	// console.log("solution:", solution_paths);
	// scale back down
	for (var i = 0; i < solution_paths.length; i++) {
		for (var j = 0; j < solution_paths[i].length; j++) {
			solution_paths[i][j].X = solution_paths[i][j].X / scale;
			solution_paths[i][j].Y = solution_paths[i][j].Y / scale;
		}
	}
	ClipperLib.JS.ScaleDownPaths(subj_paths, scale);
	return solution_paths;
}


function createClipperPathsAsMesh(paths, color, opacity, holePath, depth) {
	if (color === undefined) color = this.colorDimension;
	//if(depth === undefined) depth = this.depthOfDimensions;
	var mat = new THREE.MeshBasicMaterial({
		color: color,
		transparent: true,
		opacity: opacity,
		side: THREE.DoubleSide,
		depthWrite: false
	});

	var group = new THREE.Object3D();
	for (var i = 0; i < paths.length; i++) {
		var shape = new THREE.Shape();
		for (var j = 0; j < paths[i].length; j++) {
			var pt = paths[i][j];
			if (j == 0) shape.moveTo(pt.X, pt.Y);
			else shape.lineTo(pt.X, pt.Y);
		}
		if (holePath !== undefined && holePath != null) {
			if (!(Array.isArray(holePath))) {
				holePath = [holePath];
			}

			for (var hi = 0; hi < holePath.length; hi++) {
				var hp = holePath[hi];
				var hole = new THREE.Path();
				for (var j = 0; j < hp.length; j++) {
					var pt = hp[j];
					if (j == 0) hole.moveTo(pt.X, pt.Y);
					else hole.lineTo(pt.X, pt.Y);
				}
				shape.holes.push(hole);
			}
		}
		var geometry;
		if (depth !== undefined) {
			var extrudeSettings = {
				steps: 1,
				amount: depth,
				bevelEnabled: false,
				bevelThickness: 0,
				bevelSize: 0,
				bevelSegments: 0
			};
			geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		} else
			geometry = new THREE.ShapeGeometry(shape);

		var shapeMesh = new THREE.Mesh(geometry, mat);
		group.add(shapeMesh);
	}
	return group;
}
