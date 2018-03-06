var toolpathsInScene = [];

function initTree() {
    $('#filetree').on('keyup change','input', function() {
        var inputVal = $(this).val();
        var newval = parseFloat(inputVal, 3)
        var id = $(this).attr('id');
        var objectseq = $(this).attr('objectseq');
        if (!id) {
            return;
        }
        // console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
        if ( id.indexOf('xoffset') == 0 ) {
            objectsInScene[objectseq].position.x = objectsInScene[objectseq].userData.offsetX + newval;
            // console.log('Moving ' +objectsInScene[objectseq].name+ ' to X: '+newval);
            attachBB(objectsInScene[objectseq]);
        } else if ( id.indexOf('yoffset') == 0 ) {
            objectsInScene[objectseq].position.y = objectsInScene[objectseq].userData.offsetY + newval;
            // console.log('Moving ' +objectsInScene[objectseq].name+ ' to Y: '+newval);
            attachBB(objectsInScene[objectseq]);
        } else if ( id.indexOf('svgresol') == 0 ) {
            var svgscale = (25.4 / newval );
            scaleSVGObject(objectsInScene[objectseq], svgscale);
            // objectsInScene[objectseq].scale.x = svgscale;
            // objectsInScene[objectseq].scale.y = svgscale;
            // objectsInScene[objectseq].scale.z = svgscale;
            // putFileObjectAtZero(objectsInScene[objectseq]);
            attachBB(objectsInScene[objectseq]);
        }
    });
    // Fill it up as empty
    fillTree()
}

function addJob() {
    // if (already have toolpaths in toolpathsInScene ) {
    // var toolpath = (select toolpath from modal popup)
    // else
    // var toolpath = new THREE.Group();
    var toolpath = new THREE.Group();
    // 2018: try to switch to this method
    for (i=0; i<objectsInScene.length; i++) {
      var obj = objectsInScene[i];
      obj.traverse( function ( child ) {
        if (child.userData.selected) {
          var copy = child.clone()
          copy.translateX( child.parent.position.x );
          copy.translateY( child.parent.position.y );
          toolpath.add(copy);
        }
      });
    };

    if (toolpath.children.length > 0) {
        toolpath.name = "Vector-"+(toolpathsInScene.length)
        toolpathsInScene.push(toolpath)
    }
    fillTree();
    setupJob(toolpathsInScene.length - 1); // launch modal
}
