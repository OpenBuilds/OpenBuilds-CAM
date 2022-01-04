function addCircle(xCenter,yCenter,radius, segments) {
  if (segments < 1) {
    segments = 32;
  }
  console.log("Adding circle: " + radius)
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
  var geometry = new THREE.CircleGeometry(radius, segments);
  geometry.vertices.shift();
  var endx = parseFloat(geometry.vertices[0].x)
  var endy = parseFloat(geometry.vertices[0].y)
  var endz = parseFloat(geometry.vertices[0].z)
  geometry.vertices.push(
    new THREE.Vector3(endx, endy, endz),
  );
  var material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide
  });

  var geometry2 = new THREE.Geometry();

  for (i = 0; i < geometry.vertices.length; i++) {
    var x = parseFloat(geometry.vertices[i].x+ xCenter)
    var y = parseFloat(geometry.vertices[i].y+ yCenter)
    var z = parseFloat(geometry.vertices[i].z)
    geometry2.vertices.push(
      new THREE.Vector3(x, y, z),
    );
  }

  var circle = new THREE.Line(geometry2, material);
  circle.name = "circle"
  fileObject.add(circle);
  fileObject.name = `Circle (x:${xCenter} y:${yCenter})`  // "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
    resetView();
  }, 250);
}


function addEllipse(xCenter,yCenter,xStretch, yStretch) {
  console.log("Adding ellipse: " + xCenter)
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
  var curve = new THREE.EllipseCurve(xCenter, yCenter, xStretch,yStretch, 0, 2 * Math.PI,false, 0 );
  var points = curve.getPoints( 50 );

  var geometry = new THREE.Geometry().setFromPoints( points );
  var material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});

  var ellipse = new THREE.Line(geometry, material);


  ellipse.name = "ellipse"
  fileObject.add(ellipse);
  fileObject.name = `Ellipse (x:${xCenter} y:${yCenter})`  // "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
    resetView();
  }, 250);
}


function addRect(xCenter, yCenter,width, height,radius, inverted) {
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
 
   if(2*radius>width || 2*radius>height){   // reduce radius if too large to make rectangle
     radius=Math.min(width,height)/2;
   }
   if(radius <=0){
     radius=.005;  // give a very small radius
   }

   if(!inverted) inverted=0;

  var Xc=xCenter-width/2;
  var Yc=yCenter-height/2;

  var path = new THREE.Path();

  path.moveTo(Xc,radius+Yc); 
  path.lineTo( Xc, height-radius+Yc);
  path.quadraticCurveTo( radius*inverted+Xc, height-radius*inverted+Yc, radius+Xc, height+Yc );
  path.lineTo( width-radius+Xc, height+Yc );
  path.quadraticCurveTo( width-radius*inverted+Xc, height-radius*inverted+Yc, width+Xc, height-radius+Yc );
  path.lineTo( width+Xc, radius+Yc );
  path.quadraticCurveTo( width-radius*inverted+Xc, radius*inverted+Yc, width-radius+Xc, Yc);
  path.lineTo( radius+Xc, Yc);
  path.quadraticCurveTo( radius*inverted+Xc, radius*inverted+Yc, Xc, radius+Yc );

  var points = path.getPoints();
  var geometry = new THREE.Geometry().setFromPoints( points );
  var material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});

  var rectangle = new THREE.Line(geometry, material);
  rectangle.name = "rectangle"
  fileObject.add(rectangle);
  fileObject.name = `Rectangle (x:${xCenter} y:${yCenter})` // "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
    resetView();
  }, 250);
}





function addStar(xCenter,yCenter,innerDiameter,outerDiameter,pointCount){
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }

  var Xc=parseFloat(xCenter);
  var Yc=parseFloat(yCenter);
  var innerRadius=innerDiameter/2;
  var outerRadius=outerDiameter/2;

  var theta=2*Math.PI/pointCount;

  var path = new THREE.Path();

  path.moveTo( Xc, outerRadius+Yc); 

  for (i=0;i<pointCount;i++){
   path.lineTo( outerRadius*Math.sin(theta*(i))+Xc, outerRadius*Math.cos(theta*(i))+Yc);
   path.lineTo( innerRadius*Math.sin(theta*(i+0.5))+Xc, innerRadius*Math.cos(theta*(i+0.5))+Yc);
  }
  path.lineTo( Xc, outerRadius+Yc); 

  var points = path.getPoints();
  var geometry = new THREE.Geometry().setFromPoints( points );
  var material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});

  var star = new THREE.Line(geometry, material);
  star.name = "star"
  fileObject.add(star);
  fileObject.name = `Star (x:${xCenter} y:${yCenter})` // "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
    resetView();
  }, 250);
}
 



