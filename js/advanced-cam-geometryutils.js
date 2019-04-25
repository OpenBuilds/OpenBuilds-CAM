// Lifesaving function from https://stackoverflow.com/a/41548365 by https://stackoverflow.com/users/1135731/arpo
function alterGeometry(geometry, opt) {
  // console.log(opt)
  var toAlter = [];

  var matrixMultiplier = function(mtx) {
    var matrix = new THREE.Matrix4();
    mtx.forEach(function(m, index) {
      matrix = new THREE.Matrix4().multiplyMatrices(matrix, m);
    });
    return matrix;
  };

  if (opt.position)
    toAlter.push(new THREE.Matrix4().setPosition(new THREE.Vector3(opt.position.x, opt.position.y, opt.position.z)));

  if (opt.rotation && opt.rotation.x)
    toAlter.push(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), opt.rotation.x));

  if (opt.rotation && opt.rotation.y)
    toAlter.push(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), opt.rotation.y));

  if (opt.rotation && opt.rotation.z)
    toAlter.push(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), opt.rotation.z));

  if (opt.scale)
    toAlter.push(new THREE.Matrix4().scale(opt.scale));

  geometry.applyMatrix(matrixMultiplier(toAlter));
  return geometry;

}

// Travelling Salesman - basics
// toolpathsInScene[0].children = sortArrayByGeometryCenter(toolpathsInScene[0].children);
function sortDocumentsByGeometryStartpoint() {
  for (i = 0; i < objectsInScene.length; i++) {
    var array = objectsInScene[i].children
    objectsInScene[i].children = array.sort(function(a, b) {
      var aDist = parseFloat(distanceFormula(0, a.geometry.vertices[0].x, 0, a.geometry.vertices[0].y))
      var bDist = parseFloat(distanceFormula(0, b.geometry.vertices[0].x, 0, b.geometry.vertices[0].y));
      if (aDist < bDist) {
        return -1;
      }
      if (aDist > bDist) {
        return 1;
      }
    });
  }
}

// Sort vectors from small-to-largest
function sortPolyGons() {
  for (i = 0; i < objectsInScene.length; i++) {
    var array = objectsInScene[i].children
    objectsInScene[i].children = array.sort(function(a, b) {
      var aArea = calcPolygonArea(a.geometry.vertices)
      var bArea = calcPolygonArea(b.geometry.vertices)
      // var aArea = parseFloat(distanceFormula(0, a.geometry.vertices[0].x, 0, a.geometry.vertices[0].y))
      // var bArea = parseFloat(distanceFormula(0, b.geometry.vertices[0].x, 0, b.geometry.vertices[0].y));
      if (aArea < bArea) {
        return -1;
      }
      if (aArea > bArea) {
        return 1;
      }
    });
  }
}

function calcPolygonArea(vertices) {
  if (vertices && vertices.length) {
    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
      var addX = vertices[i].x;
      var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
      var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
      var subY = vertices[i].y;

      total += (addX * addY * 0.5);
      total -= (subX * subY * 0.5);
    }

    return Math.abs(total);
  }

}

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = 0;
  var maxIndex = 0;

  for (var i = 1; i < arr.length - 1; i++) {
    var dist = distanceFormula(arr[i].x, arr[i + 1].x, arr[i].y, arr[i + 1].y)
    // console.log("dist " + dist + " / index " + i)
    if (dist > max) {
      maxIndex = i;
      max = dist;
    }
  }

  return maxIndex;
}

// circular rotation of array (sort by largest helper)
Array.prototype.rotateRight = function(n) {
  var clone = this.slice(0);

  clone.unshift.apply(clone, clone.splice(n, clone.length))
  return clone;
}
// example rotation
// var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// months.rotateRight( 6 )
// console.log(months)