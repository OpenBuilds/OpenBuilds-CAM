Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
        ].join('-');
};

var date = new Date();
// date.yyyymmdd();

var obspace = {
  objects: {},
  toolpaths: {}
};

function exportWorkspace() {
  for (i=0; i<objectsInScene.length; i++) {
    obspace.objects[i] = objectsInScene[i].toJSON();
  }
  for (j=0; j<toolpathsInScene.length; j++) {
    obspace.toolpaths[j] = toolpathsInScene[j].toJSON();
  }

  var blob = new Blob([JSON.stringify(obspace)], {type: "text/plain"});
  invokeSaveAsDialog(blob, 'workspace-'+date.yyyymmdd()+'.json');
  // console.log(JSON.stringify(obspace));
}

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
    var loader = new THREE.ObjectLoader();
    if (f) {
        var r = new FileReader();
        if (f.name.match(/.json/i)) {
            r.readAsText(f);
            r.onload = function(event) {
                var newWorkspace = JSON.parse(this.result)
                for (var key in newWorkspace.objects) {
                    var object = loader.parse(newWorkspace.objects[key] );
                    objectsInScene.push(object)
                }
                for (var key in newWorkspace.toolpaths) {
                    var object = loader.parse(newWorkspace.toolpaths[key] );
                    toolpathsInScene.push(object)
                }

                for (i=0; i<toolpathsInScene.length; i++) {
                  toolpathPreview(i);
                }

                console.log(newWorkspace)
                printLog('Loaded imported workspace', msgcolor, "file");
                resetView();
            };
        } else {
            // Not usable
        }
    }
    setTimeout(function(){ fillTree(); }, 250);

}
