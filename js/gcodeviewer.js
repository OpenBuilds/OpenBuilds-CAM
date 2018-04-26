// This is a simplified and updated version of http://gcode.joewalnes.com/
// Updated with code from http://chilipeppr.com/tinyg's 3D viewer to support more CNC type Gcode
// Simplified by Andrew Hodel in 2015
// Updated by PvdW in 2016 for S-Value lasers
// Updates by PvdW in 2017 - new arc code from http://chilipeppr.com
// Updates by PvdW in 2017 - AUTODETECT MAX S VALUE
// Updated by PvdW in 2017 - Parse GCODE to find starting temperatures (preheat machine)

var object;
var smaxvalue = 0;

// function findtemps(gcode) {
//   var foundETemp = false;
//   var foundBTemp = false;
//   var smaxvaluetemp = 0;
//   var gcode=editor.getValue()
//   gcode = gcode.split("\n")
//   for (i=0; i<gcode.length; i++) {
//     var line = gcode[i]
//     if (line.indexOf(";") != 0) {
//       if (line.indexOf("M104") != -1 || line.indexOf("M109") != -1) {
//         if (!foundETemp) {
//           line.split(/\s+/).forEach(function (token) {
//             var key = token.toLowerCase();
//             var value = parseFloat(token.substring(1));
//             if (key.match(/S([\d.]+)/i)) {
//                 var svalue = parseFloat(value);
//                 console.log("Found Extruder Temp: " + svalue)
//                 foundETemp = true;
//             }
//           });
//         }
//       }
//       if (line.indexOf("M140") != -1 || line.indexOf("M190") != -1) {
//         if (!foundBTemp) {
//           line.split(/\s+/).forEach(function (token) {
//             var key = token.toLowerCase();
//             var value = parseFloat(token.substring(1));
//             if (key.match(/S([\d.]+)/i)) {
//                 var svalue = parseFloat(value);
//                 console.log("Found Bed Temp: " + svalue)
//                 foundBTemp = true;
//             }
//           });
//         }
//       }
//     }
//   }
// }

function findmaxs(gcode) {
  var smaxvaluetemp = 0;
  // var gcode=editor.getValue()
  gcodeS = gcode.split("\n")
  for (i = 0; i < gcodeS.length; i++) {
    var line = gcodeS[i]
    line.split(/\s+/).forEach(function(token) {
      // console.log(token)
      var key = token.toLowerCase();
      // console.log(key)
      var value = parseFloat(token.substring(1));
      // console.log(value)
      if (key.match(/S([\d.]+)/i)) {
        // we have a new S-Value
        var svalue = parseFloat(value);
        // console.log(svalue)
        if (svalue > smaxvaluetemp) smaxvaluetemp = svalue; // Set smaxvalue to the highest S value in the file
      }
    });
  }
  return smaxvaluetemp;
}

function openGCodeFromText() {
  var gcode = prepgcodefile();
  smaxvalue = findmaxs(gcode);
  // clearViewer();
  // var gcode = editor.getValue();
  createObjectFromGCode(gcode);
}

