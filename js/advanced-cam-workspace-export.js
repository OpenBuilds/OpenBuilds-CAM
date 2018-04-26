Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('-');
};

var date = new Date();
// date.yyyymmdd();


// Undo/Redo Variables
var undoStore = [];
var redoStore = [];

// Undo/Redo Events
$(document).keydown(function(e) {
  if (e.which === 90 && e.ctrlKey && e.shiftKey) {
    console.log('control + shift + z');
    redo();
  } else if (e.which === 90 && e.ctrlKey) {
    console.log('control + z');
    undo()
  } else if (e.which === 89) {
    console.log('control + y');
    redo()
  }
});
var setUndoRedoBtn = setInterval(function() {
  if (undoStore.length > 0) {
    $("#undoBtn").prop('disabled', false);
  } else {
    $("#undoBtn").prop('disabled', true);
  }
  if (redoStore.length > 0) {
    $("#redoBtn").prop('disabled', false);
  } else {
    $("#redoBtn").prop('disabled', true);
  }
}, 200);

// Undo/Redo Functions
function undo() {
  if (undoStore.length > 0) {
    storeRedo();
    var lastWorkspace = undoStore.shift()
    parseLoadWorkspace(lastWorkspace)
  }
}

function redo() {
  if (redoStore.length > 0) {
    storeUndo();
    var lastWorkspace = redoStore.shift()
    parseLoadWorkspace(lastWorkspace)
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
  invokeSaveAsDialog(blob, 'workspace-' + date.yyyymmdd() + '.json');
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
    if (f.name.match(/.json/i)) {
      r.readAsText(f);
      r.onload = function(event) {
        parseLoadWorkspace(this.result)
      };
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


// Parse loaded/undo/redo workspace data
function parseLoadWorkspace(json) {
  objectsInScene.length = 0;
  toolpathsInScene.length = 0;
  var loader = new THREE.ObjectLoader();
  var newWorkspace = JSON.parse(json)
  for (var key in newWorkspace.objects) {
    var object = loader.parse(newWorkspace.objects[key]);
    objectsInScene.push(object)
  }
  fillTree();
  for (var key in newWorkspace.toolpaths) {
    var object = loader.parse(newWorkspace.toolpaths[key]);
    toolpathsInScene.push(object)
  }

  for (i = 0; i < toolpathsInScene.length; i++) {
    toolpathPreview(i);
  }
  // console.log(newWorkspace)
  // printLog('Loaded imported workspace', msgcolor, "file");
  // resetView();
}

// fix for .toJSON not supporting the export of .position data: https://github.com/mrdoob/three.js/issues/13903
function changePositionToGeoTranslate() {
  for (i = 0; i < objectsInScene.length; i++) {
    var object = objectsInScene[i]
    for (j = 0; j < object.children.length; j++) {
      object.children[j].geometry.translate(object.children[j].position.x, object.children[j].position.y, 0)
      object.children[j].geometry.translate(object.position.x, object.position.y, 0)
      object.children[j].position.x = 0;
      object.children[j].geometry.verticesNeedUpdate = true
      object.children[j].position.y = 0;
    }
    object.position.x = 0;
    object.position.y = 0;
  }
}