function typeofOperation(newval, objectseq) {
  if (newval == "... Select Operation ...") {
    noMode(objectseq);
    updateCamUserData(objectseq);

  } else if (newval == "Drill: Peck (Centered)") {
    drillPeckMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "Drill: Continuous (Centered)") {
    drillMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "CNC: Vector (no offset)") {
    cncNoOffsetMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "CNC: Vector (path outside)") {
    cncOutsideMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "CNC: Vector (path inside)") {
    cncInsideMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "CNC: Pocket") {
    cncPocketMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "CNC: V-Engrave") {
    cncVEngMode(objectseq);
    updateCamUserData(objectseq);
  } 


}

function initAdvancedCAM() {
  $('#statusBody2').on('keyup change', 'input, select', function() {
    // console.log('Action')
    var inputVal = $(this).val();
    var newval = inputVal
    var id = $(this).attr('id');
    // console.log(id)
    var objectseq = $(this).attr('objectseq');
    // console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
    if (id.indexOf('tzstep') == 0) {
      var numPass = Math.floor((parseFloat($('#tzdepth' + objectseq).val()) / parseFloat(newval)))

      if ((parseFloat($('#tzdepth' + objectseq).val()) / parseFloat(newval)) - Math.floor(parseFloat($('#tzdepth' + objectseq).val()) / parseFloat(newval)) != 0) {
        var finalPass = parseFloat($('#tzdepth' + objectseq).val()) - (newval * numPass);
        $('#svgZDepth').text(numPass + ' x ' + newval + 'mm + 1 x ' + finalPass + 'mm');
      } else {
        $('#svgZDepth').text(numPass + ' x ' + newval + 'mm');
      }
      updateCamUserData(objectseq);
    } else if (id.indexOf('tzdepth') == 0) {
      $('#svgZFinal').text(newval + 'mm');
      var numPass = Math.floor((parseFloat(newval) / parseFloat($('#tzstep' + objectseq).val())))
      if ((parseFloat(newval) / parseFloat($('#tzstep' + objectseq).val())) - Math.floor(parseFloat(newval) / parseFloat($('#tzstep' + objectseq).val())) != 0) {
        var finalPass = parseFloat(newval) - ($('#tzstep' + objectseq).val() * numPass);
        $('#svgZDepth').text(numPass + ' x ' + $('#tzstep' + objectseq).val() + 'mm + 1 x ' + finalPass + 'mm');
      } else {
        $('#svgZDepth').text(numPass + ' x ' + $('#tzstep' + objectseq).val() + 'mm');
      }
      updateCamUserData(objectseq);
    } else if (id.indexOf('tspeed') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplungespeed') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('ttooldia') == 0) {
      $('#svgToolDia').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tstepover') == 0) {
      $('#svgStepover').text(newval + '%');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tclearanceHeight') == 0) {
      $('#svgZClear-8').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tstartHeight') == 0) {
      $('#svgZStart').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tPasses') == 0) {
      // $('#svgZStart').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tdragoffset') == 0) {
      $('#dragKnifeRadius').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tspotsize') == 0) {
      $('#svgToolDia-4').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tfillAngle') == 0) {
      $('#svgToolDia-4').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplasmakerf') == 0) {
      $('#svgPlasmaKerf').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplasmazheight') == 0) {
      $('#svgPlasmaZHeight').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplasmapierceheight') == 0) {
      $('#svgPlasmaPierceHeight').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplasmapiercedelay') == 0) {
      $('#svgPlasmaPierceDelay').text(newval + 's');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplasmaleadin') == 0) {
      $('#svgPlasmaLeadIn').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplasmaihs') == 0) {
      $('#svgPlasmaIHS').text(newval);
      updateCamUserData(objectseq);
    } else if (id.indexOf('tdirection') == 0) {
      // $('#svgPlasmaIHS').text(newval);
      updateCamUserData(objectseq);
    } else if (id.indexOf('tunion') == 0) {
      // $('#svgPlasmaIHS').text(newval);
      updateCamUserData(objectseq);
    } else if (id.indexOf('tabdepth') == 0) {
      $('#svgtabdepth').text(newval);
      // console.log("tabdepth")
      updateCamUserData(objectseq);
    } else if (id.indexOf('tabWidth') == 0) {
      $('#svgtawidth').text(newval);
      // console.log("tabWidth")
      updateCamUserData(objectseq);
    } else if (id.indexOf('tabSpace') == 0) {
      $('#svgtabspace').text(newval);
      // console.log("tabSpace")
      updateCamUserData(objectseq);
    } else if (id.indexOf('tOpName') == 0) {
      $('#svgOpName').text(newval);
      updateCamUserData(objectseq);
    } else if (id.indexOf('tRampPlunge') == 0) {
      $('#svgOpName').text(newval);
      updateCamUserData(objectseq);
    } else if (id.indexOf('advanced') == 0) {
      // $('#svgUnion').text(newval);
      updateCamUserData(objectseq);
    } else if (id.indexOf('tpwr') == 0) {
      // $('#svgUnion').text(newval);
      updateCamUserData(objectseq);
    } else if (id.indexOf('tpendown') == 0) {
      // $('#svgUnion').text(newval);
      updateCamUserData(objectseq);
    } else if (id.indexOf('tpenup') == 0) {
      // $('#svgUnion').text(newval);
      updateCamUserData(objectseq);
    }

  });

  $('#statusBody2').on('keyup change', 'select', function() {
    var newval = $(this).val();
    var id = $(this).attr('id');
    var objectseq = $(this).attr('objectseq');
    // console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
    if (id.indexOf('toperation') == 0) {
      typeofOperation(newval, objectseq)
    };

  });
};

