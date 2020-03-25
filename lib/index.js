var snmp = require("net-snmp");
var path = require("path");
const dns = require('dns').promises;

var oids = [
  "1.3.6.1.4.1.41112.1.4.5.1.5.1", // Signal Strength
  "1.3.6.1.4.1.41112.1.4.5.1.8.1", //Noise Floor
  "1.3.6.1.4.1.41112.1.4.5.1.7.1", //CCQ
  "1.3.6.1.4.1.41112.1.4.6.1.2.1", //AirMax Enabled
  "1.3.6.1.2.1.1.5.0", //PPPoE User
  "1.3.6.1.4.1.10002.1.1.1.1.2.0", // Free RAM

  //ifDescr
  "1.3.6.1.2.1.2.2.1.2.1", //lo0
  "1.3.6.1.2.1.2.2.1.2.2", //eth0
  "1.3.6.1.2.1.2.2.1.2.3", //eth1
  "1.3.6.1.2.1.2.2.1.2.4", //wifi0
  "1.3.6.1.2.1.2.2.1.2.5", //ath0
  "1.3.6.1.2.1.2.2.1.2.6", //pppo0

  //ifSpeed
  "1.3.6.1.2.1.2.2.1.5.1", //
  "1.3.6.1.2.1.2.2.1.5.2", //
  "1.3.6.1.2.1.2.2.1.5.3", //
  "1.3.6.1.2.1.2.2.1.5.4", //
  "1.3.6.1.2.1.2.2.1.5.5", //
  "1.3.6.1.2.1.2.2.1.5.6", //


  // ifOutOctets
  "1.3.6.1.2.1.2.2.1.16.1", //
  "1.3.6.1.2.1.2.2.1.16.2", //
  "1.3.6.1.2.1.2.2.1.16.3", //
  "1.3.6.1.2.1.2.2.1.16.4", //
  "1.3.6.1.2.1.2.2.1.16.5", //
  "1.3.6.1.2.1.2.2.1.16.6", //

  // ifInOctets
  "1.3.6.1.2.1.2.2.1.10.1", //
  "1.3.6.1.2.1.2.2.1.10.2", //
  "1.3.6.1.2.1.2.2.1.10.3", //
  "1.3.6.1.2.1.2.2.1.10.4", //
  "1.3.6.1.2.1.2.2.1.10.5", //
  "1.3.6.1.2.1.2.2.1.10.6", //

  // ifInErrors
  "1.3.6.1.2.1.2.2.1.14.1", //
  "1.3.6.1.2.1.2.2.1.14.2", //
  "1.3.6.1.2.1.2.2.1.14.3", //
  "1.3.6.1.2.1.2.2.1.14.4", //
  "1.3.6.1.2.1.2.2.1.14.5", //
  "1.3.6.1.2.1.2.2.1.14.6", //

  // ifOutErrors
  "1.3.6.1.2.1.2.2.1.20.1", //
  "1.3.6.1.2.1.2.2.1.20.2", //
  "1.3.6.1.2.1.2.2.1.20.3", //
  "1.3.6.1.2.1.2.2.1.20.4", //
  "1.3.6.1.2.1.2.2.1.20.5", //
  "1.3.6.1.2.1.2.2.1.20.6", //

];

var status = {
  signalStrengh: 0,
  noiseFloor: 0,
  ccq: 0,
  airMax: false,
  PPPoE: "",
  freeMemory: 0,
  lastUpdateTime: 0
}
var interfaces = [
  // Interface 1
  {
    desc: "",
    ifInOctets: 0,
    ifInErrors: 0,
    ifOutOctets: 0,
    ifOutErrors: 0,
    ifLinkSpeed: 0,
    ifCalcTxKbps: 0,
    ifCalcRxKbps: 0,
    lastUpdateTime: 0
  },
  // Interface 2
  {
    desc: "",
    ifInOctets: 0,
    ifInErrors: 0,
    ifOutOctets: 0,
    ifOutErrors: 0,
    ifLinkSpeed: 0,
    ifCalcTxKbps: 0,
    ifCalcRxKbps: 0,
    lastUpdateTime: 0
  },
  // Interface 3
  {
    desc: "",
    ifInOctets: 0,
    ifInErrors: 0,
    ifOutOctets: 0,
    ifOutErrors: 0,
    ifLinkSpeed: 0,
    ifCalcTxKbps: 0,
    ifCalcRxKbps: 0,
    lastUpdateTime: 0
  },
  // Interface 4
  {
    desc: "",
    ifInOctets: 0,
    ifInErrors: 0,
    ifOutOctets: 0,
    ifOutErrors: 0,
    ifLinkSpeed: 0,
    ifCalcTxKbps: 0,
    ifCalcRxKbps: 0,
    lastUpdateTime: 0
  },
  // Interface 5
  {
    desc: "",
    ifInOctets: 0,
    ifInErrors: 0,
    ifOutOctets: 0,
    ifOutErrors: 0,
    ifLinkSpeed: 0,
    ifCalcTxKbps: 0,
    ifCalcRxKbps: 0,
    lastUpdateTime: 0
  },
  // Interface 6
  {
    desc: "",
    ifInOctets: 0,
    ifInErrors: 0,
    ifOutOctets: 0,
    ifOutErrors: 0,
    ifLinkSpeed: 0,
    ifCalcTxKbps: 0,
    ifCalcRxKbps: 0,
    lastUpdateTime: 0
  },
]


