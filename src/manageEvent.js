const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const filterName = document.getElementById('eventName')
const filterDesc = document.getElementById('descWord')
const filterStartDate = document.getElementById('startDate')
const filterEndDate = document.getElementById('endDate')
const filterLowDuration = document.getElementById('lowDuration')
const filterHighDuration = document.getElementById('highDuration')
const filterLowVisit = document.getElementById('lowVisit')
const filterHighVisit = document.getElementById('highVisit')
const filterLowRevenue = document.getElementById('lowRevenue')
const filterHighRevenue = document.getElementById('highRevenue')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const backBtn = document.getElementById('cancelBtn')
const createBtn = document.getElementById('createBtn')
const editBtn = document.getElementById('editBtn')
const deleteBtn = document.getElementById('deleteBtn')
var nameSearch;
var descSearch;
var startDate;
var endDate;
var lDuration;
var hDuration;
var lVisit;
var hVisit;
var lRev;
var hRev;
var sort1 = -1;
var sort2 = -1;
var sort3 = -1;
var sort4 = -1;
var sort5 = -1;
var arrow1 = document.getElementById('sortName');
var arrow2 = document.getElementById('sortStaff');
var arrow3 = document.getElementById('sortDay');
var arrow4 = document.getElementById('sortVisits');
var arrow5 = document.getElementById('sortRevenue');
var userName;
var managerSite;

ipc.on("userName", function(event, name) {
  userName = name;
  getManagerSite(function(row) {
    managerSite = row[0][0].SITENAME;
    console.log("SITE: " + managerSite);
  }, userName);
  console.log("MANAGER: " + userName);
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
  //When the range is left empty, do the following:
  if (lDuration === null || lDuration === "") {
    lDuration = 0;
  }

  if (hDuration === null || hDuration === "") {
    hDuration = 999;
  }

  //When the range is left empty, do the following:
  if (lVisit === null || lVisit === "") {
    lVisit = 0;
  }

  if (hVisit === null || hVisit === "") {
    hVisit = 999;
  }

  //When the range is left empty, do the following:
  if (lRev === null || lRev === "") {
    lRev = 0.00;
  }

  if (hRev === null || hRev === "") {
    hRev = 9999.00;
  }

  if (lDuration > hDuration) {
    dialog.showErrorBox('Incorrect duration range.', 'Make sure the duration range is valid.');
    return true;
  } else if (lDuration < 0 || hDuration < 0) {
    dialog.showErrorBox('Incorrect duration range.', 'Make sure the durations are positive or zero.');
    return true;
  }

  if (lVisit > hVisit) {
    dialog.showErrorBox('Incorrect visit range.', 'Make sure the visit range is valid.');
    return true;
  } else if (lVisit < 0 || hVisit < 0) {
    dialog.showErrorBox('Incorrect visit range.', 'Make sure the visits are positive or zero.');
    return true;
  }

  if (lRev > hRev) {
    dialog.showErrorBox('Incorrect revenue range.', 'Make sure the revenue range is valid.');
    return true;
  } else if (lRev < 0 || hRev < 0) {
    dialog.showErrorBox('Incorrect revenue range.', 'Make sure the revenues are positive or zero.');
    return true;
  }

  //No name to search with filter.
  if (nameSearch === null || nameSearch === '') {
    nameSearch = 'null';
  }

  //No description to search with filter.
  if (descSearch === null || descSearch === '') {
    descSearch = 'null';
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

  //console.log("Range: " + lPrice + " - " + hPrice);

  //No errors. Return false.
  return false;
}

//Deals with sorting arrows. 0 means sort ASC, 1 means DESC.
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
      } else if (value === 4) {
          if (sort4 === -1) {
            sort4 = 0;
            arrow4.className = "icon icon-up-dir";
          } else if (sort4 === 0) {
            sort4 = 1; //down arrow
            arrow4.className = "icon icon-down-dir";
          } else if (sort4 === 1) {
            sort4 = -1;
            arrow4.className = "icon icon-arrow-combo";
          }
      } else if (value === 5) {
        if (sort5 === -1) {
          sort5 = 0;
          arrow5.className = "icon icon-up-dir";
        } else if (sort5 === 0) {
          sort5 = 1; //down arrow
          arrow5.className = "icon icon-down-dir";
        } else if (sort5 === 1) {
          sort5 = -1;
          arrow5.className = "icon icon-arrow-combo";
        }
      }
  filterBtn.click();
}

var dates = [];
filterBtn.addEventListener("click", function() {
  //Set values of all variables and do testing.
  nameSearch = filterName.value;
  descSearch = filterDesc.value;
  startDate = filterStartDate.value;
  endDate = filterEndDate.value;

  //All the range variables.
  lDuration = filterLowDuration.value;
  hDuration = filterHighDuration.value;
  lVisit = filterLowVisit.value;
  hVisit = filterHighVisit.value;
  lRev = filterLowRevenue.value;
  hRev = filterHighRevenue.value;

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
      dates = [];
      rows.forEach(function(e) {
        var row = table.insertRow(i);
        //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
        ipc.send("error-log", e);

        var c1 = row.insertCell(0);
        var c2 = row.insertCell(1);
        var c3 = row.insertCell(2);
        var c4 = row.insertCell(3);
        var c5 = row.insertCell(4);

        //var routeText  = document.createTextNode('' + transit.ROUTE);
        c1.innerHTML =  "<input type='radio' name='radios'>" + e.EVENTNAME;
        //route.appendChild(routeText);

        c2.appendChild(document.createTextNode("" + e.STAFFCOUNT));
        c3.appendChild(document.createTextNode("" + e.DURATION));
        c4.appendChild(document.createTextNode("" + e.TOTALVISITS));
        c5.appendChild(document.createTextNode("" + e.TOTALREVENUE));

        dates.push(e.STARTDATE.toISOString().split('T')[0]);
        i++;
      });
      console.log(dates);
    }
  }, nameSearch, descSearch, startDate, endDate, lDuration, hDuration, lVisit, hVisit, lRev, hRev, sort1, sort2, sort3, sort4, sort5);

  event.preventDefault();
});

