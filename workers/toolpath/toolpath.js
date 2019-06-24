
function drawToolpath() {

  var toolPathWorker = new Worker('workers/toolpath/worker/toolpathworker.js');
  toolPathWorker.addEventListener('message', function(e) {
    var loader = new THREE.ObjectLoader();
    var data = JSON.parse(e.data);
    console.log(data)
    var newtoolpathsInScene = []
    for (i=0; i<data.length; i++) {
      var toolpath = loader.parse(data[i]);
      toolpath.userData.inflated = loader.parse(toolpath.userData.inflated);
      newtoolpathsInScene.push(toolpath)
    }

    toolpathsInScene = newtoolpathsInScene;
    toolPathWorker.terminate();
  });

  toolPathWorker.postMessage({
    'data': JSON.stringify(toolpathsInScene)
  });

}