function getSNMPVals() {

  var session = snmp.createSession("192.168.1.20", "public");


  session.get(oids, function(error, varbinds) {
    if (error) {
      console.error(error);
    } else {
      for (var i = 0; i < varbinds.length; i++)
        if (snmp.isVarbindError(varbinds[i]))
          console.error(snmp.varbindError(varbinds[i]))
      else {
        if (varbinds[i].oid == "1.3.6.1.4.1.41112.1.4.5.1.5.1") {
          // console.log("Signal Strength: " + varbinds[i].value + "dBm")
          status.signalStrengh = parseInt(varbinds[i].value)
        } else if (varbinds[i].oid == "1.3.6.1.4.1.41112.1.4.5.1.8.1") {
          // console.log("Noise Floor: " + varbinds[i].value + "dBm")
          status.noiseFloor = parseInt(varbinds[i].value)
        } else if (varbinds[i].oid == "1.3.6.1.4.1.41112.1.4.5.1.7.1") {
          // console.log("Wifi CCQ: " + varbinds[i].value)
          status.ccq = parseInt(varbinds[i].value)
        } else if (varbinds[i].oid == "1.3.6.1.4.1.41112.1.4.6.1.2.1") {
          // console.log("AirMax Enabled: " + varbinds[i].value)
          status.airMax = parseInt(varbinds[i].value)
        } else if (varbinds[i].oid == "1.3.6.1.2.1.1.5.0") {
          // console.log("PPPoE User: " + varbinds[i].value)
          status.PPPoE = varbinds[i].value.toString();
        } else if (varbinds[i].oid == "1.3.6.1.4.1.10002.1.1.1.1.2.0") {
          // console.log("Free RAM: " + varbinds[i].value)
          status.freeMemory = parseInt(varbinds[i].value)
        } else if (varbinds[i].oid.indexOf("1.3.6.1.2.1.2.2.1.2.") == 0) {
          // ifDesc
          var idx = parseInt(varbinds[i].oid.slice(-1)) - 1
          interfaces[idx].desc = varbinds[i].value.toString();
          interfaces[idx].lastUpdateTime = Date.now();
        } else if (varbinds[i].oid.indexOf("1.3.6.1.2.1.2.2.1.5.") == 0) {
          // ifSpeed
          var idx = parseInt(varbinds[i].oid.slice(-1)) - 1
          interfaces[idx].ifLinkSpeed = varbinds[i].value;
          interfaces[idx].lastUpdateTime = Date.now();
        } else if (varbinds[i].oid.indexOf("1.3.6.1.2.1.2.2.1.16.") == 0) {
          // ifOutOctets
          var idx = parseInt(varbinds[i].oid.slice(-1)) - 1

          var kbps = parseInt(varbinds[i].value) - parseInt(interfaces[idx].ifOutOctets);
          if (!isNaN(kbps) && kbps > 0) {
            var secondselapsed = (Date.now() - interfaces[idx].lastUpdateTime);
            if (secondselapsed > 0) {
              var calculatedkbps = kbps / 1024 / secondselapsed
            } else {
              var calculatedkbps = kbps / 1024
            }
            if (calculatedkbps) {
              interfaces[idx].ifCalcTxKbps = calculatedkbps
              interfaces[idx].ifOutOctets = varbinds[i].value;
              interfaces[idx].lastUpdateTime = Date.now();
            }
          }

        } else if (varbinds[i].oid.indexOf("1.3.6.1.2.1.2.2.1.10.") == 0) {
          // ifInOctets
          var idx = parseInt(varbinds[i].oid.slice(-1)) - 1
          var kbps = parseInt(varbinds[i].value) - parseInt(interfaces[idx].ifInOctets);
          if (!isNaN(kbps) && kbps > 0) {
            var secondselapsed = (Date.now() - interfaces[idx].lastUpdateTime);
            if (secondselapsed > 0) {
              var calculatedkbps = kbps / 1024 / secondselapsed
            } else {
              var calculatedkbps = kbps / 1024
            }
            // console.log(secondselapsed, kbps, calculatedkbps);
            if (calculatedkbps) {
              interfaces[idx].ifCalcRxKbps = calculatedkbps
              interfaces[idx].ifInOctets = varbinds[i].value;
              interfaces[idx].lastUpdateTime = Date.now();
            }

          }

        } else if (varbinds[i].oid.indexOf("1.3.6.1.2.1.2.2.1.20.") == 0) {
          // ifOutErrors
          var idx = parseInt(varbinds[i].oid.slice(-1)) - 1
          interfaces[idx].ifOutErrors = varbinds[i].value;
          interfaces[idx].lastUpdateTime = Date.now();
        } else if (varbinds[i].oid.indexOf("1.3.6.1.2.1.2.2.1.14.") == 0) {
          // ifInErrors
          var idx = parseInt(varbinds[i].oid.slice(-1)) - 1
          interfaces[idx].ifInErrors = varbinds[i].value;
          interfaces[idx].lastUpdateTime = Date.now();
        } else {
          console.log(varbinds[i].oid + " = " + varbinds[i].value);
        }
      }
    }

    status.lastUpdateTime = Date.now();
    console.log(JSON.stringify(interfaces, null, 4));
    console.log(JSON.stringify(status, null, 4));

    io.sockets.emit("status", status);
    io.sockets.emit("interfaces", interfaces);

    session.trap(snmp.TrapType.LinkDown, function(error) {
      if (error)
        console.error(error);
    });

    // If done, close the session
    session.close();
  });
}

