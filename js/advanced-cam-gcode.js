function trashGcode() {
  simstop()
  if (scene.getObjectByName('gcodeobject')) {
    // console.log("Existing GCODE object: Cleaning up first")
    scene.remove(scene.getObjectByName('gcodeobject'))
    object = false;
  }
  disableSim()
  $('#sendGcodeToMyMachine').prop('disabled', true);;
  $('#gcodesavebtn2').addClass('disabled');
  $('#gcodesavebtn2').removeClass('primary');
  $('#gcodetrashbtn2').addClass('disabled');
  $('#gcodepreviewicon').removeClass('fg-grayBlue').addClass('fg-gray');
  $('#trashicon').removeClass('fg-red').addClass('fg-gray');
}

function makeGcode() {
  if (toolpathWorkersBusy()) {
    // console.log('not yet... rescheduling')
    setTimeout(function() {
      makeGcode()
    }, 500);
  } else {
    makeGcodeExec()
  }
}


function makeGcodeExec() {

  if (toolpathsInScene.length > 0) {

    $('#gcodejobs').empty();

    // Button on Ribbon Menu
    $("#generatetpgcode").html("<i class='fa fa-spinner fa-spin '></i> Generating, please wait");
    $("#generatetpgcode").prop('disabled', true);
    $("#generatetpgcode").removeClass('success');

    $('#gcodesavebtn2').addClass('disabled');
    $('#gcodesavebtn2').removeClass('primary');

    // Button on Window bar above Toolpaths


    setTimeout(function() {
      for (j = 0; j < toolpathsInScene.length; j++) {
        // console.log(toolpathsInScene[j].userData.visible)
        if (toolpathsInScene[j].userData.visible) {

          if (toolpathsInScene[j].userData.camOperation == undefined) {
            console.log(`Toolpath Error: Toolpath-` + j + ` has not been configured! Please configure the toolpath before creating GCODE`)
          } else {
            // todo: Settings params
            var rapidSpeed = 1000;
            var toolon = "";
            var tooloff = "";
            // toolpath settings is applied to the parent Toolpath.  Each child in the "toolpath" is processed with the same settings
            if (toolpathsInScene[j].userData.camOperation.indexOf('Drill') == 0) {
              // for Drilling, feed at Plunge Rate for the entire drill feed
              var Feedrate = toolpathsInScene[j].userData.camPlungerate;
            } else {
              var Feedrate = toolpathsInScene[j].userData.camFeedrate;
            }
            var Plungerate = toolpathsInScene[j].userData.camPlungerate;
            var LaserPower = toolpathsInScene[j].userData.camLaserPower;
            var SpindleRPM = toolpathsInScene[j].userData.camSpindleRpm;
            var ZClearance = toolpathsInScene[j].userData.camZClearance;
            var PlasmaIHS = toolpathsInScene[j].userData.camPlasmaIHS;
            var rampplunge = toolpathsInScene[j].userData.tRampPlunge == "Yes" ? true : false;
            var Passes = toolpathsInScene[j].userData.camPasses;

            if (toolpathsInScene[j].userData.camOperation.indexOf('Pen') == 0) {
              toolon = "M3S" + toolpathsInScene[j].userData.camPenDown + "\nG4 P0.5";
              tooloff = "M3S" + toolpathsInScene[j].userData.camPenUp + "\nG4 P0.5";
              ZClearance = 0;
            }

            if (toolpathsInScene[j].userData.camOperation.indexOf('Plasma') == 0) {
              toolon = "M3S" + $("#scommandscale").val();
              tooloff = "M5";
            }

            if (parseInt(Passes) && toolpathsInScene[j].userData.camOperation.indexOf('Laser') == 0) {
              var g = ""
              var gcode = generateGcode(j, toolpathsInScene[j].userData.inflated, Feedrate, Plungerate, SpindleRPM, LaserPower, rapidSpeed, toolon, tooloff, ZClearance, false, PlasmaIHS, rampplunge);
              for (k = 0; k < Passes; k++) {
                g += '; Pass ' + k + "\n"
                g += gcode
              }
              toolpathsInScene[j].userData.gcode = g;
            } else {
              toolpathsInScene[j].userData.gcode = generateGcode(j, toolpathsInScene[j].userData.inflated, Feedrate, Plungerate, SpindleRPM, LaserPower, rapidSpeed, toolon, tooloff, ZClearance, false, PlasmaIHS, rampplunge);
            }



            $("#savetpgcode").removeClass("disabled");
            $("#exportGcodeMenu").removeClass("disabled");

            //   var template = `
            // <form class="form-horizontal">
            // 	<label for="gcode` + i + `" class="control-label">` + toolpathsInScene[j].name + `</label>
            // 	<textarea id="gcode` + i + `" spellcheck="false" style="width: 100%; height: 80px;" placeholder="processing..." disabled></textarea>
            // </form>`
            //   $('#gcodejobs').append(template);
            $('#gcode' + i).val(toolpathsInScene[j].userData.gcode);
          }
        }


      }

      var startgcode = document.getElementById('startgcode').value;
      $('#startgcodefinal').val(startgcode)
      var endgcode = document.getElementById('endgcode').value;
      $('#endgcodefinal').val(endgcode);

      // openGCodeFromText()
      parseGcodeInWebWorker()

    }, 100);

  } else {
    var message = `Toolpath Error: No Toolpaths added yet.  You need to select some entities, add them to a new toolpath, and configure the toolpath, before generating GCODE`
    Metro.toast.create(message, null, 4000, 'bg-red');
  }
}

