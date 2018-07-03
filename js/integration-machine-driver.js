var validAddrs = [];
var scansize = 0
var scancntsuccess = 0;
var scancnterr = 0;

$(document).ready(function() {
  // Find local IPs:
  // disable until golive
  if ('https:' != document.location.protocol) {
    console.log('Running on http - activating OMD Integration - not available in HTTPS at this time')
    scanLAN()
    $('#scanLanButton').show()
  }
});


function sendGcodeToOmd(ipaddress) {
  var textToWrite = prepgcodefile();
  var blob = new Blob([textToWrite], {
    type: "text/plain"
  });
  console.log("Sending ", blob, " to ", ipaddress + '/upload')

  var url = "http://" + ipaddress + "/upload"
  var fd = new FormData();
  // fd.append('fname', 'file.gcode');
  fd.append('data', blob, "file.gcode");
  $.ajax({
    type: 'POST',
    url: url,
    data: fd,
    processData: false,
    contentType: false
  }).done(function(data) {
    console.log(data);
  });

}

function scanLAN() {
  // reset Counts
  $('#scanbutton').html('<i class="fas fa-spinner fa-pulse"></i> Scanning...')
  validAddrs = [];
  scansize = 0
  scancntsuccess = 0;
  scancnterr = 0;
  getIPs(function(ip) {
    console.log("Local IP: " + ip)
    var subnet = ip.replace(/\d+$/, "*");
    var start_time = (new Date).getTime();
    wsScan(subnet)
  });
}

function scanLANCompleted() {
  if (validAddrs.length) {
    $('#driversmenu').empty();
    var menuheader = `<h6 class="dropdown-header">Send GCODE to OpenBuilds Machine Driver:</h6>`
    $('#driversmenu').append(menuheader);
    for (i = 0; i < validAddrs.length; i++) {
      var obj = validAddrs[i]
      var ip = obj.url.split("/")[2];
      console.log(ip)
      var url = "//" + ip + "/api/version"
      $.ajax({
        url: url,
        type: 'GET',
        async: true,
        cache: false,
        timeout: 1000,
        error: function() {
          // return true;
        },
        success: function(msg) {
          var instance = JSON.parse(msg)
          var host = instance.ipaddress.split(':')[0];
          var menuitem = `<a class="dropdown-item" href="#" onclick="sendGcodeToOmd('` + instance.ipaddress + `')">` + instance.application + ` v` + instance.version + ` (` + host + `)</a>`;
          $('#driversmenu').append(menuitem);
        }
      });
    }
  } else {
    var menuheader = `<h6 class="dropdown-header">Install OpenBuilds Machine Driver:</h6>`
    $('#driversmenu').append(menuheader);
    var menuitem = `<a class="dropdown-item" href="#">Download Drivers</a>`;
    $('#driversmenu').append(menuitem);
  }

}

function wsScan(subnet) {
  if (subnet) {
    subnet = subnet.replace("*", "");
    // this method will scan your local subnet for instances of the OpenBuilds Machine Driver
    if (window["WebSocket"]) {
      var ctr2 = 1; // keep 2nd ctr so we can increment inside the settimeout
      // scansize = scansize + 19
      scansize = scansize + 254
      // for (var ctr = 1; ctr < 20; ctr++) {
      for (var ctr = 1; ctr < 255; ctr++) {
        setTimeout(function() {
          var conn = new WebSocket("ws://" + subnet + ctr2++ + ":3000/socket.io/?EIO=3&transport=websocket");
          conn.onopen = function(evt) {
            scancntsuccess++;
            validAddrs.push(evt.target);
            setTimeout(function() {
              conn.close();
            }, 500);
            console.log("Found " + scancntsuccess + ", Scanned " + (scancntsuccess + scancnterr))
            $('#scanbutton').html('<i class="fas fa-spinner fa-pulse"></i> Scanning...(' + parseInt(100 * ((scancntsuccess + scancnterr) / scansize)) + '%)')
            scanLANCompleted();
            if ((scancntsuccess + scancnterr) == scansize) {
              console.log("SCAN COMPLETE")
              $('#scanbutton').html('<i class="fas fa-play"></i> Send to Machine')
              scanLANCompleted();
            }
          };
          conn.onerror = function(evt) {
            scancnterr++;
            console.log("Found " + scancntsuccess + ", Scanned " + (scancntsuccess + scancnterr))
            $('#scanbutton').html('<i class="fas fa-spinner fa-pulse"></i> Scanning...(' + parseInt(100 * ((scancntsuccess + scancnterr) / scansize)) + '%)')
            if ((scancntsuccess + scancnterr) == scansize) {
              console.log("SCAN COMPLETE")
              $('#scanbutton').html('<i class="fas fa-play"></i> Send to Machine')
              scanLANCompleted();
            }
          };
        }, ctr * 100);
      };
    }
  } else {
    console.lgog("Invalid Subnet, cannot autodetect")
  }
};

//get the IP addresses of this machine
function getIPs(callback) {
  var ip_dups = {};

  //compatibility for firefox and chrome
  var RTCPeerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;
  var useWebKit = !!window.webkitRTCPeerConnection;

  //bypass naive webrtc blocking using an iframe
  if (!RTCPeerConnection) {
    //NOTE: you need to have an iframe in the page right above the script tag
    //
    //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
    //<script>...getIPs called in here...
    //
    var win = iframe.contentWindow;
    RTCPeerConnection = win.RTCPeerConnection ||
      win.mozRTCPeerConnection ||
      win.webkitRTCPeerConnection;
    useWebKit = !!win.webkitRTCPeerConnection;
  }

  //minimal requirements for data connection
  var mediaConstraints = {
    optional: [{
      RtpDataChannels: true
    }]
  };

  var servers = {
    iceServers: [{
      urls: "stun:stun.services.mozilla.com"
    }]
  };

  //construct a new RTCPeerConnection
  var pc = new RTCPeerConnection(servers, mediaConstraints);

  function handleCandidate(candidate) {
    //match just the IP address
    var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
    var ip_addr = ip_regex.exec(candidate)[1];

    //remove duplicates
    if (ip_dups[ip_addr] === undefined)
      callback(ip_addr);

    ip_dups[ip_addr] = true;
  }

  //listen for candidate events
  pc.onicecandidate = function(ice) {

    //skip non-candidate events
    if (ice.candidate)
      handleCandidate(ice.candidate.candidate);
  };

  //create a bogus data channel
  pc.createDataChannel("");

  //create an offer sdp
  pc.createOffer(function(result) {

    //trigger the stun server request
    pc.setLocalDescription(result, function() {}, function() {});

  }, function() {});

  //wait for a while to let everything get ready
  setTimeout(function() {
    //read candidate info from local description
    var lines = pc.localDescription.sdp.split('\n');

    lines.forEach(function(line) {
      if (line.indexOf('a=candidate:') === 0)
        handleCandidate(line);
    });
  }, 1000);
};