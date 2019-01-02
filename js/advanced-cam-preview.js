var runningPreviews = 0;

function toolpathPreview(i) {
  $('#toolpathtree').hide();
  $('#toolpathactivity').show()
  trashGcode();
  // $('#gcodesavebtn1').prop('disabled', true);
  $('#gcodesavebtn2').addClass('disabled');
  $('#gcodetrashbtn2').addClass('disabled');
  $('#gcodeexporticon').removeClass('fg-grayBlue').addClass('fg-gray');
  $('#trashicon').removeClass('fg-red').addClass('fg-gray');


  $('#validGcode').html("<i class='fas fa-times fa-fw fg-red'></i> No GCODE yet")
  $("#savetpgcode").addClass("disabled");
  $("#exportGcodeMenu").addClass("disabled");
  $("#previewToolpathBtn").html("<i class='fa fa-spinner fa-spin '></i> Calculating, please wait");
  $("#previewToolpathBtn").prop('disabled', true);
  setTimeout(function() {
    runningPreviews++
    toolpathPreviewExec(i);
  }, 200);
}

function toolpathPreviewExec(i) {
  var operation = toolpathsInScene[i].userData.camOperation
  var ToolDia = toolpathsInScene[i].userData.camToolDia
  var ZClearance = toolpathsInScene[i].userData.camZClearance
  var ZStart = toolpathsInScene[i].userData.camZStart
  var DragOffset = toolpathsInScene[i].userData.camDragOffset
  var LaserPower = toolpathsInScene[i].userData.camLaserPower
  var DragOffset = toolpathsInScene[i].userData.camDragOffset
  var Feedrate = toolpathsInScene[i].userData.camFeedrate
  var LaserPower = toolpathsInScene[i].userData.camLaserPower
  var Operation = toolpathsInScene[i].userData.camOperation
  var PlasmaIHS = toolpathsInScene[i].userData.camPlasmaIHS
  var PlasmaKerf = toolpathsInScene[i].userData.camPlasmaKerf
  var PlasmaZHeight = toolpathsInScene[i].userData.camPlasmaZHeight
  var Plungerate = toolpathsInScene[i].userData.camPlungerate
  var ToolDia = toolpathsInScene[i].userData.camToolDia
  var VAngle = toolpathsInScene[i].userData.camVAngle
  var VHeight = toolpathsInScene[i].userData.camVHeight
  var ZClearance = toolpathsInScene[i].userData.camZClearance
  var ZDepth = toolpathsInScene[i].userData.camZDepth
  var ZStep = toolpathsInScene[i].userData.camZStep
  var SpotSize = toolpathsInScene[i].userData.camSpotSize
  var union = toolpathsInScene[i].userData.camUnion
  var StepOver = toolpathsInScene[i].userData.camStepover
  var tabdepth = -(parseFloat(toolpathsInScene[i].userData.camZDepth) - parseFloat(toolpathsInScene[i].userData.camTabDepth));
  var tabspace = parseFloat(toolpathsInScene[i].userData.camTabSpace);
  var tabwidth = parseFloat(toolpathsInScene[i].userData.camTabWidth);
  if (tabwidth < 1) { // set a sane minimum, tab can't be smaller than tooldia
    tabwidth = 1
  }

  if (operation == "... Select Operation ...") {
    // Do Nothing
    console.log("NO OPERATION")
    $('#toolpathtree').show();
    $('#toolpathactivity').hide()
    toolpathErrorToast(`Toolpath Error: You did not select a valid "Type of Cut"  for toolpath "` + toolpathsInScene[i].name + `" - Please  <i class="fas fa-sliders-h"></i> Edit the toolpath and configure it"`, 'bg-red');
  } else if (operation == "Laser: Vector (no path offset)") { //  operation,  index,  offset,           StepOver,   zstep,  zdepth,   zstart,   leadinval,      tabdepth,   tabspace,   tabwidth,   union
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, 0, StepOver, 1, 1, 0, false, false, false, false, union);
  } else if (operation == "Laser: Vector (path inside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, -(SpotSize / 2), 0, 1, 1, 0, false, false, false, false, union);
  } else if (operation == "Laser: Vector (path outside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, (SpotSize / 2), 0, 1, 1, 0, false, false, false, false, union);
  } else if (operation == "Laser: Vector (raster fill) (Beta)") {
    toolpathsInScene[i].userData.inflated = getToolpath("fill", i, (SpotSize / 2), 0, 1, 1, 0, false, false, false, false, union);
  } else if (operation == "CNC: Vector (no offset)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, 0, 0, ZStep, ZDepth, ZStart, false, tabdepth, tabspace, tabwidth, union);
  } else if (operation == "CNC: Vector (path inside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, -(ToolDia / 2), 0, ZStep, ZDepth, ZStart, false, tabdepth, tabspace, tabwidth, union);
  } else if (operation == "CNC: Vector (path outside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, (ToolDia / 2), 0, ZStep, ZDepth, ZStart, false, tabdepth, tabspace, tabwidth, union);
  } else if (operation == "CNC: Pocket") {
    toolpathsInScene[i].userData.inflated = getToolpath("pocket", i, (ToolDia / 2), StepOver, ZStep, ZDepth, ZStart, false, false, false, false, union);
  } else if (operation == "CNC: V-Engrave") {
    // no op yet
  } else if (operation == "Plasma: Vector (path outside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, (PlasmaKerf / 2), 0, 1, 1, 0, (PlasmaKerf / 2), false, false, false, union);
  } else if (operation == "Plasma: Vector (path inside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, -(PlasmaKerf / 2), 0, 1, 1, 0, (PlasmaKerf / 2), false, false, false, union);
  } else if (operation == "Plasma: Mark") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, 0, 0, 1, 1, 0, false, false, false, false, union);
  } else if (operation == "Plasma: Vector (no path offset)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, 0, 0, 1, 1, 0, false, false, false, false, union);
  } else if (operation == "Drag Knife: Cutout") {
    toolpathsInScene[i].userData.inflated = getToolpath("dragknife", i, DragOffset, 0, 1, 1, 0, false, false, false, false, union);
  } else if (operation == "Drill: Peck (Centered)") {
    toolpathsInScene[i].userData.inflated = getToolpath("peckdrill", i, (ToolDia / 2), 0, ZStep, ZDepth, 0, false, false, false, false, union);
  } else if (operation == "Drill: Continuous (Centered)") {
    toolpathsInScene[i].userData.inflated = getToolpath("drill", i, (ToolDia / 2), 0, 0, ZDepth, 0, false, false, false, false, union);
  }

  // Drill options
  // <option>Drill: Peck (Centered)</option>
  // <option</option>
  // $('#statusmodal').modal('hide');
  Metro.dialog.close('#statusmodal')
  fillTree()
  clearSceneFlag = true;
}

