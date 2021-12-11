function ConfirmDelete() {
  var x = confirm("Are you sure you want to restore to factory defaults?");
  if (x) {
    window.localStorage.clear()
    return true;
  } else {
    return false;
  }
}

function initLocalStorage() {
  var settingsOpen = document.getElementById('jsonFile');
  settingsOpen.addEventListener('change', restoreSettingsLocal, false);
  $('#savesettings').on('click', function() {
    saveSettingsLocal();
  });
  checkSettingsLocal();
}

// FIXME
// A way to access all of the settings
// $("#settings-menu-panel input, #settings-menu-panel textarea, #settings-menu-panel select").each(function() {console.log(this.id + ": " + $(this).val())});

localParams = [
  ['sizexmax', true],
  ['sizeymax', true],
  ['sizezmax', true],
  ['startgcode', false],
  ['laseron', false],
  ['laseroff', false],
  ['endgcode', false],
  ['g0command', true],
  ['g1command', true],
  ['scommandnewline', true],
  ['scommand', true],
  ['scommandscale', true],
  ['ihsgcode', false],
  ['firmwaretype', true],
  ['machinetype', true],
  ['performanceLimit', false]
];


// Wrappers for direct access to local storage -- these will get swapped with profiles laster
function saveSetting(setting, value) {
  localStorage.setItem(setting, value);
};

function loadSetting(setting) {
  return localStorage.getItem(setting);
};


function saveSettingsLocal() {
  console.group("Saving settings to LocalStorage");
  for (i = 0; i < localParams.length; i++) {
    var localParam = localParams[i];
    var paramName = localParam[0];
    if (paramName == 'sizexmax' || paramName == 'sizeymax') {
      var newval = $('#' + paramName).val()
      var oldval = loadSetting(paramName);
      if (oldval != newval) {
        redrawGrid()
      }
    }
    if (paramName == 'scommandnewline') {
      var val = $('#' + paramName).is(":checked");
    } else if (paramName == 'performanceLimit') {
      var val = $('#' + paramName).is(":checked");
    } else {
      var val = $('#' + paramName).val(); // Read the value from form
    }
    printLog('Saving: ' + paramName + ' : ' + val, successcolor);
    saveSetting(paramName, val);
  }
  printLog('<b>Saved Settings: <br>NB:</b> Please refresh page for settings to take effect', errorcolor, "settings");
  // $("#settingsmodal").modal("hide");
  console.groupEnd();
};

function loadSettingsLocal() {
  // console.log("Loading settings from LocalStorage")
  for (i = 0; i < localParams.length; i++) {
    var localParam = localParams[i];
    var paramName = localParam[0];
    var val = loadSetting(paramName);

    if (val) {
      // console.log('Loading: ' + paramName + ' : ' + val);
      if (paramName == 'firmwaretype') {
        setBoardButton(val)
      }
      if (paramName == 'machinetype') {
        setMachineButton(val)
      }
      if (paramName == 'scommandnewline') {
        $('#' + paramName).prop('checked', parseBoolean(val));
        // console.log('#' + paramName + " is set to " + val)
      } else if (paramName == 'performanceLimit') {
        $('#' + paramName).prop('checked', parseBoolean(val));
        // console.log('#' + paramName + " is set to " + val)
      } else {
        $('#' + paramName).val(val); // Set the value to Form from Storage
      }
    } else {
      // console.log('Not in local storage: ' +  paramName);
    }
  }
  // console.groupEnd();
};

function backupSettingsLocal() {
  var json = JSON.stringify(localStorage)
  var blob = new Blob([json], {
    type: "application/json"
  });
  invokeSaveAsDialog(blob, 'settings-backup.json');
};

