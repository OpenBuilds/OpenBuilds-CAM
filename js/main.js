//"use strict";
console.log("%c%s","color: #000; background: green; font-size: 24px;","STARTING...");
// colors for the consolelog
var msgcolor = '#000000';
var successcolor = '#00aa00';
var errorcolor = '#cc0000';
var warncolor = '#ff6600';

var debug = false;
var activeObject, fileName, notify;

// Place all document.ready tasks into functions and ONLY run the functions from doument.ready
$(document).ready(function() {

  // Growl style notifications
  notify = new hullabaloo({
      // where to append the notifications
      ele: $("#renderArea"),
      // offset
      offset: {
        from: "top",
        amount: 200
      },
      // or 'center', 'left'
      align: "right",
      // width
      width: 250,
      // for auto dismiss
      delay: 5000,
      allow_dismiss: true,
      // space between notification boxes
      stackup_spacing: 10,
      // notification message here
      // text: "<a href="https://www.jqueryscript.net/tags.php?/Notification/">Notification</a> Message Here",
      // // Font Awesome icon
      // icon: "times-circle",
      // // styles
      // status: "danger",
      // // additional CSS classes
      // alertClass: "",
      // // callback functions
      fnStart: false,
      fnEnd: false,
      fnEndHide: false,

  });
  notify.send("Ready!", "success");

    // Intialise
    loadSettingsLocal();
    initLocalStorage();
    init3D();
    animate();
    filePrepInit();
    errorHandlerJS();
    initTree();
    initAdvancedCAM();
    initDragDrop();
    initExportworkspace();

    // Tooltips
    // $(document).tooltip();
    $('body').tooltip({
        selector: '[data-tooltip="tooltip"]'
    });
    // $('[data-tooltip="tooltip"]').tooltip()

    // Top toolbar Menu

    //File -> Open
    var fileOpen = document.getElementById('file');
    fileOpen.addEventListener('change', readFile, false);

    var fileMenu = document.getElementById('filemenu');
    fileMenu.addEventListener('change', readFile, false);

    // Fix for opening same file from http://stackoverflow.com/questions/32916687/uploading-same-file-into-text-box-after-clearing-it-is-not-working-in-chrome?lq=1
    $('#file').bind('click', function() {
        $('#file').val(null);
    });

    // File -> Save
    $('#save').on('click', function() {
        saveFile();
    });

    // View -> reset
    // $('#viewReset').on('click', function() {
    //     resetView();
    // });


    $('#savesettings').on('click', function() {
        saveSettingsLocal();
    });

    // Viewer
    var viewer = document.getElementById('renderArea');


    // Progressbar
    // NProgress.configure({ parent: '#gcode-menu-panel' });
    NProgress.configure({
        showSpinner: false
    });

    checkSettingsLocal();
    setTimeout(function(){ $('#viewReset').click(); }, 100);

    // A few gcode input fields need to be caps for the firmware to support it
    $('.uppercase').keyup(function() {
        this.value = this.value.toLocaleUpperCase();
    });

    $('#cammodal').modal('show');


}); // End of document.ready

// Error handling
errorHandlerJS = function() {
    window.onerror = function(message, url, line) {
        message = message.replace(/^Uncaught /i, "");
        //alert(message+"\n\n("+url+" line "+line+")");
        console.log(message + "\n\n(" + url + " line " + line + ")");
        if (message.indexOf('updateMatrixWorld') == -1 ) { // Ignoring threejs/google api messages, add more || as discovered
            printLog(message + "\n(" + url + " on line " + line + ")", errorcolor);
        }
    };
};

// Function to execute when opening file (triggered by fileOpen.addEventListener('change', readFile, false); )
function readFile(evt) {
    console.group("New FileOpen Event:");
    console.log(evt);
    console.groupEnd();
    // Close the menu
    $("#drop1").dropdown("toggle");

    // Files
    var files = evt.target.files || evt.dataTransfer.files;

    for (var i = 0; i < files.length; i++) {
        loadFile(files[i]);
    }
}

// drag/drop
function initDragDrop() {
    var dropTarget = document.getElementById('container1');

    var onDragLeave = function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#draganddrop').hide();
    };

    var onDragOver = function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#draganddrop').show();
    };

    var onDrop = function(e) {
        onDragLeave(e);
        readFile(e);
    };

    dropTarget.addEventListener('drop', onDrop, false);
    dropTarget.addEventListener('dragover', onDragOver, false);
    dropTarget.addEventListener('dragleave', onDragLeave, false);
}

