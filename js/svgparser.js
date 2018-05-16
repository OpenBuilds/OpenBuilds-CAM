// Create Parser object
var lwsvgparser = new SVGParser.Parser();

// Register the onTag callback
lwsvgparser.onTag(function(tag) {
  // console.log('onTag:', tag);
});

// Load multiple files (sync)
function loadFiles(files) {
  var file = files.shift();
  loadFile(file).then(function() {
    files.length && loadFiles(files);
  });
}

// Load one file
function loadSVGFile(file) {
  // Load SVG from file
  return lwsvgparser.loadFromFile(file).then(function(element) {
      return lwsvgparser.parse().then(function(tags) {
        drawFile(file, tags);
      });
    })
    .catch(function(error) {
      // console.error('error:', error);
    });
}


// // Draw ------------------------------------------------------------------------
//
// function addObject(name, obj) {
//   // attachBoundingBox(object);
//   // addUIObject(name, object);
//   obj.name = name;
//   objectsInScene.push(obj)
//   fillTree();
// }

function svgtraverse(tag, callback) {

  callback(tag);

  var children = tag.children;

  for (var i = 0, l = children.length; i < l; i++) {

    svgtraverse(children[i], callback);

  }

};

function drawFile(file, tag) {
  var editor = lwsvgparser.editor.name
  var version = parseFloat(lwsvgparser.editor.version)
  if (editor == "inkscape") {
    if (version > 0.91) {
      resol = 90;
    } else {
      resol = 96;
    }
  } else if (editor == "illustrator") {
    resol = 72
  } else {
    resol = 96;
  }
  console.log("File: " + file.name + " was creater in " + editor + " version " + version + ".  Setting import resolution to " + resol + "dpi")
  scale = 1 / (resol / 25.4)
  var svgtagobject = new THREE.Object3D();
  svgtagobject.name = file.name
  svgtraverse(tag, function(child) {
    // console.log(child)
    if (child.paths.length && child.paths[0].length) {

      // child.getShapes().forEach(function(shape) {
      //   shape = drawShape(tag, shape)
      //   shape.userData.layer = child.layer
      //   shape.name = child.name
      //   svgtagobject.add(shape);
      // });

      child.getPaths().forEach(function(path) {
        path = drawSVGLine(tag, path, scale)
        path.userData.layer = child.layer
        path.name = child.attrs.id
        // console.log(path)
        // console.log(path)
        svgtagobject.add(path);
      });
    }
  });

  objectsInScene.push(svgtagobject)
  fillTree();
}


function drawSVGLine(tag, path, scale) {

  var geometry = new THREE.Geometry();
  var material = this.createSVGLineMaterial(tag);

  path.points.forEach(function(point) {
    // obj.position.y += lwsvgparser.document.height;
    geometry.vertices.push(new THREE.Vector3(point.x, -point.y + lwsvgparser.document.height, 0));
    // geometry.vertices.push(new THREE.Vector3(point.x, point.y, 0));
  });

  var opt = {
    scale: {
      x: scale,
      y: scale,
      z: 1
    }
  }
  alterGeometry(geometry, opt)

  return new THREE.Line(geometry, material);
}

function createSVGLineMaterial(tag) {
  var opacity = tag.getAttr('stroke-opacity', 1);
  var material = new THREE.LineBasicMaterial({
    color: this.createColor(
      tag.getAttr('stroke', tag.getAttr('fill', 'black'))
    )
  });

  material.depthWrite = false;
  material.depthTest = false;

  if (opacity < 1) {
    material.transparent = true;
    material.opacity = opacity;
  }

  return material;
}

function createSolidMaterial(tag) {
  var opacity = tag.getAttr('fill-opacity', 1);
  var material = new THREE.MeshBasicMaterial({
    color: this.createColor(tag.getAttr('fill', 'black')),
    side: THREE.DoubleSide
  });

  material.depthWrite = false;
  material.depthTest = false;

  if (opacity < 1) {
    material.transparent = true;
    material.opacity = opacity;
  }

  return material;
};

function drawShape(tag, path) {
  let shape = new THREE.Shape(path.outer.points);

  path.holes.forEach(function(hole) {
    shape.holes.push(new THREE.Path(hole.points));
  });

  var geometry = new THREE.ShapeGeometry(shape);
  var material = createSolidMaterial(tag);

  return new THREE.Mesh(geometry, material);
}

function createColor(color) {
  // TODO ...
  if (color === 'none') {
    color = 'black';
  }

  color = new THREE.Color(color);
  var r = color.r * 255;
  var g = color.g * 255;
  var b = color.b * 255;

  /*// Darken too light colors...
    var luma, lumaLimit = 200;

    while (true) {
    luma = (r * 0.3) + (g * 0.59) + (b * 0.11);

    if (luma <= lumaLimit) {
    break;
}

r > 0 && (r -= 1);
g > 0 && (g -= 1);
b > 0 && (b -= 1);
}*/

  // Create color object ([0-255] to [0-1] range)
  color = new THREE.Color(r / 255, g / 255, b / 255);

  // Return the color object
  return color;
}