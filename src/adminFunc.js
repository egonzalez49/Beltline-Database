const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
const backBtn = document.getElementById('cancelBtn')
const mngprofileBtn = document.getElementById('mngprofileBtn')
const transitBtn = document.getElementById('transitBtn')
const transhistBtn = document.getElementById('transhistBtn')
const mngUser = document.getElementById('mnguserBtn')
const mngSite = document.getElementById('mngsiteBtn')
const mngTrans = document.getElementById('mngtransBtn')
//const axios = require('axios')
const ipc = require('electron').ipcRenderer;

mngUser.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'manageUser.html')
  ipc.send("load-page", modalPath, 500, 625);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

mngprofileBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'manageProfile.html')
  ipc.send("load-page", modalPath, 500, 625);
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
  ipc.send("load-page", modalPath, 500, 625);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

mngSite.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'manageSite.html')
  ipc.send("load-page", modalPath, 500, 625);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

mngTrans.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'manageTransit.html')
  ipc.send("load-page", modalPath, 705, 700);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

backBtn.addEventListener('click', function() {
  ipc.send("load-page-logout", 'file://' + __dirname + '/index.html', 500, 425);
  remote.getCurrentWindow().close();
})
