$( "#CreateCircle" ).on( "click", function() {
  event.preventDefault();
  var radius = $( "#circleRadius" ).val();
  addCircle(radius);
});

$( "#CreateRect" ).on( "click", function() {
  event.preventDefault();
  var width = $( "#rectX" ).val();
  var height = $( "#rectY" ).val();
  addRect(width, height);
});

$( "#AddCircle" ).on( "click", function() {
  $( "#addShapeCircle" ).modal( "show" );
  // dialog.dialog( "open" );
});

$( "#AddRect" ).on( "click", function() {
  $( "#addShapeRect" ).modal( "show" );
  // dialog.dialog( "open" );
});

function addCircle(radius) {
  var existingInternalCad = scene.getObjectByName( "Internal CAD", true );
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
  var geometry = new THREE.CircleGeometry( radius, 32 );
  geometry.vertices.shift();
  geometry.vertices.push(geometry.vertices[0]);
  var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var circle = new THREE.Line( geometry, material );
  circle.name = "circle"
  circle.translateX(radius);
  circle.translateY(radius);
  fileObject.add( circle );
  fileObject.name = "Internal CAD"
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  $( "#addShapeCircle" ).modal( "hide" );
  setTimeout(function(){ fillTree(); }, 250);
}

function addRect(width, height) {
  var existingInternalCad = scene.getObjectByName( "Internal CAD", true );
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
  var rectgeom = new THREE.Geometry();
  rectgeom.vertices.push(new THREE.Vector3(0, 0, 0));
  rectgeom.vertices.push(new THREE.Vector3(0, height, 0));
  rectgeom.vertices.push(new THREE.Vector3(width, height, 0));
  rectgeom.vertices.push(new THREE.Vector3(width, 0, 0));
  rectgeom.vertices.push(new THREE.Vector3(0, 0, 0));
  // rectgeom.faces.push(new THREE.Face3(0, 1, 2));
  // rectgeom.faces.push(new THREE.Face3(0, 3, 2));
  var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var rectangle = new THREE.Line(rectgeom, material);
  rectangle.name = "rectangle"
  fileObject.add( rectangle );
  fileObject.name = "Internal CAD"
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  $( "#addShapeRect" ).modal( "hide" );
  setTimeout(function(){ fillTree(); }, 250);
}
