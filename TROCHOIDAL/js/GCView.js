// GCView - an html5 GCODE viewer which uses Three.js and can display on Canvas or with WebGL
// Copyright 2015 Andrew Hodel (www.xyzbots.com)
//

var GCView = function(container) {
  // container element, needs to be a div
  this.container = container;
  this.containerWidth;
  this.containerHeight;
  this.camera;
  this.controls;
  this.scene;
  this.renderer;

  this.lastLine = {
    x: null,
    y: null,
    z: null,
    e: null,
    f: null
  };
  this.relative = false;
  this.bbbox = {
    min: {
      x: 1000000,
      y: 1000000,
      z: 1000000
    },
    max: {
      x: -1000000,
      y: -1000000,
      z: -1000000
    }
  };
  this.threeLines = new THREE.Object3D();

  // init the GCView
  // this expects these files from Three.js (version 73)
  // CanvasRenderer.js, Projector.js, TrackballControls.js, three.min.js
  console.log('setting up GCView');

  // setup container width and height as they are only given as strings with px appended
  this.containerWidth = this.container.style.width.substr(0, this.container.style.width.length - 2);
  this.containerHeight = this.container.style.height.substr(0, this.container.style.height.length - 2);

  // setup a camera view
  this.camera = new THREE.PerspectiveCamera(70, this.containerWidth / this.containerHeight, 1, 1000);
  this.camera.position.x = 50;
  this.camera.position.y = 50;
  // add mouse pan tilt and zoom
  this.controls = new THREE.TrackballControls(this.camera, this.container);

  // this.controls = new THREE.OrbitControls(camera, renderer.domElement);
  this.controls.target.set(50, 50, 0); // view direction perpendicular to XY-plane

  this.controls.rotateSpeed = 7;
  this.controls.zoomSpeed = .1;

  // create the scene object
  this.scene = new THREE.Scene();

  // check if webgl is available on the users browser
  if (this.webglAvailable()) {
    // use webgl
    this.renderer = new THREE.WebGLRenderer();
  } else {
    // use canvas
    this.renderer = new THREE.CanvasRenderer();
  }

  // set renderer options
  this.renderer.setClearColor(0x000000);
  this.renderer.setSize(this.containerWidth, this.containerHeight);

  // remove any existing data from container div
  this.container.innerHTML = '';

  // add the renderer to the container div
  this.container.appendChild(this.renderer.domElement);

  // add an event to handle window resizes
  window.addEventListener('resize', this.onWindowResize, false);

};

GCView.prototype.onWindowResize = function() {
  // this just updates the viewport when the window is resized
  this.camera.aspect = this.containerWidth / this.containerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(this.containerWidth, this.containerHeight);
}

GCView.prototype.animate = function() {
  // requestAnimationFrame will pause the animation loop if the tab or window is not focused
  // basically it will repeatedly call the animate function (this function)
  requestAnimationFrame(function() {
    this.animate();
  }.bind(this)); // this has to be bound here externally because of requestAnimationFrame being a Window child
  this.render();
}

GCView.prototype.render = function() {
  // this renders the scene with the camera
  this.controls.update();
  this.renderer.render(this.scene, this.camera);
}

GCView.prototype.webglAvailable = function() {
  // check if webgl is available on the users browser
  try {
    var canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

GCView.prototype.drawAxes = function(dist) {

  // draw the axis lines for XYZ with length of dist
  var xyz = new THREE.Object3D();
  var lineMaterialBlue = new THREE.LineBasicMaterial({
    color: 'blue'
  });
  var lineMaterialRed = new THREE.LineBasicMaterial({
    color: 'red'
  });
  var lineMaterialGreen = new THREE.LineBasicMaterial({
    color: 'green'
  });

  var xGeo = new THREE.Geometry();
  xGeo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(dist, 0, 0));

  var yGeo = new THREE.Geometry();
  yGeo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, dist, 0));

  var zGeo = new THREE.Geometry();
  zGeo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, dist));

  xyz.add(new THREE.Line(xGeo, lineMaterialBlue), new THREE.Line(yGeo, lineMaterialRed), new THREE.Line(zGeo, lineMaterialGreen));

  // add axis lines
  this.scene.add(xyz);

  // set camera position
  this.camera.position.z = dist;

}

