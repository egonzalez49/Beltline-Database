const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const eventName = document.getElementById('eventName')
const descWord = document.getElementById('descWord')
const start = document.getElementById('startDate')
const end = document.getElementById('endDate')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const viewBtn = document.getElementById('viewBtn')
const backBtn = document.getElementById('cancelBtn')
var startDate;
var endDate;
var descriptor;
var nameOfEvent;
var sortName = -1;
var sortSite = -1;
var sortStart = -1;
var sortEnd = -1;
var sortStaff = -1;
var arrowName = document.getElementById('sortEvent');
var arrowSite = document.getElementById('sortSite');
var arrowStart = document.getElementById('sortStart');
var arrowEnd = document.getElementById('sortEnd');
var arrowStaff = document.getElementById('sortStaff');
var userName;

ipc.on("userName", function(event, name) {
  userName = name;
});

viewBtn.addEventListener("click", function() {
  var checked = false;
  var eName;
  var sDate;
  var sName;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 4; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      var row = table.childNodes[i-4];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          eName = row.childNodes[j].innerText;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].textContent);
        } else if (j === 1) {
          sName = row.childNodes[j].textContent;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].innerText);
        } else if (j === 2) {
          sDate = row.childNodes[j].textContent;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].innerText);
        }
      }
      break;
    }
  }

  if (!checked) {
    event.preventDefault();
    dialog.showErrorBox('No event selected.', 'Please select an event.');
    return true;
  }

  const modalPath = path.join('file://', __dirname, 'eventDetail.html')
  ipc.send("load-page-dailyevent", modalPath, 700, 725, eName, sName, sDate);
  //ipc.send("error-log", "GOT HERE");
  remote.getCurrentWindow().close();
});

function validateData() {
  if (startDate === null || startDate === "") {
    startDate = "1900-10-10";
  }
  if (endDate === null || endDate === "") {
    endDate = "2200-10-10";
  }

  if (nameOfEvent === null || nameOfEvent === "") {
    nameOfEvent = "null";
  }
  if (descriptor === null || descriptor === "") {
    descriptor = "null";
  }

  if (startDate !== "null" && endDate !== "null" && (startDate > endDate)) {
    dialog.showErrorBox('Incorrect date range.', 'Make sure the date range is valid.');
    return true;
  }
  return false;
}

//Deals with sorting arrows. 0 means sort ASC, 1 means DESC.
function sorting(value) {
  ipc.send("error-log", value);
  if (value === 1) {
    if (sortName === -1) {
      sortName = 0;
      arrowName.className = "icon icon-up-dir";
    } else if (sortName === 0) {
      sortName = 1; //down arrow
      arrowName.className = "icon icon-down-dir";
    } else if (sortName === 1) {
      sortName = -1;
      arrowName.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 2) {
    if (sortSite === -1) {
      sortSite = 0;
      arrowSite.className = "icon icon-up-dir";
    } else if (sortSite === 0) {
      sortSite = 1; //down arrow
      arrowSite.className = "icon icon-down-dir";
    } else if (sortSite === 1) {
      sortSite = -1;
      arrowSite.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 3) {
    if (sortStart === -1) {
      sortStart = 0;
      arrowStart.className = "icon icon-up-dir";
    } else if (sortStart === 0) {
      sortStart = 1; //down arrow
      arrowStart.className = "icon icon-down-dir";
    } else if (sortStart === 1) {
      sortStart = -1;
      arrowStart.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 4) {
    if (sortEnd === -1) {
      sortEnd = 0;
      arrowEnd.className = "icon icon-up-dir";
    } else if (sortEnd === 0) {
      sortEnd = 1; //down arrow
      arrowEnd.className = "icon icon-down-dir";
    } else if (sortEnd === 1) {
      sortEnd = -1;
      arrowEnd.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 5) {
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
  }

  filterBtn.click();
}

filterBtn.addEventListener("click", function() {
  //Set values of all variables and do testing.
  nameOfEvent = eventName.value;
  descriptor = descWord.value;
  startDate = start.value;
  endDate = end.value;

  //Make sure data is valid.
  if (validateData()) {
    return;
  }

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

        var c1 = row.insertCell(0);
        var c2 = row.insertCell(1);
        var c3 = row.insertCell(2);
        var c4 = row.insertCell(3);
        var c5 = row.insertCell(4);

        c1.innerHTML =  "<input type='radio' name='radios'>" + e.EVENTNAME;
        c2.appendChild(document.createTextNode("" + e.SITENAME));
        c3.appendChild(document.createTextNode("" + e.STARTDATE.toISOString().split('T')[0]));
        c4.appendChild(document.createTextNode("" + e.ENDDATE.toISOString().split('T')[0]));
        c5.appendChild(document.createTextNode("" + e.STAFFCOUNT));

        i++;
      });
    }
  });

  event.preventDefault();
});

window.addEventListener("load", function() {
  ipc.send("update-username-value");
});


function insertEvents(callback) {

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

  $queryTransits = 'CALL retrieve_events_staff("'+userName+'", "'+nameOfEvent+'", "'+descriptor+'", "'+startDate+'", "'+endDate+'", "'+sortName+'", "'+sortSite+'", "'+sortStart+'", "'+sortEnd+'", "'+sortStaff+'")';
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
  ipc.send("load-back-page");
  //ipc.send("load-page", 'file://' + __dirname + '/main.html', 500, 425);
  remote.getCurrentWindow().close();
})
