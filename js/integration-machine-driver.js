var DriverCheckinterval;
var alreadyDetected = false;
var availableDriverVersion = 'v0.0.0'
var installedDriver = 'not detected'

function checkIfDriverIsInstalled() {
  // if (!alreadyDetected) {
  var url = "https://mymachine.openbuilds.com:3001/api/version"
  $.ajax({
    url: url,
    type: 'GET',
    async: true,
    cache: false,
    timeout: 1000,
    error: function() {
      noDriver()
      // console.log("Failed to retrieve OpenBuilds CONTROL version information from the API at " + evt.target.url);
    },
    success: function(msg) {
      if (!alreadyDetected) {
        var instance = JSON.parse(msg)
        var host = instance.ipaddress.split(':')[0];
        var menuitem = `<a class="dropdown-item" href="#" onclick="sendGcodeToOmd('` + instance.ipaddress + `')">` + instance.application + ` v` + instance.version + ` (` + host + `)</a>`;
        // console.log(menuitem);
        // hasDriver(instance.version)
        setTimeout(function() {
          // console.log('checking for update')
          printLog("<span class='fg-green'>Checking for Updates</span>")
          $.getJSON("https://api.github.com/repos/OpenBuilds/SW-Machine-Drivers/releases/latest?client_id=fbbb80debc1197222169&client_secret=7dc6e463422e933448f9a3a4150c8d2bbdd0f87c").done(function(release) {
            var availVersion = release.name.substr(1)
            var currentVersion = instance.version
            // hasDriver(instance.version)
            // console.log(versionCompare(availVersion, currentVersion), availVersion, currentVersion);
            if (versionCompare(availVersion, currentVersion) == 1) {
              console.log('outdated')
              oldDriver(currentVersion, availVersion)
            } else {
              hasDriver(instance.version)
            }
          });
        }, 10)
      }
    }
  });
  // };
};

$(document).ready(function() {

  // Check if Driver is running
  var DriverCheckinterval = setInterval(function() {
    checkIfDriverIsInstalled();
  }, 1000);
  getAvailableDriverVersion()

});

function hasDriver(version) {
  installedDriver = version
  if (versionCompare(availableDriverVersion, "v" + version) == 1) {
    //
  } else {
    $("#noDriverDetected").hide();
  }
  if (availableDriverVersion == "v" + version) {
    $("#noDriverDetected").hide();
  }
  $("#DriverDetected").show();
  alreadyDetected = true;
  $('#installDriversOnSettingspage').hide();
  $('#detectedVersion').html("<i class='fas fa-check fa-fw fg-green'></i>1. Detected OpenBuilds CONTROL: " + version)
}

function noDriver() {
  alreadyDetected = false;
  installedDriver = 'not detected'
  $("#DriverDetected").hide();
  $("#noDriverDetected").show();
  $('#installDriversOnSettingspage').show();
  $('#detectedVersion').html("<i class='fas fa-times fa-fw fg-red'></i>1. Not detecting OpenBuilds CONTROL")
  $('#installDriverMessage').html('Connecting to a machine, requires that you have the OpenBuilds CONTROL installed.')
}

function oldDriver(version, availVersion) {
  alreadyDetected = true;
  installedDriver = version
  $("#DriverDetected").hide();
  $("#noDriverDetected").show();
  $('#installDriversOnSettingspage').show();
  $('#detectedVersion').html("<i class='fas fa-times fa-fw fg-red'></i>1. You are running an outdated version of the OpenBuilds CONTROL v." + version + ". Please update to v" + availVersion)
  $('#installDriverMessage').html('Connecting to a machine, requires that you have the latest OpenBuilds CONTROL installed. <br>You are running version <code>' + version + "</code> - Please update to version <code>" + availVersion + "</code> or newer...")
  $('#installDriverHelp').hide();
}
// Loop to check if we can use Machine Integration
setInterval(function() {
  if (objectsInScene.length < 1) {
    $('#validDocuments').html("<i class='fas fa-times fa-fw fg-red'></i>2. No Documents yet")
  } else {
    $('#validDocuments').html("<i class='fas fa-check fa-fw fg-green'></i>2. Valid Documents")
  }
  if (toolpathsInScene.length < 1) {
    $('#validToolpaths').html("<i class='fas fa-times fa-fw fg-red'></i>3. No Toolpaths yet")
  } else {
    $('#validToolpaths').html("<i class='fas fa-check fa-fw fg-green'></i>3. Valid Toolpaths")
  }
}, 1000);

