var collapsedGroups = {};

// runs in threejs animate() loop: Sets colors and checkboxes of items based on userdata.selected=true/false
function animateTree() {
  var selectCount = 0;
  for (i = 0; i < objectsInScene.length; i++) {
    var obj = objectsInScene[i]
    obj.traverse(function(child) {
      if (child.type == "Line" && child.userData.selected) {
        if (child.userData.hover) {
          child.material.color.setRGB(1, 0.1, 0.4);
        } else {
          child.material.color.setRGB(1, 0.1, 0.1);
        }
        var $link = $('#' + child.userData.link);
        var $parent = $link.parent();
        var $input = $parent.children('input');
        $link.parent().find('label').css('color', '#e74c3c');
        $input.prop('checked', true);
        selectCount++
      } else if (child.type == "Line" && !child.userData.selected) {
        if (child.userData.hover) {
          child.material.color.setRGB(0.1, 0.4, 1);
        } else {
          child.material.color.setRGB(0.1, 0.1, 0.1);
        }
        var $link = $('#' + child.userData.link);
        var $parent = $link.parent();
        var $input = $parent.children('input');
        $link.parent().find('label').css('color', '#222');
        $input.prop('checked', false);
      }

    });
  }
  if (selectCount > 0) {
    $("#selectCount").text(selectCount)
    $("#tpaddpath").prop('disabled', false);
    if (toolpathsInScene.length > 0) {
      $("#tpaddpath-dropdown").prop('disabled', false);
    }
  } else {
    $("#selectCount").text("")
    $("#tpaddpath").prop('disabled', true);
    $("#tpaddpath-dropdown").prop('disabled', true);
  }
  updateTreeSelection();
}

// to update parent tick if all children are ticked/unticked
function updateTreeSelection() {
  $('.jobsetuptable .chkaddjob').each(function(n, input) {
    var $input = $(input);
    var $parent = $input.parent();
    if (!$input.hasClass('item')) {
      var items = $input.parent().parent().find('ul .chkaddjob').length;
      var checkedItems = $input.parent().parent().find('ul input:checked').length;
      $input.prop('checked', items == checkedItems);
      if (items == checkedItems) {
        $input.parent().find('label').css('color', '#e74c3c');
      } else {
        $input.parent().find('label').css('color', 'black');
      }
    }
  });
}

function toggleToolpathVisibility(i, bool) {
  toolpathsInScene[i].userData.visible = bool
  fillTree();
}

// move toolpath order up/down
var moveOp = function(index, delta) {
  storeUndo(true)
  var array = toolpathsInScene;
  // var index = array.indexOf(element);
  var newIndex = index + delta;
  if (newIndex < 0 || newIndex == array.length) return; //Already at the top or bottom.
  var indexes = [index, newIndex].sort(); //Sort the indixes
  array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]); //Replace from lowest index, two elements, reverting the order
};

// select all children from document level
function selectDocument(index, bool) {
  var obj = objectsInScene[index]
  obj.traverse(function(child) {
    if (child.type == "Line") {
      child.userData.selected = bool;
    }
  });
}

// event handlers after building tree template in filltree();
function eventsTree() {

  // select Document Label
  $('.jobsetuptable .documentselect').on('change', function(e) {
    var $input = $(this);
    var $parent = $input.parent();
    var checked = $input.prop('checked');
    var idx, i, j;
    var seq = $input.attr('objectseq');
    var obj = objectsInScene[seq]
    // console.log($input)
    obj.traverse(function(child) {
      if (child.type == "Line") {
        child.userData.selected = checked;
      }
    });
  });

  // select child of a layer/component
  $('.jobsetuptable .chkaddjob').on('change', function(e) {
    var $input = $(this);
    var $parent = $input.parent();
    var checked = $input.prop('checked');
    var idx, i, j;
    // console.log("change", $parent, checked)
    // if clicked on Line's checkbox
    if ($input.hasClass('item')) {
      console.log('got here')
      idx = $parent.children('input').attr('id').split('.');
      i = parseInt(idx[1]);
      j = parseInt(idx[2]);
      objectsInScene[i].children[j].userData.selected = checked;
      return false;
    }
    $input.parent().parent().find('ul .chkaddjob').each(function(n, input) {
      console.log('got here')
      $input = $(input);
      $parent = $input.parent().parent();
      if ($input.hasClass('item')) {
        idx = $input.attr('id').split('.');
        i = parseInt(idx[1]);
        j = parseInt(idx[2]);
        objectsInScene[i].children[j].userData.selected = checked;
      }
    });
  });

  // remove a row
  $('.jobsetupgroup .remove').on('click', function() {
    storeUndo(true)
    console.log("Clicked on Remove Row")
    var $parent = $(this).parent();
    console.log($parent)
    var idx, i, j;
    if ($parent.find('input').hasClass('item')) { // polyline
      console.log('has item');
      idx = $parent.find('input').attr('id').split('.');
      i = parseInt(idx[1]);
      j = parseInt(idx[2]);
      objectsInScene[i].remove(objectsInScene[i].children[j]);
    } else { // layer
      console.log('no item');
      var children = [];
      $parent.parent().find('ul .chkaddjob').each(function(n, input) {
        console.log(input)
        idx = $(input).attr('id').split('.');
        i = parseInt(idx[1]);
        j = parseInt(idx[2]);
        children.push(objectsInScene[i].children[j]);
      });
      for (var n = 0; n < children.length; n++) {
        objectsInScene[i].remove(children[n]);
      }
    }
    fillTree();
  });

  // Edit Toolpath Name inplace
  $('#toolpathstable .entity-job').on('input', function() {
    var $this = $(this);
    var data = $this.data();
    toolpathsInScene[data.id].name = $this.text();
  });

}

