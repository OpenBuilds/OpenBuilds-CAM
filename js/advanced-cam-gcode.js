function trashGcode() {
  simstop()
  if (scene.getObjectByName('gcodeobject')) {
    // console.log("Existing GCODE object: Cleaning up first")
    scene.remove(scene.getObjectByName('gcodeobject'))
    object = false;
  }
  disableSim()
}


function makeGcode() {
  $('#gcodejobs').empty();

  $("#generatetpgcode").html("<i class='fa fa-spinner fa-spin '></i> Generating, please wait");
  $("#generatetpgcode").prop('disabled', true);

  setTimeout(function() {
    for (j = 0; j < toolpathsInScene.length; j++) {
      // todo: Settings params
      var rapidSpeed = 1000;
      var toolon = "";
      var tooloff = "";
      // toolpath settings is applied to the parent Toolpath.  Each child in the "toolpath" is processed with the same settings
      var Feedrate = toolpathsInScene[j].userData.camFeedrate
      var Plungerate = toolpathsInScene[j].userData.camPlungerate
      var LaserPower = toolpathsInScene[j].userData.camLaserPower
      var ZClearance = toolpathsInScene[j].userData.camZClearance
      var PlasmaIHS = toolpathsInScene[j].userData.camPlasmaIHS


      toolpathsInScene[j].userData.gcode = generateGcode(j, toolpathsInScene[j].userData.inflated, Feedrate, Plungerate, LaserPower, rapidSpeed, toolon, tooloff, ZClearance, false, PlasmaIHS);
      $("#savetpgcode").removeClass("disabled");
      $("#exportGcodeMenu").removeClass("disabled");

      var template = `
			<form class="form-horizontal">
				<label for="gcode` + i + `" class="control-label">` + toolpathsInScene[j].name + `</label>
				<textarea id="gcode` + i + `" spellcheck="false" style="width: 100%; height: 80px;" placeholder="processing..." disabled></textarea>
			</form>`
      $('#gcodejobs').append(template);
      $('#gcode' + i).val(toolpathsInScene[j].userData.gcode);

    }

    var startgcode = document.getElementById('startgcode').value;
    $('#startgcodefinal').val(startgcode)
    var endgcode = document.getElementById('endgcode').value;
    $('#endgcodefinal').val(endgcode);

    openGCodeFromText()

    $("#generatetpgcode").html("<i class='fa fa-cubes' aria-hidden='true'></i> Generate G-Code");
    $("#generatetpgcode").prop('disabled', false);
    enableSim();
  }, 200);



}