setInterval(function() {
  getSNMPVals()
}, 2000);

function checkInternet() {
  return dns.lookup('google.com')
    .then(() => true)
    .catch(() => false);
};


process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
const electron = require('electron')
const electronApp = electron.app;
const {
  BrowserWindow
} = require('electron')
var appIcon = null

var express = require("express");
var app = express();
var http = require("http").Server(app);
var https = require('https');

var ioServer = require('socket.io');
var io = new ioServer();

var ip = require("ip");

var _ = require('lodash');

app.use(express.static(path.join(__dirname, "app")));
const httpserver = http.listen(8080, '0.0.0.0', function() {
  console.log('http:  listening on:' + ip.address() + ":8080");
});

io.attach(httpserver);
io.on("connection", function(socket) {
  iosocket = socket;
  socket.on("minimisetotray", function(data) {
    win.hide();
  });
  socket.on("minimize", function(data) {
    win.minimize();
  });
  socket.on("quit", function(data) {
    electronApp.exit(0);
  });

});
//
// // ELECTRON STUFF
// // Keep a global reference of the window object, if you don't, the window will
// // be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    // 1366 * 768 == minimum to cater for
    width: 350,
    height: 600,
    fullscreen: false,
    center: true,
    resizable: true,
    title: "Albies Wireless CPE Monitor",
    frame: true,
    autoHideMenuBar: true,
    icon: '/app/favicon.png',
    webgl: true,
    experimentalFeatures: true,
    experimentalCanvasFeatures: true,
    offscreen: true,
  });
  win.loadURL("http://localhost:8080/");
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  })

  win.webContents.on('did-finish-load', function() {
    // setTimeout(function() {
    //   io.sockets.emit("ports", oldportslist);
    // }, 400)

  });


}

electronApp.commandLine.appendSwitch('ignore-gpu-blacklist', 'true');
electronApp.commandLine.appendSwitch('enable-gpu-rasterization', 'true');
electronApp.commandLine.appendSwitch('enable-zero-copy', 'true');
electronApp.commandLine.appendSwitch('disable-software-rasterizer', 'true');
electronApp.commandLine.appendSwitch('enable-native-gpu-memory-buffers', 'true');

electronApp.on('ready', createWindow);
electronApp.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    electronApp.quit()
  }
})

electronApp.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})