function checkSettingsLocal() {
  var anyissues = false;
  // printLog('<b>Checking for configuration :</b><p>', msgcolor, "settings");
  for (i = 0; i < localParams.length; i++) {
    var localParam = localParams[i];
    var paramName = localParam[0];
    var paramRequired = localParam[1];
    var val = $('#' + localParams[i]).val(); // Read the value from form

    if (!val && paramRequired) {
      // printLog('Missing required setting: ' + paramName, errorcolor, "settings");
      anyissues = true;

    } else if (!val && !paramRequired) {
      // printLog('Missing optional setting: ' + paramName, warncolor, "settings");
    } else {
      // printLog('Found setting: ' + paramName + " : " + val, msgcolor, "settings");
    }
  }


  if (anyissues) {
    // console.log(`<b>MISSING CONFIG: You need to configure your setup. </b>. Click Edit, <a href='#' onclick='Metro.dialog.open('#settingsmodal');'><kbd>Settings <i class="fa fa-cogs"></i></kbd></a> on the top menu bar, and work through all the options`, errorcolor, "settings");
    // $("#settingsmodal").modal("show");
    setTimeout(function() {
      Metro.dialog.open('#settingsmodal');
    }, 1000)
    $('#checkLocalSettingsError').show();
  } else {
    if (!localStorage.getItem('hideChangelog')) {
      getChangelog();
    }
    $('#checkLocalSettingsError').hide();
  }


};

function restoreSettingsLocal(evt) {
  // console.log('Inside Restore');
  var input, file, fr;

  console.log('event ', evt)
  file = evt.target.files[0];
  fr = new FileReader();
  fr.onload = loadSettings;
  fr.readAsText(file);
};

function loadSettings(e) {
  lines = e.target ? e.target.result : e;
  var o = JSON.parse(lines);
  for (var property in o) {
    if (o.hasOwnProperty(property)) {
      saveSetting(property, o[property]);
    } else {
      // I'm not sure this can happen... I want to log this if it does!
      // console.log("Found a property " + property + " which does not belong to itself.");
    }
  }
  loadSettingsLocal();
};

window.parseBoolean = function(string) {
  var bool;
  bool = (function() {
    switch (false) {
      case string.toLowerCase() !== 'true':
        return true;
      case string.toLowerCase() !== 'false':
        return false;
    }
  })();
  if (typeof bool === "boolean") {
    return bool;
  }
  return void 0;
};


// Settings Dialog

function selectBoard(type) {
  console.log("Loading Firmware Template")
  if (type == "grbl") {
    template = `<img src="images/brd/` + type + `.png"/>  Generic GRBL`
    var tplscommand = `S`;
    var tplsscale = `1000`;
    var tplsnewline = false;
    var tplrapidcommand = `G0`;
    var tplmovecommand = `G1`;

  } else if (type == "xpro") {
    template = `<img src="images/brd/` + type + `.png"/>  Spark Concepts xPro`
    var tplscommand = `S`;
    var tplsscale = `1000`;
    var tplsnewline = false;
    var tplrapidcommand = `G0`;
    var tplmovecommand = `G1`;

  } else if (type == "blackbox") {
    template = `<img src="images/brd/` + type + `.png"/>  Spark Concepts xPro`
    var tplscommand = `S`;
    var tplsscale = `1000`;
    var tplsnewline = false;
    var tplrapidcommand = `G0`;
    var tplmovecommand = `G1`;

  } else if (type == "smoothie") {
    template = `<img src="images/brd/` + type + `.png"/>  Smoothieboard`
    var tplscommand = `S`;
    var tplsscale = `1`;
    var tplsnewline = false;
    var tplrapidcommand = `G0`;
    var tplmovecommand = `G1`;

  } else {
    template = `<img src="images/brd/grbl.png"/>Select Controller`
  }
  $('#g0command').val(tplrapidcommand);
  $('#g1command').val(tplmovecommand);
  $('#scommandnewline').prop('checked', tplsnewline);
  $('#scommand').val(tplscommand);
  $('#scommandscale').val(tplsscale);
  $("#firmwaretype").val(type)

  setBoardButton(type)

  controller = type;
};

