const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
const transitBtn = document.getElementById('transitBtn')
const backBtn = document.getElementById('cancelBtn')
const historyBtn = document.getElementById('visithistBtn')
const mngprofileBtn = document.getElementById('mngprofileBtn')
const mngEventBtn = document.getElementById('mngeventBtn')
const staffBtn = document.getElementById('staffBtn')
const reportBtn = document.getElementById('sitereportBtn')
const exploreEventBtn = document.getElementById('eventBtn')
const exploreSiteBtn = document.getElementById('siteBtn')
const visitHistoryBtn = document.getElementById('visithistBtn')
//const axios = require('axios')
const ipc = require('electron').ipcRenderer;


mngprofileBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'manageProfile.html')
  ipc.send("load-page", modalPath, 550, 625);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})


mngEventBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'manageEvent.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

staffBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'manageStaff.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

reportBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'siteReport.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

exploreSiteBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'exploreSite.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
})

exploreEventBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'exploreEvent.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
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

historyBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'transitHistory.html')
  ipc.send("load-page", modalPath, 550, 625);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

visitHistoryBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'visitHistory.html')
  ipc.send("load-page", modalPath, 750, 850);
  remote.getCurrentWindow().close();
})


backBtn.addEventListener('click', function() {
  ipc.send("load-page-logout", 'file://' + __dirname + '/index.html', 500, 425);
  remote.getCurrentWindow().close();
})
