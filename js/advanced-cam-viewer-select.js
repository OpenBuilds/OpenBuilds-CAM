var mousedown = false,
    mouseup = true,
    mousedowncoords = {},
    offset = {};
var worldstartcoords, worldendcoords;
var selectobj;

function init() {
  selection = document.getElementById( "selection" );
  helpoverlay = document.getElementById( "helpoverlay" );
  listeners();
}

function listeners () {
  $('#renderArea').mousedown(mouseDown);
  $('#renderArea').mouseup(mouseUp);
  $('#renderArea').mousemove(mouseMove);

  $('#selectAll').on('click', function() {
    for (i=0; i<objectsInScene.length; i++) {
      var obj = objectsInScene[i]
      obj.traverse( function ( child ) {
        if (child.type == "Line") {
          child.userData.selected = true
        }
      });
    }
  });

  $('#selectNone').on('click', function() {
    for (i=0; i<objectsInScene.length; i++) {
      var obj = objectsInScene[i]
      obj.traverse( function ( child ) {
        if (child.type == "Line") {
          child.userData.selected = false
        }
      });
    }
  });

  $('#selectInv').on('click', function() {
    for (i=0; i<objectsInScene.length; i++) {
      var obj = objectsInScene[i]
      obj.traverse( function ( child ) {
        if (child.type == "Line") {
          child.userData.selected = !child.userData.selected
        }
      });
    }
  });
}

function delta(num1, num2){
  return (num1 > num2)? num1-num2 : num2-num1
}

function mouseDown (event) {
  if (mouseState == "select") {
    // helpoverlay.style.visibility = "visible";
    if (event.which == 1) { // only on left mousedown
      var pos = {};
      mousedown = true;
      mousedowncoords = {};
      mousedowncoords.x = event.clientX;
      mousedowncoords.y = event.clientY;
      // convert to threejs position
      worldstartcoords = mouseToWorldCoord(event);

      // create copy of all children's selected status so we can later check to ctrl/sel/unselect
      for (i=0; i<objectsInScene.length; i++) {
        var obj = objectsInScene[i]
        obj.traverse( function ( child ) {
          if (child.type == "Line") {
            child.userData.lastSelected = child.userData.selected
            child.geometry.computeBoundingSphere()
          }
        });
      }

      // raycast single click selection


      sceneWidth = document.getElementById("renderArea").offsetWidth;
      sceneHeight = document.getElementById("renderArea").offsetHeight;
      offset = $('#renderArea').offset();
      var isModalOpen = $('#statusmodal').is(':visible'); // dont raycast if modal is over the viewer
      if (!isModalOpen) { // the first 390px = sidebar - we dont want to catch the mouse there..
        mouseVector.x = ( ( event.clientX - offset.left ) / sceneWidth ) * 2 - 1;
        mouseVector.y = - ( ( event.clientY - offset.top ) / sceneHeight ) * 2 + 1
        raycaster.setFromCamera(mouseVector, camera);
        // focus the scope of the intersecting to ONLY documents. Otherwise if there is existing toolpaths, we intersect
        // upwards of 10k objects and slows the filter down immensely
        var documents = scene.getObjectByName("Documents");
        if (documents) {
          var intersects = raycaster.intersectObjects(documents.children, true)
          if (intersects.length > 0) {
            var intersection = intersects[0],
            obj = intersection.object;
            if (obj.name && obj.name != "bullseye" && obj.name != "XY" && obj.name != "GridHelper" && obj.userData.type != "toolpath") {
              // printLog('Clicked on : ' + obj.name, successcolor, "viewer")
              if (!event.ctrlKey) {
                for (i=0; i<objectsInScene.length; i++) {
                  var object = objectsInScene[i]
                  object.traverse( function ( child ) {
                    if (child.type == "Line" && child.userData.selected) {
                        child.userData.selected = false;
                    }
                  });
                }
              }// end clear all

              // Select (or deselect if already selected and control is down)
              if (!obj.userData.selected) {
                obj.userData.selected = true;
              } else {
                obj.userData.selected = false;
              }
            }
          } else { // if nothing intersected we clicked empty space and clear the selection if ctrl is not down
            // Deselecting only if not ctrl.
            // console.log(e.ctrlKey)
            if (!event.ctrlKey) {
              for (i=0; i<objectsInScene.length; i++) {
                var obj = objectsInScene[i]
                obj.traverse( function ( child ) {
                  if (child.type == "Line" && child.userData.selected) {
                      child.userData.selected = false;
                  }
                });
              }
            }
          }
        }
      } // end raycast single click select
    }
  } else if (mouseState == "delete") {
    // helpoverlay.style.visibility = "visible";
    if (event.which == 1) { // only on left mousedown
      // raycast single click selection
      sceneWidth = document.getElementById("renderArea").offsetWidth;
      sceneHeight = document.getElementById("renderArea").offsetHeight;
      offset = $('#renderArea').offset();
      var isModalOpen = $('#statusmodal').is(':visible'); // dont raycast if modal is over the viewer
      if (!isModalOpen) { // the first 390px = sidebar - we dont want to catch the mouse there..
        mouseVector.x = ( ( event.clientX - offset.left ) / sceneWidth ) * 2 - 1;
        mouseVector.y = - ( ( event.clientY - offset.top ) / sceneHeight ) * 2 + 1
        raycaster.setFromCamera(mouseVector, camera);
        // focus the scope of the intersecting to ONLY documents. Otherwise if there is existing toolpaths, we intersect
        // upwards of 10k objects and slows the filter down immensely
        var documents = scene.getObjectByName("Documents");
        if (documents) {
          var intersects = raycaster.intersectObjects(documents.children, true)
          if (intersects.length > 0) {
            var intersection = intersects[0],
            obj = intersection.object;
            if (obj.name && obj.name != "bullseye" && obj.name != "XY" && obj.name != "GridHelper" && obj.userData.type != "toolpath") {
              storeUndo(true);
              printLog('Clicked on : ' + obj.name, successcolor, "viewer")
              console.log(obj.userData.link)
              if (event.ctrlKey) {
                idx = $("#"+obj.userData.link).parent().find('input').attr('id').split('.');
                i = parseInt(idx[1]);
                j = parseInt(idx[2]);
                console.log(i, j);
                objectsInScene.splice('`+i+`', 1)
                fillTree();
              } else {
                idx = $("#"+obj.userData.link).parent().find('input').attr('id').split('.');
                i = parseInt(idx[1]);
                j = parseInt(idx[2]);
                console.log(i, j);
                objectsInScene[i].remove(objectsInScene[i].children[j]);
                fillTree();
              }
            }
          } else {
            // if nothing intersected we clicked empty space
          }
        }
      } // end raycast single click select
    }
  }
}

