var inflateGrp;
var fileParentGroup;

function drawDXF(file, fileName) {

  // console.group("DXF File:")
  yflip = false;
  Array.prototype.unique = function() {
    var n = {},
      r = [];
    for (var i = 0; i < this.length; i++) {
      if (!n[this[i]]) {
        n[this[i]] = true;
        r.push(this[i]);
      }
    }
    return r;
  }

  fileObject = new THREE.Group();

  row = [];
  pwr = [];
  cutSpeed = [];

  parser2 = new window.DxfParser();
  dxf2 = parser2.parseSync(file);

  var fileLayers = [];

  for (i = 0; i < dxf2.entities.length; i++) {
    fileLayers.push(dxf2.entities[i].layer)
    // console.log('drawEntity - DXF: ' + i)
    drawEntity(i, dxf2.entities[i]);
    // console.log( dxf2.entities[i].type + i)
  };


  fileObject.name = fileName;
  fileObject.userData.layers = $.unique(fileLayers);
  fileObject.position.x = 0;
  fileObject.position.y = 0;
  // fileObject.translateX((sizexmax / 2) * -1);
  // fileObject.translateY((sizeymax / 2) * -1);
  // putFileObjectAtZero(fileObject);
  // scene.add(fileObject);
  // calcZeroOffset(fileObject)
  objectsInScene.push(fileObject)
  layers = [];
  layers = row.unique();
  viewExtents(fileParentGroup);
  svgxpos = 0;
  svgypos = 0;
  // console.groupEnd();
};