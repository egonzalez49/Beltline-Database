const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
const scheduleBtn = document.getElementById('scheduleBtn')
const backBtn = document.getElementById('cancelBtn')
//const axios = require('axios')
const ipc = require('electron').ipcRenderer;

scheduleBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'viewSchedule.html')
  ipc.send("load-page", modalPath, 750, 800);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

backBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/index.html', 500, 425);
  remote.getCurrentWindow().close();
})
