const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')
const shell = require('electron').shell
const ipc = require('electron').ipcMain
const mysql = require('mysql');
var bcrypt = require('bcryptjs');

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
  win.webContents.openDevTools()

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
    win.webContents.openDevTools()
});

ipc.on('error-log', (event, error) => {
    console.log(error);
});

/*ipc.on('update-notify-value', function(event, arg) {
  win.webContents.send('targetPriceVal', arg)
})*/

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