function setBoardButton(type) {
  if (type == "grbl") {
    template = `<img src="images/brd/` + type + `.png"/>  Generic GRBL`
  } else if (type == "xpro") {
    template = `<img src="images/brd/` + type + `.png"/>  Spark Concepts xPro`
  } else if (type == "blackbox") {
    template = `<img src="images/brd/` + type + `.png"/>  OpenBuilds BlackBox 4X`
  } else if (type == "smoothie") {
    template = `<img src="images/brd/` + type + `.png"/>  Smoothieboard`
  } else {
    template = `<img src="images/brd/grbl.png"/>Select Controller`
  }
  $('#context_toggle').html(template);
};


var controller = ""

function selectToolhead() {
  // console.log('selecttool')
  var toolArr = $("#toolheadSelect").val()
  if (toolArr) {
    $('#startgcode').val("")
    $('#endgcode').val("")
    var startcode = "G54; Work Coordinates\nG21; mm-mode\nG90; Absolute Positioning\n";
    var endcode = "";
    for (i = 0; i < toolArr.length; i++) {
      var type = toolArr[i]
      if (type == 'spindleonoff') {
        // console.log('Add Spindle')
        startcode += "M3 S" + $('#scommandscale').val() + "; Spindle On\n"
        endcode += "M5 S0; Spindle Off\n"
      }

      if (type == 'plasma') {
        $("#ihsgcode").val("; Machine does not support touch-off")
      }

      if (type == 'plasmaihs') {
        $("#ihsgcode").val("G38.2 Z-30 F100; Probe\nG10 L20 Z0; Set Z Zero\n")
      }




      if (type == 'laserm3') {
        // console.log('Add Laser Constant')
        startcode += "M3; Constant Power Laser On\n"
        endcode += "M5; Laser Off\n"
      }
      if (type == 'laserm4') {
        // console.log('Add Laser Dynamic')
        startcode += "M4; Dynamic Power Laser On\n"
        endcode += "M5; Laser Off\n"
      }
      if (type == 'misting') {
        // console.log('Add Misting')
        startcode += "M8; Coolant On\n"
        endcode += "M9; Coolant Off\n"
      }
      if (type == 'plotter') {
        // console.log('Add Plotter')
        startcode += "; Plotter Mode Active\n"
        endcode += "; Plotter Mode Complete\n"
      }
    }
    $('#startgcode').val(startcode)
    $('#endgcode').val(endcode)
  } else {
    $('#startgcode').val("")
    $('#endgcode').val("")
  }
}

