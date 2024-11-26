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
  ['machinetype', true],
  ['performanceLimit', false]
];


// Wrappers for direct access to local storage -- these will get swapped with profiles laster
function saveSetting(setting, value) {
  if (setting == "machinetype") {
    setMachineButton(value)
  }
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
      printLog('Missing required setting: ' + paramName, errorcolor, "settings");
      anyissues = true;

    } else if (!val && !paramRequired) {
      printLog('Missing optional setting: ' + paramName, warncolor, "settings");
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


function selectToolhead(type) {
  console.log(this)

  console.log("Selecting toolhead type: ", type)
  if (type == 'router' && $("#hasRouter").is(':checked')) {
    // $('#hasRouter').prop('checked', false);
    $('#hasPlasma').prop('checked', false);
    $('#hasLaser').prop('checked', false);
    $('#hasPenPlotter').prop('checked', false);
    $('#hasSpindle').prop('checked', false);
  } else if (type == 'plasma' && $("#hasPlasma").is(':checked')) {
    $('#hasRouter').prop('checked', false);
    // $('#hasPlasma').prop('checked', false);
    $('#hasLaser').prop('checked', false);
    $('#hasPenPlotter').prop('checked', false);
    $('#hasSpindle').prop('checked', false);
  } else if (type == 'laser' && $("#hasLaser").is(':checked')) {
    $('#hasRouter').prop('checked', false);
    $('#hasPlasma').prop('checked', false);
    // $('#hasLaser').prop('checked', false);
    $('#hasPenPlotter').prop('checked', false);
    $('#hasSpindle').prop('checked', false);
  } else if (type == 'penPlotter' && $("#hasPenPlotter").is(':checked')) {
    $('#hasRouter').prop('checked', false);
    $('#hasPlasma').prop('checked', false);
    $('#hasLaser').prop('checked', false);
    // $('#hasPenPlotter').prop('checked', false);
    $('#hasSpindle').prop('checked', false);
  } else if (type == 'spindle' && $("#hasSpindle").is(':checked')) {
    $('#hasRouter').prop('checked', false);
    $('#hasPlasma').prop('checked', false);
    $('#hasLaser').prop('checked', false);
    $('#hasPenPlotter').prop('checked', false);
    // $('#hasSpindle').prop('checked', false);
  }

  // Default grbl parameters
  var tplscommand = `S`;
  $('#scommand').val(tplscommand);
  var tplsscale = `1000`;
  var tplsnewline = false;
  $('#scommandnewline').prop('checked', tplsnewline);
  var tplrapidcommand = `G0`;
  $('#g0command').val(tplrapidcommand);
  var tplmovecommand = `G1`;
  $('#g1command').val(tplmovecommand);

  $('#startgcode').val("");
  $('#endgcode').val("");
  $("#ihsgcode").val("");
  var startcode = `; Created by OpenBuilds CAM\nG54; Work Coordinates\nG21; mm-mode\nG90; Absolute Positioning\n`;
  var endcode = "";

  if ($("#hasRouter").is(':checked')) {
    // console.log('Add Spindle')
    startcode += "M3 S" + $('#scommandscale').val() + "; Spindle On\n"
    endcode += "M5 S0; Spindle Off\n"
    $('#scommandscale').val(1000);
    localStorage.setItem("hasRouter", true);
  } else {
    localStorage.setItem("hasRouter", false);
  }

  if ($("#hasSpindle").is(':checked')) {
    // console.log('Add Spindle')
    //startcode += "M3 S" + $('#scommandscale').val() + "; Spindle On\n"
    endcode += "M5 S0; Spindle Off\n"
    $('#scommandscale').val(24000);
    localStorage.setItem("hasSpindle", true);
  } else {
    localStorage.setItem("hasSpindle", false);
  }

  if ($("#hasPlasma").is(':checked')) {
    $("#ihsgcode").val("G38.2 Z-30 F500; Touch off Probe\nG10 L20 Z-3; Set Z Zero\n")
    $('#scommandscale').val(1000);
    var xaxis = 740
    var yaxis = 830
    var zaxis = 80
    $("#sizexmax").val(xaxis)
    $("#sizeymax").val(yaxis)
    $("#sizezmax").val(zaxis)
    localStorage.setItem("hasPlasma", true);
  } else {
    localStorage.setItem("hasPlasma", false);
  }

  if ($("#hasLaser").is(':checked')) {
    // console.log('Add Laser Dynamic')
    startcode += "M4; Dynamic Power Laser On\n"
    endcode += "M5; Laser Off\n"
    $('#scommandscale').val(1000);
    localStorage.setItem("hasLaser", true);
  } else {
    localStorage.setItem("hasLaser", false);
  }

  if ($("#hasPenPlotter").is(':checked')) {
    // console.log('Add Laser Dynamic')
    // startcode += "; Plotter does not need specific startup\n"
    endcode += "G0 X0 Y0; Move back to start Position\n"
    //$('#scommandscale').val(1000);
    localStorage.setItem("hasPenPlotter", true);
  } else {
    localStorage.setItem("hasPenPlotter", false);
  }


  if ($("#hasDust").is(':checked')) {
    // console.log('Add Misting')
    startcode += "M8; Coolant Output On - turns on Dust Extractor if wired\n"
    endcode += "M9; Coolant Output Off  - turns off Dust Extractor if wired\n"
    localStorage.setItem("hasDust", true);
  } else {
    localStorage.setItem("hasDust", false);
  }

  $('#startgcode').val(startcode)
  $('#endgcode').val(endcode)

  console.log("Start GCODE: ", startcode)
  console.log("End GCODE: ", endcode)
  console.log("Plasma Touchoff Macro: ", $("#ihsgcode").val())
}

function selectMachine(type) {
  console.log("Loading Machine Template")
  if (type == "sphinx55") {
    var xaxis = 333
    var yaxis = 325
    var zaxis = 85
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "sphinx1050") {
    var xaxis = 833
    var yaxis = 325
    var zaxis = 85
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "workbee1050") {
    var xaxis = 335
    var yaxis = 760
    var zaxis = 122
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "workbee1010") {
    var xaxis = 824
    var yaxis = 780
    var zaxis = 122
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "workbee1510") {
    var xaxis = 824
    var yaxis = 1280
    var zaxis = 122
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "acro55") {
    var xaxis = 300
    var yaxis = 300
    var zaxis = 0
    //$('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acro510") {
    var xaxis = 800
    var yaxis = 300
    var zaxis = 0
    //$('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acro1010") {
    var xaxis = 800
    var yaxis = 800
    var zaxis = 0
    //$('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acro1510") {
    var xaxis = 1300
    var yaxis = 800
    var zaxis = 0
    //$('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acro1515") {
    var xaxis = 1300
    var yaxis = 1300
    var zaxis = 0
    //$('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "acroA1") {
    var xaxis = 863
    var yaxis = 609
    var zaxis = 0
    selectToolhead('penPlotter');
    //$('#toolheadSelect').data('select').val('laserm4')
  } else if (type == "minimill") {
    var xaxis = 120
    var yaxis = 195
    var zaxis = 80
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "cbeam") {
    var xaxis = 350
    var yaxis = 280
    var zaxis = 32
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "cbeamxl") {
    var xaxis = 750
    var yaxis = 330
    var zaxis = 51
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "leadmachine1515") {
    var xaxis = 1170
    var yaxis = 1250
    var zaxis = 90
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "leadmachine1010") {
    var xaxis = 730
    var yaxis = 810
    var zaxis = 90
    //$('#toolheadSelect').data('select').val('spindleonoff')
  } else if (type == "custom") {
    var xaxis = 1000
    var yaxis = 1000
    var zaxis = 100
    //$('#toolheadSelect').data('select').val('spindleonoff')
  }
  $("#machinetype").val(type)
  $("#sizexmax").val(xaxis)
  $("#sizeymax").val(yaxis)
  $("#sizezmax").val(zaxis)
  setMachineButton(type);
};

function setMachineButton(type) {
  console.log(type)

  // Set Dropdown menu selected option in Settings modal
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
  } else if (type == "acroA1") {
    template = `<img src="images/mch/` + type + `.png"/>  OpenBuilds ACRO A1`
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
  } else if (type == "leadmachine1010") {
    template = `<img src="images/mch/` + type + `.png"/>  CUSTOM`
  } else {
    template = `<img src="images/mch/sphinx55.png"/>  Select Machine`
  }
  $('#context_toggle2').html(template);

  // Tick add-on checkboxes
  if (localStorage.getItem("hasPlasma") == 'true') {
    $("#hasPlasma").attr('checked', true)
  }
  if (localStorage.getItem("hasRouter") == 'true') {
    $("#hasRouter").attr('checked', true)
  }
  if (localStorage.getItem("hasSpindle") == 'true') {
    $("#hasSpindle").attr('checked', true)
  }
  if (localStorage.getItem("hasDust") == 'true') {
    $("#hasDust").attr('checked', true)
  }
  if (localStorage.getItem("hasLaser") == 'true') {
    $("#hasLaser").attr('checked', true)
  }
  if (localStorage.getItem("hasPenPlotter") == 'true') {
    $("#hasPenPlotter").attr('checked', true)
  }

  // workaround for Lead Plasma specifically (not quite a modular machine, has its own picture on front page overlay)
  if (type == "leadmachine1010" && localStorage.getItem("hasPlasma") == 'true') {
    $('#overlayimg').html(`<img src="images/mch/leadmachine1010plasma.png" style="max-width:100%; max-height:100%;"/>`)
  } else {
    $('#overlayimg').html(`<img src="images/mch/` + type + `.png" style="max-width:100%; max-height:100%;"/>`)
  }
};

