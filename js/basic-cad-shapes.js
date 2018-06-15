$("#CreateCircle").on("click", function() {
  event.preventDefault();
  var radius = $("#circleRadius").val();
  addCircle(radius);
});

function addCircle(radius) {
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
  var geometry = new THREE.CircleGeometry(radius, 32);
  geometry.vertices.shift();
  geometry.vertices.push(geometry.vertices[0]);
  var material = new THREE.MeshBasicMaterial({
    color: 0xffff00
  });
  var circle = new THREE.Line(geometry, material);
  circle.name = "circle"
  circle.translateX(radius);
  circle.translateY(radius);
  fileObject.add(circle);
  fileObject.name = "Internal CAD"
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  $("#addShapeCircle").modal("hide");
  setTimeout(function() {
    fillTree();
  }, 250);
}

$("#CreateRect").on("click", function() {
  event.preventDefault();
  var width = $("#rectX").val();
  var height = $("#rectY").val();
  addRect(width, height);
});

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
  fileObject.name = "Internal CAD"
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  $("#addShapeRect").modal("hide");
  setTimeout(function() {
    fillTree();
  }, 250);
}

$(document).ready(function() {
  var modal = `
  <div id="addShapeCircle" class="modal fade" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add shape: Circle</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group row">
              <label for="circleRadius" class="col-sm-2 col-form-label">Radius</label>
              <div class="col-sm-5">
                <input type="number" class="form-control" id="circleRadius" value="10">
              </div>
              <label for="circleRadius" class="col-sm-5 col-form-label">mm</label>
            </div>
            <div class="form-group row">
              <div class="col-sm-10">
                <button type="button" class="btn btn-primary" id="CreateCircle">Create</button>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer" id="statusFooter"></div>
      </div>
    </div>
  </div>

  <div id="addShapeRect" class="modal fade" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add shape: Rectangle</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
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
            <div class="form-group row">
              <div class="col-sm-10">
                <button type="button" class="btn btn-primary" id="CreateRect">Create</button>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer" id="statusFooter"></div>
      </div>
    </div>
  </div>
  `
  $("body").append(modal);
});