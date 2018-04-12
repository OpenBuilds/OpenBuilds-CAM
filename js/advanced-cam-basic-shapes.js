form = $( "#addShape" ).find( "form" ).on( "submit", function( event ) {
  event.preventDefault();
  var radius = $( "#circleRadius" ).val();
  addCircle(radius);
});

$( "#AddCircle" ).on( "click", function() {
  $( "#addShape" ).modal( "show" );
  // dialog.dialog( "open" );
});

function addCircle(radius) {
  console.log('adduser');
  var fileObject = new THREE.Group();
  var geometry = new THREE.CircleGeometry( radius, 32 );
  geometry.vertices.shift();
  geometry.vertices.push(geometry.vertices[0]);
  var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var circle = new THREE.Line( geometry, material );
  circle.name = "circle"
  fileObject.add( circle );
  fileObject.name = "Internal CAD"
  objectsInScene.push(fileObject)
  $( "#addShape" ).modal( "hide" );
  setTimeout(function(){ fillTree(); }, 250);
}
