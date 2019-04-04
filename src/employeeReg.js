const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
const registerBtn = document.getElementById('registerBtn')
const backBtn = document.getElementById('cancelBtn')
const ipc = require('electron').ipcRenderer;

backBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/add.html', 500, 425);
  remote.getCurrentWindow().close();
})
