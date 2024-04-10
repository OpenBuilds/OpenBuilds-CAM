var font = null;

var loader = new THREE.FontLoader();
loader.load('lib/dxf/helvetiker_regular.typeface.json', function(newFont) {
  font = newFont
});


/**
 * Returns the angle in radians of the vector (p1,p2). In other words, imagine
 * putting the base of the vector at coordinates (0,0) and finding the angle
 * from vector (1,0) to (p1,p2).
 * @param  {Object} p1 start point of the vector
 * @param  {Object} p2 end point of the vector
 * @return {Number} the angle
 */
THREE.Math.angle2 = function(p1, p2) {
  var v1 = new THREE.Vector2(p1.x, p1.y);
  var v2 = new THREE.Vector2(p2.x, p2.y);
  v2.sub(v1); // sets v2 to be our chord
  v2.normalize(); // normalize because cos(theta) =
  // if(v2.y < 0) return Math.PI + (Math.PI - Math.acos(v2.x));
  if (v2.y < 0) return -Math.acos(v2.x);
  return Math.acos(v2.x);
};


THREE.Math.polar = function(point, distance, angle) {
  var result = {};
  result.x = point.x + distance * Math.cos(angle);
  result.y = point.y + distance * Math.sin(angle);
  return result;
};

/**
 * Calculates points for a curve between two points
 * @param startPoint - the starting point of the curve
 * @param endPoint - the ending point of the curve
 * @param bulge - a value indicating how much to curve
 * @param segments - number of segments between the two given points
 */
THREE.BulgeGeometry = function(startPoint, endPoint, bulge, segments) {

  var vertex, i,
    center, p0, p1, angle,
    radius, startAngle,
    thetaAngle;

  THREE.Geometry.call(this);

  this.startPoint = p0 = startPoint ? new THREE.Vector2(startPoint.x, startPoint.y) : new THREE.Vector2(0, 0);
  this.endPoint = p1 = endPoint ? new THREE.Vector2(endPoint.x, endPoint.y) : new THREE.Vector2(1, 0);
  this.bulge = bulge = bulge || 1;

  angle = 4 * Math.atan(bulge);
  radius = p0.distanceTo(p1) / 2 / Math.sin(angle / 2);
  center = THREE.Math.polar(startPoint, radius, THREE.Math.angle2(p0, p1) + (Math.PI / 2 - angle / 2));

  this.segments = segments = segments || Math.max(Math.abs(Math.ceil(angle / (Math.PI / 18))), 6); // By default want a segment roughly every 10 degrees
  startAngle = THREE.Math.angle2(center, p0);
  thetaAngle = angle / segments;


  this.vertices.push(new THREE.Vector3(p0.x, p0.y, 0));

  for (i = 1; i <= segments - 1; i++) {

    vertex = THREE.Math.polar(center, Math.abs(radius), startAngle + thetaAngle * i);

    this.vertices.push(new THREE.Vector3(vertex.x, vertex.y, 0));

  }

};

THREE.BulgeGeometry.prototype = Object.create(THREE.Geometry.prototype);

/**
 * Viewer class for a dxf object.
 * @param {Object} data - the dxf object
 * @param {Number} width - width of the rendering canvas in pixels
 * @param {Number} height - height of the rendering canvas in pixels
 * @constructor
 */
function processDXF(data) {
  console.log(data);

  if (typeof(fileObject) !== 'undefined') {
    scene.remove(fileObject);
  };
  fileObject = new THREE.Group();

  var i, entity;

  for (i = 0; i < data.entities.length; i++) {
    entity = data.entities[i];
    // console.log(entity)

    if (entity.type === 'DIMENSION') {
      if (entity.block) {
        var block = data.blocks[entity.block];
        for (j = 0; j < block.entities.length; j++) {
          drawEntity(block.entities[j], data, j);
        }
      } else {
        console.log('WARNING: No block for DIMENSION entity');
      }
    } else {
      drawEntity(entity, data, 0);
    }

    scene.add(fileObject);
  }
}



