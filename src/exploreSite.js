const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const dropdown = document.getElementById('dropdown')
const dropdown2 = document.getElementById('dropdown2')
const start = document.getElementById('startDate')
const end = document.getElementById('endDate')
const lV = document.getElementById('lowVisit')
const hV = document.getElementById('highVisit')
const lE = document.getElementById('lowEvent')
const hE = document.getElementById('highEvent')
const visitCheck = document.getElementById('visited')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const backBtn = document.getElementById('cancelBtn')
const viewBtn = document.getElementById('viewBtn')
const transitBtn = document.getElementById('transitBtn')
//var eSearch;
var sSearch;
var open;
var startDate;
var endDate;
var lowVisits;
var highVisits;
var lowEvent;
var highEvent;
var visit;
var sort1 = -1;
var sort2 = -1;
var sort3 = -1;
var sort4 = -1;
var arrow1 = document.getElementById('sort1');
var arrow2 = document.getElementById('sort2');
var arrow3 = document.getElementById('sort3');
var arrow4 = document.getElementById('sort4');

var userName;

ipc.on("userName", function(event, name) {
  userName = name;
  insertSites(function(rows) {
    //rows = rows[0];
    rows.forEach(function(site) {
      //Create new dropdown item
      var element = document.createElement("option");
      element.textContent = site.SITENAME;
      element.value = site.SITENAME;
      dropdown.appendChild(element);
    });
  });
});

//Validates the filter data to make sure no errors.
function validateData() {
  //When the range is left empty, do the following:
  if (lowVisits === null || lowVisits === "") {
    lowVisits = 0;
  }

  if (highVisits === null || highVisits === "") {
    highVisits = 9999;
  }

  //When the range is left empty, do the following:
  if (lowEvent === null || lowEvent === "") {
    lowEvent = 0;
  }

  if (highEvent === null || highEvent === "") {
    highEvent = 999;
  }

  if (lowVisits > highVisits) {
    dialog.showErrorBox('Incorrect visits range.', 'Make sure the visits range is valid.');
    return true;
  } else if (lowVisits < 0 || highVisits < 0) {
    dialog.showErrorBox('Incorrect visits range.', 'Make sure the visits are positive or zero.');
    return true;
  }

  if (lowEvent > highEvent) {
    dialog.showErrorBox('Incorrect event range.', 'Make sure the event range is valid.');
    return true;
  } else if (lowEvent < 0 || highEvent < 0) {
    dialog.showErrorBox('Incorrect event range.', 'Make sure the event ranges are positive or zero.');
    return true;
  }

  if (startDate === null || startDate === "") {
    startDate = "1900-10-10";
  }

  if (endDate === null || endDate === "") {
    endDate = "2220-10-10";
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
  }

  filterBtn.click();
}

//var dates = [];
filterBtn.addEventListener("click", function() {
  //Set values of all variables and do testing.
  sSearch = dropdown.value;
  open = dropdown2.value;
  if (open === "Yes" || open === "yes") {
    open = "y";
  } else if (open === "No" || open === "no") {
    open = "n";
  }
  startDate = start.value;
  endDate = end.value;
  lowVisits = lV.value;
  highVisits = hV.value;
  lowEvent = lE.value;
  highEvent = hE.value;
  visit = visitCheck.checked;

  if (visit) {
    visit = 1;
  } else {
    visit = 0;
  }

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

        //var routeText  = document.createTextNode('' + transit.ROUTE);
        c1.innerHTML =  "<input type='radio' name='radios'>" + e.SITENAME;
        //route.appendChild(routeText);

        c2.appendChild(document.createTextNode("" + e.EVENTCOUNT));
        c3.appendChild(document.createTextNode("" + e.TOTALVISITS));
        c4.appendChild(document.createTextNode("" + e.MYVISIT));

        //dates.push(e.STARTDATE);
        i++;
      });
    }
  });

  event.preventDefault();
});

viewBtn.addEventListener("click", function() {
  var checked = false;
  var sName;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 7; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //var sDate = dates[i-7];
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      var row = table.childNodes[i-7];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          sName = row.childNodes[j].innerText;
          break;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].textContent);
        }
      }
      break;
    }
  }

  if (!checked) {
    event.preventDefault();
    dialog.showErrorBox('No site selected.', 'Please select a site.');
    return true;
  }

    const modalPath = path.join('file://', __dirname, 'visitorSiteDetail.html')
    ipc.send("load-page-site", modalPath, 700, 725, sName);
    //ipc.send("error-log", "GOT HERE");
    remote.getCurrentWindow().close();
});

transitBtn.addEventListener("click", function() {
  var checked = false;
  var sName;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 7; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //var sDate = dates[i-7];
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      var row = table.childNodes[i-7];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          sName = row.childNodes[j].innerText;
          break;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].textContent);
        }
      }
      break;
    }
  }

  if (!checked) {
    event.preventDefault();
    dialog.showErrorBox('No site selected.', 'Please select a site.');
    return true;
  }

    const modalPath = path.join('file://', __dirname, 'visitorTransitDetail.html')
    ipc.send("load-page-site", modalPath, 700, 725, sName);
    //ipc.send("error-log", "GOT HERE");
    remote.getCurrentWindow().close();
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

  $queryTransits = 'CALL explore_site_visitor("'+userName+'", "'+sSearch+'", "'+open+'", "'+startDate+'", "'+endDate+'", "'+lowVisits+'", "'+highVisits+'", "'+lowEvent+'", "'+highEvent+
  '", "'+visit+'", "'+sort1+'", "'+sort2+'", "'+sort3+'", "'+sort4+'")';
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
