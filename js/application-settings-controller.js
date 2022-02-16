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
  ['unitSwitch', true],
  ['sizexmax', true],
  ['sizeymax', true],
  ['sizezmax', true],
  ['startgcode', false],
  ['endgcode', false],
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
    if (paramName == 'scommandnewline') {
      var val = $('#' + paramName).is(":checked");
    } else if (paramName == 'performanceLimit') {
      var val = $('#' + paramName).is(":checked");
    } else if (paramName == 'unitSwitch') {
      var val = $('#' + paramName).is(":checked");
    } else {
      var val = $('#' + paramName).val(); // Read the value from form
    }
    printLog('Saving: ' + paramName + ' : ' + val, successcolor);
    saveSetting(paramName, val);
    redrawGrid()
   
  }
 // printLog('<b>Saved Settings: <br>NB:</b> Please refresh page for settings to take effect', errorcolor, "settings");
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
        selectMachine(val); 
      } else if (paramName == 'performanceLimit') {
        $('#' + paramName).prop('checked', parseBoolean(val)); // set value
      } else if (paramName == 'unitSwitch') {
        $('#' + paramName).prop('checked', parseBoolean(val)); //set value
        if(val=='true'){
          $("#unitDisplay").text("inch")
        }else{
          $("#unitDisplay").text("mm")
        }
      } else {
        $('#' + paramName).val(val); // Set the value to Form from Storage
      }
      
    } else {
       //console.log('Not in local storage: ' +  paramName);
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
    //   printLog('Missing required setting: ' + paramName, errorcolor, "settings");
      anyissues = true;

    } else if (!val && !paramRequired) {
    //   printLog('Missing optional setting: ' + paramName, warncolor, "settings");
    } else {
     //  printLog('Found setting: ' + paramName + " : " + val, msgcolor, "settings");
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
  //     console.log("Found a property " + property + " which does not belong to itself.");
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



function selectMachine(type) {
  //console.log("Loading Machine Template")
  var unit = $('#unitSwitch').prop('checked');
  var unitAppend = document.getElementsByClassName("prepend");
  unitAppend[0].textContent="Project Width Y"


  if (type == "E3") {
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 17.7
        var yaxis = 15.3
        var zaxis = 3.3
      }else{
        var xaxis = 450
        var yaxis = 390
        var zaxis = 85
      }
  } else if (type == "E4") {
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 24.0
        var yaxis = 24.0
        var zaxis = 3.3
      }else{
        var xaxis = 610
        var yaxis = 610
        var zaxis = 85
      }
  } else if (type == "Evolution 3") {
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 18.0
        var yaxis = 16.0
        var zaxis = 3.3
      }else{
        var xaxis = 458
        var yaxis = 407
        var zaxis = 85
      }
  } else if (type == "Evolution 4") {
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 24.0
        var yaxis = 24.0
        var zaxis = 3.3
      }else{
        var xaxis = 610
        var yaxis = 610
        var zaxis = 85
      }
  } else if (type == "Evolution 5") {
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 50.5
        var yaxis = 24.0
        var zaxis = 3.3
      }else{
        var xaxis = 1283
        var yaxis = 610
        var zaxis = 85
      }
  } else if (type == "KL733") {
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 36.0
        var yaxis = 36.0
        var zaxis = 5.0
      }else{
        var xaxis = 915
        var yaxis = 915
        var zaxis = 127
      }
  } else if (type == "KL744") {
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 48.0
        var yaxis = 48.0
        var zaxis = 5.0
      }else{
        var xaxis = 1220
        var yaxis = 1220
        var zaxis = 127
      }

  } else if (type == "KL744E") {
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 96.0
        var yaxis = 48.0
        var zaxis = 5.0
      }else{
        var xaxis = 2440
        var yaxis = 1220
        var zaxis = 127
      }
  } else if (type == "Revolution") {
    unitAppend[0].textContent="Project Diameter A:"
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 24.0
        var yaxis = 6.5
        var zaxis = 3.3
      }else{
        var xaxis = 610
        var yaxis = 165
        var zaxis = 85
      }
  } else if (type == "Other") {
    $('#context_toggle2').html(type);
      if(unit==true){
        var xaxis = 8.0
        var yaxis = 8.0
        var zaxis = 2.0
      }else{
        var xaxis = 200
        var yaxis = 200
        var zaxis = 50
      }
  }
  $("#machinetype").val(type)
  $("#sizexmax").val(xaxis)
  $("#sizeymax").val(yaxis)
  $("#sizezmax").val(zaxis)
 
};
















$(document).ready(function() {
  var modal = `
  <!-- Settings Modal -->

  <div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="settingsmodal" data-width="730" data-to-top="true">
    <div class="dialog-title">Application Settings</div>
    <div class="dialog-content" style="max-height: calc(100vh - 200px);overflow-y: auto; overflow-x: hidden;">
        <form>

        <div id="checkLocalSettingsError">
          <center><h6>Welcome to BobsCNC BASIC CAM</h6></center>
        </div>

          <ul class="step-list">

            <li>
              <h6 class="fg-grayBlue">Select your Machine<br><small>Sets defaults X,Y, and Z and saves Pre/Post commands once saved. </small></h6>
              <hr class="bg-grayBlue">
              <div>
                <a style="width: 100%;" class="button dropdown-toggle secondary outline" id="context_toggle2"> Select Machine</a>
                <ul class="ribbon-dropdown" data-role="dropdown" data-duration="100">
                    <li>
                      <a href="#" class="dropdown-toggle"> E Series CNC Router</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('E3');"><a href="#"><img src="" width="16px"/>E3 </a>></li>
                        <li onclick="selectMachine('E4');"><a href="#"><img src="" width="16px"/>E4 </a>></li>
                      </ul>
                    </li>
                    <li>
                      <a href="#" class="dropdown-toggle">Evolution Series CNC Routers</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('Evolution 3');"><a href="#"><img src="" width="16px"/>Evolution 3 </a>></li>
                        <li onclick="selectMachine('Evolution 4');"><a href="#"><img src="" width="16px"/>Evolution 4 </a>></li>
                        <li onclick="selectMachine('Evolution 5');"><a href="#"><img src="" width="16px"/>Evolution 5 </a>></li>
                      </ul>
                    </li>
                    <li>
                      <a href="#" class="dropdown-toggle"> KL7 Series CNC Routers</a>
                      <ul class="ribbon-dropdown" data-role="dropdown">
                        <li onclick="selectMachine('KL733'); "><a href="#"><img src="" width="16px"/>KL733 </a>></li>
                        <li onclick="selectMachine('KL744'); "><a href="#"><img src="" width="16px"/>KL744  </a>></li>
                        <li onclick="selectMachine('KL744E');"><a href="#"><img src="" width="16px"/>KL744E </a>></li>
                      </ul>
                    </li>
                   
                    <li><a href="#" onclick="selectMachine('Revolution');"><img src="" width="16px"/>Revolution </a>></li>
                    <li><a href="#" onclick="selectMachine('Other');"><img src="" width="16px"/>Other </a>></li>
                   

                  </ul>
                <input type="hidden" class="form-control form-control-sm" id="machinetype" value="" >
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
              <h6 class="fg-grayBlue">Performace<br><small> This can speed up toolpath calculations, but will disable the toolpath-width preview:
               You'll only see the centerline of the toolpath, not the width of the cut.  Helps slow PCs work better</small></h6>
              <hr class="bg-grayBlue">
              <div>

               

                <div class="row mb-0">
                    <label class="cell-sm-6">Disable Tool-Width Preview<br>
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

});