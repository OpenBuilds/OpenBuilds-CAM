if(typeof window == "undefined"){ // Only run as worker
  var minimumToolDiaForPreview = 0.04;
  var insideCutsColor = 0x660000;
  var outsideCutsColor = 0x000066;
  var pocketColor = 0x006600;
  var toolpathColor = 0x666600;

  self.addEventListener('message', function(e) {
    // console.log("New message received by worker", e.data.data.length)
    importScripts("/lib/clipperjs/clipper_unminified.js");
    importScripts("/lib/threejs/three.min.js");
    var toolpaths = JSON.parse(e.data.data);

    var toolpathsarray = getToolpaths(toolpaths)

    console.log(toolpathsarray)

    // return when finished
    var toolpathsjson = {
    };
    for (j = 0; j < toolpathsarray.length; j++) {
      toolpathsjson[j] = toolpathsarray[j].toJSON();
    }
    var data = JSON.stringify(toolpathsjson)
    self.postMessage(data);
  }, false);


function getToolpaths(toolpaths) {
  var newToolpathsInScene = []
  // Process Them
  console.log("Processing " + toolpaths.length + " toolpaths")
  var loader = new THREE.ObjectLoader();
  for (q=0; q<toolpaths.length; q++) {
    var toolpath = loader.parse(toolpaths[q]);
    config = {
      toolpath: toolpath,
      repair: false,
      union: toolpath.userData.camUnion,
      offset: toolpath.userData.camToolDia / 2,
      stepover: parseFloat(toolpath.userData.camStepover, 2),
      zstart: parseFloat(toolpath.userData.camZStart, 2),
      zstep: parseFloat(toolpath.userData.camZStep, 2),
      zdepth: parseFloat(toolpath.userData.camZDepth, 2),
      tabdepth: parseFloat(toolpath.userData.camTabDepth, 2),
      tabspace: parseFloat(toolpath.userData.camTabSpace, 2),
      tabwidth: parseFloat(toolpath.userData.camTabWidth, 2),
      direction: toolpath.userData.camDirection,
    };
    var operation = toolpath.userData.camOperation;

    if (!operation) {
      // No Op
    } else if (operation == "... Select Operation ...") {
      console.log("No operation");
    } else if (operation == "Laser: Vector (no path offset)") {
      console.log("Laser: Vector (no path offset)");
      config.offset = 0;
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Laser: Vector (path inside)") {
      console.log("Laser: Vector (path inside)");
      config.offset = config.offset * -1;
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Laser: Vector (path outside)") {
      console.log("Laser: Vector (path outside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Laser: Vector (raster fill) (Beta)") {
      console.log("Laser: Vector (raster fill) (Beta)");

    } else if (operation == "CNC: Vector (no offset)") {
      console.log("CNC: Vector (no offset)");
      config.offset = 0;
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "CNC: Vector (path inside)") {
      console.log("CNC: Vector (path inside)");
      config.offset = config.offset * -1;
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "CNC: Vector (path outside)") {
      console.log("CNC: Vector (path outside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "CNC: Pocket") {
      console.log("CNC: Pocket");
      toolpath.userData.inflated = pocketPath(config)
    } else if (operation == "CNC: V-Engrave") {
      console.log("CNC: V-Engrave");
      // no op yet
    } else if (operation == "Plasma: Vector (path outside)") {
      console.log("Plasma: Vector (path outside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Plasma: Vector (path inside)") {
      console.log("Plasma: Vector (path inside)");
      config.offset = config.offset * -1;
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Plasma: Mark") {
      console.log("Plasma: Mark");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Plasma: Vector (no path offset)") {
      console.log("Plasma: Vector (no path offset)");
      config.offset = 0;
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Drag Knife: Cutout") {
      console.log("Drag Knife: Cutout");

    } else if (operation == "Drill: Peck (Centered)") {
      console.log("Drill: Peck (Centered)");

    } else if (operation == "Drill: Continuous (Centered)") {
      console.log("Drill: Continuous (Centered)");

    } else if (operation == "Pen Plotter: (no offset)") {
      console.log("Pen Plotter: (no offset)");
      config.offset = 0;
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Pen Plotter: (path inside)") {
      console.log();
      config.offset = config.offset * -1;
      toolpath.userData.inflated  = workerInflateToolpath(config)
    } else if (operation == "Pen Plotter: (path outside)") {
      console.log("Pen Plotter: (path outside)");
      toolpath.userData.inflated  = workerInflateToolpath(config)
    }
    // console.log("Finished " + q+ " of " +toolpaths.length)
    newToolpathsInScene.push(toolpath)
  }
  // console.log('Finished all the toolpaths')
  return newToolpathsInScene
}


  function workerInflateToolpath(config) {
    // console.log(config)
    var inflateGrpZ = new THREE.Group();
    var prettyGrp = new THREE.Group();
    var clipperPaths = workerGetClipperPaths(config.toolpath)
    if (config.repair) {
      clipperPaths = repairClipperPath(clipperPaths);
    }
    // console.log('Original Toolpath: ', JSON.stringify(clipperPaths))
    if (config.union == "Yes") {
      // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
      var newClipperPaths = workerSimplifyPolygons(clipperPaths);
      if (newClipperPaths.length < 1) {
        console.error("Clipper Simplification Failed!:");
      }
      if (config.offset != 0) {
        var inflatedPaths = workerGetInflatePath(newClipperPaths, config.offset);
      } else {
        var inflatedPaths = newClipperPaths;
      }
      if (config.direction == "Climb") {
        // reverse here
        if (config.offset > 0) {
          for (i = 0; i < inflatedPaths.length; i++) {
            inflatedPaths[i].reverse();
          }
        }
      } else if (config.direction == "Conventional") {
        if (config.offset < 0) {
          for (i = 0; i < inflatedPaths.length; i++) {
            inflatedPaths[i].reverse();
          }
        }
      }
      // console.log(inflatedPaths);
      if (config.leadinval > 0) { // plasma lead-in
        var leadInPaths = workerGetInflatePath(newClipperPaths, config.offset * 3);
      }
      for (i = config.zstart + config.zstep; i < config.zdepth + config.zstep; i += config.zstep) {
        if (i > config.zdepth) {
          var zval = -config.zdepth;
        } else {
          var zval = -i
        }
        // console.log(i * config.zstep > config.zdepth, i * config.zstep, i, zval)
        // console.log(i, config.zstart, config.zstep, config.zdepth, zval);
        var drawClipperPathsconfig = {
          paths: inflatedPaths,
          color: toolpathColor,
          opacity: 0.8,
          z: zval,
          isClosed: true,
          name: 'inflateGrp',
          leadInPaths: leadInPaths,
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
          prettyGrp.updateMatrixWorld()
        }
      }
    } else {
      var newClipperPaths = clipperPaths;
      for (j = 0; j < newClipperPaths.length; j++) {
        if (config.offset != 0) {
          var inflatedPaths = workerGetInflatePath([newClipperPaths[j]], config.offset);
        } else {
          var inflatedPaths = [newClipperPaths[j]];
        }
        if (config.direction == "Climb") {
          // reverse here
          if (config.offset > 0) {
            for (i = 0; i < inflatedPaths.length; i++) {
              inflatedPaths[i].reverse();
            }
          }
        } else if (config.direction == "Conventional") {
          if (config.offset < 0) {
            for (i = 0; i < inflatedPaths.length; i++) {
              inflatedPaths[i].reverse();
            }
          }
        }
        if (inflatedPaths.length < 1) {
          console.error("Clipper Inflate Failed!:");

        }
        // plasma lead-in
        if (config.leadinval > 0) {
          var leadInPaths = workerGetInflatePath([newClipperPaths[j]], config.offset * 3);
        }
        for (i = config.zstart + config.zstep; i < config.zdepth + config.zstep; i += config.zstep) {
          if (i > config.zdepth) {
            var zval = -config.zdepth;
          } else {
            var zval = -i
          }
          // console.log(i, config.zstart, config.zstep, config.zdepth, zval);
          var drawClipperPathsconfig = {
            paths: inflatedPaths,
            color: toolpathColor,
            opacity: 0.8,
            z: zval,
            isClosed: true,
            name: 'inflateGrp',
            leadInPaths: leadInPaths,
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
            prettyGrp.updateMatrixWorld()
          }
        }
      }
    }
    if (config.offset > minimumToolDiaForPreview || config.offset < -minimumToolDiaForPreview) { //Dont show for very small offsets, not worth the processing time
      inflateGrpZ.userData.pretty = prettyGrp
    };
    inflateGrpZ.userData.toolDia = config.offset * 2
    return inflateGrpZ;
  }



  function workerSimplifyPolygons(paths) {
    var scale = 10000;
    ClipperLib.JS.ScaleUpPaths(paths, scale);
    var newClipperPaths = ClipperLib.Clipper.SimplifyPolygons(paths, ClipperLib.PolyFillType.pftEvenOdd);
    ClipperLib.JS.ScaleDownPaths(newClipperPaths, scale);
    ClipperLib.JS.ScaleDownPaths(paths, scale);
    return newClipperPaths;
  };


  function workerGetInflatePath(paths, delta, joinType) {
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

    if (config.z === undefined || config.z == null) {
      config.z = 0;
      // console.log("config.z not defined")
    }

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

    if (config.z === undefined || config.z == null) {
      config.z = 0;
      // console.log("with tool config.z not defined")
    }

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
          lineMesh.name = "LineMesh1"
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
          lineMesh.name = "LineMesh2"
          for (r= 0; r < lineMesh.children.length; r++) {
            for (s=0; s> lineMesh.children[r].children.length; s++) {
              lineMesh.children[r].children[s].geometry.translate(lineMesh.position.x, lineMesh.position.y, lineMesh.position.z)
            }
          }
          lineMesh.position.x = 0;
          lineMesh.position.y = 0;
          lineMesh.position.z = 0;
          prettyGrp.add(lineMesh)

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
          lineMesh.name = "LineMesh3"
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

  pocketPath = function(config) { //}, infobject, inflateVal, stepOver, zstep, zdepth, zstart, union) {
    var pocketGrp = new THREE.Group();
    var prettyGrp = new THREE.Group();
    if (config.offset != 0) {
      var clipperPaths = workerGetClipperPaths(config.toolpath)
      // console.log("clipperPaths:", clipperPaths);
      if (config.union == "Yes") {
        // console.log("Union")
        // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
        var newClipperPaths =workerSimplifyPolygons(clipperPaths);
        // console.log(newClipperPaths)
        if (newClipperPaths.length < 1) {
          console.error("Clipper Simplification Failed!:");
        }
        // calc Stepover
        var cutwidth = ((config.offset * 2) * (config.stepover / 100)) //mm per cut
        // todo for newClipperPaths.length (Split each clipperpath into own pocket)
        // for (k = 1; k < newClipperPaths.length; k++) {
        // var pathobj = [];
        // pathobj.push(newClipperPaths[k])
        // console.log("processing " + newClipperPaths[k])
        for (i = 0; i < 1000; i++) { // Rather 1000 than a while loop, just in case, break when it no longer has data to work with
          if (i == 0) {
            inflateValUsed = config.offset; // at outer perimeter we offset just half tool else cut is bigger than sketch
          }
          if (inflateValUsed < config.offset) {
            inflateValUsed = config.offset
          } else {
            inflateValUsed = cutwidth * i;
          }
          if (inflateValUsed < config.offset) {
            // console.log("Should skip " + i)
          }
          // console.log(i, inflateValUsed, config.offset)
          if (inflateValUsed > 0) {
            // console.log(i, inflateValUsed, inflateVal, cutwidth, (cutwidth * i), (inflateVal * 2))
            var inflatedPaths = workerGetInflatePath(newClipperPaths, -inflateValUsed);
            if (inflatedPaths.length > 0) {
              // Duplicate each loop, down into Z.  We go full depth before next loop.
              for (j = config.zdepth; j > config.zstart; j -= config.zstep) { // do the layers in reverse, because later, we REVERSE the whole array with pocketGrp.children.reverse() - then its top down.
                // console.log(j)

                if (j > config.zdepth) {
                  var zval = -config.zdepth;
                } else {
                  var zval = -j
                }
                // get the inflated/deflated path
                var drawClipperPathsconfig = {
                  paths: inflatedPaths,
                  color: toolpathColor,
                  opacity: 0.4,
                  z: zval,
                  isClosed: true,
                  name: 'inflatedGroup',
                  leadInPaths: false,
                  tabdepth: false,
                  tabspace: false,
                  tabwidth: false,
                  toolDia: config.offset * 2,
                  drawPretty: true,
                  prettyGrpColor: pocketColor
                }
                var drawings = drawClipperPathsWithTool(drawClipperPathsconfig);
                inflateGrp = drawings.lines;
                inflateGrp.name = 'inflateGrp';
                inflateGrp.position = config.toolpath.position;
                pocketGrp.add(inflateGrp);
                if (drawings.pretty) {
                  prettyGrp.add(drawings.pretty)
                  prettyGrp.updateMatrixWorld()
                }
              }
            } else {
              // console.log('Pocket already done after ' + i + ' iterations');
              break;
            }
          }
        }
        // }
        // get the inflated/deflated path then inside each loop, Duplicate each loop, down into Z.  We go full depth before next loop.
        if (config.offset > 1 || config.offset < -1) {
          pocketGrp.userData.pretty = prettyGrp;
        }
        pocketGrp.children = pocketGrp.children.reverse(); // Inside Out! Breakthrough!
        return pocketGrp;
      } else {
        console.log("Union")
        // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
        var newClipperPaths =workerSimplifyPolygons(clipperPaths);
        // console.log(newClipperPaths)
        if (newClipperPaths.length < 1) {
          console.error("Clipper Simplification Failed!:");
        }
        // calc Stepover
        var cutwidth = ((config.offset * 2) * (config.stepover / 100)) //mm per cut
        // todo for newClipperPaths.length (Split each clipperpath into own pocket)
        for (k = 0; k < newClipperPaths.length; k++) {
          var pathobj = [];
          pathobj.push(newClipperPaths[k])
          // console.log("processing " + newClipperPaths[k])
          for (i = 0; i < 1000; i++) { // Rather 1000 than a while loop, just in case, break when it no longer has data to work with
            if (i == 0) {
              inflateValUsed = config.offset; // at outer perimeter we offset just half tool else cut is bigger than sketch
            }
            if (inflateValUsed < config.offset) {
              inflateValUsed = config.offset
            } else {
              inflateValUsed = cutwidth * i;
            }
            if (inflateValUsed < config.offset) {
              console.log("Should skip " + i)
            }
            // console.log(i, inflateValUsed, config.offset)
            if (inflateValUsed > 0) {
              // console.log(i, inflateValUsed, inflateVal, cutwidth, (cutwidth * i), (inflateVal * 2))
              var inflatedPaths = getInflatePath(pathobj, -inflateValUsed);
              if (inflatedPaths.length > 0) {
                // Duplicate each loop, down into Z.  We go full depth before next loop.
                for (j = config.zdepth; j > config.zstart; j -= config.zstep) { // do the layers in reverse, because later, we REVERSE the whole array with pocketGrp.children.reverse() - then its top down.
                  // console.log(j)
                  if (j * config.zstep < config.zdepth) {
                    var zval = -j
                  } else {
                    var zval = -config.zdepth;
                  }
                  // get the inflated/deflated path
                  var drawClipperPathsconfig = {
                    paths: inflatedPaths,
                    color: toolpathColor,
                    opacity: 0.4,
                    z: zval,
                    isClosed: true,
                    name: 'inflatedGroup',
                    leadInPaths: false,
                    tabdepth: false,
                    tabspace: false,
                    tabwidth: false,
                    toolDia: config.offset * 2,
                    drawPretty: true,
                    prettyGrpColor: pocketColor
                  }
                  var drawings = drawClipperPathsWithTool(drawClipperPathsconfig);
                  inflateGrp = drawings.lines;
                  inflateGrp.name = 'inflateGrp';
                  inflateGrp.position = config.toolpath.position;
                  pocketGrp.add(inflateGrp);
                  if (drawings.pretty) {
                    prettyGrp.add(drawings.pretty)
                    prettyGrp.updateMatrixWorld()
                  }
                }
              } else {
                // console.log('Pocket already done after ' + i + ' iterations');
                break;
              }
            }
          }
        }
        // get the inflated/deflated path then inside each loop, Duplicate each loop, down into Z.  We go full depth before next loop.
        if (config.offset > 1 || config.offset < -1) {
          pocketGrp.userData.pretty = prettyGrp;
        }
        pocketGrp.children = pocketGrp.children.reverse(); // Inside Out! Breakthrough!
        pocketGrp.userData.toolDia = config.offset * 2
        return pocketGrp;
      } // end no union
    }
  };

  dragknifePath = function(config) { //}, infobject, inflateVal, zstep, zdepth) {
    var dragknifeGrp = new THREE.Group();
    // console.log("user wants to create Drag Knife Path. val:", inflateVal);
    var clipperPaths = workerGetClipperPaths(config.toolpath)
    // console.log("clipperPaths:", clipperPaths);
    // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
    var newClipperPaths =workerSimplifyPolygons(clipperPaths);

    if (newClipperPaths.length < 1) {
      console.error("Clipper Simplification Failed!:");
    }

    for (j = 0; j < config.zdepth; j += config.zstep) {
      if (j * config.zstep < config.zdepth) {
        var zval = -j
      } else {
        var zval = -config.zdepth;
      }
      var polygons = newClipperPaths;
      polygons = polygons.map(function(poly) {
        // return addCornerActions(poly, Math.pow(2, 20) * 5, 20 / 180 * Math.PI);
        return addCornerActions(poly, config.offset, 20 / 180 * Math.PI);
      });
      var drawClipperPathsconfig = {
        paths: polygons,
        color: toolpathColor,
        opacity: 0.8,
        z: zval,
        isClosed: true,
        name: 'inflatedGroup',
        leadInPaths: false,
        tabdepth: false,
        tabspace: false,
        tabwidth: false,
        toolDia: config.offset * 2,
      }
      inflateGrp = drawClipperPaths(drawClipperPathsconfig);
      if (inflateGrp.children.length) {
        inflateGrp.name = 'dragknifeGrp';
        inflateGrp.position = config.toolpath.position;
        // dragknifeGrp.userData.color = dragknifeGrp.material.color.getHex();
        dragknifeGrp.add(inflateGrp)
      } else {
        console.log('Dragknife Operation Failed')
        break;
      }
    }
    dragknifeGrp.userData.toolDia = config.offset * 2
    return dragknifeGrp
  };

  addCornerActions = function(clipperPolyline, clipperRadius, toleranceAngleRadians) {
    console.log("clipperPolyline Starting :  ", clipperPolyline);
    if (clipperRadius == 0 || clipperPolyline.length == 0)
      return clipperPolyline;
    var result = [];
    result.push(clipperPolyline[0]);
    //previous point is not always at i-1, because repeated points in the polygon are skipped
    // var previousPoint = clipperPolyline[0];
    var previousPoint = new Point(clipperPolyline[0].X, clipperPolyline[0].Y, 0); //clipperPolyline[i - 1];
    for (var i = 1; i < clipperPolyline.length - 1; i++) {
      previousPoint = new Point(clipperPolyline[i - 1].X, clipperPolyline[i - 1].Y, 0); //clipperPolyline[i - 1];
      var point = new Point(clipperPolyline[i].X, clipperPolyline[i].Y, 0); //clipperPolyline[i];
      if (previousPoint.sqDistance(point) == 0)
        continue;
      // you don't want to play with atan2() if a point is repeated
      var incomingVector = point.sub(previousPoint);
      var nextPoint = new Point(clipperPolyline[i + 1].X, clipperPolyline[i + 1].Y, 0) //clipperPolyline[i + 1];
      var angle = point.angle(previousPoint, nextPoint);
      var overshoot = point.add(incomingVector.normalized().scale(clipperRadius));
      result.push(overshoot);
      if (Math.abs(angle) > toleranceAngleRadians) {

        var arcPoints = 100 / (2 * Math.PI) * Math.abs(angle);
        var incomingAngle = incomingVector.atan2();
        for (var j = 0; j <= arcPoints; j++) {
          var a = incomingAngle + angle / arcPoints * j;
          var pt = point.add(polarPoint(clipperRadius, a));
          result.push(pt);
        }
      }
      previousPoint = point;
    }
    if (clipperPolyline.length > 1)
      result.push(clipperPolyline[clipperPolyline.length - 1]);
    return result;
  }

  function Point(X, Y, Z) {
    this.X = X;
    this.Y = Y;
    this.Z = Z === undefined ? 0 : Z;
  }

  Point.prototype = {
    sqDistance: function(p) {
      var d = p == null ? this : this.sub(p);
      return d.X * d.X + d.Y * d.Y + d.Z * d.Z;
    },
    sub: function(p) {
      //  console.log("sub.x: ", this.x, " p.x ", p.x)
      return new Point(this.X - p.X, this.Y - p.Y, this.Z - p.Z);
    },
    angle: function(fromPoint, toPoint) {
      var toPoint2 = new Point(toPoint.X, toPoint.Y, toPoint.Z);
      var v1 = this.sub(fromPoint);
      var v2 = toPoint2.sub(this);
      var dot = v1.X * v2.X + v1.Y * v2.Y;
      var cross = v1.X * v2.Y - v1.Y * v2.X;
      var res = Math.atan2(cross, dot);
      var twoPi = 2 * Math.PI;
      if (res < -twoPi)
        return res + twoPi;
      if (res > twoPi)
        return res - twoPi;
      return res;
    },
    normalized: function() {
      // console.log("normalized.distance: ", this.distance())
      return this.scale(1 / this.distance());
      console.log("normalized: ", this.scale(1 / this.distance()))
    },
    scale: function(val) {
      return new Point(this.X * val, this.Y * val, this.Z * val);
    },
    distance: function(p) {
      return Math.sqrt(this.sqDistance(p));
    },
    add: function(p) {
      return new Point(this.X + p.X, this.Y + p.Y, this.Z + p.Z);
    },
    atan2: function() {
      return Math.atan2(this.Y, this.Y);
    },
  };

  polarPoint = function(r, theta) {
    return new Point(r * Math.cos(theta), r * Math.sin(theta));
  };

// End if in Worker
}
