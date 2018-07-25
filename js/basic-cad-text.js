function addText() {
  var fontsize = $('#fontsize').val();
  var font = $("#font").val().replace(/\+/g, ' ');
  // split font into family and weight
  font = font.split(':');
  // set family on paragraphs
  var string = $("#texttorender").val()
  // console.log('font-family: ', font[0], " size: ", fontsize, " String: " + string)

  var textasSVG = getText(font[0], "regular", string, fontsize)
  // var textasSVG = getText("Allan", "regular", "Go", 10)
  setTimeout(function() {
    var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 50 50\" width=\"150px\"> <path fill=\"#F7931E\" stroke=\"#000\" d=\"" + textasSVG._result + "\"/>  </svg>"
    // console.log(svg)
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
    console.log(font)
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

$(document).ready(function() {
  var modal = `

  <div class="dialog" data-overlay-click-close="true" data-role="dialog" data-cls-dialog="pos-fixed pos-top-center" id="addShapeText">
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
                <select class="cam-form-field cam-form-field-right  active-border" id="fontsize">
                  <option value="20" selected>20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                  <option value="70">70</option>
                </select>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </form>
    <hr/>
    <div class="input-addon">
      <input style="width: 100%;" id="texttorender" class="active-border" value="Type Here"></input>
    </div>
    </div>
    <div class="dialog-actions" id="statusFooter">
      <button class="button js-dialog-close">Cancel</button>
      <button type="button" class="button js-dialog-close success" id="CreateText">Create</button>
    </div>
  </div>
`
  $("body").append(modal);

  $('#texttorender').css('font-family', "Bowlby One SC");

  $('#font').fontselect({
    placeholder: 'Bowlby One SC',
    lookahead: 3
  }).change(function() {

    // replace + signs with spaces for css
    var font = $(this).val().replace(/\+/g, ' ');
    // split font into family and weight
    font = font.split(':');
    // set family on paragraphs
    $('#texttorender').css('font-family', font[0]);
    // console.log('font-family', font[0])
    var fontsize = $('#fontsize').val();
    $('#texttorender').css('font-size', fontsize + "px");
  }).val("Bowlby+One+SC");

  $('#fontsize').change(function() {
    var fontsize = $('#fontsize').val();
    $('#texttorender').css('font-size', fontsize + "px");
  });

  $("#CreateText").on("click", function() {
    event.preventDefault();
    addText();
  });

});