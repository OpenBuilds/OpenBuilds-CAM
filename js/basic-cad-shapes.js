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
  fileObject.name = "Internal CAD" + Math.random()
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
  fileObject.name = "Internal CAD" + Math.random()
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
  fileObject.name = "Internal CAD" + Math.random()
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
  fileObject.name = "Internal CAD" + Math.random()
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
    fileObject.name = "Internal CAD" + Math.random()
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
  fileObject.name = "Internal CAD" + Math.random()
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

  for (i=0;i<xLineCount+1;i++){
  var linegeom= new THREE.Geometry();
  linegeom.vertices.push(new THREE.Vector3(0, yS*i, 0));
  linegeom.vertices.push(new THREE.Vector3(xL, yS*(i), 0));
  linegeom.vertices.push(new THREE.Vector3(xL, yS*(i), 0));
  linegeom.vertices.push(new THREE.Vector3(0, yS*i, 0));
  
  var material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});
  var grid = new THREE.Line(linegeom, material);
  grid.name = "XGrid"
  fileObject.add(grid);
  }
  for (i=0;i<yLineCount+1;i++){
    var linegeom= new THREE.Geometry();
    linegeom.vertices.push(new THREE.Vector3(xS*i, 0, 0));
    linegeom.vertices.push(new THREE.Vector3(xS*i, yW, 0));
    
    var material = new THREE.MeshBasicMaterial({color: 0xffff00,side: THREE.DoubleSide});
    var grid = new THREE.Line(linegeom, material);
    grid.name = "YGrid"
    fileObject.add(grid);
  }

 

  fileObject.name = "Internal CAD" + Math.random()
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  setTimeout(function() {
    fillTree();
    changePositionToGeoTranslate();
    resetView();
  }, 250);
}




var unitDisplay="inch";

