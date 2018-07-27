/*

    AUTHOR:  Peter van der Walt

*/
// Show all exceptions to the user:
OpenJsCad.AlertUserOfUncaughtExceptions();

function updateSolid(data) {
  gProcessor.setJsCad(data);
}

function loadGeargen() {
  gProcessor = new OpenJsCad.Processor(document.getElementById("openjscad"));
  getProg('lib/openjscad_files/gear11.jscad');

}

function loadBoxgen() {
  gProcessor = new OpenJsCad.Processor(document.getElementById("openjscad"));
  getProg('lib/openjscad_files/lasercut_box.jscad');

}

function getProg(name) {
  $.get(name, function(data) {
    updateSolid(data);
  });
}