function drawEntity(index, entity, dxf) {
  console.log('inside drawEntity:  Entity ', entity, '  Index: ', index)
  if (entity.type === 'CIRCLE' || entity.type === 'ARC') {
    var dxfentity = drawCircle(entity, index);
  } else if (entity.type === 'LWPOLYLINE' || entity.type === 'LINE' || entity.type === 'POLYLINE') {
    var dxfentity = drawLine(entity, index);
  } else if (entity.type === 'TEXT') {
    var dxfentity = drawText(entity, index);
  } else if (entity.type === 'SOLID') {
    var dxfentity = drawSolid(entity, index);
  } else if (entity.type === 'POINT') {
    var dxfentity = drawPoint(entity, index);
  } else if (entity.type === 'INSERT') {
    dxfentity = drawBlock(entity, index, dxf);
  } else if (entity.type === 'SPLINE') {
    dxfentity = drawSpline(entity, index);
  } else if (entity.type === 'MTEXT') {
    dxfentity = drawMtext(entity, index);
  } else if (entity.type === 'ELLIPSE') {
    dxfentity = drawEllipse(entity, index);
  } else {
    console.log("Unsupported Entity Type: " + entity.type);
  }

  if (entity.layer) {
    var id = entity.layer.replace(/[^a-z0-9-]/gim, '-');
    if (dxfentity) {
      console.log(dxfentity)
      dxfentity.userData.layer = {
        id: fileObject.uuid + '_' + id,
        label: entity.layer.replace(/[^a-z0-9-]/gim, '-'),
        parent: null
      };
    }
  }

  if (entity.type) {
    if (dxfentity)
      dxfentity.name = entity.type + index
  } else {
    if (dxfentity)
      dxfentity.name = "dxfEntity" + index
  }

  if (dxfentity) {
    dxfentity.userData.color = dxfentity.material.color.getHex();

    return dxfentity;
  } else {
    return false;
  }

}

function drawSpline(entity, data) {
  var color = getDXFColor(entity, data);

  var points = entity.controlPoints.map(function(vec) {
    return new THREE.Vector2(vec.x, vec.y);
  });

  var interpolatedPoints = [];
  if (entity.degreeOfSplineCurve === 2 || entity.degreeOfSplineCurve === 3) {
    for (var i = 0; i + 2 < points.length; i = i + 2) {
      if (entity.degreeOfSplineCurve === 2) {
        curve = new THREE.QuadraticBezierCurve(points[i], points[i + 1], points[i + 2]);
      } else {
        curve = new THREE.QuadraticBezierCurve3(points[i], points[i + 1], points[i + 2]);
      }
      interpolatedPoints.push.apply(interpolatedPoints, curve.getPoints(50));
    }
  } else {
    curve = new THREE.SplineCurve(points);
    interpolatedPoints = curve.getPoints(100);
  }

  var geometry = new THREE.Geometry().setFromPoints(interpolatedPoints);
  var material = new THREE.LineBasicMaterial({
    linewidth: 1,
    color: color
  });
  var splineObject = new THREE.Line(geometry, material);

  return splineObject;
}