function addTriangle(xCenter,yCenter,sideA,sideB,sideC){
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }

  var Xc=parseFloat(xCenter);
  var Yc=parseFloat(yCenter);
  var a=parseFloat(sideA);
  var b=parseFloat(sideB);
  var c=parseFloat(sideC);


  if(a+b>c && a+c>b && b+c>a){

    var path = new THREE.Path();

    cosC=(Math.pow(a,2)+Math.pow(b,2)-Math.pow(c,2))/(2*a*b)
    sinC=Math.sqrt(1-Math.pow(cosC,2))

    path.moveTo(Xc-a/2, Yc- (b*sinC)/2); 
    path.lineTo(Xc-a/2 + b*cosC, Yc+(b*sinC)/2);
    path.lineTo(Xc+ a/2,Yc- (b*sinC)/2);
    path.lineTo(Xc-a/2,Yc- (b*sinC)/2)
    

    var points = path.getPoints();
    var geometry = new THREE.Geometry().setFromPoints( points );
    var material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});

    var triangle = new THREE.Line(geometry, material);
    triangle.name = "triangle"
    fileObject.add(triangle);
    fileObject.name = `Triangle (x:${xCenter} y:${yCenter})` // "Internal CAD" + Math.random()
    if (!existingInternalCad) {
      objectsInScene.push(fileObject)
    }
    setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
    resetView();
    }, 250);
  }else{

  }
}



function addLine(xCenter1,yCenter1,xCenter2,yCenter2){
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }

  var lx1=parseFloat(xCenter1);
  var ly1=parseFloat(yCenter1);
  var lx2=parseFloat(xCenter2);
  var ly2=parseFloat(yCenter2);

  var linegeom = new THREE.Geometry();
  linegeom.vertices.push(new THREE.Vector3(lx1, ly1, 0));
  linegeom.vertices.push(new THREE.Vector3(lx2, ly2, 0));

  var material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});

  var line = new THREE.Line(linegeom, material);
  line.name = "line"
  fileObject.add(line);
  fileObject.name = `Line (x:${xCenter1} y:${yCenter1} - x:${xCenter2} y:${yCenter2})` // "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
    resetView();
  }, 250);
}



