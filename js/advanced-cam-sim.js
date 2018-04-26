var timefactor = 1000,
  simstopped = true;

function enableSim() {
  $("#simstartbtn").prop('disabled', false);
}

function disableSim() {
  $("#simstartbtn").prop('disabled', true);
}

function simAnimate() {
  if (cone) {
    // 160widthx200height offset?
    if (cone.position) {
      var conepos = toScreenPosition(cone, camera)
      $("#conetext").css('left', conepos.x - 60 + "px").css('top', conepos.y - 110 + "px");
    }
  }
}

function toScreenPosition(obj, camera) {
  var vector = new THREE.Vector3(obj.position.x, obj.position.y + 10, obj.position.z + 30);
  var widthHalf = 0.5 * renderer.context.canvas.width;
  var heightHalf = 0.5 * renderer.context.canvas.height;
  vector.project(camera);
  vector.x = (vector.x * widthHalf) + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;

  return {
    x: vector.x,
    y: vector.y
  };

};


function simstop() {
  simstopped = true;
  $('#simstartbtn').show();
  $('#simstopbtn').hide();
  timefactor = 1;
  $('#simspeedval').text(timefactor);
  $('#gcodesent').html('0');
  // editor.gotoLine(0)
  cone.material = new THREE.MeshPhongMaterial({
    color: 0x007bff,
    specular: 0x0000ff,
    shininess: 100,
    opacity: 0.9,
    transparent: true
  })
  $("#conetext").hide();
  cone.visible = false;
  clearSceneFlag = true;
}

function simSpeed() {
  timefactor = timefactor * 10;
  if (timefactor > 1024) timefactor = 0.1;
  $('#simspeedval').text(timefactor);
}

function sim(startindex) {
  clearSceneFlag = true;
  $("#conetext").show();
  cone.visible = true
  cone.material = new THREE.MeshPhongMaterial({
    color: 0x28a745,
    specular: 0x0000ff,
    shininess: 100,
    opacity: 0.9,
    transparent: true
  })
  if (typeof(object) == 'undefined' || !scene.getObjectByName('gcodeobject')) {
    console.log('No Gcode in Preview yet')
    bootoast.toast({
      message: '<h6><i class="fa fa-times-circle" aria-hidden="true"></i> No Gcode in Preview yet:</h6><br>Please setup toolpaths, and generate GCODE before running simulation',
      type: 'danger',
      position: 'top-center',
      // icon: 'fa-times-circle',
      timeout: 10,
      animationDuration: 300,
      dismissible: true
    });
    // if (!scene.getObjectByName('gcodeobject')) {
    //   makeGcode();
    // }
    simstop()
  } else {
    simstopped = false;
    // timefactor = 1;
    $('#simspeedval').text(timefactor);
    var simIdx = startindex;
    $('#simstartbtn').hide();
    $('#simstopbtn').show();
    $('#editorContextMenu').hide() // sometimes we launch sim(linenum) from the context menu... close it once running
    var runSim = function() {
      // editor.gotoLine(simIdx + 1)
      $('#gcodesent').html(simIdx + 1);
      // $('#simgcode').html(object.userData.lines[simIdx].args.origtext);
      var posx = object.userData.lines[simIdx].p2.x; //- (sizexmax/2);
      var posy = object.userData.lines[simIdx].p2.y; //- (sizeymax/2);
      var posz = object.userData.lines[simIdx].p2.z;
      var simTime = object.userData.lines[simIdx].p2.timeMins / timefactor;
      if (object.userData.lines[simIdx].args.isFake) {
        if (object.userData.lines[simIdx].args.text.length < 1) {
          var text = "empty line"
        } else {
          var text = object.userData.lines[simIdx].args.text
        }
      } else {
        var text = object.userData.lines[simIdx].args.cmd
      }
      if (object.userData.lines[simIdx].p2.feedrate == null) {
        var feedrate = 0
      } else {
        var feedrate = object.userData.lines[simIdx].p2.feedrate
      }

      $("#conetext").html(
        ` <table style="border: 1px solid #888">
            <tr class="stripe" style="border-bottom: 1px solid #888">
              <td><b>CMD</b></td><td align="right"><b>` + text + `</b></td>
            </tr>
            <tr class="stripe" style="border-bottom: 1px solid #888">
              <td><b>X:</b></td><td align="right"><b>` + posx.toFixed(2) + `mm</b></td>
            </tr>
            <tr class="stripe" style="border-bottom: 1px solid #888">
              <td><b>Y:</b></td><td align="right"><b>` + posy.toFixed(2) + `mm</b></td>
            </tr>
            <tr class="stripe" style="border-bottom: 1px solid #888">
              <td><b>Z:</b></td><td align="right"><b>` + posz.toFixed(2) + `mm</b></td>
            </tr>
            <tr class="stripe" style="border-bottom: 1px solid #888">
              <td><b>F:</b></td><td align="right"><b>` + object.userData.lines[simIdx].p2.feedrate + `mm/min</b></td>
            </tr>
          </table>
        `);


      // if (simTime < 0.1) { simTime = 0.1};
      var simTimeInSec = simTime * 60;
      TweenMax.to(cone.position, simTimeInSec, {
        x: posx,
        y: posy,
        z: posz + 20,
        onComplete: function() {
          if (simstopped == true) {
            //return
            simstop();
          } else {
            simIdx++;
            if (simIdx < object.userData.lines.length) {
              runSim();
            } else {
              simstop();
            }
          }
        }
      })
    };
    runSim(); //kick it off
  }

}