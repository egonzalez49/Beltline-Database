const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const siteName = document.getElementById('siteName')
const openEveryday = document.getElementById('openEveryday')
const address = document.getElementById('address')
const visitDate = document.getElementById('logDate')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const backBtn = document.getElementById('cancelBtn')
const logBtn = document.getElementById('logBtn')
var nameOfSite;
var userName;


const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Logged!',
    detail: 'Successfully logged visit.',
};

ipc.on("userName", function(event, p1) {
  userName = p1;
});

ipc.on("site", function(event, p1) {
  nameOfSite = p1;

  insertInfo(function(rows) {
    rows = rows[0];
    siteName.innerHTML = rows[0].SITENAME;
    address.innerHTML = rows[0].ADDRESS;
    if (rows[0].OPENEVERYDAY === "y" || rows[0].OPENEVERYDAY === "Y") {
      openEveryday.innerHTML = "Yes";
    } else {
      openEveryday.innerHTML = "No";
    }
  });
});

logBtn.addEventListener("click", function() {
  var logDate = visitDate.value;
  if (logDate === null || logDate === "") {
    dialog.showErrorBox('No date selected.', 'Please select a date.');
    return true;
  }

  var error = false;
  logVisit(function(err) {
    if(!err) {
      dialog.showMessageBox(null, options, (response) => {
        console.log(response);
        backBtn.click();
      });
    }
  }, logDate, error);
});

function logVisit(callback, d, error) {

  const connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'test',
      database : 'beltline',
      insecureAuth : true
  });

  connection.connect(function (err) {
      if(err){
          console.log(err.code);
          console.log(err.fatal);
      }
  });

  $queryTransits = 'CALL register_visit_site("'+userName+'", "'+nameOfSite+'","'+d+'")';
  ipc.send("error-log", $queryTransits);
  connection.query($queryTransits, function(err, rows, result) {
      if(err){
        ipc.send("error-log", err);
        dialog.showErrorBox('Failed.', 'Cannot visit site twice on same day.');
        error = true;
        callback(error);
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){});
        return;
      }
      ipc.send("error-log", rows);
      callback(error);
      connection.end(function(){});
  });

  return;
}

window.addEventListener("load", function() {
  ipc.send("update-site-value");
  ipc.send("update-username-value");
});



function insertInfo(callback) {

  const connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'test',
      database : 'beltline',
      insecureAuth : true
  });

  connection.connect(function (err) {
      if(err){
          console.log(err.code);
          console.log(err.fatal);
      }
  });

  $queryTransits = 'CALL retrieve_site_detail_visitor("'+nameOfSite+'")';
  ipc.send("error-log", $queryTransits);
  connection.query($queryTransits, function(err, rows, result) {
      if(err){
        ipc.send("error-log", err);
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){});
        return;
      }
      ipc.send("error-log", rows);
      callback(rows);
      connection.end(function(){});
  });

  return;
}


backBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/exploreSite.html', 750, 800);
  remote.getCurrentWindow().close();
})