function getToolpath(operation, index, offset, StepOver, zstep, zdepth, zstart, leadinval, tabdepth, tabspace, tabwidth, union) {
  var depth = zdepth - zstart;
  if (zstep > depth) {
    console.log("Could not generate " + operation + " toolpath for " + toolpathsInScene[index].name + ":  You cannot have Cut Depth: Per Pass, larger than Cut Depth: Final")
    printLog("Could not generate toolpath for " + toolpathsInScene[index].name + ":  You cannot have Cut Depth: Per Pass, larger than Cut Depth: Final", errorcolor, "viewer")
  }
  var config = {
    toolpath: toolpathsInScene[index],
    offset: parseFloat(offset, 3),
    zstep: parseFloat(zstep, 2),
    zdepth: parseFloat(zdepth, 2),
    zstart: parseFloat(zstart, 2),
    leadinval: parseFloat(leadinval, 2),
    tabdepth: parseFloat(tabdepth, 2),
    tabspace: parseFloat(tabspace, 2),
    tabwidth: parseFloat(tabwidth, 2),
    union: union,
    stepover: parseFloat(StepOver, 2)
  }
  if (operation == "inflate") {
    var toolpath = inflatePath(config, toolpathsInScene[index], offset, zstep, zdepth, zstart, leadinval, tabdepth, union);
    // console.log(toolpath)
  }
  if (operation == "pocket") {
    var toolpath = pocketPath(config, toolpathsInScene[index], offset, StepOver, zstep, zdepth, zstart, union);
  }
  if (operation == "fill") {
    var toolpath = fillPath(config);
  }
  if (operation == "dragknife") {
    var toolpath = dragknifePath(config, toolpathsInScene[index], offset, zstep, zdepth);
  }

  if (operation == "peckdrill") {
    var toolpath = drill(config);
  }

  if (operation == "drill") {
    var toolpath = drill(config);
  }

  if (toolpath) {
    toolpath.userData.type = "toolpath";
    // lets check if we has success, if not, raise an error message
    var errorcount = 0;
    for (i = 0; i < toolpath.children.length; i++) {
      var checkpath = toolpath.children[i]
      if (checkpath.children.length < 1) {
        errorcount++
      }
    }
    if (errorcount > 0) {
      toolpathErrorToast('Toolpath Warning: Please check the Toolpath result, we encountered some processing errors with either your file, or the parameters you entered', 'bg-amber');
    }
    if (toolpath.children.length < 1) {
      toolpathErrorToast('Toolpath Warning: Please check the Toolpath result, we encountered some processing errors with either your file, or the parameters you entered', 'bg-amber');
    }
    runningPreviews--

    if (runningPreviews == 0) {
      $('#toolpathactivity').hide()
      $('#toolpathtree').fadeIn();
    }
    return toolpath
  }
  if (runningPreviews == 0) {
    $('#toolpathactivity').hide()
    $('#toolpathtree').fadeIn();
  }
}

function toolpathErrorToast(data, background) {
  if (data) {
    var message = data;
  } else {
    var message = `Toolpath Warning: ` + data + ` We encountered some errors while processing the toolpath: Some elements may have been skipped. Either the file you are using has some issues, or the Toolpath settings you provided is wrong / won't work with the particular file / operation.`
  }
  Metro.toast.create(message, null, 10000, background);
}