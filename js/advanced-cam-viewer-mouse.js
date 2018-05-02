var mouseState = "select"
var dragcontrols

function initMouseMode() {
  $('input[type=radio][name=options]').change(function() {
    mouseState = this.value
    console.log(mouseState)

    // select mode
    if (this.value == "select") {
      $("#mouseSelectBtn").removeClass('btn-dark').addClass('focus').addClass('btn-success');
      $("#mouseMoveBtn").addClass('btn-dark').removeClass('focus').removeClass('btn-success');
      $("#mouseDelBtn").addClass('btn-dark').removeClass('focus').removeClass('btn-success');
      // setOpacity(toolpathsInScene, 0.6);
      if (dragcontrols) {
        dragcontrols.dispose();
      }
      // $('#renderArea').css('cursor', '');
      if (controls.enableRotate) {
        helpoverlay.innerHTML = "<kbd>Left Mouse</kbd> = Select / <kbd>Middle Mouse</kbd> = Orbit / <kbd>Right Mouse</kbd> = Pan / <kbd>Wheel</kbd> = Zoom / <kbd>Ctrl</kbd> = Multiple Select / <kbd>Del</kbd> = Delete Selected"
      } else {
        helpoverlay.innerHTML = "<kbd>Left Mouse</kbd> = Select / <kbd>Right Mouse</kbd> = Pan / <kbd>Wheel</kbd> = Zoom / <kbd>Ctrl</kbd> = Multiple Select / <kbd>Del</kbd> = Delete Selected"
      }
    }

    // move mode
    if (this.value == "move") {
      $("#mouseMoveBtn").removeClass('btn-dark').addClass('focus').addClass('btn-success');
      $("#mouseSelectBtn").addClass('btn-dark').removeClass('focus').removeClass('btn-success');
      $("#mouseDelBtn").addClass('btn-dark').removeClass('focus').removeClass('btn-success');
      deselectAllObjects()
      // setOpacity(toolpathsInScene, 0.1);
      // $('#renderArea').css('cursor', '');
      var documents2 = scene.getObjectByName("Documents");
      dragcontrols = new THREE.DragControls(objectsInScene, camera, renderer.domElement);
      // helpoverlay.style.visibility = "visible";
      helpoverlay.innerHTML = "<kbd>Left Mouse Drag</kbd> = Select Document to move / <kbd>Ctrl+Left Mouse Drag</kbd> = Select entity to move / <kbd>Del</kbd> = Delete Selected"

    }

    // delete mode
    if (this.value == "delete") {
      $("#mouseDelBtn").removeClass('btn-dark').addClass('focus').addClass('btn-success');
      $("#mouseMoveBtn").addClass('btn-dark').removeClass('focus').removeClass('btn-success');
      $("#mouseSelectBtn").addClass('btn-dark').removeClass('focus').removeClass('btn-success');
      deselectAllObjects()
      $('#renderArea').css('cursor', '');
      if (dragcontrols) {
        dragcontrols.dispose();
      }
      // $('#renderArea').awesomeCursor('eraser', {
      //   color: '#000',
      //   hotspot: 'bottom left'
      // });
      helpoverlay.innerHTML = "<kbd>Left Mouse Click</kbd> = delete Entity / <kbd>Ctrl + Left Mouse Click</kbd> = Delete entire Document / <kbd>Del</kbd> = Delete Selected"
    }
    // end if
  }); // end radio.onChange

};

function setOpacity(array, opacity) {
  for (i = 0; i < array.length; i++) {
    var object = toolpathsInScene[i]
    object.traverse(function(child) {
      var depth = 0;
      if (child.userData.camZDepth) {
        depth = child.userData.camZDepth - child.userData.camZStart
      }
      if (child.userData.inflated) {
        if (child.userData.inflated.userData.pretty) {
          var pretty = child.userData.inflated.userData.pretty
          pretty.traverse(function(child) {
            if (child.material && child.type == "Mesh") {
              // child.material.opacity = opacity / depth;
              child.material.opacity = opacity / depth;
            } else if (child.material && child.type == "Line") {
              // child.material.opacity = (opacity / depth )+0.25;
              child.material.opacity = opacity + 0.25;
            }
          });
        }
      }
    });
  }
}

function deselectAllObjects() {
  for (i = 0; i < objectsInScene.length; i++) {
    var object = objectsInScene[i]
    object.traverse(function(child) {
      if (child.type == "Line" && child.userData.selected) {
        child.userData.selected = false;
      }
    });
  }
}

function deleteSelectedObjects() {
  for (i = 0; i < objectsInScene.length; i++) {
    var object = objectsInScene[i]
    var todelete = []
    object.traverse(function(child) {
      if (child.userData.selected && child.userData.link) {
        todelete.push(child)
      }
    });
    for (j = 0; j < todelete.length; j++) {
      object.remove(todelete[j])
    }
  }
  fillTree();
}

function updateCloneMoves() {
  for (i = 0; i < toolpathsInScene.length; i++) {
    var object = toolpathsInScene[i]
    object.traverse(function(child) {

    });
  }
}