function addGrid(xLength,yWidth,xSpace,ySpace){
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }

  var xL=parseFloat(xLength);
  var yW=parseFloat(yWidth);
  var xS=parseFloat(xSpace);
  var yS=parseFloat(ySpace);

  var xLineCount=Math.floor(xL/xS);
  var yLineCount=Math.floor(yW/yS);

  for (i=0;i<yLineCount+1;i++){
  var linegeom= new THREE.Geometry();
  linegeom.vertices.push(new THREE.Vector3(0, yS*i, 0));
  linegeom.vertices.push(new THREE.Vector3(xL, yS*(i), 0));
  
  var material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});
  var grid = new THREE.Line(linegeom, material);
  grid.name = "XGrid"
  fileObject.add(grid);
  }
  for (i=0;i<xLineCount+1;i++){
    var linegeom= new THREE.Geometry();
    linegeom.vertices.push(new THREE.Vector3(xS*i, 0, 0));
    linegeom.vertices.push(new THREE.Vector3(xS*i, yW, 0));
    
    var material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});
    var grid = new THREE.Line(linegeom, material);
    grid.name = "YGrid"
    fileObject.add(grid);
  }

 

  fileObject.name = `Grid` // "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
    resetView();
  }, 250);
}




  unitSwitch.addEventListener('change', function() {
    if (this.checked) {
      //circle
      $("#circleXc").val(2);
      $("#circleYc").val(2);
      $("#circleRadius").val(0.5);
      //rectangle
      $("#rectXc").val(2);
      $("#rectYc").val(2);
      $("#rectX").val(3);
      $("#rectY").val(2);
      $("#rectR").val(0.25);
      //star
      $("#starXc").val(2);
      $("#starYc").val(2);
      $("#starOD").val(4);
      $("#starID").val(1.528);
      //triangle
      $("#triangleXc").val(2);
      $("#triangleYc").val(2);
      $("#triangleSideA").val(4);
      $("#triangleSideB").val(5);
      $("#triangleSideC").val(3);
      //ellipse
      $("#ellipseXc").val(2);
      $("#ellipseYc").val(2);
      $("#ellipseX").val(3.5);
      $("#ellipseY").val(2.5);
      //line
      $("#lineX1").val(0);
      $("#lineY1").val(2);
      $("#lineX2").val(4);
      $("#lineY2").val(2);
      //grid
      $("#gridX").val(12);
      $("#gridY").val(8);
      $("#gridSpaceX").val(1);
      $("#gridSpaceY").val(1);

    } else {
      //circle
      $("#circleXc").val(50);
      $("#circleYc").val(50);
      $("#circleRadius").val(10);
      //rectangle
      $("#rectXc").val(50);
      $("#rectYc").val(50);
      $("#rectX").val(80);
      $("#rectY").val(50);
      $("#rectR").val(5);
      //star
      $("#starXc").val(50);
      $("#starYc").val(50);
      $("#starOD").val(100);
      $("#starID").val(38.2);
      //triangle
      $("#triangleXc").val(50);
      $("#triangleYc").val(50);
      $("#triangleSideA").val(40);
      $("#triangleSideB").val(50);
      $("#triangleSideC").val(30);
      //ellipse
      $("#ellipseXc").val(50);
      $("#ellipseYc").val(50);
      $("#ellipseX").val(80);
      $("#ellipseY").val(60);
      //line
      $("#lineX1").val(0);
      $("#lineY1").val(50);
      $("#lineX2").val(100);
      $("#lineY2").val(50);
      //line
      $("#gridX").val(300);
      $("#gridY").val(200);
      $("#gridSpaceX").val(25);
      $("#gridSpaceY").val(25);

    }
    redrawGrid();
    resetView();
  });




var unitDisplay="inch";

