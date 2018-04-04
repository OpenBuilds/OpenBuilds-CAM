function initLocalStorage() {
    var settingsOpen = document.getElementById('jsonFile');
    settingsOpen.addEventListener('change', restoreSettingsLocal, false);
}

// FIXME
// A way to access all of the settings
// $("#settings-menu-panel input, #settings-menu-panel textarea, #settings-menu-panel select").each(function() {console.log(this.id + ": " + $(this).val())});

localParams = [
  // [paramName, required]
  ['rapidspeed', true],
  ['sizexmax', true],
  ['sizeymax', true],
  ['startgcode', false],
  ['laseron', false],
  ['laseroff', false],
  ['lasermultiply', true],
  ['homingseq', true],
  ['endgcode', false],
  ['lasertestpower', false],
  ['lasertestduration', false],
  ['imagePosition', true],
  ['defaultDPI', true],
  ['illustratorDPI', false],
  ['inkscapeDPI', false],
  ['defaultBitmapDPI', true],
  ['g0command', true],
  ['g1command', true],
  ['scommandnewline', true],
  ['scommand', true],
  ['scommandscale', true],
  ['ihsgcode', true]
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
      var val = $('#' + paramName).val(); // Read the value from form
      console.log('Saving: ' + paramName + ' : ' + val);
      printLog('Saving: ' + paramName + ' : ' + val, successcolor);
      saveSetting(paramName, val);
  }
  printLog('<b>Saved Settings: <br>NB:</b> Please refresh page for settings to take effect', errorcolor, "settings");
  console.groupEnd();
};

function loadSettingsLocal() {
  console.group("Loading settings from LocalStorage")
  for (i = 0; i < localParams.length; i++) {
    var localParam = localParams[i];
    var paramName = localParam[0];
    var val = loadSetting(paramName);

    if (val) {
      console.log('Loading: ' + paramName + ' : ' + val);
      $('#' + paramName).val(val);// Set the value to Form from Storage
    } else {
      console.log('Not in local storage: ' +  paramName);
    }
  }
  console.groupEnd();
};

function backupSettingsLocal() {
  var json = JSON.stringify(localStorage)
  var blob = new Blob([json], {type: "application/json"});
  invokeSaveAsDialog(blob, 'settings-backup.json');
};

function checkSettingsLocal() {
  $("#settingsstatus").hide();
  var anyissues = false;
  printLog('<b>Checking for configuration :</b><p>', msgcolor, "settings");
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
      printLog('Found setting: ' + paramName + " : " + val, msgcolor, "settings");
    }
  }


  if (anyissues) {
    printLog('<b>MISSING CONFIG: You need to configure your setup. </b>. Click <kbd>Settings <i class="fa fa-cogs"></i></kbd> on the left, and work through all the options', errorcolor, "settings");
    $("#togglesettings").click();
    $("#settingsstatus").show();
  }


};

function restoreSettingsLocal(evt) {
  console.log('Inside Restore');
  var input, file, fr;

  console.log('event ', evt)
  file = evt.target.files[0];
  fr = new FileReader();
  fr.onload = loadSettings;
  fr.readAsText(file);
};

function loadSettings(e) {
  lines = e.target ? e.target.result : e ;
  var o = JSON.parse(lines);
  for (var property in o) {
    if (o.hasOwnProperty(property)) {
     saveSetting(property, o[property]);
    } else {
      // I'm not sure this can happen... I want to log this if it does!
      console.log("Found a property " + property + " which does not belong to itself.");
    }
  }
  loadSettingsLocal();
};
