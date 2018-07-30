/*

    AUTHOR:  OpenJSCAD Development timeStamp
    Modified to integrate into Laserweb UI by AUTHOR: Peter van der Walt

*/

OpenJsCad = function() {};

// Specific to your machine
var laserxmax = 600
var laserymax = 400
var lineincrement = 50

var axesgrp2 = '';
var axes2 = '';
var gridhelper = '';
var colorMeshes = '';

var scene2;

OpenJsCad.log = function(txt) {
  var timeInMs = Date.now();
  var prevtime = OpenJsCad.log.prevLogTime;
  if (!prevtime) prevtime = timeInMs;
  var deltatime = timeInMs - prevtime;
  OpenJsCad.log.prevLogTime = timeInMs;
  var timefmt = (deltatime * 0.001).toFixed(3);
  txt = "[" + timefmt + "] " + txt;
  if ((typeof(console) == "object") && (typeof(console.log) == "function")) {
    //console.log(txt); // Turn on for Debug
  } else if ((typeof(self) == "object") && (typeof(self.postMessage) == "function")) {
    self.postMessage({
      cmd: 'log',
      txt: txt
    });
  } else throw new Error("Cannot log");
};

// A viewer is a WebGL canvas that lets the user view a mesh. The user can
// tumble it around by dragging the mouse.
OpenJsCad.Viewer = function(containerElm, size, options) {
  // config stuff
  // fg and bg colors
  var defaultBgColor = [1, 1, 1];
  var defaultMeshColor = [0.2, 0.2, 0.2];
  var drawAxes = false;
  var rotateZX = false;
  var rotateXY = false;

  this.renderer_ = renderer;
  var axLength = 1000;
  this.perspective = 45; // in degrees
  //this.viewpointZ = initialdepth;
  this.drawOptions = {
    // Draw black triangle lines ("wireframe")
    lines: options.drawLines,
    // Draw surfaces
    faces: options.drawFaces
  };
  // end config stuff

  this.size = size;
  this.defaultColor_ = options.color || defaultMeshColor;
  // default is opaque if not defined otherwise
  if (this.defaultColor_.length == 3) {
    this.defaultColor_.push(1);
  }
  this.bgColor_ = new THREE.Color();
  this.bgColor_.setRGB.apply(this.bgColor_, options.bgColor || defaultBgColor);
  // the elm to contain the canvas
  this.containerElm_ = containerElm;

  this.createScene(drawAxes, axLength);
  // this.createGrid();
  this.createCamera();

  this.parseSizeParams();
  // createRenderer will also call render
  //this.createRenderer(options.noWebGL);
  //this.animate();
};


