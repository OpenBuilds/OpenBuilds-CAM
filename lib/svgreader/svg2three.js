// Author Jordan Sitkin https://github.com/dustMason/Machine-Art
// Significant rewrite for by Peter van der Walt

globalpaths = {};
var hexvalue = [];
var svgcolors = [];
var svgcolorsoptions = [];
var intensity = 100;
var svglaserpwr = 0;
var path, paths;
var svgShape, svgGeom, svgLine;
var gcode;
var parsecolor;
var yflip;

// Helper function
Array.prototype.unique = function() {
  var n = {},
    r = [];
  for (var i = 0; i < this.length; i++) {
    if (!n[this[i]]) {
      n[this[i]] = true;
      r.push(this[i]);
    }
  }
  return r;
}

// Helper function
RGBToHex = function(r, g, b) {
  var bin = r << 16 | g << 8 | b;
  return (function(h) {
    return new Array(7 - h.length).join("0") + h
  })(bin.toString(16).toUpperCase())
}

function pullcolors(svgfile) {
  var hexvalue = [];
  var svgcolors = [];
  var svgcolorsoptions = [];
  console.log('SVG File: ', svgfile)
  svgfile = svgfile.replace(/^[\n\r \t]/gm, '');
  var paths = SVGReader.preview(svg, {}).allcolors,
    gcode,
    path,
    idx = paths.length,
    minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (i = 0; i < paths.length; i++) {
    if (paths[i].node.stroke) {
      svgcolors.push(paths[i].node.stroke)
    };
  }

  return svgcolors;
};

function svg2three(svgfile, fileName, settings) {

  if (typeof(fileObject) !== 'undefined') {
    scene.remove(fileObject);
  };
  fileObject = new THREE.Group();

  // clean off any preceding whitespace
  svgfile = svgfile.replace(/^[\n\r \t]/gm, '');
  settings = settings || {};
  settings.scale = settings.scale || 1;

  var config = {};
  var paths = SVGReader.parse(svgfile, config).allcolors,
    path,
    idx = paths.length,
    minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  globalpaths = paths;

  while (idx--) {

    var subidx = paths[idx].length;
    var bounds = {
      x: Infinity,
      y: Infinity,
      x2: -Infinity,
      y2: -Infinity,
      area: 0
    };

    // find lower and upper bounds
    while (subidx--) {
      if (paths[idx][subidx].x < bounds.x)
        bounds.x = paths[idx][subidx].x;
      if (paths[idx][subidx].x < minX)
        minX = paths[idx][subidx].x;

      if (paths[idx][subidx].y < bounds.y)
        bounds.y = paths[idx][subidx].y;
      if (paths[idx][subidx].y < minY)
        minY = paths[idx][subidx].y;

      if (paths[idx][subidx].x > bounds.x2)
        bounds.x2 = paths[idx][subidx].x;
      if (paths[idx][subidx].x > maxX)
        maxX = paths[idx][subidx].x;

      if (paths[idx][subidx].y > bounds.y2)
        bounds.y2 = paths[idx][subidx].y;
      if (paths[idx][subidx].y > maxY)
        maxY = paths[idx][subidx].y;
    }

    // calculate area
    bounds.area = (1 + bounds.x2 - bounds.x) * (1 + bounds.y2 - bounds.y);
    paths[idx].bounds = bounds;
  }

  if (settings.verticalSlices > 1 || settings.horizontalSlices > 1) {
    // break the job up into slices, work in small chunks
    var columnWidth = totalWidth / settings.verticalSlices;
    var rowHeight = totalHeight / settings.horizontalSlices;
    var sortedPaths = [];
    // create empty data structure
    for (i = 0; i < settings.horizontalSlices; i++) {
      sortedPaths[i] = [];
      for (j = 0; j < settings.verticalSlices; j++) {
        sortedPaths[i][j] = [];
      }
    }
    // populate it with paths
    paths.forEach(function(path) {
      var rowIndex = Math.floor((path[0].y));
      var colIndex = Math.floor((path[0].x));
      // console.log(rowIndex-2, colIndex-2);
      if (rowIndex < settings.verticalSlices && colIndex < settings.horizontalSlices) {
        sortedPaths[rowIndex][colIndex].push(path);
      } else {
        console.log("warning: skipped path");
      }
    });

    // concatenate all the paths together
    var paths = sortedPaths.map(function(row, i) {
      if ((i % 2) == 1) row.reverse();
      return [].concat.apply([], row);
    });
    paths = [].concat.apply([], paths);

  }

  for (var pathIdx = 0, pathLength = paths.length; pathIdx < pathLength; pathIdx++) {
    // console.group("SVG Path " + pathIdx)

    path = paths[pathIdx];
    var pathname = path.node.id
    // console.log(path)
    var svgGeom = new THREE.Geometry();
    // svgShape.moveTo( path[0].x,(path[0].y * -1));

    if (typeof(paths[pathIdx].node.stroke) != "undefined") {
      var pathcolor = paths[pathIdx].node.stroke;
      var r = pathcolor[0] / 255;
      var g = pathcolor[1] / 255;
      var b = pathcolor[2] / 255;
      var colorval = new THREE.Color().setRGB(r, g, b);
    }

    if (colorval) {
      // console.log('Color Value', colorval);
      var svgMaterial = new THREE.LineBasicMaterial({
        color: colorval
      })
    } else {
      // console.log('Color Value: NONE: Using Blue');
      var svgMaterial = new THREE.LineBasicMaterial({
        color: 0x0000ff
      })
    }


    for (var segmentIdx = 0, segmentLength = path.length; segmentIdx < segmentLength; segmentIdx++) {
      var segment = path[segmentIdx];

      // svgShape.lineTo( segment.x, (segment.y * -1) );
      svgGeom.vertices.push(new THREE.Vector3(segment.x, (segment.y * -1), 0));
      // console.log("svgGeom.vertices.push( new THREE.Vector3( " + segment.x + "," + (segment.y * -1) + ", 0 ) );")
    }

    // svgGeom = new THREE.ShapeGeometry( svgShape )

    window["svgEntity" + pathIdx] = new THREE.Line(svgGeom, svgMaterial);
    if (pathname) {
      window["svgEntity" + pathIdx].name = pathname
    } else {
      window["svgEntity" + pathIdx].name = "svgEntity" + pathIdx
    }
    window["svgEntity" + pathIdx].userData.color = window["svgEntity" + pathIdx].material.color.getHex();
    window["svgEntity" + pathIdx].userData.layer = path.node.layer;
    fileObject.add(window["svgEntity" + pathIdx]);
    console.groupEnd();
  } // while(idx--)

  fileObject.userData.editor = config.editor;
  fileObject.scale.x = settings.scale;
  fileObject.scale.y = settings.scale;
  // putFileObjectAtZero(fileObject)
  scene.add(fileObject);
  // calcZeroOffset(fileObject)
  fileObject.name = fileName
  objectsInScene.push(fileObject)
}