GCView.prototype.gcLine = function(text, line) {
  text = text.replace(/;.*$/, '').trim(); // remove comments
  if (text) {
    // a token is a segment of the line seperated by a space
    // this could be a G command, an M command or any arguments passed to them
    // a better parser would handle when gcode is written without spaces
    // "G1 Y20" vs "G1Y20"
    var tokens = text.split(' ');
    if (tokens) {
      // holder for arguments
      // the command (G or M etc) is always first
      var args = {
        'cmd': tokens[0].toLowerCase()
      };
      tokens.splice(1).forEach(function(token) {
        // for each argument, add it to the args object
        args[token[0].toLowerCase()] = parseFloat(token.substring(1));
      });
      // add it to this.gcodeLines
      if (this[args['cmd']]) {
        // a parser for this command exists
        // parse it
        this[args['cmd']](args, line);
      } else {
        console.log('GCView Error: unsupported command ' + args['cmd']);
      }
    }

  }
}

GCView.prototype.addSegment = function(p1, p2, c) {

  var g = new THREE.Geometry();
  g.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z), new THREE.Vector3(p2.x, p2.y, p2.z));
  this.threeLines.add(new THREE.Line(g, c));

  // setup bounding area
  this.bbbox.min.x = Math.min(this.bbbox.min.x, p2.x);
  this.bbbox.min.y = Math.min(this.bbbox.min.y, p2.y);
  this.bbbox.min.z = Math.min(this.bbbox.min.z, p2.z);
  this.bbbox.max.x = Math.max(this.bbbox.max.x, p2.x);
  this.bbbox.max.y = Math.max(this.bbbox.max.y, p2.y);
  this.bbbox.max.z = Math.max(this.bbbox.max.z, p2.z);

}

GCView.prototype.delta = function(v1, v2) {
  return this.relative ? v2 : v2 - v1;
}

GCView.prototype.absolute = function(v1, v2) {
  return this.relative ? v1 + v2 : v2;
}

GCView.prototype.g0 = function(args, line) {

  var newLine = {
    x: args.x !== undefined ? this.absolute(this.lastLine.x, args.x) : this.lastLine.x,
    y: args.y !== undefined ? this.absolute(this.lastLine.y, args.y) : this.lastLine.y,
    z: args.z !== undefined ? this.absolute(this.lastLine.z, args.z) : this.lastLine.z,
    e: args.e !== undefined ? this.absolute(this.lastLine.e, args.e) : this.lastLine.e,
    f: args.f !== undefined ? this.absolute(this.lastLine.f, args.f) : this.lastLine.f,
  };

  if (this.lastLine != undefined) {
    // g0 lines are black
    this.addSegment(this.lastLine, newLine, new THREE.LineBasicMaterial({
      color: 'grey',
      linewidth: .5
    }));
  }
  this.lastLine = newLine;
}

GCView.prototype.g1 = function(args, line) {

  // Example: G1 Z1.0 F3000
  //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
  //          G1 E104.25841 F1800.0
  // Go in a straight line from the current (X, Y) point
  // to the point (90.6, 13.8), extruding material as the move
  // happens from the current extruded length to a length of
  // 22.4 mm.

  var newLine = {
    x: args.x !== undefined ? this.absolute(this.lastLine.x, args.x) : this.lastLine.x,
    y: args.y !== undefined ? this.absolute(this.lastLine.y, args.y) : this.lastLine.y,
    z: args.z !== undefined ? this.absolute(this.lastLine.z, args.z) : this.lastLine.z,
    e: args.e !== undefined ? this.absolute(this.lastLine.e, args.e) : this.lastLine.e,
    f: args.f !== undefined ? this.absolute(this.lastLine.f, args.f) : this.lastLine.f,
  };

  if (this.lastLine != undefined) {
    this.addSegment(this.lastLine, newLine, new THREE.LineBasicMaterial({
      color: '#ffa500',
      linewidth: 1
    }));
  }
  this.lastLine = newLine;
}

GCView.prototype.g90 = function(args) {
  this.relative = false;
}

GCView.prototype.g91 = function(args) {
  this.relative = true;
}

GCView.prototype.g20 = function(args) {
  // set units to inches
}

GCView.prototype.g21 = function(args) {
  // set units to mm
  // could be used at a later date
  // to display units on screen
}

GCView.prototype.loadGC = function(gc) {

  if (typeof(gc) !== 'string' || gc === '') {
    console.log('loadGC error, first argument contains no data');
    return false;
  }

  // loop through each gcode line
  var l = gc.split('\n');
  for (var c = 0; c < l.length; c++) {
    this.gcLine(l[c], c);
  }

  this.scene.add(this.threeLines);

  // draw the axis lines based on the longest axis of the gcode dimensions
  this.drawAxes(Math.max(this.bbbox.max.x, this.bbbox.max.y, this.bbbox.max.z));

  // display it all
  this.animate();

  return {
    'status': 'complete',
    'bounds': this.bbbox
  };

}