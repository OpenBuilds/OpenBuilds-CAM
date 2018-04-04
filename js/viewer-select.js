
var mousedown = false,
    mouseup = true,
    mousedowncoords = {},
    offset = {};
var worldstartcoords, worldendcoords;
var selectobj;

function init() {
  selection = document.getElementById( "selection" );
  listeners();
}

function listeners () {
  $('#renderArea').mousedown(mouseDown);
  $('#renderArea').mouseup(mouseUp);
  $('#renderArea').mousemove(mouseMove);
}

function resetMarquee () {
  mouseup = true;
  mousedown = false;
  selection.style.visibility = "hidden";
  mousedowncoords = {};
}

function mouseDown (event) {
  event.preventDefault();
  // create copy of all children's selected status so we can later check to ctrl/sel/unselect
  for (i=0; i<objectsInScene.length; i++) {
    var obj = objectsInScene[i]
    obj.traverse( function ( child ) {
        if (child.type == "Line") {
          child.userData.lastSelected = child.userData.selected
        }
    });
  }
  var pos = {};
  mousedown = true;
  mousedowncoords = {};

  mousedowncoords.x = event.clientX;
  mousedowncoords.y = event.clientY;

  var vector = new THREE.Vector3();
  sceneWidth = document.getElementById("renderArea").offsetWidth;
  sceneHeight = document.getElementById("renderArea").offsetHeight;
  offset = $('#renderArea').offset();
  vector.x = ( ( event.clientX - offset.left ) / sceneWidth ) * 2 - 1;
  vector.y = - ( ( event.clientY - offset.top ) / sceneHeight ) * 2 + 1
  vector.z = 0.5;
  vector.unproject( camera );
  var dir = vector.sub( camera.position ).normalize();
  var distance = - camera.position.z / dir.z;
  worldstartcoords = camera.position.clone().add( dir.multiplyScalar( distance ) );

}

function mouseUp (event) {
  event.preventDefault();
  event.stopPropagation();
  // reset the marquee selection
  resetMarquee();
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
  event.preventDefault();
  event.stopPropagation();

  // make sure we are in a select mode.
  if(mousedown){

    var pos = {};
    pos.x = event.clientX - mousedowncoords.x;
    pos.y = event.clientY - mousedowncoords.y;

    // square variations
    // (0,0) origin is the TOP LEFT pixel of the canvas.
    //
    //  1 | 2
    // ---.---
    //  4 | 3
    // there are 4 ways a square can be gestured onto the screen.  the following detects these four variations
    // and creates/updates the CSS to draw the square on the screen
    if (pos.x < 0 && pos.y < 0) {
        selection.style.left = event.clientX + "px";
        selection.style.top = event.clientY + "px";
        selection.style.width = -pos.x + "px";
        selection.style.height = -pos.y + "px";
        selection.style.visibility = "visible";
    } else if ( pos.x >= 0 && pos.y <= 0) {
        selection.style.left = mousedowncoords.x + "px";
        selection.style.top = event.clientY + "px";
        selection.style.width = pos.x + "px";
        selection.style.height = -pos.y + "px";
        selection.style.visibility = "visible";
    } else if (pos.x >= 0 && pos.y >= 0) {
        selection.style.left = mousedowncoords.x + "px";
        selection.style.top = mousedowncoords.y + "px";
        selection.style.width = pos.x + "px";
        selection.style.height = pos.y + "px";
        selection.style.visibility = "visible";
    } else if (pos.x < 0 && pos.y >= 0) {
        selection.style.left = event.clientX + "px";
        selection.style.top = mousedowncoords.y + "px";
        selection.style.width = -pos.x + "px";
        selection.style.height = pos.y + "px";
        selection.style.visibility = "visible";
    }
    var vector = new THREE.Vector3();
    sceneWidth = document.getElementById("renderArea").offsetWidth;
    sceneHeight = document.getElementById("renderArea").offsetHeight;
    offset = $('#renderArea').offset();
    vector.x = ( ( event.clientX - offset.left ) / sceneWidth ) * 2 - 1;
    vector.y = - ( ( event.clientY - offset.top ) / sceneHeight ) * 2 + 1
    vector.z = 0.5;
    vector.unproject( camera );
    var dir = vector.sub( camera.position ).normalize();
    var distance = - camera.position.z / dir.z;
    worldendcoords = camera.position.clone().add( dir.multiplyScalar( distance ) );
    scene.updateMatrixWorld();
    for (i=0; i<objectsInScene.length; i++) {
      var obj = objectsInScene[i]
      obj.traverse( function ( child ) {
          if (child.type == "Line") {
              var center = {}
              center.x = child.geometry.boundingSphere.center.x - (sizexmax / 2)
              center.y = child.geometry.boundingSphere.center.y - (sizeymax /2 )
              if (XinSelectRange(center.x) && YinSelectRange(center.y))  {
                if (event.ctrlKey) {
                  child.userData.selected = !child.userData.lastSelected;
                } else {
                  child.userData.selected = true;
                }

              }
          }
      });
    }
  }
}

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

$(document).ready(function () {
  init();
});
