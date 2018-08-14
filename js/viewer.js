// Global Vars
var scene, camera, renderer;
var projector, mouseVector, containerWidth, containerHeight;
var raycaster = new THREE.Raycaster();
var gridsystem = new THREE.Group();

var container, stats;
var camera, controls, control, scene, renderer, gridsystem, helper;
var clock = new THREE.Clock();

var marker;
var sizexmax;
var sizeymax;
var lineincrement = 50
var camvideo;
var objectsInScene = []; //array that holds all objects we added to the scene.
var clearSceneFlag = false;

// pause Animation when we loose webgl context focus
var pauseAnimation = false;

var size = new THREE.Vector3();

var sky;

var workspace = new THREE.Group();
workspace.name = "Workspace"

var ground;

containerWidth = window.innerWidth;
containerHeight = window.innerHeight;


function drawWorkspace() {

  var sceneLights = new THREE.Group();

  var light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(0, 2, 25).normalize();
  light.name = "Light1;"
  sceneLights.add(light);

  var light2 = new THREE.DirectionalLight(0xffffff);
  light2.name = "Light2"
  light2.position.set(-500, -500, 1).normalize();
  sceneLights.add(light2);

  dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(-1, 1.75, 1);
  dirLight.position.multiplyScalar(30);
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
  dirLight.name = "dirLight;"
  sceneLights.add(dirLight);

  hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  hemiLight.visible = false;
  hemiLight.name = "hemiLight"
  sceneLights.add(hemiLight);
  // if (helper) {
  //     workspace.remove(helper);
  // }
  sceneLights.name = "Scene Lights"
  workspace.add(sceneLights);

  scene.fog = new THREE.Fog(0xffffff, 1, 20000);

  // SKYDOME
  var uniforms = {
    topColor: {
      value: new THREE.Color(0x0077ff)
    },
    bottomColor: {
      value: new THREE.Color(0xffffff)
    },
    offset: {
      value: -63
    },
    exponent: {
      value: 0.71
    }
  };
  uniforms.topColor.value.copy(hemiLight.color);

  scene.fog.color.copy(uniforms.bottomColor.value);

  var vertexShader = document.getElementById('vertexShader').textContent;
  var fragmentShader = document.getElementById('fragmentShader').textContent;

  var skyGeo = new THREE.SphereGeometry(9900, 64, 15);
  var skyMat = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: uniforms,
    side: THREE.DoubleSide
  });

  // var skyMat = new THREE.MeshPhongMaterial({
  //   color: 0x0000ff,
  //   specular: 0x0000ff,
  //   shininess: 00
  // });

  sky = new THREE.Mesh(skyGeo, skyMat);
  sky.name = "Skydome"
  workspace.add(sky);

  cone = new THREE.Mesh(new THREE.CylinderGeometry(0, 5, 40, 15, 1, false), new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    specular: 0x0000ff,
    shininess: 00
  }));
  cone.overdraw = true;
  cone.rotation.x = -90 * Math.PI / 180;
  cone.position.x = 20;
  cone.position.y = 0;
  cone.position.z = 0;
  cone.material.opacity = 0.6;
  cone.material.transparent = true;
  cone.castShadow = false;
  cone.visible = false;
  cone.name = "Simulation Marker"
  workspace.add(cone)
  gridsystem.name = "Grid System"
  workspace.add(gridsystem)
  redrawGrid();
  scene.add(workspace)
}

