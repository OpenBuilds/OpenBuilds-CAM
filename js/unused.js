// Function probably dead by now

// Set selection, add bounding box
// function attachBB(object, e) { // e = mouseclick event)
//   if (e) { // from a Mouseclick event on 3d Viewer
//     // console.log("Ctrl: " +  e.ctrlKey)
//     if (object.userData) {
//       if (!e.ctrlKey) { // if Ctrl is not down, clear other selections and only select the object clicked on
//         for (i = 0; i < objectsInScene.length; i++) {
//           var obj = objectsInScene[i]
//           obj.traverse(function(child) {
//             if (child.type == "Line" && child.userData.selected) {
//               // console.log("Setting false on " + i + " - " + child.name)
//               child.userData.selected = false;
//               // child.material.color.setRGB(0.1, 0.1, 0.1);
//             }
//           });
//         }
//       } // end clear all
//       if (!object.userData.selected) {
//         object.userData.selected = true;
//       } else {
//         object.userData.selected = false;
//         if (typeof(boundingBox) != 'undefined') {
//           scene.remove(boundingBox);
//         }
//       }
//     }
//   } else { // not from a mouseclick event on 3d viewer
//     if (object.userData) {
//       if (!object.userData.selected) {
//         object.userData.selected = true;
//       } else {
//         object.userData.selected = false;
//         if (typeof(boundingBox) != 'undefined') {
//           scene.remove(boundingBox);
//         }
//       }
//     }
//   }
//
//   if (typeof(boundingBox) != 'undefined') {
//     scene.remove(boundingBox);
//   }
//
//   if (object.userData.selected) {
//     var bbox2 = new THREE.Box3().setFromObject(object);
//     // console.log('bbox for Clicked Obj: '+ object +' Min X: ', (bbox2.min.x + (sizexmax / 2)), '  Max X:', (bbox2.max.x + (sizexmax / 2)), 'Min Y: ', (bbox2.min.y + (sizeymax / 2)), '  Max Y:', (bbox2.max.y + (sizeymax / 2)));
//     BBmaterial = new THREE.LineDashedMaterial({
//       color: 0xaaaaaa,
//       dashSize: 5,
//       gapSize: 4,
//       linewidth: 2
//     });
//     BBgeometry = new THREE.Geometry();
//     BBgeometry.vertices.push(
//       new THREE.Vector3((bbox2.min.x - 1), (bbox2.min.y - 1), 0),
//       new THREE.Vector3((bbox2.min.x - 1), (bbox2.max.y + 1), 0),
//       new THREE.Vector3((bbox2.max.x + 1), (bbox2.max.y + 1), 0),
//       new THREE.Vector3((bbox2.max.x + 1), (bbox2.min.y - 1), 0),
//       new THREE.Vector3((bbox2.min.x - 1), (bbox2.min.y - 1), 0)
//     );
//     BBgeometry.computeLineDistances(); //  NB If not computed, dashed lines show as solid
//     boundingBoxLines = new THREE.Line(BBgeometry, BBmaterial);
//     boundingBox = new THREE.Group();
//     boundingBox.add(boundingBoxLines)
//     var bwidth = parseFloat(bbox2.max.x - bbox2.min.x).toFixed(2);
//     var bheight = parseFloat(bbox2.max.y - bbox2.min.y).toFixed(2);
//     widthlabel = this.makeSprite(this.scene, "webgl", {
//       x: (bbox2.max.x + 30),
//       y: ((bbox2.max.y - ((bbox2.max.y - bbox2.min.y) / 2)) + 10),
//       z: 0,
//       text: "W: " + bwidth + "mm",
//       color: "#aaaaaa",
//       size: 6
//     });
//     boundingBox.add(widthlabel)
//     heightlabel = this.makeSprite(this.scene, "webgl", {
//       x: ((bbox2.max.x - ((bbox2.max.x - bbox2.min.x) / 2)) + 10),
//       y: (bbox2.max.y + 10),
//       z: 0,
//       text: "H: " + bheight + "mm",
//       color: "#aaaaaa",
//       size: 6
//     });
//     boundingBox.add(heightlabel)
//     boundingBox.name = "Bounding Box"
//     scene.add(boundingBox);
//   }
// }

function colorobj(name) {
  var object = scene.getObjectByName(name, true);
  console.log(object)
  object.material.color.setHex(0xFF0000);
  object.material.needsUpdate = true;
}

$('#rotLeftBtn').on('click', function() {
  if (fileParentGroup) {
    fileObject.rotateZ(Math.PI / 4);
    putFileObjectAtZero();
  }
});

$('#rotRightBtn').on('click', function() {
  if (fileParentGroup) {
    fileObject.rotateZ(Math.PI / -4);
    putFileObjectAtZero();
  }
});

$('#resetRot').on('click', function() {
  if (fileParentGroup) {
    fileObject.rotation.z = 0;
    putFileObjectAtZero();
  }
});

$("#rotationval").change(function() {
  var rotation = $(this).val();
  console.log('Rotating from ', ((fileObject.rotation.z / Math.PI * 180).toFixed(0) * -1), ' to ', rotation);
  fileObject.rotateZ((rotation * Math.PI / 180) * -1);
  putFileObjectAtZero();
});


