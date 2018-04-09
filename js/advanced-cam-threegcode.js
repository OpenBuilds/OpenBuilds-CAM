/*
    AUTHOR: Peter van der Walt
    Based on code from:  John Lauer, Todd Fleming, Nicholas Raynaud and others
*/
var inflateGrp, fileParentGroup, svgPath, y, shape, lines, line;
var options = {};

inflatePath = function(infobject, inflateVal, zstep, zdepth, leadinval, tabdepth) {
    var zstep = parseFloat(zstep, 2);
    var zdepth = parseFloat(zdepth, 2);
    var inflateGrpZ = new THREE.Group();
    if (typeof(inflateGrp) != 'undefined') {
        scene.remove(inflateGrp);
        inflateGrp = null;
    }
    infobject.updateMatrix();
    var grp = infobject;
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
                var worldPt = grp.localToWorld(localPt.clone());
                var xpos = worldPt.x;
                var ypos = worldPt.y;

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
    // console.log("clipperPaths:", clipperPaths);

    // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
    var newClipperPaths = simplifyPolygons(clipperPaths);
    if (newClipperPaths.length < 1) {
        console.error("Clipper Simplification Failed!:");
        printLog('Clipper Simplification Failed!', errorcolor, "viewer");
    } else {
      // console.log(newClipperPaths);
    }

    for (j=0; j<newClipperPaths.length; j++) {
      var pathobj = [];
      pathobj.push(newClipperPaths[j])
      var inflatedPaths = getInflatePath(pathobj, inflateVal);
      // console.log(inflatedPaths);
      // plasma lead-in
      if (leadinval > 0 ) {
        var leadInPaths = getInflatePath(newClipperPaths[j], inflateVal*2);
      }
      for (i = 0; i < zdepth; i += zstep) {
          inflateGrp = drawClipperPaths(inflatedPaths, 0xff00ff, 0.8, -i, true, "inflatedGroup", leadInPaths, tabdepth);
          inflateGrp.name = 'inflateGrp'+j+"_"+i;
          inflateGrp.userData.material = inflateGrp.material;
          if (inflateGrp.userData.color) {
            inflateGrp.userData.color = inflateGrp.material.color.getHex();
          }

          inflateGrp.position = infobject.position;
          // console.log(j+"_"+i);
          inflateGrpZ.add(inflateGrp);
      }

    }
    // get the inflated/deflated path
    // console.log(inflateGrpZ)
    return inflateGrpZ;
};


pocketPath = function(infobject, inflateVal, zstep, zdepth) {
    var zstep = parseFloat(zstep, 2);
    var zdepth = parseFloat(zdepth, 2);
    var pocketGrp = new THREE.Group();
    if (typeof(inflateGrp) != 'undefined') {
        scene.remove(inflateGrp);
        inflateGrp = null;
    }
    if (inflateVal != 0) {
        console.log("user wants to inflate. val:", inflateVal);
        infobject.updateMatrix();
        var grp = infobject;
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
                    var worldPt = grp.localToWorld(localPt.clone());
                    var xpos = (parseFloat(worldPt.x.toFixed(3)));
                    var ypos = (parseFloat(worldPt.y.toFixed(3)));

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
                console.log("type of ", child.type, " being skipped");
            }
        });

        console.log("clipperPaths:", clipperPaths);

        // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
        var newClipperPaths = simplifyPolygons(clipperPaths);

        if (newClipperPaths.length < 1) {
            console.error("Clipper Simplification Failed!:");
            printLog('Clipper Simplification Failed!', errorcolor, "viewer");
        }

        for (j = 0; j < zdepth; j += zstep) {
            // get the inflated/deflated path

          for (i = 1; i < 100; i++) {  // Rather 100 than a while loop, just in case
            inflateValUsed = inflateVal * i;
            var inflatedPaths = getInflatePath(newClipperPaths, -inflateValUsed);
            inflateGrp = drawClipperPaths(inflatedPaths, 0xff00ff, 0.8, -j, true, "inflatedGroup"); // (paths, color, opacity, z, zstep, isClosed, isAddDirHelper, name, inflateVal)
            if (inflateGrp.children.length) {
              inflateGrp.name = 'inflateGrp';
              inflateGrp.position = infobject.position;
              // pocketGrp.userData.color = pocketGrp.material.color.getHex();
              pocketGrp.add(inflateGrp);
            } else {
              // console.log('Pocket already done after ' + i + ' iterations');
              break;
            }
          }
        }
        return pocketGrp;
    }
};