function drawMtext(entity, data) {
  var color = getDXFColor(entity, data);

  console.log("MTEXT: ", entity, entity.text)

  var geometry = new THREE.TextGeometry(entity.text, {
    font: font,
    size: entity.height * (4 / 5),
    height: 1
  });
  var material = new THREE.MeshBasicMaterial({
    color: color
  });
  var text = new THREE.Mesh(geometry, material);

  // Measure what we rendered.
  var measure = new THREE.Box3();
  measure.setFromObject(text);

  var textWidth = measure.max.x - measure.min.x;

  // If the text ends up being wider than the box, it's supposed
  // to be multiline. Doing that in threeJS is overkill.
  if (textWidth > entity.width) {
    console.log("Can't render this multipline MTEXT entity, sorry.", entity);
    return undefined;
  }

  text.position.z = 0;
  switch (entity.attachmentPoint) {
    case 1:
      // Top Left
      text.position.x = entity.position.x;
      text.position.y = entity.position.y - entity.height;
      break;
    case 2:
      // Top Center
      text.position.x = entity.position.x - textWidth / 2;
      text.position.y = entity.position.y - entity.height;
      break;
    case 3:
      // Top Right
      text.position.x = entity.position.x - textWidth;
      text.position.y = entity.position.y - entity.height;
      break;

    case 4:
      // Middle Left
      text.position.x = entity.position.x;
      text.position.y = entity.position.y - entity.height / 2;
      break;
    case 5:
      // Middle Center
      text.position.x = entity.position.x - textWidth / 2;
      text.position.y = entity.position.y - entity.height / 2;
      break;
    case 6:
      // Middle Right
      text.position.x = entity.position.x - textWidth;
      text.position.y = entity.position.y - entity.height / 2;
      break;

    case 7:
      // Bottom Left
      text.position.x = entity.position.x;
      text.position.y = entity.position.y;
      break;
    case 8:
      // Bottom Center
      text.position.x = entity.position.x - textWidth / 2;
      text.position.y = entity.position.y;
      break;
    case 9:
      // Bottom Right
      text.position.x = entity.position.x - textWidth;
      text.position.y = entity.position.y;
      break;

    default:
      return undefined;
  };

  return text;
}

function drawEllipse(entity, data) {
  var color = getDXFColor(entity, data);

  var xrad = Math.sqrt(Math.pow(entity.majorAxisEndPoint.x, 2) + Math.pow(entity.majorAxisEndPoint.y, 2));
  var yrad = xrad * entity.axisRatio;
  var rotation = Math.atan2(entity.majorAxisEndPoint.y, entity.majorAxisEndPoint.x);

  var curve = new THREE.EllipseCurve(
    entity.center.x, entity.center.y,
    xrad, yrad,
    entity.startAngle, entity.endAngle,
    false, // Always counterclockwise
    rotation
  );

  var points = curve.getPoints(50);
  var geometry = new THREE.Geometry().setFromPoints(points);
  var material = new THREE.LineBasicMaterial({
    linewidth: 1,
    color: color
  });

  // Create the final object to add to the scene
  var ellipse = new THREE.Line(geometry, material);
  return ellipse;
}


function drawBlock(entity, index, data) {
  console.log9
  var block = data.blocks[entity.name];

  if (!block.entities) return null;

  var group = new THREE.Object3D()

  if (entity.xScale) group.scale.x = entity.xScale;
  if (entity.yScale) group.scale.y = entity.yScale;

  if (entity.rotation) {
    group.rotation.z = entity.rotation * Math.PI / 180;
  }

  if (entity.position) {
    group.position.x = entity.position.x;
    group.position.y = entity.position.y;
    group.position.z = entity.position.z;
  }

  for (var i = 0; i < block.entities.length; i++) {
    //function drawEntity(index, entity, dxf) {
    var childEntity = drawEntity(index + '-' + i, block.entities[i], group);
    console.log(childEntity)
    if (childEntity) group.add(childEntity);
  }

  return group;
}


