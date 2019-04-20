const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')
const shell = require('electron').shell
const ipc = require('electron').ipcMain
const mysql = require('mysql');
var bcrypt = require('bcryptjs');
var currentUser = new Object();
currentUser.userName = null;
currentUser.type = null;

var currentSite = new Object();
currentSite.name = null;

var currentTransit = new Object();
currentTransit.route = null;
currentTransit.type = null;

var currentEvent = new Object();
currentEvent.startdate = null;
currentEvent.name = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ frame: true, width: 500, height: 425 })

  // and load the index.html of the app.
  //win.loadFile('src/index.html')
  win.loadFile('src/index.html');

  //remove the menu
  win.setMenu(null)

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  /*var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {label: 'Adjust Notification Value'},
        {
          label: 'CoinMarketCap',
          click() {
            shell.openExternal('https://coinmarketcap.com')
          }

        },
        {type: 'separator'},
        {
          label: 'Exit',
          click() {
            app.quit()
          }
        }
      ]
    }
  ])*/

  //Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// in main process, outside of app.on:
ipc.on('load-page', (event, arg, width, height) => {
    //win.loadURL(arg);
    win = new BrowserWindow({ frame: true, width: width, height: height })
    win.setMenu(null)
    //win.on('close', function () { win = null })
    win.loadURL(arg)
    win.show()
    //win.webContents.openDevTools()
});

ipc.on('load-page-user', (event, arg, width, height, userName, type) => {
    //win.loadURL(arg);
    currentUser.userName = userName;
    currentUser.type = type;
    win = new BrowserWindow({ frame: true, width: width, height: height })
    win.setMenu(null)
    //win.on('close', function () { win = null })
    win.loadURL(arg)
    win.show()
    //win.webContents.openDevTools()
});

ipc.on('load-page-site', (event, arg, width, height, siteName) => {
    //win.loadURL(arg);
    currentSite.name = siteName;
    win = new BrowserWindow({ frame: true, width: width, height: height })
    win.setMenu(null)
    //win.on('close', function () { win = null })
    win.loadURL(arg)
    win.show()
    //win.webContents.openDevTools()
});

ipc.on('update-site-value', function(event) {
    //console.log("Sending username: " + currentUser.userName);
  win.webContents.send('site', currentSite.name);
});

var info = new Object();
info.start = null;
info.name = null;

ipc.on('load-page-daily', (event, arg, width, height, siteName, startDate) => {
    //win.loadURL(arg);
    info.name = siteName;
    info.start = startDate;
    win = new BrowserWindow({ frame: true, width: width, height: height })
    win.setMenu(null)
    //win.on('close', function () { win = null })
    win.loadURL(arg)
    win.show()
    //win.webContents.openDevTools()
});

ipc.on('update-daily-value', function(event) {
    //console.log("Sending username: " + currentUser.userName);
  win.webContents.send('daily', info.name, info.start);
});

var e = new Object();
e.start = null;
e.name = null;
e.site = null;

ipc.on('load-page-dailyevent', (event, arg, width, height, p1, p2, p3) => {
    //win.loadURL(arg);
    e.name = p1;
    e.site = p2;
    e.start = p3;
    win = new BrowserWindow({ frame: true, width: width, height: height })
    win.setMenu(null)
    //win.on('close', function () { win = null })
    win.loadURL(arg)
    win.show()
    //win.webContents.openDevTools()
});

ipc.on('update-dailyevent-value', function(event) {
    //console.log("Sending username: " + currentUser.userName);
  win.webContents.send('dailyevent', e.name, e.site, e.start);
});

var e2 = new Object();
e2.start = null;
e2.name = null;
e2.site = null;
e2.ticket = null;

ipc.on('load-page-dailyevent2', (event, arg, width, height, p1, p2, p3, p4) => {
    //win.loadURL(arg);
    e.name = p1;
    e.site = p2;
    e.start = p3;
    e.ticket = p4;
    win = new BrowserWindow({ frame: true, width: width, height: height })
    win.setMenu(null)
    //win.on('close', function () { win = null })
    win.loadURL(arg)
    win.show()
    //win.webContents.openDevTools()
});

ipc.on('update-dailyevent2-value', function(event) {
    //console.log("Sending username: " + currentUser.userName);
  win.webContents.send('dailyevent2', e.name, e.site, e.start, e.ticket);
});

ipc.on('load-page-transit', (event, arg, width, height, routes, types) => {
    //win.loadURL(arg);
    currentTransit.route = routes;
    currentTransit.type = types;
    win = new BrowserWindow({ frame: true, width: width, height: height })
    win.setMenu(null)
    //win.on('close', function () { win = null })
    win.loadURL(arg)
    win.show()
    //win.webContents.openDevTools()
});

