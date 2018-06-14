/*
    AUTHOR: Peter van der Walt
    Based on code from:  John Lauer, Todd Fleming, Nicholas Raynaud and others
*/

// todo union for pocketGrp, etc...
// todo select and then Move

//todo: tabs: constrain tabwidth > tooldia+saneminimum

var inflateGrp, fileParentGroup, svgPath, y, shape, lines, line;
var options = {};

var insideCutsColor = 0x660000;
var outsideCutsColor = 0x000066;
var pocketColor = 0x006600;
var toolpathColor = 0x666600;

var minimumToolDiaForPreview = 0.04;

inflatePath = function(config) { //}, infobject, inflateVal, zstep, zdepth, zstart, leadinval, tabdepth, union) {
  var inflateGrpZ = new THREE.Group();
  var prettyGrp = new THREE.Group();
  var clipperPaths = getClipperPaths(config.toolpath)
  if (config.union == "Yes") {
    // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
    var newClipperPaths = simplifyPolygons(clipperPaths);
    if (newClipperPaths.length < 1) {
      console.error("Clipper Simplification Failed!:");
    } else {
      // var newClipperPaths = clipperPaths;
    }
    var inflatedPaths = getInflatePath(newClipperPaths, config.offset);
    console.log(inflatedPaths);
    if (config.leadinval > 0) { // plasma lead-in
      var leadInPaths = getInflatePath(newClipperPaths, config.offset * 3);
    }
    for (i = config.zstart + config.zstep; i < config.zdepth + config.zstep; i += config.zstep) {
      if (i * config.zstep < config.zdepth) {
        var zval = -i
      } else {
        var zval = -config.zdepth;
      }
      // console.log(config.zstart, config.zstep, config.zdepth, zval);
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
      prettyGrp.add(drawings.pretty)
    }
  } else {
    var newClipperPaths = clipperPaths;
    for (j = 0; j < newClipperPaths.length; j++) {
      var pathobj = [];
      pathobj.push(newClipperPaths[j])
      var inflatedPaths = getInflatePath(pathobj, config.offset);
      // plasma lead-in
      if (config.leadinval > 0) {
        var leadInPaths = getInflatePath(pathobj, config.offset * 3);
      }
      for (i = config.zstart + config.zstep; i < config.zdepth + config.zstep; i += config.zstep) {
        if (i > config.zdepth) {
          var zval = -config.zdepth
        } else {
          var zval = -i
        }
        // console.log(i, zstart, zstep, zdepth, zval);
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
        prettyGrp.add(drawings.pretty)
      }
    }
  }
  if (config.offset > minimumToolDiaForPreview || config.offset < -minimumToolDiaForPreview) { //Dont show for very small offsets, not worth the processing time
    inflateGrpZ.userData.pretty = prettyGrp
  };
  return inflateGrpZ;
};

pocketPath = function(config) { //}, infobject, inflateVal, stepOver, zstep, zdepth, zstart, union) {
  var pocketGrp = new THREE.Group();
  var prettyGrp = new THREE.Group();
  if (config.offset != 0) {
    var clipperPaths = getClipperPaths(config.toolpath)
    // console.log("clipperPaths:", clipperPaths);
    if (config.union == "Yes") {
      console.log("Union")
      // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
      var newClipperPaths = simplifyPolygons(clipperPaths);
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
                  opacity: 0.8,
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
                prettyGrp.add(drawings.pretty)
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
      return pocketGrp;
    } else {
      console.log("Not Union: Running Pockets on non-unions not supported yet: Highly unlikely that an object inside an object needs to be pocket to same depth ever")
    } // end no union
  }
};

dragknifePath = function(config) { //}, infobject, inflateVal, zstep, zdepth) {
  var dragknifeGrp = new THREE.Group();
  // console.log("user wants to create Drag Knife Path. val:", inflateVal);
  var clipperPaths = getClipperPaths(config.toolpath)
  // console.log("clipperPaths:", clipperPaths);
  // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
  var newClipperPaths = simplifyPolygons(clipperPaths);

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

simplifyPolygons = function(paths) {
  console.log('Simplifying: ', paths);
  var scale = 10000;
  ClipperLib.JS.ScaleUpPaths(paths, scale);
  var newClipperPaths = ClipperLib.Clipper.SimplifyPolygons(paths, ClipperLib.PolyFillType.pftEvenOdd);
  // console.log('Simplified: ', newClipperPaths);
  // scale back down
  ClipperLib.JS.ScaleDownPaths(newClipperPaths, scale);
  ClipperLib.JS.ScaleDownPaths(paths, scale);
  return newClipperPaths;
};

getInflatePath = function(paths, delta, joinType) {
  // console.log(paths.length)
  var scale = 10000;
  ClipperLib.JS.Clean(paths, 2);
  ClipperLib.JS.ScaleUpPaths(paths, scale);
  var miterLimit = 3;
  var arcTolerance = 10;
  joinType = joinType ? joinType : ClipperLib.JoinType.jtRound;
  var co = new ClipperLib.ClipperOffset(miterLimit, arcTolerance);
  co.AddPaths(paths, joinType, ClipperLib.EndType.etClosedPolygon);
  //var delta = 0.0625; // 1/16 inch endmill
  var offsetted_paths = new ClipperLib.Paths();
  co.Execute(offsetted_paths, delta * scale);
  // scale back down
  ClipperLib.JS.ScaleDownPaths(offsetted_paths, scale);
  ClipperLib.JS.ScaleDownPaths(paths, scale);
  return offsetted_paths;
};

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

function getClipperPaths(object) {
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
      for (i = 0; i < child.geometry.vertices.length; i++) {
        var localPt = child.geometry.vertices[i];
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
    } else if (child.type == "Points") {
      child.visible = false;
    } else {
      // console.log("type of ", child.type, " being skipped");
    }
  });
  return clipperPaths
}

// borrowed tab generator code from https://github.com/andrewhodel/millcrum/blob/master/inc/mc.js
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