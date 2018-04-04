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

  // console.log(JSON.stringify(obspace));
}
