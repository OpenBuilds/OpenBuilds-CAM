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
  $('#context_toggle').html(template);

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
          Configure your machine specifics:<br>

          <form>
              <div class="row mb-2">
                  <label class="cell-sm-6"><b>Step 1:</b> Select your controller</label>
                  <div class="cell-sm-6">
                  <a style="width: 100%;" class="button secondary outline" id="context_toggle"><img src="images/brd/grbl.png"/> Select Controller</a>
                  <ul class="d-menu" data-role="dropdown" data-toggle-element="#context_toggle">
                    <li onclick="selectBoard('xpro');"><a href="#"><img src="images/brd/xpro.png"/>  Spark Concepts xPro</a></li>
                    <li onclick="selectBoard('smoothie');"><a href="#"><img src="images/brd/smoothie.png"/>  Smoothieboard</a></li>
                    <li class="divider"></li>
                    <li onclick="selectBoard('grbl');"><a href="#"><img src="images/brd/grbl.png"/>  Generic GRBL</a></li>
                  </ul>
                  <input type="hidden" class="form-control form-control-sm" id="firmwaretype" value="" >
                  </div>
              </div>
              <b>Step 2:</b> Configure G-CODE Dialect (Specific to your machine/firmware)
              <div class="row mb-2">
                  <label class="cell-sm-6">Spindle / Laser Command</label>
                  <div class="cell-sm-6">
                      <input type="text" data-role="input" data-clear-button="false" class="form-control form-control-sm" id="scommand" value="S" >
                  </div>
              </div>

              <div class="row mb-2">
                  <label class="cell-sm-6">Power/Speed Scale</label>
                  <div class="cell-sm-6">
                    <input type="number" data-role="input" data-clear-button="false" class="form-control form-control-sm" id="scommandscale" value="1" >
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

              <b>Step 3:</b> Machine Workarea

              <div class="row mb-2">
                  <label class="cell-sm-6">X-Axis Length</label>
                  <div class="cell-sm-6">
                    <input type="number" data-role="input" data-clear-button="false" class="form-control " id="sizexmax" value="200" >
                  </div>
              </div>

              <div class="row mb-2">
                  <label class="cell-sm-6">Y-Axis Length</label>
                  <div class="cell-sm-6">
                    <input type="number" data-role="input" data-clear-button="false" class="form-control " id="sizeymax" value="200" >
                  </div>
              </div>

              <b>Step 4:</b> CAM Pre/post Commands

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
                  <label class="cell-sm-6">Initial Height Sensing G-Code</label>
                  <div class="cell-sm-6">
                    <textarea id="ihsgcode" data-role="textarea" data-auto-size="true" data-clear-button="false" placeholder="G0 + clearanceHeight + \nG32.2 Z-30 F100\nG10 P2 L1 Z0"></textarea>
                  </div>
              </div>

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