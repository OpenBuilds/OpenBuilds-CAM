if (typeof window == "undefined") { // Only run as worker
  var minimumToolDiaForPreview = 0.04;
  var insideCutsColor = 0x660000;
  var outsideCutsColor = 0x000066;
  var pocketColor = 0x006600;
  var toolpathColor = 0x666600;

  self.addEventListener('message', function(e) {
    // console.log("New message received by worker", e.data.data.length)
    importScripts("../../../lib/clipperjs/clipper_unminified.js", "../../../lib/threejs/three.min.js", "../../../lib/gl-matrix.js", "../../../lib/tbfleming/web-cam-cpp.js");


    var toolpaths = JSON.parse(e.data.data.toolpath);

    var jobindex = e.data.data.index;
    var performanceLimit = e.data.data.performanceLimit;

    toolpathsjson = getToolpaths(toolpaths, jobindex, performanceLimit).toJSON();

    var data = {
      toolpath: JSON.stringify(toolpathsjson),
      running: false,
      index: jobindex
    }
    self.postMessage(data);
  }, false);


  function getToolpaths(toolpath, jobindex, performanceLimit) {
    // Process Them
    // console.log(toolpath)
    var loader = new THREE.ObjectLoader();

    var data = {
      toolpaths: false,
      running: true,
      index: jobindex
    }
    self.postMessage(data);

    var toolpath = loader.parse(toolpath);
    config = {
      index: jobindex,
      toolpath: toolpath,
      repair: false,
      union: toolpath.userData.camUnion,
      offset: toolpath.userData.camToolDia / 2,
      leadinval: 0,
      stepover: parseFloat(toolpath.userData.camStepover, 2),
      zstart: parseFloat(toolpath.userData.camZStart, 2),
      zstep: parseFloat(toolpath.userData.camZStep, 2),
      zdepth: parseFloat(toolpath.userData.camZDepth, 2),
      // tabdepth: parseFloat(toolpath.userData.camTabDepth, 2) * -1,
      tabdepth: -(parseFloat(toolpath.userData.camZDepth) - parseFloat(toolpath.userData.camTabDepth)),
      tabspace: parseFloat(toolpath.userData.camTabSpace, 2),
      tabwidth: parseFloat(toolpath.userData.camTabWidth, 2),
      direction: toolpath.userData.camDirection,
      performanceLimit: performanceLimit,
    };
    var operation = toolpath.userData.camOperation;
    var data = {
      toolpaths: false,
      running: true,
      index: jobindex
    }
    self.postMessage(data);
    if (!operation) {
      console.log("Invalid Operation")
    } else if (operation == "... Select Operation ...") {
      console.log("No operation");
    } else if (operation == "Laser: Vector (no path offset)") {
      console.log("Laser: Vector (no path offset)");
      config.zstart = 0
      config.zstep = 0.1
      config.zdepth = 0.1
      config.offset = 0;
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "Laser: Vector (path inside)") {
      console.log("Laser: Vector (path inside)");
      config.zstart = 0
      config.zstep = 0.1
      config.zdepth = 0.1
      config.offset = (toolpath.userData.camSpotSize / 2) * -1;
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "Laser: Vector (path outside)") {
      config.zstart = 0
      config.zstep = 0.1
      config.zdepth = 0.1
      config.offset = (toolpath.userData.camSpotSize / 2)
      console.log("Laser: Vector (path outside)");
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "Laser: Vector (raster fill) (Beta)") {
      config.offset = (toolpath.userData.camSpotSize / 2)
      console.log("Laser: Vector (raster fill) (Beta)");
      config.angle = toolpath.userData.camFillAngle || 0;
      toolpath.userData.inflated = fillPath(config);
    } else if (operation == "CNC: Vector (no offset)") {
      console.log("CNC: Vector (no offset)");
      config.offset = 0;
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "CNC: Vector (path inside)") {
      console.log("CNC: Vector (path inside)");
      config.offset = config.offset * -1;
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "CNC: Vector (path outside)") {
      console.log("CNC: Vector (path outside)");
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "CNC: Pocket") {
      console.log("CNC: Pocket");
      toolpath.userData.inflated = workerPocketPath(config)
    } else if (operation == "CNC: V-Engrave") {
      console.log("CNC: V-Engrave");
      // no op yet
    } else if (operation == "Plasma: Vector (path outside)") {
      console.log("Plasma: Vector (path outside)");
      config.zstart = parseFloat(toolpath.userData.camPlasmaZHeight) * -2
      config.zstep = parseFloat(toolpath.userData.camPlasmaZHeight)
      config.zdepth = parseFloat(toolpath.userData.camPlasmaZHeight) * -1
      config.offset = (toolpath.userData.camPlasmaKerf / 2)
      config.leadinval = toolpath.userData.camPlasmaLeadinDist
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "Plasma: Vector (path inside)") {
      console.log("Plasma: Vector (path inside)");
      // config.offset = config.offset * -1;
      config.zstart = parseFloat(toolpath.userData.camPlasmaZHeight) * -2
      config.zstep = parseFloat(toolpath.userData.camPlasmaZHeight)
      config.zdepth = parseFloat(toolpath.userData.camPlasmaZHeight) * -1
      config.offset = (toolpath.userData.camPlasmaKerf / 2) * -1
      config.leadinval = toolpath.userData.camPlasmaLeadinDist * -1
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "Plasma: Vector (no path offset)") {
      console.log("Plasma: Vector (no path offset)");
      config.zstart = parseFloat(toolpath.userData.camPlasmaZHeight) * -2
      config.zstep = parseFloat(toolpath.userData.camPlasmaZHeight)
      config.zdepth = parseFloat(toolpath.userData.camPlasmaZHeight) * -1
      config.offset = 0;
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "Drag Knife: Cutout") {
      console.log("Drag Knife: Cutout");
      config.offset = toolpath.userData.camDragOffset;
      toolpath.userData.inflated = workerDragknifePath(config)
    } else if (operation == "Drill: Peck (Centered)") {
      console.log("Drill: Peck (Centered)");
      toolpath.userData.inflated = workerDrill(config)
    } else if (operation == "Drill: Continuous (Centered)") {
      console.log("Drill: Continuous (Centered)");
      toolpath.userData.inflated = workerDrill(config)
    } else if (operation == "Pen Plotter: (no offset)") {
      console.log("Pen Plotter: (no offset)");
      config.zstep = 0.1
      config.zdepth = 0.1
      config.offset = 0;
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "Pen Plotter: (path inside)") {
      console.log();
      config.zstep = 0.1
      config.zdepth = 0.1
      config.offset = config.offset * -1;
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "Pen Plotter: (path outside)") {
      console.log("Pen Plotter: (path outside)");
      config.zstep = 0.1
      config.zdepth = 0.1
      toolpath.userData.inflated = workerInflateToolpath(config)
    } else if (operation == "Pen Plotter: (lines fill)") {
      console.log("Pen Plotter: (lines fill)");
      config.offset = (toolpath.userData.camSpotSize / 2)
      config.angle = toolpath.userData.camFillAngle || 0;
      toolpath.userData.inflated = fillPath(config);
    }
    // console.log("Finished " + q+ " of " +toolpaths.length)
    var data = {
      toolpaths: false,
      running: false,
      index: jobindex
    }
    self.postMessage(data);

    console.log(toolpath.userData.inflated.children.length)

    // console.log('Finished all the toolpaths')
    return toolpath
  }


  function workerInflateToolpath(config) {
    //console.log(config)
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
      if (config.leadinval != 0) { // plasma lead-in
        var leadInPaths = workerGetInflatePath(newClipperPaths, config.leadinval);
        //console.log(leadInPaths)
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
          performanceLimit: config.performanceLimit,
          paths: inflatedPaths,
          color: toolpathColor,
          opacity: 1,
          z: zval,
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
      // end config.union = "Yes"
    } else { // begin config.union="No"
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
        if (config.leadinval != 0) {
          var leadInPaths = workerGetInflatePath([newClipperPaths[j]], config.leadinval);
          //console.log(leadInPaths[0][0])
        }
        for (i = config.zstart + config.zstep; i < config.zdepth + config.zstep; i += config.zstep) {
          if (i > config.zdepth) {
            var zval = -config.zdepth;
          } else {
            var zval = -i
          }
          // console.log(i, config.zstart, config.zstep, config.zdepth, zval);
          var drawClipperPathsconfig = {
            performanceLimit: config.performanceLimit,
            paths: inflatedPaths,
            color: toolpathColor,
            opacity: 1,
            z: zval,
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
    } // end config.union="No"
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
    var arcTolerance = 200;
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
      // close it by connecting last point to 1st point - if its not an open ended vector
      if (config.paths[i].length > 2) {
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
    // console.log(JSON.stringify(config));
    var group = new THREE.Object3D();
    if (config.leadInPaths) {
      if (config.leadInPaths.length != config.paths.length) {
        console.log("Skipping lead-in: Source vector file is broken, and we could not produce a reliable offset")
        // printLog('Skipping lead-in: Source vector file is broken, and we could not produce a reliable offset', warncolor, "settings");
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
      if (config.leadInPaths) { // 2021-03-16 This is where the lead-in starts. Added sorting of leadInPaths array to find closest vector to start of Main Vector

        if (config.leadInPaths.length == config.paths.length) {
          var pointIndex = 0
          console.log(config.leadInPaths[i][0])
          config.leadInPaths[i].sort(function(a, b) {
            return distanceFormula(a.X, config.paths[i][0].X, a.Y, config.paths[i][0].Y) - distanceFormula(b.X, config.paths[i][0].X, b.Y, config.paths[i][0].Y)
          })
          console.log(config.leadInPaths[i][0])


          lineUnionGeo.vertices.push(new THREE.Vector3(config.leadInPaths[i][pointIndex].X, config.leadInPaths[i][pointIndex].Y, config.z));
          clipperArr.push({
            X: config.leadInPaths[i][pointIndex].X,
            Y: config.leadInPaths[i][pointIndex].Y
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
                console.log('long enough')
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

      // Handle open ended single line here by not adding point
      if (config.paths[i].length > 2) {
        lineUnionGeo.vertices.push(new THREE.Vector3(config.paths[i][0].X, config.paths[i][0].Y, config.z));
        clipperArr.push({
          X: config.paths[i][0].X,
          Y: config.paths[i][0].Y
        });
      }

      // if (config.leadInPaths) {
      //   if (config.leadInPaths.length == config.paths.length) {
      //     lineUnionGeo.vertices.push(new THREE.Vector3(config.leadInPaths[i][0].X, config.leadInPaths[i][0].Y, config.z));
      //     clipperArr.push({
      //       X: config.leadInPaths[i][0].X,
      //       Y: config.leadInPaths[i][0].Y
      //     });
      //   }
      // }

      var lineUnion = new THREE.Line(lineUnionGeo, lineUnionMat);
      if (config.name) {
        lineUnion.name = config.name;
      }
      console.log(lineUnionGeo)
      group.add(lineUnion);
      clipperPaths.push(clipperArr);
      clipperTabsPaths.push(clipperTabsArr);

    } // end for loop i < paths.length

    // If High performance is available, draw the 3D view
    if (!config.performanceLimit) {
      var prettyGrp = new THREE.Group();
      var prettyGrpColor = config.prettyGrpColor;
      if (config.z < config.tabdepth) { //draw with tabs
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
          prettyGrp.add(lineMesh)
          var lineMesh = this.getMeshLineFromClipperPath({
            width: config.toolDia,
            clipperPath: clipperTabsPaths,
            isSolid: true,
            opacity: 1,
            isShowOutline: true,
            color: 0x00ff00,
            caps: "negative"
          });
          lineMesh.position.z = config.z;
          lineMesh.name = "LineMesh2"
          // for (r= 0; r < lineMesh.children.length; r++) {
          //   for (s=0; s> lineMesh.children[r].children.length; s++) {
          //     lineMesh.children[r].children[s].geometry.translate(lineMesh.position.x, lineMesh.position.y, lineMesh.position.z)
          //   }
          // }
          // lineMesh.position.x = 0;
          // lineMesh.position.y = 0;
          // lineMesh.position.z = 0;
          prettyGrp.add(lineMesh)
          // end if High Performance
        }
      } else { // without tabs
        if (config.toolDia > minimumToolDiaForPreview || config.toolDia < -minimumToolDiaForPreview) { //Dont show for very small offsets, not worth the processing time
          // generate once use again for each z
          // if High Performance is available
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
      // End if High Performance
    } else {
      var grp = {
        lines: group,
        pretty: false
      }
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
          performanceLimit: config.performanceLimit,
          paths: csUnion,
          color: color,
          opacity: opacity + 0.2,
          z: 0,
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
      opacity: 1
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

  function workerPocketPath(config) { //}, infobject, inflateVal, stepOver, zstep, zdepth, zstart, union) {
    var pocketGrp = new THREE.Group();
    var prettyGrp = new THREE.Group();
    if (config.offset != 0) {
      var clipperPaths = workerGetClipperPaths(config.toolpath)
      // console.log("clipperPaths:", clipperPaths);
      if (config.union == "Yes") {
        // console.log("Union")
        // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
        console.time('workerSimplifyPolygons')
        var newClipperPaths = workerSimplifyPolygons(clipperPaths);
        console.timeEnd('workerSimplifyPolygons')
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
          console.log("Pocket loop " + i)
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
            console.time('inflate')
            var inflatedPaths = workerGetInflatePath(newClipperPaths, -inflateValUsed);
            console.timeEnd('inflate')
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
                  performanceLimit: config.performanceLimit,
                  paths: inflatedPaths,
                  color: toolpathColor,
                  opacity: 1,
                  z: zval,
                  name: 'inflatedGroup',
                  leadInPaths: false,
                  tabdepth: false,
                  tabspace: false,
                  tabwidth: false,
                  toolDia: config.offset * 2,
                  drawPretty: true,
                  prettyGrpColor: pocketColor
                }
                console.time('drawRender z' + zval)
                var drawings = drawClipperPathsWithTool(drawClipperPathsconfig);
                console.timeEnd('drawRender z' + zval)
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
        console.log("Not Union")
        // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
        var newClipperPaths = workerSimplifyPolygons(clipperPaths);
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
            console.log("Pocket loop " + i)
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
              var inflatedPaths = workerGetInflatePath(pathobj, -inflateValUsed);
              if (inflatedPaths.length > 0) {
                // Duplicate each loop, down into Z.  We go full depth before next loop.
                // for (j = config.zdepth; j > config.zstart; j -= config.zstep) { // do the layers in reverse, because later, we REVERSE the whole array with pocketGrp.children.reverse() - then its top down.
                //   console.log("Non-union path layer " + j)
                //   if (j * config.zstep < config.zdepth) {
                //     var zval = -j
                //   } else {
                //     var zval = -config.zdepth;
                //   }
                for (j = config.zdepth; j > config.zstart; j -= config.zstep) { // do the layers in reverse, because later, we REVERSE the whole array with pocketGrp.children.reverse() - then its top down.
                  // console.log(j)

                  if (j > config.zdepth) {
                    var zval = -config.zdepth;
                  } else {
                    var zval = -j
                  }

                  // get the inflated/deflated path
                  var drawClipperPathsconfig = {
                    performanceLimit: config.performanceLimit,
                    paths: inflatedPaths,
                    color: toolpathColor,
                    opacity: 1,
                    z: zval,
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
                console.log('Pocket already done after ' + i + ' iterations');
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

  workerDragknifePath = function(config) { //}, infobject, inflateVal, zstep, zdepth) {
    var dragknifeGrp = new THREE.Group();
    console.log("user wants to create Drag Knife Path. val:", config.offset);
    var clipperPaths = workerGetClipperPaths(config.toolpath)
    // console.log("clipperPaths:", clipperPaths);
    // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
    var newClipperPaths = workerSimplifyPolygons(clipperPaths);

    if (newClipperPaths.length < 1) {
      console.error("Clipper Simplification Failed!:");
    }

    var zval = 0
    var polygons = newClipperPaths;
    polygons = polygons.map(function(poly) {
      // return addCornerActions(poly, Math.pow(2, 20) * 5, 20 / 180 * Math.PI);
      return addCornerActions(poly, config.offset, 20 / 180 * Math.PI);
    });
    var drawClipperPathsconfig = {
      performanceLimit: config.performanceLimit,
      paths: polygons,
      color: toolpathColor,
      opacity: 1,
      z: zval,
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
      // break;
    }
    console.log('here', dragknifeGrp)
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

  // All the credit for this functionality goes to @tbfleming: https://github.com/tbfleming

  var clipperToCppScale = 1 / 128; // Prevent overflow for coordinates up to ~1000 mm
  var inchToClipperScale = 1270000000;
  var mmToClipperScale = inchToClipperScale / 25.4; // 50000000;
  var clipperToCppScale = 1 / 128; // Prevent overflow for coordinates up to ~1000 mm
  var cleanPolyDist = 100;
  var arcTolerance = 10000;
  var fillColor = 0x006666;

  function fillPath(config) {
    console.log(config)
    var geometry = workerGetClipperPaths(config.toolpath)
    var geometryInside = workerGetInflatePath(geometry, -config.offset);
    var scale = 100;
    ClipperLib.JS.ScaleUpPaths(geometryInside, scale);
    var lineDistance = config.offset * 200;
    var angle = config.angle;
    if (!geometryInside.length || !geometryInside[0].length) {
      // console.log("Invalid Geometry", geometry)
      return [];
    } else {
      // console.log("Valid Geometry", geometry)
    }
    let bounds = clipperBounds(geometryInside);
    let cx = (bounds.minX + bounds.maxX) / 2;
    let cy = (bounds.minY + bounds.maxY) / 2;
    let r = dist(cx, cy, bounds.minX, bounds.minY) + lineDistance;

    let m = mat3.fromTranslation([], [cx, cy]);
    m = mat3.rotate([], m, angle * Math.PI / 180);
    m = mat3.translate([], m, [-cx, -cy]);
    let makePoint = (x, y) => {
      let p = vec2.transformMat3([], [x, y], m);
      return {
        X: p[0],
        Y: p[1]
      };
    }

    let scan = [];
    for (let y = cy - r; y < cy + r; y += lineDistance * 2) {
      scan.push(
        makePoint(cx - r, y),
        makePoint(cx + r, y),
        makePoint(cx + r, y + lineDistance),
        makePoint(cx - r, y + lineDistance),
      );
    }

    var allPaths = [];
    let separated = separateTabs(scan, geometryInside);
    // console.log("separated", separated)
    for (i = 1; i < separated.length; i += 2) {
      // console.log(i, separated[i])
      allPaths.push(separated[i]);
    }
    // console.log("allPaths", allPaths)
    var drawings = mergePaths(null, allPaths, config);
    var inflateGrpZ = new THREE.Group();
    var inflateGrp = new THREE.Group();
    var prettyGrp = new THREE.Group();
    inflateGrp = drawings.lines;
    inflateGrp.userData.material = inflateGrp.material;
    inflateGrpZ.add(inflateGrp);
    prettyGrp.add(drawings.pretty)
    // console.log(drawings)
    inflateGrpZ.userData.pretty = prettyGrp
    return inflateGrpZ
  };

  function mergePaths(bounds, paths, config) {
    // console.log("inside mergePaths")
    if (paths.length === 0) {
      console.log("Paths 0 length")
      return [];
    }


    let currentPath = paths[0];
    if (pathIsClosed(currentPath)) {
      currentPath.push(currentPath[0]);
    }
    let currentPoint = currentPath[currentPath.length - 1];
    paths[0] = [];

    let mergedPaths = [];
    let numLeft = paths.length - 1;
    while (numLeft > 0) {
      let closestPathIndex = null;
      let closestPointIndex = null;
      let closestPointDist = null;
      let closestReverse = false;
      for (let pathIndex = 0; pathIndex < paths.length; ++pathIndex) {
        let path = paths[pathIndex];

        function check(pointIndex) {
          let point = path[pointIndex];
          let dist = (currentPoint.X - point.X) * (currentPoint.X - point.X) + (currentPoint.Y - point.Y) * (currentPoint.Y - point.Y);
          if (closestPointDist === null || dist < closestPointDist) {
            closestPathIndex = pathIndex;
            closestPointIndex = pointIndex;
            closestPointDist = dist;
            closestReverse = false;
            return true;
          } else
            return false;
        }
        if (pathIsClosed(path)) {
          for (let pointIndex = 0; pointIndex < path.length; ++pointIndex) {
            check(pointIndex);
          }

        } else if (path.length) {
          check(0);
          if (check(path.length - 1))
            closestReverse = true;
        }
      }

      let path = paths[closestPathIndex];
      paths[closestPathIndex] = [];
      numLeft -= 1;
      let needNew;
      if (pathIsClosed(path)) {
        needNew = crosses(bounds, currentPoint, path[closestPointIndex]);
        path = path.slice(closestPointIndex, path.length).concat(path.slice(1, closestPointIndex));
        path.push(path[0]);
      } else {
        needNew = true;
        if (closestReverse) {
          path = path.slice();
          path.reverse();
        }
      }
      if (needNew) {
        mergedPaths.push(currentPath);
        currentPath = path;
        currentPoint = currentPath[currentPath.length - 1];
      } else {
        currentPath = currentPath.concat(path);
        currentPoint = currentPath[currentPath.length - 1];
      }
    }
    mergedPaths.push(currentPath);

    let camPaths = [];
    for (let i = 0; i < mergedPaths.length; ++i) {
      let path = mergedPaths[i];
      camPaths.push(path)
    }


    // return camPaths;

    var scale = 100;
    ClipperLib.JS.ScaleDownPaths(camPaths, scale);

    var drawClipperPathsconfig = {
      performanceLimit: config.performanceLimit,
      paths: camPaths,
      color: toolpathColor,
      opacity: 1,
      z: 0,
      name: 'inflateGrp',
      leadInPaths: false,
      tabdepth: false,
      tabspace: false,
      tabwidth: false,
      toolDia: config.offset * 2,
      drawPretty: true,
      prettyGrpColor: fillColor
    }
    var drawings = drawClipperPathsWithTool(drawClipperPathsconfig);
    // console.log(JSON.stringify(drawings));
    return drawings;
  }

  function clipperBounds(paths) {
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    let maxY = -Number.MAX_VALUE;
    for (let path of paths) {
      for (let pt of path) {
        minX = Math.min(minX, pt.X);
        maxX = Math.max(maxX, pt.X);
        minY = Math.min(minY, pt.Y);
        maxY = Math.max(maxY, pt.Y);
      }
    }
    return {
      minX,
      minY,
      maxX,
      maxY
    };
  }

  function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }

  let displayedCppTabError1 = false;
  let displayedCppTabError2 = false;


  function separateTabs(cutterPath, tabGeometry) {
    if (tabGeometry.length === 0)
      return [cutterPath];
    if (typeof Module === 'undefined') {
      if (!displayedCppTabError1) {
        console.log("Failed to load cam-cpp.js; tabs will be missing. This message will not repeat.");
        displayedCppTabError1 = true;
      }
      return cutterPath;
    }

    let memoryBlocks = [];

    let cCutterPath = clipperPathsToCPaths(memoryBlocks, [cutterPath]);
    let cTabGeometry = clipperPathsToCPaths(memoryBlocks, tabGeometry);

    let errorRef = Module._malloc(4);
    let resultPathsRef = Module._malloc(4);
    let resultNumPathsRef = Module._malloc(4);
    let resultPathSizesRef = Module._malloc(4);
    memoryBlocks.push(errorRef);
    memoryBlocks.push(resultPathsRef);
    memoryBlocks.push(resultNumPathsRef);
    memoryBlocks.push(resultPathSizesRef);

    //extern "C" void separateTabs(
    //    double** pathPolygons, int numPaths, int* pathSizes,
    //    double** tabPolygons, int numTabPolygons, int* tabPolygonSizes,
    //    bool& error,
    //    double**& resultPaths, int& resultNumPaths, int*& resultPathSizes)
    Module.ccall(
      'separateTabs',
      'void', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number'], [cCutterPath[0], cCutterPath[1], cCutterPath[2], cTabGeometry[0], cTabGeometry[1], cTabGeometry[2], errorRef, resultPathsRef, resultNumPathsRef, resultPathSizesRef]);

    if (Module.HEAPU32[errorRef >> 2] && !displayedCppTabError2) {
      showAlert("Internal error processing tabs; tabs will be missing. This message will not repeat.", "danger", false);
      displayedCppTabError2 = true;
    }

    let result = cPathsToClipperPaths(memoryBlocks, resultPathsRef, resultNumPathsRef, resultPathSizesRef);

    for (let i = 0; i < memoryBlocks.length; ++i)
      Module._free(memoryBlocks[i]);

    return result;
  }

  function clipperPathsToCPaths(memoryBlocks, clipperPaths) {
    let doubleSize = 8;

    let cPaths = Module._malloc(clipperPaths.length * 4);
    memoryBlocks.push(cPaths);
    let cPathsBase = cPaths >> 2;

    let cPathSizes = Module._malloc(clipperPaths.length * 4);
    memoryBlocks.push(cPathSizes);
    let cPathSizesBase = cPathSizes >> 2;

    for (let i = 0; i < clipperPaths.length; ++i) {
      let clipperPath = clipperPaths[i];

      let cPath = Module._malloc(clipperPath.length * 2 * doubleSize + 4);
      memoryBlocks.push(cPath);
      if (cPath & 4)
        cPath += 4;
      //console.log("-> " + cPath.toString(16));
      let pathArray = new Float64Array(Module.HEAPU32.buffer, Module.HEAPU32.byteOffset + cPath);

      for (let j = 0; j < clipperPath.length; ++j) {
        let point = clipperPath[j];
        pathArray[j * 2] = point.X
        pathArray[j * 2 + 1] = point.Y
      }

      Module.HEAPU32[cPathsBase + i] = cPath;
      Module.HEAPU32[cPathSizesBase + i] = clipperPath.length;
    }

    return [cPaths, clipperPaths.length, cPathSizes];
  }

  // Convert C paths to Clipper paths. double**& cPathsRef, int& cNumPathsRef, int*& cPathSizesRef
  // Each point has X, Y (stride = 2).
  function cPathsToClipperPaths(memoryBlocks, cPathsRef, cNumPathsRef, cPathSizesRef) {
    let cPaths = Module.HEAPU32[cPathsRef >> 2];
    memoryBlocks.push(cPaths);
    let cPathsBase = cPaths >> 2;

    let cNumPaths = Module.HEAPU32[cNumPathsRef >> 2];

    let cPathSizes = Module.HEAPU32[cPathSizesRef >> 2];
    memoryBlocks.push(cPathSizes);
    let cPathSizesBase = cPathSizes >> 2;

    let clipperPaths = [];
    for (let i = 0; i < cNumPaths; ++i) {
      let pathSize = Module.HEAPU32[cPathSizesBase + i];
      let cPath = Module.HEAPU32[cPathsBase + i];
      // cPath contains value to pass to Module._free(). The aligned version contains the actual data.
      memoryBlocks.push(cPath);
      if (cPath & 4)
        cPath += 4;
      let pathArray = new Float64Array(Module.HEAPU32.buffer, Module.HEAPU32.byteOffset + cPath);

      let clipperPath = [];
      clipperPaths.push(clipperPath);
      for (let j = 0; j < pathSize; ++j)
        clipperPath.push({
          X: pathArray[j * 2],
          Y: pathArray[j * 2 + 1],
        });
    }

    return clipperPaths;
  }

  function pathIsClosed(clipperPath) {
    // console.log("inside pathIsClosed", clipperPath, clipperPath.length >= 2 && clipperPath[0].X === clipperPath[clipperPath.length - 1].X && clipperPath[0].Y === clipperPath[clipperPath.length - 1].Y)
    if (clipperPath.length >= 2 && clipperPath[0].X === clipperPath[clipperPath.length - 1].X && clipperPath[0].Y === clipperPath[clipperPath.length - 1].Y) {
      return true;
    } else {
      return false;
    }

  }

  // Does the line from p1 to p2 cross outside of bounds?
  function crosses(bounds, p1, p2) {
    console.log("inside crosses")
    if (bounds === null)
      return true;
    if (p1.X === p2.X && p1.Y === p2.Y)
      return false;
    let clipper = new ClipperLib.Clipper();
    clipper.AddPath([p1, p2], ClipperLib.PolyType.ptSubject, false);
    clipper.AddPaths(bounds, ClipperLib.PolyType.ptClip, true);
    let result = new ClipperLib.PolyTree();
    clipper.Execute(ClipperLib.ClipType.ctIntersection, result, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
    if (result.ChildCount() === 1) {
      let child = result.Childs()[0];
      let points = child.Contour();
      if (points.length === 2) {
        if (points[0].X === p1.X && points[1].X === p2.X && points[0].Y === p1.Y && points[1].Y === p2.Y)
          return false;
        if (points[0].X === p2.X && points[1].X === p1.X && points[0].Y === p2.Y && points[1].Y === p1.Y)
          return false;
      }
    }
    return true;
  }

  function workerDrill(config) {
    console.log(config)
    var drillPath = new THREE.Group();
    var prettyGrp = new THREE.Group();

    // Pretty View of Circle
    var radius = config.offset;
    var geometry = new THREE.CircleGeometry(radius, 32);
    geometry.vertices.shift();
    var endx = parseFloat(geometry.vertices[0].x)
    var endy = parseFloat(geometry.vertices[0].y)
    var endz = parseFloat(0)
    geometry.vertices.push(
      new THREE.Vector3(endx, endy, endz),
    );
    var material = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true
    });
    var geometry2 = new THREE.Geometry();
    //
    for (k = 0; k < geometry.vertices.length; k++) {
      var x = parseFloat(geometry.vertices[k].x)
      var y = parseFloat(geometry.vertices[k].y)
      var z = parseFloat(0)
      geometry2.vertices.push(
        new THREE.Vector3(x, y, z),
      );
    }
    //
    // console.log(geometry, geometry2)
    var circle = new THREE.Line(geometry2, material);

    config.toolpath.traverse(function(child) {
      // console.log('Traverse: ', child)
      if (child.name == "inflatedGroup") {
        console.log("this is the inflated path from a previous run. ignore.");
        return;
      } else if (child.type == "Line") {
        var drillEntity = new THREE.Group();
        var bbox2 = new THREE.Box3().setFromObject(child);
        // console.log(bbox2)
        var center = new THREE.Vector3(
          bbox2.min.x + ((bbox2.max.x - bbox2.min.x) / 2),
          bbox2.min.y + ((bbox2.max.y - bbox2.min.y) / 2),
          bbox2.min.z + ((bbox2.max.z - bbox2.min.z) / 2)
        );

        console.log(center)

        var lastz = 0

        if (config.toolpath.userData.camOperation == "Drill: Peck (Centered)") {
          for (x = 0; x < config.zdepth + config.zstep; x += config.zstep) {
            if (x > config.zdepth) {
              var zval = -config.zdepth;
            } else {
              var zval = -x
            }

            var geometry = new THREE.Geometry();
            geometry.vertices.push(
              new THREE.Vector3(center.x, center.y, lastz),
              new THREE.Vector3(center.x, center.y, zval),
              new THREE.Vector3(center.x, center.y, 0),
            );
            //
            var pretty = shapeFromLine(circle, 0x6666600, 0.4)
            // console.log(pretty)
            // pretty.position.z = zval;
            pretty.position.setX(center.x);
            pretty.position.setY(center.y);
            pretty.position.setZ(zval);
            pretty.updateMatrix();
            prettyGrp.add(pretty)
            var material = new THREE.LineBasicMaterial({
              color: 0x000000
            });

            var line = new THREE.Line(geometry, material);
            drillEntity.add(line)
            lastz = zval
          }
        } else if (config.toolpath.userData.camOperation == "Drill: Continuous (Centered)") {
          var pretty = shapeFromLine(circle, 0x6666600, 0.4)
          pretty.position.setX(center.x);
          pretty.position.setY(center.y);
          pretty.position.setZ(-config.zdepth);
          pretty.updateMatrix();
          prettyGrp.add(pretty)
          var material = new THREE.LineBasicMaterial({
            color: 0x000000
          });

          var geometry = new THREE.Geometry();
          geometry.vertices.push(
            new THREE.Vector3(center.x, center.y, lastz),
            new THREE.Vector3(center.x, center.y, -config.zdepth),
            new THREE.Vector3(center.x, center.y, 0),
          );
          var line = new THREE.Line(geometry, material);
          drillPath.add(line)
          lastz = zval
        }
        drillPath.add(drillEntity);
      } else if (child.type == "Points") {
        child.visible = false;
      } else {
        // console.log("type of ", child.type, " being skipped");
      }
    });
    drillPath.userData.pretty = prettyGrp
    return drillPath;
  }

  function shapeFromLine(object, color, opacity) {
    if (object.geometry.vertices && object.geometry.vertices.length > 2) {
      var newShape = new THREE.Shape();
      newShape.moveTo(object.geometry.vertices[0].x, object.geometry.vertices[0].y)
      for (k = 0; k < object.geometry.vertices.length; k++) {
        newShape.lineTo(object.geometry.vertices[k].x, object.geometry.vertices[k].y);
      }
      newShape.autoClose = true;
      var geometry = new THREE.ShapeGeometry(newShape);
      var material = new THREE.MeshBasicMaterial({
        color: color,
        overdraw: 0.5,
        opacity: opacity,
        side: THREE.DoubleSide,
      });
      // material.color.setRGB(0, 0.48, 1);
      material.transparent = true;
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(object.position.x, object.position.y, object.position.z);
      mesh.rotation.set(object.rotation.x, object.rotation.x, object.rotation.x);
      mesh.scale.set(object.scale.x, object.scale.y, object.scale.z);
      return mesh
    }

  }



  // End if in Worker
}