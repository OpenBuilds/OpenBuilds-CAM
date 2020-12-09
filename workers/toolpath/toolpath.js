function toolpathPreview(i) {
  trashGcode();
  $('#gcodesavebtn2').addClass('disabled');
  $('#gcodetrashbtn2').addClass('disabled');
  $('#gcodeexporticon').removeClass('fg-grayBlue').addClass('fg-gray');
  $('#gcodepreviewicon').removeClass('fg-grayBlue').addClass('fg-gray');
  $('#trashicon').removeClass('fg-red').addClass('fg-gray');
  $('#validGcode').html("<i class='fas fa-times fa-fw fg-red'></i> No GCODE yet")
  $("#savetpgcode").addClass("disabled");
  $("#exportGcodeMenu").addClass("disabled");
  Metro.dialog.close('#statusmodal')
  setTimeout(function() {
    drawToolpath(i);
  }, 200);
}


function drawToolpath(index) {
  $("#generatetpgcode").html("<i class='fa fa-spinner fa-spin '></i> Unavailable, please wait");
  $("#generatetpgcode").prop('disabled', true);
  $("#generatetpgcode2").html("<i class='fa fa-spinner fa-spin '></i> Unavailable, please wait");
  $("#generatetpgcode2").prop('disabled', true);
  var toolPathWorker = new Worker('workers/toolpath/worker/toolpathworker.js');
  toolpathsInScene[index].userData.worker = toolPathWorker
  toolPathWorker.addEventListener('message', function(e) {
    // console.log(e.data)
    if (e.data.index || e.data.index == 0) {
      // console.log("setting " + e.data.index + " to " + e.data.running)
      if (e.data.running) {
        $('#toolpathSpinner' + e.data.index).show();
      } else {
        $('#toolpathSpinner' + e.data.index).hide();
      }
    }

    if (e.data.toolpath) {
      var loader = new THREE.ObjectLoader();
      var data = JSON.parse(e.data.toolpath);

      var object = loader.parse(data);
      if (object) {
        if (object.userData.inflated) {
          object.userData.inflated = loader.parse(object.userData.inflated);
          if (object.userData.inflated.userData.pretty) {
            object.userData.inflated.userData.pretty = loader.parse(object.userData.inflated.userData.pretty);
          }
        }
        toolpathsInScene[e.data.index] = object
        // fillTree();
        clearSceneFlag = true;
        animate();
        toolPathWorker.terminate();
        toolpathsInScene[index].userData.worker = false;

        if (toolpathWorkersBusy()) {
          $("#generatetpgcode").html("<i class='fa fa-spinner fa-spin '></i> Unavailable, please wait");
          $("#generatetpgcode").prop('disabled', true);
          $("#generatetpgcode2").html("<i class='fa fa-spinner fa-spin '></i> Unavailable, please wait");
          $("#generatetpgcode2").prop('disabled', true);
        } else {
          $("#generatetpgcode").html("<i class='fa fa-cubes' aria-hidden='true'></i> Generate G-Code");
          $("#generatetpgcode").prop('disabled', false);
          $("#generatetpgcode2").html("<i class='fa fa-cubes' aria-hidden='true'></i> Generate G-Code");
          $("#generatetpgcode2").prop('disabled', false);
        }
      }
    }
  });

  var dataToProcess = {
    toolpath: JSON.stringify(toolpathsInScene[index]),
    index: index,
    performanceLimit: $('#performanceLimit').is(":checked")
  }

  toolPathWorker.postMessage({
    'data': dataToProcess
  });

}




// function drawToolpaths() {
//
//   var toolPathWorker = new Worker('workers/toolpath/worker/toolpathworker.js');
//   toolPathWorker.addEventListener('message', function(e) {
//      console.log(e.data)
//     if (e.data.index || e.data.index == 0) {
//       console.log("setting " + e.data.index + " to " + e.data.running)
//       if (e.data.running) {
//         $('#toolpathSpinner'+e.data.index).show();
//       } else {
//         $('#toolpathSpinner'+e.data.index).hide();
//       }
//     }
//
//     if (e.data.toolpaths) {
//       var loader = new THREE.ObjectLoader();
//       var data = JSON.parse(e.data.toolpaths);
//
//       toolpathsInScene.length = 0;
//       // console.log(data)
//       var newToolpathsInScene = [];
//       for (var key in data) {
//         var object = loader.parse(data[key]);
//         if (object) {
//           if (object.userData.inflated) {
//             object.userData.inflated = loader.parse(object.userData.inflated);
//             if (object.userData.inflated.userData.pretty) {
//               object.userData.inflated.userData.pretty = loader.parse(object.userData.inflated.userData.pretty);
//             }
//           }
//           // console.log(object.userData.inflated.userData.pretty)
//           newToolpathsInScene.push(object)
//         }
//       }
//
//       if (newToolpathsInScene.length > 0) {
//         toolpathsInScene.length = 0;
//         toolpathsInScene = newToolpathsInScene;
//         fillTree();
//         clearSceneFlag = true;
//         animate();
//         toolPathWorker.terminate();
//       }
//     }
//
//   });
//
//   toolPathWorker.postMessage({
//     'data': JSON.stringify(toolpathsInScene)
//   });
//
// }

function toolpathWorkersBusy() {
  var workersRunning = false;
  for (i = 0; i < toolpathsInScene.length; i++) {
    if (toolpathsInScene[i].userData.worker) {
      workersRunning = true;
    }
  }
  if (workersRunning) {
    return true;
  } else {
    return false;
  }
}