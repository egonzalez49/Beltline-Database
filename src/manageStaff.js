const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const firstlName = document.getElementById('lastName')
const filterfName = document.getElementById('firstName')
const siteDropdown = document.getElementById('siteDropdown')
const filterStartDate = document.getElementById('startDate')
const filterEndDate = document.getElementById('endDate')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const backBtn = document.getElementById('cancelBtn')
var firstName;
var lastName;
var siteFromDropdown;
var startDate;
var endDate;
var managerSite;
var sortName = -1;
var sortStaff = -1;
var arrowName = document.getElementById('sortName');
var arrowShift = document.getElementById('sortShift');
var userName;

ipc.on("userName", function(event, name) {
  userName = name;

  getManagerSite(function(row) {
    managerSite = row[0][0].SITENAME;
    row[0].forEach(function(site) {
      var element = document.createElement("option");
      element.textContent = site.SITENAME;
      element.value = site.SITENAME;
      siteDropdown.appendChild(element);
    });
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

//Validates the filter data to make sure no errors.
function validateData() {
  if (filterfName.value === null || filterfName.value === "") {
    firstName = "null";
  }

  if (firstlName.value === null || firstlName.value === "") {
    lastName = "null";
  }

  if (siteFromDropdown === "All") {
    //siteFromDropDown;
  }

  if (startDate === null || startDate === "") {
    startDate = "1900-10-10";
  }

  if (endDate === null || endDate === "") {
    endDate = "2200-10-10";
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
    if (sortStaff === -1) {
      sortStaff = 0;
      arrowShift.className = "icon icon-up-dir";
    } else if (sortStaff === 0) {
      sortStaff = 1; //down arrow
      arrowShift.className = "icon icon-down-dir";
    } else if (sortStaff === 1) {
      sortStaff = -1;
      arrowShift.className = "icon icon-arrow-combo";
      return;
    }
  }

  filterBtn.click();
}

filterBtn.addEventListener("click", function() {
  //Set values of all variables and do testing.
  siteFromDropdown = siteDropdown.value;
  firstName = filterfName.value;
  lastName = firstlName.value;
  startDate = filterStartDate.value;
  endDate = filterEndDate.value;

  //Make sure data is valid.
  if (validateData()) {
    return;
  }

  insertStaff(function(rows) {
    //Insert new rows
    var i = 0;
    rows = rows[0];
    if (rows.length === 0) {
      dialog.showErrorBox('No results.', 'No results match the filter constraints.');
    } else {
      while (table.firstChild) {
        table.removeChild(table.firstChild);
      }
      rows.forEach(function(staff) {
        var row = table.insertRow(i);
        //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
        ipc.send("error-log", staff);

        var staffName = row.insertCell(0);
        var staffShifts = row.insertCell(1);

        staffName.innerHTML =  "" + staff.FNAME + " " + staff.LNAME;
        staffShifts.appendChild(document.createTextNode("" + staff.SHIFTS));

        i++;
      });
    }
  }, siteFromDropdown, firstName, lastName, startDate, endDate, sortName, sortStaff);

  event.preventDefault();
});

window.addEventListener("load", function() {
  ipc.send("update-username-value");
});


function insertStaff(callback, sites, first, last, start, end, sortN, sortSF) {

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

  $queryTransits = 'CALL retrieve_staff("'+sites+'", "'+first+'", "'+last+'", "'+start+'", "'+end+'", "'+sortN+'", "'+sortSF+'")';
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
