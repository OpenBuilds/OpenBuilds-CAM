var selectCount = 0;

function treeClick(checkbox) {
  var type = checkbox.getAttribute("data-type");
  var checked = checkbox.checked;
  var object = checkbox.getAttribute("data-object");
  var child = checkbox.getAttribute("data-child");
  var layer = checkbox.getAttribute("data-layer");
  console.log("Event: " + (checked ? "Selected" : "Deselected") + " Object: " + object + ", child: " + child + ", layer: " + layer)
  if (type == "doc") {
    if (checked) {
      var object = objectsInScene[object]
      object.traverse(function(child) {
        if (child.type == "Line") {
          child.userData.selected = true;
        }
      });
    } else {
      var object = objectsInScene[object]
      object.traverse(function(child) {
        if (child.type == "Line") {
          child.userData.selected = false;
        }
      });
    }
  }
  if (type == "layer") {
    if (checked) {
      var object = objectsInScene[object]
      object.traverse(function(child) {
        if (child.type == "Line") {
          if (child.userData.layer.label == layer) {
            child.userData.selected = true;
          }
        }
      });
    } else {
      var object = objectsInScene[object]
      object.traverse(function(child) {
        if (child.type == "Line") {
          if (child.userData.layer.label == layer) {
            child.userData.selected = false;
          }
        }
      });
    }
  }
  if (type == "vector") {
    if (checked) {
      objectsInScene[object].children[child].userData.selected = true;
    } else {
      objectsInScene[object].children[child].userData.selected = false;
    }
  }
}

function filldoctree() {
  // Empty the Documents node
  $('#left-tree-view').empty();

  clearSceneFlag = true;

  // Two sorting strategies:

  // Travelling Salesman Sort
  // sortDocumentsByGeometryStartpoint()

  // Sort Smallest to Largest
  sortPolyGons();

  if (objectsInScene.length > 0) {

    // clear any childless parents
    for (i = 0; i < objectsInScene.length; i++) {
      if (objectsInScene[i].children.length < 1) {
        objectsInScene.splice(i, 1);
      }
    };

    // Create a New Tree on Viewer, with a Documents Node
    var template = `<ul data-role="treeview" id="doctree" data-on-node-click="treeClick(this);" data-on-check-click="treeClick(this);">
      <li data-icon="<span class='far fa-folder'></span>" data-caption="Documents">
        <ul id="documenttree">
        </ul>
      </li>`
    $('#left-tree-view').append(template);

    // Add Nodes under Documents for each Document.  Documents have id=doc0, doc1, etc doc+i
    var template = '';
    for (i = 0; i < objectsInScene.length; i++) {
      // <button class='button mini flat-button' onclick='storeUndo(); objectsInScene.splice(` + i + `,1); fillTree();''><i class='far fa-fw fa-trash-alt'></i></button>
      template += `<li><input id="checkbox_` + i + `" type="checkbox" data-role="checkbox" data-caption="<span class='far fa-file'></span>` + objectsInScene[i].name + `" data-type="doc" data-object="` + i + `"><ul id="doc` + i + `"></ul></li>`
    };
    $('#documenttree').append(template);

    //Find Unique Layers
    for (i = 0; i < objectsInScene.length; i++) {
      var layersinthisdoc = []
      for (j = 0; j < objectsInScene[i].children.length; j++) {
        if (objectsInScene[i].children[j].userData.layer) {
          var layer = objectsInScene[i].children[j].userData.layer.label
        } else {
          var layer = 'layer1'
        }
        var found = jQuery.inArray(layer, layersinthisdoc);
        if (found >= 0) {
          // Element was found already
        } else {
          layersinthisdoc.push(layer); // Element was not found, add it.
        }
      };

      // Add Layer Nodes
      var template = '';
      for (j = 0; j < layersinthisdoc.length; j++) {
        // Layers
        template += `<li  data-collapsed="true"><input type="checkbox" data-role="checkbox" data-caption="<span class='fas fa-layer-group'></span>` + layersinthisdoc[j] + `" data-type="layer" data-object="` + i + `" data-layer="` + layersinthisdoc[j] + `"><ul id="doc` + i + `layer` + layersinthisdoc[j].replace(/ /g, '') + `"></ul></li>`
      }
      // console.log("Document " + i + "contains layers: ", layersinthisdoc, template)
      $('#doc' + i).append(template);

      // Add Vectors to Layers
      for (j = 0; j < objectsInScene[i].children.length; j++) {
        var template = ` <li><input id="checkbox_` + i + `_` + j + `" type="checkbox" data-role="checkbox" data-caption="<span class='fas fa-vector-square'></span>` + objectsInScene[i].children[j].name + `" data-type="vector" data-object="` + i + `" data-child="` + j + `" data-layer="` + layersinthisdoc[j] + `"></li>`
        objectsInScene[i].children[j].userData.link = "link" + i + "_" + j;
        if (objectsInScene[i].children[j].userData.layer) {
          var layer = objectsInScene[i].children[j].userData.layer.label.replace(/ /g, '')
        } else {
          var layer = 'layer1'
        }
        $('#doc' + i + 'layer' + layer).append(template);
      }
    };

    $('#tpaddpath').removeClass('disabled');
    $('#tpaddpath-dropdown').removeClass('disabled');
    $('#nodocuments').hide()
  } else { // End of if (objectsInScene.length > 0
    $('#nodocuments').show()
  }
}

