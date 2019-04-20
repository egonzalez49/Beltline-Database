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
const lD = document.getElementById('lowVisit')
const hD = document.getElementById('highVisit')
const lR = document.getElementById('lowRev')
const hR = document.getElementById('highRev')
const table = document.getElementById('tBody')
const table2 = document.getElementById('tBody2')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const updateBtn = document.getElementById('updateBtn')
const backBtn = document.getElementById('cancelBtn')
var lowDaily;
var highDaily;
var lowRev;
var highRev;
var newDesc;
var getStaffStartDate = null;
var getStaffEndDate = null;

var eventName;
var eventDate;
var eventEnd;
var manager;
var managerSite = null;
var userNames = [];
var sort1 = -1;
var sort2 = -1;
var sort3 = -1;
var arrow1 = document.getElementById('sort1');
var arrow2 = document.getElementById('sort2');
var arrow3 = document.getElementById('sort3');

window.addEventListener("load", function() {
  //console.log("Ran load code.")
  ipc.send("update-event-value");
});

function sorting(value) {
  ipc.send("error-log", value);
  if (value === 1) {
    if (sort1 === -1) {
      sort1 = 0;
      arrow1.className = "icon icon-up-dir";
    } else if (sort1 === 0) {
      sort1 = 1; //down arrow
      arrow1.className = "icon icon-down-dir";
    } else if (sort1 === 1) {
      sort1 = -1;
      arrow1.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 2) {
      if (sort2 === -1) {
        sort2 = 0;
        arrow2.className = "icon icon-up-dir";
      } else if (sort2 === 0) {
        sort2 = 1; //down arrow
        arrow2.className = "icon icon-down-dir";
      } else if (sort2 === 1) {
        sort2 = -1;
        arrow2.className = "icon icon-arrow-combo";
      }
    } else if (value === 3) {
        if (sort3 === -1) {
          sort3 = 0;
          arrow3.className = "icon icon-up-dir";
        } else if (sort3 === 0) {
          sort3 = 1; //down arrow
          arrow3.className = "icon icon-down-dir";
        } else if (sort3 === 1) {
          sort3 = -1;
          arrow3.className = "icon icon-arrow-combo";
        }
      }
  filterBtn.click();
}

filterBtn.addEventListener("click", function() {
  lowDaily = lD.value;
  highDaily = hD.value;
  lowRev = lR.value;
  highRev = hR.value;
  if (lowDaily === null || lowDaily === "") {
    lowDaily = 0;
  }
  if (highDaily === null || highDaily === "") {
    highDaily = 999;
  }

  if (lowRev === null || lowRev === "") {
    lowRev = 0.00;
  }
  if (highRev === null || highRev === "") {
    highRev = 9999.00;
  }

  if (lowDaily > highDaily) {
    dialog.showErrorBox('Incorrect range.', 'Make sure the daily range is correct (first value less than second).');
    return true;
  }

  if (lowDaily < 0 || highDaily < 0) {
    dialog.showErrorBox('Incorrect range.', 'Make sure the daily values are positive or 0.');
    return true;
  }

  if (lowRev > highRev) {
    dialog.showErrorBox('Incorrect range.', 'Make sure the revenue range is correct (first value less than second).');
    return true;
  }

  if (lowRev < 0 || highRev < 0) {
    dialog.showErrorBox('Incorrect range.', 'Make sure the revenue values are positive or 0.');
    return true;
  }


  insertDates(function(rows) {
    var i = 0;
    rows = rows[0];
    if (rows.length === 0) {
      dialog.showErrorBox('No results.', 'No results match the filter constraints.');
    } else {
      while (table2.firstChild) {
        table2.removeChild(table2.firstChild);
      }
      dates = [];
      rows.forEach(function(e) {
        var row = table2.insertRow(i);
        //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
        ipc.send("error-log", e);

        var c1 = row.insertCell(0);
        var c2 = row.insertCell(1);
        var c3 = row.insertCell(2);

        //var routeText  = document.createTextNode('' + transit.ROUTE);
        c1.innerHTML =  "" + e.DATE.toISOString().split('T')[0];
        //route.appendChild(routeText);

        c2.appendChild(document.createTextNode("" + e.DAILYVISITS));
        c3.appendChild(document.createTextNode("" + e.DAILYREVENUE));

        //dates.push(e.STARTDATE.toISOString().split('T')[0]);
        i++;
      });
    }
  });
  event.preventDefault();
});

const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Updated!',
    detail: 'Successfully updated event.',
};

