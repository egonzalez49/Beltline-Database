const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const eventName = document.getElementById('eventName')
const siteName = document.getElementById('siteName')
const price = document.getElementById('price')
const start = document.getElementById('startDate')
const end = document.getElementById('endDate')
const remaining = document.getElementById('remaining')
const desc = document.getElementById('desc')
const visitDate = document.getElementById('logDate')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const backBtn = document.getElementById('cancelBtn')
const logBtn = document.getElementById('logBtn')
var startDate;
var nameOfSite;
var nameOfEvent;
var ticketRemaining;
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

ipc.on("dailyevent2", function(event, p1, p2, p3, p4) {
  nameOfEvent = p1;
  nameOfSite = p2;
  startDate = p3;
  startDate = startDate.split('T')[0];
  ticketRemaining = p4;

  remaining.innerHTML = "" + ticketRemaining;

  insertInfo(function(rows) {
    rows = rows[0];
    eventName.innerHTML = rows[0].EVENTNAME;
    siteName.innerHTML = rows[0].SITENAME;
    price.innerHTML = rows[0].PRICE;
    start.innerHTML = "" + rows[0].STARTDATE.toISOString().split('T')[0];
    end.innerHTML = "" + rows[0].ENDDATE.toISOString().split('T')[0];
    desc.innerHTML = rows[0].DESCRIPTION;
  });
});

logBtn.addEventListener("click", function() {
  if (ticketRemaining < 1) {
    dialog.showErrorBox('No more room.', 'No remaining tickets.');
    return true;
  }
  var logDate = visitDate.value;
  if (logDate === null || logDate === "") {
    dialog.showErrorBox('No date selected.', 'Please select a date.');
    return true;
  }

  var error = false;
  logVisit(function(err) {
    if(err.affectedRows === 0) {
      dialog.showErrorBox('Invalid Date', 'Event not within that date.');
      return true;
    } else {
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

  $queryTransits = 'CALL register_visit("'+userName+'","'+nameOfEvent+'","'+nameOfSite+'","'+startDate+'","'+d+'")';
  ipc.send("error-log", $queryTransits);
  connection.query($queryTransits, function(err, rows, result) {
      if(err){
        ipc.send("error-log", err);
        dialog.showErrorBox('Failed.', 'Cannot visit event twice on same day.');
        error = true;
        callback(error);
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

window.addEventListener("load", function() {
  ipc.send("update-dailyevent2-value");
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

  $queryTransits = 'CALL retrieve_event_detail_visitor("'+nameOfEvent+'", "'+nameOfSite+'", "'+startDate+'")';
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
  ipc.send("load-page", 'file://' + __dirname + '/exploreEvent.html', 750, 800);
  remote.getCurrentWindow().close();
})
