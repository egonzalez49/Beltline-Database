const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const backBtn = document.getElementById('cancelBtn')
var startDate;
var managerSite;
var sortDate = -1;
var sortEvent = -1;
var sortStaff = -1;
var sortVisits = -1;
var arrowDate = document.getElementById('sortEvent');
var arrowEvent = document.getElementById('sortNames');
var arrowStaff = document.getElementById('sortVisits');
var arrowVisit = document.getElementById('sortRevenue');
//var userName;

ipc.on("daily", function(event, name, start) {
  managerSite = name;
  startDate = start;
  console.log("SITE: " + managerSite + " | DATE: " + startDate);
  filter();
});

//Deals with sorting arrows. 0 means sort ASC, 1 means DESC.
function sorting(value) {
  ipc.send("error-log", value);
  if (value === 1) {
    if (sortDate === -1) {
      sortDate = 0;
      arrowDate.className = "icon icon-up-dir";
    } else if (sortDate === 0) {
      sortDate = 1; //down arrow
      arrowDate.className = "icon icon-down-dir";
    } else if (sortDate === 1) {
      sortDate = -1;
      arrowDate.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 2) {
    if (sortEvent === -1) {
      sortEvent = 0;
      arrowEvent.className = "icon icon-up-dir";
    } else if (sortEvent === 0) {
      sortEvent = 1; //down arrow
      arrowEvent.className = "icon icon-down-dir";
    } else if (sortEvent === 1) {
      sortEvent = -1;
      arrowEvent.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 3) {
    if (sortStaff === -1) {
      sortStaff = 0;
      arrowStaff.className = "icon icon-up-dir";
    } else if (sortStaff === 0) {
      sortStaff = 1; //down arrow
      arrowStaff.className = "icon icon-down-dir";
    } else if (sortStaff === 1) {
      sortStaff = -1;
      arrowStaff.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 4) {
    if (sortVisits === -1) {
      sortVisits = 0;
      arrowVisit.className = "icon icon-up-dir";
    } else if (sortVisits === 0) {
      sortVisits = 1; //down arrow
      arrowVisit.className = "icon icon-down-dir";
    } else if (sortVisits === 1) {
      sortVisits = -1;
      arrowVisit.className = "icon icon-arrow-combo";
      return;
    }
  }

  filter();
}

function filter() {
  insertEvents(function(rows) {
    //Insert new rows
    var i = 0;
    rows = rows[0];
    if (rows.length === 0) {
      dialog.showErrorBox('No results.', 'No results match the filter constraints.');
    } else {
      while (table.firstChild) {
        table.removeChild(table.firstChild);
      }
      rows.forEach(function(e) {
        var row = table.insertRow(i);
        //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
        ipc.send("error-log", e);

        var eventName = row.insertCell(0);
        var staffNames = row.insertCell(1);
        var visits = row.insertCell(2);
        var revenue = row.insertCell(3);

        eventName.innerHTML =  "" + e.EVENTNAME;
        staffNames.appendChild(document.createTextNode("" + e.STAFF));
        visits.appendChild(document.createTextNode("" + e.VISITS));
        revenue.appendChild(document.createTextNode("" + e.REVENUE));

        i++;
      });
    }
  }, managerSite, startDate, sortDate, sortEvent, sortStaff, sortVisits);

  //event.preventDefault();
}

window.addEventListener("load", function() {
  ipc.send("update-daily-value");
});


function insertEvents(callback, site, start, s1, s2, s3, s4) {

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

  $queryTransits = 'CALL retrieve_indv_events("'+site+'", "'+start+'", "'+s1+'", "'+s2+'", "'+s3+'", "'+s4+'")';
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
  ipc.send("load-page", 'file://' + __dirname + '/siteReport.html', 750, 850);
  remote.getCurrentWindow().close();
})
