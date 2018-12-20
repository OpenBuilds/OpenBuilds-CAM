// All the credit for this functionality goes to @tbfleming: https://github.com/tbfleming

var clipperToCppScale = 1 / 128; // Prevent overflow for coordinates up to ~1000 mm
var inchToClipperScale = 1270000000;
var mmToClipperScale = inchToClipperScale / 25.4; // 50000000;
var clipperToCppScale = 1 / 128; // Prevent overflow for coordinates up to ~1000 mm
var cleanPolyDist = 100;
var arcTolerance = 10000;
var fillColor = 0x006666;

function fillPath(config) {
  var geometry = getClipperPaths(config.toolpath)
  var geometryInside = getInflatePath(geometry, -config.offset);
  var scale = 100;
  ClipperLib.JS.ScaleUpPaths(geometryInside, scale);
  var lineDistance = config.offset * 200;
  var angle = 0;
  if (!geometryInside.length || !geometryInside[0].length) {
    console.log("Invalid Geometry", geometry)
    return [];
  } else {
    console.log("Valid Geometry", geometry)
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
  if (pathIsClosed(currentPath))
    currentPath.push(currentPath[0]);
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
        for (let pointIndex = 0; pointIndex < path.length; ++pointIndex)
          check(pointIndex);
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
    paths: camPaths,
    color: toolpathColor,
    opacity: 0.2,
    z: 0,
    isClosed: false,
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
  // console.log("inside pathIsClosed")
  return (
    clipperPath.length >= 2 &&
    clipperPath[0].X === clipperPath[clipperPath.length - 1].X &&
    clipperPath[0].Y === clipperPath[clipperPath.length - 1].Y);
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