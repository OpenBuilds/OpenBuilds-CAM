function helloWorld() {
  $.get("./workspace/helloworld.obc?date=" + new Date().getTime(), function(data) {
    parseLoadWorkspace(data)
    resetView();
    fillTree();
    setTimeout(function() {
      makeGcode();
    }, 500)
  });
}

function helloWorldLaser() {
  $.get("./workspace/helloworldlaser.obc?date=" + new Date().getTime(), function(data) {
    parseLoadWorkspace(data)
    resetView();
    fillTree();
    setTimeout(function() {makeGcode();}, 500)

  });
}

function helloWorldDragKnife() {
  $.get("./workspace/helloworlddragknife.obc?date=" + new Date().getTime(), function(data) {
    parseLoadWorkspace(data)
    resetView();
    fillTree();
    setTimeout(function() {makeGcode();}, 500)
  });
}

function helloWorldPlasma() {
  $.get("./workspace/helloworldplasma.obc?date=" + new Date().getTime(), function(data) {
    parseLoadWorkspace(data)
    resetView();
    fillTree();
    setTimeout(function() {makeGcode();}, 500)
  });
}
