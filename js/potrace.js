//from https://github.com/oov/potrace

function traceFromImg(e, f) {
  console.log(e)
  var img = new Image();
  img.crossOrigin = 'anonymous';
  // img.src = 'https://www.gravatar.com/avatar/ea4d591101f572e45312cf75901032b4?s=256';
  img.src = e.target.result
  img.onload = function() {
    var file = potrace.fromImage(img).toSVG(1);
    // console.log(file)
    return lwsvgparser.loadFromString(file).then(function(element) {
        return lwsvgparser.parse().then(function(tags) {
          lwsvgparser.editor = {
            name: "PoTrace.js",
            version: "1.00"
          };
          drawFile(f.name, tags);
        });
      })
      .catch(function(error) {
        console.error('error:', error);
      });

    printLog('SVG Opened', msgcolor, "file");
    resetView();
  }
}