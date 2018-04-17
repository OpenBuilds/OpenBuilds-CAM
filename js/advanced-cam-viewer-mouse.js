var mouseState = "select"
var dragcontrols

$(document).ready(function() {
    $('input[type=radio][name=options]').change(function() {
      mouseState=this.value
      console.log(mouseState)

      // select mode
      if (this.value == "select") {
        // setOpacity(toolpathsInScene, 0.6);
        if (dragcontrols) {
          dragcontrols.dispose();
        }
        $('#renderArea').css('cursor','');
      }

      // move mode
      if (this.value == "move") {
        deselectAllObjects()
        // setOpacity(toolpathsInScene, 0.1);
        $('#renderArea').css('cursor','');
        var documents2 = scene.getObjectByName("Documents");
        dragcontrols = new THREE.DragControls(objectsInScene, camera, renderer.domElement);
      }

      // delete mode
      if (this.value == "delete") {
        deselectAllObjects()
        $('#renderArea').css('cursor','');
        if (dragcontrols) {
          dragcontrols.dispose();
        }
        $('#renderArea').awesomeCursor('eraser', {
          color: '#000',
          hotspot: 'bottom left'
        });
      }
      // end if
    }); // end radio.onChange

    $('html').keydown(function(e){
    if(e.keyCode == 46) {
        // alert('Delete key released');
        deleteSelectedObjects();
    }
});
});

function setOpacity(array, opacity) {
  for (i=0; i<array.length; i++) {
    var object = toolpathsInScene[i]
    object.traverse( function ( child ) {
      var depth = 0;
      if (child.userData.camZDepth) {
          depth = child.userData.camZDepth - child.userData.camZStart
      }
      if (child.userData.inflated ) {
        if (child.userData.inflated.userData.pretty) {
          var pretty = child.userData.inflated.userData.pretty
          pretty.traverse( function ( child ) {
            if (child.material) {
              child.material.opacity = (1/depth) * opacity;
            }
          });
        }
      }
    });
  }
}

function deselectAllObjects() {
  for (i=0; i<objectsInScene.length; i++) {
    var object = objectsInScene[i]
    object.traverse( function ( child ) {
      if (child.type == "Line" && child.userData.selected) {
          child.userData.selected = false;
      }
    });
  }
}

function deleteSelectedObjects() {
  for (i=0; i<objectsInScene.length; i++) {
    var object = objectsInScene[i]
    var todelete = []
    object.traverse( function ( child ) {
      if (child.userData.selected && child.userData.link) {
        todelete.push(child)
      }
    });
    for (j=0; j<todelete.length; j++) {
      object.remove(todelete[j])
    }
  }
  fillTree();
}
