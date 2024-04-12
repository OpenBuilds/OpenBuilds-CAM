let IconsMasterData = [];
let IconsPageNumber = 1;
let IconsFilterValue = "";

function IconLib_Filter(FilterValue = null) {
  IconsFilterValue = (FilterValue == null ? $("#iconlib_filter").val() : FilterValue);

  var WorkingData = IconsMasterData.filter(a => a.name.contains(IconsFilterValue))
  return WorkingData;
}

function iconlib_Page(page = null) {
  if (page == null) {
    IconsPageNumber = $("#iconlib_PageOf").val();
  } else {
    page > 0 ? IconsPageNumber++ : IconsPageNumber--;
  }

  WorkingData = IconLib_Filter();
  IconLib_Pagination(WorkingData);
}

function IconLib_Pagination(WorkingData, page = 1) {
  var cols = 10,
    rows = 10;

  var data = JSON.parse(JSON.stringify(WorkingData))
  var totPages = Math.ceil(data.length / (cols * rows));

  if (IconsPageNumber <= 0) IconsPageNumber = totPages;
  else if (IconsPageNumber > totPages) IconsPageNumber = 1;

  var icons_columns = [];
  while (data.length > 0)
    icons_columns.push(data.splice(0, cols)); // creates groupings for columns.

  var icons_pages = [];
  while (icons_columns.length > 0)
    icons_pages.push(icons_columns.splice(0, rows)); // creates groupings for pages.

  page = icons_pages.length < IconsPageNumber ? 0 : IconsPageNumber - 1;

  var template = "";
  if (icons_pages.length == 0) {
    template += `<div class="row"><div class = "cell"><h2>No results Found...</h2></div></div>`;
  } else {
    template += icons_pages[page].map(a => `<div class="row">` + a.map(a => a =
      `<div class = "cell">
        <div class="img-thumbnail iconThumbnailStyle">
          <img class="image iconThumbnailImage" title="${a.name}" alt="${a.name}" src="${a.url}" onclick="useIconsLib(${a.uid});">
        </div>
      </div>`
    ).join("") + `</div>`).join("");
  }

  template.replace(/\s{2}/g, '');

  $("#iconlib_PageOf").val(IconsPageNumber);
  $('#iconlib_PageOf').closest('div').find('.append').text(` of ${totPages}`);
  $("#iconslibrary").empty().append(template)
};

async function useIconsLib(id) {
  var ObjCnts = objectsInScene.length;
  await loadIconItem(id);
  Metro.dialog.close('#iconslibModal');
  fillTree();
  resetView();
  return ObjCnts < objectsInScene.length ? true : false;
};

async function loadIconItem(id) {
  arrIndex = IconsMasterData.map(function(x) {
    return x.uid;
  }).indexOf(id);

  var xmlTxt = IconsMasterData[arrIndex].svgtxt;
  await lwsvgparser.loadFromString(xmlTxt).then(function(element) {
    return lwsvgparser.parse().then(function(tags) {
      drawFile("svg_" + IconsMasterData[arrIndex].name, tags, false);
    });
  }).catch(function(error) {});
}

$(document).ready(function() {
  $.get("./partslib/Iconsdata.json", function(data) {
    IconsMasterData = JSON.parse(JSON.stringify(data))
    WorkingData = IconLib_Filter();
    IconLib_Pagination(WorkingData);
    Metro.init()
  });

  if (IconsMasterData.length == 0) Icondata_OffLineSampleData();

  WorkingData = IconLib_Filter();
  IconLib_Pagination(WorkingData);
});

// Catalog_ValidSVGs is a tool to determin which SVG are able to display
async function Catalog_ValidSVGs() {
  for (let id = 0; id < IconsMasterData.length; id++) {
    var ObjCnts = objectsInScene.length;
    await loadIconItem(id);
    IconsMasterData[id].valid = ObjCnts < objectsInScene.length ? true : false;
    objectsInScene = [];
  }

  console.log(JSON.stringify(IconsMasterData));

  Metro.dialog.close('#iconslibModal');
  fillTree();
}