function selectMachine(type) {
  console.log("Loading Machine Template")
  if (type == "sphinx55") {
    var xaxis = 333
    var yaxis = 325
    var zaxis = 85
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "sphinx1050") {
    var xaxis = 833
    var yaxis = 325
    var zaxis = 85
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "workbee1050") {
    var xaxis = 335
    var yaxis = 760
    var zaxis = 122
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "workbee1010") {
    var xaxis = 824
    var yaxis = 780
    var zaxis = 122
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "workbee1510") {
    var xaxis = 824
    var yaxis = 1280
    var zaxis = 122
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "acro55") {
    var xaxis = 300
    var yaxis = 300
    var zaxis = 0
    $('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acro510") {
    var xaxis = 800
    var yaxis = 300
    var zaxis = 0
    $('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acro1010") {
    var xaxis = 800
    var yaxis = 800
    var zaxis = 0
    $('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acro1510") {
    var xaxis = 1300
    var yaxis = 800
    var zaxis = 0
    $('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acro1515") {
    var xaxis = 1300
    var yaxis = 1300
    var zaxis = 0
    $('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acro55pen") {
    var xaxis = 300
    var yaxis = 300
    var zaxis = 0
    $('#toolheadSelect').data('select').val('plotter')
  } else if (type == "acro510pen") {
    var xaxis = 800
    var yaxis = 300
    var zaxis = 0
    $('#toolheadSelect').data('select').val('plotter')
  } else if (type == "acro1010pen") {
    var xaxis = 800
    var yaxis = 800
    var zaxis = 0
    $('#toolheadSelect').data('select').val('plotter')
  } else if (type == "acro1510pen") {
    var xaxis = 1300
    var yaxis = 800
    var zaxis = 0
    $('#toolheadSelect').data('select').val('plotter')
  } else if (type == "acro1515pen") {
    var xaxis = 1300
    var yaxis = 1300
    var zaxis = 0
    $('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "minimill") {
    var xaxis = 120
    var yaxis = 195
    var zaxis = 80
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "cbeam") {
    var xaxis = 350
    var yaxis = 280
    var zaxis = 32
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "cbeamxl") {
    var xaxis = 750
    var yaxis = 330
    var zaxis = 51
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "leadmachine1515") {
    var xaxis = 1170
    var yaxis = 1250
    var zaxis = 90
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "leadmachine1010") {
    var xaxis = 730
    var yaxis = 810
    var zaxis = 90
    $('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "leadmachine1010laser") {
    var xaxis = 730
    var yaxis = 810
    var zaxis = 90
    $('#toolheadSelect').data('select').val('laserm4')
  }
  $("#machinetype").val(type)
  $("#sizexmax").val(xaxis)
  $("#sizeymax").val(yaxis)
  $("#sizezmax").val(zaxis)
  selectToolhead();
  setMachineButton(type);
};

function setMachineButton(type) {
  console.log(type)
  if (type == "sphinx55") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Sphinx 55`
  } else if (type == "sphinx1050") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Sphinx 1050`
  } else if (type == "workbee1050") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Workbee 1050`
  } else if (type == "workbee1010") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Workbee 1010`
  } else if (type == "workbee1510") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Workbee 1510`
  } else if (type == "sphinx1050") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Sphinx 1050`
  } else if (type == "sphinx1050") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Sphinx 1050`
  } else if (type == "acro55") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 55`
  } else if (type == "acro510") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 510`
  } else if (type == "acro1010") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 1010`
  } else if (type == "acro1510") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 1510`
  } else if (type == "acro1515") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 1515`
  } else if (type == "acro55pen") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 55 with Servo Pen Attachment`
  } else if (type == "acro510pen") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 510 with Servo Pen Attachment`
  } else if (type == "acro1010pen") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 1010 with Servo Pen Attachment`
  } else if (type == "acro1510pen") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 1510 with Servo Pen Attachment`
  } else if (type == "acro1515pen") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds Acro 1515 with Servo Pen Attachment`
  } else if (type == "minimill") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds MiniMill`
  } else if (type == "cbeam") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds C-Beam Machine`
  } else if (type == "cbeamxl") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds C-Beam XL`
  } else if (type == "leadmachine1515") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds LEAD 1515`
  } else if (type == "leadmachine1010") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds LEAD 1010`
  } else if (type == "leadmachine1010laser") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds LEAD 1010 with Laser Module`
  } else {
    template = `<img src="images/mch/sphinx55.png"/>  Select Machine`
  }
  $('#context_toggle2').html(template);
};

$(document).ready(function() {
  var modal = `
  <!-- Settings Modal -->

  <div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="settingsmodal" data-width="730" data-to-top="true">
    <div class="dialog-title">Application Settings</div>
    <div class="dialog-content" style="max-height: calc(100vh - 200px);overflow-y: auto; overflow-x: hidden;">
        <form>

        <div id="checkLocalSettingsError">
          <center><h6>Welcome to OpenBuilds CAM</h6> Please configure the application below</center>
        </div>

          <ul class="step-list">

            <li id="installDriversOnSettingspage">
              <h6 class="fg-grayBlue">Install CONTROL<br><small>Used to Connect to and control you machine. If you already have it installed, please run the application, or</small></h6>
              <hr class="bg-grayBlue">
              <div>
              <nav data-role="ribbonmenu">
                <ul class="tabs-holder">
                  <li><a href="#tab-win2"><i class="fab fa-windows"></i> Windows</a></li>
                  <li><a href="#tab-mac2"><i class="fab fa-apple"></i> Mac</a></li>
                  <li><a href="#tab-linux2"><i class="fab fa-linux"></i> Linux</a></li>
                </ul>

                <div class="content-holder">
                  <div class="section" id="tab-win2">
                    <div id="downloadDrivers" class="info-button bg-green fg-white bd-green">
                      <a href="#" onclick="downloadDrivers('win')" class="button"><span class="fab fa-windows"></span> Windows CONTROL (EXE)</a>
                      <a href="#" class="info omdavailversion">v1.0.0</a>
                    </div><br>
                  </div>
                  <div class="section" id="tab-mac2">
                    <div id="downloadDrivers" class="info-button bg-green fg-white bd-green">
                      <a href="#" onclick="downloadDrivers('mac')" class="button"><span class="fab fa-apple"></span> MacOS CONTROL (DMG)</a>
                      <a href="#" class="info omdavailversion">v1.0.0</a>
                    </div><br>
                  </div>
                  <div class="section" id="tab-linux2">
                    <div>
                      <div id="downloadDrivers" class="info-button bg-green fg-white bd-green">
                        <a href="#" onclick="downloadDrivers('deb')" class="button"><span class="fab fa-linux"></span> Linux CONTROL (DEB)</a>
                        <a href="#" class="info omdavailversion">v1.0.0</a>
                      </div>

                        <div id="downloadDrivers" class="info-button bg-green fg-white bd-green">
                          <a href="#" onclick="downloadDrivers('appimage')" class="button"><span class="fab fa-linux"></span> Linux CONTROL (AppImage)</a>
                          <a href="#" class="info omdavailversion">v1.0.0</a>
                        </div>
                    </div>
                  </div>
                </div>
              </nav>
              </div>
            </li>

            <li>
              <h6 class="fg-grayBlue">Select your controller<br><small>Sets approximate defaults below, which should suffice for most users</small></h6>
              <hr class="bg-grayBlue">
              <div>
                <a style="width: 100%;" class="button dropdown-toggle secondary outline" id="context_toggle"><img src="images/brd/grbl.png"/> Select Controller</a>
                <ul class="d-menu border bd-gray" data-role="dropdown" data-toggle-element="#context_toggle">
                <li onclick="selectBoard('blackbox');"><a href="#"><img src="images/brd/blackbox.png"/>  OpenBuilds BlackBox 4X</a></li>
                  <li onclick="selectBoard('xpro');"><a href="#"><img src="images/brd/xpro.png"/>  Spark Concepts xPro</a></li>
                  <li onclick="selectBoard('smoothie');"><a href="#"><img src="images/brd/smoothie.png"/>  Smoothieboard</a></li>
                  <li class="divider"></li>
                  <li onclick="selectBoard('grbl');"><a href="#"><img src="images/brd/grbl.png"/>  Generic GRBL</a></li>
                </ul>
                <input type="hidden" class="form-control form-control-sm" id="firmwaretype" value="" >
              </div>
            </li>

            <li>
              <h6 class="fg-grayBlue">Select your Machine<br><small>Sets approximate defaults below, which should suffice for most users</small></h6>
              <hr class="bg-grayBlue">
              <div>
                <a style="width: 100%;" class="button dropdown-toggle secondary outline" id="context_toggle2"><img src="images/mch/sphinx55.png"/> Select Machine</a>
                <ul class="ribbon-dropdown" data-role="dropdown" data-duration="100">
                    <li>
                      <a href="#" class="dropdown-toggle"><img src="images/mch/acro55.png" width="16px"/> OpenBuilds Acro</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('acro55');"><a href="#"><img src="images/mch/acro55.png" width="16px"/>  OpenBuilds Acro 55</a></li>
                        <li onclick="selectMachine('acro510');"><a href="#"><img src="images/mch/acro510.png" width="16px"/>  OpenBuilds Acro 510</a></li>
                        <li onclick="selectMachine('acro1010');"><a href="#"><img src="images/mch/acro1010.png" width="16px"/>  OpenBuilds Acro 1010</a></li>
                        <li onclick="selectMachine('acro1510');"><a href="#"><img src="images/mch/acro1510.png" width="16px"/>  OpenBuilds Acro 1510</a></li>
                        <li onclick="selectMachine('acro1515');"><a href="#"><img src="images/mch/acro1515.png" width="16px"/>  OpenBuilds Acro 1515</a></li>
                      </ul>
                    </li>
                    <li>
                      <a href="#" class="dropdown-toggle"><img src="images/mch/acro55.png" width="16px"/> OpenBuilds Acro with Servo Pen Attachment</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('acro55pen');"><a href="#"><img src="images/mch/acro55.png" width="16px"/>  OpenBuilds Acro 55  with Servo Pen Attachment</a></li>
                        <li onclick="selectMachine('acro510pen');"><a href="#"><img src="images/mch/acro510.png" width="16px"/>  OpenBuilds Acro 510  with Servo Pen Attachment</a></li>
                        <li onclick="selectMachine('acro1010pen');"><a href="#"><img src="images/mch/acro1010.png" width="16px"/>  OpenBuilds Acro 1010  with Servo Pen Attachment</a></li>
                        <li onclick="selectMachine('acro1510pen');"><a href="#"><img src="images/mch/acro1510.png" width="16px"/>  OpenBuilds Acro 1510  with Servo Pen Attachment</a></li>
                        <li onclick="selectMachine('acro1515pen');"><a href="#"><img src="images/mch/acro1515.png" width="16px"/>  OpenBuilds Acro 1515  with Servo Pen Attachment</a></li>
                      </ul>
                    </li>
                    <li>
                      <a href="#" class="dropdown-toggle"><img src="images/mch/cbeam.png" width="16px"/>  OpenBuilds C-Beam Machine</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('cbeam');"><a href="#"><img src="images/mch/cbeam.png" width="16px"/>  OpenBuilds C-Beam Machine</a></li>
                        <li onclick="selectMachine('cbeamxl');"><a href="#"><img src="images/mch/cbeamxl.png" width="16px"/>  OpenBuilds C-Beam XL</a></li>
                      </ul>
                    </li>
                    <li>
                      <a href="#" class="dropdown-toggle"><img src="images/mch/leadmachine1010.png" width="16px"/>  OpenBuilds Lead Machine</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('leadmachine1010');"><a href="#"><img src="images/mch/leadmachine1010.png" width="16px"/>OpenBuilds LEAD 1010</a></li>
                        <li onclick="selectMachine('leadmachine1010laser');"><a href="#"><img src="images/mch/leadmachine1010laser.png" width="16px"/>OpenBuilds LEAD 1010 with Laser Module</a></li>
                        <li onclick="selectMachine('leadmachine1515');"><a href="#"><img src="images/mch/leadmachine1515.png" width="16px"/>OpenBuilds LEAD 1515</a></li>

                      </ul>
                    </li>
                    <li><a href="#" onclick="selectMachine('minimill');"><img src="images/mch/minimill.png" width="16px"/>  OpenBuilds MiniMill</a></li>

                    <li>
                      <a href="#" class="dropdown-toggle"><img src="images/mch/sphinx55.png" width="16px"/>  OpenBuilds Sphinx</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('sphinx55');"><a href="#"><img src="images/mch/sphinx55.png" width="16px"/>  OpenBuilds Sphinx 55</a></li>
                        <li onclick="selectMachine('sphinx1050');"><a href="#"><img src="images/mch/sphinx1050.png" width="16px"/>  OpenBuilds Sphinx 1050</a></li>
                      </ul>
                    </li>
                    <li>
                      <a href="#" class="dropdown-toggle"><img src="images/mch/workbee1010.png" width="16px"/>  OpenBuilds WorkBee</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('workbee1010');"><a href="#"><img src="images/mch/workbee1010.png" width="16px"/>  OpenBuilds WorkBee 1010</a></li>
                        <li onclick="selectMachine('workbee1050');"><a href="#"><img src="images/mch/workbee1050.png" width="16px"/>  OpenBuilds WorkBee 1050</a></li>
                        <li onclick="selectMachine('workbee1510');"><a href="#"><img src="images/mch/workbee1510.png" width="16px"/>  OpenBuilds WorkBee 1510</a></li>
                      </ul>
                    </li>

                  </ul>
                <input type="hidden" class="form-control form-control-sm" id="machinetype" value="" >
              </div>
            </li>

            <li>
              <h6 class="fg-grayBlue">Select your Tool initialization<br><small>Sets approximate defaults below, which should suffice for most users</small></h6>
              <hr class="bg-grayBlue">
              <div>
                <select data-filter="false" data-on-change="selectToolhead();" id="toolheadSelect" data-role="select" title="" multiple class="secondary">

                      <option data-template="<span class='icon fas fas fa-tag' data-fa-transform='rotate-225'></span> $1" value="spindleonoff">Turn Spindle on and Off (M3/M5)</option>
                      <option data-template="<span class='icon fas fa-broom' data-fa-transform='rotate--45'></span> $1" value="plasma">Turn Plasma on and Off</option>
                      <option data-template="<span class='icon fas fa-broom' data-fa-transform='rotate--45'></span> $1" value="plasmaihs">Turn Plasma on and Off: With Touch Off</option>
                      <option data-template="<span class='icon fas fa-circle'></span> $1" value="laserm3">Turn Laser on and Off: Constant Power (M3/M5)</option>
                      <option data-template="<span class='icon fas fa-adjust'></span> $1" value="laserm4">Turn Laser on and Off: Dynamic  Power (M4/M5)</option>
                      <option data-template="<span class='icon fas fa-edit'></span> $1" value="plotter">Plotter Pen Up/Down (M3S<min> / M3S<max>)</option>
                      <option data-template="<span class='icon fas fa-tint'></span> $1" value="misting">Enable Misting/Cooling: (M8/M9)</option>

                </select>
              </div>
            </li>

            <li>
              <h6 class="fg-grayBlue">Customise Defaults<br><small>From your machine and controller choice above we have prepopulated the settings below.  If you have any custom requirements, please customise the settings below</small></h6>
              <hr class="bg-grayBlue">
              <div>

                <div class="row mb-2">
                    <label class="cell-sm-6">X-Axis Length</label>
                    <div class="cell-sm-6">
                      <input type="number" data-role="input" data-clear-button="false" class="form-control " id="sizexmax" value="200" data-append="mm" step="any">
                    </div>
                </div>

                <div class="row mb-2">
                    <label class="cell-sm-6">Y-Axis Length</label>
                    <div class="cell-sm-6">
                      <input type="number" data-role="input" data-clear-button="false" class="form-control " id="sizeymax" value="200" data-append="mm" step="any">
                    </div>
                </div>

                <div class="row mb-2">
                    <label class="cell-sm-6">Z-Axis Length</label>
                    <div class="cell-sm-6">
                      <input type="number" data-role="input" data-clear-button="false" class="form-control " id="sizezmax" value="100" data-append="mm" step="any">
                    </div>
                </div>

                <div class="row mb-2">
                    <label class="cell-sm-6">Spindle / Laser / Plasma Command</label>
                    <div class="cell-sm-6">
                        <input type="text" data-role="input" data-clear-button="false" class="form-control form-control-sm" id="scommand" value="S" >
                    </div>
                </div>

                <div class="row mb-2">
                    <label class="cell-sm-6">Power/Speed Scale</label>
                    <div class="cell-sm-6">
                      <input type="number" data-role="input" data-clear-button="false" class="form-control form-control-sm" id="scommandscale" value="1" data-prepend="0 to" step="any">
                    </div>
                </div>

                <div class="row mb-2">
                    <label class="cell-sm-6">Power/Speed on new-line</label>
                    <div class="cell-sm-6">
                          <input data-role="checkbox" type="checkbox" id="scommandnewline" value="option1">
                    </div>
                </div>

                <div class="row mb-2">
                    <label class="cell-sm-6">Rapid Move Command</label>
                    <div class="cell-sm-6">
                        <input type="text" data-role="input" data-clear-button="false" class="form-control form-control-sm" id="g0command" value="G0" >
                    </div>
                </div>

                <div class="row mb-2">
                    <label class="cell-sm-6">Linear Move Command</label>
                    <div class="cell-sm-6">
                        <input type="text" data-role="input" data-clear-button="false" class="form-control form-control-sm" id="g1command" value="G1" >
                    </div>
                </div>

                <div class="row mb-2">
                    <label class="cell-sm-6">Start G-Code</label>
                    <div class="cell-sm-6">
                      <textarea id="startgcode" data-role="textarea" data-auto-size="true" data-clear-button="false" placeholder="For example M4 G28 G90 M80 - supports multi line commands"></textarea>
                    </div>
                </div>

                <div class="row mb-2">
                    <label class="cell-sm-6">End G-Code</label>
                    <div class="cell-sm-6">
                      <textarea id="endgcode" data-role="textarea" data-auto-size="true" data-clear-button="false" placeholder="For example M5 M81 G28 - supports multi line commands"></textarea>
                    </div>
                </div>

              </div>
            </li>

            <li>
              <h6 class="fg-grayBlue">Advanced<br><small>Change application behaviour to suit your specific needs</small></h6>
              <hr class="bg-grayBlue">
              <div>

                <div class="row mb-2">
                    <label class="cell-sm-6">Plasma: Touch Off Sequence</label>
                    <div class="cell-sm-6">
                      <textarea id="ihsgcode" data-role="textarea" contenteditable="true" data-auto-size="true" data-clear-button="false" placeholder="G0 + clearanceHeight + \nG38.2 Z-30 F100\nG10 L20 P1 Z0"></textarea>
                    </div>
                </div>

                <div class="row mb-0">
                    <label class="cell-sm-6">Performance: Disable Tool-Width Preview<br>
                    <span class="text-small">
                      This can speed up toolpath calculations, but will
                      disable the toolpath-width preview: You'll only see
                      the centerline of the toolpath, not the width of the
                      cut.  Helps slow PCs work better
                    </span>
                    </label>
                    <div class="cell-sm-6">
                        <input data-role="checkbox" type="checkbox" id="performanceLimit" value="option1">
                    </div>
                </div>


              </div>
            </li>

          </form>

    </div>
    <div class="dialog-actions">
      <button id="backup" class="button secondary outline btn-file" data-tooltip="tooltip" data-placement="bottom" title="Take a backup" onclick="backupSettingsLocal()">
        <i class="fa fa-download fa-fw"></i> Backup Settings
      </button>
      <span id="restore" href="#" class="button secondary outline btn-file" data-tooltip="tooltip" data-placement="bottom" title="Open a backup settings file">
        <i class="fa fa-upload  fa-fw"></i> Restore from file <input id="jsonFile" type="file" accept=".json" />
      </span>
      <button class="button alert outline btn-file" data-tooltip="tooltip" data-placement="bottom" title="Reset all settings to default" onclick="ConfirmDelete()">
        <i class="fa fa-exclamation-triangle fa-fw"></i> Factory Reset
      </button>
      <button class="button secondary outline js-dialog-close">Cancel</button>
      <button id="savesettings" type="button" class="button js-dialog-close success">Save</button>
    </div>
  </div>
  <!-- #settingsmodal -->
  `
  $("body").append(modal);
  selectToolhead();
});