createBtn.addEventListener("click", function() {
  //var checked = false;
  var name2send = null;
  var date2send = null;
  // checkboxes = document.getElementsByTagName("input");
  // for (var i = 3; i < checkboxes.length; i++) {
  //   var checkbox = checkboxes[i];
  //   if(checkbox.checked) {
  //     checked = true;
  //     //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
  //     //console.log(table.childNodes[i-3]);
  //     var row = table.childNodes[i-3];
  //     //ipc.send("error-log", "row length" + row.childNodes.length);
  //     for (var j = 0; j < row.childNodes.length; j++) {
  //       if (j === 0) {
  //         route2send = row.childNodes[j].innerText;
  //         //break;
  //         //ipc.send("error-log", "USER: " + user2Approve);
  //       } else if (j === 1) {
  //         type2send = row.childNodes[j].innerText;
  //         break;
  //       }
  //     }
  //     break;
  //   }
  // }
  //
  // if (!checked) {
  //   event.preventDefault();
  //   dialog.showErrorBox('No transit selected.', 'Please select a transit.');
  //   return true;
  // }
  const modalPath = path.join('file://', __dirname, 'createEvent.html')
  ipc.send("load-page-event", modalPath, 600, 825, name2send, date2send);
  remote.getCurrentWindow().close();
});

editBtn.addEventListener("click", function() {
  var checked = false;
  var name2send = null;
  var date2send = null;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 10; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    date2send = dates[i-10];
    if(checkbox.checked) {
      checked = true;
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      //console.log(table.childNodes[i-3]);
      var row = table.childNodes[i-10];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          name2send = row.childNodes[j].innerText;
          //break;
          //ipc.send("error-log", "USER: " + user2Approve);
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
  const modalPath = path.join('file://', __dirname, 'editEvent.html')
  ipc.send("load-page-event", modalPath, 700, 800, name2send, date2send);
  remote.getCurrentWindow().close();
});

//TODO --------------------------------------------------------------------------
deleteBtn.addEventListener("click", function() {
  var checked = false;
  var event2delete;
  var date2delete;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 10; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      date2delete = dates[i-10];
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      var row = table.childNodes[i-10];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          event2delete = row.childNodes[j].innerText;
          break;
          //ipc.send("error-log", "USER: " + user2Approve);
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

    var error = false;
    removeTransit(function(err) {
      if (!err) {
        dialog.showMessageBox(null, options, (response) => {
          console.log(response);
        });
      }
    }, event2delete, date2delete, error);
    //event.preventDefault();
});

function removeTransit(callback, e2, d2, error) {

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

  $queryUsers = 'CALL delete_event("'+e2+'", "'+d2+'", "'+managerSite+'")';
  connection.query($queryUsers, function(err, rows, result) {
      if(err){
        ipc.send("error-log", err);
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

function logTransit(callback, user, type, route, date, error) {

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
  $queryLog = 'CALL log_transit("'+user+'", "'+type+'", "'+route+'", "'+date+'")';
  connection.query($queryLog, function(err, result) {
      if(err){
        if (err.code === 'ER_DUP_ENTRY') {
          dialog.showErrorBox('Duplicate log entry.', 'Cannot take the same transit on the same date.')
          error = true;
          callback(error);
        }
        ipc.send("error-log", err);
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){
            // The connection has been closed
        });
        return;
      }

      callback(error);
      connection.end(function(){
          // The connection has been closed
      });
  });

  return;
}


window.addEventListener("load", function() {
  ipc.send("update-username-value");
});


function insertEvents(callback, searchName, searchDesc, searchSDate, searchEDate, searchLDur, searchHDur, searchLVis, searchHVis, searchLRev, searchHRev,
  sortName, sortStaff, sortDay, sortVisits, sortRevenue) {

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

  $queryTransits = 'CALL event_search("'+userName+'", "'+managerSite+'", "'+searchName+'", "'+searchDesc+'", "'+searchSDate+'", "'+searchEDate+'", "'+searchLDur+'", "'+searchHDur+'", "'+searchLRev+'", "'+searchHRev+'", "'+searchLVis+'", "'+searchHVis+'", "'+sortName
  +'", "'+sortStaff+'", "'+sortDay+'", "'+sortVisits+'", "'+sortRevenue+'")';
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


function insertSites(callback) {

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

  $querySites = 'SELECT `SITENAME` FROM `site`';
  connection.query($querySites, function(err, sites, result) {
      if(err){
        ipc.send("error-log", err);
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){});
        return;
      }
      callback(sites);
      connection.end(function(){});
  });

  return;
}


backBtn.addEventListener('click', function() {
  ipc.send("load-back-page");
  //ipc.send("load-page", 'file://' + __dirname + '/main.html', 500, 425);
  remote.getCurrentWindow().close();
})
