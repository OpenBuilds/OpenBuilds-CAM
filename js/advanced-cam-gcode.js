function trashGcode() {
  simstop()
  if (scene.getObjectByName('gcodeobject')) {
    // console.log("Existing GCODE object: Cleaning up first")
    scene.remove(scene.getObjectByName('gcodeobject'))
    object = false;
  }
  disableSim()
  $('#gcodesavebtn2').addClass('disabled');
  $('#gcodetrashbtn2').addClass('disabled');
  $('#gcodeexporticon').removeClass('fg-grayBlue').addClass('fg-gray');
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
    // Button on Window bar above Toolpaths
    $("#generatetpgcode2").html("<i class='fa fa-spinner fa-spin '></i> Generating, please wait");
    $("#generatetpgcode2").prop('disabled', true);

    setTimeout(function() {
      for (j = 0; j < toolpathsInScene.length; j++) {
        // console.log(toolpathsInScene[j].userData.visible)
        if (toolpathsInScene[j].userData.visible) {

          // toolpath settings is applied to the parent Toolpath.  Each child in the "toolpath" is processed with the same settings
          
          var Feedrate = toolpathsInScene[j].userData.camFeedrate;
          var Plungerate = toolpathsInScene[j].userData.camPlungerate;
          var ZClearance = toolpathsInScene[j].userData.camZClearance;
          var rampplunge = toolpathsInScene[j].userData.tRampPlunge == "" ? true : false;

          
          //  only apply rotating diameter if Revolution is selected
          var type = loadSetting("machinetype");
          if(type=="Revolution"){
            var rotatingDiameter=parseFloat($("#projectWD").val());  
          }else{
            var rotatingDiameter=0;
          }

       
        toolpathsInScene[j].userData.gcode = generateGcode(j, toolpathsInScene[j].userData.inflated, Feedrate, Plungerate, ZClearance, rampplunge, rotatingDiameter);
          


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

function generateGcode(index, toolpathGrp, cutSpeed, plungeSpeed, clearanceHeight, rampplunge, xAxisDiameter) {


  // empty string to store gcode
  var g = "";
  g += "; Operation " + index + ": " + toolpathsInScene[index].userData.camOperation + "\n";
  g += "; Bit Diameter: " + toolpathsInScene[index].userData.camToolDia + "\n";
  if(xAxisDiameter>0){
  g += "; Project Diameter: " + xAxisDiameter.toFixed(4) + "\n";  // set diameter for XZA CNC 
  }
  


  // Optimise gcode, send commands only when changed
  var isAtClearanceHeight = false;
  var isFeedrateSpecifiedAlready = false;
  var lastxyz = false;

  //todo: settings applet
  var g0 = "G0"; 
  var g1 = "G1";
  

  if (!toolpathGrp) {
    var message = `Toolpath Error: One or more of your toolpaths is not configured.  You need to configure the toolpaths, before generating GCODE`
    Metro.toast.create(message, null, 4000, 'bg-red');
    $("#generatetpgcode").html("<i class='fa fa-cubes' aria-hidden='true'></i> Generate G-Code");
    $("#generatetpgcode").prop('disabled', false);
  } else {
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
    
        
          
          // console.log(i, xpos, ypos, zpos)
          // First Move To
          if (i == 0) {
            // console.log("First Point", xpos, ypos, zpos, optimisedVertices[i]);
            // first point in line where we start lasering/milling

            if (lastxyz.x == xpos.toFixed(4) && lastxyz.y == ypos.toFixed(4)) {
              // console.log("No need to plunge, can stay at z " + lastxyz.z)
            } else {
              // move to clearance height, at first points XY pos
              if (!isAtClearanceHeight) {
                if (xAxisDiameter>0){
                var aAxis = ((2*ypos)/(Math.PI*xAxisDiameter)-1)*180+180;
                var zA = parseFloat(clearanceHeight) + parseFloat(xAxisDiameter)/2;
                g += "\n" + g0 + " Z" + zA + "; move to z-safe height\n"; // Position Before Plunge!
                }else{
                g += "\n" + g0 + " Z" + clearanceHeight + " ; move to z-safe height\n"; // Position Before Plunge!
                }
              }

              if (xAxisDiameter>0){
                var zA = parseFloat(clearanceHeight) + parseFloat(xAxisDiameter)/2;
                var aAxis = ((2*ypos)/(Math.PI*xAxisDiameter)-1)*180+180;
                g += g0+ " X" + xpos.toFixed(4) + " A" + aAxis.toFixed(4) + "\n"; // Move to XY position
              }else{
                g += g0+ " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + "\n"; // Move to XY position
              }
          }



            // then G1 plunge into material

            if (!rampplunge) {
              // console.log("Direct Plunge")

              if (xAxisDiameter>0){
                var aAxis = ((2*ypos)/(Math.PI*xAxisDiameter)-1)*180+180;
                var zA = parseFloat(zpos) + parseFloat(xAxisDiameter)/2;5
                g += g1 + " Z" + zA.toFixed(4) + " F" + plungeSpeed  + "\n"; // Plunge!!!!
              }else{
                g += g1 + " Z" + zpos.toFixed(4) +" F" + plungeSpeed  + "\n"; // Plunge!!!!
              }
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
                  if (xAxisDiameter>0){
                    var aAxis = ((2*ypos)/(Math.PI*xAxisDiameter)-1)*180+180;
                    var lastZ=parseFloat(lastxyz.z)+parseFloat(xAxisDiameter)/2;
                    g += "\n" + g0 + " Z" + lastZ +" A"+ aAxis.toFixed(4) + "\n"; // G0 to Z0 then Plunge!
                  }else{
                    g += "\n" + g0 + " Z" + lastxyz.z + "\n"; // G0 to Z0 then Plunge!
                  }
                
               
                } else {
                  if (xAxisDiameter>0){
                    var aAxis = ((2*ypos)/(Math.PI*xAxisDiameter)-1)*180+180;
                    g += "\n" + g0 + " Z" + parseFloat(xAxisDiameter)/2 +" A"+ aAxis.toFixed(4) + "\n"; // G0 to Z0 then Plunge!
                  }else{
                    g += "\n" + g0 + " Z" + 0 + "\n"; // G0 to Z0 then Plunge!  
                  }
                }

                if (xAxisDiameter>0){
                var aAxisNpt = ((2*npt[1])/(Math.PI*xAxisDiameter)-1)*180+180;
                var aAxis = ((2*ypos)/(Math.PI*xAxisDiameter)-1)*180+180;
                var zA1 = parseFloat(zpos - (zdelta / 2)) + parseFloat(xAxisDiameter)/2;
                var zA2 = parseFloat(zpos) + parseFloat(xAxisDiameter)/2;
                  g += g1+ " X" + npt[0].toFixed(4) + " A" + aAxisNpt.toFixed(4) + " Z" + zA1.toFixed(4) + " F" + plungeSpeed + "\n"; // Move to XY position
                  g += g1 + " X" + xpos.toFixed(4) + " A" + aAxis.toFixed(4) + " Z" + zA2.toFixed(4) + " F" + plungeSpeed + "\n"; // Move to XY position
                }else{
                  g += g1+ " X" + npt[0].toFixed(4) + " Y" + npt[1].toFixed(4) + " Z" + (zpos - (zdelta / 2)).toFixed(4) + " F" + plungeSpeed + "\n"; // Move to XY position
                  g += g1 + " X" + xpos.toFixed(4) + " Y" + ypos.toFixed(4) + " Z" + zpos.toFixed(4) + " F" + plungeSpeed + "\n"; // Move to XY position
              }
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
            if (isFeedrateSpecifiedAlready) {
              feedrate = "";
            } else {
              // console.log('Cut Speed: ', cutSpeed);
              feedrate = " F" + cutSpeed;
              isFeedrateSpecifiedAlready = true;
            }

              // A axis that is rotating arounf the X axis
             if (xAxisDiameter>0){
              var aAxis = ((2*ypos)/(Math.PI*xAxisDiameter)-1)*180+180;
              var zA = parseFloat(zpos) + parseFloat(xAxisDiameter)/2;

              g += g1; 
              g += " X" + xpos.toFixed(4);
              g += " A" + aAxis.toFixed(4);
              g += " Z" + zA.toFixed(4);
              g += feedrate +"\n";

             }else {
              g += g1; 
              g += " X" + xpos.toFixed(4);
              g += " Y" + ypos.toFixed(4);
              g += " Z" + zpos.toFixed(4);
              g += feedrate +"\n";
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
   
      } // end inflatepate/pocket/entity
      // move to clearance height, at first points XY pos
    });
  }
  if (!isAtClearanceHeight) {
    g += "; retracting back to z-safe";
    if (xAxisDiameter>0){
      var aAxis = ((2*lastxyz.y)/(Math.PI*xAxisDiameter)-1)*180+180;
      var zA = parseFloat(clearanceHeight) + parseFloat(xAxisDiameter)/2;
      g += "\n" + g0 + " Z" + zA + " A" + aAxis.toFixed(4) + "\n"; // Position Before Plunge!
    }else{
      g += "\n" + g0 + " Z" + clearanceHeight + "\n"; // Position Before Plunge!
    }

    
  }
  // console.log("Generated gcode. length:", g.length);
  return g;
};

function prepgcodefile() {
  var startgcode = document.getElementById('startgcode').value;
  var endgcode = document.getElementById('endgcode').value;
  var g = "; GCODE Generated by Basic CAM on " + date.yyyymmdd() 
  if (startgcode) {
    g += startgcode;
    g += "\n";
  }
  //Select units
  if(document.getElementById("unitSwitch").checked){
    g += "\nG20 ;inch-mode\n";
    g += "\n";
  }else{
    g += "\nG21 ;mm-mode\n";
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
  g += "\nM2";
  return g;
}