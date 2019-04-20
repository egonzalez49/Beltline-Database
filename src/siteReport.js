const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const filterStartDate = document.getElementById('startDate')
const filterEndDate = document.getElementById('endDate')
const lowEventRange = document.getElementById('lowEventCount')
const highEventRange = document.getElementById('highEventCount')
const lowStaffRange = document.getElementById('lowStaffCount')
const highStaffRange = document.getElementById('highStaffCount')
const lowVisitRange = document.getElementById('lowVisitsRange')
const highVisitRange = document.getElementById('highVisitsRange')
const lowRevenueRange = document.getElementById('lowRevenueRange')
const highRevenueRange = document.getElementById('highRevenueRange')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const dailyBtn = document.getElementById('detailBtn')
const backBtn = document.getElementById('cancelBtn')
var lowEvent;
var highEvent;
var lowStaff;
var highStaff;
var lowVisit;
var highVisit;
var lowRevenue;
var highRevenue;
var startDate;
var endDate;
var managerSite;
var sortDate = -1;
var sortEvent = -1;
var sortStaff = -1;
var sortVisits = -1;
var sortRevenue = -1;
var arrowDate = document.getElementById('sortDate');
var arrowEvent = document.getElementById('sortEventCount');
var arrowStaff = document.getElementById('sortStaffCount');
var arrowVisit = document.getElementById('sortVisits');
var arrowRevenue = document.getElementById('sortRevenue');
var userName;

ipc.on("userName", function(event, name) {
  userName = name;

  getManagerSite(function(row) {
    managerSite = row[0][0].SITENAME;
    // row[0].forEach(function(site) {
    //   var element = document.createElement("option");
    //   element.textContent = site.SITENAME;
    //   element.value = site.SITENAME;
    //   siteDropdown.appendChild(element);
    // });
  }, userName);
});

//Popup screen settings.
const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Deleted!',
    detail: 'Successfully deleted event.',
};

dailyBtn.addEventListener("click", function() {
  var checked = false;
  var sDate;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 10; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      var row = table.childNodes[i-10];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          sDate = row.childNodes[j].innerText;
          break;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].textContent);
        } else if (j === 1) {
          type = row.childNodes[j].textContent;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].innerText);
        }
      }
      break;
    }
  }

  if (!checked) {
    event.preventDefault();
    dialog.showErrorBox('No date selected.', 'Please select a date.');
    return true;
  }

  const modalPath = path.join('file://', __dirname, 'dailyDetail.html')
  ipc.send("load-page-daily", modalPath, 700, 725, managerSite, sDate);
  ipc.send("error-log", "GOT HERE");
  remote.getCurrentWindow().close();
});

//Validates the filter data to make sure no errors.
function validateData() {
  if (lowEvent === null || lowEvent === "") {
    lowEvent = 0;
  }
  if (highEvent === null || highEvent === "") {
    highEvent = 99;
  }

  if (lowStaff === null || lowStaff === "") {
    lowStaff = 0;
  }
  if (highStaff === null || highStaff === "") {
    highStaff = 99;
  }

  if (lowVisit === null || lowVisit === "") {
    lowVisit = 0;
  }
  if (highVisit === null || highVisit === "") {
    highVisit = 9999;
  }

  if (lowRevenue === null || lowRevenue === "") {
    lowRevenue = 0;
  }
  if (highRevenue === null || highRevenue === "") {
    highRevenue = 99999;
  }

  if (startDate === null || startDate === "" || endDate === null || endDate === "") {
    dialog.showErrorBox('Date fields not filled in.', 'Please select a start and end date.');
    return true;
  }

  if (startDate > endDate) {
    dialog.showErrorBox('Incorrect date range.', 'Make sure the date range is valid.');
    return true;
  }
  return false;
}

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
  } else if (value === 5) {
    if (sortRevenue === -1) {
      sortRevenue = 0;
      arrowRevenue.className = "icon icon-up-dir";
    } else if (sortRevenue === 0) {
      sortRevenue = 1; //down arrow
      arrowRevenue.className = "icon icon-down-dir";
    } else if (sortRevenue === 1) {
      sortRevenue = -1;
      arrowRevenue.className = "icon icon-arrow-combo";
      return;
    }
  }

  filterBtn.click();
}

filterBtn.addEventListener("click", function() {
  //Set values of all variables and do testing.
  lowEvent = lowEventRange.value;
  highEvent = highEventRange.value;
  lowStaff = lowStaffRange.value;
  highStaff = highStaffRange.value;
  lowVisit = lowVisitRange.value;
  highVisit = highVisitRange.value;
  lowRevenue = lowRevenueRange.value;
  highRevenue = highRevenueRange.value;

  startDate = filterStartDate.value;
  endDate = filterEndDate.value;

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

        var staffName = row.insertCell(0);
        var eventCount = row.insertCell(1);
        var staffCount = row.insertCell(2);
        var totalVisit = row.insertCell(3);
        var totalRev = row.insertCell(4);

        staffName.innerHTML =  "<input type='radio' name='radios'>" + e.STARTDATE.toISOString().split('T')[0];
        eventCount.appendChild(document.createTextNode("" + e.EVENTCOUNT));
        staffCount.appendChild(document.createTextNode("" + e.STAFFCOUNT));
        totalVisit.appendChild(document.createTextNode("" + e.TOTALVISITS));
        totalRev.appendChild(document.createTextNode("" + e.REVENUE));

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

  $queryTransits = 'CALL retrieve_events("'+managerSite+'", "'+startDate+'", "'+endDate+'", "'+lowEvent+'", "'+highEvent+'", "'+lowStaff+'", "'+highStaff+
  '", "'+lowVisit+'", "'+highVisit+'", "'+lowRevenue+'", "'+highRevenue+'", "'+sortDate+'", "'+sortEvent+'", "'+sortStaff+'", "'+sortVisits+'", "'+sortRevenue+'")';
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


function getManagerSite(callback, mnger) {

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

  $queryTransits = 'CALL get_manager_site("'+mnger+'")';
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
