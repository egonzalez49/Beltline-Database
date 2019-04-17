const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const formName = document.getElementById('eventName')
const capacity = document.getElementById('capacity')
const price = document.getElementById('price')
const minStaff = document.getElementById('minStaff')
const startDate = document.getElementById('startDate')
const endDate = document.getElementById('endDate')
const desc = document.getElementById('desc')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const createBtn = document.getElementById('createBtn')
const getBtn = document.getElementById('getBtn')
const backBtn = document.getElementById('cancelBtn')
var getStaffStartDate = null;
var getStaffEndDate = null;

var eventName;
var eventDate;
var manager;

window.addEventListener("load", function() {
  //console.log("Ran load code.")
  ipc.send("update-event-value");
});

const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Created!',
    detail: 'Successfully created event.',
};

ipc.on("event", function(event, name, type, man) {
  eventName = name;
  eventDate = type;
  manager = man;

  //console.log("ROUTE: " + transitRoute);
  //console.log("TYPE: " + transitType);

  var connected = [];
  // getConnected(function(rows) {
  //   rows = rows[0];
  //   rows.forEach(function(r) {
  //     connected.push(r.SITENAME);
  //   });
    //price.value = rows[0].PRICE;
    //routeName.value = rows[0].ROUTE;
    //transportType.innerHTML = '' +rows[0].TYPE;

  //}, transitRoute, transitType);
});

getBtn.addEventListener("click", function() {
  getStaffStartDate = startDate.value;
  getStaffEndDate = endDate.value;
  var start = startDate.value;
  var end = endDate.value;

  if (start === null || start === "" || end === null || end === "") {
    dialog.showErrorBox('Date fields not filled in.', 'Please select a start and end date.');
    return true;
  }

  if (start > end) {
    dialog.showErrorBox('Incorrect date range.', 'Make sure the date range is valid.');
    return true;
  }

  insertStaff(function(rows2) {
    var i = 0;
    rows2 = rows2[0];

    if (rows2.length === 0) {
      dialog.showErrorBox('No results.', 'No results match the filter constraints.');
    } else {
      while (table.firstChild) {
        table.removeChild(table.firstChild);
      }
      rows2.forEach(function(staff) {
        var row = table.insertRow(i);
            //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
        ipc.send("error-log", staff);

        var staffName = row.insertCell(0);

            //var routeText  = document.createTextNode('' + transit.ROUTE);
        staffName.innerHTML =  "<input type='checkbox'>" + staff.FNAME + " " + staff.LNAME;
            //route.appendChild(routeText);
        i++;
      });
    }
  }, start, end);
})

