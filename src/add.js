const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
const userBtn = document.getElementById('userBtn')
const visitorBtn = document.getElementById('visitorBtn')
const employeeBtn = document.getElementById('employeeBtn')
const empvisBtn = document.getElementById('empvisBtn')
const backBtn = document.getElementById('cancelBtn')
const ipc = require('electron').ipcRenderer;

/*closeBtn.addEventListener('click', function (event) {
    var window = remote.getCurrentWindow();
    window.close();
})*/

//const updateBtn = document.getElementById('updateBtn')

userBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/userReg.html', 500, 575);
  remote.getCurrentWindow().close();
})

visitorBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/visitorReg.html', 500, 575);
  remote.getCurrentWindow().close();
})

employeeBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/employeeReg.html', 615, 645);
  remote.getCurrentWindow().close();
})

empvisBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/empvisReg.html', 615, 645);
  remote.getCurrentWindow().close();
})

backBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/index.html', 500, 425);
  remote.getCurrentWindow().close();
})