$(document).ready(function() {
  var modal = `

  <div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="addShapeCircle" data-to-top="true">
    <div class="dialog-title" id="statusTitle">Add shape: Circle</div>
    <div class="dialog-content">
    <form>
      <input type="number" class="form-control" id="XCenter" value="50" data-role="input" data-append="+'unitDisplay'+" data-prepend="X Center" step="any">
      <br>
      <input type="number" class="form-control" id="YCenter" value="50" data-role="input" data-append="mm" data-prepend="Y Center" step="any">
      <br>
      <input type="number" class="form-control" id="circleRadius" value="10" data-role="input" data-append="mm" data-prepend="Radius" step="any">
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
    <input type="number" class="form-control" id="rectXc" value="50" data-role="input" data-append="mm" data-prepend="X Center" step="any">
    <br>
    <input type="number" class="form-control" id="rectYc" value="50" data-role="input" data-append="mm" data-prepend="Y Center" step="any">
    <br>
    <input type="number" class="form-control" id="rectX" value="100" data-role="input" data-append="mm" data-prepend="Width" step="any">
      <br>
    <input type="number" class="form-control" id="rectY" value="50" data-role="input" data-append="mm" data-prepend="Height" step="any">
      <br>
    <input type="number" class="form-control" id="rectR" value="5" data-role="input" data-append="mm" data-prepend="Corner Radius" step="any">
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
      <input type="number" class="form-control" id="XCenterS" value="50" data-role="input" data-append="mm" data-prepend="X  Center" step="any">
      <br>
      <input type="number" class="form-control" id="YCenterS" value="50" data-role="input" data-append="mm" data-prepend="Y  Center" step="any">
      <br>
      <input type="number" class="form-control" id="ODS" value="100" data-role="input" data-append="mm" data-prepend=" Outside Diameter" step="any">
      <br>
      <input type="number" class="form-control" id="IDS" value="38.2" data-role="input" data-append="mm" data-prepend=" Inside Diameter" step="any">
      <br>
      <input type="number" class="form-control" id="PointCountS" value="5" data-role="input" data-append="" data-prepend="Number of Points" step="any">
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
    <input type="number" class="form-control" id="XCenterT" value="50" data-role="input" data-append="mm" data-prepend="X  Center" step="any">
    <br>
    <input type="number" class="form-control" id="YCenterT" value="50" data-role="input" data-append="mm" data-prepend="Y  Center" step="any">
    <br>
    <input type="number" class="form-control" id="SideA" value="40" data-role="input" data-append="mm" data-prepend=" Base" step="any">
    <br>
    <input type="number" class="form-control" id="SideB" value="50" data-role="input" data-append="mm" data-prepend="Left Side" step="any">
    <br>
    <input type="number" class="form-control" id="SideC" value="30" data-role="input" data-append="" data-prepend="Right Side" step="any">
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
  <input type="number" class="form-control" id="XCenterE" value="50" data-role="input" data-append="mm" data-prepend="X  Center" step="any">
  <br>
  <input type="number" class="form-control" id="YCenterE" value="50" data-role="input" data-append="mm" data-prepend="Y  Center" step="any">
  <br>
  <input type="number" class="form-control" id="WidthE" value="80" data-role="input" data-append="mm" data-prepend="Width" step="any">
  <br>
  <input type="number" class="form-control" id="HeightE" value="60" data-role="input" data-append="mm" data-prepend="Height" step="any">
 
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
  <input type="number" class="form-control" id="XStart" value="0" data-role="input" data-append="mm" data-prepend="X Start Point" step="any">
  <br>
  <input type="number" class="form-control" id="YStart" value="50" data-role="input" data-append="mm" data-prepend="Y Start Point" step="any">
  <br>
  <input type="number" class="form-control" id="XEnd" value="100" data-role="input" data-append="mm" data-prepend="X End Point" step="any">
  <br>
  <input type="number" class="form-control" id="YEnd" value="50" data-role="input" data-append="mm" data-prepend="Y End Point" step="any">

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
  <input type="number" class="form-control" id="XLength" value="600" data-role="input" data-append="mm" data-prepend="X Length" step="any">
  <br>
  <input type="number" class="form-control" id="YWidth" value="600" data-role="input" data-append="mm" data-prepend="Y  Width" step="any">
  <br>
  <input type="number" class="form-control" id="XSpace" value="50" data-role="input" data-append="mm" data-prepend="X Spacing" step="any">
  <br>
  <input type="number" class="form-control" id="YSpace" value="50" data-role="input" data-append="mm" data-prepend="Y Spacing" step="any">
 
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
    var xCenter= parseFloat($("#XCenterE").val());
    var yCenter= parseFloat($("#YCenterE").val());
    var Width= parseFloat($("#WidthE").val())/2;
    var Height= parseFloat($("#HeightE").val())/2;
    addEllipse(xCenter,yCenter,Width,Height);
  });





  $("#CreateCircle").on("click", function(event) {
    //console.log("Clicked on CreateCircle")
    event.preventDefault();
    var xCenter = parseFloat($("#XCenter").val());
    var yCenter = parseFloat($("#YCenter").val());
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
    var xCenter = $("#XCenterS").val();
    var yCenter = $("#YCenterS").val();
    var innerDiameter = $("#IDS").val();
    var outerDiameter = $("#ODS").val();
    var pointCount = $("#PointCountS").val();
    addStar(xCenter,yCenter,innerDiameter,outerDiameter,pointCount);
  });


  $("#CreateTriangle").on("click", function(event) {
    //console.log("Clicked on CreateStar")
    event.preventDefault();
    var xCenter = $("#XCenterT").val();
    var yCenter = $("#YCenterT").val();
    var sideA = $("#SideA").val();
    var sideB = $("#SideB").val();
    var sideC = $("#SideC").val();
    addTriangle(xCenter,yCenter,sideA,sideB,sideC);
  });

  $("#CreateLine").on("click", function(event) {
    //console.log("Clicked on CreateStar")
    event.preventDefault();
    var xCenter1 = $("#XStart").val();
    var yCenter1 = $("#YStart").val();
    var xCenter2 = $("#XEnd").val();
    var yCenter2 = $("#YEnd").val();
    addLine(xCenter1,yCenter1,xCenter2,yCenter2);
  });


  $("#CreateGrid").on("click", function(event) {
    //console.log("Clicked on CreateStar")
    event.preventDefault();
    var xLength = $("#XLength").val();
    var yWidth = $("#YWidth").val();
    var xSpace = $("#XSpace").val();
    var ySpace = $("#YSpace").val();
    addGrid(xLength,yWidth,xSpace,ySpace);
  });



});