function drawLine(entity, index) {
  //console.log('inside drawLine ', entity, ' Index: ', index  )
  var geometry = new THREE.Geometry(),
    color = getDXFColor(entity),
    material, lineType, vertex, startPoint, endPoint, bulgeGeometry,
    bulge, i, line;

  // create geometry
  for (i = 0; i < entity.vertices.length; i++) {

    if (entity.vertices[i].bulge) {
      bulge = entity.vertices[i].bulge;
      startPoint = entity.vertices[i];
      endPoint = i + 1 < entity.vertices.length ? entity.vertices[i + 1] : geometry.vertices[0];

      bulgeGeometry = new THREE.BulgeGeometry(startPoint, endPoint, bulge);

      geometry.vertices.push.apply(geometry.vertices, bulgeGeometry.vertices);
    } else {
      vertex = entity.vertices[i];
      geometry.vertices.push(new THREE.Vector3(vertex.x, vertex.y, 0));
    }

  }
  if (entity.shape) geometry.vertices.push(geometry.vertices[0]);

  if (lineType && lineType.pattern && lineType.pattern.length !== 0) {
    material = new THREE.LineDashedMaterial({
      color: color,
      gapSize: 4,
      dashSize: 4
    });
  } else {
    material = new THREE.LineBasicMaterial({
      linewidth: 1,
      color: color,
      transparent: true
    });
  }
  var dxfentity = new THREE.Line(geometry, material);
  return dxfentity;
}

function drawCircle(entity, index) {

  // calc and draw gcode
  var radius = entity.radius;
  //console.log('Radius:'+radius+' and Center '+entity.center.x+','+entity.center.y+','+entity.center.z+',\n'); // Radius:220 and Center 0,0,0,
  var arcTotalDeg = entity.startAngleDeg - entity.endAngleDeg;
  //console.log('Start Angle: '+entity.startAngleDeg+', End Angle: '+entity.endAngleDeg+', thus spanning '+arcTotalDeg+'deg' );

  // Draw it since its cool to see (note this is a straigh three.js view of it, not via gcode.  Can be used in the Cutting Params view by coloring object/layers to change params)
  var geometry, material, circle;

  geometry = new THREE.CircleGeometry(entity.radius, 128, entity.startAngle, entity.angleLength);
  geometry.vertices.shift();

  material = new THREE.LineBasicMaterial({
    color: getDXFColor(entity),
    transparent: true
  });

  //circle = new THREE.Line(geometry, material);

  var dxfentity = new THREE.Line(geometry, material);
  dxfentity.translateX(entity.center.x);
  dxfentity.translateY(entity.center.y);
  dxfentity.translateZ(entity.center.z);
  return dxfentity;

  // window["dxfEntity" + index] = new THREE.Line(geometry, material);

}

function drawSolid(entity, index) {
  var material, mesh, solid, verts;
  geometry = new THREE.Geometry();

  verts = geometry.vertices;
  verts.push(new THREE.Vector3(entity.points[0].x, entity.points[0].y, entity.points[0].z));
  verts.push(new THREE.Vector3(entity.points[1].x, entity.points[1].y, entity.points[1].z));
  verts.push(new THREE.Vector3(entity.points[2].x, entity.points[2].y, entity.points[2].z));
  verts.push(new THREE.Vector3(entity.points[3].x, entity.points[3].y, entity.points[3].z));

  // Calculate which direction the points are facing (clockwise or counter-clockwise)
  var vector1 = new THREE.Vector3();
  var vector2 = new THREE.Vector3();
  vector1.subVectors(verts[1], verts[0]);
  vector2.subVectors(verts[2], verts[0]);
  vector1.cross(vector2);

  // If z < 0 then we must draw these in reverse order
  if (vector1.z < 0) {
    geometry.faces.push(new THREE.Face3(2, 1, 0));
    geometry.faces.push(new THREE.Face3(2, 3, 0));
  } else {
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 3, 2));
  }


  material = new THREE.MeshBasicMaterial({
    color: getDXFColor(entity),
    transparent: true
  });

  var dxfentity = new THREE.Mesh(geometry, material);
  // window["dxfEntity" + index] = new THREE.Mesh(geometry, material);
  return dxfentity;
}

