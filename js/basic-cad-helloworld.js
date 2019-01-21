function helloWorld() {
  $.get("./workspace/helloworld.json?date=" + new Date().getTime(), function(data) {
    parseLoadWorkspace(data)
    resetView();
    fillTree();
    setTimeout(function() {
      makeGcode();
    }, 100)
  });
}

function helloWorldLaser() {
  $.get("./workspace/helloworldlaser.json?date=" + new Date().getTime(), function(data) {
    parseLoadWorkspace(data)
    resetView();
    fillTree();
    setTimeout(function() {}, 100)
    makeGcode();
  });
}