function mouseUp (event) {
  // event.preventDefault();
  // event.stopPropagation();
  // reset the marquee selection
  mouseup = true;
  mousedown = false;
  selection.style.visibility = "hidden";
  // helpoverlay.style.visibility = "hidden";
  mousedowncoords = {};
  for (i=0; i<objectsInScene.length; i++) {
    var obj = objectsInScene[i]
    obj.traverse( function ( child ) {
      if (child.type == "Line") {
        delete child.userData.lastSelected;
      }
    });
  }
}

function mouseMove (event) {
  // event.preventDefault();
  // event.stopPropagation();
  // make sure we are in a select mode.
  if(mousedown){
    // lets wait for mouse to move at least a few pixels, just to eliminate false "selections" if user is simply clicking on an object (hysteresys)
    if (delta(event.clientX, mousedowncoords.x) > 10 && delta(event.clientX, mousedowncoords.x) > 10 || delta(event.clientX, mousedowncoords.x) < -10 && delta(event.clientX, mousedowncoords.x) < -10) {
      offset = $('#renderArea').offset();
      var md = {};
      md.x = mousedowncoords.x;
      md.y = mousedowncoords.y;
      var ev = {};
      ev.x = event.clientX;
      ev.y = event.clientY;
      var pos = {};
      pos.x = ev.x - md.x;
      pos.y = ev.y - md.y;

      // console.log(pos)
      // square variations
      // (0,0) origin is the TOP LEFT pixel of the canvas.
      //
      //  1 | 2
      // ---.---
      //  4 | 3
      // there are 4 ways a square can be gestured onto the screen.  the following detects these four variations
      // and creates/updates the CSS to draw the square on the screen
      if (pos.x < 0 && pos.y < 0) {
          // console.log("dir0", -pos.x, -pos.y); // bottom right to top left
          selection.style.left = ev.x - offset.left + "px";
          selection.style.top = ev.y - offset.top + "px";
          selection.style.width = -pos.x + "px";
          selection.style.height = -pos.y  + "px";
          selection.style.visibility = "visible";
      } else if ( pos.x > 0 && pos.y < 0) {
          // console.log("dir1"); // bottom left to to right
          selection.style.left = md.x - offset.left + "px";
          selection.style.top = ev.y - offset.top + "px";
          selection.style.width = pos.x + "px";
          selection.style.height = -pos.y + "px";
          selection.style.visibility = "visible";
      } else if (pos.x > 0 && pos.y > 0) {
          // console.log("dir2"); // top left to bottom right
          selection.style.left = md.x - offset.left + "px";
          selection.style.top = md.y - offset.top + "px";
          selection.style.width = pos.x + "px";
          selection.style.height = pos.y + "px";
          selection.style.visibility = "visible";
      } else if (pos.x < 0 && pos.y >= 0) {
          // console.log("dir3");
          selection.style.left = ev.x - offset.left + "px";
          selection.style.top = md.y - offset.top + "px";
          selection.style.width = -pos.x + "px";
          selection.style.height = pos.y + "px";
          selection.style.visibility = "visible";
      } else {
        console.log("Failed to Marquee")
      }
      // convert to threejs position
      worldendcoords = mouseToWorldCoord(event)
      // clear selection in case marquee is shrinking
      if (!event.ctrlKey) {
        for (i=0; i<objectsInScene.length; i++) {
          var obj = objectsInScene[i]
          obj.traverse( function ( child ) {
            if (child.type == "Line" && child.userData.selected) {
                child.userData.selected = false;
            };
          });
        };
      };
      // Update all children (check intersect of centers with marquee)
      scene.updateMatrixWorld();
      for (i=0; i<objectsInScene.length; i++) {
        var obj = objectsInScene[i];
        obj.traverse( function ( child ) {
            if (child.type == "Line") {
                child.geometry.computeBoundingSphere()
                var center = {};
                center.x = child.geometry.boundingSphere.center.x + (child.parent.position.x) + (child.position.x)
                center.y = child.geometry.boundingSphere.center.y + (child.parent.position.y ) + (child.position.y)
                if (XinSelectRange(center.x) && YinSelectRange(center.y))  {
                  if (event.ctrlKey) {
                    child.userData.selected = !child.userData.lastSelected;
                  } else {
                    child.userData.selected = true;
                  };

                };
            };
        });
      }; // end marquee set
    } else {
      // console.log("delta issue")
      // console.log(delta(event.clientX, mousedowncoords.x))
      // console.log(delta(event.clientX, mousedowncoords.x))
    };
  // end ifMouseDown
} else { // just hovering - lets color
    sceneWidth = document.getElementById("renderArea").offsetWidth;
    sceneHeight = document.getElementById("renderArea").offsetHeight;
    offset = $('#renderArea').offset();
    var isModalOpen = $('#statusmodal').is(':visible'); // dont raycast if modal is over the viewer
    if (!isModalOpen) { // the first 390px = sidebar - we dont want to catch the mouse there..
      mouseVector.x = ( ( event.clientX - offset.left ) / sceneWidth ) * 2 - 1;
      mouseVector.y = - ( ( event.clientY - offset.top ) / sceneHeight ) * 2 + 1
      raycaster.setFromCamera(mouseVector, camera);
      // focus the scope of the intersecting to ONLY documents. Otherwise if there is existing toolpaths, we intersect
      // upwards of 10k objects and slows the filter down immensely
      var documents = scene.getObjectByName("Documents");
      if (documents) {
        var intersects = raycaster.intersectObjects(documents.children, true)
        if (intersects.length > 0) {
          for (i=0; i<objectsInScene.length; i++) {
            var obj = objectsInScene[i];
            obj.traverse( function ( child ) {
              if (child.type == "Line") {
                child.userData.hover = false;
              };
            });
          }
          var intersection = intersects[0];
          obj = intersection.object;
          $('#renderArea').css('cursor','pointer');
          obj.traverse( function ( child ) {
              if (child.type == "Line") {
                  child.userData.hover = true;
              }
          });
        } else {
          $('#renderArea').css('cursor','');
          for (i=0; i<objectsInScene.length; i++) {
            var obj = objectsInScene[i];
            obj.traverse( function ( child ) {
              if (child.type == "Line") {
                child.userData.hover = false;
              };
            });
          }
        }
      } // end raycast single click select
    }
  }
};

function XinSelectRange(x) {
  var a = worldstartcoords.x
  var b = worldendcoords.x
  if ((x-a)*(x-b)<0) {
    return true;
  } else {
    return false;
  }
}

function YinSelectRange(y) {
  var a = worldstartcoords.y
  var b = worldendcoords.y
  if ((y-a)*(y-b)<0) {
    return true;
  } else {
    return false;
  }
}

function mouseToWorldCoord(e) {
  var vector = new THREE.Vector3();
  sceneWidth = document.getElementById("renderArea").offsetWidth;
  sceneHeight = document.getElementById("renderArea").offsetHeight;
  offset = $('#renderArea').offset();
  vector.x = ( ( e.clientX - offset.left ) / sceneWidth ) * 2 - 1;
  vector.y = - ( ( e.clientY - offset.top ) / sceneHeight ) * 2 + 1;
  vector.z = 0.5;
  vector.unproject( camera );
  var dir = vector.sub( camera.position ).normalize();
  var distance = - camera.position.z / dir.z;
  var coords = camera.position.clone().add( dir.multiplyScalar( distance ) );
  return coords;
}

$(document).ready(function () {
  init();
});
