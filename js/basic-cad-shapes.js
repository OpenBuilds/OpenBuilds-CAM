function addCircle(radius, segments) {
  if (segments < 1) {
    segments = 32;
  }
  console.log("Adding circle: " + radius)
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
  var geometry = new THREE.CircleGeometry(radius, segments);
  geometry.vertices.shift();
  var endx = parseFloat(geometry.vertices[0].x)
  var endy = parseFloat(geometry.vertices[0].y)
  var endz = parseFloat(geometry.vertices[0].z)
  geometry.vertices.push(
    new THREE.Vector3(endx, endy, endz),
  );
  var material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide
  });

  var geometry2 = new THREE.Geometry();

  for (i = 0; i < geometry.vertices.length; i++) {
    var x = parseFloat(geometry.vertices[i].x)
    var y = parseFloat(geometry.vertices[i].y)
    var z = parseFloat(geometry.vertices[i].z)
    geometry2.vertices.push(
      new THREE.Vector3(x, y, z),
    );
  }


  // geometry2.translate(radius, radius, 0)
  var circle = new THREE.Line(geometry2, material);
  circle.name = "circle"
  // circle.geometry.verticesNeedUpdate = true
  // circle.translateX(radius);
  // circle.translateY(radius);
  fileObject.add(circle);
  fileObject.name = "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
  }, 250);
}

function addRect(width, height) {
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
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
  var material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide
  });
  var rectangle = new THREE.Line(rectgeom, material);
  rectangle.name = "rectangle"
  fileObject.add(rectangle);
  fileObject.name = "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
  }, 250);
}

$(document).ready(function() {
  var modal = `

  <div class="dialog" data-overlay-click-close="true" data-role="dialog" id="addShapeCircle" data-to-top="true">
    <div class="dialog-title" id="statusTitle">Add shape: Circle</div>
    <div class="dialog-content">
    <form>
      <input type="number" class="form-control" id="circleRadius" value="10" data-role="input" data-append="mm" data-prepend="Radius" step="0.001">
      <br>
      <input type="number" class="form-control" id="circleSegments" value="32" data-role="input"  data-prepend="Segments" step="0.001">
      <small>Segments determines the smoothness of the circle, as circles are processed as Polylines</small>
    </form>
    </div>
    <div class="dialog-actions" id="statusFooter">
      <button class="button js-dialog-close">Cancel</button>
      <button type="button" class="button js-dialog-close success" id="CreateCircle">Create</button>
    </div>
  </div>

  <div class="dialog" data-overlay-click-close="true" data-role="dialog" id="addShapeRect" data-to-top="true">
		<div class="dialog-title" id="statusTitle">Add shape: Rectangle</div>
		<div class="dialog-content">
    <form>
      <input type="number" class="form-control" id="rectX" value="100" data-role="input" data-append="mm" data-prepend="Width" step="0.001">
      <br>
      <input type="number" class="form-control" id="rectY" value="50" data-role="input" data-append="mm" data-prepend="Height" step="0.001">
    </form>
		</div>
		<div class="dialog-actions" id="statusFooter">
			<button class="button js-dialog-close">Cancel</button>
      <button type="button" class="button js-dialog-close success" id="CreateRect">Create</button>
		</div>
	</div>
  `
  $("body").append(modal);

  $("#CreateCircle").on("click", function(event) {
    console.log("Clicked on CreateCircle")
    event.preventDefault();
    var radius = $("#circleRadius").val();
    var segments = $("#circleSegments").val();
    addCircle(radius, segments);
  });

  $("#CreateRect").on("click", function(event) {
    event.preventDefault();
    var width = $("#rectX").val();
    var height = $("#rectY").val();
    addRect(width, height);
  });

});