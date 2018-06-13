// Porting GCMC to JS:https://gitlab.com/gcmc/gcmc/blob/master/example/trochoidal.gcmc

// duplicated functions, remove after int\egration
function distanceFormula(x1, x2, y1, y2) {
  // get the distance between p1 and p2
  var a = (x2 - x1) * (x2 - x1);
  var b = (y2 - y1) * (y2 - y1);
  return Math.sqrt(a + b);
};

// vector functions
var rotateVector = function(vec, ang) {
  // ang = -ang * (Math.PI / 180);
  var cos = Math.cos(ang);
  var sin = Math.sin(ang);
  return new Array(Math.round(10000 * (vec[0] * cos - vec[1] * sin)) / 10000, Math.round(10000 * (vec[0] * sin + vec[1] * cos)) / 10000);
};

function toRadians(angle) {
  return angle * Math.PI / 180;
}

function toDegrees(angle) {
  return angle * (180 / Math.PI);
}

// trochoidal functions
function trochoid_point(ang, a, b) {
  // ANGLE IN RAD, POINT, Trochoid step parameter, radius
  // Trochoids are defined in radians
  // The first part is the trochoid, the second part moves the first 180 degree point at a relative "0, 0" location so we can scale in any way without having to do hard math
  return [(a * ang - b * Math.sin(ang)) - (a * Math.PI), (b - b * Math.cos(ang)) - (2.0 * b)];
}

/*
 * Straight Line Milling... call this func
 * Perform a move from startpoint to endpoint using a trochoidal path.
 * - Cutting at depth cutz (returns to old Z)
 * - Trochoid radius as specified
 * - Increment for each turn as specified
 */
function trochoid_move(startpoint, endpoint, cutz, radius, increment, type) {
  var gcode = ""
  var a = increment / (2.0 * Math.PI); // Trochoid step parameter
  var ainc = Math.log10(radius) * 5.0; // Step INCREMENT (segments in the circle) are logarithmic based on the radius to reduce small steps // radius in mm * 5 deg

  // If we are not moving, it is an error
  if (distanceFormula(startpoint[0], endpoint[0], startpoint[1], endpoint[1]) <= 0.0) {
    console.log("trochoid move is not going anywhere");
    return;
  }

  // Calculate the number of *whole* rotations, rounded up, we need to make
  var ceil = Math.round(distanceFormula(startpoint[0], endpoint[0], startpoint[1], endpoint[1]) / increment);
  // var ceil = (distanceFormula(startpoint[0], endpoint[0], startpoint[1], endpoint[1]) / increment)
  var n = 2.0 * Math.PI * ceil // in Radians.  Later in the i-loop we loop in Degrees

  // The path may be arbitrary angled, get the angle for rotating the trochoid
  var rot = Math.atan2(endpoint[1] - startpoint[1], endpoint[0] - startpoint[0]);

  // // Go to the trochoid entry-point and move to cutting deph
  var trochoidalpoint = trochoid_point(toRadians(0), a, radius)
  var rotated = rotateVector([trochoidalpoint[0], trochoidalpoint[1]], rot)
  gcode += "G0 X" + (startpoint[0] + rotated[0]) + " Y" + (startpoint[1] + rotated[1]) + "\n"

  // // Calculate each next point of the trochoid until we traversed the whole path to the endpoint

  //for (i = 0.0; i < toDegrees(n); i += ainc) {
  for (i = 0; i < toDegrees(n); i += ainc) {
    var trochoidalpoint = trochoid_point(toRadians(i), a, radius)
    var rotated = rotateVector([trochoidalpoint[0], trochoidalpoint[1]], rot)

    if (distanceFormula(startpoint[0] + rotated[0], endpoint[0], startpoint[1] + rotated[1], endpoint[1]) < 0.2) {
      console.log("GOTCHA at", i, toDegrees(n), startpoint, endpoint)
      // return;
    } else {
      gcode += type + " X" + (startpoint[0] + rotated[0]) + " Y" + (startpoint[1] + rotated[1]) + "\n"

    }
  }
  return gcode;
}

// sample move
var g = "G21\nG90\n";
// trochoid_move(startpoint, endpoint, cutz, radius, increment
g += trochoid_move([0.00, 0.00], [10.00, 0.00], -1.0, 5.0, 2.0, "G1")
g += trochoid_move([10.00, 0.00], [20.00, 0.00], -1.0, 5.0, 2.0, "G0")
g += trochoid_move([20.00, 0.00], [30.00, 10.00], -1.0, 5.0, 2.0, "G1")
g += trochoid_move([30.00, 10.00], [50.00, 10.00], -1.0, 5.0, 2.0, "G0")
g += trochoid_move([50.00, 10.00], [60.00, 0.00], -1.0, 5.0, 2.0, "G1")
g += trochoid_move([60.00, 0.00], [70.00, 0.00], -1.0, 5.0, 2.0, "G0")
g += trochoid_move([70.00, 0.00], [80.00, 0.00], -1.0, 5.0, 2.0, "G1")
g += trochoid_move([80.00, 0.00], [100.00, 0.00], -1.0, 5.0, 2.0, "G0")
// g += "G1 X100 Y0 \n"
// g += "G1 X100 Y10  \n"
// g += "G1 X0 Y10 \n"
// g += "G1 X0 Y0 \n"
// g += "G1 X20 Y0 \n"
// g += "G1 X30 Y10 \n"
// g += "G1 X50 Y10 \n"
// g += "G1 X60 Y0 \n"
// g += "G1 X100 Y0 \n"

console.log(g)

gcview.loadGC(g);
// end sample