function updateCamUserData(i) {
  toolpathsInScene[i].userData.camOperation = $('#toperation' + i).val();
  toolpathsInScene[i].userData.camToolDia = $('#ttooldia' + i).val();
  toolpathsInScene[i].userData.camStepover = $('#tstepover' + i).val();
  toolpathsInScene[i].userData.camZClearance = $('#tclearanceHeight' + i).val();
  toolpathsInScene[i].userData.camZStart = $('#tstartHeight' + i).val();
  toolpathsInScene[i].userData.camPasses = $('#tPasses' + i).val();
  toolpathsInScene[i].userData.camDragOffset = $('#tdragoffset' + i).val();
  toolpathsInScene[i].userData.camLaserPower = $('#tpwr' + i).val();
  toolpathsInScene[i].userData.camZStep = $('#tzstep' + i).val();
  toolpathsInScene[i].userData.camZDepth = $('#tzdepth' + i).val();
  toolpathsInScene[i].userData.camFeedrate = $('#tspeed' + i).val();
  toolpathsInScene[i].userData.camPlungerate = $('#tplungespeed' + i).val();
  toolpathsInScene[i].userData.camPlasmaKerf = $('#tplasmakerf' + i).val();
  toolpathsInScene[i].userData.camPlasmaZHeight = $('#tplasmazheight' + i).val();
  toolpathsInScene[i].userData.camPlasmaPierceHeight = $('#tplasmapierceheight' + i).val();
  toolpathsInScene[i].userData.camPlasmaPierceDelay = $('#tplasmapiercedelay' + i).val();
  toolpathsInScene[i].userData.camPlasmaLeadinDist = $('#tplasmaleadin' + i).val();
  toolpathsInScene[i].userData.camPlasmaIHS = $('#tplasmaihs' + i).val();
  toolpathsInScene[i].userData.camUnion = $('#tunion' + i).val();
  toolpathsInScene[i].userData.camDirection = $('#tdirection' + i).val();
  toolpathsInScene[i].userData.camSpotSize = $('#tspotsize' + i).val();
  toolpathsInScene[i].userData.camFillAngle = $('#tfillAngle' + i).val();
  toolpathsInScene[i].userData.camTabDepth = $('#tabdepth' + i).val();
  toolpathsInScene[i].userData.camTabWidth = $('#tabWidth' + i).val();
  toolpathsInScene[i].userData.camTabSpace = $('#tabSpace' + i).val();
  toolpathsInScene[i].userData.tRampPlunge = $('#tRampPlunge' + i).val();
  toolpathsInScene[i].userData.camPenUp = $('#tpenup' + i).val();
  toolpathsInScene[i].userData.camPenDown = $('#tpendown' + i).val();
  toolpathsInScene[i].userData.advanced = $('#advanced' + i).is(":checked");; // Marlin, Stepcraft, Mach3, LinuxCNC
  toolpathsInScene[i].name = $('#tOpName' + i).val();
  $('#statusTitle').html('Configure Toolpath: ' + toolpathsInScene[i].userData.camOperation);

  // store last used values in localStorage
  localStorage.setItem('lastCamOperation', JSON.stringify(toolpathsInScene[i].userData, inflatedReplacer));

};

