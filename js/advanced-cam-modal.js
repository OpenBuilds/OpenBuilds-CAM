function typeofOperation(newval, objectseq) {
  if (newval == "... Select Operation ...") {
    noMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "Laser: Vector (no path offset)") {
    laserMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "Laser: Vector (path inside)") {
    laserInsideMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "Laser: Vector (path outside)") {
    laserOutsideMode(objectseq);
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
  } else if (newval == "Plasma: Vector (path outside)") {
    plasmaMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "Plasma: Vector (path inside)") {
    plasmaMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "Plasma: Mark") {
    plasmaMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "Plasma: Vector (no path offset)") {
    plasmaMode(objectseq);
    updateCamUserData(objectseq);
  } else if (newval == "Drag Knife: Cutout") {
    dragKnifeMode(objectseq);
    updateCamUserData(objectseq);
  }


}

function initAdvancedCAM() {
  $('#statusBody2').on('keyup change', 'input, select', function() {
    var inputVal = $(this).val();
    var newval = inputVal
    var id = $(this).attr('id');
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
    } else if (id.indexOf('tdragoffset') == 0) {
      $('#dragKnifeRadius').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tspotsize') == 0) {
      $('#svgToolDia-4').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplasmakerf') == 0) {
      $('#svgPlasmaKerf').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplasmazheight') == 0) {
      $('#svgPlasmaZHeight').text(newval + 'mm');
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplasmaihs') == 0) {
      $('#svgPlasmaIHS').text(newval);
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
    } else if (id.indexOf('advanced') == 0) {
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
  toolpathsInScene[i].userData.camDragOffset = $('#tdragoffset' + i).val();
  toolpathsInScene[i].userData.camLaserPower = $('#tpwr' + i).val();
  toolpathsInScene[i].userData.camZStep = $('#tzstep' + i).val();
  toolpathsInScene[i].userData.camZDepth = $('#tzdepth' + i).val();
  toolpathsInScene[i].userData.camFeedrate = $('#tspeed' + i).val();
  toolpathsInScene[i].userData.camPlungerate = $('#tplungespeed' + i).val();
  toolpathsInScene[i].userData.camPlasmaKerf = $('#tplasmakerf' + i).val();
  toolpathsInScene[i].userData.camPlasmaZHeight = $('#tplasmazheight' + i).val();
  toolpathsInScene[i].userData.camPlasmaIHS = $('#tplasmaihs' + i).val();
  toolpathsInScene[i].userData.camUnion = $('#tunion' + i).val();
  toolpathsInScene[i].userData.camSpotSize = $('#tspotsize' + i).val();
  toolpathsInScene[i].userData.camTabDepth = $('#tabdepth' + i).val();
  toolpathsInScene[i].userData.camTabWidth = $('#tabWidth' + i).val();
  toolpathsInScene[i].userData.camTabSpace = $('#tabSpace' + i).val();
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

  $('#statusmodal').modal('show');
  $('#statusTitle').empty();
  $('#statusTitle').html('Configure Toolpath: ');
  $('#statusBody').empty();
  $('#statusBody2').empty();

  // $('#statusBody').html('' );
  var template2 = `
    Configure the operation for the toolpath
    <table>
      <tr>
        <th style="width: 150px;"></th><th style="width: 210px;"></th>
      </tr>
      <tr>
        <td>Name:</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></span>
            <input type="text" class="cam-form-field" value="` + toolpathsInScene[i].name + `" id="tOpName` + i + `"  objectseq="` + i + `" min="0" style="border-right: 1px solid #ddd; width: 180px; text-align: center;">
          </div>
        </td>
      </tr>
    </table>

    <table>
      <tr>
        <th style="width: 150px;"></th><th style="width: 210px;"></th>
      </tr>
      <tr>
        <td>Type of cut: </td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><i class="fa fa-wrench" aria-hidden="true"></i></span>
            <select class="cam-form-field" id="toperation` + i + `" objectseq="` + i + `" style="border-right: 1px solid #ddd; width: 180px;">
              <option>... Select Operation ...</option>
              <option>CNC: Vector (path inside)</option>
              <option>CNC: Vector (path outside)</option>
              <option>CNC: Pocket</option>
              <option>Laser: Vector (no path offset)</option>
              <option>Laser: Vector (path inside)</option>
              <option>Laser: Vector (path outside)</option>
              <!--option>CNC: V-Engrave</option-->
              <option>Plasma: Vector (path outside)</option>
              <option>Plasma: Vector (path inside)</option>
              <option>Plasma: Vector (no path offset)</option>
              <option>Plasma: Mark</option>
              <option>Drag Knife: Cutout</option>
            </select>
          </div>
        </td>

      </tr>
      <tr class="inputcnc inputpocket">
        <td>Endmill Diameter</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><img src="images/endmilldia.svg" width="16px" height="16px"></img></span>
            <input type="number" class="cam-form-field" value="6.35" id="ttooldia` + i + `"  objectseq="` + i + `" min="0">
            <span class="input-addon-label-right">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputpocket">
        <td>Stepover</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><img src="images/endmilldia.svg" width="16px" height="16px"></img></span>
            <input type="number" class="cam-form-field" value="40" id="tstepover` + i + `"  objectseq="` + i + `" min="0">
            <span class="input-addon-label-right">%</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc  inputpocket inputplasma inputdragknife inputlaser">
        <td>Z Safe Height</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><i class="fa fa-arrows-v" aria-hidden="true"></i></span>
            <input type="number" class="cam-form-field" value="10" id="tclearanceHeight` + i + `"  objectseq="` + i + `" min="1">
            <span class="input-addon-label-right">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputdragknife">
        <td>Drag Knife: Center Offset</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><img src="images/dragoffset.svg" width="16px" height="16px"></img></span>
            <input type="number" class="cam-form-field" value="0.1" id="tdragoffset` + i + `"  objectseq="` + i + `" step="0.1" min="0">
            <span class="input-addon-label-right">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputlaser">
        <td>Laser: Power</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><i class="fa fa-tachometer" aria-hidden="true"></i></span>
            <input type="number" class="cam-form-field" value="100" id="tpwr` + i + `" objectseq="` + i + `" min="1" max="100">
            <span class="input-addon-label-right">%</span>
          </div>
        </td>
      </tr>
      <tr class="inputlaser">
        <td>Laser: Kerf</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><img src="images/kerf.svg" width="16px" height="16px"></img></span>
            <input type="number" class="cam-form-field" value="0.1" id="tspotsize` + i + `" objectseq="` + i + `" min="0.1" max="5" step="0.1">
            <span class="input-addon-label-right">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket">
        <td>Cut Depth: per Pass</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><i class="fa fa-sort-amount-asc" aria-hidden="true"></i></span>
            <input type="number" class="cam-form-field" id="tzstep` + i + `" value="1" objectseq="` + i + `" min="0" step="1">
            <span class="input-addon-label-right">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket">
        <td>Cut Depth: Final</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><i class="fa fa-level-down" aria-hidden="true"></i></span>
            <input type="number" class="cam-form-field" id="tzdepth` + i + `" value="6" objectseq="` + i + `" min="0" step="1">
            <span class="input-addon-label-right">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket inputdragknife inputlaser inputplasma">
        <td>Feedrate: Cut</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><i class="fa fa-exchange" aria-hidden="true"></i></span>
            <input type="number" class="cam-form-field" value="1000" id="tspeed` + i + `" objectseq="` + i + `" min="0" step="1" >
            <span class="input-addon-label-right">mm/min</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket">
        <td>Feedrate: Plunge</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><i class="fa fa-exchange fa-rotate-90" aria-hidden="true"></i></span>
            <input type="number" class="cam-form-field" value="300" id="tplungespeed` + i + `" objectseq="` + i + `" min="0" step="1">
            <span class="input-addon-label-right">mm/min</span>
          </div>
        </td>
      </tr>
      <tr class="inputplasma">
        <td>Plasma: Kerf</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><img src="images/kerf.svg" width="16px" height="16px"></img></span>
            <input type="number" class="cam-form-field" value="1.2" id="tplasmakerf` + i + `" objectseq="` + i + `" min="0" step="1">
            <span class="input-addon-label-right">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputplasma">
        <td>Plasma: Cut Height</td>
        <td>
          <div class="input-addon">
            <span class="input-addon-label-left"><i class="fa fa-arrows-v" aria-hidden="true"></i></span>
            <input type="number" class="cam-form-field" value="1.5" id="tplasmazheight` + i + `" objectseq="` + i + `" min="0" step="1">
            <span class="input-addon-label-right">mm</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket inputplasma inputdragknife inputlaser">
        <td colspan="2">
          <div>
            <input type='checkbox' data-toggle='collapse' data-target='#collapsediv1' id="advanced` + i + `" objectseq="` + i + `"> Advanced Settings
            </input>
          </div>
          <div id='collapsediv1' class='collapse div1'>
          <table>
            <tr>
              <th style="width: 150px;"></th><th style="width: 210px;"></th>
            </tr>
            <tr class="inputcnc inputpocket">
              <td>Cut Depth: Start</td>
              <td>
                <div class="input-addon">
                  <span class="input-addon-label-left"><i class="fa fa-arrows-v" aria-hidden="true"></i></span>
                  <input type="number" class="cam-form-field" value="0" id="tstartHeight` + i + `"  objectseq="` + i + `" min="1">
                  <span class="input-addon-label-right">mm</span>
                </div>
              </td>
            </tr>
            <tr class="inputcnc">
              <td>Tabs: Height</td>
              <td>
                <div class="input-addon">
                  <span class="input-addon-label-left"><i class="fa fa-exchange fa-rotate-90" aria-hidden="true"></i></span>
                    <input type="number" class="cam-form-field" value="0" id="tabdepth` + i + `" objectseq="` + i + `" step="1">
                  <span class="input-addon-label-right">mm</span>
                </div>
              </td>
            </tr>
            <tr class="inputcnc">
              <td>Tabs: Width</td>
              <td>
                <div class="input-addon">
                  <span class="input-addon-label-left"><i class="fa fa-arrows-v" aria-hidden="true"></i></span>
                  <input type="number" class="cam-form-field" value="6" id="tabWidth` + i + `" objectseq="` + i + `" min="0" step="1">
                  <span class="input-addon-label-right">mm</span>
                </div>
              </td>
            </tr>
            <tr class="inputcnc">
              <td>Tabs: Spacing</td>
              <td>
                <div class="input-addon">
                  <span class="input-addon-label-left"><i class="fa fa-arrows-v" aria-hidden="true"></i></span>
                  <input type="number" class="cam-form-field" value="50" id="tabSpace` + i + `" objectseq="` + i + `" min="0" step="1">
                  <span class="input-addon-label-right">mm</span>
                </div>
              </td>
            </tr>
            <tr class="inputplasma">
              <td>Plasma: Use IHS</td>
              <td>
                <div class="input-addon">
                  <span class="input-addon-label-left"><i class="fa fa-wrench" aria-hidden="true"></i></span>
                  <select class="cam-form-field" id="tplasmaihs` + i + `" objectseq="` + i + `" style="border-right: 1px solid #ddd; width: 180px;">
                    <option selected>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </td>
            </tr>
            <tr class="inputplasma inputcnc inputpocket inputdragknife inputlaser inputlasernooffset">
              <td>Geometry: Merge</td>
              <td>
                <div class="input-addon">
                  <span class="input-addon-label-left"><i class="fa fa-compress" aria-hidden="true"></i></span>
                  <select class="cam-form-field" id="tunion` + i + `" objectseq="` + i + `" style="border-right: 1px solid #ddd; width: 180px;">
                    <option selected>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </td>
            </tr>
          </table>
          </div>
        </td>
      </tr>
    </table>`
  $('#statusBody2').html(template2);
  $('#statusFooter').html(`<button type="button" id="previewToolpathBtn" class="btn btn-success" onclick="toolpathPreview(` + i + `); fillTree();">Apply and Preview Toolpath </button>`);
  noMode(); // Default to NOOP

  if (toolpathsInScene[i].userData.camOperation) {
    $('#toperation' + i).val(toolpathsInScene[i].userData.camOperation).prop('selected', true)
    $('#ttooldia' + i).val(toolpathsInScene[i].userData.camToolDia);
    $('#tstepover' + i).val(toolpathsInScene[i].userData.camStepover);
    $('#tclearanceHeight' + i).val(toolpathsInScene[i].userData.camZClearance);
    $('#tstartHeight' + i).val(toolpathsInScene[i].userData.camZStart);
    $('#tdragoffset' + i).val(toolpathsInScene[i].userData.camDragOffset);
    $('#tspotsize' + i).val(toolpathsInScene[i].userData.camSpotSize);
    $('#tpwr' + i).val(toolpathsInScene[i].userData.camLaserPower);
    $('#tzstep' + i).val(toolpathsInScene[i].userData.camZStep);
    $('#tzdepth' + i).val(toolpathsInScene[i].userData.camZDepth);
    $('#tspeed' + i).val(toolpathsInScene[i].userData.camFeedrate);
    $('#tplungespeed' + i).val(toolpathsInScene[i].userData.camPlungerate);
    $('#tplasmakerf' + i).val(toolpathsInScene[i].userData.camPlasmaKerf);
    $('#tplasmazheight' + i).val(toolpathsInScene[i].userData.camPlasmaZHeight);
    $('#tabdepth' + i).val(toolpathsInScene[i].userData.camTabDepth);
    $('#tabWidth' + i).val(toolpathsInScene[i].userData.camTabWidth);
    $('#tabSpace' + i).val(toolpathsInScene[i].userData.camTabSpace);
    $('#tplasmaihs' + i).val(toolpathsInScene[i].userData.camPlasmaIHS).prop('selected', true);
    $('#tunion' + i).val(toolpathsInScene[i].userData.camUnion).prop('selected', true);
    $('#tOpName' + i).val(toolpathsInScene[i].name);
    $('#statusTitle').html('Configure Toolpath: ' + toolpathsInScene[i].userData.camOperation);
    $('#advanced' + i).prop('checked', toolpathsInScene[i].userData.advanced);
    if (toolpathsInScene[i].userData.advanced) {
      $("#collapsediv1").collapse('show')
    } else {
      $("#collapsediv1").collapse('hide')
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
      $('#tpwr' + i).val(lastused.camLaserPower);
      $('#tzstep' + i).val(lastused.camZStep);
      $('#tzdepth' + i).val(lastused.camZDepth);
      $('#tspeed' + i).val(lastused.camFeedrate);
      $('#tplungespeed' + i).val(lastused.camPlungerate);
      $('#tplasmakerf' + i).val(lastused.camPlasmaKerf);
      $('#tplasmazheight' + i).val(lastused.camPlasmaZHeight);
    }

  };


}

function noMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputlaser').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
}

function laserMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputlaser').show();
  $(".inputlasernooffset").hide();
};

function laserInsideMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputlaser').show();
};

function laserOutsideMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputlaser').show();
};

function cncInsideMode(i) {
  $('.inputlaser').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputcnc').show();
};

function cncOutsideMode(i) {
  $('.inputlaser').hide();
  $('.inputpocket').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputcnc').show();
};

function cncPocketMode(i) {
  $('.inputlaser').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').hide();
  $('.inputcnc').hide();
  $('.inputpocket').show();
  // force open Advanced and force Union by default
  $('#advanced' + i).prop('checked', true);
  $("#collapsediv1").collapse('show')
  $('#tunion' + i).val("Yes").prop('selected', true);
};

function plasmaMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputlaser').hide();
  $('.inputdragknife').hide();
  $('.inputplasma').show();
};


function dragKnifeMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputlaser').hide();
  $('.inputplasma').hide();
  $('.inputdragknife').show();
};