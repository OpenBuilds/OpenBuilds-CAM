// Common Menu Initialization
var appMenus = [
    "settings",
    "gcode",
    "tree-cam"
];

function makeTabActive(tabname) {
    var menuName = "#" + tabname + "-menu";
    var panelName = menuName + "-panel";
    $('.mobtab').hide();
    $('.leftmenuitem').removeClass('active');
    $(panelName).show();
    $(menuName).addClass('active');
}

// Each menu name gets an id handler of this pattern: #[menuname]-menu
appMenus.forEach(function(menu) {
    console.log("Adding menu handler for " + menu);
    $("#" + menu + "-menu").click(function() {
        makeTabActive(menu);
    });
}, this);