$('#translateBtn').on('click', function() {
  if ($("#translateBtn").hasClass("btn-primary")) {
    $("#translateBtn").removeClass("btn-primary")
    $("#translateBtn").addClass("btn-default")
    scene.remove(control);
    controls.enableZoom = true; // optional
    controls.enablePan = true;
    controls.enableRotate = true;
  } else {
    $("#translateBtn").removeClass("btn-default")
    $("#resizeBtn").removeClass("btn-primary")
    $("#resizeBtn").addClass("btn-default")
    $("#translateBtn").addClass("btn-primary")
    control.setMode("translate");
    scene.add(control);
    controls.enableZoom = false; // optional
    controls.enablePan = false;
    controls.enableRotate = false;
  };
});

$('#resizeBtn').on('click', function() {
  if ($("#resizeBtn").hasClass("btn-primary")) {
    $("#resizeBtn").removeClass("btn-primary")
    $("#resizeBtn").addClass("btn-default")
    scene.remove(control);
    controls.enableZoom = true; // optional
    controls.enablePan = true;
    controls.enableRotate = true;
  } else {
    $("#resizeBtn").removeClass("btn-default")
    $("#translateBtn").removeClass("btn-primary")
    $("#translateBtn").addClass("btn-default")
    $("#resizeBtn").addClass("btn-primary")
    control.setMode("scale");
    scene.add(control);
    controls.enableZoom = false; // optional
    controls.enablePan = false;
    controls.enableRotate = false;
  }
});

$('#linkAspectBtn').on('click', function() {
  if ($("#linkAspect").hasClass("fa-link")) {
    // $( "#linkAspectBtn" ).removeClass( "btn-primary" )
    // $( "#linkAspectBtn" ).addClass( "btn-default" )
    $('#linkAspect').removeClass('fa-link');
    $('#linkAspect').addClass('fa-unlink');
    $("#linkval").html('Unlinked');
  } else {
    // $( "#linkAspectBtn" ).removeClass( "btn-default" )
    // $( "#linkAspectBtn" ).removeClass( "btn-primary" )
    // $( "#linkAspectBtn" ).addClass( "btn-default" )
    // $( "#linkAspectBtn" ).addClass( "btn-primary" )
    $('#linkAspect').removeClass('fa-unlink');
    $('#linkAspect').addClass('fa-link');
    $("#linkval").html('Linked');
  }
});

$('#stepscaleup').on('click', function() {
  var oldValue = $("#scaleFactor").val();
  var newVal = parseFloat(oldValue) + 1;
  var newVal = newVal.toFixed(0)
  $("#scaleFactor").val(newVal);
  scaleChange();
});

$('#stepscaledn').on('click', function() {
  var oldValue = $("#scaleFactor").val();
  var newVal = parseFloat(oldValue) - 1;
  var newVal = newVal.toFixed(0)
  $("#scaleFactor").val(newVal);
  scaleChange();
});

var Xtofix;
var Ytofix;
var oldxscale = 0;
var oldyscale = 0;


function filePrepInit() {

  // nothing to init


}


//
// function putFileObjectAtZero(object) {
//
//   if (object) {} else {
//     object = fileParentGroup
//   }
//
//   var bbox2 = new THREE.Box3().setFromObject(object);
//   // console.log('bbox for putFileObjectAtZero: Min X: ', (bbox2.min.x + (sizexmax / 2)), '  Max X:', (bbox2.max.x + (sizexmax / 2)), 'Min Y: ', (bbox2.min.y + (sizeymax / 2)), '  Max Y:', (bbox2.max.y + (sizeymax / 2)));
//   Xtofix = -(bbox2.min.x + (sizexmax));
//   imagePosition = $('#imagePosition').val()
//   // console.log('ImagePosition', imagePosition)
//   if (imagePosition == "Top Left") {
//     Ytofix = -bbox2.max.y;
//   } else {
//     Ytofix = -bbox2.min.y;
//   }
//   // console.log('X Offset', Xtofix)
//   // console.log('Y Offset', Ytofix)
//   object.translateX(Xtofix);
//   object.translateY(Ytofix);
//   calcZeroOffset(object);
//
// }
//
//
// function calcZeroOffset(object) {
//   if (object) {
//     var bbox2 = new THREE.Box3().setFromObject(object);
//     // console.log('bbox for object: Min X: ', (bbox2.min.x + (sizexmax / 2)), '  Max X:', (bbox2.max.x + (sizexmax / 2)), 'Min Y: ', (bbox2.min.y + (sizeymax / 2)), '  Max Y:', (bbox2.max.y + (sizeymax / 2)));
//     xfromzero = -(bbox2.min.x + (sizexmax / 2));
//     imagePosition = $('#imagePosition').val()
//     // console.log('ImagePosition', imagePosition)
//     if (imagePosition == "Top Left") {
//       yfromzero = (sizeymax / 2) - bbox2.max.y;
//     } else {
//       yfromzero = -(bbox2.min.y + (sizeymax / 2));
//     }
//     var xoffset = (object.position.x - xfromzero)
//     var yoffset = (object.position.y - yfromzero)
//     // console.log('X Offset', xoffset )
//     // console.log('Y Offset', yoffset )
//     object.userData.offsetX = xoffset
//     object.userData.offsetY = yoffset
//   }
//
// }
//
// function scaleSVGObject(obj, scale) {
//   obj.scale.x = scale;
//   obj.scale.y = scale;
//   obj.scale.z = scale;
//   putFileObjectAtZero(obj);
//   //attachBB(obj);
// }