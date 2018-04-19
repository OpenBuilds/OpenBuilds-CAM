// Global Vars
var scene, camera, renderer;
var geometry, material, mesh, helper, axes, axesgrp, light, bullseye, cursor, grid, cone;
var projector, mouseVector, containerWidth, containerHeight;
var raycaster = new THREE.Raycaster();

var container, stats;
var camera, controls, control, scene, renderer;
var clock = new THREE.Clock();

var marker;
var sizexmax;
var sizeymax;
var lineincrement = 50
var camvideo;
var objectsInScene = []; //array that holds all objects we added to the scene.
var clearSceneFlag = false;

var size = new THREE.Vector3();

var sky;

var workspace = new THREE.Group();
workspace.name = "Workspace"

var ground;

containerWidth = window.innerWidth;
containerHeight = window.innerHeight;



function setBullseyePosition(x, y, z) {
    //console.log('Set Position: ', x, y, z)
    if (x) {
        bullseye.position.x = parseInt(x, 10);
    };
    if (y) {
        bullseye.position.y = parseInt(y, 10);
    };
    if (z) {
        bullseye.position.z = (parseInt(z, 10) + 0.1);
    };
}

function init3D() {
    // ThreeJS Render/Control/Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 295;


    var canvas = !!window.CanvasRenderingContext2D;
    var webgl = (function() {
        try {
            return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
        } catch (e) {
            return false;
        }
    })();

    if (webgl) {
        printLog('<h5><i class="fa fa-search fa-fw" aria-hidden="true"></i>WebGL Support found!</h5><b>success:</b><br> this application will work optimally on this device!<hr><p>', successcolor);
        renderer = new THREE.WebGLRenderer({
            autoClearColor: true,
            antialias: false
        });

    } else if (canvas) {
        printLog('<h5><i class="fa fa-search fa-fw" aria-hidden="true"></i>No WebGL Support found!</h5><b>CRITICAL ERROR:</b><br> this appplication may not work optimally on this device! <br>Try another device with WebGL support</p><br><u>Try the following:</u><br><ul><li>In the Chrome address bar, type: <b>chrome://flags</b> [Enter]</li><li>Enable the <b>Override software Rendering</b></li><li>Restart Chrome and try again</li></ul>Sorry! :(<hr><p>', errorcolor);
        renderer = new THREE.CanvasRenderer();
    };

    $('#viewermodule').hide();
    $('#renderArea').append(renderer.domElement);
    renderer.setClearColor(0xffffff, 1); // Background color of viewer = transparent
    // renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);
    renderer.clear();

    sceneWidth = document.getElementById("renderArea").offsetWidth,
    sceneHeight = document.getElementById("renderArea").offsetHeight;
    camera.aspect = sceneWidth / sceneHeight;
    renderer.setSize(sceneWidth, sceneHeight)
    camera.updateProjectionMatrix();


    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0); // view direction perpendicular to XY-plane
    controls.mouseButtons = { ORBIT: THREE.MOUSE.MIDDLE, ZOOM: false, PAN: THREE.MOUSE.RIGHT };

    controls.enableRotate = true;

    controls.enableZoom = true; // optional
    controls.enableKeys = false; // Disable Keyboard on canvas
    //controls.mouseButtons = { PAN: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, ORBIT: THREE.MOUSE.RIGHT }; // swapping left and right buttons
    // /var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

    control = new THREE.TransformControls(camera, renderer.domElement);

    workspace.add(control);
    control.setMode("translate");

    var light = new THREE.DirectionalLight(0xffffff,  0.8);
    light.position.set(0, 2, 25).normalize();
    light.name = "Light1;"
    workspace.add(light);

    var light2 = new THREE.DirectionalLight(0xffffff);
    light2.name = "Light2"
    light2.position.set(-500, -500, 1).normalize();
    workspace.add(light2);

    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
		dirLight.color.setHSL( 0.1, 1, 0.95 );
		dirLight.position.set( -1, 1.75, 1 );
		dirLight.position.multiplyScalar( 30 );
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		var d = 50;
		dirLight.shadow.camera.left = -d;
		dirLight.shadow.camera.right = d;
		dirLight.shadow.camera.top = d;
		dirLight.shadow.camera.bottom = -d;
		dirLight.shadow.camera.far = 3500;
		dirLight.shadow.bias = -0.0001;
    workspace.add( dirLight );

    // if (helper) {
    //     workspace.remove(helper);
    // }

    sizexmax = $('#sizexmax').val();
    sizeymax = $('#sizeymax').val();

    if (!sizexmax) {
        sizexmax = 200;
    };

    if (!sizeymax) {
        sizeymax = 200;
    };

    // helper = new THREE.GridHelper(sizexmax, sizeymax, 1, 0xdddddd);
    // helper.position.y = 0;
    // helper.position.x = 0;
    // helper.position.z = 0;
    // helper.material.opacity = 0.15;
    // helper.material.transparent = true;
    // helper.receiveShadow = false;
    // this.grid = helper;
    // helper.name = "GridHelper1mm"
    // workspace.add(helper);
    grid = new THREE.Group();
    helper = new THREE.GridHelper(sizexmax, sizeymax, 10, 0x888888);
    helper.position.y = 0;
    helper.position.x = 0;
    helper.position.z = 0;
    helper.material.opacity = 0.15;
    helper.material.transparent = true;
    helper.receiveShadow = false;
    helper.name = "GridHelper10mm"
    grid.add(helper);
    helper = new THREE.GridHelper(sizexmax, sizeymax, 100, 0x666666);
    helper.position.y = 0;
    helper.position.x = 0;
    helper.position.z = 0;
    helper.material.opacity = 0.15;
    helper.material.transparent = true;
    helper.receiveShadow = false;
    helper.name = "GridHelper50mm"
    grid.add(helper);
    workspace.add(grid);

    var material = new THREE.LineBasicMaterial( { color: 0x666666 } );
    material.opacity = 0.15;
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( sizexmax, 0, 0) );
    geometry.vertices.push(new THREE.Vector3( sizexmax, sizeymax, 0) );
    geometry.vertices.push(new THREE.Vector3( 0, sizeymax, 0) );
    var line = new THREE.Line( geometry, material );
    workspace.add(line);
    

    if (bullseye) {
        scene.remove(bullseye);
    }
    bullseye = new THREE.Object3D();

    var material = new THREE.LineBasicMaterial({
        color: 0xFF0000
    });

    cone = new THREE.Mesh(new THREE.CylinderGeometry(0, 5, 40, 15, 1, false), new THREE.MeshPhongMaterial( {
        color: 0x0000ff,
        specular: 0x0000ff,
        shininess: 100
    } ) );
    cone.overdraw = true;
    cone.rotation.x = -90 * Math.PI / 180;
    cone.position.x = 20;
    cone.position.y = 0;
    cone.position.z = 0;
    cone.material.opacity = 0.6;
    cone.material.transparent = true;
    cone.castShadow = false;
    cone.visible=false;
    workspace.add(cone)
    // bullseye.add(cone);
    //
    // bullseye.name = "Bullseye";
    //
    // workspace.add(bullseye);
    // bullseye.position.x = -(sizexmax / 2);
    // bullseye.position.y = -(sizeymax / 2);

    raycaster.linePrecision = 15


    if (axesgrp) {
        scene.remove(axesgrp);
    }
    axesgrp = new THREE.Object3D();
    axesgrp.name = "Grid System"

    // add axes labels
    var xlbl = this.makeSprite(this.scene, "webgl", {
        x: parseInt(sizexmax)+5,
        y: 0,
        z: 0,
        text: "X",
        color: "#ff0000"
    });
    var ylbl = this.makeSprite(this.scene, "webgl", {
        x: 0,
        y: parseInt(sizeymax)+5,
        z: 0,
        text: "Y",
        color: "#006600"
    });
    var zlbl = this.makeSprite(this.scene, "webgl", {
        x: 0,
        y: 0,
        z: 125,
        text: "Z",
        color: "#0000ff"
    });


    axesgrp.add(xlbl);
    axesgrp.add(ylbl);
    //axesgrp.add(zlbl); Laser don't have Z - but CNCs do

    var materialX = new THREE.LineBasicMaterial({
        color: 0xcc0000
    });

    var materialY = new THREE.LineBasicMaterial({
        color: 0x00cc00
    });

    var geometryX = new THREE.Geometry();
    geometryX.vertices.push(
        new THREE.Vector3(-0.1, 0, 0),
        new THREE.Vector3(-0.1, (sizeymax ), 0)
    );

    var geometryY = new THREE.Geometry();
    geometryY.vertices.push(
        new THREE.Vector3(0, -0.1, 0),
        new THREE.Vector3((sizexmax ), -0.1, 0)
    );

    var line1 = new THREE.Line(geometryX, materialY);
    var line2 = new THREE.Line(geometryY, materialX);
    axesgrp.add(line1);
    axesgrp.add(line2);

    workspace.add(axesgrp);

    // Picking stuff
    projector = new THREE.Projector();
    mouseVector = new THREE.Vector3();

    scene.add(workspace)

    drawRuler();

    material = new THREE.MeshPhongMaterial({
		color: 0xffcccc,
		specular: 0xffffff,
		shininess: 8
	});

	scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );

  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 50, 0 );
  hemiLight.visible = true;
  workspace.add( hemiLight );

  // SKYDOME
	var uniforms = {
		topColor:    { value: new THREE.Color( 0x0077ff ) },
		bottomColor: { value: new THREE.Color( 0xffffff ) },
		offset:      { value: 63 },
		exponent:    { value: 0.71 }
	};
  uniforms.topColor.value.copy( hemiLight.color );

	scene.fog.color.copy( uniforms.bottomColor.value );

  var vertexShader = document.getElementById( 'vertexShader' ).textContent;
  var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;

	var skyGeo = new THREE.SphereGeometry( 2000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

	sky = new THREE.Mesh( skyGeo, skyMat );
  // sky.rotation.x = -Math.PI/4;
  // sky.rotation.y = -Math.PI/4;
	workspace.add( sky );


}

