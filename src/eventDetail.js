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
const capacity = document.getElementById('capacity')
const duration = document.getElementById('duration')
const staffs = document.getElementById('staffs')
const desc = document.getElementById('desc')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const backBtn = document.getElementById('cancelBtn')
var startDate;
var nameOfSite;
var nameOfEvent;

ipc.on("dailyevent", function(event, p1, p2, p3) {
  nameOfEvent = p1;
  nameOfSite = p2;
  startDate = p3;

  insertInfo(function(rows) {
    rows = rows[0];
    eventName.innerHTML = rows[0].EVENTNAME;
    siteName.innerHTML = rows[0].SITENAME;
    price.innerHTML = rows[0].PRICE;
    start.innerHTML = "" + rows[0].STARTDATE.toISOString().split('T')[0];
    capacity.innerHTML = rows[0].CAPACITY;
    end.innerHTML = "" + rows[0].ENDDATE.toISOString().split('T')[0];
    duration.innerHTML = rows[0].DURATION;
    console.log(rows[0].STAFF);
    staffs.innerHTML = rows[0].STAFF;
    desc.innerHTML = rows[0].DESCRIPTION;
  });
});

window.addEventListener("load", function() {
  ipc.send("update-dailyevent-value");
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

  $queryTransits = 'CALL retrieve_event_info("'+nameOfEvent+'", "'+nameOfSite+'", "'+startDate+'")';
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
  ipc.send("load-page", 'file://' + __dirname + '/viewSchedule.html', 750, 800);
  remote.getCurrentWindow().close();
})