function generateGcode(index, toolpathGrp, cutSpeed, plungeSpeed, spindleRpm, laserPwr, rapidSpeed, toolon, tooloff, clearanceHeight, zoffset, PlasmaIHS, rampplunge) {

  // Calculate Correct S Value
  //laserPwr // 0-100%

  var laserPwr = laserPwr / 100 * parseInt($('#scommandscale').val());



  // empty string to store gcode
  var g = "";
  g += "; Operation " + index + ": " + toolpathsInScene[index].userData.camOperation + "\n";
  if (toolpathsInScene[j].userData.camOperation.indexOf('CNC') == 0 || toolpathsInScene[j].userData.camOperation.indexOf('Drill') == 0) {
    g += "; Endmill Diameter: " + toolpathsInScene[index].userData.camToolDia + "\n";
  } else if (toolpathsInScene[j].userData.camOperation.indexOf('Plasma') == 0) {
    g += "; Plasma Kerf: " + toolpathsInScene[index].userData.camPlasmaKerf + "\n";
  } else if (toolpathsInScene[j].userData.camOperation.indexOf('Laser') == 0) {
    g += "; Laser Spot Diameter: " + toolpathsInScene[index].userData.camSpotSize + "\n";
  } else if (toolpathsInScene[j].userData.camOperation.indexOf('Drag') == 0) {
    g += "; Drag Knife Swivel Offset: " + toolpathsInScene[index].userData.camDragOffset + "\n";
  } else if (toolpathsInScene[j].userData.camOperation.indexOf('Pen') == 0) {
    g += "; Pen Diameter: " + toolpathsInScene[index].userData.camToolDia + "\n";
  }


  // Optimise gcode, send commands only when changed
  var isToolOn = false;
  var isAtClearanceHeight = false;
  var isFeedrateSpecifiedAlready = false;
  var isSeekrateSpecifiedAlready = false;
  var lastxyz = false;

  //todo: settings applet
  var g0 = $("#g0command").val();
  var g1 = $("#g1command").val();
  var sOnSeperateLine = $("#scommandnewline").is(":checked"); // Marlin, Stepcraft, Mach3, LinuxCNC
  var s = $("#scommand").val(); // or Stepcraft:  M10 Qxxx, or LinuxCNC/Mach3: M67 E(PWMSigNo) Qxxx \n G1 Move \n M68 E(PWMSigNo) Q0
  var sScale = $("#scommandscale").val()
  var IHScommand = document.getElementById('ihsgcode').value; // or "G0 " + clearanceHeight + "\nG38.2 Z-30 F100\nG10 P2 L1 Z0" // Plasma IHS

  if (!toolpathGrp) {
    var message = `Toolpath Error: One or more of your toolpaths is not configured.  You need to configure the toolpaths (toolpath-` + index + `), before generating GCODE`
    Metro.toast.create(message, null, 4000, 'bg-red');
    $("#generatetpgcode").html("<i class='fa fa-cubes' aria-hidden='true'></i> Generate G-Code");
    $("#generatetpgcode").prop('disabled', false);
    $("#generatetpgcode").addClass('success');
    $('#gcodesavebtn2').removeClass('disabled');
    $('#gcodesavebtn2').addClass('primary');
  } else {
    console.log(toolpathGrp)
    if (localStorage.getItem("hasSpindle") == 'true') {
      if (toolpathsInScene[index].userData.camOperation.indexOf('CNC') == 0 || toolpathsInScene[index].userData.camOperation.indexOf('Drill') == 0) {
        g += `M3 S` + spindleRpm + `; Start Spindle\n`
        g += `G4 P8; Wait 8 seconds for spindle to spin up to speed\n`
      }
    }


    toolpathGrp.traverse(function(child) {
      var toolDia = toolpathGrp.userData.toolDia;
      if (toolDia < 0) {
        toolDia = toolDia * -1
      }
      // console.log(toolpathGrp);
      if (child.type == "Line") {
        //console.log(child)
        var xpos_offset = child.position.x;
        var ypos_offset = child.position.y;
        // let's create gcode for all points in line

        // Find longest segment
        // console.log("Vertices before optimise: ", child.geometry.vertices)

        if (child.geometry.vertices.length > 2 && child.geometry.vertices[0].X === child.geometry.vertices[child.geometry.vertices.length - 1].X && child.geometry.vertices[0].Y === child.geometry.vertices[child.geometry.vertices.length - 1].Y) {
          //console.log("Setting Closed: ", child)
          child.userData.closed = true;
        } else {
          //console.log("Setting NonClosed: ", child)
          child.userData.closed = false;
        }

        // console.log(child.userData)

        if (child.geometry.vertices.length > 2) {
          if (!child.userData.closed && toolpathsInScene[j].userData.camOperation.indexOf('Plasma') != 0) {
            var bestSegment = indexOfMax(child.geometry.vertices)
            var bestSegment = child.geometry.vertices.slice(0)
            // console.log('longest section' + bestSegment)
            var clone = child.geometry.vertices.slice(0);
            clone.splice(-1, 1) // remove the last point (as its the "go back to first point"-point which will just be a duplicate point after rotation)
            var optimisedVertices = clone.rotateRight(bestSegment)
            optimisedVertices.push(optimisedVertices[0]) // add back the "go back to first point"-point - from the new first point
            console.log("Vertices after optimise: ", optimisedVertices)
          } else {
            var optimisedVertices = child.geometry.vertices.slice(0)
          }

        } else {
          var optimisedVertices = child.geometry.vertices.slice(0)
        }

        for (i = 0; i < optimisedVertices.length; i++) {


          // Convert to World Coordinates

          if (i == 0) {
            //g += "; Starting " + child.name + ": Closed?:" + child.userData.closed + "\n";
            var localPt2 = optimisedVertices[i + 1]; // The next point - used for ramp plunges
            var worldPt2 = toolpathGrp.localToWorld(localPt2.clone()); // The next point - used for ramp plunges
            var xpos2 = worldPt2.x // The next point - used for ramp plunges
            var ypos2 = worldPt2.y // The next point - used for ramp plunges
            if (child.geometry.type == "CircleGeometry") {
              xpos2 = (xpos2 + xpos_offset);
              ypos2 = (ypos2 + ypos_offset);
            }
            var zpos2 = worldPt2.z;
            if (zoffset) {
              zpos2 = zpos2 - zoffset;
            }
          }
          var localPt = optimisedVertices[i];
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


          // console.log(i, xpos, ypos, zpos)
          // First Move To
          if (i == 0) {
            // console.log("First Point", xpos, ypos, zpos, optimisedVertices[i]);
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

            if (lastxyz.x == xpos.toFixed(4) && lastxyz.y == ypos.toFixed(4)) {
              // console.log("No need to plunge, can stay at z " + lastxyz.z)
            } else {
              // move to clearance height, at first points XY pos
              if (!isAtClearanceHeight) {
                g += "\n" + g0 + " Z" + clearanceHeight + "; move to z-safe height\n"; // Position Before Plunge!
              }
              g += g0 + seekrate;
              g += " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + "\n"; // Move to XY position

              if (toolpathsInScene[j].userData.camOperation.indexOf('Plasma') == 0) {
                // then plunge at G0 to Z0 (No need to go slow, air)
                //g += "\n" + g0 + " Z0\n"; // G0 to Z0 then Plunge!

                // if the tool is not on, we need to turn it on
                if (!isToolOn) {
                  if (PlasmaIHS == "Yes") {
                    // console.log("PlasmaIHS")
                    g += IHScommand + "\n";
                  }

                  g += "\n" + g0 + " Z" + toolpathsInScene[j].userData.camPlasmaPierceHeight + "; Move to Pierce Height\n"; // Move to Pierce Height

                  if (toolon) {
                    g += toolon
                    g += '; Tool On\n'
                  } else {
                    // Nothing - most of the firmwares use G0 = move, G1 = cut and doesnt need a toolon/tooloff command
                  };
                  isToolOn = true;

                  if (toolpathsInScene[j].userData.camPlasmaPierceDelay != 0) {
                    g += "G4 P" + toolpathsInScene[j].userData.camPlasmaPierceDelay + "; Pierce Delay\n"
                  }

                }


              } else if (toolpathsInScene[j].userData.camOperation.indexOf('Pen') == 0) {
                if (!isToolOn) {
                  if (toolon) {
                    g += toolon
                    g += '; Tool On\n'
                  } else {
                    // Nothing - most of the firmwares use G0 = move, G1 = cut and doesnt need a toolon/tooloff command
                  };
                  isToolOn = true;
                }
              } else {
                // then plunge at G0 to Z0 (No need to go slow, air)
                g += "\n" + g0 + " Z0\n"; // G0 to Z0 then Plunge!
              }
            }



            // then G1 plunge into material

            if (!rampplunge) {
              // console.log("Direct Plunge")
              g += g1 + " F" + plungeSpeed + " Z" + zpos.toFixed(4) + "; Direct Plunge\n "; // Plunge!!!!
            } else {
              // console.log("Ramp Plunge")
              // console.log(xpos, xpos2, ypos, ypos2)
              var d = distanceFormula(xpos, xpos2, ypos, ypos2)
              if (d > (toolDia * 5)) {
                // console.log("Ramp Plunge: Long enough")
                // We can do ramp in our own little space - easiest
                var deltaX = xpos2 - xpos;
                var deltaY = ypos2 - ypos;
                // get the line angle
                var ang = Math.atan2(deltaY, deltaX);
                // convert it to degrees for later math with addDegree
                ang = ang * 180 / Math.PI;

                var npt = [xpos, ypos]
                npt = newPointFromDistanceAndAngle(npt, ang, (toolDia * 5));
                if (lastxyz.z) {
                  var zdelta = zpos - lastxyz.z;
                } else {
                  var zdelta = zpos - 0;
                }
                // console.log(zdelta)
                if (lastxyz.z) {
                  g += "\n" + g0 + " Z" + lastxyz.z + "; Position for Plunge\n "; // G0 to Z0 then Plunge!
                } else {
                  g += "\n" + g0 + " Z" + 0 + "; Position for Plunge\n"; // G0 to Z0 then Plunge!
                }
                g += g1 + " F" + plungeSpeed;
                g += " X" + npt[0].toFixed(4) + " Y" + npt[1].toFixed(4) + " Z" + (zpos - (zdelta / 2)).toFixed(4) + "\n"; // Move to XY position
                g += g1 + " F" + plungeSpeed;
                g += " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + " Z" + zpos.toFixed(4) + "\n"; // Move to XY position
              } else {
                console.error("Ramp Plunge: Too short:" + d)
                // Too short, either include next segment or something else
              }
              // g += g1 + " F" + feedrate
              // g += " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + "\n"; // Move to XY position
              // g += g1 + " F" + plungeSpeed + " Z" + zpos.toFixed(4) + "\n"; // Plunge!!!!
            }

            isAtClearanceHeight = false;

          } else {
            // console.log("Subsequent Point", xpos, ypos, zpos, optimisedVertices[i]);
            // we are in a non-first line so this is normal moving

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

            if (toolpathsInScene[j].userData.camOperation.indexOf('Pen') == 0) {
              g += g1 + feedrate;
              g += " X" + xpos.toFixed(4);
              g += " Y" + ypos.toFixed(4);
              g += " Z" + zpos.toFixed(4) + "\n";
            } else if (sOnSeperateLine) {
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

              if (localStorage.getItem("hasSpindle") == 'true') {
                if (toolpathsInScene[index].userData.camOperation.indexOf('CNC') == 0 || toolpathsInScene[index].userData.camOperation.indexOf('Drill') == 0) {
                  g += " " + s + spindleRpm + "\n";
                }
              } else {
                g += " " + s + laserPwr + "\n";
              }


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
          g += '; Tool Off\n'
        }
      } // end inflatepate/pocket/entity
      // move to clearance height, at first points XY pos
    });
  }
  if (!isAtClearanceHeight) {
    g += "; retracting back to z-safe";
    g += "\n" + g0 + " Z" + clearanceHeight + "\n"; // Position Before Plunge!
  }
  // console.log("Generated gcode. length:", g.length);
  return g;
};

function prepgcodefile() {
  var startgcode = document.getElementById('startgcode').value;
  var endgcode = document.getElementById('endgcode').value;
  var g = "; GCODE Generated by cam.openbuilds.com on " + date.yyyymmdd() + " \nG21 ; mm-mode\n"
  if (startgcode) {
    g += startgcode;
    g += "\n";
  }
  for (j = 0; j < toolpathsInScene.length; j++) {
    if (toolpathsInScene[j].userData.visible) {
      if (typeof(toolpathsInScene[j].userData.gcode) != "undefined") {
        g += toolpathsInScene[j].userData.gcode;
      } else {
        console.log(toolpathsInScene[j].name + ' does not have valid gcode yet');
      }
    }
  }
  g += "\n";
  if (endgcode) {
    g += endgcode;
  }

  return g;
}