dragknifePath = function(infobject, inflateVal, zstep, zdepth) {
    var zstep = parseFloat(zstep, 2);
    var zdepth = parseFloat(zdepth, 2);
    var dragknifeGrp = new THREE.Group();
    if (typeof(inflateGrp) != 'undefined') {
        scene.remove(inflateGrp);
        inflateGrp = null;
    }

    // if (inflateVal != 0) {
        console.log("user wants to create Drag Knife Path. val:", inflateVal);
        infobject.updateMatrix();
        var grp = infobject;
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
                    var worldPt = grp.localToWorld(localPt.clone());
                    var xpos = worldPt.x;
                    var ypos = worldPt.y;

                    var xpos_offset = child.position.x;
                    var ypos_offset = child.position.y;

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
                console.log("type of ", child.type, " being skipped");
            }
        });

        console.log("clipperPaths:", clipperPaths);

        // simplify this set of paths which is a very powerful Clipper call that figures out holes and path orientations
        var newClipperPaths = simplifyPolygons(clipperPaths);

        if (newClipperPaths.length < 1) {
            console.error("Clipper Simplification Failed!:");
            printLog('Clipper Simplification Failed!', errorcolor, "viewer")
        }



        for (j = 0; j < zdepth; j += zstep) {
            var polygons = newClipperPaths;
            polygons = polygons.map(function (poly) {
              // return addCornerActions(poly, Math.pow(2, 20) * 5, 20 / 180 * Math.PI);
              return addCornerActions(poly, inflateVal, 20 / 180 * Math.PI);
            });
            inflateGrp = drawClipperPaths(polygons, 0xff00ff, 0.8, -j, true, "inflatedGroup"); // (paths, color, opacity, z, zstep, isClosed, isAddDirHelper, name, inflateVal)
            if (inflateGrp.children.length) {
              inflateGrp.name = 'dragknifeGrp';
              inflateGrp.position = infobject.position;
              // dragknifeGrp.userData.color = dragknifeGrp.material.color.getHex();
              dragknifeGrp.add(inflateGrp)
            } else {
              console.log('Dragknife Operation Failed')
              break;
            }
        }
        return dragknifeGrp
};

addCornerActions = function (clipperPolyline, clipperRadius, toleranceAngleRadians) {
  // var previousPoint = null;
  // var point = [];
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
   sqDistance: function (p) {
    var d = p == null ? this : this.sub(p);
    return d.X * d.X + d.Y * d.Y + d.Z * d.Z;
  },
  sub: function (p) {
      //  console.log("sub.x: ", this.x, " p.x ", p.x)
       return new Point(this.X - p.X, this.Y - p.Y, this.Z - p.Z);
  },
  angle: function (fromPoint, toPoint) {
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
  normalized: function () {
      // console.log("normalized.distance: ", this.distance())
       return this.scale(1 / this.distance());
       console.log("normalized: ", this.scale(1 / this.distance()))
  },
  scale: function (val) {
       return new Point(this.X * val, this.Y * val, this.Z * val);
  },
  distance: function (p) {
       return Math.sqrt(this.sqDistance(p));
  },
  add: function (p) {
       return new Point(this.X + p.X, this.Y + p.Y, this.Z + p.Z);
  },
  atan2: function () {
       return Math.atan2(this.Y, this.Y);
  },
};

polarPoint = function (r, theta) {
  return new Point(r * Math.cos(theta), r * Math.sin(theta));
};


simplifyPolygons = function(paths) {
    // console.log('Simplifying: ', paths);
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
    ClipperLib.JS.Clean (paths, 2);
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

drawClipperPaths = function(paths, color, opacity, z, isClosed, name, leadInPaths, tabdepth) {
    // console.log("drawClipperPaths", paths);
    // console.log("drawClipperPathsLeadIn", leadInPaths);
    if (leadInPaths) {
        if (leadInPaths.length != paths.length) {
          console.log("Skipping lead-in: Source vector file is broken, and we could not produce a reliable offset")
          printLog('Skipping lead-in: Source vector file is broken, and we could not produce a reliable offset', warncolor, "settings");
        }
    }
    // console.log("Compare lead-in: " + paths.length + " / " + leadInPaths.length)

    var lineUnionMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
    });

    if (z === undefined || z == null)
        z = 0;

    if (isClosed === undefined || isClosed == null)
        isClosed = true;

    var group = new THREE.Object3D();
    if (name) group.name = name;

    if (z < tabdepth) {
      console.log("tab layer at depth " + z + " - below tab of " + tabdepth )
    }

    for (var i = 0; i < paths.length; i++) {
        var lineUnionGeo = new THREE.Geometry();
        if (leadInPaths) {
          if (leadInPaths.length == paths.length) {
            lineUnionGeo.vertices.push(new THREE.Vector3(leadInPaths[i][0].X, leadInPaths[i][0].Y, z));
          }
        }
        for (var j = 0; j < paths[i].length; j++) {
            lineUnionGeo.vertices.push(new THREE.Vector3(paths[i][j].X, paths[i][j].Y, z));
        }
        // close it by connecting last point to 1st point
        if (isClosed) {
          lineUnionGeo.vertices.push(new THREE.Vector3(paths[i][0].X, paths[i][0].Y, z));
        }
        if (leadInPaths) {
          if (leadInPaths.length == paths.length) {
            lineUnionGeo.vertices.push(new THREE.Vector3(leadInPaths[i][0].X, leadInPaths[i][0].Y, z));
          }
        }

        var lineUnion = new THREE.Line(lineUnionGeo, lineUnionMat);
        if (name) {
          lineUnion.name = name;
        }
        group.add(lineUnion);
    }
    return group;
};
