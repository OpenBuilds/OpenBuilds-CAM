// To run:
//loadGeargen(paramsset)
var gProcessor;
OpenJsCad.AlertUserOfUncaughtExceptions();

var paramsset = {
  circularPitch: 8,
  pressureAngle: 20,
  clearance: 0.05, // static
  backlash: 0.05, // static
  toothCount1: 45,
  centerHoleDiameter1: 20,
  profileShift: -0,
  toothCount2: 50,
  centerHoleDiameter2: 4,
  type: 3,
  resolution: 30,
  stepsPerToothAngle: 3
};

function updateParams() {
  var gearType = $('input[name=geartype]:checked').val();
  console.log(gearType)

  // typeof	values: [3, 1, 2],
  // 			initial: 3,
  // 			captions: ["Gear 1 and Gear 2", "Gear 1 Only", "Gear 2 Only"]
  if (gearType == 'external') {
    paramsset.toothCount1 = $("#toothCount1").val()
    paramsset.toothCount2 = $("#toothCount2").val()
    paramsset.type = 3
  } else if (gearType == 'rack') {
    paramsset.toothCount1 = $("#toothCount1").val()
    paramsset.toothCount2 = 0
    paramsset.type = 3
  } else if (gearType == 'internal') {
    paramsset.toothCount1 = -$("#toothCount1").val()
    paramsset.toothCount2 = $("#toothCount2").val()
    paramsset.type = 3
  } else if (gearType == 'single') {
    paramsset.toothCount1 = $("#toothCount1").val()
    paramsset.toothCount2 = $("#toothCount2").val()
    paramsset.type = 1
  }
  paramsset.centerHoleDiameter1 = $("#centerHoleDiameter1").val()
  paramsset.centerHoleDiameter2 = $("#centerHoleDiameter2").val()
  paramsset.circularPitch = $("#circularPitch").val()
  paramsset.pressureAngle = $("#pressureAngle").val()
  paramsset.profileShift = $("#profileShift").val()
  paramsset.resolution = $("#resolution").val()
  paramsset.stepsPerToothAngle = $("#stepsPerToothAngle").val()
  console.log(JSON.stringify(paramsset, null, 2))
}

function createGear() {
  updateParams()
  loadGeargen(paramsset)
}

function gearType(val) {
  console.log(val)
  if (val == 'external') {
    $("#centerHoleDiameter1").parent().show();
    $("#centerHoleDiameter2").parent().show();
    $("#toothCount2").parent().show();
    $("#gear1title").html("Gear 1");
    $("#gear2title").html("Gear 2");
    $("#gear2title").show();
    //
  } else if (val == 'rack') {
    $("#centerHoleDiameter1").parent().show();
    $("#centerHoleDiameter2").parent().hide();
    $("#toothCount2").parent().hide();
    $("#gear1title").html("Pinion");
    $("#gear2title").html("");
    $("#gear2title").hide();
    //
  } else if (val == 'internal') {
    $("#centerHoleDiameter1").parent().hide();
    $("#centerHoleDiameter2").parent().show();
    $("#toothCount2").parent().show();
    $("#gear1title").html("Gear 1 (Orbit)");
    $("#gear2title").html("Gear 2 (Planet)");
    $("#gear2title").show();
    //
  } else if (val == 'single') {
    $("#centerHoleDiameter1").parent().show();
    $("#centerHoleDiameter2").parent().hide();
    $("#toothCount2").parent().hide();
    $("#gear1title").html("Gear");
    $("#gear2title").html("");
    $("#gear2title").hide();
    //
  }
}

function loadGeargen(paramsset) {
  gProcessor = new OpenJsCad.Processor(document.getElementById("viewer"));
  $.get('lib/openjscad_files/gear11.jscad', function(data) {

    var str = "// Involute spur gear builder jscad script. Licensed under the MIT license (http://opensource.org/licenses/mit-license.php). Copyright 2014 Dr. Rainer Hessmer\nvar paramsset="
    str += JSON.stringify(paramsset, null, 2);
    str += data;
    updateSolid(str);
  });

};

function updateSolid(data) {
  gProcessor.setJsCad(data);
}