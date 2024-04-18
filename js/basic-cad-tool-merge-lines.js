// Note to self.   Select "line" items in Doc tree > run addMergedLines
// No tolerance yet
// operator has to select lines that belong to the same "shape"
// manually - sorted needs to learn to find all that has matching start/end - then reprocess remainders again creating multiple polylines as it goes so you
// can even use Select All, it should filter for 2-point vectors (lines), etc

function addMergedLines() {

  // var lines = []
  var toolpath = new THREE.Group();


  for (i = 0; i < objectsInScene.length; i++) {
    var obj = objectsInScene[i];
    obj.traverse(function(child) {
      if (child.userData.selected) {
        var copy = child.clone()
        //console.log("copy:", copy)
        if (copy.geometry.vertices.length < 3) {
          copy.userData.closed = false
        } else if (copy.geometry.vertices.length > 2) {
          var d = distanceFormula(copy.geometry.vertices[0].x, copy.geometry.vertices[copy.geometry.vertices.length - 1].x, copy.geometry.vertices[0].y, copy.geometry.vertices[copy.geometry.vertices.length - 1].y)
          console.log(d)
          if (d < 0.1) {
            copy.userData.closed = true
          } else {
            copy.userData.closed = false
          }
        }
        copy.position.copy(obj.position);
        toolpath.add(copy);
        // lines.push(copy)
      }
    });
  };


  // get it as Clipper paths
  var newClipperPaths = getClipperPaths(toolpath);
  console.log(JSON.stringify(newClipperPaths))
  var sortedPaths = sortClipperPath(newClipperPaths)
  console.log(JSON.stringify(sortedPaths))

  var fileObject = new THREE.Group();
  // Create a new geometry
  var mergedGeometry = new THREE.Geometry();

  sortedPaths.forEach(function(coord) {
    mergedGeometry.vertices.push(new THREE.Vector3(coord.X, coord.Y, 0));
  });
  // add geometry


  var material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide
  });
  var mergedPath = new THREE.Line(mergedGeometry, material);
  mergedPath.name = "Merged Lines"
  fileObject.add(mergedPath);
  fileObject.name = "Merged Lines" + Math.random()

  objectsInScene.push(fileObject)
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
    resetView();
  }, 250);
}

// function sortClipperPath(clipperPath) {
//   // Create a map to store the starting and ending points of each segment
//   const startPoints = new Map();
//   const endPoints = new Map();
//
//   // Iterate through each segment and store their start and end points
//   clipperPath.forEach(segment => {
//     console.log(segment)
//     const startPoint = segment[0];
//     const endPoint = segment[1];
//
//     const startPointKey = `${startPoint.X},${startPoint.Y}`;
//     const endPointKey = `${endPoint.X},${endPoint.Y}`;
//
//     // Store start and end points in respective maps
//     if (!startPoints.has(startPointKey)) {
//       startPoints.set(startPointKey, segment);
//     }
//     if (!endPoints.has(endPointKey)) {
//       endPoints.set(endPointKey, segment);
//     }
//   });
//
//   // Reorder the segments to form a continuous path
//   const sortedPath = [];
//   let currentSegment = clipperPath[0];
//   sortedPath.push(currentSegment);
//   clipperPath.splice(0, 1); // Remove the first segment from the original array
//
//   while (clipperPath.length > 0) {
//     const endPoint = currentSegment[1];
//     const endPointKey = `${endPoint.X},${endPoint.Y}`;
//
//     // Find the next segment whose start point matches the current segment's end point
//     const nextSegment = startPoints.get(endPointKey);
//
//     // If next segment is found, add it to the sorted path and remove it from the original array
//     if (nextSegment) {
//       sortedPath.push(nextSegment);
//       clipperPath.splice(clipperPath.indexOf(nextSegment), 1);
//       currentSegment = nextSegment;
//     } else {
//       // If no next segment is found, break the loop
//       break;
//     }
//   }
//
//   // Flatten the sorted path into a single array
//   const flattenedPath = sortedPath.reduce((acc, segment) => {
//     acc.push(segment[0], segment[1]);
//     return acc;
//   }, []);
//
//   return flattenedPath;
// }

function sortClipperPath(clipperPath, threshold = 0.1) {
  // Create a map to store the starting and ending points of each segment
  const startPoints = new Map();
  const endPoints = new Map();

  // Helper function to check if two points are approximately equal within the threshold
  const arePointsApproximatelyEqual = (point1, point2) => {
    return Math.abs(point1.X - point2.X) < threshold && Math.abs(point1.Y - point2.Y) < threshold;
  };

  // Iterate through each segment and store their start and end points
  clipperPath.forEach(segment => {
    const startPoint = segment[0];
    const endPoint = segment[1];

    const startPointKey = `${startPoint.X},${startPoint.Y}`;
    const endPointKey = `${endPoint.X},${endPoint.Y}`;

    // Store start and end points in respective maps
    if (!startPoints.has(startPointKey)) {
      startPoints.set(startPointKey, segment);
    }
    if (!endPoints.has(endPointKey)) {
      endPoints.set(endPointKey, segment);
    }
  });

  // Reorder the segments to form a continuous path
  const sortedPath = [];
  let currentSegment = clipperPath[0];
  sortedPath.push(currentSegment);
  clipperPath.splice(0, 1); // Remove the first segment from the original array

  while (clipperPath.length > 0) {
    const endPoint = currentSegment[1];
    const endPointKey = `${endPoint.X},${endPoint.Y}`;

    // Find the next segment whose start point approximately matches the current segment's end point
    let nextSegment = null;
    for (const [key, segment] of startPoints) {
      const startPoint = segment[0];
      if (arePointsApproximatelyEqual(startPoint, endPoint)) {
        nextSegment = segment;
        break;
      }
    }

    // If next segment is found, add it to the sorted path and remove it from the original array
    if (nextSegment) {
      sortedPath.push(nextSegment);
      clipperPath.splice(clipperPath.indexOf(nextSegment), 1);
      currentSegment = nextSegment;
    } else {
      // If no next segment is found, break the loop
      break;
    }
  }

  // Flatten the sorted path into a single array
  const flattenedPath = sortedPath.reduce((acc, segment) => {
    acc.push(segment[0], segment[1]);
    return acc;
  }, []);

  return flattenedPath;
}


function tryFixGeometry(object) {
  getClipperPaths(object)
  console.log("Clipper Path", JSON.stringify(clipperPaths));
  var sortedPaths = sortClipperPath(clipperPaths)
  console.log("Clipper Path", JSON.stringify(sortedPaths));
  return sortedPaths
}

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