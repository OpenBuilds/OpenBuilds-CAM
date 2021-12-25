function drawRuler() {
  var ruler = new THREE.Group();
  var material = new THREE.LineBasicMaterial({
    color: 0x888888
  });
  material.opacity = 0.85;

  
  // setup ruler for units
  if(document.getElementById("unitSwitch").checked){
    // console.log("inch")
    var smallTick=.25
    var mediumTick=.5
    var largeTick=1
    var smallTickLength=-0.5
    var mediumTickLength=-0.7
    var largeTickLength=-0.9
    var tickSpacing=-0.3
    var countInterval=1;
    var countSize=.5;
    var countDistance=-1.2;
   }else{
    // console.log("mm")
     smallTick=1
     mediumTick=5
     largeTick=10
     smallTickLength=-4
     mediumTickLength=-6
     largeTickLength=-7
     tickSpacing=-1
     countInterval=20;
     countSize=6;
     countDistance=-10;

 
   }


   // add tick marks

  // x axis
  for (i = 0; i <= sizexmax; i+=smallTick) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(i, tickSpacing, 0));
    geometry.vertices.push(new THREE.Vector3(i, smallTickLength, 0));
    var line = new THREE.Line(geometry, material);
    ruler.add(line);
  }

  for (i = 0; i <= sizexmax; i += mediumTick) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(i, tickSpacing, 0));
    geometry.vertices.push(new THREE.Vector3(i, mediumTickLength, 0));
    var line = new THREE.Line(geometry, material);
    ruler.add(line);
  }

  for (i = 0; i <= sizexmax; i += largeTick) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(i, tickSpacing, 0));
    geometry.vertices.push(new THREE.Vector3(i, largeTickLength, 0));
    var line = new THREE.Line(geometry, material);
    ruler.add(line);
  }


  // Change postion of grid if rotating axis is selected
  if(!document.getElementById("wrapX").hidden){
    var yFactor=2;
    var wrapX=true;
  }else{
    var yFactor=1;
    var wrapX=false;
  }


    // y axis
  for (i = 0; i <= sizeymax/yFactor; i+=smallTick) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(tickSpacing, i, 0));
    geometry.vertices.push(new THREE.Vector3(smallTickLength, i, 0));
    var line = new THREE.Line(geometry, material);
    ruler.add(line);
  }



  for (i = 0; i <= sizeymax/yFactor; i += mediumTick) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(tickSpacing, i, 0));
    geometry.vertices.push(new THREE.Vector3(mediumTickLength, i, 0));
    var line = new THREE.Line(geometry, material);
    ruler.add(line);
  }

  for (i = 0; i <= sizeymax/yFactor; i += largeTick) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(tickSpacing, i, 0));
    geometry.vertices.push(new THREE.Vector3(largeTickLength, i, 0));
    var line = new THREE.Line(geometry, material);
    ruler.add(line);
  }

   //  add mumbers

  var x = [];
  var y = [];
  for (var i = 0; i <= sizexmax; i += countInterval) {
    x[i] = this.makeSprite(this.scene, "webgl", {
      x: i,
      y: countDistance,
      z: 0,
      text: i,
      color: "#cc0000",
      size: countSize
    });
    ruler.add(x[i]);
  }

  for (var i = 0; i <= sizeymax/yFactor; i += countInterval) {
    y[i] = this.makeSprite(this.scene, "webgl", {
      x: countDistance,
      y: i,
      z: 0,
      text: i,
      color: "#006600",
      size: countSize
    });
    ruler.add(y[i]);

    if(wrapX){
      y[-i] = this.makeSprite(this.scene, "webgl", {
        x: countDistance,
        y: -i,
        z: 0,
        text: -i,
        color: "#006600",
        size: countSize
      });
      ruler.add(y[-i]);
    }
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