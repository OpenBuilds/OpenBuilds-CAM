function drill(config) {
  console.log(config)
  var drillPath = new THREE.Group();
  var prettyGrp = new THREE.Group();

  // Pretty View of Circle
  var radius = config.offset;
  var geometry = new THREE.CircleGeometry(radius, 32);
  geometry.vertices.shift();
  var endx = parseFloat(geometry.vertices[0].x)
  var endy = parseFloat(geometry.vertices[0].y)
  var endz = parseFloat(0)
  geometry.vertices.push(
    new THREE.Vector3(endx, endy, endz),
  );
  var material = new THREE.LineBasicMaterial({
    color: 0x000000,
    transparent: true
  });
  var geometry2 = new THREE.Geometry();
  //
  for (k = 0; k < geometry.vertices.length; k++) {
    var x = parseFloat(geometry.vertices[k].x)
    var y = parseFloat(geometry.vertices[k].y)
    var z = parseFloat(0)
    geometry2.vertices.push(
      new THREE.Vector3(x, y, z),
    );
  }
  //
  // console.log(geometry, geometry2)
  var circle = new THREE.Line(geometry2, material);

  config.toolpath.traverse(function(child) {
    // console.log('Traverse: ', child)
    if (child.name == "inflatedGroup") {
      console.log("this is the inflated path from a previous run. ignore.");
      return;
    } else if (child.type == "Line") {
      var drillEntity = new THREE.Group();
      var bbox2 = new THREE.Box3().setFromObject(child);
      // console.log(bbox2)
      var center = new THREE.Vector3(
        bbox2.min.x + ((bbox2.max.x - bbox2.min.x) / 2),
        bbox2.min.y + ((bbox2.max.y - bbox2.min.y) / 2),
        bbox2.min.z + ((bbox2.max.z - bbox2.min.z) / 2)
      );

      console.log(center)

      var lastz = 0

      if (config.toolpath.userData.camOperation == "Drill: Peck (Centered)") {
        for (x = 0; x < config.zdepth + config.zstep; x += config.zstep) {
          if (x > config.zdepth) {
            var zval = -config.zdepth;
          } else {
            var zval = -x
          }

          var geometry = new THREE.Geometry();
          geometry.vertices.push(
            new THREE.Vector3(center.x, center.y, lastz),
            new THREE.Vector3(center.x, center.y, zval),
            new THREE.Vector3(center.x, center.y, 0),
          );
          //
          var pretty = shapeFromLine(circle, 0x6666600, 0.4)
          // console.log(pretty)
          // pretty.position.z = zval;
          pretty.position.setX(center.x);
          pretty.position.setY(center.y);
          pretty.position.setZ(zval);
          pretty.updateMatrix();
          prettyGrp.add(pretty)
          var material = new THREE.LineBasicMaterial({
            color: 0x000000
          });

          var line = new THREE.Line(geometry, material);
          drillEntity.add(line)
          lastz = zval
        }
      } else if (config.toolpath.userData.camOperation == "Drill: Continuous (Centered)") {
        var pretty = shapeFromLine(circle, 0x6666600, 0.4)
        pretty.position.setX(center.x);
        pretty.position.setY(center.y);
        pretty.position.setZ(-config.zdepth);
        pretty.updateMatrix();
        prettyGrp.add(pretty)
        var material = new THREE.LineBasicMaterial({
          color: 0x000000
        });

        var geometry = new THREE.Geometry();
        geometry.vertices.push(
          new THREE.Vector3(center.x, center.y, lastz),
          new THREE.Vector3(center.x, center.y, -config.zdepth),
          new THREE.Vector3(center.x, center.y, 0),
        );
        var line = new THREE.Line(geometry, material);
        drillPath.add(line)
        lastz = zval
      }
      drillPath.add(drillEntity);
    } else if (child.type == "Points") {
      child.visible = false;
    } else {
      // console.log("type of ", child.type, " being skipped");
    }
  });
  drillPath.userData.pretty = prettyGrp
  return drillPath;
}