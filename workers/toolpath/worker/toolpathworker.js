if(typeof window == "undefined"){ // Only run as worker
  var minimumToolDiaForPreview = 0.04;
  var insideCutsColor = 0x660000;
  var outsideCutsColor = 0x000066;
  var pocketColor = 0x006600;
  var toolpathColor = 0x666600;

  self.addEventListener('message', function(e) {
    console.log("New message received by worker", e.data.data.length)
    importScripts("/lib/clipperjs/clipper_unminified.js");
    importScripts("/lib/threejs/three.min.js");

    var toolpaths = JSON.parse(e.data.data);
    getToolpaths(toolpaths)
    console.log(toolpaths)

    self.postMessage(JSON.stringify(getToolpaths(toolpaths)));
  }, false);


function getToolpaths(toolpaths) {
  // Process Them
  var pretties = []
  console.log("Processing " + toolpaths.length + " toolpaths")
  var loader = new THREE.ObjectLoader();
  for (i=0; i<toolpaths.length; i++) {
    var toolpath = loader.parse(toolpaths[i]);
    config = {
      toolpath: toolpath,
      repair: false,
      union: toolpath.userData.camUnion,
      offset: toolpath.userData.camToolDia / 2,
      zstart: toolpath.userData.camZStart,
      zstep: toolpath.userData.camZStep,
      zdepth: toolpath.userData.camZDepth
    };
    var operation = toolpath.userData.camOperation;

    if (!operation) {
      // No Op
    } else if (operation == "... Select Operation ...") {
      console.log("No operation");
    } else if (operation == "Laser: Vector (no path offset)") {
      console.log("Laser: Vector (no path offset)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Laser: Vector (path inside)") {
      console.log("Laser: Vector (path inside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Laser: Vector (path outside)") {
      console.log("Laser: Vector (path outside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Laser: Vector (raster fill) (Beta)") {
      console.log("Laser: Vector (raster fill) (Beta)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "CNC: Vector (no offset)") {
      console.log("CNC: Vector (no offset)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "CNC: Vector (path inside)") {
      console.log("CNC: Vector (path inside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "CNC: Vector (path outside)") {
      console.log("CNC: Vector (path outside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "CNC: Pocket") {
      console.log("CNC: Pocket");
    } else if (operation == "CNC: V-Engrave") {
      console.log("CNC: V-Engrave");
      // no op yet
    } else if (operation == "Plasma: Vector (path outside)") {
      console.log("Plasma: Vector (path outside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Plasma: Vector (path inside)") {
      console.log("Plasma: Vector (path inside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Plasma: Mark") {
      console.log("Plasma: Mark");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Plasma: Vector (no path offset)") {
      console.log("Plasma: Vector (no path offset)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Drag Knife: Cutout") {
      console.log("Drag Knife: Cutout");

    } else if (operation == "Drill: Peck (Centered)") {
      console.log("Drill: Peck (Centered)");

    } else if (operation == "Drill: Continuous (Centered)") {
      console.log("Drill: Continuous (Centered)");

    } else if (operation == "Pen Plotter: (no offset)") {
      console.log("Pen Plotter: (no offset)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Pen Plotter: (path inside)") {
      console.log();
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Pen Plotter: (path outside)") {
      console.log("Pen Plotter: (path outside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    }
    console.log("Finished " + i+ " of " +toolpaths.length)
    pretties.push(toolpath);
  }
  console.log('Finished all the toolpaths')
  return pretties
}


  function workerInflateToolpath(config) {
    var inflateGrpZ = new THREE.Group();
    var prettyGrp = new THREE.Group();
    var clipperPaths = workerGetClipperPaths(config.toolpath)
    if (config.repair) {
      clipperPaths = repairClipperPath(clipperPaths);
    }
    if (config.union == "Yes") {
      clipperPaths = workerSimplifyPolygons(clipperPaths);
    }
    if (config.offset != 0) {
      var inflatedPaths = workerGetInflatePath(clipperPaths, config.offset);
    } else {
      var inflatedPaths = clipperPaths;
    }
    if (config.direction == "Climb") {
      // reverse here
      if (config.offset > 0) {
        for (k = 0; k < inflatedPaths.length; k++) {
          inflatedPaths[k].reverse();
        }
      }
    } else if (config.direction == "Conventional") {
      if (config.offset < 0) {
        for (k = 0; k < inflatedPaths.length; k++) {
          inflatedPaths[k].reverse();
        }
      }
    }

    for (i = config.zstart + config.zstep; i < config.zdepth + config.zstep; i += config.zstep) {
      if (i > config.zdepth) {
        var zval = -config.zdepth;
      } else {
        var zval = -i
      }
      var drawClipperPathsconfig = {
        paths: inflatedPaths,
        color: toolpathColor,
        opacity: 0.8,
        z: zval,
        isClosed: true,
        name: 'inflateGrp',
        leadInPaths: false,
        tabdepth: config.tabdepth,
        tabspace: config.tabspace,
        tabwidth: config.tabwidth,
        toolDia: config.offset * 2,
        drawPretty: true,
        prettyGrpColor: (config.offset < 0) ? insideCutsColor : outsideCutsColor
      }
      var drawings = drawClipperPathsWithTool(drawClipperPathsconfig);
      inflateGrp = drawings.lines;
      inflateGrp.name = 'inflateGrp' + i;
      inflateGrp.userData.material = inflateGrp.material;
      inflateGrpZ.add(inflateGrp);
      if (drawings.pretty) {
        prettyGrp.add(drawings.pretty)
      }
    }
    return inflateGrp
  }



  function workerSimplifyPolygons(paths) {
    console.log('Simplifying: ', paths);
    var scale = 10000;
    ClipperLib.JS.ScaleUpPaths(paths, scale);
    var newClipperPaths = ClipperLib.Clipper.SimplifyPolygons(paths, ClipperLib.PolyFillType.pftEvenOdd);
    ClipperLib.JS.ScaleDownPaths(newClipperPaths, scale);
    ClipperLib.JS.ScaleDownPaths(paths, scale);
    return newClipperPaths;
  };


  function workerGetInflatePath(paths, delta, joinType) {
    console.log('Inflating: ',paths)
    var scale = 10000;
    ClipperLib.JS.Clean(paths, 2);
    ClipperLib.JS.ScaleUpPaths(paths, scale);
    var miterLimit = 3;
    var arcTolerance = 10;
    joinType = joinType ? joinType : ClipperLib.JoinType.jtRound;
    var co = new ClipperLib.ClipperOffset(miterLimit, arcTolerance);
    co.AddPaths(paths, joinType, ClipperLib.EndType.etClosedPolygon);
    var offsetted_paths = new ClipperLib.Paths();
    co.Execute(offsetted_paths, delta * scale);
    // scale back down
    ClipperLib.JS.ScaleDownPaths(offsetted_paths, scale);
    ClipperLib.JS.ScaleDownPaths(paths, scale);
    return offsetted_paths;
  };


  function workerGetClipperPaths(object) {
    console.log('Get Clipper Paths: ',object)
    object.updateMatrix();
    var grp = object;
    var clipperPaths = [];
    grp.traverse(function(child) {
      // console.log('Traverse: ', child)
      if (child.name == "inflatedGroup") {
        console.log("this is the inflated path from a previous run. ignore.");
        return;
      } else if (child.type == "Line") {
        // let's inflate the path for this line. it may not be closed
        // so we need to check that.
        var clipperArr = [];
        // Fix world Coordinates
        for (j = 0; j < child.geometry.vertices.length; j++) {
          var localPt = child.geometry.vertices[j];
          var worldPt = child.localToWorld(localPt.clone());
          var xpos = worldPt.x; // + (sizexmax /2);
          var ypos = worldPt.y; // + (sizeymax /2);

          var xpos_offset = (parseFloat(child.position.x.toFixed(3)));
          var ypos_offset = (parseFloat(child.position.y.toFixed(3)));

          if (child.geometry.type == "CircleGeometry") {
            xpos = (xpos + xpos_offset);
            ypos = (ypos + ypos_offset);
          }
          clipperArr.push({
            X: xpos,
            Y: ypos
          });
        }
        clipperPaths.push(clipperArr);
      } else {
        // console.log("type of ", child.type, " being skipped");
      }
    });
    return clipperPaths
  }

  drawClipperPaths = function(config) {
    if (config.leadInPaths) {
      if (config.leadInPaths.length != config.paths.length) {
        console.log("Skipping lead-in: Source vector file is broken, and we could not produce a reliable offset")
        printLog('Skipping lead-in: Source vector file is broken, and we could not produce a reliable offset', warncolor, "settings");
      }
    }
    // console.log("Compare lead-in: " + paths.length + " / " + leadInPaths.length)

    var lineUnionMat = new THREE.LineBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: config.opacity,
    });

    if (config.z === undefined || config.z == null)
      config.z = 0;

    if (config.isClosed === undefined || config.isClosed == null)
      config.isClosed = true;

    var group = new THREE.Object3D();


    if (config.name) group.name = config.name;

    for (var i = 0; i < config.paths.length; i++) {
      var lineUnionGeo = new THREE.Geometry();
      if (config.leadInPaths) {
        if (leadInPaths.length == paths.length) {
          lineUnionGeo.vertices.push(new THREE.Vector3(config.leadInPaths[i][0].X, config.leadInPaths[i][0].Y, z));
        }
      }
      var totalDist = 0;
      var lastTabPos = -config.tabspace;
      var lastvert = {
        x: 0,
        y: 0,
        z: 0
      }
      var lastTabPos = -config.tabspace;
      for (var j = 0; j < config.paths[i].length; j++) {
        // console.log(j)
        totalDist += distanceFormula(lastvert.x, config.paths[i][j].X, lastvert.y, config.paths[i][j].Y)
        if (totalDist > (lastTabPos + config.tabspace) && config.z < config.tabdepth) {
          if (config.z < -config.tabdepth && j < config.paths[i].length - 1) {
            // console.log(i, j)
            var d = distanceFormula(config.paths[i][j].X, config.paths[i][j + 1].X, config.paths[i][j].Y, config.paths[i][j + 1].Y)
            if (d >= (config.toolDia + config.tabwidth)) {
              var numTabs = Math.round(d / (config.tabspace + config.tabwidth));
              // if we have a line distance of 100
              // and 3 tabs (width 10) in that line per numTabs
              // then we want to evenly space them
              // so we divide the line distance by numTabs
              var spacePerTab = d / numTabs;
              // which in this example would be 33.33~
              // then in each space per tab we need to center the tab
              // which means dividing the difference of the spacePerTab and tabWidth by 2
              var tabPaddingPerSpace = (spacePerTab - (config.tabwidth + config.toolDia)) / 2;

              // console.log("Adding tab")
              // next point
              var deltaX = config.paths[i][j + 1].X - config.paths[i][j].X;
              var deltaY = config.paths[i][j + 1].Y - config.paths[i][j].Y;

              // get the line angle
              var ang = Math.atan2(deltaY, deltaX);
              // console.log('  ANGLE ' + (ang * 180 / Math.PI));

              // convert it to degrees for later math with addDegree
              ang = ang * 180 / Math.PI;

              lastTabPos = totalDist;
              var npt = [config.paths[i][j].X, config.paths[i][j].Y]
              for (var r = 0; r < numTabs; r++) {
                // then for each tab
                // add another point at the current point +tabPaddingPerSpace
                npt = newPointFromDistanceAndAngle(npt, ang, tabPaddingPerSpace);
                // g += 'G1' + feedrate + ' X' + npt[0] + ' Y' + npt[1] + '\n';
                lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.z));
                // then we raise the z height by config.tabHeight
                lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.tabdepth));
                // g += 'G0 Z' + tabsBelowZ + '\n';
                // then add another point at the current point +tabWidth
                npt = newPointFromDistanceAndAngle(npt, ang, config.tabwidth + config.toolDia);
                lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.tabdepth));
                // g += 'G0' + feedrate + ' X' + npt[0] + ' Y' + npt[1] + '\n';
                // then lower the z height back to zPos at plunge speed
                // g += 'G0 F' + plungeSpeed + ' Z' + tabsBelowZ + '\n';
                // g += 'G1 F' + plungeSpeed + ' Z' + zpos + '\n';
                lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.z));
                // then add another point at the current point +tabPaddingPerSpace
                // with the cut speed
                npt = newPointFromDistanceAndAngle(npt, ang, tabPaddingPerSpace);
                lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.z));
                // g += 'G1' + feedrate + ' X' + npt[0] + ' Y' + npt[1] + '\n';
              }
            } else {
              lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][j].X, config.paths[i][j].Y, config.z));
            }
          } else {
            lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][j].X, config.paths[i][j].Y, config.vz));
          }
        } else {
          lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][j].X, config.paths[i][j].Y, config.z));
        }
        // lineUnionGeo.vertices.push(new THREE.Vector3(paths[i][j].X, paths[i][j].Y, z));
        lastvert = {
          x: config.paths[i][j].X,
          y: config.paths[i][j].Y,
          z: config.z
        }
      }
      // close it by connecting last point to 1st point
      if (config.isClosed) {
        lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][0].X, config.paths[i][0].Y, config.z));
      }
      if (config.leadInPaths) {
        if (leadInPaths.length == paths.length) {
          lineUnionGeo.vertices.push(new THREE.Vector3(config.leadInPaths[i][0].X, config.leadInPaths[i][0].Y, config.z));
        }
      }

      var lineUnion = new THREE.Line(lineUnionGeo, lineUnionMat);
      if (config.name) {
        lineUnion.name = config.name;
      }
      group.add(lineUnion);
    }
    return group;
  };

  drawClipperPathsWithTool = function(config) {
    var group = new THREE.Object3D();
    // console.log(config)
    if (config.leadInPaths) {
      if (config.leadInPaths.length != config.paths.length) {
        console.log("Skipping lead-in: Source vector file is broken, and we could not produce a reliable offset")
        printLog('Skipping lead-in: Source vector file is broken, and we could not produce a reliable offset', warncolor, "settings");
      }
    }

    var lineUnionMat = new THREE.LineBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: config.opacity,
    });

    if (config.z === undefined || config.z == null || config.z == false)
      config.z = 0;

    if (config.isClosed === undefined || config.isClosed == null)
      config.isClosed = true;

    if (config.name) group.name = config.name;

    if (config.toolDia < 0) {
      config.toolDia = config.toolDia * -1;
    }

    var clipperPaths = [];
    var clipperTabsPaths = [];
    for (var i = 0; i < config.paths.length; i++) {
      var clipperArr = [];
      var clipperTabsArr = [];
      var lineUnionGeo = new THREE.Geometry();
      if (config.leadInPaths) {
        if (config.leadInPaths.length == config.paths.length) {
          lineUnionGeo.vertices.push(new THREE.Vector3(config.leadInPaths[i][0].X, config.leadInPaths[i][0].Y, config.z));
          clipperArr.push({
            X: config.leadInPaths[i][0].X,
            Y: config.leadInPaths[i][0].Y
          });
        }
      }
      var totalDist = 0;
      var lastTabPos = -config.tabspace;
      var lastvert = {
        x: 0,
        y: 0,
        z: 0
      }
      var lastTabPos = -config.tabspace;
      for (var j = 0; j < config.paths[i].length; j++) {
        // console.log(j)
        totalDist += distanceFormula(lastvert.x, config.paths[i][j].X, lastvert.y, config.paths[i][j].Y)
        if (config.tabwidth) {
          if (totalDist > (lastTabPos + config.tabspace) && config.z < config.tabdepth) {
            if (j < config.paths[i].length) {
              // console.log(i, j)
              if (j < config.paths[i].length - 1) {
                var d = distanceFormula(config.paths[i][j].X, config.paths[i][j + 1].X, config.paths[i][j].Y, config.paths[i][j + 1].Y)
              } else {
                var d = distanceFormula(config.paths[i][j].X, config.paths[i][0].X, config.paths[i][j].Y, config.paths[i][0].Y)
              }
              if (d >= (config.toolDia + config.tabwidth)) {
                var numTabs = Math.round(d / (config.tabspace + config.tabwidth));
                // if we have a line distance of 100
                // and 3 tabs (width 10) in that line per numTabs
                // then we want to evenly space them
                // so we divide the line distance by numTabs
                var spacePerTab = d / numTabs;
                // which in this example would be 33.33~
                // then in each space per tab we need to center the tab
                // which means dividing the difference of the spacePerTab and tabWidth by 2
                var tabPaddingPerSpace = (spacePerTab - (config.tabwidth + config.toolDia)) / 2;

                // console.log("Adding tab")
                // next point
                if (j < config.paths[i].length - 1) {
                  var deltaX = config.paths[i][j + 1].X - config.paths[i][j].X;
                  var deltaY = config.paths[i][j + 1].Y - config.paths[i][j].Y;
                } else {
                  var deltaX = config.paths[i][0].X - config.paths[i][j].X;
                  var deltaY = config.paths[i][0].Y - config.paths[i][j].Y;
                }

                // get the line angle
                var ang = Math.atan2(deltaY, deltaX);
                // console.log('  ANGLE ' + (ang * 180 / Math.PI));

                // convert it to degrees for later math with addDegree
                ang = ang * 180 / Math.PI;

                lastTabPos = totalDist;
                var npt = [config.paths[i][j].X, config.paths[i][j].Y]
                lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.z));
                clipperArr.push({
                  X: npt[0],
                  Y: npt[1]
                });
                for (var r = 0; r < numTabs; r++) {
                  var clipperTabsArr = [];
                  // then for each tab
                  // add another point at the current point +tabPaddingPerSpace
                  npt = newPointFromDistanceAndAngle(npt, ang, tabPaddingPerSpace);
                  // g += 'G1' + feedrate + ' X' + npt[0] + ' Y' + npt[1] + '\n';
                  lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.z));
                  clipperArr.push({
                    X: npt[0],
                    Y: npt[1]
                  });
                  clipperTabsArr.push({
                    X: npt[0],
                    Y: npt[1]
                  });
                  // then we raise the z height by config.tabHeight
                  lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.tabdepth));
                  clipperArr.push({
                    X: npt[0],
                    Y: npt[1]
                  });
                  clipperTabsArr.push({
                    X: npt[0],
                    Y: npt[1]
                  });
                  // g += 'G0 Z' + tabsBelowZ + '\n';
                  // then add another point at the current point +tabWidth
                  npt = newPointFromDistanceAndAngle(npt, ang, config.tabwidth + config.toolDia);
                  lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.tabdepth));
                  clipperArr.push({
                    X: npt[0],
                    Y: npt[1]
                  });
                  clipperTabsArr.push({
                    X: npt[0],
                    Y: npt[1]
                  });
                  // g += 'G0' + feedrate + ' X' + npt[0] + ' Y' + npt[1] + '\n';
                  // then lower the z height back to zPos at plunge speed
                  // g += 'G0 F' + plungeSpeed + ' Z' + tabsBelowZ + '\n';
                  // g += 'G1 F' + plungeSpeed + ' Z' + zpos + '\n';
                  lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.z));
                  clipperArr.push({
                    X: npt[0],
                    Y: npt[1]
                  });
                  clipperTabsArr.push({
                    X: npt[0],
                    Y: npt[1]
                  });
                  // then add another point at the current point +tabPaddingPerSpace
                  // with the cut speed
                  npt = newPointFromDistanceAndAngle(npt, ang, tabPaddingPerSpace);
                  lineUnionGeo.vertices.push(new THREE.Vector3(npt[0], npt[1], config.z));
                  clipperArr.push({
                    X: npt[0],
                    Y: npt[1]
                  });
                  clipperTabsPaths.push(clipperTabsArr);
                  // g += 'G1' + feedrate + ' X' + npt[0] + ' Y' + npt[1] + '\n';
                }
              } else { // line isnt long enough
                lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][j].X, config.paths[i][j].Y, config.z));
                clipperArr.push({
                  X: config.paths[i][j].X,
                  Y: config.paths[i][j].Y
                });
              }
            } else { // is last point
              lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][j].X, config.paths[i][j].Y, config.z));
              clipperArr.push({
                X: config.paths[i][j].X,
                Y: config.paths[i][j].Y
              });
            }
          } else { // havent moved far enough yet
            lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][j].X, config.paths[i][j].Y, config.z));
            clipperArr.push({
              X: config.paths[i][j].X,
              Y: config.paths[i][j].Y
            });
          }
        } else { // no valid config.tabwidth found
          lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][j].X, config.paths[i][j].Y, config.z));
          clipperArr.push({
            X: config.paths[i][j].X,
            Y: config.paths[i][j].Y
          });
        }
        // lineUnionGeo.vertices.push(new THREE.Vector3(paths[i][j].X, paths[i][j].Y, z));
        lastvert = {
          x: config.paths[i][j].X,
          y: config.paths[i][j].Y,
          z: config.z
        }
      } // end for loop j < paths[i].length
      // close it by connecting last point to 1st point
      if (config.isClosed) {
        lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][0].X, config.paths[i][0].Y, config.z));
        clipperArr.push({
          X: config.paths[i][0].X,
          Y: config.paths[i][0].Y
        });
      }
      if (config.leadInPaths) {
        if (config.leadInPaths.length == config.paths.length) {
          lineUnionGeo.vertices.push(new THREE.Vector3(config.leadInPaths[i][0].X, config.leadInPaths[i][0].Y, config.z));
          clipperArr.push({
            X: config.leadInPaths[i][0].X,
            Y: config.leadInPaths[i][0].Y
          });
        }
      }

      var lineUnion = new THREE.Line(lineUnionGeo, lineUnionMat);
      if (config.name) {
        lineUnion.name = config.name;
      }
      group.add(lineUnion);
      clipperPaths.push(clipperArr);
      clipperTabsPaths.push(clipperTabsArr);

    } // end for loop i < paths.length

    // console.log(clipperPaths[0].length, clipperTabsPaths.length)

    var prettyGrp = new THREE.Group();
    var prettyGrpColor = config.prettyGrpColor;

    if (config.z < config.tabdepth) {
      if (config.toolDia > minimumToolDiaForPreview || config.toolDia < -minimumToolDiaForPreview) { //Dont show for very small offsets, not worth the processing time
        // generate once use again
        // for each z
        if (!$('#performanceLimit').is(":checked")) {
          var lineMesh = this.getMeshLineFromClipperPath({
            width: config.toolDia,
            clipperPath: clipperPaths,
            isSolid: true,
            opacity: 0.2,
            isShowOutline: true,
            color: config.prettyGrpColor,
            caps: "round"
          });
          lineMesh.position.z = config.z;
          prettyGrp.add(lineMesh)
          var lineMesh = this.getMeshLineFromClipperPath({
            width: config.toolDia,
            clipperPath: clipperTabsPaths,
            isSolid: true,
            opacity: 0.4,
            isShowOutline: true,
            color: 0x00ff00,
            caps: "negative"
          });
          lineMesh.position.z = config.z;
          prettyGrp.add(lineMesh)
        }
      }
    } else {
      if (config.toolDia > minimumToolDiaForPreview || config.toolDia < -minimumToolDiaForPreview) { //Dont show for very small offsets, not worth the processing time
        // generate once use again for each z

          var lineMesh = this.getMeshLineFromClipperPath({
            width: config.toolDia,
            clipperPath: config.paths,
            isSolid: true,
            opacity: 0.2,
            isShowOutline: true,
            color: config.prettyGrpColor,
            caps: "round"
          });
          lineMesh.position.z = config.z;
          prettyGrp.add(lineMesh)

      }
    }



      var grp = {
        lines: group,
        pretty: prettyGrp
      }


    return grp;
  };

  distanceFormula = function(x1, x2, y1, y2) {
    // get the distance between p1 and p2
    var a = (x2 - x1) * (x2 - x1);
    var b = (y2 - y1) * (y2 - y1);
    return Math.sqrt(a + b);
  };

  newPointFromDistanceAndAngle = function(pt, ang, distance) {
    // use cos and sin to get a new point with an angle
    // and distance from an existing point
    // pt = [x,y]
    // ang = in degrees
    // distance = N
    var r = [];
    r.push(pt[0] + (distance * Math.cos(ang * Math.PI / 180)));
    r.push(pt[1] + (distance * Math.sin(ang * Math.PI / 180)));
    return r;
  };

  // borrowed code from https://github.com/chilipeppr/widget-eagle/blob/master/widget.js

  function getMeshLineFromClipperPath(opts) {
    // console.log(opts);
    var width = opts.width ? opts.width : 1;
    var paths = opts.clipperPath;
    var isSolid = 'isSolid' in opts ? opts.isSolid : true;
    var color = opts.color ? opts.color : 0x0000ff;
    var opacity = opts.opacity ? opts.opacity : 0.3;
    var isShowOutline = 'isShowOutline' in opts ? opts.isShowOutline : false;
    var retGrp = new THREE.Group();
    var cap = opts.caps;
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
          var clipperStroke = addStrokeCapsToLine(pt.X, pt.Y, pt2.X, pt2.Y, localInflateBy * 2, cap, color);
          // console.log(clipperStroke)
          // if (clipperStroke.length > 1) console.warn("got more than 1 path on clipperStroke");
          // if (clipperStroke.length < 1) console.warn("got less than 1 path on clipperStroke");
          csThisPath.push(clipperStroke[0] || [{
            X: 0,
            Y: 0
          }]);
        }
      }
      // console.log(csThisPath);
      var csUnion = getUnionOfClipperPaths(csThisPath, false, false);
      // var csUnion = csThisPath

      if (isShowOutline) {
        // console.log("isShowOutline")
        var drawClipperPathsconfig = {
          paths: csUnion,
          color: color,
          opacity: opacity + 0.2,
          z: 0,
          isClosed: false,
          name: false,
          leadInPaths: false,
          tabdepth: false,
          tabspace: false,
          tabwidth: false,
          toolDia: false,
          drawPretty: false
        }
        var threeObj = drawClipperPaths(drawClipperPathsconfig);
        // var threeObj = drawClipperPaths(csUnion, color, opacity + 0.1, 0);
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
    // console.log("addStrokeCapsToLine", capType)
    if (width < 0) {
      width = width * -1;
    }

    var cap = capType
    // console.log(cap, capType)

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
    var capGrp = new THREE.Object3D();
    wireGrp.name = "wireGrp"
    capGrp.name = "capGrp"
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
    } else {
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
      capGrp.add(circle);

      // shift right
      var shiftX = 0; //radius * 1;
      var shiftY = 0;
      circle2.position.set(shiftX + v2.x, shiftY + v2.y, 0);
      capGrp.add(circle2);
    }
    // now reverse rotate
    wireGrp.rotateZ(-theta);
    capGrp.rotateZ(-theta)
    // unshift postion
    wireGrp.position.set(x1 * 1, y1 * 1, 0);
    capGrp.position.set(x1 * 1, y1 * 1, 0);
    //this.sceneAdd(wireGrp);

    // now simplify via Clipper
    var subj_paths = [];
    wireGrp.updateMatrixWorld();
    var lineCtr = 0;
    // console.log(wireGrp)
    wireGrp.children.forEach(function(line) {
      // console.log("line in group:", line);
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

    var clip_paths = [];
    capGrp.updateMatrixWorld();
    var lineCtr = 0;
    capGrp.children.forEach(function(line) {
      //console.log("line in group:", line);
      clip_paths.push([]);
      line.geometry.vertices.forEach(function(v) {
        //line.updateMatrixWorld();
        //console.log("pushing v onto clipper:", v);
        var vector = v.clone();
        var vec = line.localToWorld(vector);
        var xval = round(vec.x, 1)
        var yval = round(vec.y, 1)
        clip_paths[lineCtr].push({
          X: xval,
          Y: yval
        });
      }, this);
      lineCtr++;
    }, this);


    // console.log(subj_paths.length, clip_paths.length, cap)
    if (cap == "round") {
      var sol_paths = getUnionOfClipperPaths(subj_paths, false, cap);
    } else {
      var sol_paths = getDiffOfClipperPaths(subj_paths, clip_paths, cap);
    }
    //this.drawClipperPaths(sol_paths, this.colorSignal, 0.8);
    // this.sceneAdd(group);

    return sol_paths;

  }

  function round(number, precision, type) {
    var shift = function(number, precision, reverseShift) {
      if (reverseShift) {
        precision = -precision;
      }
      numArray = ("" + number).split("e");
      return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
    };
    return shift(Math.round(shift(number, precision, false)), precision, true);
  }


  function getUnionOfClipperPaths(subj_paths, clip_paths, cap) {
    // console.log(subj_paths, clip_paths, cap)
    var cpr = new ClipperLib.Clipper();
    var scale = 100000;
    // subj_paths = ClipperLib.JS.Clean(subj_paths, cleandelta * scale);
    // clip_paths = ClipperLib.JS.Clean(clip_paths, cleandelta * scale);
    ClipperLib.JS.ScaleUpPaths(subj_paths, scale);
    ClipperLib.JS.ScaleUpPaths(clip_paths, scale);
    cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);
    // if (subj_paths && clip_paths) {
    cpr.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);
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


  function getDiffOfClipperPaths(subj_paths, clip_paths, cap) {
    var cpr = new ClipperLib.Clipper();
    var scale = 100000;
    // subj_paths = ClipperLib.JS.Clean(subj_paths, cleandelta * scale);
    // clip_paths = ClipperLib.JS.Clean(clip_paths, cleandelta * scale);
    ClipperLib.JS.ScaleUpPaths(subj_paths, scale);
    ClipperLib.JS.ScaleUpPaths(clip_paths, scale);
    cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);
    cpr.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);
    var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
    var clip_fillType = ClipperLib.PolyFillType.pftNonZero;
    var solution_paths = new ClipperLib.Paths();
    cpr.Execute(ClipperLib.ClipType.ctDifference, solution_paths, subject_fillType, clip_fillType);
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

// End if in Worker
}
