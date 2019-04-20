const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
const transitBtn = document.getElementById('transitBtn')
const eventBtn = document.getElementById('eventBtn')
const exploreSiteBtn = document.getElementById('siteBtn')
const viewHistBtn = document.getElementById('visithistBtn')
const transHistBtn = document.getElementById('transhistBtn')
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

eventBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'exploreEvent.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

siteBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'exploreSite.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

viewHistBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'visitHistory.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
})

transHistBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'transitHistory.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
})

backBtn.addEventListener('click', function() {
  ipc.send("load-page-logout", 'file://' + __dirname + '/index.html', 500, 425);
  remote.getCurrentWindow().close();
})
