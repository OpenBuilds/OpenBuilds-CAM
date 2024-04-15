let ThemeData = {
  THEMES: {
    "light": {
      DESCRIPTION: 'Light Mode',
      ICON: 'sun',
      CAM_DOC_DEFAULT_COLOR: 0x000000,
      SPRITE_OPACITY: 0.6,
      SKY_TOP_COLOR: 0x0077ff,
      SKY_BOTTOM_COLOR: 0xffffff,
      HEMI_LIGHT_COLOR: {
        'H': 0.6,
        'S': 1.0,
        'L': 0.6
      },
      GRID_STEP_10_COLOR: 0x888888,
      GRID_STEP_10_OPACITY: 0.15,
      GRID_STEP_100_COLOR: 0x666666,
      GRID_STEP_100_OPACITY: 0.15,
      RULER_COLOR: 0x888888,
      RULER_OPACITY: 0.15,
      X_RULER_NUMBER_COLOR: "#cc0000",
      X_RULER_LABEL_COLOR: "#ff0000",
      X_AXIS_LINE_COLOR: 0xcc0000,
      Y_RULER_NUMBER_COLOR: "#006600",
      Y_RULER_LABEL_COLOR: "#006600",
      Y_AXIS_LINE_COLOR: 0x00cc00,
      LINE_COLOURS: [{
          'R': 0,
          'G': 200,
          'B': 0
        },
        {
          'R': 200,
          'G': 0,
          'B': 0
        },
        {
          'R': 0,
          'G': 0,
          'B': 200
        },
        {
          'R': 200,
          'G': 0,
          'B': 200
        }
      ]
    },
    "dark": {
      DESCRIPTION: 'Dark Mode',
      ICON: 'moon',
      CAM_DOC_DEFAULT_COLOR: 0xffffff,
      SPRITE_OPACITY: 0.8,
      SKY_TOP_COLOR: 0x333333,
      SKY_BOTTOM_COLOR: 0x222222,
      HEMI_LIGHT_COLOR: {
        'H': 0.6,
        'S': 0.0,
        'L': 0.1
      },
      GRID_STEP_10_COLOR: 0x555555,
      GRID_STEP_10_OPACITY: 0.15,
      GRID_STEP_100_COLOR: 0x666666,
      GRID_STEP_100_OPACITY: 0.15,
      RULER_COLOR: 0x555555,
      RULER_OPACITY: 0.30,
      X_RULER_NUMBER_COLOR: "#cc0000",
      X_RULER_LABEL_COLOR: "#ff0000",
      X_AXIS_LINE_COLOR: 0xcc0000,
      Y_RULER_NUMBER_COLOR: "#006600",
      Y_RULER_LABEL_COLOR: "#006600",
      Y_AXIS_LINE_COLOR: 0x00cc00,
      LINE_COLOURS: [{
          'R': 0,
          'G': 200,
          'B': 0
        },
        {
          'R': 200,
          'G': 0,
          'B': 0
        },
        {
          'R': 0,
          'G': 0,
          'B': 200
        },
        {
          'R': 200,
          'G': 0,
          'B': 200
        }
      ]
    }
    // ,
    // "hicontrast": {
    //   DESCRIPTION: 'High Contrast Theme',
    //   ICON: 'dot-circle',
    //   SPRITE_OPACITY: 1.0,
    //   SKY_TOP_COLOR: 0x000000,
    //   SKY_BOTTOM_COLOR: 0x000000,
    //   HEMI_LIGHT_COLOR: {
    //     'H': 0.6,
    //     'S': 0.0,
    //     'L': 0.0
    //   },
    //   GRID_STEP_10_COLOR: 0xFFFFFF,
    //   GRID_STEP_10_OPACITY: 0.15,
    //   GRID_STEP_100_COLOR: 0xFFFFFF,
    //   GRID_STEP_100_OPACITY: 0.15,
    //   RULER_COLOR: 0xFFFFFF,
    //   RULER_OPACITY: 1.0,
    //   X_RULER_NUMBER_COLOR: "#ffff00",
    //   X_RULER_LABEL_COLOR: "#ffff00",
    //   X_AXIS_LINE_COLOR: 0xFFFF00,
    //   Y_RULER_NUMBER_COLOR: "#00ffff",
    //   Y_RULER_LABEL_COLOR: "#00ffff",
    //   Y_AXIS_LINE_COLOR: 0x00FFFF,
    //   LINE_COLOURS: [{
    //       'R': 0,
    //       'G': 255,
    //       'B': 0
    //     },
    //     {
    //       'R': 255,
    //       'G': 255,
    //       'B': 0
    //     },
    //     {
    //       'R': 0,
    //       'G': 255,
    //       'B': 255
    //     },
    //     {
    //       'R': 255,
    //       'G': 0,
    //       'B': 255
    //     }
    //   ]
    // }
  },

  currentThemeId: "light", // Forcing dark mode after update

  init: function init() {
    console.log(localStorage.getItem('themeId'))
    let themeId = localStorage.getItem('themeId');

    if (themeId && ThemeData.THEMES[themeId]) {
      ThemeData.currentThemeId = themeId;
      for (let key in ThemeData.THEMES) {
        $("body").removeClass('theme_' + key);
      };
      $("body").addClass('theme_' + themeId);
    } else {
      localStorage.setItem("themeId", ThemeData.currentThemeId);
    }

    $('.theme_btn').removeClass("checked");
    $('.theme_btn_' + themeId).addClass("checked");

    if (themeId == "dark") {
      let theme = ThemeData.THEMES["light"];
      let newIcon = $('<i class="fas fa-fw fa-' + theme.ICON + '"></i>');
      $("#currentThemeIcon").html(newIcon);
      $("#currentThemeName").html("Light<br>Mode")
    } else if (themeId == "light") {
      let theme = ThemeData.THEMES["dark"];
      let newIcon = $('<i class="fas fa-fw fa-' + theme.ICON + '"></i>');
      $("#currentThemeIcon").html(newIcon);
      $("#currentThemeName").html("Dark<br>Mode")
    }


  },

  getColor: function getColor(key) {
    return ThemeData.THEMES[ThemeData.currentThemeId][key];
  },

  get: function get() {
    return ThemeData.currentThemeId;
  },

  toggle: function toggle() {
    if (ThemeData.currentThemeId == "dark") {
      ThemeData.set("light")
    } else if (ThemeData.currentThemeId == "light") {
      ThemeData.set("dark")
    }
  },

  set: function set(themeId) {
    if (themeId && ThemeData.THEMES[themeId]) {
      localStorage.setItem("themeId", themeId);
      ThemeData.init();

      // Update the 3D view (mostly, gcode movements will keep old colours until gcode is reloaded)
      pauseAnimation = true;
      $('#splash').show()
      while (scene.children.length > 0) {
        scene.remove(scene.children[0])
      }
      drawWorkspace();
      clearSceneFlag = true;
      pauseAnimation = false;
      if (themeId == "dark") {
        let theme = ThemeData.THEMES["light"];
        let newIcon = $('<i class="fas fa-fw fa-' + theme.ICON + '"></i>');
        $("#currentThemeIcon").html(newIcon);
        $("#currentThemeName").html("Light<br>Mode")
      } else if (themeId == "light") {
        let theme = ThemeData.THEMES["dark"];
        let newIcon = $('<i class="fas fa-fw fa-' + theme.ICON + '"></i>');
        $("#currentThemeIcon").html(newIcon);
        $("#currentThemeName").html("Dark<br>Mode")
      }
      setTimeout(function() {
        $('#splash').fadeOut(400);
      }, 2000);
    }
  }
};

