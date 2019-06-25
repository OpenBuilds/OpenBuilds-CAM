
function drawToolpath() {

  var toolPathWorker = new Worker('workers/toolpath/worker/toolpathworker.js');
  toolPathWorker.addEventListener('message', function(e) {
    // console.log(e)
    var loader = new THREE.ObjectLoader();
    var data = JSON.parse(e.data);
    toolpathsInScene.length = 0;
    // console.log(data)
    var newToolpathsInScene = [];
    for (var key in data) {
      var object = loader.parse(data[key]);
      if (object) {
        if (object.userData.inflated) {
          object.userData.inflated = loader.parse(object.userData.inflated);
          if (object.userData.inflated.userData.pretty) {
            object.userData.inflated.userData.pretty = loader.parse(object.userData.inflated.userData.pretty);
          }
        }
        // console.log(object.userData.inflated.userData.pretty)
        newToolpathsInScene.push(object)
      }
    }

    if (newToolpathsInScene.length > 0) {
      toolpathsInScene.length = 0;
      toolpathsInScene = newToolpathsInScene;
      fillTree();
      toolPathWorker.terminate();
    }

  });

  toolPathWorker.postMessage({
    'data': JSON.stringify(toolpathsInScene)
  });

}