// runs in threejs animate() loop: Sets colors and checkboxes of items based on userdata.selected=true/false
function animateTree() {
  var tree = $('#doctree').data('treeview');
  selectCount = 0;
  for (i = 0; i < objectsInScene.length; i++) {
    var obj = objectsInScene[i]
    var childselectcount = 0;
    for (j = 0; j < obj.children.length; j++) {
      var child = obj.children[j]
      if (child.type == "Line" && child.userData.selected) {
        if (child.userData.hover) {
          // child.material.color.setRGB(0, 0.48, 1);
          child.material.color.setRGB(1, 0.2, 0.27);
        } else {
          child.material.color.setRGB(1, 0.2, 0.27);
        }
        var check = $('#checkbox_' + i + '_' + j);
        check.prop('checked', true);
        tree._recheck(check);
        // $('#checkbox_' + i + '_' + j).prop('checked', true);
        childselectcount++
        selectCount++
      } else if (child.type == "Line" && !child.userData.selected) {
        if (child.userData.hover) {
          child.material.color.setRGB(0, 0.48, 1);
        } else {
          child.material.color.setRGB(0, 0, 0);
        }
        var check = $('#checkbox_' + i + '_' + j);
        check.prop('checked', false);
        tree._recheck(check);
        // $('#checkbox_' + i + '_' + j).prop('checked', false);
      }
    }
    // if (childselectcount == obj.children.length) {
    //   $('#checkbox_' + i).prop('checked', true);
    // } else {
    //   $('#checkbox_' + i).prop('checked', false);
    // }
  }
  if (selectCount > 0) {
    $("#tpaddpathParent").prop('disabled', false).removeClass('disabled')
    $(".selectCount").html(" " + selectCount + " ");
    $("#tpaddpath").prop('disabled', false);
    $('#floating-tpaddpath-btn').prop('disabled', false);
    $('#floating-tpaddpath-btn').addClass('success')
    // $('#floating-tpaddpath-btn').html('<span class="icon">+' + selectCount + '</span>')
    $("#tpaddicon").addClass('fg-green')
    $(".selectCount").show();
    if (toolpathsInScene.length > 0) {
      $("#tpaddpath-dropdown").prop('disabled', false);
    }
  } else {
    $("#tpaddpathParent").prop('disabled', true).addClass('disabled');
    $("#tpaddicon").removeClass('fg-green')
    $(".selectCount").hide();
    $(".selectCount").html(" " + selectCount + " ");
    $("#tpaddpath").prop('disabled', true);
    $('#floating-tpaddpath-btn').prop('disabled', true);
    $('#floating-tpaddpath-btn').removeClass('success')
    // $('#floating-tpaddpath-btn').html('<span class="icon"><span class="mif-plus"></span></span>')
    $("#tpaddpath-dropdown").prop('disabled', true);
  }
}