function animate() {
  animateTree();
  simAnimate();

  // half-hide toolpaths in delete/move mode
  if (mouseState == "select") {
    setOpacity(toolpathsInScene, 0.6);
  } else {
    setOpacity(toolpathsInScene, 0.1);
  }


  if (clearSceneFlag) {
    while (scene.children.length > 1) {
      scene.remove(scene.children[1])
    }

    var documents = new THREE.Group();
    documents.name = "Documents";
    for (i = 0; i < objectsInScene.length; i++) {
      documents.add(objectsInScene[i])
    }
    scene.add(documents)

    var toolpaths = new THREE.Group();
    toolpaths.name = "Toolpaths";
    for (i = 0; i < toolpathsInScene.length; i++) {
      if (toolpathsInScene[i].userData.visible) {
        if(toolpathsInScene[i].userData.inflated) {
          if (toolpathsInScene[i].userData.inflated.userData.pretty) {
            toolpaths.add(toolpathsInScene[i].userData.inflated.userData.pretty);
            // toolpaths.add(toolpathsInScene[i].userData.inflated);
          } else {
            toolpaths.add(toolpathsInScene[i].userData.inflated);
          }
        };
      }
    }
    scene.add(toolpaths)
    clearSceneFlag = false;
  }  // end clearSceneFlag

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}



