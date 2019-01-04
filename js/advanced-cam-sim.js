var timefactor = 1,
  simstopped = true;
var simgcodeobj;

function enableSim() {
  $('#runSimBtn').prop('disabled', false)
}

function disableSim() {
  $('#runSimBtn').prop('disabled', true)
}

function simAnimate() {
  if (cone) {
    // 160widthx200height offset?
    if (cone.position) {
      var conepos = toScreenPosition(cone, camera)
      var offset = $("#renderArea").offset()
      var farside = $("#renderArea").offset().left + $("#renderArea").outerWidth()
      var bottomside = $("#renderArea").offset().top + $("#renderArea").outerHeight()
      // console.log(conepos)
      if (conepos.y < offset.top) {
        conepos.y = offset.top + 20;
      }
      if (conepos.y > bottomside - 120) {
        conepos.y = bottomside - 120;
      }
      if (conepos.x < 70) {
        conepos.x = 70;
      }

      if (conepos.x > farside - 90) {
        conepos.x = farside - 90;
      }
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
  $('#runSimBtn').show()
  $('#stopSimBtn').hide()
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
  if (typeof(object) == 'undefined' || !scene.getObjectByName('gcodeobject')) {
    console.log('No Gcode in Preview yet')
    var message = `No Gcode in Preview yet: Please setup toolpaths, and generate GCODE before running simulation`
    Metro.toast.create(message, null, 10000, 'bg-red');
    simstop()
  } else {
    lastLine = {
      x: 0,
      y: 0,
      z: 0,
      e: 0,
      f: 0,
      feedrate: null,
      extruding: false
    };
    clearSceneFlag = true;
    $("#conetext").show();
    cone.visible = true
    var posx = object.userData.lines[0].p2.x; //- (sizexmax/2);
    var posy = object.userData.lines[0].p2.y; //- (sizeymax/2);
    var posz = object.userData.lines[0].p2.z + 20;
    cone.position.x = posx;
    cone.position.y = posy;
    cone.position.z = posz;
    cone.material = new THREE.MeshPhongMaterial({
      color: 0x28a745,
      specular: 0x0000ff,
      shininess: 100,
      opacity: 0.9,
      transparent: true
    })

    simstopped = false;
    // timefactor = 1;
    $('#simspeedval').text(timefactor);
    var simIdx = startindex;
    $('#runSimBtn').hide()
    $('#stopSimBtn').show()
    $('#editorContextMenu').hide() // sometimes we launch sim(linenum) from the context menu... close it once running
    var runSim = function() {
      // editor.gotoLine(simIdx + 1)
      $('#gcodesent').html(simIdx + 1);
      // $('#simgcode').html(object.userData.lines[simIdx].args.origtext);
      var posx = object.userData.lines[simIdx].p2.x; //- (sizexmax/2);
      var posy = object.userData.lines[simIdx].p2.y; //- (sizeymax/2);
      var posz = object.userData.lines[simIdx].p2.z;

      if (object.userData.lines[simIdx].args.isFake) {
        if (object.userData.lines[simIdx].args.text.length < 1) {
          var text = "empty line"
        } else {
          var text = object.userData.lines[simIdx].args.text
        }
        var simTime = 0.01 / timefactor;
      } else {
        var text = object.userData.lines[simIdx].args.cmd
        var simTime = object.userData.lines[simIdx].p2.timeMins / timefactor;
      }
      if (object.userData.lines[simIdx].p2.feedrate == null) {
        var feedrate = 0.00
        simTime = 0.01
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
              <td><b>F:</b></td><td align="right"><b>` + feedrate + `mm/min</b></td>
            </tr>
          </table>
        `);


      // if (simTime < 0.1) { simTime = 0.1};
      var simTimeInSec = simTime * 60;
      if (!object.userData.lines[simIdx].args.isFake) {
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
      } else {
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

    };
    runSim(); //kick it off
  }

}