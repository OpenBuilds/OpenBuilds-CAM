var timefactor = 1;

function enableSim() {
  $("#simstartbtn").removeClass("disabled");
}

function disableSim() {
  $("#simstartbtn").addClass("disabled");
}

function simAnimate() {
  if (cone) {
    if (cone.position) {
      var conepos = toScreenPosition(cone, camera)
      $("#conetext").css('left', conepos.x + "px").css('top', conepos.y + "px");
    }
  }
}

function toScreenPosition(obj, camera) {
  var vector = new THREE.Vector3();

  var widthHalf = 0.5 * renderer.context.canvas.width;
  var heightHalf = 0.5 * renderer.context.canvas.height;

  obj.updateMatrixWorld();
  vector.setFromMatrixPosition(obj.matrixWorld);
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
}

function simSpeed() {
  timefactor = timefactor * 10;
  if (timefactor > 1024) timefactor = 1;
  $('#simspeedval').text(timefactor);
}

function sim(startindex) {
  makeGcode();
  cone.visible = true
  $("#conetext").show();
  cone.material = new THREE.MeshPhongMaterial({
    color: 0x28a745,
    specular: 0x0000ff,
    shininess: 100,
    opacity: 0.9,
    transparent: true
  })
  if (typeof(object) == 'undefined') {
    console.log('No Gcode in Preview yet')
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
      $('#simgcode').html(object.userData.lines[simIdx].args.origtext);
      var posx = object.userData.lines[simIdx].p2.x; //- (sizexmax/2);
      var posy = object.userData.lines[simIdx].p2.y; //- (sizeymax/2);
      var posz = object.userData.lines[simIdx].p2.z + 20;
      var simTime = object.userData.lines[simIdx].p2.timeMins / timefactor;
      // if (simTime < 0.1) { simTime = 0.1};
      TweenMax.to(cone.position, simTime, {
        x: posx,
        y: posy,
        z: posz,
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