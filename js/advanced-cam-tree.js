// Handles the Toolpaths / Operations tree
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

function fillTree() {
  // $('#filetreeheader').empty();
  $('#filetree').empty();
  // $('#toolpathtreeheader').empty();
  $('#toolpathtree').empty();
  $('#toolpathsmenu').empty();
  $('#remtoolpathsmenu').empty();

  // Default Menu
  var menuitem = `<li><a  href="#" onclick="addJob(-1);"><span class="fa fa-fw fa-plus"></span>Create a new operation...</a></li>`;
  $('#toolpathsmenu').append(menuitem);

  clearSceneFlag = true;

  filldoctree();

  if (toolpathsInScene.length > 0) {

    $('#generatetpgcode').removeClass('disabled');

    var table = `<table class="jobsetuptable" style="width: 100%" id="toolpathstable">`
    $('#toolpathtree').append(table)

    for (i = 0; i < toolpathsInScene.length; i++) {
      if (toolpathsInScene[i].type != "Mesh") {

        var operation;
        if (toolpathsInScene[i].userData.camOperation) {
          operation = toolpathsInScene[i].userData.camOperation
        } else {
          operation = "not configured <i class='fas fa-times fa-fw fg-red'></i>"
        }

        var toolp = `<tr class="jobsetupfile" id="toolpathrow` + i + `">
                <td>
                  <table>
                    <tr>
                    <td>
                    <h6 style="margin: 0px 0px;"><small> <b><span contenteditable="true" data-id="` + i + `">` + toolpathsInScene[i].name + `</span> ` + operation + `</b>`
        if (!toolpathsInScene[i].userData.visible) {
          toolp += " (hidden) "
        }
        toolp += `</small></h6>
                    </td>
                    </tr>
                    <tr>
                    <td>
                    <div class="toolbar">
                    `

        if (toolpathsInScene[i].userData.visible) {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Hide toolpath and exclude from GCODE generation" class="tool-button warning" onclick="toggleToolpathVisibility(` + i + `, false);"><i class="fa fa-fw fa-eye-slash" aria-hidden="true"></i></button>`
        } else {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Show toolpath and include in GCODE generation" class="tool-button alert" onclick="toggleToolpathVisibility(` + i + `, true);"><i class="fa fa-fw fa-eye" aria-hidden="true"></i></button>`
        }

        if (i > 0) {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Move up" class="tool-button success" onclick="moveOp(` + i + `, -1); fillTree();"><i class="fa fa-arrow-up" aria-hidden="true"></i></button>`
        } else {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Move up" class="tool-button success disabled" onclick="moveOp(` + i + `, -1); fillTree();"><i class="fa fa-arrow-up" aria-hidden="true"></i></button>`
        }

        if (i < toolpathsInScene.length - 1) {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Move down" class="tool-button success" onclick="moveOp(` + i + `, 1); fillTree();"><i class="fa fa-arrow-down" aria-hidden="true"></i></button>`
        } else {
          toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Move down" class="tool-button success disabled" onclick="moveOp(` + i + `, 1); fillTree();"><i class="fa fa-arrow-down" aria-hidden="true"></i></button>`
        }

        toolp += `<button data-tooltip="tooltip" data-placement="bottom" title="Delete toolpath" class="tool-button alert" onclick="storeUndo(); toolpathsInScene.splice('` + i + `', 1); fillTree();"><i class="fa fa-times" aria-hidden="true"></i></button>
            <button data-tooltip="tooltip" data-placement="bottom" title="Configure toolpath" class="tool-button primary" onclick="setupJob(` + i + `);"><i class="fas fa-sliders-h"></i></button>
            <button data-tooltip="tooltip" data-placement="bottom" title="Reselect toolpaths"   class="tool-button secondary" onclick="setSelectionFromToolPath(` + i + `)"><i class="fa fa-braille"></i></button>
            <span class="tally alert" style="display: none; margin-top: 6px;" id="toolpathSpinner`+i+`"><i class="fas fa-spinner fa-pulse"></i><small> calculating...</small></span>
                    </div>
                    </td>
                    </tr>

                  </table>
                </td>
                </tr>
                `
      }
      $('#toolpathstable').append(toolp);

      // append toolpath to menu
      var string = `Add to: ` + toolpathsInScene[i].name + `: ` + operation
      if (string.length > 32) {
        string = string.substring(0, 32) + "..."
      }
      var menuitem = `<li><a  href="#" onclick="addJob(` + i + `)">` + string + `</a></li>`;
      $('#toolpathsmenu').append(menuitem);


      // append removal toolpath to menu
      var string = `Rem from: ` + toolpathsInScene[i].name + `: ` + operation
      if (string.length > 32) { string = string.substring(0, 32) + "..." }
      var menuitem = `<li><a  href="#" onclick="remJob(` + i + `)">` + string + `</a></li>`;
      $('#remtoolpathsmenu').append(menuitem);

    }

  } else {
    var instructions = `<p class="text-secondary">Please select some entities by clicking them in the viewer.  Hold down Ctrl to select more than one in the viewer, or from the Documents tree above. Add them to a toolpath using the <kbd class="bg-openbuilds"> <i class="fa fa-plus" aria-hidden="true"></i> Add</kbd> button</p>`
    $('#toolpathtree').append(instructions)
  } // End of if (toolpathsInScene.length > 0)

  var tableend = `
    </table>
    `

  $('#toolpathstable').append(tableend)

  // Register event to Edit Toolpath Name inplace
  $('#toolpathstable .entity-job').on('input', function() {
    var $this = $(this);
    var data = $this.data();
    toolpathsInScene[data.id].name = $this.text();
  });
}
