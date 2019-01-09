var toolpathsInScene = [];

function initTree() {
  // $('#filetree').on('keyup change','input', function() {
  //     var inputVal = $(this).val();
  //     var newval = parseFloat(inputVal, 3)
  //     var id = $(this).attr('id');
  //     var objectseq = $(this).attr('objectseq');
  //     if (!id) {
  //         return;
  //     }
  //     // console.log('Value for ' +id+ ' changed to ' +newval+ ' for object ' +objectseq );
  //     if ( id.indexOf('xoffset') == 0 ) {
  //         objectsInScene[objectseq].position.x = objectsInScene[objectseq].userData.offsetX + newval;
  //         // console.log('Moving ' +objectsInScene[objectseq].name+ ' to X: '+newval);
  //         attachBB(objectsInScene[objectseq]);
  //     } else if ( id.indexOf('yoffset') == 0 ) {
  //         objectsInScene[objectseq].position.y = objectsInScene[objectseq].userData.offsetY + newval;
  //         // console.log('Moving ' +objectsInScene[objectseq].name+ ' to Y: '+newval);
  //         attachBB(objectsInScene[objectseq]);
  //     } else if ( id.indexOf('svgresol') == 0 ) {
  //         var svgscale = (25.4 / newval );
  //         scaleSVGObject(objectsInScene[objectseq], svgscale);
  //         // objectsInScene[objectseq].scale.x = svgscale;
  //         // objectsInScene[objectseq].scale.y = svgscale;
  //         // objectsInScene[objectseq].scale.z = svgscale;
  //         // putFileObjectAtZero(objectsInScene[objectseq]);
  //         attachBB(objectsInScene[objectseq]);
  //     }
  // });
  // // Fill it up as empty
  fillTree()
}

function addJob(id) {
  storeUndo(true);
  $("#savetpgcode").addClass("disabled");
  $("#exportGcodeMenu").addClass("disabled");

  // animation to move "doc" to Toolpath - helps user visualise what happened
  $("#flyingdoc").css('top', '50%');
  $("#flyingdoc").css('left', '50%');
  $("#flyingdoc").fadeIn(200);
  var offset = $('#toolpathtree').offset()
  setTimeout(function() {
    $("#flyingdoc").fadeOut(300);
  }, 200);
  $("#flyingdoc").animate({
    left: offset.left + 'px',
    top: offset.top + 'px'
  }, 600);

  var toolpath;
  if (id > -1) { // Use Existing Toolpath
    // console.log("Using existing toolpath: " + id)
    toolpath = toolpathsInScene[id];
  } else {
    // console.log("Creating new toolpath")
    toolpath = new THREE.Group();
  }

  for (i = 0; i < objectsInScene.length; i++) {
    var obj = objectsInScene[i];
    obj.traverse(function(child) {
      if (child.userData.selected) {
        var copy = child.clone()
        console.log("copy:", copy)
        if (copy.geometry.vertices.length < 3) {
          copy.userData.closed = false
        } else if (copy.geometry.vertices.length > 2) {
          var d = distanceFormula(copy.geometry.vertices[0].x, copy.geometry.vertices[copy.geometry.vertices.length - 1].x, copy.geometry.vertices[0].y, copy.geometry.vertices[copy.geometry.vertices.length - 1].y)
          console.log(d)
          if (d < 0.1) {
            copy.userData.closed = true
          }
        }
        copy.position.copy(obj.position);
        toolpath.add(copy);
      }
    });
  };

  if (id == -1) { // New Toolpath
    if (toolpath.children.length > 0) {
      toolpath.name = "Vector-" + (toolpathsInScene.length)
      toolpath.userData.visible = true;
      toolpathsInScene.push(toolpath)
    }
    setTimeout(function() {
      fillTree();
      setupJob(toolpathsInScene.length - 1);
    }, 800); // launch modal
  } else { // Existing toolpath
    // toolpath.children = sortToolpathByGeometryStartpoint(toolpath.children);
    setTimeout(function() {
      fillTree();
      toolpathPreview(id);
    }, 800); // launch modal
  }

}