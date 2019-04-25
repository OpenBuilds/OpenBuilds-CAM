function parseGerber(e, name) {
  console.log(Gerber.render(e))
  var t, n = !0;
  signalBottomPrimitives = mergeAllPrimitives(Gerber.render(e), "#90ffa0");
  // console.log(signalBottomPrimitives)
  var gerber = new THREE.Object3D()

  // console.log(signalBottomPrimitives)
  for (i = 0; i < signalBottomPrimitives[0].polygon.length; i++) {
    var polygon = signalBottomPrimitives[0].polygon[i]
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({
      color: 0x000000
    });
    if (polygon.length > 3) {
      for (j = 0; j < polygon.length; j++) {
        // console.log(polygon[j])
        var x = parseFloat(polygon[j].X)
        var y = parseFloat(polygon[j].Y)
        // console.log(x, y)
        geometry.vertices.push(new THREE.Vector3(x, y, 0));
      }
      // Close Segment
      var x = parseFloat(polygon[0].X)
      var y = parseFloat(polygon[0].Y)
      // console.log(x, y)
      geometry.vertices.push(new THREE.Vector3(x, y, 0));
      var line = new THREE.Line(geometry, material);
      var layer = {
        label: "copper"
      }
      line.userData.layer = layer
      line.name = "path" + j
      gerber.add(line)
    }
  }
  gerber.name = name
  objectsInScene.push(gerber)
  fillTree();
  // scene.add(gerber)
}

function parseExcellon(e, name) {
  var t = !0;
  drillData = Excellon.parse(e);
  console.log(drillData);
  var drillLayer = new THREE.Group()

  for (var n in drillData) {
    if (drillData.hasOwnProperty(n)) {
      for (var o = drillData[n], a = 0; a < o.drills.length; a++) {
        var i = o.drills[a];
        // console.log("Drill at X:" + i.X + " / Y:" + i.Y + "  of " + o.diameter + "mm Dia")
        var radius = o.diameter / 2;
        var geometry = new THREE.CircleGeometry(radius, 32);
        geometry.vertices.shift();
        var endx = parseFloat(geometry.vertices[0].x)
        var endy = parseFloat(geometry.vertices[0].y)
        var endz = parseFloat(geometry.vertices[0].z)
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
          var z = parseFloat(geometry.vertices[k].z)
          geometry2.vertices.push(
            new THREE.Vector3(x, y, z),
          );
        }
        //
        // console.log(geometry, geometry2)
        var circle = new THREE.Line(geometry2, material);
        var layer = {
          label: "drill-" + n,
          diameter: o.diameter
        }
        circle.userData.layer = layer
        circle.position.x = parseFloat(i.X / 10);
        circle.position.y = parseFloat(i.Y / 10);
        circle.name = "hole" + n + a
        drillLayer.add(circle)
      }
    }
  }
  drillLayer.name = name
  objectsInScene.push(drillLayer)
  changePositionToGeoTranslate()
  fillTree();
  // return drillLayer
}

function convertSizes(e) {
  for (var t = ["materialWidth", "materialHeight", "materialThickness", "flatMargin", "flatDepth", "flatFeedRate", "bottomOffsetX", "bottomOffsetY", "contourToolDiameter", "contourSurfaceDiameter", "contourDistance", "contourStep", "contourDepth", "contourFeedRate", "drillOffsetX", "drillOffsetY", "drillDepth", "drillPlungeRate", "hatchesDepth", "hatchesFeedRate", "cutOffsetX", "cutOffsetY", "cutWidth", "cutHeight", "cutToolDiameter", "cutDepth", "cutFeedRate", "gcodeSafeHeight", "gcodeRapidRate"], n = 0; n < t.length; n++) {
    var o = t[n],
      a = $("#" + o),
      i = parseFloat(a.val());
    isNaN(i) || a.val("" + (i * e).toPrecision(3))
  }
}

function polygonOperation(e, t, n) {
  var o = 1e4,
    a = scalePolygon(o, t),
    i = scalePolygon(o, n),
    r = new ClipperLib.Clipper;
  r.AddPaths(a, ClipperLib.PolyType.ptSubject, true),
    r.AddPaths(i, ClipperLib.PolyType.ptClip, true);
  var l = new ClipperLib.Paths;
  return r.Execute(e, l, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero),
    l = ClipperLib.JS.Clean(l, .025 * o),
    scalePolygon(1 / o, l)
}

function mergePolygons(e, t) {
  return polygonOperation(ClipperLib.ClipType.ctUnion, e, t)
}

function clipPolygons(e, t) {
  return polygonOperation(ClipperLib.ClipType.ctDifference, e, t)
}

function intersectPolygons(e, t) {
  return polygonOperation(ClipperLib.ClipType.ctIntersection, e, t)
}

function translatePolygon(e, t, n) {
  for (var o = [], a = 0; a < n.length; a++) {
    for (var i = n[a], r = [], l = 0; l < i.length; l++)
      r.push({
        X: i[l].X + e,
        Y: i[l].Y + t
      });
    o.push(r)
  }
  return o
}

function scalePolygon(e, t) {
  return scaleXYPolygon(e, e, t)
}

