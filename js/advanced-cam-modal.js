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

    var id = $(this).attr('id');
    var objectseq = $(this).attr('objectseq');

    if (id.indexOf('tzstep') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tspeed') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tplungespeed') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('ttooldia') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tstepover') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tclearanceHeight') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tstartHeight') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tdirection') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tunion') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tabdepth') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tabWidth') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tabSpace') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tOpName') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('tRampPlunge') == 0) {
      updateCamUserData(objectseq);
    } else if (id.indexOf('advanced') == 0) {
      updateCamUserData(objectseq);
    }

  });

  $('#statusBody2').on('keyup change', 'select', function() {
    var newval = $(this).val();
    var id = $(this).attr('id');
    var objectseq = $(this).attr('objectseq');
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
  toolpathsInScene[i].userData.camZStep = $('#tzstep' + i).val();
  toolpathsInScene[i].userData.camZDepth = $('#tzdepth' + i).val();
  toolpathsInScene[i].userData.camFeedrate = $('#tspeed' + i).val();
  toolpathsInScene[i].userData.camPlungerate = $('#tplungespeed' + i).val();
  toolpathsInScene[i].userData.camUnion = $('#tunion' + i).val();
  toolpathsInScene[i].userData.camDirection = $('#tdirection' + i).val();
  toolpathsInScene[i].userData.camTabDepth = $('#tabdepth' + i).val();
  toolpathsInScene[i].userData.camTabWidth = $('#tabWidth' + i).val();
  toolpathsInScene[i].userData.camTabSpace = $('#tabSpace' + i).val();
  toolpathsInScene[i].userData.tRampPlunge = $('#tRampPlunge' + i).val();
  toolpathsInScene[i].userData.advanced = $('#advanced' + i).is(":checked");; 
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

 // Updated parameters for bit selection
function setBit(i,bitDia,zSafe,feedRate,stepDepth,plungeRate,zCutDepth){
  
   $('#ttooldia' + i).val(bitDia);
   $('#tclearanceHeight' + i).val(zSafe);
   $('#tspeed' + i).val(feedRate);
   $('#tzdepth' + i).val(zCutDepth);
   $('#tplungespeed' + i).val(plungeRate);
   $('#tzstep' + i).val(stepDepth);

   updateCamUserData(i);
}



function setupJob(i) {

  // Set parameters for bit list
  if(document.getElementById("unitSwitch").checked){
    var bit = ['0.031','0.063','0.125','0.250','0.375','0.500']
    var feedRate = ['25','50','100','80','75','70']
    var stepDepth = ['0.015','0.031','0.063','0.08','0.08','0.030']
    var plungeRate = ['12','25','50','40','37','35']
    var setUnitText="inch";
    var setSpeedUnitText="inches/min";
    var zSafe="0.5"
    var zCutDepth="0.25";
  }else{
    var bit = ['1.0','2.0','3.0','4.0','5.0','6.0']
    var feedRate = ['225','550','1000','800','750','700']
    var stepDepth = ['0.5','1.0','1.5','2.0','2.5','3.0']
    var plungeRate = ['125','250','500','400','375','350']
    var setUnitText="mm";
    var setSpeedUnitText="mm/min";
    var zSafe="10"
    var zCutDepth="6.0";
   
  }




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
          <div ">
            <input data-role="input" autofocus type="text" class="cam-form-field cam-form-field-right active-border" value="${toolpathsInScene[i].name}" id="tOpName${i}"  objectseq="${i}" style="width: 350px; min="0" style="text-align: center;">
          </div>
        </td>
      </tr>

      <tr>
        <td>Type of cut: </td>
        <td>
          <div class="input-addon">
            <select class="cam-form-field cam-form-field-right active-border camOperationSelect" id="toperation${i}" objectseq="${i}" style="width: 350px; border-left: solid 1px #ccc; padding: 0px; padding-left: 10px;">
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
      <tr class="inputcnc inputpocket inputdrill inputdrillpeck">
        <td>Bit Diameter</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border"  value="6.0"" id="ttooldia${i}"  objectseq="${i}" min="0" step="any">
            <span class="input-addon-label-right active-border">${setUnitText}</span>
            <div class="dropdown-button ">
                <button class="button success dropdown-toggle"  style="margin: 2px"  >Select Bit</button>
                <ul class="d-menu" data-role="dropdown" style="padding: 5px 15px; font-size:18px">
                  <li onclick="setBit(${i},${bit[0]},${zSafe},${feedRate[0]},${stepDepth[0]},${plungeRate[0]},${zCutDepth})" >${bit[0]}</li> 
                  <li onclick="setBit(${i},${bit[1]},${zSafe},${feedRate[1]},${stepDepth[1]},${plungeRate[1]},${zCutDepth})" >${bit[1]}</li> 
                  <li onclick="setBit(${i},${bit[2]},${zSafe},${feedRate[2]},${stepDepth[2]},${plungeRate[2]},${zCutDepth})" >${bit[2]}</li> 
                  <li onclick="setBit(${i},${bit[3]},${zSafe},${feedRate[3]},${stepDepth[3]},${plungeRate[3]},${zCutDepth})" >${bit[3]}</li> 
                  <li onclick="setBit(${i},${bit[4]},${zSafe},${feedRate[4]},${stepDepth[4]},${plungeRate[4]},${zCutDepth})" >${bit[4]}</li> 
                  <li onclick="setBit(${i},${bit[5]},${zSafe},${feedRate[5]},${stepDepth[5]},${plungeRate[5]},${zCutDepth})" >${bit[5]}</li> 
                  
                </ul>
            </div>
          </div>
        </td>
      </tr>
      <tr class="inputpocket">
        <td>Stepover</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="40" id="tstepover${i}"  objectseq="${i}" min="0" step="any">
            <span class="input-addon-label-right active-border">%</span>
          </div>
        </td>
      </tr>
      <tr class="inputcnc  inputpocket inputdrill inputdrillpeck">
        <td>Z Safe Height</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="10" id="tclearanceHeight${i}"  objectseq="${i}" min="0" step="any">
            <span class="input-addon-label-right active-border">${setUnitText}</span>
            </div>
        </td>
      </tr>
           <tr class="inputcnc inputpocket inputdrillpeck">
        <td>Cut Depth: per Pass</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" id="tzstep${i}" value="1" objectseq="${i}" min="0" step="any">
            <span class="input-addon-label-right active-border">${setUnitText}</span>
            </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket inputdrill inputdrillpeck">
        <td>Cut Depth: Final</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" id="tzdepth${i}" value="6" objectseq="${i}" min="0" step="any">
            <span class="input-addon-label-right active-border">${setUnitText}</span>
            </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket ">
        <td>Feedrate (X/Y)</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="1000" id="tspeed${i}" objectseq="${i}" min="0" step="any" >
            <span class="input-addon-label-right active-border">${setSpeedUnitText}</span>
            </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket inputdrill inputdrillpeck">
        <td>Feedrate: Plunge</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="300" id="tplungespeed${i}" objectseq="${i}" min="0" step="any">
            <span class="input-addon-label-right active-border">${setSpeedUnitText}</span>
            </div>
        </td>
      </tr>
     

      </table>


    <div>
      <input type="checkbox" data-role="switch" data-caption="Advanced Settings" id="advanced${i}" objectseq="${i}" >
    </div>
    <div data-role="collapse" data-collapsed="true" data-toggle-element="#advanced${i}" id="collapsediv${i}">

    <table class="table striped compact">
      
      </tr>
      <tr class="inputcnc inputpocket">
        <td>Cutting Direction:</td>
        <td>
          <div class="input-addon">
            <select class="cam-form-field cam-form-field-right active-border" id="tdirection${i}" objectseq="${i}" style="width: 280px; border-left: solid 1px #ccc; padding: 0px; padding-left: 10px;">
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
            <select class="cam-form-field cam-form-field-right active-border" id="tunion${i}" objectseq="${i}" style="width: 280px; border-left: solid 1px #ccc; padding: 0px; padding-left: 10px;">
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
            <select class="cam-form-field cam-form-field-right active-border" id="tRampPlunge${i}" objectseq="${i}" style="width: 280px; border-left: solid 1px #ccc; padding: 0px; padding-left: 10px;">
              <option selected>No</option>
              <option>Yes</option>
            </select>
          </div>
        </td>
      </tr>
      <tr class="inputcnc inputpocket inputdrill inputdrillpeck">
        <td>Cut Depth: Start</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="0" id="tstartHeight${i}"  objectseq="${i}" min="1" step="any">
            <span class="input-addon-label-right active-border">${setUnitText}</span>
            </div>
        </td>
      </tr>
      <tr class="inputcnc">
        <td>Tabs: Height</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="0" id="tabdepth${i}" objectseq="${i}" step="any">
            <span class="input-addon-label-right active-border">${setUnitText}</span>
            </div>
        </td>
      </tr>
      <tr class="inputcnc">
        <td>Tabs: Width</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="6" id="tabWidth${i}" objectseq="${i}" min="0" step="any">
            <span class="input-addon-label-right active-border">${setUnitText}</span>
            </div>
        </td>
      </tr>
      <tr class="inputcnc">
        <td>Tabs: Spacing</td>
        <td>
          <div class="input-addon">
            <input data-role="input" data-clear-button="false" type="number" class="cam-form-field active-border" value="50" id="tabSpace${i}" objectseq="${i}" min="0" step="any">
            <span class="input-addon-label-right active-border">${setUnitText}</span>
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
    $('#toperation' + i).val(toolpathsInScene[i].userData.camOperation).prop('selected', true)
    $('#ttooldia' + i).val(toolpathsInScene[i].userData.camToolDia);
    $('#tstepover' + i).val(toolpathsInScene[i].userData.camStepover);
    $('#tclearanceHeight' + i).val(toolpathsInScene[i].userData.camZClearance);
    $('#tstartHeight' + i).val(toolpathsInScene[i].userData.camZStart);
    $('#tzstep' + i).val(toolpathsInScene[i].userData.camZStep);
    $('#tzdepth' + i).val(toolpathsInScene[i].userData.camZDepth);
    $('#tspeed' + i).val(toolpathsInScene[i].userData.camFeedrate);
    $('#tplungespeed' + i).val(toolpathsInScene[i].userData.camPlungerate);
    $('#tabdepth' + i).val(toolpathsInScene[i].userData.camTabDepth);
    $('#tabWidth' + i).val(toolpathsInScene[i].userData.camTabWidth);
    $('#tabSpace' + i).val(toolpathsInScene[i].userData.camTabSpace);
    if (toolpathsInScene[i].userData.tRampPlunge) {
      $('#tRampPlunge' + i).val(toolpathsInScene[i].userData.tRampPlunge).prop('selected', true);
    } else {
      $('#tRampPlunge' + i).val("No").prop('selected', true);
    }
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
      $('#tzstep' + i).val(lastused.camZStep);
      $('#tzdepth' + i).val(lastused.camZDepth);
      $('#tspeed' + i).val(lastused.camFeedrate);
      $('#tplungespeed' + i).val(lastused.camPlungerate);
      $('#tstartHeight' + i).val(lastused.camZStart);
      $('#tdirection' + i).val(lastused.camDirection);
      //$('#tabdepth' + i).val(lastused.camTabDepth);
      //$('#tabWidth' + i).val(lastused.camTabWidth);
      //$('#tabSpace' + i).val(lastused.camTabSpace);
      //$('#tRampPlunge' + i).val(lastused.tRampPlunge);
     }
  };
}

function noMode(i) {
  $('.inputcnc').hide();
  $('.inputpocket').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
 
}

function drillMode(i) {
  $('.inputpocket').hide();
  $('.inputcnc').hide();
  $('.inputdrillpeck').hide();
  $('.inputdrill').show();
}

function drillPeckMode(i) {
  $('.inputpocket').hide();
  $('.inputcnc').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').show();

}

function cncInsideMode(i) {
  $('.inputpocket').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputcnc').show();
}

function cncOutsideMode(i) {
  $('.inputpocket').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputcnc').show();
}

function cncNoOffsetMode(i) {
  $('.inputpocket').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
  $('.inputcnc').show();
}

function cncPocketMode(i) {
  $('.inputcnc').hide();
  $('.inputdrill').hide();
  $('.inputdrillpeck').hide();
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