ipc.on("event", function(event, name, type, man) {
  eventName = name;
  eventDate = type;
  manager = man;

  getManagerSite(function(row) {
    managerSite = row[0][0].SITENAME;
    console.log("SITENAME: " + row[0][0].SITENAME);
    console.log("EVENTNAME: " + eventName);
    console.log("EVENTDATE: " + eventDate);
    if (managerSite === null || managerSite === '' || managerSite === undefined) {
        dialog.showErrorBox('No manager site.', 'You do not manage any site.', (response) => {
          //backBtn.click();
          //ipc.send("load-page", 'file://' + __dirname + '/manageEvent.html', 750, 850);
          //remote.getCurrentWindow().close();
        });
        //createBtn.style.display = "none";

    }
    getInfo(function(row) {
      row = row[0];
      formName.innerHTML = "" + row[0].EVENTNAME;
      capacity.innerHTML = "" + row[0].CAPACITY;
      price.innerHTML = "" + row[0].PRICE;
      minStaff.innerHTML = "" + row[0].MINSTAFF;
      desc.innerHTML = "" + row[0].DESCRIPTION;
      e = row[0];
      startDate.innerHTML = "" + e.STARTDATE.toISOString().split('T')[0];
      endDate.innerHTML = "" + e.ENDDATE.toISOString().split('T')[0];
      var eventEnd = e.ENDDATE.toISOString().split('T')[0];
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
                if(userNames.includes(staff.USERNAME) === false) {
                var row = table.insertRow(i);
                    //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
                ipc.send("error-log", staff);

                var staffName = row.insertCell(0);

                    //var routeText  = document.createTextNode('' + transit.ROUTE);
                if ((staff.EVENTNAME === eventName) && (staff.SITENAME === managerSite) && (staff.STARTDATE.toISOString().split('T')[0] === eventDate)) {
                    staffName.innerHTML =  "<input type='checkbox' checked>" + staff.FNAME + " " + staff.LNAME;
                } else {
                  staffName.innerHTML =  "<input type='checkbox'>" + staff.FNAME + " " + staff.LNAME;
                }
                userNames.push(staff.USERNAME);
                    //route.appendChild(routeText);
                i++;
              } else if (((staff.EVENTNAME === eventName) && (staff.SITENAME === managerSite) && (staff.STARTDATE.toISOString().split('T')[0] === eventDate))) {
                var x = userNames.indexOf(staff.USERNAME);
                table.deleteRow(x);
                var row = table.insertRow(x);
                var staffName = row.insertCell(0);
                staffName.innerHTML = "<input type='checkbox' checked>" + staff.FNAME + " " + staff.LNAME;
              }
              });
            }
            console.log(userNames);
      }, eventDate, eventEnd);
    });

  }, manager);

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

var staff = [];
updateBtn.addEventListener("click", function() {
  var minimumStaff = minStaff.value;
  newDesc = desc.value;
  if (newDesc === null || newDesc === '') {
    event.preventDefault();
    dialog.showErrorBox('Invalid description.', 'Please input a valid description.');
    return true;
  }

  var checked = false;
  var number = 0;
  //var sitesList = [];
  checkboxes = document.getElementsByTagName("input");
  console.log(checkboxes.length);
  for (var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      //console.log(table.childNodes[i-3]);
      var row = table.childNodes[i];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          var sitesName = row.childNodes[j].innerText;
          staff.push(userNames[i]);
          number++;
          break;
          //ipc.send("error-log", "USER: " + user2Approve);
        }
      }
      //break;
    }
  }
  //console.log(sitesList);
  console.log(staff);

  if (!checked) {
    event.preventDefault();
    dialog.showErrorBox('No staff selected.', 'Please select staff.');
    return true;
  }

  if (number < minimumStaff) {
    event.preventDefault();
    dialog.showErrorBox('Staff Minimum of ' + minimumStaff + '.', 'Please select more staff.');
    return true;
  }

  var error = false;

  editTransit(function(err) {
    if (!err) {
      dialog.showMessageBox(null, options, (response) => {
        console.log(response);
        ipc.send("load-page", 'file://' + __dirname + '/manageEvent.html', 750, 850);
        remote.getCurrentWindow().close();
      });
    }
  }, error);
  //console.log("HERE");
  event.preventDefault();

  // const modalPath = path.join('file://', __dirname, 'editTransit.html')
  // ipc.send("load-page-transit", modalPath, 500, 625, transitName);
  // remote.getCurrentWindow().close();
});

function getInfo(callback) {

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

  $queryTransits = 'CALL get_event_info("'+eventName+'", "'+managerSite+'", "'+eventDate+'")';
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

function insertDates(callback) {

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

  $queryTransits = 'CALL get_dates("'+eventName+'","'+managerSite+'","'+eventDate+'","'+lowDaily+'","'+highDaily+'","'+lowRev+'","'+highRev+'","'+sort1+'","'+sort2+'","'+sort3+'")';
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

function editTransit(callback, error) {

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

  var values = [];
  staff.forEach(function (e) {
    values.push([e, ''+eventDate, ''+eventName, ''+managerSite]);
  });
  console.log(values);

  // Perform a query
  $queryLog = 'CALL edit_event("'+eventName+'", "'+managerSite+'", "'+eventDate+'", "'+newDesc+'");';
  connection.query($queryLog, function(err, result) {
      if(err){
        ipc.send("error-log", err);
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){
            // The connection has been closed
        });
        return;
      }

      //console.log("Got to before inserting connect.");

      $query = 'INSERT INTO `assign_to` (USERNAME, STARTDATE, EVENTNAME, SITENAME) VALUES ?';
      connection.query($query, [values], function(err, result) {
          if(err) {
            console.log(err);
            ipc.send("error-log", err);
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

          //console.log("Finished connect.");

          connection.end(function() {
               // The connection has been closed
          });
          callback(error);
      });

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

  $queryTransits = 'CALL get_staff_list2("'+eventName+'","'+managerSite+'","'+start+'", "'+end+'")';
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