createBtn.addEventListener("click", function() {
  if (getStaffStartDate === null || getStaffEndDate === null) {
    event.preventDefault();
    dialog.showErrorBox('No staff.', 'Please populate the staff table.');
    return true;
  }
  var newStart = startDate.value;
  var newEnd = endDate.value;
  if (newStart === null || newStart === "" || newEnd === null || newEnd === "") {
    dialog.showErrorBox('Date fields not filled in.', 'Please select a start and end date.');
    return true;
  }

  if (newStart > newEnd) {
    dialog.showErrorBox('Incorrect date range.', 'Make sure the date range is valid.');
    return true;
  }
  if (getStaffStartDate !== newStart || getStaffEndDate !== newEnd) {
    event.preventDefault();
    dialog.showErrorBox('Out of date staff.', 'Dates changed since staff list updated. Reupdate staff list.');
    return true;
  }
  var nameOfEvent = formName.value;
  if (nameOfEvent === null || nameOfEvent === '') {
    event.preventDefault();
    dialog.showErrorBox('Invalid event name.', 'Please input a valid event name.');
    return true;
  }
  var minimumStaff = minStaff.value;
  if (minimumStaff === null || minimumStaff === '' || minimumStaff.value < 1) {
    event.preventDefault();
    dialog.showErrorBox('Invalid minimum staff.', 'Please input a valid minimum staff (positive value).');
    return true;
  }
  var newcapacity = capacity.value;
  if (newcapacity === null || newcapacity === '' || newcapacity.value < 1) {
    event.preventDefault();
    dialog.showErrorBox('Invalid capacity.', 'Please input a valid capacity (positive value).');
    return true;
  }
  var description = desc.value;
  if (description === null || description === '') {
    event.preventDefault();
    dialog.showErrorBox('Invalid description.', 'Please input a valid description.');
    return true;
  }
  var newprice = price.value;
  if (newprice === null || newprice === '' || newprice.value < 0) {
    event.preventDefault();
    dialog.showErrorBox('Invalid price.', 'Please input a valid price (nonnegative value).');
    return true;
  }

  var checked = false;
  var number = 0;
  var sitesList = [];
  checkboxes = document.getElementsByTagName("input");
  for (var i = 7; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      //console.log(table.childNodes[i-3]);
      var row = table.childNodes[i-7];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          var sitesName = row.childNodes[j].innerText;
          sitesList.push(sitesName);
          number++;
          break;
          //ipc.send("error-log", "USER: " + user2Approve);
        }
      }
      //break;
    }
  }
  console.log(sitesList);

  if (!checked) {
    event.preventDefault();
    dialog.showErrorBox('No staff selected.', 'Please select staff.');
    return true;
  }

  if (number < minimumStaff) {
    event.preventDefault();
    dialog.showErrorBox('Staff Minimum of ' + minimumStaff'.', 'Please select more staff.');
    return true;
  }

  var error = false;

  editTransit(function(err) {
    if (!err) {
      dialog.showMessageBox(null, options, (response) => {
        console.log(response);
        ipc.send("load-page", 'file://' + __dirname + '/manageTransit.html', 705, 700);
        remote.getCurrentWindow().close();
      });
    }
  }, manager, error);
  event.preventDefault();

  // const modalPath = path.join('file://', __dirname, 'editTransit.html')
  // ipc.send("load-page-transit", modalPath, 500, 625, transitName);
  // remote.getCurrentWindow().close();
});

function editTransit(callback, mnger, error) {

  // Add the credentials to access your database
  const connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'test',
      database : 'beltline',
      insecureAuth : true
  });

  // connect to mysql
  connection.connect(function (err) {
      // in case of error
      if(err){
          console.log(err.code);
          console.log(err.fatal);
      }
  });

  // Perform a query
  $queryLog = 'CALL create_event("'+mnger+'", "'+newroute+'", "'+newprice+'")';
  connection.query($queryLog, function(err, result) {
      if(err){
        if (err.code === 'ER_DUP_ENTRY') {
           dialog.showErrorBox('Duplicate transit type and route.', 'Make sure route name and type is unique.')
           error = true;
        }
        ipc.send("error-log", err);
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){
            // The connection has been closed
        });
        return;
      }

      console.log("Got to before inserting connect.");

      $query = 'INSERT INTO `transit_connect` (TYPE, ROUTE, SITENAME) VALUES ?';
      connection.query($query, [values], function(err, result) {
          if(err) {
            error = true;
            // if (err.code === 'ER_DUP_ENTRY') {
            //    dialog.showErrorBox('Duplicate email(s).', 'Make sure emails are unique and try again.')
            //    error = true;
            //
            //    $query = 'INSERT INTO `email` (USERNAME, EMAIL) VALUES ?';
            //    connection.query($query, [oldValues], function(err, result) {
            //        if(err) {
            //          console.log("An error occurred performing the query.");
            //          console.log(err);
            //          ipc.send("error-log", err);
            //          connection.end(function(){
            //              // The connection has been closed
            //          });
            //
            //          //callback(error);
            //          return;
            //        }
            //
            //        connection.end(function() {
            //             // The connection has been closed
            //        });
            //
            //    });
            // }
            callback(error);
          }

          console.log("Finished connect.");

          connection.end(function() {
               // The connection has been closed
          });
          callback(error);
      });

  });

  return;
}

function insertStaff(callback, start, end) {

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

  $queryTransits = 'CALL get_staff_list("'+start+'", "'+end+'")';
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
  ipc.send("load-page", 'file://' + __dirname + '/manageEvent.html', 750, 850);
  remote.getCurrentWindow().close();
})
