function toolpathPreview(i) {
  $("#savetpgcode").addClass("disabled");
  $("#exportGcodeMenu").addClass("disabled");
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
  var tabDepth = toolpathsInScene[i].userData.camTabDepth
  var union = toolpathsInScene[i].userData.camUnion
  var StepOver = toolpathsInScene[i].userData.camStepover


  if (operation == "... Select Operation ...") {

  } else if (operation == "Laser: Vector (no path offset)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, 0, StepOver, 1, 1, 0, false, false, union);
  } else if (operation == "Laser: Vector (path inside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, -(SpotSize/2), 0, 1, 1, 0, false, false, union);
  } else if (operation == "Laser: Vector (path outside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, (SpotSize/2), 0, 1, 1, 0, false, false, union);
  } else if (operation == "CNC: Vector (path inside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, -(ToolDia/2), 0, ZStep, ZDepth, ZStart, false, tabDepth, union);
  } else if (operation == "CNC: Vector (path outside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, (ToolDia/2), 0, ZStep, ZDepth, ZStart, false, tabDepth, union);
  } else if (operation == "CNC: Pocket") {
    toolpathsInScene[i].userData.inflated = getToolpath("pocket", i, (ToolDia/2), StepOver, ZStep, ZDepth, ZStart, false, false);
  } else if (operation == "CNC: V-Engrave") {
    // no op yet
  } else if (operation == "Plasma: Vector (path outside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, (PlasmaKerf/2), 0, 1, 1, 0, (PlasmaKerf/2), false, union);
  } else if (operation == "Plasma: Vector (path inside)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, -(PlasmaKerf/2), 0, 1, 1, 0, (PlasmaKerf/2), false, union);
  } else if (operation == "Plasma: Mark") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, 0, 0, 1, 1, 0, false, false, union);
  } else if (operation == "Plasma: Vector (no path offset)") {
    toolpathsInScene[i].userData.inflated = getToolpath("inflate", i, 0, 0, 1, 1, 0, false, false, union);
  } else if (operation == "Drag Knife: Cutout") {
    toolpathsInScene[i].userData.inflated = getToolpath("dragknife", i, DragOffset, 0, 1, 1, 0, false, false, union);
  }
  fillTree()
  clearSceneFlag = true;
  
}

function getToolpath(operation, index, offset, StepOver, zstep, zdepth, zstart, leadinval, tabdepth, union) {
  if (operation == "inflate") {
    var toolpath = inflatePath(toolpathsInScene[index], offset, zstep, zdepth, zstart, leadinval, tabdepth, union);
  }
  if (operation == "pocket") {
    var toolpath = pocketPath(toolpathsInScene[index], offset, StepOver, zstep, zdepth, zstart );
  }
  if (operation == "dragknife") {
    var toolpath = dragknifePath(toolpathsInScene[index], offset, zstep, zdepth );
  }
  toolpath.userData.type = "toolpath";
  toolpath.translateX(-sizexmax/2)
  toolpath.translateY(-sizeymax/2)
  return toolpath
}