OpenJsCad.Viewer.prototype = {


  // adds axes too
  createScene: function(drawAxes, axLen) {
    scene2 = new THREE.Scene();
    this.scene_ = scene2;
    if (drawAxes) {
      this.drawAxes(axLen);
    }
  },

  // createGrid: function() {
  //     if (gridhelper2) {
  //            scene2.remove(gridhelper);
  //        }
  //    	var gridhelper2 = new THREE.GridHelperRect((laserxmax /2), 10, (laserymax / 2), 10);
  //                gridhelper2.setColors(0x0000ff, 0x707070);
  //                gridhelper2.position.y = 0;
  //                gridhelper2.position.x = 0;
  //                gridhelper2.position.z = 0;
  //                gridhelper2.rotation.x = 90 * Math.PI / 180;
  //                gridhelper2.material.opacity = 0.15;
  //                gridhelper2.material.transparent = true;
  //                gridhelper2.receiveShadow = false;
  //                //console.log("helper grid:", helper);
  //                this.grid2 = gridhelper2;
  //                //this.sceneAdd(this.grid);
  //    			       this.scene_.add(gridhelper2);
  //
  //         if (axes2) {
  //                scene2.remove(axes2);
  //            }
  //
  //         if (axesgrp2) {
  //                scene2.remove(axesgrp2);
  //            }
  //       var axesgrp2 = new THREE.Object3D();
  //       var axes2 = new THREE.AxisHelper(120);
  //
  //                    axes2.material.transparent = true;
  //                    axes2.material.opacity = 0.8;
  //                    axes2.material.depthWrite = false;
  //                    axes2.position.set(0,0,-0.0001);
  //                    axes2.translateX((laserxmax / 2) * -1);
  //        			       axes2.translateY((laserymax / 2) * -1);
  //
  //                    this.scene_.add(axes);
  //
  //        			var x = [];
  //        			var y = [];
  //        		    for (var i = 0; i < laserxmax ; i+=lineincrement) {
  //
  //        				x[i] = makeSprite(this.scene_, "webgl", {
  //        					x: i,
  //        					y: -10,
  //        					z: 0,
  //        					text: i,
  //        					color: "#ff0000"
  //        				});
  //        				axesgrp2.add(x[i]);
  //        			}
  //
  //        			 for (var i = 0; i < laserymax ; i+=lineincrement) {
  //
  //        				y[i] = makeSprite(this.scene_, "webgl", {
  //        					x: -10,
  //        					y: i,
  //        					z: 0,
  //        					text: i,
  //        					color: "#006600"
  //        				});
  //        				axesgrp2.add(y[i]);
  //        			}
  //        		    // add axes labels
  //                    var xlbl = makeSprite(this.scene_, "webgl", {
  //                        x: 125,
  //                        y: 0,
  //                        z: 0,
  //                        text: "X",
  //                        color: "#ff0000"
  //                    });
  //                    var ylbl = makeSprite(this.scene_, "webgl", {
  //                        x: 0,
  //                        y: 125,
  //                        z: 0,
  //                        text: "Y",
  //                        color: "#006600"
  //                    });
  //                    var zlbl = makeSprite(this.scene_, "webgl", {
  //                        x: 0,
  //                        y: 0,
  //                        z: 125,
  //                        text: "Z",
  //                        color: "#0000ff"
  //                    });
  //
  //
  //                    axesgrp2.add(xlbl);
  //                    axesgrp2.add(ylbl);
  //                    //axesgrp.add(zlbl);
  //
  //        			axesgrp2.translateX((laserxmax / 2) * -1);
  //        			axesgrp2.translateY((laserymax / 2) * -1);
  //        			this.scene_.add(axesgrp2);
  //   },

  createCamera: function() {
    //var light = new THREE.PointLight();
    //light.position.set(0, 0, 0);
    // aspect ration changes later - just a placeholder
    var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(0, 1, 0);
    this.scene_.add(directionalLight2);

    camera2 = new THREE.PerspectiveCamera(this.perspective, 1 / 1, 0.01, 1000000);
    this.camera_ = camera2;
    //camera.add(light);
    camera2.position.set(0, 0, 0);
    camera2.up.set(0, 0, 1);
    camera2.lookAt(0, 0, 0);
    this.scene_.add(camera2);
    //camera2.translateX(300);
  },
  createControls: function(canvas) {
    // controls. just change this line (and script include) to other threejs controls if desired
    var controls2 = new THREE.OrbitControls(this.camera_, canvas);
    this.controls_ = controls2;
    controls2.noKeys = true;
    controls2.zoomSpeed = 0.5;
    // controls.autoRotate = true;
    controls2.autoRotateSpeed = 1;
    controls2.addEventListener('change', this.render.bind(this));
  },
  webGLAvailable: function() {
    try {
      var canvas = document.createElement("canvas");
      return !!
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl"));
    } catch (e) {
      return false;
    }
  },
  createRenderer: function(bool_noWebGL) {
    var Renderer = this.webGLAvailable() && !bool_noWebGL ?
      THREE.WebGLRenderer : THREE.CanvasRenderer;
    // we're creating new canvas on switching renderer, as same
    // canvas doesn't tolerate moving from webgl to canvasrenderer
    var renderer = new Renderer({
      precision: 'highp'
    });
    this.renderer_ = renderer;

    if (this.canvas) {
      this.canvas.remove();
    }
    this.canvas = renderer.domElement;
    this.containerElm_.appendChild(this.canvas);
    // scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 )
    renderer.setClearColor(this.bgColor_);
    // renderer.setClearColor(scene.fog.color);
    // and add controls
    this.createControls(renderer.domElement);

    // if coming in from contextrestore, enable rendering here
    this.pauseRender_ = false;
    this.handleResize();
    // handling context lost
    var this_ = this;
    this.canvas.addEventListener("webglcontextlost", function(e) {
      e.preventDefault();
      this_.cancelAnimate();
    }, false);
    this.canvas.addEventListener("webglcontextrestored", function(e) {
      this_.createRenderer(true);
      this_.animate();
    }, false);
  },
  render: function() {
    this.renderer_ = renderer;
    if (!this.pauseRender_) {
      this.renderer_.render(this.scene_, camera2);
    }
  },
  animate: function() {
    // reduce fps? replace func with
    // setTimeout( function() {
    //     requestAnimationFrame(this.animate.bind(this));
    // }, 1000 / 40 ); // last num = fps
    this.requestID_ = requestAnimationFrame(this.animate.bind(this));
    this.controls_.update();
  },
  cancelAnimate: function() {
    this.pauseRender_ = true;
    cancelAnimationFrame(this.requestID_);
  },
  refreshRenderer: function(bool_noWebGL) {
    this.cancelAnimate();
    if (!bool_noWebGL) {
      // need to refresh scene objects except camera
      var objs = this.scene_.children.filter(function(ch) {
        return !(ch instanceof THREE.Camera);
      });
      this.scene_.remove.apply(this.scene_, objs);
      var newObjs = objs.map(function(obj) {
        obj.geometry = obj.geometry.clone();
        obj.material = obj.material.clone();
        return obj.clone();
      });
      this.scene_.add.apply(this.scene_, newObjs);
      this.applyDrawOptions();
    }
    this.createRenderer(bool_noWebGL);
    this.animate();
  },
  // https://www.youtube.com/watch?v=c-O-tOYdAFY#t=858 (pause) for a basic grid
  drawAxes: function(axLen) {
    axLen = axLen || 1000;

    function v(x, y, z) {
      return new THREE.Vector3(x, y, z);
    }
    var origin = v(0, 0, 0);
    [
      [v(axLen, 0, 0), 0xFF0000],
      [v(-axLen, 0, 0), 0xD3D3D3],
      [v(0, axLen, 0), 0x00FF00],
      [v(0, -axLen, 0), 0xD3D3D3],
      [v(0, 0, axLen), 0x0000FF],
      [v(0, 0, -axLen), 0xD3D3D3]
    ]
    .forEach(function(axdef) {
      var lineGeometry = new THREE.Geometry();
      lineGeometry.vertices.push(origin, axdef[0]);
      this.scene_.add(new THREE.Line(lineGeometry,
        new THREE.LineBasicMaterial({
          color: axdef[1],
          lineWidth: 1
        })))
    }, this);
  },
  setCsg: function(csg, resetZoom) {
    this.clear();
    res = THREE.CSG.fromCSG(csg, this.defaultColor_);
    colorMeshes = [].concat(res.colorMesh)
      .map(function(mesh) {
        mesh.userData = {
          faces: true
        };
        return mesh;
      });
    var wireMesh = res.wireframe;
    wireMesh.userData = {
      lines: true
    };
    this.scene_.add.apply(this.scene_, colorMeshes);
    this.scene_.add(wireMesh);
    resetZoom && this.resetZoom(res.boundLen);
    this.applyDrawOptions();
    wireMesh.translateX((laserxmax / 2) * -1);
    wireMesh.translateY((laserymax / 2) * -1);
    this.getUserMeshes('faces').forEach(function(faceMesh) {
      faceMesh.visible = !!this.drawOptions.faces;
      faceMesh.translateX((laserxmax / 2) * -1);
      faceMesh.translateY((laserymax / 2) * -1);
    }, this);
  },
  applyDrawOptions: function() {
    this.getUserMeshes('faces').forEach(function(faceMesh) {
      faceMesh.visible = !!this.drawOptions.faces;
    }, this);
    this.getUserMeshes('lines').forEach(function(lineMesh) {
      lineMesh.visible = !!this.drawOptions.lines;
    }, this);
    this.render();
  },
  clear: function() {
    this.scene_.remove.apply(this.scene_, this.getUserMeshes());
  },
  // gets the meshes created by setCsg
  getUserMeshes: function(str) {
    return this.scene_.children.filter(function(ch) {
      if (str) {
        return ch.userData[str];
      } else {
        return ch.userData.lines || ch.userData.faces;
      }
    });
  },
  resetZoom: function(r) {
    if (!r) {
      // empty object - any default zoom
      r = 10;
    }
    var d = r / Math.tan(this.perspective * Math.PI / 180);
    // play here for different start zoom
    //this.camera_.position.set(d*2, d*2, d);
    this.camera_.position.set(0, 0, d * 5);
    this.camera_.zoom = 1;
    //this.camera_.lookAt(this.scene_.position);
    this.camera_.lookAt(0, 0, 0);
    this.camera_.updateProjectionMatrix();
  },
  parseSizeParams: function() {
    // essentially, allow all relative + px. Not cm and such.
    var winResizeUnits = ['%', 'vh', 'vw', 'vmax', 'vmin'];
    var width, height;
    if (!this.size.width) {
      this.size.width = this.size.widthDefault;
    }
    if (!this.size.height) {
      this.size.height = this.size.heightDefault;
    }
    var wUnit = this.size.width.match(/^(\d+(?:\.\d+)?)(.*)$/)[2];
    var hUnit = typeof this.size.height == 'string' ?
      this.size.height.match(/^(\d+(?:\.\d+)?)(.*)$/)[2] :
      '';
    // whether unit scales on win resize
    var isDynUnit = winResizeUnits.indexOf(wUnit) != -1 ||
      winResizeUnits.indexOf(hUnit) != -1;
    // e.g if units are %, need to keep resizing canvas with dom
    if (isDynUnit) {
      window.addEventListener('resize', this.handleResize.bind(this))
    }
  },
  handleResize: function() {
    var hIsRatio = typeof this.size.height != 'string';
    // apply css, then check px size. This is in case css is not in px
    this.canvas.style.width = this.size.width;
    if (!hIsRatio) {
      this.canvas.style.height = this.size.height;
    }
    var widthInPx = this.canvas.clientWidth;
    var heightInPx = hIsRatio ?
      widthInPx * this.size.height :
      this.canvas.clientHeight; // size.height.match(/^(\d+(?:\.\d+)?)(.*)$/)[1];

    this.camera_.aspect = widthInPx / heightInPx;
    this.camera_.updateProjectionMatrix();
    // set canvas attributes (false => don't set css)
    this.renderer_.setSize(widthInPx, heightInPx, false);
    this.render();
  }
};

