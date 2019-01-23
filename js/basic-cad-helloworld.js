function helloWorld() {
  $.get("./workspace/helloworld.json?date=" + new Date().getTime(), function(data) {
    parseLoadWorkspace(data)
    resetView();
    fillTree();
    setTimeout(function() {
      makeGcode();
    }, 2000)
  });
}

function helloWorldLaser() {
  $.get("./workspace/helloworldlaser.json?date=" + new Date().getTime(), function(data) {
    parseLoadWorkspace(data)
    resetView();
    fillTree();
    setTimeout(function() {}, 2000)
    makeGcode();
  });
}