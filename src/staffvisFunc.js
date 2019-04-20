const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
const scheduleBtn = document.getElementById('scheduleBtn')
const backBtn = document.getElementById('cancelBtn')
const transhistBtn = document.getElementById('transhistBtn')
const transitBtn = document.getElementById('transitBtn')
const profileBtn = document.getElementById('mngprofileBtn')
const exploreEventBtn = document.getElementById('eventBtn')
const exploreSiteBtn = document.getElementById('siteBtn')
const visitHistoryBtn = document.getElementById('visithistBtn')
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

transhistBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'transitHistory.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
})

exploreEventBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'exploreEvent.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
})

exploreSiteBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'exploreSite.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
})

visitHistoryBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'visitHistory.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
})

profileBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'manageProfile.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
})

backBtn.addEventListener('click', function() {
  ipc.send("load-page-logout", 'file://' + __dirname + '/index.html', 500, 425);
  remote.getCurrentWindow().close();
})