$(document).ready(function() {
  var modal = `

  <div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="addShapeCircle" data-to-top="true">
    <div class="dialog-title" id="statusTitle">Add shape: Circle</div>
    <div class="dialog-content">
    <form>
      <input type="number" class="form-control" id="circleXc" value="50" data-role="input"  data-prepend="X Center" step="any">
      <br>
      <input type="number" class="form-control" id="circleYc" value="50" data-role="input"  data-prepend="Y Center" step="any">
      <br>
      <input type="number" class="form-control" id="circleRadius" value="10" data-role="input"  data-prepend="Radius" step="any">
      <br>
      <input type="number" class="form-control" id="circleSegments" value="32" data-role="input"  data-prepend="Segments" step="any">
      <small>Segments determines the smoothness of the circle, as circles are processed as Polylines</small>
    </form>
    </div>
    <div class="dialog-actions" id="statusFooter">
      <button class="button js-dialog-close">Cancel</button>
      <button type="button" class="button js-dialog-close success" id="CreateCircle">Create</button>
    </div>
  </div>

  <div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="addShapeRect" data-to-top="true">
		<div class="dialog-title" id="statusTitle">Add shape: Rectangle</div>
		<div class="dialog-content">
    <form>
    <input type="number" class="form-control" id="rectXc" value="50" data-role="input"  data-prepend="X Center" step="any">
    <br>
    <input type="number" class="form-control" id="rectYc" value="50" data-role="input"  data-prepend="Y Center" step="any">
    <br>
    <input type="number" class="form-control" id="rectX" value="80" data-role="input"  data-prepend="Width" step="any">
      <br>
    <input type="number" class="form-control" id="rectY" value="50" data-role="input"  data-prepend="Height" step="any">
      <br>
    <input type="number" class="form-control" id="rectR" value="5" data-role="input"  data-prepend="Corner Radius" step="any">
      <br>
    <input type="checkbox" class="form-control" id="rectI" value="1" data-role="checkbox"  data-caption="Invert Radius"  data-style="2" step="any">
    </form>
		</div>
		<div class="dialog-actions" id="statusFooter">
			<button class="button js-dialog-close">Cancel</button>
      <button type="button" class="button js-dialog-close success" id="CreateRect">Create</button>
		</div>
	</div>

  <div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="addShapeStar" data-to-top="true">
		<div class="dialog-title" id="statusTitle">Add shape: Star</div>
		<div class="dialog-content">
    <form>
      <input type="number" class="form-control" id="starXc" value="50" data-role="input"  data-prepend="X  Center" step="any">
      <br>
      <input type="number" class="form-control" id="starYc" value="50" data-role="input"  data-prepend="Y  Center" step="any">
      <br>
      <input type="number" class="form-control" id="starOD" value="100" data-role="input"  data-prepend=" Outside Diameter" step="any">
      <br>
      <input type="number" class="form-control" id="starID" value="38.2" data-role="input"  data-prepend=" Inside Diameter" step="any">
      <br>
      <input type="number" class="form-control" id="starPointCount" value="5" data-role="input" data-append="" data-prepend="Number of Points" step="any">
    </form>
		</div>
		<div class="dialog-actions" id="statusFooter">
			<button class="button js-dialog-close">Cancel</button>
      <button type="button" class="button js-dialog-close success" id="CreateStar">Create</button>
		</div>
	</div>



  <div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="addShapeTriangle" data-to-top="true">
  <div class="dialog-title" id="statusTitle">Add shape: Triangle</div>
  <div class="dialog-content">
  <form>
    <input type="number" class="form-control" id="triangleXc" value="50" data-role="input"  data-prepend="X  Center" step="any">
    <br>
    <input type="number" class="form-control" id="triangleYc" value="50" data-role="input" data-prepend="Y  Center" step="any">
    <br>
    <input type="number" class="form-control" id="triangleSideA" value="40" data-role="input" data-prepend=" Base" step="any">
    <br>
    <input type="number" class="form-control" id="triangleSideB" value="50" data-role="input"  data-prepend="Left Side" step="any">
    <br>
    <input type="number" class="form-control" id="triangleSideC" value="30" data-role="input" data-append="" data-prepend="Right Side" step="any">
  </form>
  </div>
  <div class="dialog-actions" id="statusFooter">
    <button class="button js-dialog-close">Cancel</button>
    <button type="button" class="button js-dialog-close success" id="CreateTriangle">Create</button>
  </div>
</div>

<div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="addShapeEllipse" data-to-top="true">
<div class="dialog-title" id="statusTitle">Add shape: Ellipse</div>
<div class="dialog-content">
<form>
  <input type="number" class="form-control" id="ellipseXc" value="50" data-role="input"  data-prepend="X  Center" step="any">
  <br>
  <input type="number" class="form-control" id="ellipseYc" value="50" data-role="input"  data-prepend="Y  Center" step="any">
  <br>
  <input type="number" class="form-control" id="ellipseX" value="80" data-role="input"  data-prepend="Width" step="any">
  <br>
  <input type="number" class="form-control" id="ellipseY" value="60" data-role="input"  data-prepend="Height" step="any">
 
</form>
</div>
<div class="dialog-actions" id="statusFooter">
  <button class="button js-dialog-close">Cancel</button>
  <button type="button" class="button js-dialog-close success" id="CreateEllipse">Create</button>
</div>
</div>


<div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="addShapeLine" data-to-top="true">
<div class="dialog-title" id="statusTitle">Add shape: Line</div>
<div class="dialog-content">
<form>
  <input type="number" class="form-control" id="lineX1" value="0" data-role="input"  data-prepend="X Start Point" step="any">
  <br>
  <input type="number" class="form-control" id="lineY1" value="50" data-role="input"  data-prepend="Y Start Point" step="any">
  <br>
  <input type="number" class="form-control" id="lineX2" value="100" data-role="input"  data-prepend="X End Point" step="any">
  <br>
  <input type="number" class="form-control" id="lineY2" value="50" data-role="input"  data-prepend="Y End Point" step="any">

</form>
</div>
<div class="dialog-actions" id="statusFooter">
  <button class="button js-dialog-close">Cancel</button>
  <button type="button" class="button js-dialog-close success" id="CreateLine">Create</button>
</div>
</div>


<div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="addShapeGrid" data-to-top="true">
<div class="dialog-title" id="statusTitle">Add shape: Grid</div>
<div class="dialog-content">
<form>
  <input type="number" class="form-control" id="gridX" value="300" data-role="input"  data-prepend="X Length" step="any">
  <br>
  <input type="number" class="form-control" id="gridY" value="200" data-role="input"  data-prepend="Y  Width" step="any">
  <br>
  <input type="number" class="form-control" id="gridSpaceX" value="25" data-role="input" " data-prepend="X Spacing" step="any">
  <br>
  <input type="number" class="form-control" id="gridSpaceY" value="25" data-role="input"  data-prepend="Y Spacing" step="any">
 
</form>
</div>
<div class="dialog-actions" id="statusFooter">
  <button class="button js-dialog-close">Cancel</button>
  <button type="button" class="button js-dialog-close success" id="CreateGrid">Create</button>
</div>
</div>













  `
  $("body").append(modal);

  $("#CreateEllipse").on("click", function(event) {
    //console.log("Clicked on Ellipse")
    event.preventDefault();
    var xCenter= parseFloat($("#ellipseXc").val());
    var yCenter= parseFloat($("#ellipseYc").val());
    var Width= parseFloat($("#ellipseX").val())/2;
    var Height= parseFloat($("#ellipseY").val())/2;
    addEllipse(xCenter,yCenter,Width,Height);
  });





  $("#CreateCircle").on("click", function(event) {
    //console.log("Clicked on CreateCircle")
    event.preventDefault();
    var xCenter = parseFloat($("#circleXc").val());
    var yCenter = parseFloat($("#circleYc").val());
    var radius = $("#circleRadius").val();
    var segments = $("#circleSegments").val();



    
    addCircle(xCenter, yCenter, radius, segments);
  });

 

  
  $("#CreateRect").on("click", function(event) {
    //console.log("Clicked on Rectangle")
    event.preventDefault();
    var xCenter= parseFloat($("#rectXc").val());
    var yCenter= parseFloat($("#rectYc").val());
    var width = parseFloat($("#rectX").val());
    var height = parseFloat( $("#rectY").val());
    var radius = parseFloat( $("#rectR").val());
    var inverted =  parseFloat($("#rectI:checked").val());
    addRect(xCenter, yCenter, width, height,radius,inverted);
  });


  $("#CreateStar").on("click", function(event) {
    //console.log("Clicked on CreateStar")
    event.preventDefault();
    var xCenter = $("#starXc").val();
    var yCenter = $("#starYc").val();
    var innerDiameter = $("#starID").val();
    var outerDiameter = $("#starOD").val();
    var pointCount = $("#starPointCount").val();
    addStar(xCenter,yCenter,innerDiameter,outerDiameter,pointCount);
  });


  $("#CreateTriangle").on("click", function(event) {
    //console.log("Clicked on CreateStar")
    event.preventDefault();
    var xCenter = $("#triangleXc").val();
    var yCenter = $("#triangleYc").val();
    var sideA = $("#triangleSideA").val();
    var sideB = $("#triangleSideB").val();
    var sideC = $("#triangleSideC").val();
    addTriangle(xCenter,yCenter,sideA,sideB,sideC);
  });

  $("#CreateLine").on("click", function(event) {
    //console.log("Clicked on CreateStar")
    event.preventDefault();
    var lineX1 = $("#lineX1").val();
    var lineY1 = $("#lineY1").val();
    var lineX2 = $("#lineX2").val();
    var lineY2 = $("#lineY2").val();
    addLine(lineX1,lineY1,lineX2,lineY2);
  });


  $("#CreateGrid").on("click", function(event) {
    //console.log("Clicked on CreateStar")
    event.preventDefault();
    var xLength = $("#gridX").val();
    var yWidth = $("#gridY").val();
    var xSpace = $("#gridSpaceX").val();
    var ySpace = $("#gridSpaceY").val();
    addGrid(xLength,yWidth,xSpace,ySpace);
  });



});