// make a full url path out of a base path and url component.
// url argument is interpreted as a folder name if it ends with a slash
OpenJsCad.makeAbsoluteUrl = function(url, baseurl) {
  if (!url.match(/^[a-z]+\:/i)) {
    var re = /^\/|\/$/g;
    if (baseurl[baseurl.length - 1] != '/') {
      // trailing part is a file, not part of base - remove
      baseurl = baseurl.replace(/[^\/]*$/, "");
    }
    if (url[0] == '/') {
      var basecomps = baseurl.split('/');
      url = basecomps[0] + '//' + basecomps[2] + '/' + url.replace(re, "");
    } else {
      url = (baseurl.replace(re, "") + '/' + url.replace(re, ""))
        .replace(/[^\/]+\/\.\.\//g, "");
    }
  }
  return url;
};

OpenJsCad.isChrome = function() {
  return (navigator.userAgent.search("Chrome") >= 0);
};

// This is called from within the web worker. Execute the main() function of the supplied script
// and post a message to the calling thread when finished
OpenJsCad.runMainInWorker = function(mainParameters) {
  try {
    if (typeof(main) != 'function') throw new Error('Your jscad file should contain a function main() which returns a CSG solid or a CAG area.');
    OpenJsCad.log.prevLogTime = Date.now();
    var result = main(mainParameters);
    result = OpenJsCad.expandResultObjectArray(result);
    OpenJsCad.checkResult(result);
    var result_compact = OpenJsCad.resultToCompactBinary(result);
    result = null; // not needed anymore
    self.postMessage({
      cmd: 'rendered',
      result: result_compact
    });
  } catch (e) {
    var errtxt = e.toString();
    if (e.stack) {
      errtxt += '\nStack trace:\n' + e.stack;
    }
    self.postMessage({
      cmd: 'error',
      err: errtxt
    });
  }
};

// expand an array of CSG or CAG objects into an array of objects [{data: <CAG or CSG object>}]
OpenJsCad.expandResultObjectArray = function(result) {
  if (result instanceof Array) {
    result = result.map(function(resultelement) {
      if ((resultelement instanceof CSG) || (resultelement instanceof CAG)) {
        resultelement = {
          data: resultelement
        };
      }
      return resultelement;
    });
  }
  return result;
};

// check whether the supplied script returns valid object(s)
OpenJsCad.checkResult = function(result) {
  var ok = true;
  if (typeof(result) != "object") {
    ok = false;
  } else {
    if (result instanceof Array) {
      if (result.length < 1) {
        ok = false;
      } else {
        result.forEach(function(resultelement) {
          if (!("data" in resultelement)) {
            ok = false;
          } else {
            if ((resultelement.data instanceof CSG) || (resultelement.data instanceof CAG)) {
              // ok
            } else {
              ok = false;
            }
          }
        });
      }

    } else if ((result instanceof CSG) || (result instanceof CAG)) {} else {
      ok = false;
    }
  }
  if (!ok) {
    throw new Error("Your main() function does not return valid data. It should return one of the following: a CSG object, a CAG object, an array of CSG/CAG objects, or an array of objects: [{name:, caption:, data:}, ...] where data contains a CSG or CAG object.");
  }
};

// convert the result to a compact binary representation, to be copied from the webworker to the main thread.
// it is assumed that checkResult() has been called already so the data is valid.
OpenJsCad.resultToCompactBinary = function(resultin) {
  var resultout;
  if (resultin instanceof Array) {
    resultout = resultin.map(function(resultelement) {
      var r = resultelement;
      r.data = resultelement.data.toCompactBinary();
      return r;
    });
  } else {
    resultout = resultin.toCompactBinary();
  }
  return resultout;
};

OpenJsCad.resultFromCompactBinary = function(resultin) {
  function fromCompactBinary(r) {
    var result;
    if (r.class == "CSG") {
      result = CSG.fromCompactBinary(r);
    } else if (r.class == "CAG") {
      result = CAG.fromCompactBinary(r);
    } else {
      throw new Error("Cannot parse result");
    }
    return result;
  }
  var resultout;
  if (resultin instanceof Array) {
    resultout = resultin.map(function(resultelement) {
      var r = resultelement;
      r.data = fromCompactBinary(resultelement.data);
      return r;
    });
  } else {
    resultout = fromCompactBinary(resultin);
  }
  return resultout;
};


OpenJsCad.parseJsCadScriptSync = function(script, mainParameters, debugging) {
  var workerscript = "";
  workerscript += script;
  if (debugging) {
    workerscript += "\n\n\n\n\n\n\n/* -------------------------------------------------------------------------\n";
    workerscript += "OpenJsCad debugging\n\nAssuming you are running Chrome:\nF10 steps over an instruction\nF11 steps into an instruction\n";
    workerscript += "F8  continues running\nPress the (||) button at the bottom to enable pausing whenever an error occurs\n";
    workerscript += "Click on a line number to set or clear a breakpoint\n";
    workerscript += "For more information see: http://code.google.com/chrome/devtools/docs/overview.html\n\n";
    workerscript += "------------------------------------------------------------------------- */\n";
    workerscript += "\n\n// Now press F11 twice to enter your main() function:\n\n";
    workerscript += "debugger;\n";
  }
  workerscript += "return main(" + JSON.stringify(mainParameters) + ");";
  var f = new Function(workerscript);
  OpenJsCad.log.prevLogTime = Date.now();
  var result = f();
  result = OpenJsCad.expandResultObjectArray(result);
  OpenJsCad.checkResult(result);
  return result;
};

// callback: should be function(error, csg)
OpenJsCad.parseJsCadScriptASync = function(script, mainParameters, options, callback) {
  var baselibraries = [
    "lib/openjscad/src/csg.js",
    "lib/openjscad/src/openjscad.js"
  ];

  var baseurl = document.location.href.replace(/\?.*$/, '');
  var openjscadurl = baseurl;
  console.log('URL ' + openjscadurl);
  if (typeof options['openJsCadPath'] != 'undefined') {
    // trailing '/' indicates it is a folder. This is necessary because makeAbsoluteUrl is called
    // on openjscadurl
    openjscadurl = OpenJsCad.makeAbsoluteUrl(options['openJsCadPath'], baseurl) + '/';
    console.log('URL ' + openjscadurl);
  }

  var libraries = [];
  if (typeof options['libraries'] != 'undefined') {
    libraries = options['libraries'];
  }

  var workerscript = "";
  workerscript += script;
  workerscript += "\n\n\n\n//// The following code is added by OpenJsCad:\n";
  workerscript += "var _csg_baselibraries=" + JSON.stringify(baselibraries) + ";\n";
  workerscript += "var _csg_libraries=" + JSON.stringify(libraries) + ";\n";
  workerscript += "var _csg_baseurl=" + JSON.stringify(baseurl) + ";\n";
  workerscript += "var _csg_openjscadurl=" + JSON.stringify(openjscadurl) + ";\n";
  workerscript += "var _csg_makeAbsoluteURL=" + OpenJsCad.makeAbsoluteUrl.toString() + ";\n";
  workerscript += "_csg_baselibraries = _csg_baselibraries.map(function(l){return _csg_makeAbsoluteURL(l,_csg_openjscadurl);});\n";
  workerscript += "_csg_libraries = _csg_libraries.map(function(l){return _csg_makeAbsoluteURL(l,_csg_baseurl);});\n";
  workerscript += "_csg_baselibraries.map(function(l){importScripts(l)});\n";
  workerscript += "_csg_libraries.map(function(l){importScripts(l)});\n";
  workerscript += "self.addEventListener('message', function(e) {if(e.data && e.data.cmd == 'render'){";
  workerscript += "  OpenJsCad.runMainInWorker(" + JSON.stringify(mainParameters) + ");";
  workerscript += "}},false);\n";

  var blobURL = OpenJsCad.textToBlobUrl(workerscript);

  if (!window.Worker) throw new Error("Your browser doesn't support Web Workers. Please try the Chrome browser instead.");
  var worker = new Worker(blobURL);
  worker.onmessage = function(e) {
    if (e.data) {
      if (e.data.cmd == 'rendered') {
        var resulttype = e.data.result.class;
        var result = OpenJsCad.resultFromCompactBinary(e.data.result);
        callback(null, result);
      } else if (e.data.cmd == "error") {
        callback(e.data.err, null);
      } else if (e.data.cmd == "log") {
        console.log(e.data.txt);
      }
    }
  };
  worker.onerror = function(e) {
    var errtxt = "Error in line " + e.lineno + ": " + e.message;
    callback(errtxt, null);
  };
  worker.postMessage({
    cmd: "render"
  }); // Start the worker.
  return worker;
};

OpenJsCad.getWindowURL = function() {
  if (window.URL) return window.URL;
  else if (window.webkitURL) return window.webkitURL;
  else throw new Error("Your browser doesn't support window.URL");
};

OpenJsCad.textToBlobUrl = function(txt) {
  var windowURL = OpenJsCad.getWindowURL();
  var blob = new Blob([txt], {
    type: 'application/javascript'
  });
  var blobURL = windowURL.createObjectURL(blob);
  if (!blobURL) throw new Error("createObjectURL() failed");
  return blobURL;
};

OpenJsCad.revokeBlobUrl = function(url) {
  if (window.URL) window.URL.revokeObjectURL(url);
  else if (window.webkitURL) window.webkitURL.revokeObjectURL(url);
  else throw new Error("Your browser doesn't support window.URL");
};

OpenJsCad.FileSystemApiErrorHandler = function(fileError, operation) {
  var errormap = {
    1: 'NOT_FOUND_ERR',
    2: 'SECURITY_ERR',
    3: 'ABORT_ERR',
    4: 'NOT_READABLE_ERR',
    5: 'ENCODING_ERR',
    6: 'NO_MODIFICATION_ALLOWED_ERR',
    7: 'INVALID_STATE_ERR',
    8: 'SYNTAX_ERR',
    9: 'INVALID_MODIFICATION_ERR',
    10: 'QUOTA_EXCEEDED_ERR',
    11: 'TYPE_MISMATCH_ERR',
    12: 'PATH_EXISTS_ERR',
  };
  var errname;
  if (fileError.code in errormap) {
    errname = errormap[fileError.code];
  } else {
    errname = "Error #" + fileError.code;
  }
  var errtxt = "FileSystem API error: " + operation + " returned error " + errname;
  throw new Error(errtxt);
};

OpenJsCad.AlertUserOfUncaughtExceptions = function() {
  window.onerror = function(message, url, line) {
    message = message.replace(/^Uncaught /i, "");
    //alert(message+"\n\n("+url+" line "+line+")");
    console.log(message + "\n\n(" + url + " line " + line + ")");
  };
};

// parse the jscad script to get the parameter definitions
OpenJsCad.getParamDefinitions = function(script) {
  var scriptisvalid = true;
  try {
    // first try to execute the script itself
    // this will catch any syntax errors
    var f = new Function(script);
    f();
  } catch (e) {
    scriptisvalid = false;
  }
  var params = [];
  if (scriptisvalid) {
    var script1 = "if(typeof(getParameterDefinitions) == 'function') {return getParameterDefinitions();} else {return [];} ";
    script1 += script;
    var f = new Function(script1);
    params = f();
    if ((typeof(params) != "object") || (typeof(params.length) != "number")) {
      throw new Error("The getParameterDefinitions() function should return an array with the parameter definitions");
    }
  }
  return params;
};

/**
 * options parameter:
 * - drawLines: display wireframe lines
 * - drawFaces: display surfaces
 * - bgColor: canvas background color
 * - color: object color
 * - viewerwidth, viewerheight: set rendering size. Works with any css unit.
 *     viewerheight can also be specified as a ratio to width, ie number e (0, 1]
 * - noWebGL: force render without webGL
 * - verbose: show additional info (currently only time used for rendering)
 */
OpenJsCad.Processor = function(containerdiv, options, onchange) {
  this.containerdiv = containerdiv;
  this.options = options = options || {};
  this.onchange = onchange;

  // Draw black triangle lines ("wireframe")
  this.options.drawLines = !!this.cleanOption(options.drawLines, false);
  // Draw surfaces
  this.options.drawFaces = !!this.cleanOption(options.drawFaces, true);
  // verbose output
  this.options.verbose = !!this.cleanOption(options.verbose, true);

  // default applies unless sizes specified in options
  this.widthDefault = "565px";
  this.heightDefault = "300px";

  this.viewerdiv = null;
  this.viewer = null;

  this.viewerSize = {
    widthDefault: this.widthDefault,
    heightDefault: this.heightDefault,
    width: this.options.viewerwidth,
    height: this.options.viewerheight,
    heightratio: this.options.viewerheightratio
  };
  // this.viewerwidth = this.options.viewerwidth || "800px";
  // this.viewerheight = this.options.viewerheight || "600px";
  this.processing = false;
  this.currentObject = null;
  this.hasValidCurrentObject = false;
  this.hasOutputFile = false;
  this.worker = null;
  this.paramDefinitions = [];
  this.paramControls = [];
  this.script = null;
  this.hasError = false;
  this.debugging = false;
  this.createElements();
};

OpenJsCad.Processor.convertToSolid = function(obj) {
  if ((typeof(obj) == "object") && ((obj instanceof CAG))) {
    // convert a 2D shape to a thin solid:
    obj = obj.extrude({
      offset: [0, 0, 0.1]
    });
  } else if ((typeof(obj) == "object") && ((obj instanceof CSG))) {
    // obj already is a solid
  } else {
    throw new Error("Cannot convert to solid");
  }
  return obj;
};

OpenJsCad.Processor.prototype = {
  cleanOption: function(option, deflt) {
    return typeof option != "undefined" ? option : deflt;
  },
  // pass "faces" or "lines"
  toggleDrawOption: function(str) {
    if (str == 'faces' || str == 'lines') {
      var newState = !this.viewer.drawOptions[str];
      this.setDrawOption(str, newState);
      return newState;
    }
  },
  // e.g. setDrawOption('lines', false);
  setDrawOption: function(str, bool) {
    if (str == 'faces' || str == 'lines') {
      this.viewer.drawOptions[str] = !!bool;
    }
    this.viewer.applyDrawOptions();
  },

  handleResize: function() {
    this.viewer && (this.viewer.handleResize());
  },

  createElements: function() {
    var that = this; //for event handlers

    while (this.containerdiv.children.length > 0) {
      this.containerdiv.removeChild(this.containerdiv.children[0]);
    }

    var viewerdiv = document.createElement("div");
    viewerdiv.className = "viewer";
    this.containerdiv.appendChild(viewerdiv);
    this.viewerdiv = viewerdiv;
    this.viewer = new OpenJsCad.Viewer(this.viewerdiv, this.viewerSize, this.options);
    this.errordiv = document.createElement("div");
    this.errordiv.className = "well";
    this.errorpre = document.createElement("pre");
    this.errordiv.appendChild(this.errorpre);
    this.statusdiv = document.createElement("div");
    //this.statusdiv.className = "statusdiv";
    this.statusdiv.className = "well";
    // surface/line draw
    this.controldiv = document.createElement("div");
    this.controldiv.style.cssText = 'display:none;';
    var this_ = this;
    [
      ['faces', 'surfaces', this.options.drawFaces],
      ['lines', 'lines', this.options.drawLines]
    ].forEach(function(tup) {
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'cb_' + tup[0];
      cb.checked = tup[2];
      cb.addEventListener('click', function() {
        this.checked = this_.toggleDrawOption(tup[0])
      });
      var lb = document.createElement('label');
      lb.htmlFor = "cb_" + tup[0];
      lb.appendChild(document.createTextNode(tup[1] + "  "));
      [cb, lb].forEach(function(ui) {
        this.controldiv.appendChild(ui)
      }, this);
    }, this);
    this.statusspan = document.createElement("span");

    this.statusbuttons = document.createElement("div");
    this.statusbuttons.style.float = "right";
    this.statusdiv.appendChild(this.statusspan);
    this.statusdiv.appendChild(this.statusbuttons);
    this.statusdiv.appendChild(this.controldiv);
    this.abortbutton = document.createElement("button");
    this.abortbutton.innerHTML = "Abort";
    this.abortbutton.onclick = function(e) {
      that.abort();
    };
    this.statusbuttons.appendChild(this.abortbutton);

    this.renderedElementDropdown = document.createElement("select");
    this.renderedElementDropdown.onchange = function(e) {
      that.setSelectedObjectIndex(that.renderedElementDropdown.selectedIndex);
    };
    this.renderedElementDropdown.style.display = "none";
    this.statusbuttons.appendChild(this.renderedElementDropdown);

    this.formatDropdown = document.createElement("select");
    this.formatDropdown.onchange = function(e) {
      that.currentFormat = that.formatDropdown.options[that.formatDropdown.selectedIndex].value;
      that.updateDownloadLink();
    };
    this.statusbuttons.appendChild(this.formatDropdown);
    this.generateOutputFileButton = document.createElement("button");
    this.generateOutputFileButton.onclick = function(e) {
      that.generateOutputFile();
    };
    this.statusbuttons.appendChild(this.generateOutputFileButton);
    this.downloadOutputFileLink = document.createElement("a");
    this.statusbuttons.appendChild(this.downloadOutputFileLink);
    this.parametersdiv = document.createElement("div");
    this.parametersdiv.className = "parametersdiv";
    var headerdiv = document.createElement("div");
    headerdiv.textContent = "Parameters:";
    headerdiv.className = "header";
    this.parametersdiv.appendChild(headerdiv);
    this.parameterstable = document.createElement("table");
    this.parameterstable.className = "parameterstable";
    this.parametersdiv.appendChild(this.parameterstable);
    var parseParametersButton = document.createElement("button");
    parseParametersButton.style.cssText = 'margin: 10px;';
    parseParametersButton.className = "button";
    parseParametersButton.innerHTML = "<i></i>Update and Preview...";
    parseParametersButton.onclick = function(e) {
      //that.generateOutputFile();
      that.rebuildSolid();
    };
    this.parametersdiv.appendChild(parseParametersButton);
    this.parametersdiv.appendChild(parseParametersButton);
    this.enableItems();
    this.containerdiv.appendChild(this.statusdiv);
    this.containerdiv.appendChild(this.errordiv);
    this.containerdiv.appendChild(this.parametersdiv);
    this.clearViewer();
  },

  getFilenameForRenderedObject: function() {
    var filename = this.filename;
    if (!filename) filename = "openjscad";
    var index = this.renderedElementDropdown.selectedIndex;
    if (index >= 0) {
      var renderedelement = this.currentObjects[index];
      if ('name' in renderedelement) {
        filename = renderedelement.name;
      } else {
        filename += "_" + (index + 1);
      }
    }
    return filename;
  },

  setRenderedObjects: function(obj) {
    // if obj is a single CSG or CAG, convert to the array format:
    if (obj === null) {
      obj = [];
    } else {
      if (!(obj instanceof Array)) {
        obj = [{
          data: obj,
        }, ];
      }
    }
    this.currentObjects = obj;
    while (this.renderedElementDropdown.options.length > 0) this.renderedElementDropdown.options.remove(0);

    for (var i = 0; i < obj.length; ++i) {
      var renderedelement = obj[i];
      var caption;
      if ('caption' in renderedelement) {
        caption = renderedelement.caption;
      } else if ('name' in renderedelement) {
        caption = renderedelement.name;
      } else {
        caption = "Element #" + (i + 1);
      }
      var option = document.createElement("option");
      option.appendChild(document.createTextNode(caption));
      this.renderedElementDropdown.options.add(option);
    }
    this.renderedElementDropdown.style.display = (obj.length >= 2) ? "inline" : "none";
    this.setSelectedObjectIndex((obj.length > 0) ? 0 : -1);
  },

  setSelectedObjectIndex: function(index) {
    this.clearOutputFile();
    this.renderedElementDropdown.selectedIndex = index;
    var obj;
    if (index < 0) {
      obj = null;
    } else {
      obj = this.currentObjects[index].data;
    }
    this.currentObjectIndex = index;
    this.currentObject = obj;

    while (this.formatDropdown.options.length > 0)
      this.formatDropdown.options.remove(0);

    if (obj !== null) {
      var csg = OpenJsCad.Processor.convertToSolid(obj);
      // // reset zoom unless toggling between valid objects
      // this.viewer.setCsg(csg, !this.hasValidCurrentObject);
      this.isFirstRender_ = typeof this.isFirstRender_ == 'undefined' ? true : false;
      // (re-)set zoom only on very first rendering action
      this.viewer.setCsg(csg, this.isFirstRender_);
      this.hasValidCurrentObject = true;

      this.supportedFormatsForCurrentObject().forEach(function(format) {
        var option = document.createElement("option");
        option.setAttribute("value", format);
        option.appendChild(document.createTextNode(this.formatInfo(format).displayName));
        this.formatDropdown.options.add(option);
      }, this);

      this.updateDownloadLink();

    } else {
      this.viewer.clear();
      this.hasValidCurrentObject = false;
    }


  },

  selectedFormat: function() {
    return this.formatDropdown.options[this.formatDropdown.selectedIndex].value;
  },

  selectedFormatInfo: function() {
    return this.formatInfo(this.selectedFormat());
  },

  updateDownloadLink: function() {
    var ext = this.selectedFormatInfo().extension;
    this.generateOutputFileButton.innerHTML = "Generate " + ext.toUpperCase();
  },

  clearViewer: function() {
    this.clearOutputFile();
    this.setRenderedObjects(null);
    this.hasValidCurrentObject = false;
    this.enableItems();
  },

  abort: function() {
    if (this.processing) {
      //todo: abort
      this.processing = false;
      this.statusspan.innerHTML = "Aborted.";
      this.worker.terminate();
      this.enableItems();
      if (this.onchange) this.onchange();
    }
  },

  enableItems: function() {
    this.abortbutton.style.display = this.processing ? "inline" : "none";
    this.formatDropdown.style.display = ((!this.hasOutputFile) && (this.hasValidCurrentObject)) ? "inline" : "none";
    this.generateOutputFileButton.style.display = ((!this.hasOutputFile) && (this.hasValidCurrentObject)) ? "inline" : "none";
    this.downloadOutputFileLink.style.display = this.hasOutputFile ? "inline" : "none";
    this.parametersdiv.style.display = (this.paramControls.length > 0) ? "block" : "none";
    this.errordiv.style.display = this.hasError ? "block" : "none";
    this.statusdiv.style.display = this.hasError ? "none" : "block";
  },

  setOpenJsCadPath: function(path) {
    this.options['openJsCadPath'] = path;
  },

  addLibrary: function(lib) {
    if (typeof this.options['libraries'] == 'undefined') {
      this.options['libraries'] = [];
    }
    this.options['libraries'].push(lib);
  },

  setError: function(txt) {
    this.hasError = (txt != "");
    this.errorpre.textContent = txt;
    this.enableItems();
  },

  setDebugging: function(debugging) {
    this.debugging = debugging;
  },

  // script: javascript code
  // filename: optional, the name of the .jscad file
  setJsCad: function(script, filename) {
    if (!filename) filename = "openjscad.jscad";
    filename = filename.replace(/\.jscad$/i, "");
    this.abort();
    this.clearViewer();
    this.paramDefinitions = [];
    this.paramControls = [];
    this.script = null;
    this.setError("");
    var scripthaserrors = false;
    try {
      this.paramDefinitions = OpenJsCad.getParamDefinitions(script);
      this.createParamControls();
    } catch (e) {
      this.setError(e.toString());
      this.statusspan.innerHTML = "Error.";
      scripthaserrors = true;
    }
    if (!scripthaserrors) {
      this.script = script;
      this.filename = filename;
      this.rebuildSolid();
    } else {
      this.enableItems();
      if (this.onchange) this.onchange();
    }
  },

  getParamValues: function() {
    var paramValues = {};
    for (var i = 0; i < this.paramDefinitions.length; i++) {
      var paramdef = this.paramDefinitions[i];
      var type = "text";
      if ('type' in paramdef) {
        type = paramdef.type;
      }
      var control = this.paramControls[i];
      var value;
      if ((type == "text") || (type == "longtext") || (type == "float") || (type == "int")) {
        value = control.value;
        if ((type == "float") || (type == "int")) {
          var isnumber = !isNaN(parseFloat(value)) && isFinite(value);
          if (!isnumber) {
            throw new Error("Not a number: " + value);
          }
          if (type == "int") {
            value = parseInt(value, 10);
          } else {
            value = parseFloat(value);
          }
        }
      } else if (type == "choice") {
        value = control.options[control.selectedIndex].value;
      } else if (type == "bool") {
        value = control.checked;
      }
      paramValues[paramdef.name] = value;
    }
    return paramValues;
  },

  rebuildSolid: function() {
    this.abort();
    this.setError("");
    this.clearViewer();
    this.processing = true;
    this.statusspan.innerHTML = "Processing, please wait...";
    this.enableItems();
    var that = this;
    var paramValues = this.getParamValues();
    var useSync = this.debugging;
    var options = {};
    var startTime = Date.now();

    if (!useSync) {
      this.worker = OpenJsCad.parseJsCadScriptASync(this.script, paramValues, this.options, function(err, obj) {
        that.processing = false;
        that.worker.terminate();
        that.worker = null;
        if (err) {
          that.setError(err);
          that.statusspan.innerHTML = "Error.";
        } else {
          that.setRenderedObjects(obj);
          var currentTime = Date.now();
          var elapsed = (currentTime - startTime);
          that.statusspan.innerHTML = "Ready." + (that.options.verbose ?
            "  Rendered in " + elapsed + "ms" : "");
        }
        that.generateOutputFile();
        that.enableItems();
        if (that.onchange) that.onchange();
      });
    } else {
      try {
        var obj = OpenJsCad.parseJsCadScriptSync(this.script, paramValues, this.debugging);
        that.setRenderedObjects(obj);
        that.processing = false;
        that.statusspan.innerHTML = "Ready.";
      } catch (e) {
        that.processing = false;
        var errtxt = e.toString();
        if (e.stack) {
          errtxt += '\nStack trace:\n' + e.stack;
        }
        that.setError(errtxt);
        that.statusspan.innerHTML = "Error.";
      }
      that.enableItems();
      if (that.onchange) that.onchange();
    }
  },

  hasSolid: function() {
    return this.hasValidCurrentObject;
  },

  isProcessing: function() {
    return this.processing;
  },

  clearOutputFile: function() {
    if (this.hasOutputFile) {
      this.hasOutputFile = false;
      if (this.outputFileDirEntry) {
        this.outputFileDirEntry.removeRecursively(function() {});
        this.outputFileDirEntry = null;
      }
      if (this.outputFileBlobUrl) {
        OpenJsCad.revokeBlobUrl(this.outputFileBlobUrl);
        this.outputFileBlobUrl = null;
      }
      this.enableItems();
      if (this.onchange) this.onchange();
    }
  },

  generateOutputFile: function() {
    this.clearOutputFile();
    console.log('Generating Output');
    document.getElementById('dxf').value = '';
    if (this.hasValidCurrentObject) {
      try {
        this.generateOutputFileFileSystem();
      } catch (e) {
        this.generateOutputFileBlobUrl();
      }
    }
  },

  currentObjectToBlob: function() {
    console.log('Object to Blob');
    var format = this.selectedFormat();

    var blob;
    if (format == "stl") {
      blob = this.currentObject.fixTJunctions().toStlBinary();
    } else if (format == "x3d") {
      blob = this.currentObject.fixTJunctions().toX3D();
    } else if (format == "dxf") {
      blob = this.currentObject.toDxf();
    } else {
      throw new Error("Not supported");
    }
    return blob;
  },

  supportedFormatsForCurrentObject: function() {
    if (this.currentObject instanceof CSG) {
      return ["stl", "x3d"];
    } else if (this.currentObject instanceof CAG) {
      return ["dxf"];
    } else {
      throw new Error("Not supported");
    }
  },

  formatInfo: function(format) {
    return {
      stl: {
        displayName: "STL",
        extension: "stl",
        mimetype: "application/sla",
      },
      x3d: {
        displayName: "X3D",
        extension: "x3d",
        mimetype: "model/x3d+xml",
      },
      dxf: {
        displayName: "DXF",
        extension: "dxf",
        mimetype: "application/dxf",
      }
    }[format];
  },

  downloadLinkTextForCurrentObject: function() {
    var ext = this.selectedFormatInfo().extension;
    return "Download " + ext.toUpperCase();
  },

  generateOutputFileBlobUrl: function() {
    console.log('OutputFileBlob');
    var blob = this.currentObjectToBlob();
    var windowURL = OpenJsCad.getWindowURL();
    this.outputFileBlobUrl = windowURL.createObjectURL(blob)
    if (!this.outputFileBlobUrl) throw new Error("createObjectURL() failed");
    this.hasOutputFile = true;
    this.downloadOutputFileLink.href = this.outputFileBlobUrl;
    this.downloadOutputFileLink.innerHTML = this.downloadLinkTextForCurrentObject();
    var ext = this.selectedFormatInfo().extension;
    this.downloadOutputFileLink.setAttribute("download", "openjscad." + ext);
    this.enableItems();
    if (this.onchange) this.onchange();
  },

  generateOutputFileFileSystem: function() {
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    if (!window.requestFileSystem) {
      throw new Error("Your browser does not support the HTML5 FileSystem API. Please try the Chrome browser instead.");
    }
    // create a random directory name:
    var dirname = "OpenJsCadOutput1_" + parseInt(Math.random() * 1000000000, 10) + "." + extension;
    var extension = this.selectedFormatInfo().extension;
    var filename = this.getFilenameForRenderedObject() + "." + extension;
    var that = this;
    window.requestFileSystem(TEMPORARY, 20 * 1024 * 1024, function(fs) {
        fs.root.getDirectory(dirname, {
            create: true,
            exclusive: true
          }, function(dirEntry) {
            that.outputFileDirEntry = dirEntry;
            dirEntry.getFile(filename, {
                create: true,
                exclusive: true
              }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function(e) {
                      that.hasOutputFile = true;
                      that.downloadOutputFileLink.href = fileEntry.toURL();
                      that.downloadOutputFileLink.type = that.selectedFormatInfo().mimetype;
                      that.downloadOutputFileLink.innerHTML = that.downloadLinkTextForCurrentObject();
                      that.downloadOutputFileLink.setAttribute("download", fileEntry.name);
                      that.enableItems();
                      if (that.onchange) that.onchange();
                    };
                    fileWriter.onerror = function(e) {
                      throw new Error('Write failed: ' + e.toString());
                    };
                    var blob = that.currentObjectToBlob();
                    fileWriter.write(blob);
                  },
                  function(fileerror) {
                    OpenJsCad.FileSystemApiErrorHandler(fileerror, "createWriter");
                  }
                );
              },
              function(fileerror) {
                OpenJsCad.FileSystemApiErrorHandler(fileerror, "getFile('" + filename + "')");
              }
            );
          },
          function(fileerror) {
            OpenJsCad.FileSystemApiErrorHandler(fileerror, "getDirectory('" + dirname + "')");
          }
        );
      },
      function(fileerror) {
        OpenJsCad.FileSystemApiErrorHandler(fileerror, "requestFileSystem");
      }
    );
  },

  createParamControls: function() {
    this.parameterstable.innerHTML = "";
    this.paramControls = [];
    var paramControls = [];
    var tablerows = [];
    for (var i = 0; i < this.paramDefinitions.length; i++) {
      var errorprefix = "Error in parameter definition #" + (i + 1) + ": ";
      var paramdef = this.paramDefinitions[i];
      if (!('name' in paramdef)) {
        throw new Error(errorprefix + "Should include a 'name' parameter");
      }
      var type = "text";
      if ('type' in paramdef) {
        type = paramdef.type;
      }
      if ((type !== "text") && (type !== "int") && (type !== "float") && (type !== "choice") && (type !== "longtext") && (type !== "bool")) {
        throw new Error(errorprefix + "Unknown parameter type '" + type + "'");
      }
      var initial;
      if ('initial' in paramdef) {
        initial = paramdef.initial;
      } else if ('default' in paramdef) {
        initial = paramdef['default'];
      }
      var control;
      if ((type == "text") || (type == "int") || (type == "float")) {
        control = document.createElement("input");
        control.type = "text";
        if (initial !== undefined) {
          control.value = initial;
        } else {
          if ((type == "int") || (type == "float")) {
            control.value = "0";
          } else {
            control.value = "";
          }
        }
      } else if (type == "choice") {
        if (!('values' in paramdef)) {
          throw new Error(errorprefix + "Should include a 'values' parameter");
        }
        control = document.createElement("select");
        var values = paramdef.values;
        var captions;
        if ('captions' in paramdef) {
          captions = paramdef.captions;
          if (captions.length != values.length) {
            throw new Error(errorprefix + "'captions' and 'values' should have the same number of items");
          }
        } else {
          captions = values;
        }
        var selectedindex = 0;
        for (var valueindex = 0; valueindex < values.length; valueindex++) {
          var option = document.createElement("option");
          option.value = values[valueindex];
          option.text = captions[valueindex];
          control.add(option);
          if (initial !== undefined) {
            if (initial == values[valueindex]) {
              selectedindex = valueindex;
            }
          }
        }
        if (values.length > 0) {
          control.selectedIndex = selectedindex;
        }
      } else if (type == "longtext") {
        control = document.createElement("textarea");
        if (initial !== undefined) {
          control.value = initial;
        } else {
          control.value = "";
        }
      } else if (type == "bool") {
        control = document.createElement("input");
        control.type = "checkbox";
        if (initial !== undefined) {
          if (typeof(initial) != "boolean") {
            throw new Error(errorprefix + "initial/default of type 'bool' has to be boolean (true/false)");
          }
          control.checked = initial;
        } else {
          control.checked = false;
        }
      }
      paramControls.push(control);
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      var label = paramdef.name + ":";
      if ('caption' in paramdef) {
        label = paramdef.caption;
      }
      if ('visible' in paramdef) {
        tr.style.display = (paramdef.visible) ? "table-row" : "none";
      }

      td.innerHTML = label;
      tr.appendChild(td);
      td = document.createElement("td");
      td.appendChild(control);
      tr.appendChild(td);
      tablerows.push(tr);
    }
    var that = this;
    tablerows.map(function(tr) {
      that.parameterstable.appendChild(tr);
    });
    this.paramControls = paramControls;
  },
};