function redrawGrid() {
  gridsystem.children.length = 0

  sizexmax = $('#sizexmax').val();
  sizeymax = $('#sizeymax').val();

  if (!sizexmax) {
    sizexmax = 200;
  };

  if (!sizeymax) {
    sizeymax = 200;
  };

  var grid = new THREE.Group();

  var axesgrp = new THREE.Object3D();
  axesgrp.name = "Axes Markers"

  // add axes labels
  var xlbl = this.makeSprite(this.scene, "webgl", {
    x: parseInt(sizexmax) + 5,
    y: 0,
    z: 0,
    text: "X",
    color: "#ff0000"
  });
  var ylbl = this.makeSprite(this.scene, "webgl", {
    x: 0,
    y: parseInt(sizeymax) + 5,
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
    new THREE.Vector3(-0.1, (sizeymax), 0)
  );

  var geometryY = new THREE.Geometry();
  geometryY.vertices.push(
    new THREE.Vector3(0, -0.1, 0),
    new THREE.Vector3((sizexmax), -0.1, 0)
  );

  var line1 = new THREE.Line(geometryX, materialY);
  var line2 = new THREE.Line(geometryY, materialX);
  axesgrp.add(line1);
  axesgrp.add(line2);

  grid.add(axesgrp);

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
  grid.name = "Grid"
  gridsystem.add(grid);
  gridsystem.add(drawRuler());
}

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
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
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
    printLog('WebGL Support found! success: this application will work optimally on this device!');
    renderer = new THREE.WebGLRenderer({
      autoClearColor: true,
      antialias: false,
      preserveDrawingBuffer: true
    });

  } else if (canvas) {
    printLog('<h5><i class="fa fa-search fa-fw" aria-hidden="true"></i>No WebGL Support found!</h5><b>CRITICAL ERROR:</b><br> this appplication may not work optimally on this device! <br>Try another device with WebGL support</p><br><u>Try the following:</u><br><ul><li>In the Chrome address bar, type: <b>chrome://flags</b> [Enter]</li><li>Enable the <b>Override software Rendering</b></li><li>Restart Chrome and try again</li></ul>Sorry! :(<hr><p>', errorcolor);
    renderer = new THREE.CanvasRenderer();
  };

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
  var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  if (!isMac) {
    controls.mouseButtons = {
      ORBIT: THREE.MOUSE.MIDDLE,
      ZOOM: false,
      PAN: THREE.MOUSE.RIGHT
    };
  }


  controls.enableRotate = true;
  controls.enableZoom = true; // optional
  controls.maxDistance = 8000; // limit max zoom out
  controls.enableKeys = false; // Disable Keyboard on canvas


  drawWorkspace();

  // Picking stuff
  projector = new THREE.Projector();
  mouseVector = new THREE.Vector3();
  raycaster.linePrecision = 1

  setTimeout(function() {
    resetView()
    animate();
  }, 200)

}

function animate() {
  if (!pauseAnimation) {
    camera.updateMatrixWorld();
    animateTree();
    simAnimate();

    // half-hide toolpaths in delete/move mode
    if (mouseState == "select") {
      setOpacity(toolpathsInScene, 0.6);
    } else {
      setOpacity(toolpathsInScene, 0.1);
    }

    if (simstopped == true) {
      if (mouseState == "select") {
        setOpacity(toolpathsInScene, 0.6);
      } else {
        setOpacity(toolpathsInScene, 0.1);
      }
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
          if (toolpathsInScene[i].userData.inflated) {
            if (toolpathsInScene[i].userData.inflated.userData.pretty) {
              if (toolpathsInScene[i].userData.inflated.userData.pretty.children.length > 0) {
                toolpaths.add(toolpathsInScene[i].userData.inflated.userData.pretty);
              } else {
                toolpaths.add(toolpathsInScene[i].userData.inflated);
              }
            } else {
              toolpaths.add(toolpathsInScene[i].userData.inflated);
            }
          };
        }
      }
      scene.add(toolpaths)

      if (fancysim == true) {
        scene.add(simgcodeobj)
      } else {
        if (object) {
          scene.add(object)
        }

      }


      clearSceneFlag = false;
    } // end clearSceneFlag

    // Limited FPS https://stackoverflow.com/questions/11285065/limiting-framerate-in-three-js-to-increase-performance-requestanimationframe
    setTimeout(function() {
      requestAnimationFrame(animate);
    }, 40);

    renderer.render(scene, camera);
  }
}



function viewExtents(objecttosee) {
  //console.log("viewExtents. object.userData:", this.object.userData);
  // console.log("controls:", controls);
  //wakeAnimate();

  // lets override the bounding box with a newly
  // generated one
  // get its bounding box
  if (objecttosee) {
    var helper = new THREE.BoxHelper(objecttosee);
    helper.update();
    var box3 = new THREE.Box3();
    box3.setFromObject(helper);
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

function makeSprite(scene, rendererType, vals) {
  var canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    metrics = null,
    textHeight = 100,
    textWidth = 0,
    actualFontSize = 10;
  var txt = vals.text;
  if (vals.size) actualFontSize = vals.size;

  context.font = "normal " + textHeight + "px Impact";
  metrics = context.measureText(txt);
  var textWidth = metrics.width;

  canvas.width = textWidth;
  canvas.height = textHeight;
  context.font = "normal " + textHeight + "px Impact";
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
  setTimeout(function() {
    resetView();
  }, 100);
  // setTimeout(function(){ $('#tabsLayers a[href="#allView"]').trigger('click'); }, 100);


});

function resetView(object) {
  if (!object) {
    if (objectsInScene.length > 0) {
      var insceneGrp = new THREE.Group()
      for (i = 0; i < objectsInScene.length; i++) {
        var object = objectsInScene[i].clone();
        insceneGrp.add(object)
      }
      // scene.add(insceneGrp)
      viewExtents(insceneGrp);
      // scene.remove(insceneGrp)
    } else {
      viewExtents(helper);
    }
  } else {
    viewExtents(object);
  }
}