function scaleXYPolygon(e, t, n) {
  for (var o = [], a = 0; a < n.length; a++) {
    for (var i = n[a], r = [], l = 0; l < i.length; l++)
      r.push({
        X: i[l].X * e,
        Y: i[l].Y * t
      });
    o.push(r)
  }
  return o
}

function mergeAllPrimitives(e, t) {
  for (var n = [], o = 0; o < e.length; o++) {
    var a = e[o];
    n.push(translatePolygon(a.offsetX, a.offsetY, a.polygon))
  }
  for (; n.length > 1;) {
    for (var i = [], r = 0; r < n.length; r += 2)
      r + 1 < n.length ? i.push(mergePolygons(n[r], n[r + 1])) : i.push(n[r]);
    n = i
  }
  return [{
    offsetX: 0,
    offsetY: 0,
    polygon: n[0],
    fillStyle: t
  }]
}

function fillPolygon(e, t, n, o) {
  // console.log(o)
  var a = {
    offsetX: t,
    offsetY: n,
    polygon: o,
    fillStyle: "#90ffa0"
  };
  e.push(a)
}

function getDistanceFromPointToLine(e, t) {
  var n = e.X,
    o = e.Y,
    a = t.from.X,
    i = t.from.Y,
    r = t.to.X,
    l = t.to.Y,
    s = ((r - a) * (i - o) - (a - n) * (l - i)) / Math.sqrt((r - a) * (r - a) + (l - i) * (l - i));
  return s
}

var layers = [],
  boardGradient = {
    gradient: "#00ffff"
  },
  skyGradient = {
    gradient: "#ff0000"
  },
  milledColor = "#6e6429",
  boardBounds = {
    max: {
      X: 50,
      Y: 50
    },
    min: {
      X: 0,
      Y: 0
    }
  },
  boardLayer = {
    primitives: [{
      offsetX: 0,
      offsetY: 0,
      polygon: [
        [{
          X: boardBounds.max.X,
          Y: boardBounds.min.Y
        }, {
          X: boardBounds.max.X,
          Y: boardBounds.max.Y
        }, {
          X: boardBounds.min.X,
          Y: boardBounds.max.Y
        }, {
          X: boardBounds.min.X,
          Y: boardBounds.min.Y
        }]
      ],
      fillStyle: boardGradient
    }]
  },
  cutLayer = {
    view: "bottomDesign",
    primitives: []
  },
  cutPreviewLayer = {
    primitives: []
  },
  cutPolygon = void 0,
  cutPrimitives = [],
  signalLayer = {
    view: "bottomDesign",
    primitives: []
  },
  signalBottomPrimitives = [],
  contoursLayer = {
    view: "bottomDesign",
    primitives: []
  },
  contoursPreviewLayer = {
    view: "bottomPreview",
    primitives: []
  },
  drillLayer = {
    view: "bottomDesign",
    primitives: []
  },
  drillPreviewLayer = {
    view: "bottomPreview",
    primitives: []
  },
  hatchesLayer = {
    view: "bottomDesign",
    primitives: []
  },
  hatchesPreviewLayer = {
    view: "bottomPreview",
    primitives: []
  };
layers.push(boardLayer),
  layers.push(contoursPreviewLayer),
  layers.push(hatchesPreviewLayer),
  layers.push(drillPreviewLayer),
  layers.push(cutPreviewLayer),
  layers.push(signalLayer),
  layers.push(contoursLayer),
  layers.push(hatchesLayer),
  layers.push(drillLayer),
  layers.push(cutLayer);
var drillData = {},
  drills = [],
  numVertices = 30,
  zoom = .35,
  panX = 280,
  panY = -170,
  canvasWidth = 1e3,
  canvasHeight = 600,
  currentPage = 0,
  pageCount = $(".page").length,
  isMMUnits = !0,
  unitFactor = 1,
  flipOffset = 0;

