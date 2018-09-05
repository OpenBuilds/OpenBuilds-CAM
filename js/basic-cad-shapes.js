function addCircle(radius) {
  console.log("Adding circle: " + radius)
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
  var geometry = new THREE.CircleGeometry(radius, 32);
  geometry.vertices.shift();
  var endx = parseFloat(geometry.vertices[0].x)
  var endy = parseFloat(geometry.vertices[0].y)
  var endz = parseFloat(geometry.vertices[0].z)
  geometry.vertices.push(
    new THREE.Vector3(endx, endy, endz),
  );
  var material = new THREE.MeshBasicMaterial({
    color: 0xffff00
  });
  var circle = new THREE.Line(geometry, material);
  circle.name = "circle"
  circle.translateX(radius);
  circle.translateY(radius);
  fileObject.add(circle);
  fileObject.name = "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
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
    color: 0xffff00
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
  }, 250);
}

$(document).ready(function() {
  var modal = `

  <div class="dialog" data-overlay-click-close="true" data-role="dialog" id="addShapeCircle" data-to-top="true">
    <div class="dialog-title" id="statusTitle">Add shape: Circle</div>
    <div class="dialog-content">
    <form>
      <div class="form-group row">
        <label for="circleRadius" class="col-sm-2 col-form-label">Radius</label>
        <div class="col-sm-5">
          <input type="number" class="form-control" id="circleRadius" value="10">
        </div>
        <label for="circleRadius" class="col-sm-5 col-form-label">mm</label>
      </div>
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
      <div class="form-group row">
        <label for="rectX" class="col-sm-2 col-form-label">Width</label>
        <div class="col-sm-5">
          <input type="number" class="form-control" id="rectX" value="100">
        </div>
        <label for="rectX" class="col-sm-5 col-form-label">mm</label>
      </div>
      <div class="form-group row">
        <label for="rectY" class="col-sm-2 col-form-label">Height</label>
        <div class="col-sm-5">
          <input type="number" class="form-control" id="rectY" value="50">
        </div>
        <label for="rectY" class="col-sm-5 col-form-label">mm</label>
      </div>
    </form>
		</div>
		<div class="dialog-actions" id="statusFooter">
			<button class="button js-dialog-close">Cancel</button>
      <button type="button" class="button js-dialog-close success" id="CreateRect">Create</button>
		</div>
	</div>
  `
  $("body").append(modal);

  $("#CreateCircle").on("click", function() {
    console.log("Clicked on CreateCircle")
    event.preventDefault();
    var radius = $("#circleRadius").val();
    addCircle(radius);
  });

  $("#CreateRect").on("click", function() {
    event.preventDefault();
    var width = $("#rectX").val();
    var height = $("#rectY").val();
    addRect(width, height);
  });

});