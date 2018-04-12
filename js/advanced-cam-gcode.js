function makeGcode() {
  $('#gcodejobs').empty();
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
      <label for="gcode`+i+`" class="control-label">`+toolpathsInScene[j].name+`</label>
      <textarea id="gcode`+i+`" spellcheck="false" style="width: 100%; height: 80px;" placeholder="processing..." disabled></textarea>
    </form>`
    $('#gcodejobs').append(template);
    $('#gcode'+i).val(toolpathsInScene[j].userData.gcode);

  }

  var startgcode = document.getElementById('startgcode').value;
  $('#startgcodefinal').val(startgcode)
  var endgcode = document.getElementById('endgcode').value;
  $('#endgcodefinal').val(endgcode);

  openGCodeFromText()

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

    //todo: settings applet
    var g0 = $("#g0command").val();
    var g1 = $("#g1command").val();
    var sOnSeperateLine = $("#scommandnewline").is(":checked");; // Marlin, Stepcraft, Mach3, LinuxCNC
    var s = $("#scommand").val(); // or Stepcraft:  M10 Qxxx, or LinuxCNC/Mach3: M67 E(PWMSigNo) Qxxx \n G1 Move \n M68 E(PWMSigNo) Q0
    var sScale = $("#scommandscale").val()
    var useZ = true;
    var IHScommand = document.getElementById('ihsgcode').value;  // or "G0 " + clearanceHeight + "\nG32.2 Z-30 F100\nG10 P2 L1 Z0" // Plasma IHS

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

                    if (!isAtClearanceHeight) {
                      g += "\n" + g0 + " Z" + clearanceHeight + "\n";               // Position Before Plunge!
                    }
                    g += g0 + seekrate;
                    g += " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + "\n";  // Move to XY position
                    if (useZ) {                                                   // useZ: Then plunge, if not, its laser/plasma
                      g += "\n" + g0 + " Z1\n";                                    // G0 to Z0 then Plunge!
                      g += g1 + " F"+plungeSpeed+" Z" + zpos.toFixed(4) + "\n";   // Plunge!!!!
                    } else {
                      if (isFeedrateSpecifiedAlready) {
                      } else {
                          // console.log('Cut Speed: ', cutSpeed);
                          if (cutSpeed) {
                              feedrate = " F" + cutSpeed;
                              isFeedrateSpecifiedAlready = true;
                          } else {
                              feedrate = "";
                          }
                      }

                      g +=  g1 + feedrate + " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + " Z" + zpos.toFixed(4) + "\n";
                    };
                    isAtClearanceHeight = false;
                    // sense starting height for Plasma

                // Else Cut move
                } else {
                    // we are in a non-first line so this is normal moving
                    // if the laser is not on, we need to turn it on
                    if (!isToolOn) {
                        if (PlasmaIHS == "Yes") {
                          console.log("PlasmaIHS")
                          g+= IHScommand + "\n";
                        }
                        if (toolon) {
                            g += toolon
                            g += '\n'
                        } else {
                            // Nothing - most of the firmwares use G0 = move, G1 = cut and doesnt need a toolon/tooloff command
                        };
                        isToolOn = true;
                    }

                    // do normal feedrate move
                    var feedrate;
                    if (isFeedrateSpecifiedAlready) {
                    } else {
                        console.log('Cut Speed: ', cutSpeed);
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

                }
            }
            // make feedrate have to get specified again on next line if there is one
            isFeedrateSpecifiedAlready = false;
            isToolOn = false;
            // if (firmware.indexOf('Grbl') == 0) {
            if (tooloff) {
                g += tooloff
                g += '\n'
            } else {
                // Nothing - most of the firmware used G0 = move, G1 = cut and doesnt need a toolon/tooloff command
            }
        }
    });
    console.log("Generated gcode. length:", g.length);
    console.log(" ");
    isGcodeInRegeneratingState = false;
    return g;
};

function prepgcodefile() {

  console.group("Consolidating GCODE file");


  var startgcode = document.getElementById('startgcode').value;
  var endgcode = document.getElementById('endgcode').value;

  var g = ""
  if (startgcode)  {
    g += startgcode;
    g += "\n";
  }
  var externalgcode = document.getElementById('gcodepreview').value;
  if (externalgcode) {
    g += externalgcode;
  }

  for (j = 0; j < toolpathsInScene.length; j++) {
    printLog('Preparing Gcode File: ' + toolpathsInScene[j].name, msgcolor, "file");
    console.log('Preparing Gcode File: ' + toolpathsInScene[j].name);
    // document.getElementById('gcodepreview').value = "";
    if (typeof(toolpathsInScene[j].userData.gcode) != "undefined") {
      g += toolpathsInScene[j].userData.gcode;
    } else {
      console.log(toolpathsInScene[j].name + ' does not have valid gcode yet');
    }
  }
  g += "\n";
  if (endgcode) {
    g += endgcode;
  }
  console.groupEnd();
  // console.log(g)
  return g;
}