var Excellon = {
  parse: function(e) {
    function a(e) {
      e ? (n = 1,
        i = 2,
        t = 3) : (n = 25.4,
        i = 2,
        t = 4)
    }

    function r(e) {
      if (e.indexOf(".") === -1) {
        var a = 0 === e.indexOf("-") ? -1 : 1;
        e = e.replace(/\+/g, "").replace(/\-/g, "");
        var r = i + t;
        e = s ? (e + "0000000000000000").substr(0, r) : ("0000000000000000" + e).substr(-r);
        var f = e.substr(0, i) + "." + e.substr(i);
        value = a * parseFloat(f)
      } else
        value = parseFloat(e);
      return value * n
    }
    var n = 1,
      s = !1,
      i = 2,
      t = 3,
      f = void 0,
      c = 0,
      l = 0,
      d = {};
    e = e.replace(/\r\n/g, "\\n").replace(/\n\r/g, "\\n").replace(/\n+/g, "\\n");
    for (var v = e.split("\\n"), p = 0; p < v.length; p++) {
      var u = v[p];
      if ("M71" === u && a(!0),
        "M72" === u && a(!1),
        "M30" === u)
        break;
      if (0 !== u.indexOf("INCH") && 0 !== u.indexOf("METRIC") || (a(0 === u.indexOf("METRIC")),
          u.indexOf(",LZ") > -1 && (s = !0),
          u.indexOf(",TZ") > -1 && (s = !1)),
        0 === u.indexOf("T")) {
        var x = u.match(/^T[0-9]+/);
        if (x) {
          var b = x[0];
          d[b] || (d[b] = {
              name: b,
              drills: []
            }),
            f = d[b];
          for (var o, O = /([A-Z])([\+\-0-9\.]+)/g; o = O.exec(u);) {
            var g = o[1],
              k = o[2];
            switch (g) {
              case "C":
                f.diameter = r(k);
                break;
              case "F":
                f.feedRate = r(k);
                break;
              case "B":
                f.retractRate = r(k);
                break;
              case "Z":
                f.depthOffset = r(k);
                break;
              case "H":
                f.maxHitCount = parseInt(k);
                break;
              case "S":
                f.spindleRpm = 1e3 * parseInt(k)
            }
          }
        }
      }
      if (0 === u.indexOf("X") || 0 === u.indexOf("Y")) {
        for (var h, m = /([XY])([\+\-0-9\.]+)/g; h = m.exec(u);) {
          var C = h[1],
            I = r(h[2]);
          switch (C) {
            case "X":
              c = I;
              break;
            case "Y":
              l = I
          }
        }
        f.drills.push({
          X: c,
          Y: l
        })
      }
    }
    return d
  }
};
var GCode = {
  addProlog: function(t) {
    t.push("( Generated by Rapid-PCB.com )"),
      t.push("( Material Size)"),
      t.push("( X= " + this.materialWidth + ", Y= " + this.materialHeight + ", Z= " + this.materialThickness + ")"),
      t.push("()"),
      t.push("G00"),
      t.push("G17"),
      t.push("G21"),
      t.push("G40"),
      t.push("G49"),
      t.push("G54"),
      t.push("G80"),
      t.push("G90"),
      t.push("G94"),
      t.push("G00 F" + this.rapidRate + " Z" + this.safeHeight),
      t.push("M03 S9000")
  },
  addEpilog: function(t, i) {
    t.push("G00 F" + this.rapidRate + " Z" + this.safeHeight),
      t.push("G00 F" + this.rapidRate + " X0.000 Y0.000"),
      t.push("M05"),
      t.push("M30"),
      t.push("%")
  },
  readSettings: function() {
    this.fractionDigits = 3,
      this.materialWidth = "" + getInputUnitValue("materialWidth").toFixed(this.fractionDigits),
      this.materialHeight = "" + getInputUnitValue("materialHeight").toFixed(this.fractionDigits),
      this.materialThickness = "" + getInputUnitValue("materialThickness").toFixed(this.fractionDigits),
      this.safeHeight = "" + getInputUnitValue("gcodeSafeHeight").toFixed(this.fractionDigits);
    var t = 60 * getInputUnitValue("gcodeRapidRate");
    this.rapidRate = "" + t.toFixed(0),
      this.approachRate = "" + (t / 2).toFixed(0)
  },
  initTimeEstimation: function() {
    this.prevX = void 0,
      this.prevY = void 0,
      this.prevZ = 0,
      this.timeEstimate = 0
  },
  estimateMoveTime: function(t, i, e, s) {
    var h = parseInt(s);
    if ("string" == typeof e && (e = parseInt(e)),
      "number" != typeof t && (t = this.prevX),
      "number" != typeof i && (i = this.prevY),
      "number" != typeof e && (e = this.prevZ),
      "number" == typeof this.prevX && "number" == typeof this.prevY && "number" == typeof this.prevZ) {
      var a = Math.sqrt(Math.pow(t - this.prevX, 2) + Math.pow(i - this.prevY, 2) + Math.pow(e - this.prevZ, 2));
      this.timeEstimate += a / h
    }
    this.prevX = t,
      this.prevY = i,
      this.prevZ = e
  },
  generateMillGCode: function(t, i, e, s, h) {
    this.initTimeEstimation(),
      this.readSettings(),
      s = "" + s.toFixed(this.fractionDigits),
      h = "" + (60 * h).toFixed(0);
    var a = [];
    a.push("( PCB " + t + " )"),
      this.addProlog(a);
    for (var r = 0; r < e.length; r++)
      for (var o = e[r].polygon, p = e[r].offsetX, n = e[r].offsetY, u = 0; u < o.length; u++) {
        var l = o[u];
        a.push("G00 F" + this.rapidRate + " X" + (p + l[0].X).toFixed(this.fractionDigits) + " Y" + (n + l[0].Y).toFixed(this.fractionDigits)),
          this.estimateMoveTime(p + l[0].X, n + l[0].Y, null, this.rapidRate),
          a.push("G00 F" + this.approachRate + " Z0"),
          this.estimateMoveTime(null, null, 0, this.approachRate),
          a.push("G01 F" + h + " Z-" + s),
          this.estimateMoveTime(null, null, -s, h);
        for (var d = 1; d < l.length; d++)
          a.push("G01 F" + h + " X" + (p + l[d].X).toFixed(this.fractionDigits) + " Y" + (n + l[d].Y).toFixed(this.fractionDigits)),
          this.estimateMoveTime(p + l[d].X, n + l[d].Y, null, h);
        a.push("G01 F" + h + " X" + (p + l[0].X).toFixed(this.fractionDigits) + " Y" + (n + l[0].Y).toFixed(this.fractionDigits)),
          this.estimateMoveTime(p + l[0].X, n + l[0].Y, null, h),
          a.push("G00 F" + this.rapidRate + " Z" + this.safeHeight),
          this.estimateMoveTime(null, null, this.safeHeight, this.rapidRate)
      }
    return this.addEpilog(a), {
      gcode: a.join("\r\n"),
      timeEstimate: this.timeEstimate
    }
  },
  generateDrillGCode: function(t, i, e) {
    this.initTimeEstimation(),
      i = "" + i.toFixed(this.fractionDigits),
      e = "" + (60 * e).toFixed(0),
      this.readSettings();
    var s = [];
    s.push("( PCB drills )"),
      this.addProlog(s);
    for (var h = 0; h < t.length; h++) {
      var a = t[h];
      s.push("G00 F" + this.rapidRate + " X" + a.X.toFixed(this.fractionDigits) + " Y" + a.Y.toFixed(this.fractionDigits)),
        this.estimateMoveTime(a.X, a.Y, null, this.rapidRate),
        s.push("G00 F" + this.approachRate + " Z0"),
        this.estimateMoveTime(null, null, 0, this.approachRate),
        s.push("G01 F" + e + " Z-" + i),
        this.estimateMoveTime(null, null, -i, e),
        s.push("G00 F" + this.rapidRate + " Z" + this.safeHeight),
        this.estimateMoveTime(null, null, this.safeHeight, this.rapidRate)
    }
    return this.addEpilog(s), {
      gcode: s.join("\r\n"),
      timeEstimate: this.timeEstimate
    }
  }
};
var apertureScale = 1,
  Gerber = {
    render: function(D) {
      function X(D) {
        var X = 0 === D.indexOf("-") ? -1 : 1;
        D = D.replace(/\+/g, "").replace(/\-/g, "");
        var Y = l.integerDigits + l.fractionDigits;
        D = "L" === l.omitZeros ? ("0000000000000000" + D).substr(-Y) : (D + "0000000000000000").substr(0, Y);
        var e = D.substr(0, l.integerDigits) + "." + D.substr(l.integerDigits);
        return X * h * parseFloat(e)
      }

      function Y(D) {
        return h * parseFloat(D)
      }

      function e(D, X, Y) {
        for (var e = [], t = D / 2, i = 2 * Math.PI / X, r = 0; r < X; r++)
          e.push({
            X: Math.cos(r * i + Y) * t,
            Y: Math.sin(r * i + Y) * t
          });
        return [e]
      }

      function t(D, X) {
        return [
          [{
            X: D / 2,
            Y: -X / 2
          }, {
            X: D / 2,
            Y: X / 2
          }, {
            X: -D / 2,
            Y: X / 2
          }, {
            X: -D / 2,
            Y: -X / 2
          }]
        ]
      }

      function i(D, X, Y) {
        if (D === X)
          return e(D, Y, 0);
        Y = 2 * Math.ceil(Y / 2);
        var t, i, r, s, a = [],
          o = 2 * Math.PI / Y;
        for (t = 0; t <= Y; t++)
          D > X ? (s = (D - X) / 2,
            i = Math.cos(t * o + Math.PI / 2) * X / 2,
            r = Math.sin(t * o + Math.PI / 2) * X / 2,
            t === Y / 2 && a.push({
              X: i - s,
              Y: r
            }),
            i += t < Y / 2 ? -s : s) : (s = (X - D) / 2,
            i = Math.cos(t * o) * D / 2,
            r = Math.sin(t * o) * D / 2,
            t === Y / 2 && a.push({
              X: i,
              Y: r + s
            }),
            r += t < Y / 2 ? s : -s),
          a.push({
            X: i,
            Y: r
          });
        return [a]
      }

      function r(D, X, Y) {
        for (var e = [], t = {
            from: {
              X: 0,
              Y: 0
            },
            to: {
              X: X.X - D.X,
              Y: X.Y - D.Y
            }
          }, i = 0; i < Y.length; i++) {
          for (var r = void 0, s = void 0, a = void 0, o = void 0, n = Y[i], f = 0; f < n.length; f++) {
            var l = n[f],
              p = getDistanceFromPointToLine(l, t);
            (!s || p > r) && (r = p,
              s = l),
            (!o || p < a) && (a = p,
              o = l)
          }
          e.push([{
            X: D.X + s.X,
            Y: D.Y + s.Y
          }, {
            X: X.X + s.X,
            Y: X.Y + s.Y
          }, {
            X: X.X + o.X,
            Y: X.Y + o.Y
          }, {
            X: D.X + o.X,
            Y: D.Y + o.Y
          }])
        }
        return e
      }

      function s(D, X, Y, e, t) {
        for (var i = 0; i < t.primitives.length; i++) {
          var s = t.primitives[i],
            a = r({
              X: D + s.offsetX,
              Y: X + s.offsetY
            }, {
              X: Y + s.offsetX,
              Y: e + s.offsetY
            }, s.polygon),
            o = translatePolygon(D + s.offsetX, X + s.offsetY, s.polygon),
            f = translatePolygon(Y + s.offsetX, e + s.offsetY, s.polygon),
            l = mergePolygons(a, mergePolygons(o, f));
          fillPolygon(n, 0, 0, l)
        }
      }

      function a(D, X, Y) {
        for (var e = 0; e < Y.primitives.length; e++) {
          var t = Y.primitives[e];
          fillPolygon(n, D + t.offsetX, X + t.offsetY, t.polygon)
        }
      }

      function o(D) {
        var X = D.replace(/x/g, "*");
        return X = X.replace(/(\$[0-9A-Z_]+)/gi, function(D, X, Y, e, t) {
            return q[X] || "0"
          }),
          X = X.replace(/X/g, "*"),
          Parser.evaluate(X)
      }
      var n = [];
      D = D.replace(/\r/g, "").replace(/\n/g, "").replace(/%+/g, "%");
      for (var f = D.split("%"), l = {
          integerDigits: 3,
          fractionDigits: 3,
          omitZeros: "L",
          absoluteCoords: !0
        }, p = "(untitled)", h = 1, c = !0, d = !0, u = !1, g = !1, m = "LINEAR", v = {
          a: 0,
          b: 0
        }, O = {
          a: 1,
          b: 1
        }, x = "D02", A = 0, b = 0, P = 0, C = 0, y = {}, M = {}, G = void 0, F = 0; F < f.length; F++) {
        var S = f[F].replace(/\*$/, "");
        if (0 === S.indexOf("AM")) {
          var I = S.replace(/\s/g, "").split("*"),
            R = I[0].substr(2),
            L = {
              commands: I.slice(1)
            };
          M[R] = L
        } else
          for (var w = S.split("*"), $ = 0; $ < w.length; $++) {
            var N = w[$];
            if (0 === N.indexOf("IN") && (p = N.substr(2)),
              N = N.replace(/\s/g, ""),
              0 === N.indexOf("G01") && (m = "LINEAR"),
              0 === N.indexOf("G02") && (m = "CWCIRCULAR"),
              0 === N.indexOf("G03") && (m = "CCWCIRCULAR"),
              0 === N.indexOf("G36") && (g = !0),
              0 === N.indexOf("G37") && (g = !1),
              0 === N.indexOf("G70") && (h = 25.4),
              0 === N.indexOf("G71") && (h = 1),
              0 === N.indexOf("G74") && (u = !1),
              0 === N.indexOf("G75") && (u = !0),
              0 === N.indexOf("G90") && (l.absoluteCoords = !0),
              0 === N.indexOf("G91") && (l.absoluteCoords = !1),
              0 === N.indexOf("M0"))
              break;
            if (0 === N.indexOf("FS") && (l.omitZeros = N.charAt(2),
                l.absoluteCoords = "A" === N.charAt(3),
                l.integerDigits = parseInt(N.charAt(5)),
                l.fractionDigits = parseInt(N.charAt(6))),
              0 === N.indexOf("MO") && (h = "MM" === N.substr(2, 2) ? 1 : 25.4),
              0 === N.indexOf("OF")) {
              var Z = N.match(/OF(A([\+\-\.0-9]+))?(B([\+\-\.0-9]+))?/);
              Z[2] && (v.a = parseFloat(Z[2])),
                Z[4] && (v.b = parseFloat(Z[4]))
            }
            if (0 === N.indexOf("SF")) {
              var B = N.match(/SF(A([\+\-\.0-9]+))?(B([\+\-\.0-9]+))?/);
              B[2] && (O.a = parseFloat(B[2])),
                B[4] && (O.b = parseFloat(B[4]))
            }
            if (0 === N.indexOf("IP") && (c = "POS" === N.substr(2, 3), !c))
              throw {
                code: 1,
                message: "Negative polarity image file is not supported."
              };
            if (0 === N.indexOf("LP") && (d = "D" === N.charAt(3), !c))
              throw {
                code: 1,
                message: "Negative polarity image file is not supported."
              };
            if (0 === N.indexOf("LN"),
              0 === N.indexOf("SR") && 0 !== N.indexOf("SRX1Y1"))
              throw {
                code: 2,
                message: "Step and repeat values other than 1 is not supported."
              };
            if (0 === N.indexOf("AD")) {
              var U = N.match(/^AD(D[0-9]+)/);
              if (U && U[1]) {
                var V, E = U[1],
                  W = N.substr(U[0].length),
                  k = {
                    primitives: []
                  },
                  T = {
                    offsetX: 0,
                    offsetY: 0
                  };
                if (0 === W.indexOf("C,"))
                  k.diameter = Y(W.substr(2)) * apertureScale,
                  T.polygon = e(k.diameter, numVertices, 0),
                  k.primitives.push(T);
                else if (0 === W.indexOf("R,"))
                  V = W.match(/^R\,([\+\-\.0-9]+)X([\+\-\.0-9]+)/),
                  T.width = Y(V[1]) * apertureScale,
                  T.height = Y(V[2]) * apertureScale,
                  T.polygon = t(T.width, T.height),
                  k.primitives.push(T);
                else if (0 === W.indexOf("O,"))
                  V = W.match(/^O\,([\+\-\.0-9]+)X([\+\-\.0-9]+)/),
                  T.width = Y(V[1]) * apertureScale,
                  T.height = Y(V[2]) * apertureScale,
                  T.polygon = i(T.width, T.height, numVertices),
                  k.primitives.push(T);
                else if (0 === W.indexOf("P,"))
                  V = W.match(/^P\,([\+\-\.0-9]+)X([\+\-\.0-9]+)(X([\+\-\.0-9]+))/),
                  T.diameter = Y(V[1]) * apertureScale,
                  T.vertices = Y(V[2]),
                  V[4] && (T.rotation = Y(V[2]) / 180 * Math.PI),
                  T.polygon = e(T.diameter, T.vertices, T.rotation),
                  k.primitives.push(T);
                else {
                  V = W.match(/^[^,]+/);
                  var _ = V[0],
                    j = M[_],
                    q = {};
                  if (W.indexOf(",") > -1)
                    for (var z = W.substr(_.length + 1).split(","), H = 0; H < z.length; H++)
                      q["$" + (H + 1)] = parseFloat(z[H]);
                  for (var J = 0; J < j.commands.length; J++) {
                    var K = j.commands[J];
                    if (T = {
                        offsetX: 0,
                        offsetY: 0
                      },
                      0 === K.indexOf("$")) {
                      var Q = K.match(/^(\$[^=]+)=(.+)$/);
                      q[Q[1]] = o(Q[2])
                    } else
                      0 === K.indexOf("1,") ? (V = K.substr(2).split(","),
                        T.exposure = o(V[0]),
                        T.diameter = o(V[1]) * h,
                        T.offsetX = o(V[2]) * h,
                        T.offsetY = o(V[3]) * h,
                        T.polygon = e(T.diameter, numVertices, 0),
                        k.primitives.push(T)) : 0 === K.indexOf("5,") ? (V = K.substr(2).split(","),
                        T.exposure = o(V[0]),
                        T.vertices = o(V[1]),
                        T.offsetX = o(V[2]) * h,
                        T.offsetY = o(V[3]) * h,
                        T.diameter = o(V[4]) * h,
                        T.rotation = o(V[5]) / 180 * Math.PI,
                        T.polygon = e(T.diameter, T.vertices, T.rotation),
                        k.primitives.push(T)) : 0 === K.indexOf("21,") ? (V = K.substr(3).split(","),
                        T.exposure = o(V[0]),
                        T.width = o(V[1]) * h,
                        T.height = o(V[2]) * h,
                        T.offsetX = o(V[3]) * h - T.width / 2,
                        T.offsetY = o(V[4]) * h - T.height / 2,
                        T.polygon = t(T.width, T.height),
                        k.primitives.push(T)) : (alert("GerberParser: Unhandled macro primitive type: " + K),
                        T.polygon = e(.2, 16, 0),
                        k.primitives.push(T))
                  }
                  k.primitives = mergeAllPrimitives(k.primitives)
                }
                y[E] = k
              }
            }
            if (N.match(/^(G54)?D/) && !N.match(/^D0?[1-3]([^0-9]|$)/)) {
              var DD = N.replace(/^G54/, "");
              G = y[DD],
                G || (G = y.D10)
            }
            if (N.match(/^((G55)?D0?[1-3]$|X[\-0-9]+|Y[\-0-9]+)/)) {
              var XD = N.match(/^(G[0-9]+)?(X([\-0-9]+))?(Y([\-0-9]+))?(D0?[1-3])?$/);
              XD[3] && (A = X(XD[3]) * O.a),
                XD[5] && (b = X(XD[5]) * O.b),
                XD[6] && (x = XD[6]),
                x.match(/D0?1/) ? s(P, C, A, b, G) : x.match(/D0?2/) || x.match(/D0?3/) && a(A, b, G),
                P = A,
                C = b
            }
          }
      }
      return n
    },
    sampleFile: "G75*G70*%OFA0B0*%%FSLAX24Y24*%%IPPOS*%%LPD*%%AMOC8*5,1,8,0,0,1.08239X$1,22.5*%%ADD10C,0.0160*%%ADD11C,0.0650*%%ADD12R,0.0650X0.0650*%%ADD13R,0.0740X0.0740*%%ADD14C,0.0740*%%ADD15C,0.0520*%%ADD16C,0.0520*%%ADD17OC8,0.0560*%%ADD18C,0.0750*%%ADD19C,0.0660*%%ADD20C,0.0315*%D10*X019633Y004585D02*X019633Y005506D01*X019940Y005813D01*X020247Y005506D01*X020247Y004585D01*X020861Y004585D02*X020861Y005813D01*X020554Y005813D01*X020247Y005506D01*X021475Y005506D02*X021475Y004892D01*X021782Y004585D01*X022395Y004585D01*X022702Y004892D01*X022702Y005506D01*X022395Y005813D01*X021782Y005813D01*X021475Y005506D01*X023316Y005813D02*X024237Y005813D01*X024544Y005506D01*X024544Y004892D01*X024237Y004585D01*X023316Y004585D01*X025158Y004585D02*X025465Y004585D01*X025465Y004892D01*X025158Y004892D01*X025158Y004585D01*X026079Y004892D02*X026079Y005199D01*X026385Y005506D01*X027306Y005506D01*X027920Y006120D02*X028227Y006427D01*X028841Y006427D01*X029148Y006120D01*X029148Y004892D01*X028841Y004585D01*X028227Y004585D01*X027920Y004892D01*X027306Y004585D02*X026385Y004585D01*X026079Y004892D01*X026385Y005506D02*X026079Y005813D01*X026079Y006120D01*X026385Y006427D01*X027306Y006427D01*X027306Y004585D01*X029762Y005506D02*X030069Y005199D01*X030989Y005199D01*X030989Y004585D02*X030989Y006427D01*X030069Y006427D01*X029762Y006120D01*X029762Y005506D01*X031603Y005506D02*X032831Y005506D01*X033445Y005813D02*X034366Y005813D01*X034673Y005506D01*X034673Y004892D01*X034366Y004585D01*X033445Y004585D01*X033445Y006427D01*X035593Y006427D02*X035593Y006734D01*X035593Y005813D02*X035593Y004585D01*X035900Y004585D02*X035286Y004585D01*X036514Y004892D02*X036514Y005506D01*X036821Y005813D01*X037742Y005813D01*X037742Y003971D01*X037742Y004585D02*X036821Y004585D01*X036514Y004892D01*X035900Y005813D02*X035593Y005813D01*X038356Y005506D02*X038356Y004585D01*X039276Y004585D01*X039583Y004892D01*X039276Y005199D01*X038356Y005199D01*X038356Y005506D02*X038663Y005813D01*X039276Y005813D01*X040197Y006120D02*X040197Y005506D01*X040504Y005199D01*X041425Y005199D01*X040811Y005199D02*X040197Y004585D01*X041425Y004585D02*X041425Y006427D01*X040504Y006427D01*X040197Y006120D01*D11*X031005Y012505D03*X031005Y013505D03*X029005Y013505D03*X029005Y012505D03*X029005Y015505D03*X031005Y015505D03*X030505Y022505D03*X029505Y022505D03*X032505Y026005D03*D12*X032505Y024005D03*D13*X026005Y023505D03*D14*X025005Y023505D03*X024005Y023505D03*X023005Y023505D03*X022005Y023505D03*X021005Y023505D03*X021005Y026005D03*X020005Y026005D03*X020505Y027505D03*X022505Y026005D03*X025505Y026005D03*X025505Y027505D03*X027505Y027005D03*X029505Y027005D03*X029505Y024005D03*X027505Y023005D03*X033505Y029505D03*X041505Y029505D03*X026005Y015505D03*X026005Y014505D03*X027505Y012505D03*X022505Y012505D03*D15*X022505Y017245D02*X022505Y017765D01*X023505Y017765D02*X023505Y017245D01*X024505Y017245D02*X024505Y017765D01*X025505Y017765D02*X025505Y017245D01*X026505Y017245D02*X026505Y017765D01*X027505Y017765D02*X027505Y017245D01*X028505Y017245D02*X028505Y017765D01*X029505Y017765D02*X029505Y017245D01*X030505Y017245D02*X030505Y017765D01*X031505Y017765D02*X031505Y017245D01*X032505Y017245D02*X032505Y017765D01*X033505Y017765D02*X033505Y017245D01*X034505Y017245D02*X034505Y017765D01*X034505Y020245D02*X034505Y020765D01*X033505Y020765D02*X033505Y020245D01*X032505Y020245D02*X032505Y020765D01*X031505Y020765D02*X031505Y020245D01*X030505Y020245D02*X030505Y020765D01*X029505Y020765D02*X029505Y020245D01*X028505Y020245D02*X028505Y020765D01*X027505Y020765D02*X027505Y020245D01*X026505Y020245D02*X026505Y020765D01*X025505Y020765D02*X025505Y020245D01*X024505Y020245D02*X024505Y020765D01*X023505Y020765D02*X023505Y020245D01*X022505Y020245D02*X022505Y020765D01*X021505Y020765D02*X021505Y020245D01*X021505Y017765D02*X021505Y017245D01*D16*X038505Y017005D03*X039505Y017005D03*X040505Y017005D03*X041505Y017005D03*X041505Y014005D03*X040505Y014005D03*X039505Y014005D03*X038505Y014005D03*D17*X034505Y013505D03*X034505Y012505D03*X034505Y011505D03*X034505Y010505D03*X033505Y010505D03*X033505Y011505D03*X033505Y012505D03*X033505Y013505D03*X033505Y014505D03*X033505Y015505D03*X034505Y015505D03*X034505Y014505D03*D18*X038105Y013005D03*X041805Y013005D03*X041805Y018005D03*X038105Y018005D03*D19*X023835Y029505D02*X023175Y029505D01*X023175Y030505D02*X023835Y030505D01*X023835Y031505D02*X023175Y031505D01*D20*X023505Y031505D02*X024005Y031505D01*X027505Y028005D01*X027505Y027005D01*X025505Y027505D02*X025505Y026005D01*X023505Y025005D02*X023505Y024505D01*X023005Y024005D01*X023005Y023505D01*X024005Y023505D02*X024005Y023005D01*X023505Y022505D01*X023005Y022505D01*X021505Y021005D01*X021505Y020505D01*X021005Y019505D02*X020505Y020005D01*X020505Y021005D01*X022005Y022505D01*X022005Y023505D01*X022005Y025505D01*X022505Y026005D01*X023505Y025005D02*X034505Y025005D01*X033505Y026005D01*X032505Y026005D01*X031005Y027005D02*X033505Y029505D01*X031005Y027005D02*X029505Y027005D01*X029505Y024005D02*X029505Y022505D01*X029505Y020505D01*X029505Y020005D01*X031005Y018505D01*X035505Y018505D01*X037005Y017005D01*X035505Y015505D01*X034505Y015505D01*X033505Y015505D01*X033505Y014505D02*X034505Y014505D01*X038005Y014505D01*X038505Y014005D01*X038505Y013505D01*X038005Y013005D01*X038105Y013005D01*X038505Y012005D02*X036505Y012005D01*X035005Y013505D01*X034505Y013505D01*X033505Y013505D01*X033505Y012505D02*X034505Y012505D01*X035005Y012505D01*X036505Y011005D01*X038505Y011005D01*X040505Y013005D01*X040505Y014005D01*X039505Y014005D02*X039505Y013005D01*X038505Y012005D01*X038505Y010005D02*X036505Y010005D01*X035005Y011505D01*X034505Y011505D01*X033505Y011505D01*X032005Y011505D01*X027005Y011505D01*X025005Y013505D01*X025005Y015005D01*X025505Y015505D01*X026005Y015505D01*X027005Y015505D01*X028505Y017005D01*X028505Y017505D01*X029505Y017505D02*X029505Y016005D01*X029005Y015505D01*X029005Y013505D01*X029005Y012505D02*X031005Y012505D01*X032005Y011505D01*X033505Y010505D02*X023005Y010505D01*X021505Y012005D01*X021505Y017505D01*X019505Y019505D01*X019505Y022005D01*X021005Y023505D01*X021005Y026005D01*X020005Y026005D02*X020005Y027005D01*X020505Y027505D01*X023505Y029505D02*X023505Y025005D01*X025005Y023505D02*X025005Y023005D01*X023505Y021505D01*X023005Y021505D01*X022505Y021005D01*X022505Y020505D01*X021005Y019505D02*X029005Y019505D01*X029505Y020005D01*X030505Y020505D02*X030505Y022505D01*X037005Y022505D01*X034505Y025005D01*X032505Y024005D02*X029505Y024005D01*X027505Y023005D02*X026505Y022005D01*X026505Y020505D01*X023505Y017505D02*X023505Y013505D01*X022505Y012505D01*X026005Y014505D02*X027505Y013005D01*X027505Y012505D01*X031005Y013505D02*X031005Y015505D01*X030505Y016005D01*X030505Y017505D01*X032005Y019505D02*X031505Y020005D01*X031505Y020505D01*X032505Y020505D02*X032505Y021005D01*X033005Y021505D01*X037005Y021505D01*X040505Y018005D01*X040505Y017005D01*X039505Y017005D02*X039505Y018005D01*X038005Y019505D01*X032005Y019505D01*X037005Y017005D02*X038005Y018005D01*X038105Y018005D01*X038005Y018005D02*X038505Y017505D01*X038505Y017005D01*X041505Y017005D02*X041505Y014005D01*X041505Y013005D01*X041805Y013005D01*X041505Y013005D02*X038505Y010005D01*X034505Y010505D02*X033505Y010505D01*X041505Y017005D02*X041505Y018005D01*X041805Y018005D01*X041505Y018005D02*X037005Y022505D01*X041505Y029505D02*X038505Y032505D01*X023005Y032505D01*X022005Y031505D01*X023005Y030505D01*X023505Y030505D01*M02*"
  };
