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