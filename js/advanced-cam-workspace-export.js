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

  var blob = new Blob([JSON.stringify(obspace),null, 4], {type: "text/plain"});
  invokeSaveAsDialog(blob, 'workspace-'+date.yyyymmdd()+'.json');
  // console.log(JSON.stringify(obspace));
}
