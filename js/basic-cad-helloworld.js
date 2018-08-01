function helloWorld() {
  $.get("./workspace/helloworld.json", function(data) {
    console.log(data)
    parseLoadWorkspace(data)
    printLog('HelloWorld Opened', msgcolor, "file");
    // putFileObjectAtZero();
    resetView();
    // $("#partslibModal").modal('hide')
    fillTree();
    makeGcode();
  });
}