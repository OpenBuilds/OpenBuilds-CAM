var mouseState = "select"
var dragcontrols

$(document).ready(function() {
    $('input[type=radio][name=options]').change(function() {
      mouseState=this.value
      console.log(mouseState)
      if (this.value == "select") {
        for (i=0; i<toolpathsInScene.length; i++) {
          var obj = toolpathsInScene[i]
          obj.traverse( function ( child ) {
            if (child.material) {
              child.material.opacity = 0.6;
            }
          });
        }
        if (dragcontrols) {
          dragcontrols.dispose();
        }
        $('#renderArea').css('cursor','default');
      }
      if (this.value == "move") {
        // $('#renderArea').css('cursor','move');
        for (i=0; i<toolpathsInScene.length; i++) {
          var object = toolpathsInScene[i]
          object.traverse( function ( child ) {
            if (child.type == "Line" && child.userData.selected) {
                child.userData.selected = false;
            }
          });
        }
        var documents2 = scene.getObjectByName("Documents");
        dragcontrols = new THREE.DragControls(objectsInScene, camera, renderer.domElement);
      }
      if (this.value == "delete") {
        if (dragcontrols) {
          dragcontrols.dispose();
        }
        for (i=0; i<toolpathsInScene.length; i++) {
          var obj = toolpathsInScene[i]
          obj.traverse( function ( child ) {
            // if (child.type == "Line") {
            if (child.material) {
              child.material.opacity = 0.01;
            }
            // }
          });
        }
        $('#renderArea').awesomeCursor('eraser', {
          color: '#000',
          hotspot: 'bottom left'
        });
        // $('#renderArea').css('cursor','url("http://a.deviantart.net/avatars/c/l/clouddustmare.png"), auto');
      }
    });
});
