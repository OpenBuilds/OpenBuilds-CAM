function helloWorld() {
  $.get("./workspace/helloworld.json?date=" + new Date().getTime(), function(data) {
    console.log(data)
    parseLoadWorkspace(data)
    printLog('HelloWorld Opened', msgcolor, "file");
    // putFileObjectAtZero();
    resetView();
    // $("#partslibModal").modal('hide')
    fillTree();
    setTimeout(function() {
      makeGcode();
    }, 3000)
  });
}

function helloWorldLaser() {
  $.get("./workspace/helloworldlaser.json?date=" + new Date().getTime(), function(data) {
    console.log(data)
    parseLoadWorkspace(data)
    printLog('HelloWorld-Laser Opened', msgcolor, "file");
    // putFileObjectAtZero();
    resetView();
    // $("#partslibModal").modal('hide')
    fillTree();
    setTimeout(function() {
      makeGcode();
    }, 3000)
  });
}