function fillTree() {
  // $('#filetreeheader').empty();
  $('#filetree').empty();
  // $('#toolpathtreeheader').empty();
  $('#toolpathtree').empty();
  $('#toolpathsmenu').empty();
  clearSceneFlag = true;

  if (objectsInScene.length > 0) {

    // clear any childless parents
    for (i = 0; i < objectsInScene.length; i++) {
      if (objectsInScene[i].children.length < 1) {
        objectsInScene.splice(i, 1);
      }
    };

    $('#tpaddpath').removeClass('disabled');
    $('#tpaddpath-dropdown').removeClass('disabled');

    var table = `<table class="jobsetuptable" style="width: 100%" id="filetreetable">`
    $('#filetree').append(table);


    var currentObject, currentObjectData;

    for (i = 0; i < objectsInScene.length; i++) {

      currentObject = objectsInScene[i];
      currentObjectData = currentObject.userData;

      if (currentObjectData.offsetX) {
        var xoffset = currentObjectData.offsetX.toFixed(1);
      } else {
        var xoffset = 0;
      }
      if (currentObjectData.offsetX) {
        var yoffset = currentObjectData.offsetY.toFixed(1);
      } else {
        var yoffset = 0;
      }
      var xpos = currentObject.position.x.toFixed(1);
      var ypos = currentObject.position.y.toFixed(1);
      var scale = currentObject.scale.y;

      var svgscale = null;

      if (currentObject.name.indexOf('.svg') != -1) {
        if (currentObjectData.editor) {
          var localKey = currentObjectData.editor.name + 'DPI';
          var dpi = loadSetting(localKey) || loadSetting('defaultDPI') || 24;
          svgscale = 25.4 / parseFloat(dpi);
          scaleSVGObject(currentObject, svgscale);
        } else {
          svgscale = currentObject.scale.x
        }
      }

      if (objectsInScene[i].type != "Mesh") {
        var file = `
                <tr class="jobsetupfile topborder">
                  <td colspan="2" class="filename">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input documentselect" objectseq="` + i + `" id="selectall` + i + `">
                      <label class="form-check-label" for=""><i class="fa fa-fw fa-file-text-o" aria-hidden="true"></i>` + objectsInScene[i].name + `</label>
                    </div>
                  </td>
                  <td id="buttons` + i + `">
                    <button class="btn btn-xs btn-primary" onclick="$('#move` + i + `').toggle(); $(this).toggleClass('active');"><i class="fa fa-arrows" aria-hidden="true"></i></button>
                    <button class="btn btn-xs btn-danger remove" onclick="storeUndo(); objectsInScene.splice('` + i + `', 1); fillTree();"><i class="fa fa-times" aria-hidden="true"></i></button>
                  </td>
                </tr>
                <tr class="jobsetupfile" id="move` + i + `" style="display: none;">
                  <td colspan="3">
                    <label >Position Offset</label>
                    <table>
                      <tr>
                        <td>
                          <div class="input-group">
                            <span class="input-group-addon input-group-addon-xs">X:</span>
                            <input type="number" class="form-control input-xs" xoffset="` + xoffset + `" value="` + -(xoffset - xpos) + `"  id="xoffset` + i + `" objectseq="` + i + `" step="1"><br>
                            <span class="input-group-addon input-group-addon-xs">mm</span>
                          </div>
                        </td>
                        <td>
                          <div class="input-group">
                            <span class="input-group-addon input-group-addon-xs">Y:</span>
                            <input type="number" class="form-control input-xs" yoffset="` + yoffset + `" value="` + -(yoffset - ypos) + `"  id="yoffset` + i + `" objectseq="` + i + `" step="1">
                            <span class="input-group-addon input-group-addon-xs">mm</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                `
      }
      $('#filetreetable').append(file);

      if (svgscale) {
        var svgfile = `
                <tr class="jobsetupfile" id="scale` + i + `" style="display: none;">
                <td colspan="3">
                <label>SVG Resolution</label>
                <div class="input-group">
                <input type="number" class="form-control input-xs" value="` + (25.4 / svgscale).toFixed(1) + `" id="svgresol` + i + `" objectseq="` + i + `">
                <span class="input-group-addon input-group-addon-xs">DPI</span>
                </div>
                </td>
                </tr>`
        $('#filetreetable').append(svgfile)

        var scalebtn = `<button class="btn btn-xs btn-primary" onclick="$('#scale` + i + `').toggle(); $(this).toggleClass('active');"><i class="fa fa-expand" aria-hidden="true"></i></button>`
        $('#buttons' + i).prepend(scalebtn)
      }

      $('#filetreetable').append(`
            <tr>
            <td colspan="3" class="jobsetupgroup">
            <ul id="jobsetupgroup` + i + `"></ul>
            </td>
            </tr>
            <tr class="filespacer"><td colspan="3"><hr /></td></tr>
            `);

      var currentChildren = currentObject.children;
      var currentChildrenLength = currentChildren.length;

      var $childGroup = $('#jobsetupgroup' + i);

      var $parentGroup = null;
      var $currentTable = null;
      var currentTable = null;
      var currentChild = null;
      var childTemplate = null;
      var childData = null;
      var groupName = null;
      var groupId = null;

      for (var j = 0; j < currentChildrenLength; j++) {
        currentChild = currentChildren[j];
        childData = currentChild.userData;
        childData.link = "link" + i + "_" + j;

        childLayer = childData.layer;

        $parentGroup = $childGroup;

        // Polyline Object
        childTemplate = `
                <li children` + i + `">

                  <div class="form-check">
                    <input type="checkbox" class="form-check-input chkaddjob chkchildof` + i + ` item" id="child.` + i + `.` + j + ` ">
                    <label class="form-check-label" for="child.` + i + `.` + j + `" id="link` + i + `_` + j + `"><i class="fa fa-fw fa-object-ungroup" aria-hidden="true"></i>` + currentChild.name + `</label>
                    <a class="remove btn btn-xs btn-light"><i class="fa fa-trash" aria-hidden="true"></i></a>
                  </div>


                </li>`;

        if (!childLayer) {
          $childGroup.append(childTemplate);
        } else {
          if (childLayer.parent) {
            $parentGroup = $('#' + childLayer.parent.id);

            if (!$parentGroup.length) {
              // SVG Group
              currentTable = `
                            <li class="group">
                              <div class="checkbox">
                                <input type="checkbox" class="fr chkaddjob chkchildof` + i + `" />
                                <i class="fa fa-fw fa-sm fa-object-group" aria-hidden="true"></i>&nbsp;
                                <a class="entity toggle" href="#" onclick="return false;">` + childLayer.parent.label + `</a>
                                <span class="counter label badge badge-info">0</span>
                                <a class="fr remove btn btn-xs btn-danger"><i class="fa fa-times" aria-hidden="true"></i></a>
                                <ul id="` + childLayer.parent.id + `"></ul>
                              </div>
                            </li>
                            `;
              $childGroup.append(currentTable);
              $parentGroup = $('#' + childLayer.parent.id);
            }
          }
          $currentTable = $('#' + childLayer.id);
          if (!$currentTable.length) {
            // Layer
            currentTable = `
                        <li class="group">
                          <div class="form-check">
                            <input type="checkbox" class="form-check-input chkaddjob chkchildof` + i + `">
                            <label class="form-check-label" for=""><i class="fa fa-fw fa-sm fa-object-group" aria-hidden="true"></i>` + childLayer.label + `</label>
                            <a class="remove btn btn-xs btn-light"><i class="fa fa-trash" aria-hidden="true"></i></a>
                          </div>
                          <ul id="` + childLayer.id + `"></ul>
                        </li>`;
            $parentGroup.append(currentTable);
            $currentTable = $('#' + childLayer.id);
          }
          $currentTable.append(childTemplate);
        }
        // if (childData.selected) {
        //     attachBB(currentChild);
        // }
      }

    }
    var tableend = `
        </table>
        `
    $('#filetree').append(tableend)
  } else {
    var instructions = `Please open a file from the <kbd>Open</kbd> button...`
    $('#filetree').append(instructions)

  } // End of if (objectsInScene.length > 0)

  if (toolpathsInScene.length > 0) {

    $('#generatetpgcode').removeClass('disabled');

    var table = `<table class="jobsetuptable" style="width: 100%" id="toolpathstable">`
    $('#toolpathtree').append(table)

    var menuheader = `<h6 class="dropdown-header">Add selection to existing toolpath:</h6>`
    $('#toolpathsmenu').append(menuheader);

    for (i = 0; i < toolpathsInScene.length; i++) {
      if (toolpathsInScene[i].type != "Mesh") {

        var operation;
        if (toolpathsInScene[i].userData.camOperation) {
          operation = toolpathsInScene[i].userData.camOperation
        } else {
          operation = "not configured"
        }

        var toolp = `<tr class="jobsetupfile" id="toolpathrow` + i + `">
                <td>
                <i class="fa fa-fw fa-object-group" aria-hidden="true"></i>&nbsp;
                <span class="entity-job" contenteditable="true" data-id="` + i + `">` + toolpathsInScene[i].name + `</span>
                <h6 style="margin: 0px 0px;"><small><b>` + operation + `</b>`
        if (!toolpathsInScene[i].userData.visible) {
          toolp += " (hidden) "
        }
        toolp += `</small></h6>
                </td>
                <td>

                </td>
                <td>
                <div class="btn-group" role="group" aria-label="Toolpath Options">`

        if (toolpathsInScene[i].userData.visible) {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Hide toolpath and exclude from GCODE generation" class="btn btn-xs btn-warning" onclick="toggleToolpathVisibility(` + i + `, false);"><i class="fa fa-fw fa-eye-slash" aria-hidden="true"></i></button>`
        } else {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Show toolpath and include in GCODE generation" class="btn btn-xs btn-warning" onclick="toggleToolpathVisibility(` + i + `, true);"><i class="fa fa-fw fa-eye" aria-hidden="true"></i></button>`
        }

        if (i > 0) {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Move down" class="btn btn-xs btn-success" onclick="moveOp(` + i + `, -1); fillTree();"><i class="fa fa-arrow-up" aria-hidden="true"></i></button>`
        } else {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Move down" class="btn btn-xs btn-success disabled" onclick="moveOp(` + i + `, -1); fillTree();"><i class="fa fa-arrow-up" aria-hidden="true"></i></button>`
        }

        if (i < toolpathsInScene.length - 1) {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Move up" class="btn btn-xs btn-success" onclick="moveOp(` + i + `, 1); fillTree();"><i class="fa fa-arrow-down" aria-hidden="true"></i></button>`
        } else {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Move up" class="btn btn-xs btn-success disabled" onclick="moveOp(` + i + `, 1); fillTree();"><i class="fa fa-arrow-down" aria-hidden="true"></i></button>`
        }

        toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Delete toolpath" class="btn btn-xs btn-danger" onclick="toolpathsInScene.splice('` + i + `', 1); fillTree();"><i class="fa fa-times" aria-hidden="true"></i></button>
                <button data-tooltip="tooltip" data-placement="bottom" title="Edit toolpath" class="btn btn-xs btn-primary" onclick="setupJob(` + i + `);"><i class="fa fa-fw fa-sliders" aria-hidden="true"></i></button>
                </div>
                </td>
                </tr>
                `
      }
      $('#toolpathstable').append(toolp);

      // append toolpath to menu
      var menuitem = `<a class="dropdown-item" href="#" onclick="addJob(` + i + `)">` + toolpathsInScene[i].name + `: ` + operation + `</a>`;
      $('#toolpathsmenu').append(menuitem);

    }

    // contentEditable for Toolpath Name field - edit directly in toolpath table

  } else {
    var instructions = `Please select some entities from the <b>Documents</b>, or by clicking them in the viewer.  Hold down Ctrl to select more than one in the viewer. Add them to a toolpath using the <br><kbd><i class="fa fa-plus" aria-hidden="true"></i> Add selection to Job</kbd> button...`
    $('#toolpathtree').append(instructions)

  } // End of if (toolpathsInScene.length > 0)
  var tableend = `
    </table>
    `
  $('#toolpathstable').append(tableend)

  eventsTree();
}