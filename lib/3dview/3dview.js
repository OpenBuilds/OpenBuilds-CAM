var object
var draw, line, timefactor = 1,
  object, simRunning = false;

var loader = new THREE.ObjectLoader();



function parseGcodeInWebWorker() {
  var gcode = prepgcodefile();
  simstop()
  scene.remove(object)
  object = false;

  // var worker = new Worker('lib/3dview/workers/gcodeparser.js');
  var worker = new Worker('lib/3dview/workers/litegcodeviewer.js');
  worker.addEventListener('message', function(e) {
    // console.log('webworker message')
    if (scene.getObjectByName('gcodeobject')) {
      scene.remove(scene.getObjectByName('gcodeobject'))
      object = false;
    }
    object = loader.parse(JSON.parse(e.data));
    if (object && object.userData.lines.length > 1) {
      worker.terminate();
      scene.add(object);
      if (object.userData.inch) {
        object.scale.x = 25.4
        object.scale.y = 25.4
        object.scale.z = 25.4
      }
      redrawGrid(parseInt(object.userData.bbbox2.min.x), parseInt(object.userData.bbbox2.max.x), parseInt(object.userData.bbbox2.min.y), parseInt(object.userData.bbbox2.max.y), object.userData.inch)
      // animate();
      setTimeout(function() {
        clearSceneFlag = true;
        resetView();
        // Button on Ribbon Menu
        $("#generatetpgcode").html("<i class='fa fa-cubes' aria-hidden='true'></i> Generate G-Code");
        $("#generatetpgcode").prop('disabled', false);
        $("#generatetpgcode").addClass('success');


        // $('#gcodesavebtn1').prop('disabled', false);
        $('#gcodesavebtn2').removeClass('disabled');
        $('#gcodesavebtn2').addClass('primary');
        $('#gcodetrashbtn2').removeClass('disabled');
        $('#gcodepreviewicon').addClass('fg-grayBlue').removeClass('fg-gray');
        $('#trashicon').addClass('fg-red').removeClass('fg-gray');

        $('#validGcode').html("<i class='fas fa-check fa-fw fg-green'></i> GCODE Ready to be sent ");
        $('#sendGcodeToMyMachine').prop('disabled', false);
        enableSim();
      }, 200);

    }
  }, false);

  worker.postMessage({
    'data': gcode
  });

};