function generateGcode(index, toolpathGrp, cutSpeed, plungeSpeed, laserPwr, rapidSpeed, toolon, tooloff, clearanceHeight, zoffset, PlasmaIHS) {

  // empty string to store gcode
  var g = "";
  g += "; Operation " + index + ": " + toolpathsInScene[index].userData.camOperation;


  // Optimise gcode, send commands only when changed
  var isToolOn = false;
  var isAtClearanceHeight = false;
  var isFeedrateSpecifiedAlready = false;
  var isSeekrateSpecifiedAlready = false;
  var lastxyz = false;

  //todo: settings applet
  var g0 = $("#g0command").val();
  var g1 = $("#g1command").val();
  var sOnSeperateLine = $("#scommandnewline").is(":checked");; // Marlin, Stepcraft, Mach3, LinuxCNC
  var s = $("#scommand").val(); // or Stepcraft:  M10 Qxxx, or LinuxCNC/Mach3: M67 E(PWMSigNo) Qxxx \n G1 Move \n M68 E(PWMSigNo) Q0
  var sScale = $("#scommandscale").val()
  var IHScommand = document.getElementById('ihsgcode').value; // or "G0 " + clearanceHeight + "\nG32.2 Z-30 F100\nG10 P2 L1 Z0" // Plasma IHS

  if (!toolpathGrp) {
    bootoast.toast({
      message: `<h6><i class="fa fa-times-circle" aria-hidden="true"></i> Toolpath Error:</h6><br>
      <i>An error occured: </i>
      One or more of your toolpaths is not configured.  You need to configure the toolpaths, before generating GCODE
      `,
      type: 'danger',
      position: 'top-center',
      // icon: 'fa-times-circle',
      timeout: 10,
      animationDuration: 300,
      dismissible: true
    });
    $("#generatetpgcode").html("<i class='fa fa-cubes' aria-hidden='true'></i> Generate G-Code");
    $("#generatetpgcode").prop('disabled', false);
  } else {
    toolpathGrp.traverse(function(child) {
      // console.log(child);
      if (child.type == "Line") {
        var xpos_offset = child.position.x;
        var ypos_offset = child.position.y;
        // let's create gcode for all points in line
        for (i = 0; i < child.geometry.vertices.length; i++) {
          // Convert to World Coordinates
          var localPt = child.geometry.vertices[i];
          var worldPt = toolpathGrp.localToWorld(localPt.clone());
          var xpos = worldPt.x
          var ypos = worldPt.y
          if (child.geometry.type == "CircleGeometry") {
            xpos = (xpos + xpos_offset);
            ypos = (ypos + ypos_offset);
          }
          var zpos = worldPt.z;
          if (zoffset) {
            zpos = zpos - zoffset;
          }

          // First Move To
          if (i == 0) {
            // first point in line where we start lasering/milling

            // calc g0 rate
            var seekrate;
            if (isSeekrateSpecifiedAlready) {
              seekrate = "";
            } else {
              // console.log('Rapid Speed: ', rapidSpeed);
              if (rapidSpeed) {
                seekrate = " F" + rapidSpeed;
                isSeekrateSpecifiedAlready = true;
              } else {
                seekrate = "";
              }
            }

            if (lastxyz.x == xpos.toFixed(4) && lastxyz.x == xpos.toFixed(4)) {
              // console.log("No need to plunge, can stay at z " + lastxyz.z)
            } else {
              // move to clearance height, at first points XY pos
              if (!isAtClearanceHeight) {
                g += "\n" + g0 + " Z" + clearanceHeight + "\n"; // Position Before Plunge!
              }
              g += g0 + seekrate;
              g += " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + "\n"; // Move to XY position

              // then plunge
              g += "\n" + g0 + " Z1\n"; // G0 to Z0 then Plunge!
            }


            g += g1 + " F" + plungeSpeed + " Z" + zpos.toFixed(4) + "\n"; // Plunge!!!!

            isAtClearanceHeight = false;

          } else {
            // we are in a non-first line so this is normal moving
            // if the tool is not on, we need to turn it on
            if (!isToolOn) {
              if (PlasmaIHS == "Yes") {
                console.log("PlasmaIHS")
                g += IHScommand + "\n";
              }
              if (toolon) {
                g += toolon
                g += '\n'
              } else {
                // Nothing - most of the firmwares use G0 = move, G1 = cut and doesnt need a toolon/tooloff command
              };
              isToolOn = true;
            }

            // do g1 @ feedrate move
            var feedrate;
            if (isFeedrateSpecifiedAlready) {} else {
              // console.log('Cut Speed: ', cutSpeed);
              if (cutSpeed) {
                feedrate = " F" + cutSpeed;
                isFeedrateSpecifiedAlready = true;
              } else {
                feedrate = "";
              }
            }

            if (sOnSeperateLine) {
              g += s + laserPwr + "\n";
              g += g1 + feedrate;
              g += " X" + xpos.toFixed(4);
              g += " Y" + ypos.toFixed(4);
              g += " Z" + zpos.toFixed(4) + "\n";
            } else {
              g += g1 + feedrate;
              g += " X" + xpos.toFixed(4);
              g += " Y" + ypos.toFixed(4);
              g += " Z" + zpos.toFixed(4);
              g += " " + s + laserPwr + "\n";
            }
            // end move
          }
          lastxyz = {
            x: xpos.toFixed(4),
            y: ypos.toFixed(4),
            z: zpos.toFixed(4)
          }
        } //end child

        // make feedrate not have to be specified again on next line if there is one already
        isFeedrateSpecifiedAlready = false;
        isToolOn = false;

        // tool off
        if (tooloff) {
          g += tooloff
          g += '\n'
        }

      } // end inflatepate/pocket/entity
    });
  }


  console.log("Generated gcode. length:", g.length);
  return g;
};

function prepgcodefile() {

  // console.group("Consolidating GCODE file");
  var startgcode = document.getElementById('startgcode').value;
  var endgcode = document.getElementById('endgcode').value;

  // Start GCODE
  var g = ""
  if (startgcode) {
    g += startgcode;
    g += "\n";
  }

  // Toolpaths
  for (j = 0; j < toolpathsInScene.length; j++) {
    // printLog('Preparing Gcode File: ' + toolpathsInScene[j].name, msgcolor, "file");
    // console.log('Preparing Gcode File: ' + toolpathsInScene[j].name);
    // document.getElementById('gcodepreview').value = "";
    if (typeof(toolpathsInScene[j].userData.gcode) != "undefined") {
      g += toolpathsInScene[j].userData.gcode;
    } else {
      console.log(toolpathsInScene[j].name + ' does not have valid gcode yet');
    }
  }
  g += "\n";

  // End GCODE
  if (endgcode) {
    g += endgcode;
  }
  // console.groupEnd();
  return g;
}