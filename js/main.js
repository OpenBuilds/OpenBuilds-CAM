//"use strict";
console.log("%c%s", "color: #000; background: green; font-size: 24px;", "STARTING...");
// colors for the consolelog
var msgcolor = '#000000';
var successcolor = '#00aa00';
var errorcolor = '#cc0000';
var warncolor = '#ff6600';

var debug = false;
var activeObject, fileName, notify;

// Place all document.ready tasks into functions and ONLY run the functions from doument.ready
$(document).ready(function() {
  // Intialise
  loadSettingsLocal();
  initLocalStorage();
  init3D();
  animate();
  errorHandlerJS();
  initTree();
  initAdvancedCAM();
  initMouseSelect();
  initMouseMode();
  initDragDrop();
  initExportworkspace();


  //File -> Open
  var fileOpen = document.getElementById('file');
  fileOpen.addEventListener('change', readFile, false);


  // Fix for opening same file from http://stackoverflow.com/questions/32916687/uploading-same-file-into-text-box-after-clearing-it-is-not-working-in-chrome?lq=1
  $('#file').bind('click', function() {
    $('#file').val(null);
  });

  // File -> Save
  $('#save').on('click', function() {
    saveFile();
  });

  // Viewer
  var viewer = document.getElementById('renderArea');

  setTimeout(function() {
    $('#viewReset').click();
  }, 100);

  // A few gcode input fields need to be caps for the firmware to support it
  $('.uppercase').keyup(function() {
    this.value = this.value.toLocaleUpperCase();
  });

  // Changelog

  // if (!localStorage.getItem('hideChangelog')) {
  //   getChangelog();
  // }

  loadLastClosedOnPageload();

  getForksCount();

}); // End of document.ready

// Error handling
errorHandlerJS = function() {
  // window.onerror = function(errmessage, url, line) {
  window.onerror = function(errmessage, url, line, colno, error) {
    // console.log(error)
    errmessage = errmessage.replace(/^Uncaught /i, "");
    //alert(message+"\n\n("+url+" line "+line+")");
    console.log(errmessage + "\n\n(" + url + " line " + line + ")");
    if (errmessage.indexOf('updateMatrixWorld') == -1) { // Ignoring threejs/google api messages, add more || as discovered
      var message = `An unknown error occured:` + errmessage
      Metro.toast.create(message, null, 10000, 'bg-red');
      // printLog(errmessage + "\n(" + url + " on line " + line + ")", errorcolor);
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
  storeUndo(true);
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
      loadSVGFile(f)
      printLog('SVG Opened', msgcolor, "file");
      resetView();
      // } else if (f.name.match(/.gcode$/i)) {
      //   r.readAsText(f);
      //   r.onload = function(event) {
      //     // cleanupThree();
      //     $("#gcodefile").show();
      //     document.getElementById('gcodepreview').value = this.result;
      //     printLog('GCODE Opened', msgcolor, "file");
      //     resetView();
      //     setTimeout(function() {
      //       openGCodeFromText();
      //     }, 500);
      //   };
      // } else if (f.name.match(/.nc$/i)) {
      //   r.readAsText(f);
      //   r.onload = function(event) {
      //     // cleanupThree();
      //     $("#gcodefile").show();
      //     document.getElementById('gcodepreview').value = this.result;
      //     printLog('GCODE Opened', msgcolor, "file");
      //     resetView();
      //     setTimeout(function() {
      //       openGCodeFromText();
      //     }, 500);
      //   };
      // } else if (f.name.match(/.stl$/i)) {
      //   //r.readAsText(f);
      //   // Remove the UI elements from last run
      //   console.group("STL File");
      //   var stlloader = new MeshesJS.STLLoader();
      //   r.onload = function(event) {
      //     // cleanupThree();
      //     // Parse ASCII STL
      //     if (typeof r.result === 'string') {
      //       stlloader.loadString(r.result);
      //       return;
      //     }
      //     // buffer reader
      //     var view = new DataView(this.result);
      //     // get faces number
      //     var faces;
      //     try {
      //       faces = view.getUint32(80, true);
      //     } catch (error) {
      //       self.onError(error);
      //       return;
      //     }
      //     // is binary ?
      //     var binary = view.byteLength == (80 + 4 + 50 * faces);
      //     if (!binary) {
      //       // get the file contents as string
      //       // (faster than convert array buffer)
      //       r.readAsText(f);
      //       return;
      //     }
      //     // parse binary STL
      //     stlloader.loadBinaryData(view, faces, 100, window, f);
      //   };
      //   // start reading file as array buffer
      //   r.readAsArrayBuffer(f);
      //   printLog('STL Opened', msgcolor, "file");
      //   console.log("Opened STL, and asking user for Slice settings");
      //   console.groupEnd();
      //   $('#stlslice').modal('show');
    } else if (f.name.match(/\.(gif|jpg|jpeg|tiff|png|bmp)$/i)) {
      r.onload = function(e) {
        traceFromImg(e, f);
        // $('#imageThumb').attr('src', e.target.result);
      }
      r.readAsDataURL(f);
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
  setTimeout(function() {
    fillTree();
  }, 250);
  setTimeout(function() {
    viewExtents(objectsInScene[objectsInScene.length - 1]);
  }, 300);

}

function saveFile() {
  var textToWrite = prepgcodefile();
  var blob = new Blob([textToWrite], {
    type: "text/plain"
  });
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
  console.log(text)
}

function getForksCount() {
  $("#forksCount").empty()
  var template2 = ``
  $.get("https://api.github.com/repos/OpenBuilds/cam/forks?client_id=fbbb80debc1197222169&client_secret=7dc6e463422e933448f9a3a4150c8d2bbdd0f87c", function(data) {
    // console.log(data)
    $("#forksCount").html(" " + data.length + " ");
  });
}

function getChangelog() {
  $("#changelog").empty()
  var template2 = ``
  $.get("https://api.github.com/repos/openbuilds/cam/commits?client_id=fbbb80debc1197222169&client_secret=7dc6e463422e933448f9a3a4150c8d2bbdd0f87c", function(data) {
    // console.log(data)
    Object.keys(data).forEach(function(key) {
      var date = new Date(data[key].commit.author.date)
      var author = data[key].commit.author.name
      var avatar = data[key].author.avatar_url
      var authorurl = data[key].author.html_url
      var committer = data[key].commit.committer.name
      var url = data[key].html_url
      var message = data[key].commit.message

      template2 += `
      <div class="card">
        <div class="card-header">
            <div class="avatar">
                <img src="` + avatar + `" />
            </div>
            <div class="name"><a href="` + authorurl + `">` + author + `</a></div>
            <div class="date">` + formatDate(date) + `</div>
        </div>
        <div class="card-content p-2">
             <i class="fab fa-github"></i> commit: <a href="` + url + `" target="_new"> ` + message + `</a>
        </div>

      </div>
      `
    });
    // for (var key in data) {
    // }
    template2 += `<li class="list-group-item">
      <a href="https://github.com/OpenBuilds/cam/commits/master" target="_new"><h6>Click here to view older updates</h6></a>
      </li>`
    template2 += `<ul>`
    $("#changelog").append(template2)
    if (!Metro.dialog.isOpen('#settingsmodal')) {
      // $('#splashModal').modal('show');
      Metro.dialog.open('#splashModal')
    }
  });
}