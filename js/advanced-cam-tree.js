var collapsedGroups = {};

var moveOp = function(index, delta) {
  var array = toolpathsInScene;
  // var index = array.indexOf(element);
  var newIndex = index + delta;
  if (newIndex < 0  || newIndex == array.length) return; //Already at the top or bottom.
  var indexes = [index, newIndex].sort(); //Sort the indixes
  array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]); //Replace from lowest index, two elements, reverting the order
};

function updateTreeSelection() {
    console.log("called updateTreeSelection")
    $('.jobsetuptable .chkaddjob').each(function(n, input) {
        var $input = $(input);
        var $parent = $input.parent();

        if (! $parent.hasClass('item')) {
            var items = $parent.find('.item').length;
            var checkedItems = $parent.find('.item > input:checked').length;

            $input.prop('checked', items == checkedItems);
        }
    });
}

function fillTree() {
    $('#filetreeheader').empty();
    $('#filetree').empty();
    $('#toolpathtreeheader').empty();
    $('#toolpathtree').empty();

    clearSceneFlag = true;

    var header = `
    <table style="width: 100%">
    <tr class="jobsetupfile">
    <td>
    <label for="filetreetable">Objects</label>
    </td>
    <td>
    <a class="btn btn-xs btn-success disabled" onclick="addJob();" id="tpaddpath"><i class="fa fa-plus" aria-hidden="true"></i> Add selection to Job <span class="badge" id="selectCount"></span></a>
    </td>
    </tr>
    </table>
    `

    $('#filetreeheader').append(header);

    if (objectsInScene.length > 0) {

        $('#tpaddpath').removeClass('disabled');

        var table = `<table class="jobsetuptable" style="width: 100%" id="filetreetable">`
        $('#filetree').append(table);


        var currentObject, currentObjectData;

        for (i = 0; i < objectsInScene.length; i++) {

            currentObject = objectsInScene[i];
            currentObjectData = currentObject.userData;

            var xoffset = currentObjectData.offsetX.toFixed(1);
            var yoffset = currentObjectData.offsetY.toFixed(1);
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
                }
                else {
                    svgscale = currentObject.scale.x
                }
            }

            if (objectsInScene[i].type != "Mesh") {
                var file = `
                <tr class="jobsetupfile topborder">
                  <td>
                    <input type="checkbox" value="" onclick="$('.chkchildof`+i+`').prop('checked', $(this).prop('checked'));" id="selectall`+i+`" />
                  </td>
                  <td class="filename">
                    <i class="fa fa-fw fa-file-text-o" aria-hidden="true"></i>&nbsp;
                    <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`]);"><b>` + objectsInScene[i].name + `</b></a>
                  </td>
                  <td id="buttons`+i+`">
                    <a class="btn btn-xs btn-primary" onclick="$('#move`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-arrows" aria-hidden="true"></i></a>
                    <a class="btn btn-xs btn-danger remove" onclick="objectsInScene.splice('`+i+`', 1); fillTree();"><i class="fa fa-times" aria-hidden="true"></i></a>
                  </td>
                </tr>
                <tr class="jobsetupfile" id="move`+i+`" style="display: none;">
                  <td colspan="3">
                    <label >Position Offset</label>
                    <table>
                      <tr>
                        <td>
                          <div class="input-group">
                            <span class="input-group-addon input-group-addon-xs">X:</span>
                            <input type="number" class="form-control input-xs" xoffset="`+xoffset+`" value="`+ -(xoffset - xpos)+`"  id="xoffset`+i+`" objectseq="`+i+`" step="1"><br>
                            <span class="input-group-addon input-group-addon-xs">mm</span>
                          </div>
                        </td>
                        <td>
                          <div class="input-group">
                            <span class="input-group-addon input-group-addon-xs">Y:</span>
                            <input type="number" class="form-control input-xs" yoffset="`+yoffset+`" value="`+ -(yoffset - ypos)+`"  id="yoffset`+i+`" objectseq="`+i+`" step="1">
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
                var svgfile =`
                <tr class="jobsetupfile" id="scale`+i+`" style="display: none;">
                <td colspan="3">
                <label>SVG Resolution</label>
                <div class="input-group">
                <input type="number" class="form-control input-xs" value="`+(25.4/svgscale).toFixed(1)+`" id="svgresol`+i+`" objectseq="`+i+`">
                <span class="input-group-addon input-group-addon-xs">DPI</span>
                </div>
                </td>
                </tr>`
                $('#filetreetable').append(svgfile)

                var scalebtn = `<a class="btn btn-xs btn-primary" onclick="$('#scale`+i+`').toggle(); $(this).toggleClass('active');"><i class="fa fa-expand" aria-hidden="true"></i></a>`
                $('#buttons'+i).prepend(scalebtn)
            }

            $('#filetreetable').append(`
            <tr>
            <td colspan="3" class="jobsetupgroup">
            <ul id="jobsetupgroup`+i+`"></ul>
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
                childData.link = "link"+i+"_"+j;
                childLayer = childData.layer;

                $parentGroup = $childGroup;

                // Polyline Object
                childTemplate = `
                <li children`+i+`">
                  <div class="checkbox item">
                    <input type="checkbox" class="fr chkaddjob chkchildof`+i+`" id="child.`+i+`.`+j+`" />
                    <i class="fa fa-fw fa-sm fa-object-ungroup" aria-hidden="true"></i>
                    <a class="entity" href="#" onclick="attachBB(objectsInScene[`+i+`].children[`+j+`])" id="link`+i+`_`+j+`">`+currentChild.name+`</a>
                    <a class="fr remove btn btn-xs btn-danger"><i class="fa fa-times" aria-hidden="true"></i></a>
                  </div>
                </li>`;

                if (! childLayer) {
                    $childGroup.append(childTemplate);
                }
                else {
                    if (childLayer.parent) {
                        $parentGroup = $('#' + childLayer.parent.id);

                        if (! $parentGroup.length) {
                           // SVG Group
                            currentTable = `
                            <li class="group">
                              <div class="checkbox">
                                <input type="checkbox" class="fr chkaddjob chkchildof`+i+`" />
                                <i class="fa fa-fw fa-sm fa-object-group" aria-hidden="true"></i>&nbsp;
                                <a class="entity toggle" href="#" onclick="return false;">`+childLayer.parent.label+`</a>
                                <span class="counter label label-info">0</span>
                                <a class="fr remove btn btn-xs btn-danger"><i class="fa fa-times" aria-hidden="true"></i></a>
                                <ul id="`+childLayer.parent.id+`"></ul>
                              </div>
                            </li>
                            `;
                            $childGroup.append(currentTable);
                            $parentGroup = $('#' + childLayer.parent.id);
                        }
                    }
                    $currentTable = $('#' + childLayer.id);
                    if (! $currentTable.length) {
                        // Layer
                        currentTable = `
                        <li class="group">
                          <div class="checkbox">
                            <input type="checkbox" class="fr chkaddjob chkchildof`+i+`" />
                            <i class="fa fa-fw fa-sm fa-object-group" aria-hidden="true"></i>&nbsp;
                            <a class="entity toggle" href="#">`+childLayer.label+`</a>
                            <span class="counter label label-info">0</span>
                            <a class="fr remove btn btn-xs btn-danger"><i class="fa fa-times" aria-hidden="true"></i></a>
                            <ul id="`+childLayer.id+`"></ul>
                          </div>
                        </li>`;
                        $parentGroup.append(currentTable);
                        $currentTable = $('#' + childLayer.id);
                    }
                    $currentTable.append(childTemplate);
                }
                if (childData.selected) {
                    attachBB(currentChild);
                }
            }

        }

        updateTreeSelection();

        // $('.jobsetuptable').on('lw:attachBB', function(e, $target) {
        //     updateTreeSelection();
        // });

        $('.jobsetuptable .toggle').on('click', function() {
            var $label = $(this);
            var $group = $label.parent().children('ul');
            var groupId = $group.attr('id');

            $label.toggleClass('italic');
            $group.toggleClass('hidden');

            collapsedGroups[groupId] = $group.hasClass('hidden');
        });

        $('.jobsetuptable .group').each(function(n, group) {
            var $group = $(group);
            var $items = $group.find('div .item');
            var $counter = $group.find('.counter');
            var groupId = $group.children('ul').attr('id');
            $counter.html($items.length);

            if (collapsedGroups[groupId]) {
                $group.children('.toggle').trigger('click');
            }
        });

        $('.jobsetuptable .chkaddjob').on('change', function(e) {
            var $input = $(this);
            var $parent = $input.parent();
            var checked = $input.prop('checked');
            var idx, i, j;
            console.log("change", $parent, checked)

            if ($parent.hasClass('item')) {
                // if (checked == $input.prop('checked')) {
                //     $input.prop('checked', !checked);
                // }

                idx = $parent.children('input').attr('id').split('.');
                i = parseInt(idx[1]);
                j = parseInt(idx[2]);

                attachBB(objectsInScene[i].children[j]);
                updateTreeSelection();
                return false;
            }

            $input.parent().find('ul .chkaddjob').each(function(n, input) {
                $input = $(input);
                $parent = $input.parent();

                if ($parent.hasClass('item')) {
                    if (checked == $input.prop('checked')) {
                        $input.prop('checked', !checked);
                    }

                    idx = $parent.children('input').attr('id').split('.');
                    i = parseInt(idx[1]);
                    j = parseInt(idx[2]);

                    attachBB(objectsInScene[i].children[j]);
                }
                else {
                    $input.prop('checked', checked);
                }
            });
        });

        $('.jobsetupgroup .remove').on('click', function() {
          var $parent = $(this).parent();
          // console.log($parent)
          var idx, i, j;

          if ($parent.hasClass('item')) {
              // console.log('has item');
              idx = $parent.find('input').attr('id').split('.');
              i = parseInt(idx[1]);
              j = parseInt(idx[2]);
              objectsInScene[i].remove(objectsInScene[i].children[j]);
          }
          else {
              // console.log('no item');
              var children = [];
              $parent.find('.item input').each(function(n, input) {
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

        var tableend = `
        </table>
        `
        $('#filetree').append(tableend)
    } else {
        var instructions = `Please open a file from the <kbd>Open</kbd> button...`
        $('#filetree').append(instructions)

    }// End of if (objectsInScene.length > 0)

    var toolpatheader = `
    <table style="width: 100%">
    <tr class="jobsetupfile">
    <td>
    <label for="toolpathstable">Toolpaths</label>
    </td>
    <td>
    <a class="btn btn-xs btn-success disabled" id="generatetpgcode" onclick="makeGcode();"><i class="fa fa-cubes" aria-hidden="true"></i> Generate G-Code</a>
    <a class="btn btn-xs btn-primary disabled" id="savetpgcode" onclick="saveFile()"><i class="fa fa-save" aria-hidden="true"></i> Save</a>
    </td>
    </tr>
    </table>`
    $('#toolpathtreeheader').append(toolpatheader)

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
                  operation = "not configured"
                }

                var toolp = `<tr class="jobsetupfile">
                <td>
                <i class="fa fa-fw fa-object-group" aria-hidden="true"></i>&nbsp;
                <span class="entity-job" contenteditable="true" data-id="`+i+`">`+toolpathsInScene[i].name+`</span>
                <h6 style="margin: 0px 0px;"><small><b>`+ operation+`</b></small></h6>
                </td>
                <td>

                </td>
                <td>`

                if (i > 0) {
                  toolp += `<a class="btn btn-xs btn-success" onclick="moveOp(`+i+`, -1); fillTree();"><i class="fa fa-arrow-up" aria-hidden="true"></i></a>`
                } else {
                  toolp += `<a class="btn btn-xs btn-success disabled" onclick="moveOp(`+i+`, -1); fillTree();"><i class="fa fa-arrow-up" aria-hidden="true"></i></a>`
                }

                if (i < toolpathsInScene.length -1) {
                  toolp += `<a class="btn btn-xs btn-success" onclick="moveOp(`+i+`, 1); fillTree();"><i class="fa fa-arrow-down" aria-hidden="true"></i></a>`
                } else {
                  toolp += `<a class="btn btn-xs btn-success disabled" onclick="moveOp(`+i+`, 1); fillTree();"><i class="fa fa-arrow-down" aria-hidden="true"></i></a>`
                }

                toolp += `<a class="btn btn-xs btn-danger" onclick="toolpathsInScene.splice('`+i+`', 1); fillTree();"><i class="fa fa-times" aria-hidden="true"></i></a>
                <a class="btn btn-xs btn-primary" onclick="setupJob(`+i+`);"><i class="fa fa-fw fa-sliders" aria-hidden="true"></i></a>
                </td>
                </tr>
                `
            }
            $('#toolpathstable').append(toolp);
        }

        // contentEditable for Toolpath Name field - edit directly in toolpath table
        $('#toolpathstable .entity-job').on('input', function() {
            var $this = $(this);
            var data = $this.data();

            toolpathsInScene[data.id].name = $this.text();
        });

    } else {
        var instructions = `Please select some entities from the <b>Objects</b> above, or by clicking them in the viewer.  Hold down Ctrl to select more than one in the viewer. Add them to a toolpath using the <br><kbd><i class="fa fa-plus" aria-hidden="true"></i> Add selection to Job</kbd> button...`
        $('#toolpathtree').append(instructions)

    }  // End of if (toolpathsInScene.length > 0)
    var tableend = `
    </table>
    `
    $('#toolpathstable').append(tableend)
}
