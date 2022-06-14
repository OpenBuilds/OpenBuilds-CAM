function addText() {
  var fontsize = $('#fontsize').val();

 
 
  var font = $("#font").val().replace(/\+/g, ' ');
  // split font into family and weight
  font = font.split(':');
  // set family on paragraphs
  var string = $("#texttorender").val()
  // console.log('font-family: ', font[0], " size: ", fontsize, " String: " + string)

  // var textasSVG = getText(font[0], "regular", string, fontsize)
  //
  // Then, use it:
  //
  getText(font[0], "regular", string, fontsize).then(function(textasSVG) {
    // console.log(textasSVG)
    var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 50 50\" width=\"150px\"> <path fill=\"#F7931E\" stroke=\"#000\" d=\"" + textasSVG + "\"/>  </svg>"
    // console.log(svg)
    return lwsvgparser.loadFromString(svg).then(function(element) {
        return lwsvgparser.parse().then(function(tags) {
          lwsvgparser.editor = {
            name: "Opentype.js",
            version: "1.00"
          };
          drawFile("Text: " + string + " (" + font[0] + ")", tags, true);
          resetView();
        });
      })
      .catch(function(error) {
        console.error('error:', error);
        // $("#addShapeText").modal("hide");
        resetView();
      });

    printLog('SVG Opened', msgcolor, "file");
  })


  // console.log(textasSVG)
  // setTimeout(function() {
  //   var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 50 50\" width=\"150px\"> <path fill=\"#F7931E\" stroke=\"#000\" d=\"" + textasSVG._result + "\"/>  </svg>"
  //   // console.log(svg)
  //   return lwsvgparser.loadFromString(svg).then(function(element) {
  //       return lwsvgparser.parse().then(function(tags) {
  //         lwsvgparser.editor = {
  //           name: "Opentype.js",
  //           version: "1.00"
  //         };
  //         drawFile("Text: " + string + " (" + font[0] + ")", tags, true);
  //         resetView();
  //       });
  //     })
  //     .catch(function(error) {
  //       console.error('error:', error);
  //       // $("#addShapeText").modal("hide");
  //       resetView();
  //     });
  //
  //   printLog('SVG Opened', msgcolor, "file");
  // }, 2000);
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

async function getFontList() {
  return await fetch('fonts/fontslib/fontslib.json')
    .then(response => response.json())
    .then(data => data.items);
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

    spaceWidth=parseFloat($("#fontspacing").val());

    var unitSwitch = document.getElementById("unitSwitch");
    if(unitSwitch.checked){
      var spaceWidth=spaceWidth/25.4;
      var xpos=16;
      var ypos=.4;
    }else{
      var xpos=0;
      var ypos=5;
 
    }

    var path = font.getPath(text, ypos, xpos, fontSize);
    var res = '';
    var xSpace=0;
    var zFound=[];
    var ctr=1;
    var ctr2=1;
    var x0=0;
    var x1=0;
    var x2=0;
    var xmax1=0;
    var xmax2=0;
    var maxEqual=[];
   
    // Allow change of spacing in between letters 
    // run through the letters to find letters that have 2 parts (example A, B, P, R..) 
    // send it to next for loop so spacing is not added for the second part of th letter
    for (var i = 0; i < path.commands.length; i++) {
      
      var c = path.commands[i];
         
      if (c.type == 'M' || c.type == 'L'){
        x0=c.x
      }else if (c.type == 'Q'){
        x1=Math.max(c.x,c.x1)
      }else if (c.type == 'C'){
        x2=Math.max(c.x,c.x1,c.x2)
      }
      if (c.type == 'Z'){
        zFound[ctr]=i;
      if(xmax1==xmax2){
        maxEqual[ctr2]=zFound[ctr-1];
        ctr2++;
        }
        xmax2=xmax1
        ctr++;
      }
      xmax1=Math.max(x0,x1,x2,xmax1)
    }

    function xy(x, y) {
      return (offsetX + x) + ',' + (offsetY - y);
    }  
     ctr2=1;

    for (var i = 0; i < path.commands.length; i++) {
      var c = path.commands[i];
      res += ' ' + c.type;
      if (c.type == 'M' || c.type == 'L')
        res += ' ' + xy(c.x+xSpace, c.y);
      else if (c.type == 'Q')
        res += xy(c.x1+xSpace, c.y1) + ' ' + xy(c.x+xSpace, c.y);
      else if (c.type == 'C')
        res += xy(c.x1+xSpace, c.y1) + ' ' + xy(c.x2+xSpace, c.y2) + ' ' + xy(c.x+xSpace, c.y);


      // only add the spacing betwen letters it is the nex letter.  
      if (c.type == 'Z'){
        if(maxEqual[ctr2]==i){
          console.log(ctr2+" ,"+maxEqual[ctr2])
          ctr2++;
        }else{
          xSpace+=spaceWidth;
        }
      }
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
  return new Promise(function(resolve, reject) {
    /*stuff using username, password*/
    return getFontList().then(function(fontList) {
      return getTextFromData(searchFontInList(fontList, fontFamily), fontVariant, text, fontSize);
    }).then(function(data) {
      // console.log(data)
      resolve(data);
    })
  });
}

// function getText(fontFamily, fontVariant, text, fontSize) {
//   return getFontList().then(function(fontList) {
//     return getTextFromData(searchFontInList(fontList, fontFamily), fontVariant, text, fontSize);
//   })
// }

$(document).ready(function() {
  var modal = `

  <div class="dialog dark" data-overlay-click-close="true" data-role="dialog" id="addShapeText" data-to-top="true">
    <div class="dialog-title" id="statusTitle">Add Text</div>
    <div class="dialog-content">
    <form>
      <div class="form-group row">
        Create a new set of text paths
        <table>
          <tr>
            <th style="width: 150px;"></th><th style="width: 210px;"></th>
          </tr>
          <tr>
            <td>Font: </td>
            <td>
              <div class="input-addon">
                <span class="input-addon-label-left  active-border"><i class="fas fa-font"></i></span>
                <input id="font" type="text" class="cam-form-field  active-border" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Size: </td>
            <td>
              <div class="input-addon">
                <span class="input-addon-label-left active-border"><i class="fas fa-text-height"></i></span>
                <input type="number" class="cam-form-field cam-form-field-right  active-border" id="fontsize" value="20" />
              </div>
            </td>
          </tr>
          <tr>
          <td>Spacing: </td>
          <td>
            <div class="input-addon">
              <span class="input-addon-label-left active-border"><i class="fas fa-arrows-alt-h"></i></span>
              <input type="number" class="cam-form-field cam-form-field-right  active-border" id="fontspacing" value="1" />
            </div>
          </td>
        </tr>
        </table>
      </div>
    </form>
    <hr/>
    <div class="input-addon">
      <input style="width: 100%; font-size:30px" id="texttorender" class="active-border" value="Type Here"></input>
    </div>
    </div>
    <div class="dialog-actions" id="statusFooter">
      <button class="button js-dialog-close">Cancel</button>
      <button type="button" class="button js-dialog-close success" id="CreateText">Create</button>
    </div>
  </div>
`
  $("body").append(modal);

  $('#texttorender').css('font-family', "Bebas Neue");

  $('#font').fontselect({
    placeholder: 'Bebas Neue',
    lookahead: 3
  }).change(function() {

    // replace + signs with spaces for css
    var font = $(this).val().replace(/\+/g, ' ');
    // split font into family and weight
    font = font.split(':');
    // set family on paragraphs
    $('#texttorender').css('font-family', font[0]);

  }).val("Bebas+Neue");

  $("#CreateText").on("click", function() {
    event.preventDefault();
    addText();
  });

});