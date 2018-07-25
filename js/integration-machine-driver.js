var DriverCheckinterval;

$(document).ready(function() {

  function checkIfDriverIsInstalled() {
    var conn = new WebSocket("wss://mymachine.openbuilds.com:3001/socket.io/?EIO=3&transport=websocket");
    conn.onopen = function(evt) {
      // console.log("Valid Driver at ", evt.target);
      setTimeout(function() {
        conn.close();
      }, 500);
      var url = "https://mymachine.openbuilds.com:3001/api/version"
      $.ajax({
        url: url,
        type: 'GET',
        async: true,
        cache: false,
        timeout: 1000,
        error: function() {
          // console.log("Failed to retrieve OpenBuilds Machine Driver version information from the API at " + evt.target.url);
        },
        success: function(msg) {
          var instance = JSON.parse(msg)
          var host = instance.ipaddress.split(':')[0];
          var menuitem = `<a class="dropdown-item" href="#" onclick="sendGcodeToOmd('` + instance.ipaddress + `')">` + instance.application + ` v` + instance.version + ` (` + host + `)</a>`;
          // console.log(menuitem);
          hasDriver(instance.version)
        }
      });
    };
    conn.onerror = function(evt) {
      // console.error("Could not find a valid instance of OpenBuilds Machine Driver at " + evt.target.url + " /  Download and install the Driver from https://github.com/OpenBuilds/SW-Machine-Drivers/releases    Alternatively, your PC may be disconnected from the Internet. ");
      noDriver()
    };
  }

  // Check if Driver is running
  var DriverCheckinterval = setInterval(function() {
    checkIfDriverIsInstalled();
  }, 1000);
});

function hasDriver(version) {
  $("#omdversion").html(" v" + version)
  $("#downloadDrivers").fadeOut("slow");
  $("#sendGcodeToMyMachine").fadeIn("slow");
}

function noDriver() {
  $("#sendGcodeToMyMachine").fadeOut("slow");
  $("#downloadDrivers").fadeIn("slow");

}

function downloadDrivers() {
  $.getJSON("https://api.github.com/repos/OpenBuilds/SW-Machine-Drivers/releases/latest").done(function(release) {
    var asset = release.assets[0];
    var downloadCount = 0;
    var url = ""
    for (var i = 0; i < release.assets.length; i++) {
      var asset = release.assets[i]
      if (asset.browser_download_url.match(".exe$")) {
        console.log('found the exe at: ' + asset.browser_download_url)
        url = asset.browser_download_url
        if (window.navigator.userAgent.indexOf('Windows') != -1) {
          window.location = url
        }
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

function sendGcodeToMyMachine() {
  var textToWrite = prepgcodefile();
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
  });
}