function inflatedReplacer(key, value) {
  if (key == "inflated") return undefined;
  else if (key == "pretty") return undefined;
  else return value;
}


function setupJob(i) {

  // $('#statusmodal').modal('show');
  Metro.dialog.open('#statusmodal')
  $('#statusTitle').empty();
  $('#statusTitle').html('Configure Toolpath: ');
  $('#statusBody').empty();
  $('#statusBody2').empty();

  // $('#statusBody').html('' );
  var template2 = `
    Configure the toolpath parameters:
    <hr>
    <div id="toolpathWarnings"></div>
    <table class="table striped compact">

      <tr>
        <td>Name:</td>
        <td>
          <div class="input-addon">
            <input data-role="input" autofocus type="text" class="cam-form-field cam-form-field-right active-border" value="` + toolpathsInScene[i].name + `" id="tOpName` + i + `"  objectseq="` + i + `" style="width: 350px; min="0" style="text-align: center;">
          </div>
        </td>
      </tr>

      <tr>
        <td>Type of cut: </td>
        <td>
          <div class="input-addon">
            <select class="cam-form-field cam-form-field-right active-border camOperationSelect" id="toperation` + i + `" objectseq="` + i + `" style="width: 350px; border-left: solid 1px #ccc; padding: 0px; padding-left: 10px;">
              <option> Select Operation ...</option>
              <optgroup label="Drilling Operations" class="camOptgroup">
                <option class="camOption">Drill: Peck (Centered)</option>
                <option class="camOption">Drill: Continuous (Centered)</option>
              </optgroup>
              <optgroup label="Milling/Routing Operations" class="camOptgroup">
                <option class="camOption">CNC: Vector (no offset)</option>
                <option class="camOption">CNC: Vector (path inside)</option>
                <option class="camOption">CNC: Vector (path outside)</option>
                <option class="camOption">CNC: Pocket</option>
              </optgroup>
             
            </select>
          </div>
        </td>

      </tr>
    </table>
    <table class="table striped compact">
      <tr class="inputcnc inputpocket inputtooldia inputdrill inputplotter">
        <td>Bit Diameter</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="6.35" id="ttooldia` + i + `"  objectseq="` + i + `" min="0" step="any">
            <span class="input-addon-label-right active-border">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputpocket">
        <td>Stepover</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="40" id="tstepover` + i + `"  objectseq="` + i + `" min="0" step="any">
            <span class="input-addon-label-right active-border">%</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc  inputpocket inputdrill">
        <td>Z Safe Height</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="10" id="tclearanceHeight` + i + `"  objectseq="` + i + `" min="0" step="any">
            <span class="input-addon-label-right active-border">mm</span>
          </div>
        </td>
      </tr>
           <tr class="inputcnc inputpocket inputdrillpeck">
        <td>Cut Depth: per Pass</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" id="tzstep` + i + `" value="1" objectseq="` + i + `" min="0" step="any">
            <span class="input-addon-label-right active-border">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket inputdrill">
        <td>Cut Depth: Final</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" id="tzdepth` + i + `" value="6" objectseq="` + i + `" min="0" step="any">
            <span class="input-addon-label-right active-border">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket ">
        <td>Feedrate (X/Y)</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="1000" id="tspeed` + i + `" objectseq="` + i + `" min="0" step="any" >
            <span class="input-addon-label-right active-border">mm/min</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket inputdrill">
        <td>Feedrate: Plunge</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="300" id="tplungespeed` + i + `" objectseq="` + i + `" min="0" step="any">
            <span class="input-addon-label-right active-border">mm/min</span>
          </div>
        </td>
      </tr>
     

      </table>


    <div>
      <input type="checkbox" data-role="switch" data-caption="Advanced Settings" id="advanced` + i + `" objectseq="` + i + `" >
    </div>
    <div data-role="collapse" data-collapsed="true" data-toggle-element="#advanced` + i + `" id="collapsediv` + i + `">

    <table class="table striped compact">
      
      </tr>
      <tr class="inputcnc inputpocket">
        <td>Cutting Direction:</td>
        <td>
          <div class="input-addon">
            <select class="cam-form-field cam-form-field-right active-border" id="tdirection` + i + `" objectseq="` + i + `" style="width: 280px; border-left: solid 1px #ccc; padding: 0px; padding-left: 10px;">
              <option selected>Climb</option>
              <option>Conventional</option>
            </select>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket">
        <td>Geometry: Merge</td>
        <td>
          <div class="input-addon">
            <select class="cam-form-field cam-form-field-right active-border" id="tunion` + i + `" objectseq="` + i + `" style="width: 280px; border-left: solid 1px #ccc; padding: 0px; padding-left: 10px;">
              <option selected>No</option>
              <option>Yes</option>
            </select>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket">
        <td>
          Plunge: Ramp In<br>
          <div class="text-small">[beta] Experimental!</div>
        </td>
        <td>
          <div class="input-addon">
            <select class="cam-form-field cam-form-field-right active-border" id="tRampPlunge` + i + `" objectseq="` + i + `" style="width: 280px; border-left: solid 1px #ccc; padding: 0px; padding-left: 10px;">
              <option selected>No</option>
              <option>Yes</option>
            </select>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket ">
        <td>Cut Depth: Start</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="0" id="tstartHeight` + i + `"  objectseq="` + i + `" min="1" step="any">
            <span class="input-addon-label-right active-border">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc">
        <td>Tabs: Height</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="0" id="tabdepth` + i + `" objectseq="` + i + `" step="any">
            <span class="input-addon-label-right active-border">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc">
        <td>Tabs: Width</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="6" id="tabWidth` + i + `" objectseq="` + i + `" min="0" step="any">
            <span class="input-addon-label-right active-border">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc">
        <td>Tabs: Spacing</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="50" id="tabSpace` + i + `" objectseq="` + i + `" min="0" step="any">
            <span class="input-addon-label-right active-border">mm</span>
          </div>
        </td>
      </tr>

    </table>
  </div>`
  $('#statusBody2').html(template2);
  $('#statusFooter').html(`<button type="button" id="previewToolpathBtn" class="button success" onclick="toolpathPreview(` + i + `); fillTree();">Apply and Preview Toolpath </button><button class="button js-dialog-close">Close</button>`);
  noMode(); // Default to NOOP
  $("#tOpName" + i).focus()
  Metro.init();

  var closedVectors = 0
  var openVectors = 0
  for (j = 0; j < toolpathsInScene[i].children.length; j++) {
    if (toolpathsInScene[i].children[j].userData.closed == undefined) { // this is for imports of old Workspaces before the closed logic.
      closedVectors++
    } else { // New documents
      if (toolpathsInScene[i].children[j].userData.closed) {
        closedVectors++
      } else {
        openVectors++
      }
    }
  }

  console.log("This operation contains " + openVectors + " Open Vectors, and " + closedVectors + " Closed Vectors")
  if (openVectors > 0) {
    var template3 = '<div class="remark"><span class="text-small">This toolpath contains ' + openVectors + ' open vector(s), and ' + closedVectors + ' closed vector(s)</span>'
    template3 += '<br><span class="text-small fg-red">NB: You cannot use Offset operations on Open Vectors, you can try to use "No Offset" operations, or repair the file first</span>'
    template3 += '</div>'
    $('#toolpathWarnings').html(template3)
  }
  if (toolpathsInScene[i].userData.camOperation) {
    $('#tPasses' + i).val(toolpathsInScene[i].userData.camPasses);
    $('#toperation' + i).val(toolpathsInScene[i].userData.camOperation).prop('selected', true)
    $('#ttooldia' + i).val(toolpathsInScene[i].userData.camToolDia);
    $('#tstepover' + i).val(toolpathsInScene[i].userData.camStepover);
    $('#tclearanceHeight' + i).val(toolpathsInScene[i].userData.camZClearance);
    $('#tstartHeight' + i).val(toolpathsInScene[i].userData.camZStart);
    $('#tdragoffset' + i).val(toolpathsInScene[i].userData.camDragOffset);
    $('#tspotsize' + i).val(toolpathsInScene[i].userData.camSpotSize);
    $('#tfillAngle' + i).val(toolpathsInScene[i].userData.camFillAngle);
    $('#tpwr' + i).val(toolpathsInScene[i].userData.camLaserPower);
    $('#tzstep' + i).val(toolpathsInScene[i].userData.camZStep);
    $('#tzdepth' + i).val(toolpathsInScene[i].userData.camZDepth);
    $('#tspeed' + i).val(toolpathsInScene[i].userData.camFeedrate);
    $('#tplungespeed' + i).val(toolpathsInScene[i].userData.camPlungerate);
    $('#tplasmakerf' + i).val(toolpathsInScene[i].userData.camPlasmaKerf);
    $('#tplasmazheight' + i).val(toolpathsInScene[i].userData.camPlasmaZHeight);
    $('#tplasmapierceheight' + i).val(toolpathsInScene[i].userData.camPlasmaPierceHeight);
    $('#tplasmapiercedelay' + i).val(toolpathsInScene[i].userData.camPlasmaPierceDelay);
    $('#tplasmaleadin' + i).val(toolpathsInScene[i].userData.camPlasmaLeadinDist);
    $('#tabdepth' + i).val(toolpathsInScene[i].userData.camTabDepth);
    $('#tabWidth' + i).val(toolpathsInScene[i].userData.camTabWidth);
    $('#tabSpace' + i).val(toolpathsInScene[i].userData.camTabSpace);
    $('#tpenup' + i).val(toolpathsInScene[i].userData.camPenUp);
    $('#tpendown' + i).val(toolpathsInScene[i].userData.camPenDown);
    if (toolpathsInScene[i].userData.tRampPlunge) {
      $('#tRampPlunge' + i).val(toolpathsInScene[i].userData.tRampPlunge).prop('selected', true);
    } else {
      $('#tRampPlunge' + i).val("No").prop('selected', true);
    }
    $('#tplasmaihs' + i).val(toolpathsInScene[i].userData.camPlasmaIHS).prop('selected', true);
    $('#tunion' + i).val(toolpathsInScene[i].userData.camUnion).prop('selected', true);
    $('#tdirection' + i).val(toolpathsInScene[i].userData.camDirection).prop('selected', true);
    $('#tOpName' + i).val(toolpathsInScene[i].name);
    $('#statusTitle').html('Configure Toolpath: ' + toolpathsInScene[i].userData.camOperation);
    $('#advanced' + i).prop('checked', toolpathsInScene[i].userData.advanced);
    if (toolpathsInScene[i].userData.advanced) {
      setTimeout(function() {
        $('#advanced' + i).prop('checked', true);
        $('#collapsediv' + i).data("collapse")['expand']()
      }, 200);
    } else {
      setTimeout(function() {
        $('#advanced' + i).prop('checked', false);
        $('#collapsediv' + i).data("collapse")['collapse']()
      }, 200);
    }
    typeofOperation(toolpathsInScene[i].userData.camOperation, i);
  } else {
    // if we don't already have an Operation, perhaps we can pull from last-used values to make it easier
    var lastused = JSON.parse(localStorage.getItem('lastCamOperation'));
    if (lastused) {
      // console.log(lastused)
      $('#ttooldia' + i).val(lastused.camToolDia);
      $('#tstepover' + i).val(lastused.camStepover);
      $('#tclearanceHeight' + i).val(lastused.camZClearance);
      $('#tdragoffset' + i).val(lastused.camDragOffset);
      $('#tspotsize' + i).val(lastused.camSpotSize);
      $('#tfillAngle' + i).val(lastused.camFillAngle);
      $('#tpwr' + i).val(lastused.camLaserPower);
      $('#tzstep' + i).val(lastused.camZStep);
      $('#tzdepth' + i).val(lastused.camZDepth);
      $('#tspeed' + i).val(lastused.camFeedrate);
      $('#tplungespeed' + i).val(lastused.camPlungerate);
      $('#tplasmakerf' + i).val(lastused.camPlasmaKerf);
      $('#tplasmazheight' + i).val(lastused.camPlasmaZHeight);
      $('#tplasmapierceheight' + i).val(lastused.camPlasmaPierceHeight);
      $('#tplasmapiercedelay' + i).val(lastused.camPlasmaPierceDelay);
      $('#tplasmaleadin' + i).val(lastused.camPlasmaLeadinDist);
      $('#tstartHeight' + i).val(lastused.camZStart);
      $('#tPasses' + i).val(lastused.camPasses);
      $('#tplasmaihs' + i).val(lastused.camPlasmaIHS);
      // $('#tunion' + i).val(lastused.camUnion);
      $('#tdirection' + i).val(lastused.camDirection);
      $('#tspotsize' + i).val(lastused.camSpotSize);
      $('#tfillAngle' + i).val(lastused.camFillAngle);
      //$('#tabdepth' + i).val(lastused.camTabDepth);
      //$('#tabWidth' + i).val(lastused.camTabWidth);
      //$('#tabSpace' + i).val(lastused.camTabSpace);
      //$('#tRampPlunge' + i).val(lastused.tRampPlunge);
      $('#tpenup' + i).val(lastused.camPenUp);
      $('#tpendown' + i).val(lastused.camPenDown);
    }
  };
}

function noMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputlaser').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputlaserraster').hide();
}

function laserMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $(".inputlasernooffset").hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputlaser').show();
};

function laserInsideMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputlaser').show();
};

function laserOutsideMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputlaser').show();
};

function laserRasterMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputlaserraster').show();
};

function drillMode(i) {
  $('.inputlaser').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputcnc').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputdrill').show();
}

function drillPeckMode(i) {
  $('.inputlaser').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputcnc').hide();
  $('.inputdrill').show();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputdrillpeck').show();

}

function cncInsideMode(i) {
  $('.inputlaser').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputcnc').show();
};

function cncOutsideMode(i) {
  $('.inputlaser').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputcnc').show();
};

function cncNoOffsetMode(i) {
  $('.inputlaser').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputtooldia').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputcnc').show();

}

function cncPocketMode(i) {
  $('.inputlaser').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputcnc').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputpocket').show();
  // force open Advanced and force Union by default
  setTimeout(function() {
    $('#advanced' + i).prop('checked', true);
    $('#collapsediv' + i).data("collapse")['expand']()
  }, 200);
  if (!toolpathsInScene[i].userData.camOperation) { // only force if not set already (ie suggested default)
    $('#tunion' + i).val("Yes").prop('selected', true);
  }
};

function plasmaMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputlaser').hide();
  $('.inputdragknife').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputplasma').show();
};


function dragKnifeMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputlaser').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputplotter').hide();
  $('.inputpenraster').hide();
  $('.inputdragknife').show();
};

function plotterMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputlaser').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputlaserraster').hide();
  $('.inputdragknife').hide();
  $('.inputpenraster').hide();
  $('.inputplotter').show();
};

function penRasterMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputplotter').hide();
  $('.inputlaserraster').hide();
  $('.inputpenraster').show();
};