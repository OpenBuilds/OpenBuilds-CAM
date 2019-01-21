// JavaScript Document

/* -----------------------------  Calc page JS ----------------------*/

var feedRateInches;
var depthOfCut;
var aggressionFactor; 
var Aluminum = [];
var Hardwood = [];
var Hard_Plastic = [];
var MDF = [];
var Soft_Plastic = [];
var Softwood = [];
var units;
var gcodeArray = [];
var gcodeValues = [];
var paramChosen;
var notesChosen;
var exampleChosen; 
var gcodeEntered;
var machineFactor;
var xSteps;
var ySteps;
var chipLoad;
var feedRate;
var speedRate;
var numberOfFlutes;


$(function() {
	FastClick.attach(document.body);
});


/*-----------------------Set Arrays---------------------------*/

Aluminum[0] = [0.0007, 0.0009, 0.0010, 0.0011];
Aluminum[1] = [0.012, 0.018, 0.0175, 0.0175];

Hard_Plastic[0] = [0.0015, 0.002, 0.0023, 0.0027];
Hard_Plastic[1] = [0.05, 0.065, 0.075, 0.075];

Hardwood[0] = [0.0012, 0.0016, 0.002, 0.0023];
Hardwood[1] = [0.04, 0.06, 0.08, 0.08];

MDF[0] = [0.0018, 0.002, 0.0023, 0.0027];
MDF[1] = [0.08, 0.12, 0.16, 0.17];

Soft_Plastic[0] = [0.0016, 0.002, 0.0023, 0.0025];
Soft_Plastic[1] = [0.06, 0.07, 0.08, 0.08];

Softwood[0] = [0.0016, 0.0022, 0.0024, 0.0028];
Softwood[1] = [0.06, 0.1, 0.14, 0.16];