// load file
function loadFile(f) {
    // Filereader
    if (f) {
        var r = new FileReader();
        if (f.name.match(/.dxf$/i)) {
            // console.log(f.name + " is a DXF file");
            // console.log('Reader: ', r)
            r.readAsText(f);
            r.onload = function(e) {
                dxf = r.result;
                drawDXF(dxf, f.name);
                printLog('DXF Opened', msgcolor, "file");
                // putFileObjectAtZero();
                resetView();
            };

        } else if (f.name.match(/.svg$/i)) {
            // console.log(f.name + " is a SVG file");
            r.readAsText(f);
            r.onload = function(event) {
                svg = r.result;
                var svgpreview = document.getElementById('svgpreview');
                svgpreview.innerHTML = r.result;
                var svgfile = $('#svgpreview').html();
                svg2three(svgfile, f.name);
                printLog('SVG Opened', msgcolor, "file");
                resetView();
            };


        } else if (f.name.match(/.gcode$/i)) {
            r.readAsText(f);
            r.onload = function(event) {
                // cleanupThree();
                $("#gcodefile").show();
                document.getElementById('gcodepreview').value = this.result;
                printLog('GCODE Opened', msgcolor, "file");
                resetView();
                setTimeout(function(){ openGCodeFromText(); }, 500);
            };
        } else if (f.name.match(/.nc$/i)) {
              r.readAsText(f);
              r.onload = function(event) {
                  // cleanupThree();
                  $("#gcodefile").show();
                  document.getElementById('gcodepreview').value = this.result;
                  printLog('GCODE Opened', msgcolor, "file");
                  resetView();
                  setTimeout(function(){ openGCodeFromText(); }, 500);
              };
        } else if (f.name.match(/.stl$/i)) {
            //r.readAsText(f);
            // Remove the UI elements from last run
            console.group("STL File");
            var stlloader = new MeshesJS.STLLoader();
            r.onload = function(event) {
                // cleanupThree();
                // Parse ASCII STL
                if (typeof r.result === 'string') {
                    stlloader.loadString(r.result);
                    return;
                }
                // buffer reader
                var view = new DataView(this.result);
                // get faces number
				var faces;
                try {
                    faces = view.getUint32(80, true);
                } catch (error) {
                    self.onError(error);
                    return;
                }
                // is binary ?
                var binary = view.byteLength == (80 + 4 + 50 * faces);
                if (!binary) {
                    // get the file contents as string
                    // (faster than convert array buffer)
                    r.readAsText(f);
                    return;
                }
                // parse binary STL
                stlloader.loadBinaryData(view, faces, 100, window, f);
            };
            // start reading file as array buffer
            r.readAsArrayBuffer(f);
            printLog('STL Opened', msgcolor, "file");
            console.log("Opened STL, and asking user for Slice settings");
            console.groupEnd();
            $('#stlslice').modal('show');
        } else {
            // Not usable
        }
    }
    $('#filestatus').hide();
    $('#tree-cam-menu').click();
    if (control) {
        scene.remove(control);
        controls.reset();
    }
    setTimeout(function(){ fillTree(); }, 250);
    setTimeout(function(){ viewExtents(objectsInScene[objectsInScene.length - 1]); }, 300);

}

function saveFile() {
    var textToWrite = prepgcodefile();
    var blob = new Blob([textToWrite], {type: "text/plain"});
    invokeSaveAsDialog(blob, 'file.gcode');

}

/**
* @param {Blob} file - File or Blob object. This parameter is required.
* @param {string} fileName - Optional file name e.g. "image.png"
*/
function invokeSaveAsDialog(file, fileName) {
    if (!file) {
        throw 'Blob object is required.';
    }

    if (!file.type) {
        file.type = 'text/plain';
    }

    var fileExtension = file.type.split('/')[1];

    if (fileName && fileName.indexOf('.') !== -1) {
        var splitted = fileName.split('.');
        fileName = splitted[0];
        fileExtension = splitted[1];
    }

    var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }

    var hyperlink = document.createElement('a');
    hyperlink.href = URL.createObjectURL(file);
    // hyperlink.target = '_blank';
    hyperlink.download = fileFullName;

    if (!!navigator.mozGetUserMedia) {
        hyperlink.onclick = function() {
            (document.body || document.documentElement).removeChild(hyperlink);
        };
        (document.body || document.documentElement).appendChild(hyperlink);
    }

    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    hyperlink.dispatchEvent(evt);

    if (!navigator.mozGetUserMedia) {
        URL.revokeObjectURL(hyperlink.href);
    }
}

function printLog(text, color, logclass) {
	if (text.isString) {
      text = text.replace(/\n/g, "<br />");
	}
  // notify.send(text, "success");

}
