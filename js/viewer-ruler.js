function drawRuler() {
  var ruler = new THREE.Group();
  var material = new THREE.LineBasicMaterial({
    color: 0x888888
  });
  material.opacity = 0.15;

  // x axis
  for (i = 0; i <= sizexmax; i++) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(i, -1, 0));
    geometry.vertices.push(new THREE.Vector3(i, -4, 0));
    var line = new THREE.Line(geometry, material);
    // line.translateX(-sizexmax / 2)
    // line.translateY(-sizeymax / 2)
    ruler.add(line);
  }

  for (i = 0; i <= sizexmax; i += 5) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(i, -1, 0));
    geometry.vertices.push(new THREE.Vector3(i, -6, 0));
    var line = new THREE.Line(geometry, material);
    // line.translateX(-sizexmax / 2)
    // line.translateY(-sizeymax / 2)
    ruler.add(line);
  }

  for (i = 0; i <= sizexmax; i += 10) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(i, -1, 0));
    geometry.vertices.push(new THREE.Vector3(i, -7, 0));
    var line = new THREE.Line(geometry, material);
    // line.translateX(-sizexmax / 2)
    // line.translateY(-sizeymax / 2)
    ruler.add(line);
  }

  // y axis
  for (i = 0; i <= sizeymax; i += 5) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-1, i, 0));
    geometry.vertices.push(new THREE.Vector3(-6, i, 0));
    var line = new THREE.Line(geometry, material);
    // line.translateX(-sizeymax / 2)
    // line.translateY(-sizeymax / 2)
    ruler.add(line);
  }

  for (i = 0; i <= sizeymax; i += 10) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-1, i, 0));
    geometry.vertices.push(new THREE.Vector3(-7, i, 0));
    var line = new THREE.Line(geometry, material);
    // line.translateX(-sizeymax / 2)
    // line.translateY(-sizeymax / 2)
    ruler.add(line);
  }

  for (i = 0; i <= sizeymax; i++) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-1, i, 0));
    geometry.vertices.push(new THREE.Vector3(-4, i, 0));
    var line = new THREE.Line(geometry, material);
    // line.translateX(-sizeymax / 2)
    // line.translateY(-sizeymax / 2)
    ruler.add(line);
  }

  var x = [];
  var y = [];
  for (var i = 0; i <= sizexmax; i += 10) {
    x[i] = this.makeSprite(this.scene, "webgl", {
      x: i,
      y: -10,
      z: 0,
      text: i,
      color: "#cc0000",
      size: 4
    });
    ruler.add(x[i]);
  }

  for (var i = 0; i <= sizeymax; i += 10) {
    y[i] = this.makeSprite(this.scene, "webgl", {
      x: -10,
      y: i,
      z: 0,
      text: i,
      color: "#006600",
      size: 4
    });
    ruler.add(y[i]);
  }
  ruler.name = "Rulers"

  var material = new THREE.LineBasicMaterial({
    color: 0x666666
  });
  material.opacity = 0.15;
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(sizexmax, 0, 0));
  geometry.vertices.push(new THREE.Vector3(sizexmax, sizeymax, 0));
  geometry.vertices.push(new THREE.Vector3(0, sizeymax, 0));
  var line = new THREE.Line(geometry, material);
  ruler.add(line);

  return (ruler)
}