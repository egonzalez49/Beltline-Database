const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
const transitBtn = document.getElementById('transitBtn')
const backBtn = document.getElementById('cancelBtn')
//const axios = require('axios')
const ipc = require('electron').ipcRenderer;

transitBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'takeTransit.html')
  ipc.send("load-page", modalPath, 500, 625);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

backBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/main.html', 500, 425);
  remote.getCurrentWindow().close();
})