function drawText(entity, index) {
  var geometry, material, text;

  console.log("TEXT: " + entity.text)



  // loader.load('lib/dxf/helvetiker_regular.typeface.json', function(font) {
  geometry = new THREE.TextGeometry(entity.text, {
    font: font,
    height: 0,
    size: entity.textHeight || 12
  });

  material = new THREE.MeshBasicMaterial({
    color: getDXFColor(entity)
  });

  var dxfentity = new THREE.Mesh(geometry, material);
  dxfentity.translateX(entity.startPoint.x);
  dxfentity.translateY(entity.startPoint.y);
  dxfentity.translateZ(entity.startPoint.z);
  dxfentity.userData.text = entity.text
  console.log(dxfentity)

  // Disabled 20190425 - TextGeometry returns a 3D mesh, so three.line doesnt render it correctly
  return dxfentity;
  // });




}

function drawPoint(entity, index) {
  var geometry, material, point;

  geometry = new THREE.Geometry();

  geometry.vertices.push(new THREE.Vector3(entity.position.x, entity.position.y, entity.position.z));

  // TODO: could be more efficient. PointCloud per layer?

  var numPoints = 1;

  var color = getDXFColor(entity);
  var colors = new Float32Array(numPoints * 3);
  colors[0] = color.r;
  colors[1] = color.g;
  colors[2] = color.b;

  geometry.colors = colors;
  geometry.computeBoundingBox();

  material = new THREE.PointCloudMaterial({
    size: 0.05,
    vertexColors: THREE.VertexColors,
    transparent: true
  });

  // window["dxfEntity" + index] = new THREE.PointCloud(geometry, material);
  var dxfentity = new THREE.PointCloud(geometry, material);
  return dxfentity;
}

function getDXFColor(entity) {
  var color = entity.color
  //var color = entity.color || data.tables.layers[entity.layer].color;
  if (color === 0xffffff) {
    color = Theme.CAM_DOC_DEFAULT_COLOR;
  }
  if (!color) {
    color = Theme.CAM_DOC_DEFAULT_COLOR;
  }
  //return 0x000099;
  console.log('DXF Color', color)
  return color;
}


function createLineTypeShaders(data) {
  var ltype, type;
  var ltypes = data.tables.lineTypes;

  for (type in ltypes) {
    ltype = ltypes[type];
    if (!ltype.pattern) continue;
    ltype.material = createDashedLineShader(ltype.pattern);
  }
}

function createDashedLineShader(pattern) {
  var i,
    dashedLineShader = {},
    totalLength = 0.0;

  for (i = 0; i < pattern.length; i++) {
    totalLength += Math.abs(pattern[i]);
  }

  dashedLineShader.uniforms = THREE.UniformsUtils.merge([

    THREE.UniformsLib['common'],
    THREE.UniformsLib['fog'],

    {
      'pattern': {
        type: 'fv1',
        value: pattern
      },
      'patternLength': {
        type: 'f',
        value: totalLength
      }
    }

  ]);

  dashedLineShader.vertexShader = [
    'attribute float lineDistance;',

    'varying float vLineDistance;',

    THREE.ShaderChunk['color_pars_vertex'],

    'void main() {',

    THREE.ShaderChunk['color_vertex'],

    'vLineDistance = lineDistance;',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'
  ].join('\n');

  dashedLineShader.fragmentShader = [
    'uniform vec3 diffuse;',
    'uniform float opacity;',

    'uniform float pattern[' + pattern.length + '];',
    'uniform float patternLength;',

    'varying float vLineDistance;',

    THREE.ShaderChunk['color_pars_fragment'],
    THREE.ShaderChunk['fog_pars_fragment'],

    'void main() {',

    'float pos = mod(vLineDistance, patternLength);',

    'for ( int i = 0; i < ' + pattern.length + '; i++ ) {',
    'pos = pos - abs(pattern[i]);',
    'if( pos < 0.0 ) {',
    'if( pattern[i] > 0.0 ) {',
    'gl_FragColor = vec4(1.0, 0.0, 0.0, opacity );',
    'break;',
    '}',
    'discard;',
    '}',

    '}',

    THREE.ShaderChunk['color_fragment'],
    THREE.ShaderChunk['fog_fragment'],

    '}'
  ].join('\n');

  return dashedLineShader;
}