function downloadDrivers(os) {
  $.getJSON("https://api.github.com/repos/OpenBuilds/SW-Machine-Drivers/releases/latest?client_id=fbbb80debc1197222169&client_secret=7dc6e463422e933448f9a3a4150c8d2bbdd0f87c").done(function(release) {
    console.log(release)
    var asset = release.assets[0];
    var downloadCount = 0;
    var url = ""
    for (var i = 0; i < release.assets.length; i++) {
      var asset = release.assets[i]

      if (os == "win") {
        var rex = ".exe$"
      } else if (os == "mac") {
        var rex = ".dmg$"
      } else if (os == "appimage") {
        var rex = ".AppImage"
      } else if (os == "deb$") {
        var rex = ".deb$"
      }

      console.log("Checking if we can find a " + rex + " in the assets")
      if (asset.browser_download_url.match(rex)) {
        console.log('found the ' + rex + ' at: ' + asset.browser_download_url)
        url = asset.browser_download_url
        // if (window.navigator.userAgent.indexOf('Windows') != -1) {
        window.location = url
        // }
      }
    }
    var oneHour = 60 * 60 * 1000;
    var oneDay = 24 * oneHour;
    var dateDiff = new Date() - new Date(asset.updated_at);
    var timeAgo;
    if (dateDiff < oneDay) {
      timeAgo = (dateDiff / oneHour).toFixed(1) + " hours ago";
    } else {
      timeAgo = (dateDiff / oneDay).toFixed(1) + " days ago";
    }
    var releaseInfo = release.name + " was updated " + timeAgo;
    // console.log(asset.browser_download_url);
    // console.log(releaseInfo);
  });
}

function getAvailableDriverVersion() {
  $.getJSON("https://api.github.com/repos/OpenBuilds/SW-Machine-Drivers/releases/latest?client_id=fbbb80debc1197222169&client_secret=7dc6e463422e933448f9a3a4150c8d2bbdd0f87c").done(function(release) {
    $('.omdavailversion').html(release.name)
    availableDriverVersion = release.name
  });
}

function JSClock() {
  var time = new Date();
  var hour = time.getHours();
  var minute = time.getMinutes();
  var second = time.getSeconds();
  var temp = '' + hour
  if (hour == 0)
    temp = '12';
  temp += ((minute < 10) ? 'h0' : 'h') + minute;
  temp += ((second < 10) ? 'm0' : 'm') + second + 's';
  // temp += (hour >= 12) ? ' P.M.' : ' A.M.';
  return temp;
}

function activateDriver() {
  var url = "https://mymachine.openbuilds.com:3001/activate"
  $.ajax({
    type: 'GET',
    url: url,
    processData: false,
    contentType: false
  }).done(function(data) {
    console.log(data);
    // var message = data
    // Metro.toast.create(message, null, 4000);
  });
}

function sendGcodeToMyMachine() {
  var textToWrite = prepgcodefile();
  if (textToWrite.split('\n').length < 10) {
    var message = `No GCODE yet! Please setup some toolpaths, and Generate GCODE before you can use this function`
    Metro.toast.create(message, null, 4000, 'bg-red');
  } else {
    var blob = new Blob([textToWrite], {
      type: "text/plain"
    });
    console.log("Sending ", blob, " to https://mymachine.openbuilds.com:3001/")
    var url = "https://mymachine.openbuilds.com:3001/upload"
    var fd = new FormData();
    // fd.append('fname', 'file.gcode');
    var time = new Date();
    var string = "obcam-" + time.yyyymmdd() + "-" + JSClock() + ".gcode"
    console.log(string)

    fd.append('data', blob, string);
    $.ajax({
      type: 'POST',
      url: url,
      data: fd,
      processData: false,
      contentType: false
    }).done(function(data) {
      // console.log(data);
      var message = `GCODE Successfully sent to OpenBuilds CONTROL! Continue from the OpenBuilds CONTROL window`
      Metro.toast.create(message, null, 4000);
    });
  };
}

function versionCompare(v1, v2, options) {
  var lexicographical = options && options.lexicographical,
    zeroExtend = options && options.zeroExtend,
    v1parts = v1.split('.'),
    v2parts = v2.split('.');

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (var i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }

    if (v1parts[i] == v2parts[i]) {
      continue;
    } else if (v1parts[i] > v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
}