var objectToScale = null;

function showScaleWindow(object) {
  objectToScale = object;
  var bbox2 = new THREE.Box3().setFromObject(object);
  var width = (bbox2.max.x - bbox2.min.x).toFixed(2)
  var height = (bbox2.max.y - bbox2.min.y).toFixed(2)
  var left = bbox2.min.x
  var bottom = bbox2.min.y
  // console.log(width, height, left, bottom)
  var template = `
  <i class="fas fa-ruler"></i> <b>Scale</b>: <small>` + object.name + `</small>
  <table>
    <tr>
      <td>Width: </td>
      <td>
        <div class="input-addon">
          <span class="input-addon-label-left"><i class="fas fa-ruler-horizontal"></i></span>
          <input type="text" class="cam-form-field" value="` + width + `" id="scaleWidth"  objectseq="` + i + `" min="0" style="text-align: right;">
          <span class="input-addon-label-right">mm</span>
        </div>
      </td>
      <td rowspan="2">Link Aspect</td>
    </tr>
    <tr>
      <td>Height: </td>
      <td>
        <div class="input-addon">
          <span class="input-addon-label-left"><i class="fas fa-ruler-vertical"></i></span>
          <input type="text" class="cam-form-field" value="` + height + `" id="scaleHeight"  objectseq="` + i + `" min="0" style="text-align: right;">
          <span class="input-addon-label-right">mm</span>
        </div>
      </td>
    </tr>
  </table>
  <button type="button" class="btn btn-sm btn-danger" onclick="scalewindow.style.visibility = 'hidden';" aria-label="Close">
    Cancel
  </button>
  <button type="button" class="btn btn-sm btn-success" aria-label="Close" onclick="scaleObj()">
    Apply
  </button>
  `;
  $('#scalewindow').html(template)
  var aspect = width / height
  $("#scaleWidth").keyup(function() {
    var width = Number($(this).val());
    $("#scaleHeight").val((width / aspect).toFixed(3));
  });
  $("#scaleHeight").keyup(function() {
    var height = Number($(this).val());
    $("#scaleWidth").val((height * aspect).toFixed(3));
  });
}

function scaleObj() {
  storeUndo(true);
  var object = objectToScale;
  var bbox2 = new THREE.Box3().setFromObject(object);
  var width = (bbox2.max.x - bbox2.min.x).toFixed(2)
  var height = (bbox2.max.y - bbox2.min.y).toFixed(2)
  var newWidth = $('#scaleWidth').val()
  var newHeight = $('#scaleHeight').val()
  var opt = {
    scale: {
      x: newWidth / width,
      y: newHeight / height,
      z: 1
    }
  }
  for (j = 0; j < object.children.length; j++) {
    alterGeometry(object.children[j].geometry, opt)
  }
  var bbox3 = new THREE.Box3().setFromObject(object);
  // console.log(bbox3, bbox2)
  var xoffset = bbox3.min.x - bbox2.min.x;
  var yoffset = bbox3.min.y - bbox2.min.y;
  console.log(xoffset, yoffset)
  object.translateX(-xoffset)
  object.translateY(-yoffset)
  changePositionToGeoTranslate();
  scalewindow.style.visibility = "hidden";
  $('#scaleWidth').unbind('keyup');
  $('#scaleHeight').unbind('keyup');
}