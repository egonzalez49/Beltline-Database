const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const dropdown = document.getElementById('dropdown2')
const sName = document.getElementById('siteName')
const table = document.getElementById('tBody')
const visitDate = document.getElementById('logDate')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const backBtn = document.getElementById('cancelBtn')
const logBtn = document.getElementById('logBtn')
//var eSearch;
var nameOfSite;
var type;
var sort1 = -1;
var sort2 = -1;
var sort3 = -1;
var arrow1 = document.getElementById('sort1');
var arrow2 = document.getElementById('sort2');
var arrow3 = document.getElementById('sort3');

const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Logged!',
    detail: 'Successfully logged transit.',
};

var userName;

ipc.on("userName", function(event, name) {
  userName = name;
});

ipc.on("site", function(event, p1) {
  nameOfSite = p1;
  sName.innerHTML = "" + nameOfSite;
  filter();
});

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
  }

  filter();
}

//var dates = [];
function filter() {
  //Set values of all variables and do testing.
  type = dropdown.value;
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

        //var routeText  = document.createTextNode('' + transit.ROUTE);
        c1.innerHTML =  "<input type='radio' name='radios'>" + e.ROUTE;
        //route.appendChild(routeText);

        c2.appendChild(document.createTextNode("" + e.TYPE));
        c3.appendChild(document.createTextNode("" + e.PRICE));
        c4.appendChild(document.createTextNode("" + e.CONNECTED));

        //dates.push(e.STARTDATE);
        i++;
      });
    }
  });
}

logBtn.addEventListener("click", function() {
  var logDate = visitDate.value;
  if (logDate === null || logDate === "") {
    dialog.showErrorBox('No date selected.', 'Please select a date.');
    return true;
  }

  var checked = false;
  var routeName;
  var type2;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //var sDate = dates[i-7];
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      var row = table.childNodes[i];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          routeName = row.childNodes[j].innerText;
          //break;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].textContent);
        } else if (j === 1) {
          type2 = row.childNodes[j].innerText;
          break;
        }
      }
      break;
    }
  }

  if (!checked) {
    event.preventDefault();
    dialog.showErrorBox('No transit selected.', 'Please select a transit.');
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
  }, logDate, type2, routeName, error);
  event.preventDefault();
});


function logVisit(callback, d, t, r, error) {

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

  $queryTransits = 'CALL log_transit("'+userName+'", "'+t+'", "'+r+'", "'+d+'")';
  ipc.send("error-log", $queryTransits);
  connection.query($queryTransits, function(err, rows, result) {
      if(err){
        ipc.send("error-log", err);
        console.log("An error occurred performing the query.");
        dialog.showErrorBox('Error.', 'Cannot take same transit twice in a day.');
        console.log(err);
        error = true;
        connection.end(function(){});
        callback(error);
        return;
      }
      ipc.send("error-log", rows);
      connection.end(function(){});
      callback(error);
  });

  return;
}

window.addEventListener("load", function() {
  ipc.send("update-site-value");
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

  $queryTransits = 'CALL insert_transit_detail("'+nameOfSite+'", "'+type+'", "'+sort1+'", "'+sort2+'", "'+sort3+'")';
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