function viewExtents(objecttosee) {
    //console.log("viewExtents. object.userData:", this.object.userData);
    // console.log("controls:", controls);
    //wakeAnimate();

    // lets override the bounding box with a newly
    // generated one
    // get its bounding box
    if (objecttosee) {
        var helper = new THREE.BoxHelper (objecttosee);
        helper.update();
        var box3 = new THREE.Box3();
        box3.setFromObject( helper );
        var minx = box3.min.x;
        var miny = box3.min.y;
        var maxx = box3.max.x;
        var maxy = box3.max.y;
        var minz = box3.min.z;
        var maxz = box3.max.z;


        controls.reset();

        var lenx = maxx - minx;
        var leny = maxy - miny;
        var lenz = maxz - minz;
        var centerx = minx + (lenx / 2);
        var centery = miny + (leny / 2);
        var centerz = minz + (lenz / 2);


        // console.log("lenx:", lenx, "leny:", leny, "lenz:", lenz);
        var maxlen = Math.max(lenx, leny, lenz);
        var dist = 2 * maxlen;
        // center camera on gcode objects center pos, but twice the maxlen
        controls.object.position.x = centerx;
        controls.object.position.y = centery;
        controls.object.position.z = centerz + dist;
        controls.target.x = centerx;
        controls.target.y = centery;
        controls.target.z = centerz;
        // console.log("maxlen:", maxlen, "dist:", dist);
        var fov = 2.2 * Math.atan(maxlen / (2 * dist)) * (180 / Math.PI);
        // console.log("new fov:", fov, " old fov:", controls.object.fov);
        if (isNaN(fov)) {
            console.log("giving up on viewing extents because fov could not be calculated");
            return;
        } else {
            controls.object.fov = fov;
            var L = dist;
            var camera = controls.object;
            var vector = controls.target.clone();
            var l = (new THREE.Vector3()).subVectors(camera.position, vector).length();
            var up = camera.up.clone();
            var quaternion = new THREE.Quaternion();

            // Zoom correction
            camera.translateZ(L - l);
            // console.log("up:", up);
            up.y = 1;
            up.x = 0;
            up.z = 0;
            quaternion.setFromAxisAngle(up, 0);
            //camera.position.applyQuaternion(quaternion);
            up.y = 0;
            up.x = 1;
            up.z = 0;
            quaternion.setFromAxisAngle(up, 0);
            camera.position.applyQuaternion(quaternion);
            up.y = 0;
            up.x = 0;
            up.z = 1;
            quaternion.setFromAxisAngle(up, 0);
            camera.lookAt(vector);
            controls.object.updateProjectionMatrix();
        }

    }
};