const Theme = new Proxy(ThemeData, {
  get: function(theme, key) {
    if (key == "getColor") {
      return ThemeData.getColor;
    } else if (key == "lines") {
      return theme.getColor("LINE_COLOURS");
    } else if (key == "get") {
      return theme.get;
    } else if (key == "set") {
      return theme.set;
    } else if (key == "toggle") {
      return theme.toggle;
    }
    return theme.getColor(key);
  }
});
ThemeData.init();

$(document).ready(function() {
  // Commented out Dropdown menu item creating - will use when we have more theme options
  //
  // -- Dropdown Ribbon Button
  // <div class="group">
  //
  //   <div id="ddThemeButton">
  //     <button id="btnTheme" class="ribbon-button dropdown-toggle">
  //       <span class="icon" id="currentThemeIcon">
  //         <i class="fas fa-paint-brush"></i>
  //       </span>
  //       <span class="caption" id="currentThemeName">Dark<br>Mode</span>
  //       <span class="h6 badge bg-green fg-white"> <i class="fas fa-brush  fa-spin"></i> New!</span>
  //
  //     </button>
  //     <ul class="ribbon-dropdown grblmode" data-role="dropdown" data-duration="100" id="ddTheme">
  //
  //     </ul>
  //   </div>
  //   <span class="title">Theme</span>
  // </div>
  //
  for (let themeId in ThemeData.THEMES) {
    let theme = ThemeData.THEMES[themeId];
    // let menuItem = $('<li><a href="#"><i class="fas fa-fw fa-' + theme.ICON + '"></i> ' + theme.DESCRIPTION + '</a></li>');
    // $("#ddTheme").append($(menuItem).addClass(['theme_btn', 'theme_btn_' + themeId]).click(() => Theme.set(themeId)));
    if (themeId != "light") {
      $('head').append('<link rel="stylesheet" type="text/css" href="css/themes/' + themeId + '.css">');
    }

  }
  ThemeData.init();
});