ipc.on('update-transit-value', function(event) {
    //console.log("Sending username: " + currentUser.userName);
  win.webContents.send('transit', currentTransit.route, currentTransit.type);
});

ipc.on('load-page-event', (event, arg, width, height, name, date) => {
    //win.loadURL(arg);
    currentEvent.name = name;
    currentEvent.startdate = date;
    console.log(date);
    win = new BrowserWindow({ frame: true, width: width, height: height })
    win.setMenu(null)
    //win.on('close', function () { win = null })
    win.loadURL(arg)
    win.show()
    //win.webContents.openDevTools()
});

ipc.on('update-type-add', (event) => {
    //win.loadURL(arg);
    currentUser.type += "v";
});

ipc.on('update-type-remove', (event, type) => {
    //win.loadURL(arg);
    //currentUser.type += "v";
    currentUser.type = type;
    //currentUser.type = currentUser.type.split("v")[0];
    console.log("TYPE:" + currentUser.type);
});

ipc.on('update-event-value', function(event) {
    //console.log("Sending username: " + currentUser.userName);
  win.webContents.send('event', currentEvent.name, currentEvent.startdate, currentUser.userName);
});

ipc.on('load-page-logout', (event, arg, width, height) => {
    //win.loadURL(arg);
    currentUser.userName = null;
    currentUser.type = null;
    win = new BrowserWindow({ frame: true, width: width, height: height })
    win.setMenu(null)
    //win.on('close', function () { win = null })
    win.loadURL(arg)
    win.show()
    //win.webContents.openDevTools()
});

ipc.on('load-back-page', () => {
    //win.loadURL(arg);
    if (currentUser.type === 'u') {
      modalPath = path.join('file://', __dirname, 'src/userFunc.html');
      win = new BrowserWindow({ frame: true, width: 500, height: 425 })
      win.setMenu(null)
      win.loadURL(arg)
      win.show()
    } else if (currentUser.type === 'v') {
      modalPath = path.join('file://', __dirname, 'src/visitorFunc.html');
      win = new BrowserWindow({ frame: true, width: 500, height: 425 })
      win.setMenu(null)
      win.loadURL(modalPath)
      win.show()
    } else if (currentUser.type === 'a') {
      modalPath = path.join('file://', __dirname, 'src/adminFunc.html');
      win = new BrowserWindow({ frame: true, width: 500, height: 425 })
      win.setMenu(null)
      win.loadURL(modalPath)
      win.show()
    } else if (currentUser.type === 'av') {
      modalPath = path.join('file://', __dirname, 'src/adminvisFunc.html');
      win = new BrowserWindow({ frame: true, width: 500, height: 425 })
      win.setMenu(null)
      win.loadURL(modalPath)
      win.show()
    } else if (currentUser.type === 'm') {
      modalPath = path.join('file://', __dirname, 'src/managerFunc.html');
      win = new BrowserWindow({ frame: true, width: 500, height: 425 })
      win.setMenu(null)
      win.loadURL(modalPath)
      win.show()
    } else if (currentUser.type === 'mv') {
      modalPath = path.join('file://', __dirname, 'src/managervisFunc.html');
      win = new BrowserWindow({ frame: true, width: 500, height: 425 })
      win.setMenu(null)
      win.loadURL(modalPath)
      win.show()
    } else if (currentUser.type === 's') {
      modalPath = path.join('file://', __dirname, 'src/staffFunc.html');
      win = new BrowserWindow({ frame: true, width: 500, height: 425 })
      win.setMenu(null)
      win.loadURL(modalPath)
      win.show()
    } else if (currentUser.type === 'sv') {
      modalPath = path.join('file://', __dirname, 'src/staffvisFunc.html');
      win = new BrowserWindow({ frame: true, width: 500, height: 425 })
      win.setMenu(null)
      win.loadURL(modalPath)
      win.show()
    }
    // win = new BrowserWindow({ frame: true, width: width, height: height })
    // win.setMenu(null)
    // //win.on('close', function () { win = null })
    // win.loadURL(arg)
    // win.show()
    // win.webContents.openDevTools()
});

ipc.on('update-username-value', function(event) {
    //console.log("Sending username: " + currentUser.userName);
  win.webContents.send('userName', currentUser.userName);
})

ipc.on('update-username-value-type', function(event) {
    //console.log("Sending username: " + currentUser.userName);
  win.webContents.send('userName', currentUser.userName, currentUser.type);
})

ipc.on('error-log', (event, error) => {
    console.log(error);
});

/*ipc.on('update-notify-value', function(event, arg) {
  win.webContents.send('targetPriceVal', arg)
})*/

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