function Icondata_OffLineSampleData() {
  IconsMasterData = [{
      "uid": 1,
      "category": "Brands",
      "name": "accessible-icon",
      "extension": ".svg", // not used
      "url": ".\\lib\\fontawesome5\\svgs\\brands\\accessible-icon.svg",
      "svgtxt": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!-- Font Awesome Free 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path d=\"M423.9 255.8L411 413.1c-3.3 40.7-63.9 35.1-60.6-4.9l10-122.5-41.1 2.3c10.1 20.7 15.8 43.9 15.8 68.5 0 41.2-16.1 78.7-42.3 106.5l-39.3-39.3c57.9-63.7 13.1-167.2-74-167.2-25.9 0-49.5 9.9-67.2 26L73 243.2c22-20.7 50.1-35.1 81.4-40.2l75.3-85.7-42.6-24.8-51.6 46c-30 26.8-70.6-18.5-40.5-45.4l68-60.7c9.8-8.8 24.1-10.2 35.5-3.6 0 0 139.3 80.9 139.5 81.1 16.2 10.1 20.7 36 6.1 52.6L285.7 229l106.1-5.9c18.5-1.1 33.6 14.4 32.1 32.7zm-64.9-154c28.1 0 50.9-22.8 50.9-50.9C409.9 22.8 387.1 0 359 0c-28.1 0-50.9 22.8-50.9 50.9 0 28.1 22.8 50.9 50.9 50.9zM179.6 456.5c-80.6 0-127.4-90.6-82.7-156.1l-39.7-39.7C36.4 287 24 320.3 24 356.4c0 130.7 150.7 201.4 251.4 122.5l-39.7-39.7c-16 10.9-35.3 17.3-56.1 17.3z\"/></svg>",
      "size": 955, // not used
      "type": "file", // not used
      "valid": true
    },
    {
      "uid": 4,
      "category": "Brands",
      "name": "adn",
      "extension": ".svg",
      "url": ".\\lib\\fontawesome5\\svgs\\brands\\adn.svg",
      "svgtxt": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 496 512\"><!-- Font Awesome Free 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path d=\"M248 167.5l64.9 98.8H183.1l64.9-98.8zM496 256c0 136.9-111.1 248-248 248S0 392.9 0 256 111.1 8 248 8s248 111.1 248 248zm-99.8 82.7L248 115.5 99.8 338.7h30.4l33.6-51.7h168.6l33.6 51.7h30.2z\"/></svg>",
      "size": 447,
      "type": "file",
      "valid": true
    },
    {
      "uid": 13,
      "category": "Brands",
      "name": "android",
      "extension": ".svg",
      "url": ".\\lib\\fontawesome5\\svgs\\brands\\android.svg",
      "svgtxt": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\"><!-- Font Awesome Free 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path d=\"M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55\"/></svg>",
      "size": 561,
      "type": "file",
      "valid": true
    },
    {
      "uid": 16,
      "category": "Brands",
      "name": "angular",
      "extension": ".svg",
      "url": ".\\lib\\fontawesome5\\svgs\\brands\\angular.svg",
      "svgtxt": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!-- Font Awesome Free 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path d=\"M185.7 268.1h76.2l-38.1-91.6-38.1 91.6zM223.8 32L16 106.4l31.8 275.7 176 97.9 176-97.9 31.8-275.7zM354 373.8h-48.6l-26.2-65.4H168.6l-26.2 65.4H93.7L223.8 81.5z\"/></svg>",
      "size": 419,
      "type": "file",
      "valid": true
    },
    {
      "uid": 17,
      "category": "Brands",
      "name": "app-store-ios",
      "extension": ".svg",
      "url": ".\\lib\\fontawesome5\\svgs\\brands\\app-store-ios.svg",
      "svgtxt": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!-- Font Awesome Free 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path d=\"M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM127 384.5c-5.5 9.6-17.8 12.8-27.3 7.3-9.6-5.5-12.8-17.8-7.3-27.3l14.3-24.7c16.1-4.9 29.3-1.1 39.6 11.4L127 384.5zm138.9-53.9H84c-11 0-20-9-20-20s9-20 20-20h51l65.4-113.2-20.5-35.4c-5.5-9.6-2.2-21.8 7.3-27.3 9.6-5.5 21.8-2.2 27.3 7.3l8.9 15.4 8.9-15.4c5.5-9.6 17.8-12.8 27.3-7.3 9.6 5.5 12.8 17.8 7.3 27.3l-85.8 148.6h62.1c20.2 0 31.5 23.7 22.7 40zm98.1 0h-29l19.6 33.9c5.5 9.6 2.2 21.8-7.3 27.3-9.6 5.5-21.8 2.2-27.3-7.3-32.9-56.9-57.5-99.7-74-128.1-16.7-29-4.8-58 7.1-67.8 13.1 22.7 32.7 56.7 58.9 102h52c11 0 20 9 20 20 0 11.1-9 20-20 20z\"/></svg>",
      "size": 906,
      "type": "file",
      "valid": true
    }
  ];
}