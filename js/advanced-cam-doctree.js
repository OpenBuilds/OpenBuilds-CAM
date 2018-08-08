function filldoctree() {
  // Empty the Documents node
  $('#left-tree-view').empty();

  clearSceneFlag = true;
  sortDocumentsByGeometryStartpoint()

  if (objectsInScene.length > 0) {

    // clear any childless parents
    for (i = 0; i < objectsInScene.length; i++) {
      if (objectsInScene[i].children.length < 1) {
        objectsInScene.splice(i, 1);
      }
    };

    // Create a New Tree on Viewer, with a Documents Node
    var template = `<ul data-role="treeview" id="doctree">
      <li data-icon="<span class='far fa-folder'></span>" data-caption="Documents">
        <ul id="documenttree">
        </ul>
      </li>`
    $('#left-tree-view').append(template);

    // Add Nodes under Documents for each Document.  Documents have id=doc0, doc1, etc doc+i
    var template = '';
    for (i = 0; i < objectsInScene.length; i++) {
      template += `<li data-icon="<span class='far fa-file'></span>" data-caption="` + objectsInScene[i].name + `"><button class="button mini flat-button" onclick="storeUndo(); objectsInScene.splice(` + i + `,1); fillTree();"><i class="far fa-fw fa-trash-alt"></i></button><ul id="doc` + i + `"></ul></li>`
    };
    $('#documenttree').append(template);

    //Find Unique Layers
    for (i = 0; i < objectsInScene.length; i++) {
      var layersinthisdoc = []
      for (j = 0; j < objectsInScene[i].children.length; j++) {
        var layer = objectsInScene[i].children[j].userData.layer.label
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
        template += `<li  data-collapsed="true" data-icon="<span class='fas fa-layer-group'></span>" data-caption="Layer: ` + layersinthisdoc[j] + `"><ul id="doc` + i + `layer` + layersinthisdoc[j].replace(/ /g, '') + `"></ul></li>`
      }
      // console.log("Document " + i + "contains layers: ", layersinthisdoc, template)
      $('#doc' + i).append(template);

      // Add Vectors to Layers
      for (j = 0; j < objectsInScene[i].children.length; j++) {
        var template = ` <li id="link` + i + `_` + j + `" data-icon="<span class='fas fa-vector-square'></span>" data-caption="` + objectsInScene[i].children[j].name + `"></li>`
        objectsInScene[i].children[j].userData.link = "link" + i + "_" + j;
        var layer = objectsInScene[i].children[j].userData.layer.label.replace(/ /g, '')
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
  var selectCount = 0;
  for (i = 0; i < objectsInScene.length; i++) {
    var obj = objectsInScene[i]
    obj.traverse(function(child) {
      if (child.type == "Line" && child.userData.selected) {
        if (child.userData.hover) {
          child.material.color.setRGB(0, 0.48, 1);
        } else {
          child.material.color.setRGB(1, 0.2, 0.27);
        }
        var $link = $('#' + child.userData.link).css('color', '#e74c3c');
        selectCount++
      } else if (child.type == "Line" && !child.userData.selected) {
        if (child.userData.hover) {
          child.material.color.setRGB(0, 0.48, 1);
        } else {
          child.material.color.setRGB(0, 0, 0);
        }
        var $link = $('#' + child.userData.link).css('color', '#222');
      }
    });
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