// var contourTools = [{
//   diameter: .1,
//   angle: 10,
//   depth: .2
// }, {
//   diameter: .1,
//   angle: 15,
//   depth: .2
// }, {
//   diameter: .1,
//   angle: 20,
//   depth: .2
// }, {
//   diameter: .1,
//   angle: 25,
//   depth: .2
// }, {
//   diameter: .1,
//   angle: 30,
//   depth: .2
// }, {
//   diameter: .1,
//   angle: 40,
//   depth: .2
// }, {
//   diameter: .1,
//   angle: 45,
//   depth: .2
// }, {
//   diameter: .2,
//   angle: 10,
//   depth: .2
// }, {
//   diameter: .2,
//   angle: 15,
//   depth: .2
// }, {
//   diameter: .2,
//   angle: 20,
//   depth: .2
// }, {
//   diameter: .2,
//   angle: 25,
//   depth: .2
// }, {
//   diameter: .2,
//   angle: 30,
//   depth: .2
// }, {
//   diameter: .2,
//   angle: 40,
//   depth: .2,
//   selected: !0
// }, {
//   diameter: .2,
//   angle: 45,
//   depth: .2
// }, {
//   diameter: .3,
//   angle: 10,
//   depth: .2
// }, {
//   diameter: .3,
//   angle: 15,
//   depth: .2
// }, {
//   diameter: .3,
//   angle: 20,
//   depth: .2
// }, {
//   diameter: .3,
//   angle: 25,
//   depth: .2
// }, {
//   diameter: .3,
//   angle: 30,
//   depth: .2
// }, {
//   diameter: .3,
//   angle: 40,
//   depth: .2
// }, {
//   diameter: .3,
//   angle: 45,
//   depth: .2
// }];