gcodeValues= ["G0", "G1", "G2", "G3", "G4", "G10", "G20", "G21", "G28", "G28.1", "G30", "G30.1", "G38.2", "G53", "G54", "G55", "G56", "G57", "G58", "G59", "G90", "G91", "G92", "G92.1", "M0", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M30", "S", "F"];

gcodeArray[0] = ["X, Y, Z", "X, Y, Z, F", "X, Y, Z, I, J, K, F", "X, Y, Z, I, J, K, F", "P", "L20, L2, P", "None", "None", "X, Y, Z", "None", "X, Y, Z", "None", "X, Y, Z, F", "X, Y, Z", "None", "None", "None", "None", "None", "None", "None", "None", "X, Y, Z", "None", "None", "S", "None", "None", "T", "None", "None", "None", "None", "None", "None"];

gcodeArray[1] = ["Rapid movement at the default feed rate. G0 movements are just for getting around at maximum speed. You don’t cut anything with a G0 set.", "Linear movement at the specific cutting feed rate. ", "Clockwise arc movement. G2 and G3 movements are accompanied by X, Y, or Z, and I, J, or K words to tell the machine how exactly to arc. Few operators will need to understand how to program arcs manually. Your CAM software will do this for you.", "Counter-clockwise arc movement. G2 and G3 movements are accompanied by X, Y, or Z, and I, J, or K words to tell the machine how exactly to arc.  Few operators will need to understand how to program arcs manually. Your CAM software will do this for you.", "Pause for the number of seconds specified by the P parameter", "Set work coordinate system (G54 - G59) offsets. L2 means that you are offsetting from the homing location. L20 means that you are offsetting from the current position as the reference. P designates the coordinate system. IE: P1 is for G54, P2 is for G55, etc. If you were to type G10 L20 P1 X0 Y0 Z0 then you would set the G54 system (0,0,0) point to exactly where the machine is positioned right now.", "Coordinate units are in inches.", "Coordinate units are in millimeters.", "Return to home position that was set by G28.1. You must have homed the machine to use this command successfully.", "Designate the current position as the G28 position.", "Return to secondary home position that was set by G30.1. You must have homed the machine to use this command successfully.", "Designate the current position as the G30 position.", "Probe. You must have a probe set up to execute this successfully. The machine will move in the direction commanded until it reaches the commanded point or the probe is triggered.", "Move to the commanded position in the machine coordinate system. You must have already homed the machine to use this command successfully.  If homing switches are on the high side of travel (as they are on the M3 and Carve King), then the XYZ points must be positive. This is a non-modal command, meaning that the selection of the machine coordinate system only persists for the one line.", "Select the G54 coordinate system. This is a modal command, meaning that the system will remain selected until another coordinate system is addressed. Work coordinate systems are saved in GRBL memory. You can see the list of coordinate system offsets by typing $# into the command line.", "Select the G55 coordinate system. This is a modal command, meaning that the system will remain selected until another coordinate system is addressed. Work coordinate systems are saved in GRBL memory. You can see the list of coordinate system offsets by typing $# into the command line.", "Select the G56 coordinate system. This is a modal command, meaning that the system will remain selected until another coordinate system is addressed. Work coordinate systems are saved in GRBL memory. You can see the list of coordinate system offsets by typing $# into the command line.", "Select the G57 coordinate system. This is a modal command, meaning that the system will remain selected until another coordinate system is addressed. Work coordinate systems are saved in GRBL memory. You can see the list of coordinate system offsets by typing $# into the command line.", "Select the G58 coordinate system. This is a modal command, meaning that the system will remain selected until another coordinate system is addressed. Work coordinate systems are saved in GRBL memory. You can see the list of coordinate system offsets by typing $# into the command line.", "Select the G59 coordinate system. This is a modal command, meaning that the system will remain selected until another coordinate system is addressed. Work coordinate systems are saved in GRBL memory. You can see the list of coordinate system offsets by typing $# into the command line.", "Absolute positioning. In G90, the coordinate that you designate with a movement command will reference the zero point in your coordinate system. For instance, if your machine is at X50 Y50 and you command G0 X20 Y10 then the machine will move -30 in X and -40 in Y to get to X20 and Y10. See G91 for an example of incremental positioning. G90 is modal, meaning once you set it, it persists until a G91 is sent. Note that some older versions of Universal G Code Sender switch to G91 when you use the jog arrows.", "Incremental positioning. In G91, the coordinate that you designate with a movement command will reference your current position and move incrementally from there. For instance, if your machine is at X50 Y50 and you command G0 X20 Y10 then the machine will move 20 in X and 10 in Y to get to X70 and Y60. See G90 for an example of absolute positioning.", "Offset coordinate system and save parameters. Think of this as a quick, temporary coordinate system. You can use this to quickly create a zero point.", "Clears the temporary offset created with G92", "Program End", "Turn the spindle on, clockwise.", "In GRBL 0.9 and earlier, this turns the spindle on counterclockwise (if capable). In GRBL 1.0 and later, this can be used to turn on lasers without a spindle start delay.", "Turn off spindle or laser", "Tool change command. This is a valid GRBL command but most g code senders will want to ignore it. The tool number is specified by the T parameter.", "Coolant off", "Coolant on", "Coolant on", "Program End. Equivalent to M0.", "Set spindle RPM (if your spindle speed is PWM controlled) or laser intensity.", "Feed rate (units per minute). The units are determined by whether G20 or G21 is set."];

gcodeArray[2] = ["G0 X10 Y10 Z5", "G1 Y200 F800", "If at X1 Y0: G2 X0 Y-1 i-1 j0", "If at X0 Y-1: G3 X1 Y0 i0 j1", "G4 P2", "G10 L20 P1 X0 Y0 Z0", "G20", "G21", "G28", "G28.1", "G30", "G30.1", "G38.2 Z-50 F100", "G53 X-200 Y-200", "G54 X0 Y0 Z0.2", "G55", "G56", "G57", "G58", "G59", "G90 X0", "G91 Z20", "G92 X0 Y0 Z0", "G92.1", "M0", "M3", "M4", "M5", "M6 T2", "M7", "M8", "M9", "M30", "S10000", "F2000"];


/* ---------------   Caculate Button  ------------------ */
	

function calculate() { 
	"use strict";
	
	
	var machineChoice = $("input[name=Machine]:checked").val();
	var unitsChoice = $("input[name=Units]:checked").val();
	
	var cutterChoice = $("input[name=Cutter]:checked").val();
	var flutesChoice = $("input[name=Flutes]:checked").val();
	var aggressionChoice = $("input[name=Aggression]:checked").val();
	var materialChoice =  $("#Material").children("option").filter(":selected").val();
	var speedChoice = $('input#Speed').val();

			
	if (machineChoice === "0") {
		machineFactor = 0.7;
	} else { 
		machineFactor = 1;
	}
	
	if (unitsChoice === "0") {
		units = 0;
	} else {
		units = 1;
	}
	
	if (aggressionChoice === "Slow") {
		aggressionFactor = 0.5;
	} else if (aggressionChoice === "Medium") {
		aggressionFactor = 1;
	} else { 
		aggressionFactor = 1.333;
	}
	
	speedRate = Number(speedChoice);
	numberOfFlutes = Number(flutesChoice);
	

	if (materialChoice === "Aluminum") {
		feedRateInches = (Number(Aluminum[0][cutterChoice])*speedRate*numberOfFlutes);
		depthOfCut = (Number(Aluminum[1][cutterChoice])*Number(machineFactor)*Number(aggressionFactor));
		feedRate = Number(feedRateInches)*25.4;
		chipLoad = feedRate/(speedRate*numberOfFlutes);
		writeValues.call();
	} 
	
	if (materialChoice === "Hard_Plastic") {
		feedRateInches = (Number(Hard_Plastic[0][cutterChoice])*Number(speedChoice)*Number(flutesChoice));
		depthOfCut = (Number(Hard_Plastic[1][cutterChoice])*Number(machineFactor)*Number(aggressionFactor));
		feedRate = Number(feedRateInches)*25.4;
		chipLoad = feedRate/(speedRate*numberOfFlutes);
		writeValues.call();
	}
	
	if (materialChoice === "Hardwood") {
		feedRateInches = (Number(Hardwood[0][cutterChoice])*Number(speedChoice)*Number(flutesChoice));
		depthOfCut = (Number(Hardwood[1][cutterChoice])*Number(machineFactor)*Number(aggressionFactor));
		feedRate = Number(feedRateInches)*25.4;
		chipLoad = feedRate/(speedRate*numberOfFlutes);
		writeValues.call();
	}
	
	if (materialChoice === "MDF") {
		feedRateInches = (Number(MDF[0][cutterChoice])*Number(speedChoice)*Number(flutesChoice));
		depthOfCut = (Number(MDF[1][cutterChoice])*Number(machineFactor)*Number(aggressionFactor));
		feedRate = Number(feedRateInches)*25.4;
		chipLoad = feedRate/(speedRate*numberOfFlutes);
		writeValues.call();
	}
	
	if (materialChoice === "Soft_Plastic") {
		feedRateInches = (Number(Soft_Plastic[0][cutterChoice])*Number(speedChoice)*Number(flutesChoice));
		depthOfCut = (Number(Soft_Plastic[1][cutterChoice])*Number(machineFactor)*Number(aggressionFactor));
		feedRate = Number(feedRateInches)*25.4;
		chipLoad = feedRate/(speedRate*numberOfFlutes);
		writeValues.call();
	}
	
	if (materialChoice === "Softwood") {
		feedRateInches = (Number(Softwood[0][cutterChoice])*Number(speedChoice)*Number(flutesChoice));
		depthOfCut = (Number(Softwood[1][cutterChoice])*Number(machineFactor)*Number(aggressionFactor));
		feedRate = Number(feedRateInches)*25.4;
		chipLoad = feedRate/(speedRate*numberOfFlutes);
		writeValues.call();
	}
		
}


	
function writeValues(){
	"use strict";
		$('#chipLoadArea').val(parseFloat(chipLoad).toFixed(4));

		if (units === 0) {
		$('#feedRateInchesArea').val((parseFloat(feedRateInches)).toFixed(4) + " in/min");
		$('#depthOfCutArea').val(parseFloat(depthOfCut).toFixed(4) + " in");

	} else {
		$('#feedRateInchesArea').val(parseFloat((feedRateInches)*25.4).toFixed(4) + " mm/min");
		$('#depthOfCutArea').val(parseFloat((depthOfCut)*25.4).toFixed(4) + " mm");

	}
}



/* ----------------------------- Tune Page JS -----------------------*/




function getSteps(){
	"use strict";
	
	var machineChoice = $("input[name=Machine]:checked").val();

	if (machineChoice === "0") {
		xSteps = 40;
		ySteps = 40;
		$('#stepsX').val(xSteps);
		$('#stepsY').val(ySteps);
	} else { 
		xSteps = 200;
		ySteps = 200;
		$('#stepsX').val(xSteps);
		$('#stepsY').val(ySteps);
	}
}


var actualX = 100;
var expectedX = 100;
var errorX = 0;
var percentX = 0;
var correctedX = 0;
var gcodeX;

var actualY = 100;
var expectedY = 100;
var errorY = 0;
var percentY = 0;
var correctedY = 0;
var gcodeY;
 
function calculateTune() { 
	"use strict";

	var expectedX = $("input[name=expectedX]").val();
	var actualX = $("input[name=actualX]").val();
	var stepsX = $("input[name=stepsX]").val();
	var expectedY = $("input[name=expectedY]").val();
	var actualY = $("input[name=actualY]").val();
	var stepsY = $("input[name=stepsY]").val();
	
	errorX = ((actualX/expectedX)-1);
	percentX = ((actualX/expectedX)-1)*100;
	correctedX = (1-errorX)*stepsX;
	errorY = ((actualY/expectedY)-1);
	percentY = ((actualY/expectedY)-1)*100;
	correctedY = (1-errorY)*stepsY;
	
	$('#correctedX').val((parseFloat(correctedX)).toFixed(4));
	$('#errorX').val((parseFloat(percentX)).toFixed(4) + "%");
	$('#gcodeX').val("$100=" + ((parseFloat(correctedX)).toFixed(4)));
	
	$('#correctedY').val((parseFloat(correctedY)).toFixed(4));
	$('#errorY').val((parseFloat(percentY)).toFixed(4) + "%");
	$('#gcodeY').val("$101=" + ((parseFloat(correctedY)).toFixed(4)));
	
}
	



/* ----------------------------- Convert Page JS -----------------------*/


function lengthConverter(source,valNum) {
	
  "use strict";
  valNum = parseFloat(valNum);

  var inputInches = document.getElementById("inputInches");
  var inputmm = document.getElementById("inputmm");

  if (source==="inputInches") {
    inputmm.value=(valNum*25.4).toFixed(4);
  }
  if (source==="inputmm") {
    inputInches.value=(valNum/25.4).toFixed(4);

  }
}





/* ----------------------------- GCode  Page JS -----------------------*/


function gcodeDefine() {

    var flag = false;
    var gcodeInput = document.getElementById("gcodeInput").value;
    for (var i = 0; i < gcodeValues.length; i++) {
        if (gcodeInput.toUpperCase() == gcodeValues[i]) {
            gcodeEntered = i;
			flag = true;
			writeDef.call();
        }
    }
    if(flag == false) {
		alert("here");
	  	paramChosen="Undefined Code";
		notesChosen="Undefined Code";
		exampleChosen="Undefined Code"; 
		parametersArea.value = paramChosen;
		defineArea.value = notesChosen;
		exampleArea.value = exampleChosen;
    }
}


function writeDef(){
		paramChosen=(gcodeArray[0][gcodeEntered]).toString();
		notesChosen=(gcodeArray[1][gcodeEntered]).toString();
		exampleChosen=(gcodeArray[2][gcodeEntered]).toString(); 
		parametersArea.value = paramChosen;
		defineArea.value = notesChosen;
		exampleArea.value = exampleChosen;
}


/* ----------------------------- Finish Page JS -----------------------*/


function steppick()			 
{
 				 var dia = document.finish.dia.value;
				 var rad = dia / 2;
 				 var scal = document.finish.scallop.value;
				 var step = document.finish.stepover.value;
				 var ang = document.finish.angle.value;
				 var d = parseFloat(dia);
				 var sc = parseFloat(scal);
				 var st = parseFloat(step);
				 var a2 = ang * ( Math.PI / 180 ) ;
				 var a = parseFloat(a2);

				 var radsq = Math.pow(rad,2);
				 var h = rad - sc;
				 var hsq = Math.pow(h,2);
				 var wsq = radsq - hsq;
				 
				 var x = 2 * Math.sqrt(wsq) ;
				 var x2 = x * Math.cos(a)
				 var stepo = x2.toFixed(4);
				 document.finish.stepover.value = stepo;
}

function scalpick()			 
{
 				 var dia = document.finish.dia.value;
				 var rad = dia / 2;
 				 var scal = document.finish.scallop.value;
				 var step = document.finish.stepover.value;
				 var ang = document.finish.angle.value;
				 var d = parseFloat(dia);
				 var sc = parseFloat(scal);
				 var st = parseFloat(step);
				 var a2 = ang * ( Math.PI / 180 ) ;
				 var a = parseFloat(a2);

				 var radsq = Math.pow(rad,2);
				 var w  = st / ( Math.cos(a)* 2 );
				 var wsq = Math.pow(w,2);
				 var rad2sq = radsq - wsq;
				 var rad2 = Math.sqrt(rad2sq);
				 var rad3 = rad - rad2 ;
				 
				 var scalo = rad3.toFixed(4);
				 document.finish.scallop.value = scalo
				 ;
}

