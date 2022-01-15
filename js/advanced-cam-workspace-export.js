Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('-');
};

//https://stackoverflow.com/questions/5223/length-of-a-javascript-object
Object.size = function(obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

var date = new Date();
// date.yyyymmdd();

window.onbeforeunload = saveOnClose;

function saveOnClose() {
  var obspace = {
    objects: {},
    toolpaths: {}
  };
  changePositionToGeoTranslate();
  for (i = 0; i < objectsInScene.length; i++) {
    obspace.objects[i] = objectsInScene[i].toJSON();
  }
  for (j = 0; j < toolpathsInScene.length; j++) {
    obspace.toolpaths[j] = toolpathsInScene[j].toJSON();
  }
  var obspacejson = JSON.stringify(obspace, inflatedReplacer)
  if (undoStore.length > 10) {
    undoStore.length = 10;
  }
  var data = JSON.stringify(obspace, inflatedReplacer)
  localStorage.setItem("lastWorkspace", data)
}

function loadLastClosedOnPageload() {
  var lastWorkspace = localStorage.getItem('lastWorkspace');
  if (lastWorkspace) {
    if (Object.size(JSON.parse(lastWorkspace).objects) > 0 || Object.size(JSON.parse(lastWorkspace).toolpaths) > 0) {

      Metro.dialog.create({
        width: 500,
        title: "Found a recoverable workspace.",
        content: "<div>Would you like to recover the previously used workspace, or would you like to start with a clean New workspace?</div>",
        actions: [{
            caption: "<i class=\"far fa-fw fa-save\"></i>Recover last used Workspace",
            cls: "js-dialog-close success",
            onclick: function() {
              parseLoadWorkspace(lastWorkspace, true)
            }
          },
          {
            caption: "<i class=\"far fa-fw fa-file\"></i>Start with a New workspace",
            cls: "js-dialog-close success",
            onclick: function() {
              // console.log("Starting wtih a clean workspace")
            }
          }
        ]
      });

      // var x = confirm("Found a recoverable workspace.  Would you like to load it, or start with a clean workspace?");
      // if (x) {
      //   parseLoadWorkspace(lastWorkspace)
      //   return true;
      // } else {
      //   return false;
      // }
    }
  }
}

// Undo/Redo Variables
var undoStore = [];
var redoStore = [];

// Undo/Redo Functions
function undo() {
  if (undoStore.length > 0) {
    storeRedo();
    var lastWorkspace = undoStore.shift()
    parseLoadWorkspace(lastWorkspace, false)
  }
}

function redo() {
  if (redoStore.length > 0) {
    storeUndo();
    var lastWorkspace = redoStore.shift()
    parseLoadWorkspace(lastWorkspace, false)
  }
}

function storeUndo(clearArray) {
  if (clearArray) {
    redoStore.length = 0;
  }
  var obspace = {
    objects: {},
    toolpaths: {}
  };
  changePositionToGeoTranslate();
  for (i = 0; i < objectsInScene.length; i++) {
    obspace.objects[i] = objectsInScene[i].toJSON();
  }
  for (j = 0; j < toolpathsInScene.length; j++) {
    obspace.toolpaths[j] = toolpathsInScene[j].toJSON();
  }
  var obspacejson = JSON.stringify(obspace, inflatedReplacer)
  if (undoStore.length > 10) {
    undoStore.length = 10;
  }
  undoStore.unshift(obspacejson)
};

function storeRedo() {
  var obspace = {
    objects: {},
    toolpaths: {}
  };
  changePositionToGeoTranslate();
  for (i = 0; i < objectsInScene.length; i++) {
    obspace.objects[i] = objectsInScene[i].toJSON();
  }
  for (j = 0; j < toolpathsInScene.length; j++) {
    obspace.toolpaths[j] = toolpathsInScene[j].toJSON();
  }
  var obspacejson = JSON.stringify(obspace, inflatedReplacer)
  if (redoStore.length > 10) {
    redoStore.length = 10;
  }
  redoStore.unshift(obspacejson)
};


// Workspace Export Functions

function exportWorkspace() {
  Metro.dialog.create({
    title: "Save Workspace (Export .OBC file)",
    content: `<div class="form-group">
           <label>Filename:</label>
           <input type="text" id="workspaceFilename" placeholder="` + 'workspace-' + date.yyyymmdd() + '.obc' + `" value="` + 'workspace-' + date.yyyymmdd() + '.obc' + `"/>
           <small class="text-muted">What would you like to name the workspace export?</small>
       </div>
    `,
    actions: [{
        caption: "<span class='fas fa-download fa-fw'></span> Save",
        cls: "js-dialog-close primary",
        onclick: function() {
          saveExportWorkspace($('#workspaceFilename').val());
        }
      },
      {
        caption: "Cancel",
        cls: "js-dialog-close",
        onclick: function() {
          //
        }
      }
    ]
  });
}

function saveExportWorkspace(filename) {

  // no .obc extenstion
  if (!filename.endsWith('.obc')) {
    filename = filename += '.obc'
  }

  var obspace = {
    objects: {},
    toolpaths: {}
  };
  changePositionToGeoTranslate();
  for (i = 0; i < objectsInScene.length; i++) {
    obspace.objects[i] = objectsInScene[i].toJSON();
  }
  for (j = 0; j < toolpathsInScene.length; j++) {
    obspace.toolpaths[j] = toolpathsInScene[j].toJSON();
  }
  var data = JSON.stringify(obspace, inflatedReplacer)
  var blob = new Blob([data], {
    type: "text/plain"
  });
  invokeSaveAsDialog(blob, filename);
  // console.log(JSON.stringify(obspace));
}

// Workspace Import Functions
function initExportworkspace() {
  var workspaceImport = document.getElementById('workspaceImport');
  workspaceImport.addEventListener('change', readWorkspace, false);
}

function readWorkspace(evt) {
  console.log(evt)
  var files = evt.target.files || evt.dataTransfer.files;
  for (var i = 0; i < files.length; i++) {
    loadWorkspace(files[i]);
  }
}


function loadWorkspace(f) {
  // Filereader
  if (f) {
    var r = new FileReader();
    if (f.name.match(/.json/i) || f.name.match(/.obc/i)) {
      r.readAsText(f);
      r.onload = function(event) {
        parseLoadWorkspace(this.result)
        console.log(this.result)
      };
      $('.workspaceTitle').html(' - ' + f.name)
    } else {
      // Not usable
    }
  }
  setTimeout(function() {
    fillTree();
  }, 250);
  setTimeout(function() {
    makeGcode();
  }, 500);

}


function IsJsonString(str) {
  try {
    var json = JSON.parse(str);
    return (typeof json === 'object');
  } catch (e) {
    return false;
  }
};

// Parse loaded/undo/redo workspace data
function parseLoadWorkspace(json, resetViewAfter) {
  objectsInScene.length = 0;
  toolpathsInScene.length = 0;
  var loader = new THREE.ObjectLoader();
  if (IsJsonString(json)) {
    var newWorkspace = JSON.parse(json);
  } else {
    var newWorkspace = json;
  }
  $('#documentstree').hide();
  $('#documentactivity').show();
  for (var key in newWorkspace.objects) {
    var object = loader.parse(newWorkspace.objects[key]);
    objectsInScene.push(object)
  }
  // fillTree();
  $('#documentstree').show();
  $('#documentactivity').hide();
  for (var key in newWorkspace.toolpaths) {
    var object = loader.parse(newWorkspace.toolpaths[key]);
    toolpathsInScene.push(object)
  }
  fillTree();
  if (resetViewAfter) {
    resetView();
  }
  setTimeout(function() {
    for (i = 0; i < toolpathsInScene.length; i++) {
      toolpathPreview(i);
    }
  }, 200);
  if (resetView) {
    resetView();
  }
  return true;
}

// fix for .toJSON not supporting the export of .position data: https://github.com/mrdoob/three.js/issues/13903
function changePositionToGeoTranslate() {
  for (i = 1; i < objectsInScene.length; i++) {
    var object = objectsInScene[i]
    for (j = 1; j < object.children.length; j++) {
      object.children[j].geometry.translate(object.children[j].position.x, object.children[j].position.y, 0)
      object.children[j].geometry.translate(object.position.x, object.position.y, 0)
      object.children[j].geometry.verticesNeedUpdate = true
      object.children[j].position.x = 0;
      object.children[j].position.y = 0;
    }
    object.position.x = 0;
    object.position.y = 0;
  }
}