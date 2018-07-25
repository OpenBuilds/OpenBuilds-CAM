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

  } else if (type == "smoothie") {
    template = `<img src="images/brd/` + type + `.png"/>  Smoothieboard`
    var tplscommand = `S`;
    var tplsscale = `1`;
    var tplsnewline = false;
    var tplrapidcommand = `G0`;
    var tplmovecommand = `G1`;

  }
  $('#g0command').val(tplrapidcommand);
  $('#g1command').val(tplmovecommand);
  $('#scommandnewline').prop('checked', tplsnewline);
  $('#scommand').val(tplscommand);
  $('#scommandscale').val(tplsscale);
  $("#firmwaretype").val(type)

  setButton(type)
};

function setButton(type) {
  var template = `<img src="images/brd/grbl.png"/>Select Controller`
  if (type == "grbl") {
    template = `<img src="images/brd/` + type + `.png"/>  Generic GRBL`
  } else if (type == "xpro") {
    template = `<img src="images/brd/` + type + `.png"/>  Spark Concepts xPro`
  } else if (type == "smoothie") {
    template = `<img src="images/brd/` + type + `.png"/>  Smoothieboard`
  }
  $('#elecType').html(template);
}

$(document).ready(function() {
  var modal = `
  <!-- Settings Modal -->

  <div class="dialog" data-overlay-click-close="true" data-role="dialog" data-cls-dialog="pos-fixed pos-top-center" id="settingsmodal" data-width="730">
    <div class="dialog-title">Application Settings</div>
    <div class="dialog-content" style="max-height: calc(100vh - 200px);overflow-y: auto; overflow-x: hidden;">
      <ul class="tabs-expand-sm" data-role="tabs">
        <li><a href="#_target_1">MACHINE</a></li>
        <li><a href="#_target_2">BACKUP</a></li>
      </ul>
      <div class="p-1">
        <div id="_target_1">
          Configure your machine specifics:
          </p>
          <h5>Firmware Settings</h5>
          <div class="dropdown">
            <button class="btn btn-light dropdown-toggle" type="button" id="elecType" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <img src="images/brd/grbl.png"/>Select Controller
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a class="dropdown-item" href="#" onclick="selectBoard('xpro');"><img src="images/brd/xpro.png"/>  Spark Concepts xPro</a>
              <a class="dropdown-item" href="#" onclick="selectBoard('smoothie');"><img src="images/brd/smoothie.png"/>  Smoothieboard</a>
              <a class="dropdown-item" href="#" onclick="selectBoard('grbl');"><img src="images/brd/grbl.png"/>  Generic GRBL</a>
            </div>
          </div>
          <input type="hidden" class="form-control form-control-sm" id="firmwaretype" value="" >
          Configure G-CODE Dialect (Specific to your machine/firmware)
          <div class="form-group row">
            <label for="scommand" class="col-sm-7 col-form-label">Spindle / Laser Command</label>
            <div class="col-sm-5">
              <input type="text" class="form-control form-control-sm" id="scommand" value="S" >
            </div>
          </div>
          <div class="form-group row">
            <label for="scommandscale" class="col-sm-7 col-form-label">Power/Speed Scale</label>
            <div class="col-sm-5">
              <input type="number" class="form-control form-control-sm" id="scommandscale" value="1" >
            </div>
          </div>
          <div class="form-group row">
            <label for="scommandnewline" class="col-sm-7 col-form-label">Power/Speed on new-line</label>
            <div class="col-sm-5">
              <input type="checkbox" id="scommandnewline" value="option1">
            </div>
          </div>
          <div class="form-group row">
            <label for="g0command" class="col-sm-7 col-form-label">Rapid Move Command</label>
            <div class="col-sm-5">
              <input type="text" class="form-control form-control-sm" id="g0command" value="G0" >
            </div>
          </div>
          <div class="form-group row">
            <label for="g1command" class="col-sm-7 col-form-label">Linear Move Command</label>
            <div class="col-sm-5">
              <input type="text" class="form-control form-control-sm" id="g1command" value="G1" >
            </div>
          </div>
          <p>
          <h5>Workarea</h5>
          <div class="form-group row">
            <label for="sizexmax" class="col-sm-7 col-form-label">X-Axis Length</label>
            <div class="col-sm-5">
              <div class="input-group input-group-sm mb-3">
                <input type="number" class="form-control " id="sizexmax" value="200" >
                <div class="input-group-append">
                  <span class="input-group-text">mm</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group row">
            <label for="sizeymax" class="col-sm-7 col-form-label">Y-Axis Length</label>
            <div class="col-sm-5">
              <div class="input-group input-group-sm mb-3">
                <input type="number" class="form-control " id="sizeymax" value="200" >
                <div class="input-group-append">
                  <span class="input-group-text">mm</span>
                </div>
              </div>
            </div>
          </div>
          <h5>Gcode Generator Settings</h5>
          <form class="form-horizontal">
            <label for="startgcode" class="control-label">Start G-Code</label>
            <textarea id="startgcode" class="form-control form-control-sm" placeholder="For example M4 G28 G90 M80 - supports multi line commands"></textarea>
            <label for="endgcode" class="control-label">End G-Code</label>
            <textarea id="endgcode" class="form-control form-control-sm" placeholder="For example M5 M81 G28 - supports multi line commands"></textarea>
            <label for="ihsgcode" class="control-label">Initial Height Sensing G-Code</label>
            <textarea id="ihsgcode" class="form-control form-control-sm" placeholder="G0 + clearanceHeight + \nG32.2 Z-30 F100\nG10 P2 L1 Z0"></textarea>
          </form>
        </div>
        <div id="_target_2">
        <p>Download a backup profile or restore settings from a backup file:</p>
        <form class="form-horizontal">
          <div class="btn-group input-group  btn-group-justified" role="group" aria-label="Backup">
            <div class="btn-group" role="group">
              <button id="backup" class="button primary btn-file" data-tooltip="tooltip" data-placement="bottom" title="Take a backup" onclick="backupSettingsLocal()">
              <i class="fa fa-download fa-fw"></i> Backup Settings
              </button>
            </div>
          </div>
          </br>
          <div class="btn-group input-group  btn-group-justified" role="group" aria-label="Restore">
            <div class="btn-group" role="group">
              <span id="restore" href="#" class="button primary btn-file" data-tooltip="tooltip" data-placement="bottom" title="Open a backup settings file">
              <i class="fa fa-upload  fa-fw"></i> Restore from file <input id="jsonFile" type="file" accept=".json" />
              </span>
            </div>
          </div>
          </br>
          <div class="btn-group input-group  btn-group-justified" role="group" aria-label="Backup">
            <div class="btn-group" role="group">
              <button class="button primary btn-file" data-tooltip="tooltip" data-placement="bottom" title="Reset all settings to default" onclick="ConfirmDelete()">
              <i class="fa fa-exclamation-triangle fa-fw"></i> Factory Reset
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
    <div class="dialog-actions">
      <button class="button js-dialog-close">Cancel</button>
      <button id="savesettings" type="button" class="button js-dialog-close success">Save</button>
    </div>
  </div>
  <!-- #settingsmodal -->
  `
  $("body").append(modal);
});