function colorobj(name) {
    var object = scene.getObjectByName(name, true);
    console.log(object)
    // for (i=0; i<dxfObject.children.length; i++) {
    //     dxfObject.children[i].material.color.setHex(0x000000);
    //     dxfObject.children[i].material.opacity = 0.3;
    // }
    object.material.color.setHex(0xFF0000);
    object.material.needsUpdate = true;
}


function makeSprite(scene, rendererType, vals) {
    var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    metrics = null,
    textHeight = 100,
    textWidth = 0,
    actualFontSize = 10;
    var txt = vals.text;
    if (vals.size) actualFontSize = vals.size;

    context.font = "normal " + textHeight + "px Arial";
    metrics = context.measureText(txt);
    var textWidth = metrics.width;

    canvas.width = textWidth;
    canvas.height = textHeight;
    context.font = "normal " + textHeight + "px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    //context.fillStyle = "#ff0000";
    context.fillStyle = vals.color;

    context.fillText(txt, textWidth / 2, textHeight / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;

    var material = new THREE.SpriteMaterial({
        map: texture,
        // useScreenCoordinates: false,
        transparent: true,
        opacity: 0.6
    });
    material.transparent = true;
    //var textObject = new THREE.Sprite(material);
    var textObject = new THREE.Object3D();
    textObject.position.x = vals.x;
    textObject.position.y = vals.y;
    textObject.position.z = vals.z;
    var sprite = new THREE.Sprite(material);
    textObject.textHeight = actualFontSize;
    textObject.textWidth = (textWidth / textHeight) * textObject.textHeight;
    if (rendererType == "2d") {
        sprite.scale.set(textObject.textWidth / textWidth, textObject.textHeight / textHeight, 1);
    } else {
        sprite.scale.set(textWidth / textHeight * actualFontSize, actualFontSize, 1);
    }

    textObject.add(sprite);

    //scene.add(textObject);
    return textObject;
}


// Global Function to keep three fullscreen
$(window).on('resize', function() {
  console.log("Window Resize")
    //renderer.setSize(element.width(), element.height());

    sceneWidth = document.getElementById("renderArea").offsetWidth;
    sceneHeight = document.getElementById("renderArea").offsetHeight;
    renderer.setSize(sceneWidth, sceneHeight);
    //renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
    controls.reset();
    setTimeout(function(){ $('#viewReset').click(); }, 100);
    // setTimeout(function(){ $('#tabsLayers a[href="#allView"]').trigger('click'); }, 100);


});

// Set selection, add bounding box
function attachBB(object, e) { // e = mouseclick event)
    if (e) { // from a Mouseclick event on 3d Viewer
      // console.log("Ctrl: " +  e.ctrlKey)
      if (object.userData) {
        if (!e.ctrlKey) { // if Ctrl is not down, clear other selections and only select the object clicked on
          for (i=0; i<objectsInScene.length; i++) {
            var obj = objectsInScene[i]
            obj.traverse( function ( child ) {
              if (child.type == "Line" && child.userData.selected) {
                  // console.log("Setting false on " + i + " - " + child.name)
                  child.userData.selected = false;
                  // child.material.color.setRGB(0.1, 0.1, 0.1);
              }
            });
          }
        }// end clear all
        if (!object.userData.selected) {
          object.userData.selected = true;
        } else {
          object.userData.selected = false;
          if (typeof(boundingBox) != 'undefined') {
              scene.remove(boundingBox);
          }
        }
      }
    } else { // not from a mouseclick event on 3d viewer
      if (object.userData) {
        if (!object.userData.selected) {
          object.userData.selected = true;
        } else {
          object.userData.selected = false;
          if (typeof(boundingBox) != 'undefined') {
              scene.remove(boundingBox);
          }
        }
      }
    }

    if (typeof(boundingBox) != 'undefined') {
        scene.remove(boundingBox);
    }

    if (object.userData.selected) {
      var bbox2 = new THREE.Box3().setFromObject(object);
      // console.log('bbox for Clicked Obj: '+ object +' Min X: ', (bbox2.min.x + (sizexmax / 2)), '  Max X:', (bbox2.max.x + (sizexmax / 2)), 'Min Y: ', (bbox2.min.y + (sizeymax / 2)), '  Max Y:', (bbox2.max.y + (sizeymax / 2)));
      BBmaterial =  new THREE.LineDashedMaterial( { color: 0xaaaaaa, dashSize: 5, gapSize: 4, linewidth: 2 } );
      BBgeometry = new THREE.Geometry();
      BBgeometry.vertices.push(
          new THREE.Vector3(  (bbox2.min.x - 1), (bbox2.min.y - 1), 0 ),
          new THREE.Vector3(  (bbox2.min.x - 1), (bbox2.max.y + 1) , 0 ),
          new THREE.Vector3( (bbox2.max.x + 1), (bbox2.max.y + 1), 0 ),
          new THREE.Vector3( (bbox2.max.x + 1), (bbox2.min.y - 1), 0 ),
          new THREE.Vector3(  (bbox2.min.x - 1), (bbox2.min.y - 1), 0 )
      );
      BBgeometry.computeLineDistances();  //  NB If not computed, dashed lines show as solid
      boundingBoxLines= new THREE.Line( BBgeometry, BBmaterial );
      boundingBox = new THREE.Group();
      boundingBox.add(boundingBoxLines)
      var bwidth = parseFloat(bbox2.max.x - bbox2.min.x).toFixed(2);
      var bheight = parseFloat(bbox2.max.y - bbox2.min.y).toFixed(2);
      widthlabel = this.makeSprite(this.scene, "webgl", {
          x: (bbox2.max.x + 30),
          y: ((bbox2.max.y - ((bbox2.max.y - bbox2.min.y) / 2)) + 10),
          z: 0,
          text: "W: " + bwidth + "mm",
          color: "#aaaaaa",
          size: 6
      });
      boundingBox.add(widthlabel)
      heightlabel = this.makeSprite(this.scene, "webgl", {
          x: ((bbox2.max.x - ((bbox2.max.x - bbox2.min.x) / 2)) + 10),
          y: (bbox2.max.y + 10),
          z: 0,
          text: "H: " + bheight + "mm",
          color: "#aaaaaa",
          size: 6
      });
      boundingBox.add(heightlabel)
      boundingBox.name = "Bounding Box"
      scene.add( boundingBox );
    }
}
