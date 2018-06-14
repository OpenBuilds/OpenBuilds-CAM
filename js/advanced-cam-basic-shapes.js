$("#CreateCircle").on("click", function() {
  event.preventDefault();
  var radius = $("#circleRadius").val();
  addCircle(radius);
});

$("#AddCircle").on("click", function() {
  $("#addShapeCircle").modal("show");
  // dialog.dialog( "open" );
});

$("#AddText").on("click", function() {
  $("#addShapeText").modal("show");
  // dialog.dialog( "open" );
});

$('#font').fontselect().change(function() {

  // replace + signs with spaces for css
  var font = $(this).val().replace(/\+/g, ' ');
  // split font into family and weight
  font = font.split(':');
  // set family on paragraphs
  $('#texttorender').css('font-family', font[0]);
  console.log('font-family', font[0])
  var fontsize = $('#fontsize').val();
  $('#texttorender').css('font-size', fontsize + "px");
}).val("Aclonica");

$('#fontsize').change(function() {
  var fontsize = $('#fontsize').val();
  $('#texttorender').css('font-size', fontsize + "px");
});

$("#CreateText").on("click", function() {
  event.preventDefault();
  addText();
});

function addText() {
  var fontsize = $('#fontsize').val();
  var font = $("#font").val().replace(/\+/g, ' ');
  // split font into family and weight
  font = font.split(':');
  // set family on paragraphs
  var string = $("#texttorender").val()
  console.log('font-family: ', font[0], " size: ", fontsize, " String: " + string)

  var textasSVG = getText(font[0], "regular", string, fontsize)
  // var textasSVG = getText("Allan", "regular", "Go", 10)
  setTimeout(function() {
    var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 50 50\" width=\"150px\"> <path fill=\"#F7931E\" stroke=\"#000\" d=\"" + textasSVG._result + "\"/>  </svg>"
    console.log(svg)
    return lwsvgparser.loadFromString(svg).then(function(element) {
        return lwsvgparser.parse().then(function(tags) {
          lwsvgparser.editor = {
            name: "Opentype.js",
            version: "1.00"
          };
          drawFile("Text: " + string + " (" + font[0] + ")", tags, true);
          $("#addShapeText").modal("hide");
          resetView();
        });
      })
      .catch(function(error) {
        console.error('error:', error);
        $("#addShapeText").modal("hide");
        resetView();
      });

    printLog('SVG Opened', msgcolor, "file");
  }, 2000);
}

function addCircle(radius) {
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
  var geometry = new THREE.CircleGeometry(radius, 32);
  geometry.vertices.shift();
  geometry.vertices.push(geometry.vertices[0]);
  var material = new THREE.MeshBasicMaterial({
    color: 0xffff00
  });
  var circle = new THREE.Line(geometry, material);
  circle.name = "circle"
  circle.translateX(radius);
  circle.translateY(radius);
  fileObject.add(circle);
  fileObject.name = "Internal CAD"
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  $("#addShapeCircle").modal("hide");
  setTimeout(function() {
    fillTree();
  }, 250);
}

$("#CreateRect").on("click", function() {
  event.preventDefault();
  var width = $("#rectX").val();
  var height = $("#rectY").val();
  addRect(width, height);
});

$("#AddRect").on("click", function() {
  $("#addShapeRect").modal("show");
  // dialog.dialog( "open" );
});

function addRect(width, height) {
  var existingInternalCad = scene.getObjectByName("Internal CAD", true);
  if (!existingInternalCad) {
    var fileObject = new THREE.Group();
  } else {
    fileObject = existingInternalCad;
  }
  var rectgeom = new THREE.Geometry();
  rectgeom.vertices.push(new THREE.Vector3(0, 0, 0));
  rectgeom.vertices.push(new THREE.Vector3(0, height, 0));
  rectgeom.vertices.push(new THREE.Vector3(width, height, 0));
  rectgeom.vertices.push(new THREE.Vector3(width, 0, 0));
  rectgeom.vertices.push(new THREE.Vector3(0, 0, 0));
  // rectgeom.faces.push(new THREE.Face3(0, 1, 2));
  // rectgeom.faces.push(new THREE.Face3(0, 3, 2));
  var material = new THREE.MeshBasicMaterial({
    color: 0xffff00
  });
  var rectangle = new THREE.Line(rectgeom, material);
  rectangle.name = "rectangle"
  fileObject.add(rectangle);
  fileObject.name = "Internal CAD"
  if (!existingInternalCad) {
    objectsInScene.push(fileObject)
  }
  $("#addShapeRect").modal("hide");
  setTimeout(function() {
    fillTree();
  }, 250);
}

// FONTS

// Fetch GoogleFonts List
// $.get('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyDOcn3KpnYV-8SDuILln1YAH3FWT4K8G38', function (result) {
//   console.log(result)
// });

// from https://github.com/nraynaud/webgcode/blob/66e2662fcb72219024976610a6c66d307af84882/webapp/cnc/cam/text.js
var getFont = function(url) {
  if (url.match('^http://')) {
    url = url.replace("http://", "//")
  }
  if (url.match('^https://')) {
    url = url.replace("https://", "//")
  }
  return new RSVP.Promise(function(resolve, reject) {
    opentype.load(url, function(err, font) {
      if (err)
        reject();
      else
        resolve(font);
    });
  });
};

function getFontList() {
  return new RSVP.Promise(
    function(resolve, reject) {
      $.get('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyDOcn3KpnYV-8SDuILln1YAH3FWT4K8G38', function(result) {
        resolve(result.items);
      });
    });
}

function getTextFromData(fontData, fontVariant, text, fontSize, x, y) {
  if (fontVariant == null)
    fontVariant = 'regular';
  x = x == null ? 0 : x;
  y = y == null ? 0 : y;
  return getTextFromFile(fontData.files[fontVariant], text, fontSize, x, y);
}

function getTextFromFile(file, text, fontSize, offsetX, offsetY) {
  return getFont(file).then(function(font) {
    var path = font.getPath(text, 0, 0, fontSize);
    var res = '';

    function xy(x, y) {
      return (offsetX + x) + ',' + (offsetY - y);
    }

    for (var i = 0; i < path.commands.length; i++) {
      var c = path.commands[i];
      res += ' ' + c.type;
      if (c.type == 'M' || c.type == 'L')
        res += ' ' + xy(c.x, c.y);
      else if (c.type == 'Q')
        res += xy(c.x1, c.y1) + ' ' + xy(c.x, c.y);
      else if (c.type == 'C')
        res += xy(c.x1, c.y1) + ' ' + xy(c.x2, c.y2) + ' ' + xy(c.x, c.y);
    }
    // console.log(res)
    return res;
  })
}

function searchFontInList(fontList, fontFamily) {
  for (var i = 0; i < fontList.length; i++) {
    var font = fontList[i];
    if (font.family == fontFamily)
      return font;
  }
  throw {
    name: 'FontNotFound'
  };
}

function getText(fontFamily, fontVariant, text, fontSize) {
  return getFontList().then(function(fontList) {
    return getTextFromData(searchFontInList(fontList, fontFamily), fontVariant, text, fontSize);
  })
}