$(document).ready(function() {
  var modal = `
  <!-- Settings Modal -->

  <div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="settingsmodal" data-width="830" data-to-top="true">
    <div class="dialog-title">Application Settings</div>
    <div class="dialog-content" style="max-height: calc(100vh - 200px);overflow-y: auto; overflow-x: hidden;">
      <form>

        <div>
          <center><h6>Welcome to OpenBuilds CAM</h6> Let us help you get set up!</center>
        </div>

          <ul class="step-list mb-3">

            <li>
              <h6>Select your Machine<br><small>Tell us what machine you have?</small></h6>
              <div>
                <a style="width: 100%;" class="button dropdown-toggle bd-openbuilds outline" id="context_toggle2"><img src="images/mch/sphinx55.png"/> Select Machine</a>
                <ul class="ribbon-dropdown" data-role="dropdown" data-duration="100">
                    <li>
                      <a href="#" class="dropdown-toggle"><img src="images/mch/acro55.png" width="16px"/> OpenBuilds ACRO</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('acro55');"><a href="#"><img src="images/mch/acro55.png" width="16px"/>  OpenBuilds ACRO 55</a></li>
                        <li onclick="selectMachine('acro510');"><a href="#"><img src="images/mch/acro510.png" width="16px"/>  OpenBuilds ACRO 510</a></li>
                        <li onclick="selectMachine('acro1010');"><a href="#"><img src="images/mch/acro1010.png" width="16px"/>  OpenBuilds ACRO 1010</a></li>
                        <li onclick="selectMachine('acro1510');"><a href="#"><img src="images/mch/acro1510.png" width="16px"/>  OpenBuilds ACRO 1510</a></li>
                        <li onclick="selectMachine('acro1515');"><a href="#"><img src="images/mch/acro1515.png" width="16px"/>  OpenBuilds ACRO 1515</a></li>
                        <li class="divider"></li>
                        <li onclick="selectMachine('acroA1');"><a href="#"><img src="images/mch/acroA1.png" width="16px"/>  OpenBuilds ACRO A1</a></li>
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
                    <li><a href="#" onclick="selectMachine('custom');"><img src="images/mch/custom.png" width="16px"/>  Custom Machine</a></li>

                  </ul>
                <input type="hidden" class="form-control form-control-sm" id="machinetype" value="" >
              </div>
            </li>

            <li>
              <h6>Add-Ons Installed<br><small>Telling us what kind of attachments the machine has, allows us to setup the GCODE to control these devices correctly from within the job</small></h6>

              <ul class="image-checkbox-ul">
                <li>
                  <input type="checkbox" onchange="selectToolhead('router')" id="hasRouter"  />
                  <label for="hasRouter"><img src="./images/router11.png" /></label>
                  <div class="image-checkbox-text">RoutER11 with IoT Relay</div>
                </li>
                <li>
                  <input type="checkbox" onchange="selectToolhead('plasma')" id="hasPlasma" />
                  <label for="hasPlasma"><img src="./images/leadplasma.png" /></label>
                  <div class="image-checkbox-text">LEAD 1010 Plasma Add-On</div>
                </li>
                <li>
                  <input type="checkbox" onchange="selectToolhead('laser')" id="hasLaser" />
                  <label for="hasLaser"><img src="./images/laser.png" /></label>
                  <div class="image-checkbox-text">Laser Diode Module</div>
                </li>
                <li>
                  <input type="checkbox" onchange="selectToolhead('penPlotter')" id="hasPenPlotter" />
                  <label for="hasPenPlotter"><img src="./images/plotter.png" /></label>
                  <div class="image-checkbox-text">SCRIBE<br>Pen Lifter</div>
                </li>
                <li>
                  <input type="checkbox" onchange="selectToolhead('spindle')" id="hasSpindle" />
                  <label for="hasSpindle"><img src="./images/vfd.png" /></label>
                  <div class="image-checkbox-text">Variable Speed Spindle</div>
                </li>
                <li>
                  <input type="checkbox" onchange="selectToolhead('dust')" id="hasDust" />
                  <label for="hasDust"><img src="./images/dustshoe.png" /></label>
                  <div class="image-checkbox-text">Dust Shoe with Extractor</div>
                </li>
              </ul>

            </li>

            <li>
              <h6>Advanced Settings<br><small>If you have any custom requirements, please customise the settings in the Advanced Settings section</small></h6>

              <button class="button" id="collapse_toggle_2">Show Advanced Settings</button>
              <div class="pos-relative">
                  <div data-role="collapse"
                       data-toggle-element="#collapse_toggle_2" data-collapsed="true">


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
                               <input type="number" data-role="input" data-clear-button="false" class="form-control form-control-sm" id="scommandscale" value="1000" data-prepend="0 to" step="any">
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


                  </div>
              </div>


            </li>
          </ul>
        </form>
    </div>
    <div class="dialog-actions">

      <button class="button secondary outline js-dialog-close">Cancel</button>
      <button id="savesettings" type="button" class="button js-dialog-close success">Save</button>
    </div>
  </div>
  <!-- #settingsmodal -->
  `
  $("body").append(modal);
});