GCodeParser = function(handlers, modecmdhandlers) {
    this.handlers = handlers || {};
    this.modecmdhandlers = modecmdhandlers || {};

    this.lastArgs = {
      cmd: null
    };
    this.lastFeedrate = null;
    this.isUnitsMm = true;

    this.parseLine = function(text, info) {
      // console.log("LINE: " + text)
      var origtext = text;
      // remove line numbers if exist
      if (text.match(/^N/i)) {
        // yes, there's a line num
        text = text.replace(/^N\d+\s*/ig, "");
      }

      // collapse leading zero g cmds to no leading zero
      text = text.replace(/G00/i, 'G0');
      text = text.replace(/G0(\d)/i, 'G$1');
      // add spaces before g cmds and xyzabcijkf params
      text = text.replace(/([gmtxyzabcijkfst])/ig, " $1");
      // remove spaces after xyzabcijkf params because a number should be directly after them
      text = text.replace(/([xyzabcijkfst])\s+/ig, "$1");
      // remove front and trailing space
      text = text.trim();

      // see if comment
      var isComment = false;
      if (text.match(/^(;|\(|<)/)) {
        text = origtext;
        isComment = true;
      } else {
        // make sure to remove inline comments
        text = text.replace(/\(.*?\)/g, "");
      }
      //console.log("gcode txt:", text);

      if (text && !isComment) {
        text = text.replace(/(;|\().*$/, ""); // ; or () trailing  // strip off end of line comment
        var tokens = [];
        // Execute any non-motion commands on the line immediately
        // Add other commands to the tokens list for later handling
        // Segments are not created for non-motion commands;
        // the segment for this line is created later
        text.split(/\s+/).forEach(function(token) {
          var modehandler = modecmdhandlers[token.toUpperCase()];
          if (modehandler) {
            modehandler();
          } else {
            tokens.push(token);
          }
        });

        if (tokens.length) {
          var cmd = tokens[0];
          cmd = cmd.toUpperCase();
          // check if a g or m cmd was included in gcode line
          // you are allowed to just specify coords on a line
          // and it should be assumed that the last specified gcode
          // cmd is what's assumed
          isComment = false;
          if (!cmd.match(/^(G|M|T|S)/i)) {
            cmd = this.lastArgs.cmd;
            tokens.unshift(cmd); // put at spot 0 in array
          } else {
            // we have a normal cmd as opposed to just an xyz pos where
            // it assumes you should use the last cmd
            // however, need to remove inline comments (TODO. it seems parser works fine for now)
          }
          var args = {
            'cmd': cmd,
            'text': text,
            'origtext': origtext,
            'indx': info,
            'isComment': isComment,
            'feedrate': null,
            'plane': undefined
          };
          //console.log("args:", args);
          if (tokens.length > 1 && !isComment) {
            tokens.splice(1).forEach(function(token) {
              //console.log("token:", token);
              if (token && token.length > 0) {
                var key = token[0].toLowerCase();
                var value = parseFloat(token.substring(1));
                args[key] = value;
              } else {
                //console.log("couldn't parse token in foreach. weird:", token);
              }
            });
          }
          var handler = this.handlers[cmd] || this.handlers['default'];
          // don't save if saw a comment
          if (!args.isComment) {
            this.lastArgs = args;
            //console.log("just saved lastArgs for next use:", this.lastArgs);
          } else {
            //console.log("this was a comment, so didn't save lastArgs");
          }
          //console.log("calling handler: cmd:", cmd, "args:", args, "info:", info);
          if (handler) {
            // scan for feedrate
            if (args.text.match(/F([\d.]+)/i)) {
              // we have a new feedrate
              var feedrate = parseFloat(RegExp.$1);
              args.feedrate = feedrate;
              this.lastFeedrate = feedrate;
            } else {
              // use feedrate from prior lines
              args.feedrate = this.lastFeedrate;
            }

            if (args.text.match(/S([\d.]+)/i)) {
              // we have a new S-Value
              var svalue = parseFloat(RegExp.$1);
              args.svalue = svalue;
              if (svalue > smaxvalue) smaxvalue = svalue; // Set smaxvalue to the highest S value in the file
              this.lastsvalue = svalue;
            } else {
              // use feedrate from prior lines
              args.svalue = this.lastsvalue;
            }
            //console.log("about to call handler. args:", args, "info:", info, "this:", this);
            return handler(args, info, this);
          } else {
            console.error("No handler for gcode command!!!");
          }

        }
      } else {
        // it was a comment or the line was empty
        // we still need to create a segment with xyz in p2
        // so that when we're being asked to /gotoline we have a position
        // for each gcode line, even comments. we just use the last real position
        // to give each gcode line (even a blank line) a spot to go to
        var args = {
          'cmd': 'empty or comment',
          'text': text,
          'origtext': origtext,
          'indx': info,
          'isComment': isComment
        };
        var handler = this.handlers['default'];
        return handler(args, info, this);
      }
    }

    this.parse = function(gcode) {
      // console.log(gcode)
      var lines = gcode.split(/\r{0,1}\n/);
      // var lines = gcode
      for (var i = 0; i < lines.length; i++) {
        if (this.parseLine(lines[i], i) === false) {
          break;
        }
      }
    }
  },
  colorG0 = 0x00ff00, //bootstrap color
  colorG1 = 0xcc0000,

  colorG2 = 0x17a2b8,
  createObjectFromGCode = function(gcode, indxMax) {

    setUnits = function(units) {
      if (units == "mm")
        this.isUnitsMm = true;
      else
        this.isUnitsMm = false;
      this.onUnitsChanged();
    }

    onUnitsChanged = function() {
      //console.log("onUnitsChanged");
      // we need to publish back the units
      var units = "mm";
      if (!this.isUnitsMm) units = "inch";
      // $('.com-chilipeppr-widget-3dviewer-units-indicator').text(units);
      // console.log("USING UNITS:" + units)

    }
    // these are extra Object3D elements added during
    // the gcode rendering to attach to scene
    this.extraObjects = [];
    this.extraObjects["G17"] = [];
    this.extraObjects["G18"] = [];
    this.extraObjects["G19"] = [];
    this.offsetG92 = {
      x: 0,
      y: 0,
      z: 0,
      e: 0
    };
    this.setUnits("mm");

    var lastLine = {
      x: 0,
      y: 0,
      z: 0,
      e: 0,
      f: 0,
      feedrate: null,
      extruding: false
    };

    // we have been using an approach where we just append
    // each gcode move to one monolithic geometry. we
    // are moving away from that idea and instead making each
    // gcode move be it's own full-fledged line object with
    // its own userData info
    // G2/G3 moves are their own child of lots of lines so
    // that even the simulator can follow along better
    var new3dObj = new THREE.Group();
    var plane = "G17"; //set default plane to G17 - Assume G17 if no plane specified in gcode.
    var layers = [];
    var layer = undefined;
    var lines = [];
    var totalDist = 0;
    var bbbox = {
      min: {
        x: 100000,
        y: 100000,
        z: 100000
      },
      max: {
        x: -100000,
        y: -100000,
        z: -100000
      }
    };
    var bbbox2 = {
      min: {
        x: 100000,
        y: 100000,
        z: 100000
      },
      max: {
        x: -100000,
        y: -100000,
        z: -100000
      }
    };

    this.newLayer = function(line) {
      //console.log("layers:", layers, "layers.length", layers.length);
      layer = {
        type: {},
        layer: layers.length,
        z: line.z,
      };
      layers.push(layer);
    };

    this.getLineGroup = function(line, args) {
      // console.log("getLineGroup:", line);
      if (layer == undefined) this.newLayer(line);
      var speed = Math.round(line.e / 1000);
      var grouptype = (line.extruding ? 10000 : 0) + speed;
      var opacity = line.s;
      if (line.g0) {
        grouptype = "g0" + opacity;
        color = new THREE.Color(this.colorG0);
      } else if (line.g1) {
        if (!line.extruding && !line.s) { // then its probably a G1 3DP Positioning move
          grouptype = "g0-e" + opacity;
          opacity = 1;
          color = new THREE.Color(this.colorG1);
        } else {
          grouptype = "g1" + opacity;
          color = new THREE.Color(this.colorG1);
        }

      } else if (line.g2) {
        grouptype = "g2" + opacity;
        color = new THREE.Color(this.colorG2);
      } else if (line.arc) {
        grouptype = "arc" + opacity;
        color = new THREE.Color(this.colorG2);
      }


      if (typeof line.s === 'undefined') {
        opacity = 1;
      } else {
        opacity = line.s / smaxvalue; // smaxvalue from sValue() - makes sure 100% s value = 100% opacity
        // console.log(opacity)
      }
      // see if we have reached indxMax, if so draw, but
      // make it ghosted
      if (args.indx > indxMax) {
        grouptype = "ghost";
        //console.log("args.indx > indxMax", args, indxMax);
        color = new THREE.Color(0x000000);
      }
      if (layer.type[grouptype] == undefined || layer.type[grouptype] == 'g1') {
        layer.type[grouptype] = {
          type: grouptype,
          feed: line.e,
          extruding: line.extruding,
          color: color,
          segmentCount: 0,
          material: new THREE.LineBasicMaterial({
            opacity: opacity,
            transparent: true,
            linewidth: 1,
            vertexColors: THREE.FaceColors
          }),
          geometry: new THREE.Geometry(),
        }
        if (args.indx > indxMax) {
          layer.type[grouptype].material.opacity = 0.05;
        }
      }
      return layer.type[grouptype];
    };

    this.drawArc = function(aX, aY, aZ, endaZ, aRadius, aStartAngle, aEndAngle, aClockwise, plane) {
      //console.log("drawArc:", aX, aY, aZ, aRadius, aStartAngle, aEndAngle, aClockwise);
      var ac = new THREE.ArcCurve(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise);
      //console.log("ac:", ac);
      var acmat = new THREE.LineBasicMaterial({
        color: 0x00aaff,
        opacity: 0.5,
        transparent: true
      });
      var acgeo = new THREE.Geometry();
      var ctr = 0;
      var z = aZ;
      ac.getPoints(20).forEach(function(v) {
        //console.log(v);
        z = (((endaZ - aZ) / 20) * ctr) + aZ;
        acgeo.vertices.push(new THREE.Vector3(v.x, v.y, z));
        ctr++;
      });
      var aco = new THREE.Line(acgeo, acmat);
      //aco.position.set(pArc.x, pArc.y, pArc.z);
      //console.log("aco:", aco);
      this.extraObjects[plane].push(aco);
      return aco;
    };

    this.drawArcFrom2PtsAndCenter = function(vp1, vp2, vpArc, args) {
      //console.log("drawArcFrom2PtsAndCenter. vp1:", vp1, "vp2:", vp2, "vpArc:", vpArc, "args:", args);

      //var radius = vp1.distanceTo(vpArc);
      //console.log("radius:", radius);

      // Find angle
      var p1deltaX = vpArc.x - vp1.x;
      var p1deltaY = vpArc.y - vp1.y;
      var p1deltaZ = vpArc.z - vp1.z;

      var p2deltaX = vpArc.x - vp2.x;
      var p2deltaY = vpArc.y - vp2.y;
      var p2deltaZ = vpArc.z - vp2.z;

      switch (args.plane) {
        case "G18":
          var anglepArcp1 = Math.atan(p1deltaZ / p1deltaX);
          var anglepArcp2 = Math.atan(p2deltaZ / p2deltaX);
          break;
        case "G19":
          var anglepArcp1 = Math.atan(p1deltaZ / p1deltaY);
          var anglepArcp2 = Math.atan(p2deltaZ / p2deltaY);
          break;
        default:
          var anglepArcp1 = Math.atan(p1deltaY / p1deltaX);
          var anglepArcp2 = Math.atan(p2deltaY / p2deltaX);
      }

      // Draw arc from arc center
      var radius = vpArc.distanceTo(vp1);
      var radius2 = vpArc.distanceTo(vp2);
      //console.log("radius:", radius);

      if (Number((radius).toFixed(2)) != Number((radius2).toFixed(2))) console.log("Radiuses not equal. r1:", radius, ", r2:", radius2, " with args:", args, " rounded vals r1:", Number((radius).toFixed(2)), ", r2:", Number((radius2).toFixed(2)));

      // arccurve
      var clwise = true;
      if (args.clockwise === false) clwise = false;
      //if (anglepArcp1 < 0) clockwise = false;

      switch (args.plane) {
        case "G19":
          if (p1deltaY >= 0) anglepArcp1 += Math.PI;
          if (p2deltaY >= 0) anglepArcp2 += Math.PI;
          break;
        default:
          if (p1deltaX >= 0) anglepArcp1 += Math.PI;
          if (p2deltaX >= 0) anglepArcp2 += Math.PI;
      }

      if (anglepArcp1 === anglepArcp2 && clwise === false)
        // Draw full circle if angles are both zero,
        // start & end points are same point... I think
        switch (args.plane) {
          case "G18":
            var threeObj = this.drawArc(vpArc.x, vpArc.z, (-1 * vp1.y), (-1 * vp2.y), radius, anglepArcp1, (anglepArcp2 + (2 * Math.PI)), clwise, "G18");
            break;
          case "G19":
            var threeObj = this.drawArc(vpArc.y, vpArc.z, vp1.x, vp2.x, radius, anglepArcp1, (anglepArcp2 + (2 * Math.PI)), clwise, "G19");
            break;
          default:
            var threeObj = this.drawArc(vpArc.x, vpArc.y, vp1.z, vp2.z, radius, anglepArcp1, (anglepArcp2 + (2 * Math.PI)), clwise, "G17");
        }
      else
        switch (args.plane) {
          case "G18":
            var threeObj = this.drawArc(vpArc.x, vpArc.z, (-1 * vp1.y), (-1 * vp2.y), radius, anglepArcp1, anglepArcp2, clwise, "G18");
            break;
          case "G19":
            var threeObj = this.drawArc(vpArc.y, vpArc.z, vp1.x, vp2.x, radius, anglepArcp1, anglepArcp2, clwise, "G19");
            break;
          default:
            var threeObj = this.drawArc(vpArc.x, vpArc.y, vp1.z, vp2.z, radius, anglepArcp1, anglepArcp2, clwise, "G17");
        }
      return threeObj;
    };

    this.addSegment = function(p1, p2, args) {
      //console.log("");
      //console.log("addSegment p2:", p2);
      // add segment to array for later use
      lines.push({
        p2: p2,
        'args': args
      });

      var group = this.getLineGroup(p2, args);
      //  console.log(group)
      var geometry = group.geometry;

      group.segmentCount++;
      // see if we need to draw an arc
      if (p2.arc) {
        //console.log("");
        //console.log("drawing arc. p1:", p1, ", p2:", p2);

        //var segmentCount = 12;
        // figure out the 3 pts we are dealing with
        // the start, the end, and the center of the arc circle
        // radius is dist from p1 x/y/z to pArc x/y/z
        //if(args.clockwise === false || args.cmd === "G3"){
        //    var vp2 = new THREE.Vector3(p1.x, p1.y, p1.z);
        //    var vp1 = new THREE.Vector3(p2.x, p2.y, p2.z);
        //}
        //else {
        var vp1 = new THREE.Vector3(p1.x, p1.y, p1.z);
        var vp2 = new THREE.Vector3(p2.x, p2.y, p2.z);
        //}
        var vpArc;

        // if this is an R arc gcode command, we're given the radius, so we
        // don't have to calculate it. however we need to determine center
        // of arc
        if (args.r != null) {
          //console.log("looks like we have an arc with R specified. args:", args);
          //console.log("anglepArcp1:", anglepArcp1, "anglepArcp2:", anglepArcp2);

          radius = parseFloat(args.r);

          // First, find the distance between points 1 and 2.  We'll call that q,
          // and it's given by sqrt((x2-x1)^2 + (y2-y1)^2).
          var q = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));

          // Second, find the point halfway between your two points.  We'll call it
          // (x3, y3).  x3 = (x1+x2)/2  and  y3 = (y1+y2)/2.
          var x3 = (p1.x + p2.x) / 2;
          var y3 = (p1.y + p2.y) / 2;
          var z3 = (p1.z + p2.z) / 2;

          // There will be two circle centers as a result of this, so
          // we will have to pick the correct one. In gcode we can get
          // a + or - val on the R to indicate which circle to pick
          // One answer will be:
          // x = x3 + sqrt(r^2-(q/2)^2)*(y1-y2)/q
          // y = y3 + sqrt(r^2-(q/2)^2)*(x2-x1)/q
          // The other will be:
          // x = x3 - sqrt(r^2-(q/2)^2)*(y1-y2)/q
          // y = y3 - sqrt(r^2-(q/2)^2)*(x2-x1)/q
          var pArc_1 = undefined;
          var pArc_2 = undefined;
          var calc = Math.sqrt((radius * radius) - Math.pow(q / 2, 2));

          // calc can be NaN if q/2 is epsilon larger than radius due to finite precision
          // When that happens, the calculated center is incorrect
          if (isNaN(calc)) {
            calc = 0.0;
          }
          var angle_point = undefined;

          switch (args.plane) {
            case "G18":
              pArc_1 = {
                x: x3 + calc * (p1.z - p2.z) / q,
                y: y3 + calc * (p2.y - p1.y) / q,
                z: z3 + calc * (p2.x - p1.x) / q
              };
              pArc_2 = {
                x: x3 - calc * (p1.z - p2.z) / q,
                y: y3 - calc * (p2.y - p1.y) / q,
                z: z3 - calc * (p2.x - p1.x) / q
              };
              angle_point = Math.atan2(p1.z, p1.x) - Math.atan2(p2.z, p2.x);
              if (((p1.x - pArc_1.x) * (p1.z + pArc_1.z)) + ((pArc_1.x - p2.x) * (pArc_1.z + p2.z)) >=
                ((p1.x - pArc_2.x) * (p1.z + pArc_2.z)) + ((pArc_2.x - p2.x) * (pArc_2.z + p2.z))) {
                var cw = pArc_1;
                var ccw = pArc_2;
              } else {
                var cw = pArc_2;
                var ccw = pArc_1;
              }
              break;
            case "G19":
              pArc_1 = {
                x: x3 + calc * (p1.x - p2.x) / q,
                y: y3 + calc * (p1.z - p2.z) / q,
                z: z3 + calc * (p2.y - p1.y) / q
              };
              pArc_2 = {
                x: x3 - calc * (p1.x - p2.x) / q,
                y: y3 - calc * (p1.z - p2.z) / q,
                z: z3 - calc * (p2.y - p1.y) / q
              };

              if (((p1.y - pArc_1.y) * (p1.z + pArc_1.z)) + ((pArc_1.y - p2.y) * (pArc_1.z + p2.z)) >=
                ((p1.y - pArc_2.y) * (p1.z + pArc_2.z)) + ((pArc_2.y - p2.y) * (pArc_2.z + p2.z))) {
                var cw = pArc_1;
                var ccw = pArc_2;
              } else {
                var cw = pArc_2;
                var ccw = pArc_1;
              }
              break;
            default:
              pArc_1 = {
                x: x3 + calc * (p1.y - p2.y) / q,
                y: y3 + calc * (p2.x - p1.x) / q,
                z: z3 + calc * (p2.z - p1.z) / q
              };
              pArc_2 = {
                x: x3 - calc * (p1.y - p2.y) / q,
                y: y3 - calc * (p2.x - p1.x) / q,
                z: z3 - calc * (p2.z - p1.z) / q
              };
              if (((p1.x - pArc_1.x) * (p1.y + pArc_1.y)) + ((pArc_1.x - p2.x) * (pArc_1.y + p2.y)) >=
                ((p1.x - pArc_2.x) * (p1.y + pArc_2.y)) + ((pArc_2.x - p2.x) * (pArc_2.y + p2.y))) {
                var cw = pArc_1;
                var ccw = pArc_2;
              } else {
                var cw = pArc_2;
                var ccw = pArc_1;
              }
          }

          if ((p2.clockwise === true && radius >= 0) || (p2.clockwise === false && radius < 0)) vpArc = new THREE.Vector3(cw.x, cw.y, cw.z);
          else vpArc = new THREE.Vector3(ccw.x, ccw.y, ccw.z);

        } else {
          // this code deals with IJK gcode commands
          /*if(args.clockwise === false || args.cmd === "G3")
              var pArc = {
                  x: p2.arci ? p1.x + p2.arci : p1.x,
                  y: p2.arcj ? p1.y + p2.arcj : p1.y,
                  z: p2.arck ? p1.z + p2.arck : p1.z,
              };
          else*/
          var pArc = {
            x: p2.arci,
            y: p2.arcj,
            z: p2.arck,
          };
          //console.log("new pArc:", pArc);
          vpArc = new THREE.Vector3(pArc.x, pArc.y, pArc.z);
          //console.log("vpArc:", vpArc);
        }

        var threeObjArc = this.drawArcFrom2PtsAndCenter(vp1, vp2, vpArc, args);

        // still push the normal p1/p2 point for debug
        p2.g2 = true;
        p2.threeObjArc = threeObjArc;
        group = this.getLineGroup(p2, args);
        // these golden lines showing start/end of a g2 or g3 arc were confusing people
        // so hiding them for now. jlauer 8/15/15
        /*
        geometry = group.geometry;
        geometry.vertices.push(
            new THREE.Vector3(p1.x, p1.y, p1.z));
        geometry.vertices.push(
            new THREE.Vector3(p2.x, p2.y, p2.z));
        geometry.colors.push(group.color);
        geometry.colors.push(group.color);
        */
      } else {
        geometry.vertices.push(
          new THREE.Vector3(p1.x, p1.y, p1.z));
        geometry.vertices.push(
          new THREE.Vector3(p2.x, p2.y, p2.z));
        geometry.colors.push(group.color);
        geometry.colors.push(group.color);
      }

      if (p2.extruding) {
        bbbox.min.x = Math.min(bbbox.min.x, p2.x);
        bbbox.min.y = Math.min(bbbox.min.y, p2.y);
        bbbox.min.z = Math.min(bbbox.min.z, p2.z);
        bbbox.max.x = Math.max(bbbox.max.x, p2.x);
        bbbox.max.y = Math.max(bbbox.max.y, p2.y);
        bbbox.max.z = Math.max(bbbox.max.z, p2.z);
      }
      if (p2.g0) {
        // we're in a toolhead move, label moves
        /*
        if (group.segmentCount < 2) {
        this.makeSprite(this.scene, "webgl", {
            x: p2.x,
            y: p2.y,
            z: p2.z + 0,
            text: group.segmentCount,
            color: "#ff00ff",
            size: 3,
        });
        }
        */
      }
      // global bounding box calc
      bbbox2.min.x = Math.min(bbbox2.min.x, p2.x);
      bbbox2.min.y = Math.min(bbbox2.min.y, p2.y);
      bbbox2.min.z = Math.min(bbbox2.min.z, p2.z);
      bbbox2.max.x = Math.max(bbbox2.max.x, p2.x);
      bbbox2.max.y = Math.max(bbbox2.max.y, p2.y);
      bbbox2.max.z = Math.max(bbbox2.max.z, p2.z);

      // NEW METHOD OF CREATING THREE.JS OBJECTS
      // create new approach for three.js objects which is
      // a unique object for each line of gcode, including g2/g3's
      // make sure userData is good too
      var gcodeObj;

      if (p2.arc) {
        // use the arc that already got built
        gcodeObj = p2.threeObjArc;
      } else {
        // make a line
        //  var color = 0X0000ff;

        if (p2.extruding) {
          //  color = 0xff00ff;
        } else if (p2.g0) {
          //  color = 0x00ff00;
        } else if (p2.g2) {
          //color = 0x999900;
        } else if (p2.arc) {
          //  color = 0x0033ff;
        }

        var material = new THREE.LineBasicMaterial({
          color: color,
          opacity: 0.5,
          transparent: true
        });

        var geometry = new THREE.Geometry();
        geometry.vertices.push(
          new THREE.Vector3(p1.x, p1.y, p1.z),
          new THREE.Vector3(p2.x, p2.y, p2.z)
        );

        var line = new THREE.Line(geometry, material);
        gcodeObj = line;
      }
      gcodeObj.userData.p2 = p2;
      gcodeObj.userData.args = args;
      new3dObj.add(gcodeObj);

      // DISTANCE CALC
      // add distance so we can calc estimated time to run
      // see if arc
      var dist = 0;
      if (p2.arc) {
        // calc dist of all lines
        //console.log("this is an arc to calc dist for. p2.threeObjArc:", p2.threeObjArc, "p2:", p2);
        var arcGeo = p2.threeObjArc.geometry;
        //console.log("arcGeo:", arcGeo);

        var tad2 = 0;
        for (var arcLineCtr = 0; arcLineCtr < arcGeo.vertices.length - 1; arcLineCtr++) {
          tad2 += arcGeo.vertices[arcLineCtr].distanceTo(arcGeo.vertices[arcLineCtr + 1]);
        }
        //console.log("tad2:", tad2);


        // just do straight line calc
        var a = new THREE.Vector3(p1.x, p1.y, p1.z);
        var b = new THREE.Vector3(p2.x, p2.y, p2.z);
        var straightDist = a.distanceTo(b);

        //console.log("diff of straight line calc vs arc sum. straightDist:", straightDist);

        dist = tad2;

      } else {
        // just do straight line calc
        var a = new THREE.Vector3(p1.x, p1.y, p1.z);
        var b = new THREE.Vector3(p2.x, p2.y, p2.z);
        dist = a.distanceTo(b);
      }

      if (dist > 0) {
        this.totalDist += dist;
      }

      // time to execute this move
      // if this move is 10mm and we are moving at 100mm/min then
      // this move will take 10/100 = 0.1 minutes or 6 seconds
      var timeMinutes = 0;
      if (dist > 0) {
        var fr;
        if (args.feedrate > 0) {
          fr = args.feedrate
        } else {
          fr = 100;
        }
        timeMinutes = dist / fr;

        // adjust for acceleration, meaning estimate
        // this will run longer than estimated from the math
        // above because we don't start moving at full feedrate
        // obviously, we have to slowly accelerate in and out
        timeMinutes = timeMinutes * 1.32;
      }
      this.totalTime += timeMinutes;

      p2.feedrate = args.feedrate;
      p2.dist = dist;
      p2.distSum = this.totalDist;
      p2.timeMins = timeMinutes;
      p2.timeMinsSum = this.totalTime;

      //  console.log("calculating distance. dist:", dist, "totalDist:", this.totalDist, "feedrate:", args.feedrate, "timeMinsToExecute:", timeMinutes, "totalTime:", this.totalTime, "p1:", p1, "p2:", p2, "args:", args);

    }
    this.totalDist = 0;
    this.totalTime = 0;

    var relative = false;

    this.delta = function(v1, v2) {
      return relative ? v2 : v2 - v1;
    }

    this.absolute = function(v1, v2) {
      return relative ? v1 + v2 : v2;
    }

    var ijkrelative = true; // For Mach3 Arc IJK Absolute mode
    this.ijkabsolute = function(v1, v2) {
      return ijkrelative ? v1 + v2 : v2;
    }

    this.addFakeSegment = function(args) {
      //line.args = args;
      var arg2 = {
        isFake: true,
        text: args.text,
        indx: args.indx
      };
      if (arg2.text.match(/^(;|\(|<)/)) arg2.isComment = true;
      lines.push({
        p2: lastLine, // since this is fake, just use lastLine as xyz
        'args': arg2
      });
    }

    var cofg = this;
    var parser = new this.GCodeParser({
        //set the g92 offsets for the parser - defaults to no offset
        /* When doing CNC, generally G0 just moves to a new location
        as fast as possible which means no milling or extruding is happening in G0.
        So, let's color it uniquely to indicate it's just a toolhead move. */
        G0: function(args, indx) {
          //G1.apply(this, args, line, 0x00ff00);
          //console.log("G0", args);
          var newLine = {
            x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
            y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
            z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
            e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
            f: args.f !== undefined ? cofg.absolute(lastLine.f, args.f) : lastLine.f,
            s: args.s !== undefined ? cofg.absolute(lastLine.s, args.s) : lastLine.s,
          };
          newLine.g0 = true;
          //cofg.newLayer(newLine);
          cofg.addSegment(lastLine, newLine, args);
          //console.log("G0", lastLine, newLine, args, cofg.offsetG92);
          lastLine = newLine;
        },
        G1: function(args, indx) {
          // Example: G1 Z1.0 F3000
          //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
          //          G1 E104.25841 F1800.0
          // Go in a straight line from the current (X, Y) point
          // to the point (90.6, 13.8), extruding material as the move
          // happens from the current extruded length to a length of
          // 22.4 mm.
          var newLine = {
            x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
            y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
            z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
            e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
            f: args.f !== undefined ? cofg.absolute(lastLine.f, args.f) : lastLine.f,
            s: args.s !== undefined ? cofg.absolute(lastLine.s, args.s) : lastLine.s,
          };
          /* layer change detection is or made by watching Z, it's made by
                  watching when we extrude at a new Z position */
          if (cofg.delta(lastLine.e, newLine.e) > 0) {
            newLine.extruding = cofg.delta(lastLine.e, newLine.e) > 0;
            if (layer == undefined || newLine.z != layer.z) cofg.newLayer(newLine);
          }
          newLine.g1 = true;
          cofg.addSegment(lastLine, newLine, args);
          //console.log("G1", lastLine, newLine, args, cofg.offsetG92);
          lastLine = newLine;
        },
        G2: function(args, indx, gcp) {
          /* this is an arc move from lastLine's xy to the new xy. we'll
          show it as a light gray line, but we'll also sub-render the
          arc itself by figuring out the sub-segments . */
          args.plane = plane; //set the plane for this command to whatever the current plane is
          var newLine = {
            x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
            y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
            z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
            e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
            f: args.f !== undefined ? cofg.absolute(lastLine.f, args.f) : lastLine.f,
            arci: args.i !== undefined ? cofg.ijkabsolute(lastLine.x, args.i) : lastLine.x,
            arcj: args.j !== undefined ? cofg.ijkabsolute(lastLine.y, args.j) : lastLine.y,
            arck: args.k !== undefined ? cofg.ijkabsolute(lastLine.z, args.k) : lastLine.z,
            arcr: args.r ? args.r : null,
          };
          //console.log("G2 newLine:", newLine);
          //newLine.g2 = true;
          newLine.arc = true;
          newLine.clockwise = true;
          if (args.clockwise === false) newLine.clockwise = args.clockwise;
          cofg.addSegment(lastLine, newLine, args);
          //console.log("G2", lastLine, newLine, args, cofg.offsetG92);
          lastLine = newLine;
          //console.log("G2. args:", args);
        },
        G3: function(args, indx, gcp) {
          /* this is an arc move from lastLine's xy to the new xy. same
          as G2 but reverse*/
          args.arc = true;
          args.clockwise = false;
          gcp.handlers.G2(args, indx, gcp);
        },

        G73: function(args, indx, gcp) {
          // peck drilling. just treat as g1
          newLine.g73 = true;
          console.log("G73 gcp:", gcp);
          gcp.handlers.G1(args);
        },

        G92: function(args) { // E0
          // G92: Set Position
          // Example: G92 E0
          // Allows programming of absolute zero point, by reseting the
          // current position to the values specified. This would set the
          // machine's X coordinate to 10, and the extrude coordinate to 90.
          // No physical motion will occur.

          // TODO: Only support E0
          var newLine = lastLine;

          cofg.offsetG92.x = (args.x !== undefined ? (args.x === 0 ? newLine.x : newLine.x - args.x) : 0);
          cofg.offsetG92.y = (args.y !== undefined ? (args.y === 0 ? newLine.y : newLine.y - args.y) : 0);
          cofg.offsetG92.z = (args.z !== undefined ? (args.z === 0 ? newLine.z : newLine.z - args.z) : 0);
          cofg.offsetG92.e = (args.e !== undefined ? (args.e === 0 ? newLine.e : newLine.e - args.e) : 0);

          //newLine.x = args.x !== undefined ? args.x + newLine.x : newLine.x;
          //newLine.y = args.y !== undefined ? args.y + newLine.y : newLine.y;
          //newLine.z = args.z !== undefined ? args.z + newLine.z : newLine.z;
          //newLine.e = args.e !== undefined ? args.e + newLine.e : newLine.e;

          //console.log("G92", lastLine, newLine, args, cofg.offsetG92);

          //lastLine = newLine;
          cofg.addFakeSegment(args);
        },
        M30: function(args) {
          cofg.addFakeSegment(args);
        },

        'default': function(args, info) {
          //if (!args.isComment)
          //    console.log('Unknown command:', args.cmd, args, info);
          cofg.addFakeSegment(args);
        },
      },
      // Mode-setting non-motion commands, of which many may appear on one line
      // These take no arguments
      {
        G17: function() {
          console.log("SETTING XY PLANE");
          plane = "G17";
        },

        G18: function() {
          console.log("SETTING XZ PLANE");
          plane = "G18";
        },

        G19: function() {
          console.log("SETTING YZ PLANE");
          plane = "G19";
        },

        G20: function() {
          // G21: Set Units to Inches
          // We don't really have to do anything since 3d viewer is unit agnostic
          // However, we need to set a global property so the trinket decorations
          // like toolhead, axes, grid, and extent labels are scaled correctly
          // later on when they are drawn after the gcode is rendered
          cofg.setUnits("inch");
        },

        G21: function() {
          // G21: Set Units to Millimeters
          // Example: G21
          // Units from now on are in millimeters. (This is the RepRap default.)
          cofg.setUnits("mm");
        },

        // A bunch of no-op modes that do not affect the viewer
        G40: function() {}, // Tool radius compensation off
        G41: function() {}, // Tool radius compensation left
        G42: function() {}, // Tool radius compensation right
        G45: function() {}, // Axis offset single increase
        G46: function() {}, // Axis offset single decrease
        G47: function() {}, // Axis offset double increase
        G48: function() {}, // Axis offset double decrease
        G49: function() {}, // Tool length offset compensation cancle
        G54: function() {}, // Select work coordinate system 1
        G55: function() {}, // Select work coordinate system 2
        G56: function() {}, // Select work coordinate system 3
        G57: function() {}, // Select work coordinate system 4
        G58: function() {}, // Select work coordinate system 5
        G59: function() {}, // Select work coordinate system 6
        G61: function() {}, // Exact stop check mode
        G64: function() {}, // Cancel G61
        G69: function() {}, // Cancel G68

        G90: function() {
          // G90: Set to Absolute Positioning
          // Example: G90
          // All coordinates from now on are absolute relative to the
          // origin of the machine. (This is the RepRap default.)
          relative = false;
        },

        'G90.1': function() {
          // G90.1: Set to Arc Absolute IJK Positioning
          // Example: G90.1
          // From now on, arc centers are specified directly by
          // the IJK parameters, e.g. center_x = I_value
          // This is Mach3-specific
          ijkrelative = false;
        },

        G91: function() {
          // G91: Set to Relative Positioning
          // Example: G91
          // All coordinates from now on are relative to the last position.
          relative = true;
        },

        'G91.1': function() {
          // G91.1: Set to Arc Relative IJK Positioning
          // Example: G91.1
          // From now on, arc centers are relative to the starting
          // coordinate, e.g. center_x = this_x + I_value
          // This is the default, and the only possibility for most
          // controllers other than Mach3
          ijkrelative = true;
        },

        // No-op modal macros that do not affect the viewer
        M07: function() {}, // Coolant on (mist)
        M08: function() {}, // Coolant on (flood)
        M09: function() {}, // Coolant off
        M10: function() {}, // Pallet clamp on
        M11: function() {}, // Pallet clamp off
        M21: function() {}, // Mirror X axis
        M22: function() {}, // Mirror Y axis
        M23: function() {}, // Mirror off
        M24: function() {}, // Thread pullout gradual off
        M41: function() {}, // Select gear 1
        M42: function() {}, // Select gear 2
        M43: function() {}, // Select gear 3
        M44: function() {}, // Select gear 4
        M48: function() {}, // Allow feedrate override
        M49: function() {}, // Disallow feedrate override
        M52: function() {}, // Empty spindle
        M60: function() {}, // Automatic pallet change

        M82: function() {
          // M82: Set E codes absolute (default)
          // Descriped in Sprintrun source code.

          // No-op, so long as M83 is not supported.
        },

        M84: function() {
          // M84: Stop idle hold
          // Example: M84
          // Stop the idle hold on all axis and extruder. In some cases the
          // idle hold causes annoying noises, which can be stopped by
          // disabling the hold. Be aware that by disabling idle hold during
          // printing, you will get quality issues. This is recommended only
          // in between or after printjobs.
          // No-op
        },
      });
    // console.log("GCODE LENGTH " + gcode.length)
    parser.parse(gcode);

    // console.log("inside createGcodeFromObject. this:", this);

    // console.log("Layer Count ", layers.length);

    if (scene.getObjectByName('gcodeobject')) {
      // console.log("Existing GCODE object: Cleaning up first")
      scene.remove(scene.getObjectByName('gcodeobject'))
      object = false;
    }

    object = new THREE.Object3D();
    // console.log("Created new gcodeobject")

    // old approach of monolithic line segment
    for (var lid in layers) {
      var layer = layers[lid];
      // console.log("Layer ", layer.layer);
      for (var tid in layer.type) {
        var type = layer.type[tid];
        // console.log("Layer:", type);
        //normal geometry (not buffered)
        // var layerline = new THREE.Line(type.geometry, type.material, THREE.LinePieces)
        // object.add();
        // using buffer geometry
        var bufferGeo = this.convertLineGeometryToBufferGeometry(type.geometry, type.color);
        var layerline = new THREE.LineSegments(bufferGeo, type.material)
        layerline.name = "layer-" + type.type
        object.add(layerline);
      }
    }
    //XY PLANE
    this.extraObjects["G17"].forEach(function(obj) {
      // non-buffered approach
      //object.add(obj);

      // buffered approach
      // convert g2/g3's to buffer geo as well
      //console.log("extra object:", obj);
      var bufferGeo = this.convertLineGeometryToBufferGeometry(obj.geometry, obj.material.color);
      object.add(new THREE.Line(bufferGeo, obj.material));
    }, this);
    //XZ PLANE
    this.extraObjects["G18"].forEach(function(obj) {
      // buffered approach
      var bufferGeo = this.convertLineGeometryToBufferGeometry(obj.geometry, obj.material.color);
      var tmp = new THREE.Line(bufferGeo, obj.material)
      tmp.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      object.add(tmp);
    }, this);
    //YZ PLANE
    this.extraObjects["G19"].forEach(function(obj) {
      // buffered approach
      var bufferGeo = this.convertLineGeometryToBufferGeometry(obj.geometry, obj.material.color);
      var tmp = new THREE.Line(bufferGeo, obj.material)
      tmp.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      tmp.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      object.add(tmp);
    }, this);

    // use new approach of building 3d object where each
    // gcode line is its own segment with its own userData
    //object = new3dObj;


    // console.log("bbox ", bbbox);

    // Center
    var scale = 1; // TODO: Auto size

    var center = new THREE.Vector3(
      bbbox.min.x + ((bbbox.max.x - bbbox.min.x) / 2),
      bbbox.min.y + ((bbbox.max.y - bbbox.min.y) / 2),
      bbbox.min.z + ((bbbox.max.z - bbbox.min.z) / 2));
    // console.log("center ", center);

    var center2 = new THREE.Vector3(
      bbbox2.min.x + ((bbbox2.max.x - bbbox2.min.x) / 2),
      bbbox2.min.y + ((bbbox2.max.y - bbbox2.min.y) / 2),
      bbbox2.min.z + ((bbbox2.max.z - bbbox2.min.z) / 2));
    // console.log("center2 of all gcode ", center2);

    // store meta data in userData of object3d for later use like in animation
    // of toolhead
    object.userData.bbbox2 = bbbox2;
    object.userData.lines = lines;
    object.userData.layers = layers;
    object.userData.center2 = center2;
    object.userData.extraObjects = this.extraObjects;
    object.userData.threeObjs = new3dObj;

    // console.log("userData for this object3d:", object.userData);
    /*
    this.camera.target.x = center2.x;
    this.camera.target.y = center2.y;
    this.camera.target.z = center2.z;
    */

    //object.position = center.multiplyScalar(-scale);

    //object.scale.multiplyScalar(scale);
    // console.log("final object:", object);
    // object.translateX(sizexmax /2 * -1);
    // object.translateY(sizeymax /2 * -1);
    object.name = "gcodeobject"
    scene.add(object);
    // viewObject();

    var template = `<i class="fa fa-star-o fa-fw"></i>preview`
    $('#previewbtntext').html(template)
  }

function convertLineGeometryToBufferGeometry(lineGeometry, color) {
  var positions = new Float32Array(lineGeometry.vertices.length * 3);
  var colors = new Float32Array(lineGeometry.vertices.length * 3);

  var geometry = new THREE.BufferGeometry();

  for (var i = 0; i < lineGeometry.vertices.length; i++) {
    var x = lineGeometry.vertices[i].x;
    var y = lineGeometry.vertices[i].y;
    var z = lineGeometry.vertices[i].z;

    // positions
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // colors
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

  geometry.computeBoundingSphere();

  return geometry;
};