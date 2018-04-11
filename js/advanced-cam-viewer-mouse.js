var mouseState = "select"
var dragcontrols

$(document).ready(function() {
    $('input[type=radio][name=options]').change(function() {
      mouseState=this.value
      console.log(mouseState)
      if (this.value == "select") {
        if (dragcontrols) {
          dragcontrols.dispose();
        }
        $('#renderArea').css('cursor','default');
      }
      if (this.value == "move") {
        // $('#renderArea').css('cursor','move');
        for (i=0; i<objectsInScene.length; i++) {
          var object = objectsInScene[i]
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
        $('#renderArea').awesomeCursor('eraser', {
          color: '#000',
          hotspot: 'bottom left'
        });
        // $('#renderArea').css('cursor','url("http://a.deviantart.net/avatars/c/l/clouddustmare.png"), auto');
      }
    });
});
