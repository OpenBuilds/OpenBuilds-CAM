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
      // console.log(toolpathsInScene[j].userData.visible)
      if (toolpathsInScene[j].userData.visible) {

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
  var lastxyz = {
    x: 0,
    y: 0,
    z: 0
  }

  //todo: settings applet
  var g0 = $("#g0command").val();
  var g1 = $("#g1command").val();
  var sOnSeperateLine = $("#scommandnewline").is(":checked");; // Marlin, Stepcraft, Mach3, LinuxCNC
  var s = $("#scommand").val(); // or Stepcraft:  M10 Qxxx, or LinuxCNC/Mach3: M67 E(PWMSigNo) Qxxx \n G1 Move \n M68 E(PWMSigNo) Q0
  var sScale = $("#scommandscale").val()
  var IHScommand = document.getElementById('ihsgcode').value; // or "G0 " + clearanceHeight + "\nG32.2 Z-30 F100\nG10 P2 L1 Z0" // Plasma IHS
  var toolDia = 6
  var doTabs = false;
  if (toolpathsInScene[index].userData.camTabDepth > 0) {
    var doTabs = true;
  }
  var tabsBelowZ = -(parseFloat(toolpathsInScene[index].userData.camZDepth) - parseFloat(toolpathsInScene[index].userData.camTabDepth));
  // if (tabsBelowZ > )
  var distBetweenTabs = parseFloat(toolpathsInScene[index].userData.camTabSpace);
  var tabWidth = parseFloat(toolpathsInScene[index].userData.camTabWidth);

  // var doTabs = true;
  // var tabsBelowZ = -5
  // var distBetweenTabs = 10
  // var tabWidth = 6
  var totalDist = 0;

  console.log(tabWidth)

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
      if (child.type == "Line") {
        // console.log(child);
        var xpos_offset = child.position.x;
        var ypos_offset = child.position.y;
        var totalDist = 0;
        var lastTabPos = -distBetweenTabs;
        // let's create gcode for all points in line
        for (i = 0; i < child.geometry.vertices.length; i++) {
          // Convert to World Coordinates
          var localPt = child.geometry.vertices[i];
          var worldPt = toolpathGrp.localToWorld(localPt.clone());
          var xpos = worldPt.x
          var ypos = worldPt.y
          if (i < child.geometry.vertices.length - 1) {
            var localPtNext = child.geometry.vertices[i + 1];
            var worldPtNext = toolpathGrp.localToWorld(localPtNext.clone());
            var xposNext = worldPtNext.x
            var yposNext = worldPtNext.y
          }


          if (child.geometry.type == "CircleGeometry") {
            xpos = (xpos + xpos_offset);
            ypos = (ypos + ypos_offset);
          } // end if circle
          var zpos = worldPt.z;
          if (zoffset) {
            zpos = zpos - zoffset;
          }

          // console.log(i, zpos)
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

            // This function needs fixing!  Works great for outside cuts, but inside cuts doesnt always go back to z safe
            // if (lastxyz.x == xpos.toFixed(4) && lastxyz.x == xpos.toFixed(4)) {
            //   console.log("No need to plunge, can stay at z " + lastxyz.z)
            // } else {
            // move to clearance height, at first points XY pos
            // console.log("Moving to Z Clear")
            if (!isAtClearanceHeight) {
              g += "\n" + g0 + " Z" + clearanceHeight + "\n"; // Position Before Plunge!
            }
            g += g0 + seekrate;
            g += " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + "\n"; // Move to XY position

            // then plunge
            g += "\n" + g0 + " Z1\n"; // G0 to Z0 then Plunge!
            // }


            g += g1 + " F" + plungeSpeed + " Z" + zpos.toFixed(4) + "\n"; // Plunge!!!!

            isAtClearanceHeight = false;

          }
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

          totalDist += distanceFormula(lastxyz.x, xpos, lastxyz.y, ypos)

          if (doTabs) {
            // console.log(totalDist, (lastTabPos + distBetweenTabs), zpos, tabsBelowZ)
            if (totalDist > (lastTabPos + distBetweenTabs) && zpos < tabsBelowZ) {
              var d = distanceFormula(xpos, xposNext, ypos, yposNext)
              // console.log(d, (toolDia + tabWidth));
              if (d >= (toolDia + tabWidth)) {
                var numTabs = Math.round(d / (distBetweenTabs + tabWidth));
                // if we have a line distance of 100
                // and 3 tabs (width 10) in that line per numTabs
                // then we want to evenly space them
                // so we divide the line distance by numTabs
                var spacePerTab = d / numTabs;
                // which in this example would be 33.33~
                // then in each space per tab we need to center the tab
                // which means dividing the difference of the spacePerTab and tabWidth by 2
                var tabPaddingPerSpace = (spacePerTab - (tabWidth + toolDia)) / 2;

                // console.log("Adding tab")
                // next point
                var deltaX = xposNext - xpos;
                var deltaY = yposNext - ypos;

                // get the line angle
                var ang = Math.atan2(deltaY, deltaX);
                // console.log('  ANGLE ' + (ang * 180 / Math.PI));

                // convert it to degrees for later math with addDegree
                ang = ang * 180 / Math.PI;

                lastTabPos = totalDist;
                // console.log("Z at " + zpos.toFixed(2) + " / Add TAB at X:" + xpos + " Y:" + ypos);
                g += '\n; START TABS\n';
                var npt = [xpos, ypos]
                for (var r = 0; r < numTabs; r++) {
                  // then for each tab
                  // add another point at the current point +tabPaddingPerSpace
                  npt = newPointFromDistanceAndAngle(npt, ang, tabPaddingPerSpace);
                  g += 'G1' + feedrate + ' X' + npt[0] + ' Y' + npt[1] + '\n';
                  // then we raise the z height by config.tabHeight
                  g += 'G0 Z' + tabsBelowZ + '\n';
                  // then add another point at the current point +tabWidth
                  npt = newPointFromDistanceAndAngle(npt, ang, tabWidth + toolDia);
                  g += 'G0' + feedrate + ' X' + npt[0] + ' Y' + npt[1] + '\n';
                  // then lower the z height back to zPos at plunge speed
                  g += 'G0 F' + plungeSpeed + ' Z' + tabsBelowZ + '\n';
                  g += 'G1 F' + plungeSpeed + ' Z' + zpos + '\n';
                  // then add another point at the current point +tabPaddingPerSpace
                  // with the cut speed
                  npt = newPointFromDistanceAndAngle(npt, ang, tabPaddingPerSpace);
                  g += 'G1' + feedrate + ' X' + npt[0] + ' Y' + npt[1] + '\n';
                }
                g += '; END TABS\n\n';
              } else { // Line isnt long enough
                // console.log("Line not long enough")
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
            } else { // not far enough away from last tab yet
              // console.log("No Tab needed yet")
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
          } else {
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
          // end move

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

  g += "\n" + g0 + " Z" + clearanceHeight + "\n"; // Position Before Plunge!
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
    if (toolpathsInScene[j].userData.visible) {
      if (typeof(toolpathsInScene[j].userData.gcode) != "undefined") {
        g += toolpathsInScene[j].userData.gcode;
      } else {
        console.log(toolpathsInScene[j].name + ' does not have valid gcode yet');
      }
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

// borrowed tab generator code from https://github.com/andrewhodel/millcrum/blob/master/inc/mc.js
distanceFormula = function(x1, x2, y1, y2) {
  // get the distance between p1 and p2
  var a = (x2 - x1) * (x2 - x1);
  var b = (y2 - y1) * (y2 - y1);
  return Math.sqrt(a + b);
};

newPointFromDistanceAndAngle = function(pt, ang, distance) {
  // use cos and sin to get a new point with an angle
  // and distance from an existing point
  // pt = [x,y]
  // ang = in degrees
  // distance = N
  var r = [];
  r.push(pt[0] + (distance * Math.cos(ang * Math.PI / 180)));
  r.push(pt[1] + (distance * Math.sin(ang * Math.PI / 180)));
  return r;
};