const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const dropdown = document.getElementById('dropdown')
const eName = document.getElementById('eventName')
const desc = document.getElementById('descWord')
const start = document.getElementById('startDate')
const end = document.getElementById('endDate')
const lV = document.getElementById('lowVisit')
const hV = document.getElementById('highVisit')
const lP = document.getElementById('lowPrice')
const hP = document.getElementById('highPrice')
const visitCheck = document.getElementById('visited')
const soldCheck = document.getElementById('sold')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const backBtn = document.getElementById('cancelBtn')
const viewBtn = document.getElementById('viewBtn')
var eSearch;
var sSearch;
var descSearch;
var startDate;
var endDate;
var lowVisits;
var highVisits;
var lowPrice;
var highPrice;
var visit;
var sold;
var sortName = -1;
var sortStaff = -1;
var sortDay = -1;
var sortVisits = -1;
var sortRevenue = -1;
var sort6 = -1;
var arrowName = document.getElementById('sortEvent');
var arrowStaff = document.getElementById('sortSite');
var arrowDay = document.getElementById('sortPrice');
var arrowVisit = document.getElementById('sortRemain');
var arrowRev = document.getElementById('sortVisits');
var arrow6 = document.getElementById('sortMy');

var userName;

ipc.on("userName", function(event, name) {
  userName = name;
});

ipc.on("dailyevent2", function(event, name) {
  //userName = name;
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
  if (lowPrice === null || lowPrice === "") {
    lowPrice = 0;
  }

  if (highPrice === null || highPrice === "") {
    highPrice = 999;
  }

  if (lowVisits > highVisits) {
    dialog.showErrorBox('Incorrect visits range.', 'Make sure the visits range is valid.');
    return true;
  } else if (lowVisits < 0 || highVisits < 0) {
    dialog.showErrorBox('Incorrect visits range.', 'Make sure the visits are positive or zero.');
    return true;
  }

  if (lowPrice > highPrice) {
    dialog.showErrorBox('Incorrect price range.', 'Make sure the price range is valid.');
    return true;
  } else if (lowPrice < 0 || highPrice < 0) {
    dialog.showErrorBox('Incorrect price range.', 'Make sure the prices are positive or zero.');
    return true;
  }

  //No name to search with filter.
  if (eSearch === null || eSearch === '') {
    eSearch = 'null';
  }

  //No description to search with filter.
  if (descSearch === null || descSearch === '') {
    descSearch = 'null';
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
      arrowStaff.className = "icon icon-up-dir";
    } else if (sortStaff === 0) {
      sortStaff = 1; //down arrow
      arrowStaff.className = "icon icon-down-dir";
    } else if (sortStaff === 1) {
      sortStaff = -1;
      arrowStaff.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 3) {
    if (sortDay === -1) {
      sortDay = 0;
      arrowDay.className = "icon icon-up-dir";
    } else if (sortDay === 0) {
      sortDay = 1; //down arrow
      arrowDay.className = "icon icon-down-dir";
    } else if (sortDay === 1) {
      sortDay = -1;
      arrowDay.className = "icon icon-arrow-combo";
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
      arrowRev.className = "icon icon-up-dir";
    } else if (sortRevenue === 0) {
      sortRevenue = 1; //down arrow
      arrowRev.className = "icon icon-down-dir";
    } else if (sortRevenue === 1) {
      sortRevenue = -1;
      arrowRev.className = "icon icon-arrow-combo";
      return;
    }
  }
  filterBtn.click();
}

var dates = [];
filterBtn.addEventListener("click", function() {
  //Set values of all variables and do testing.
  eSearch = eName.value;
  sSearch = dropdown.value;
  descSearch = desc.value;
  startDate = start.value;
  endDate = end.value;
  lowVisits = lV.value;
  highVisits = hV.value;
  lowPrice = lP.value;
  highPrice = hP.value;
  visit = visitCheck.checked;
  if (visit) {
    visit = 1;
  } else {
    visit = 0;
  }
  sold = soldCheck.checked;
  if (sold) {
    sold = 1;
  } else { sold = 0;}

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
        var c6 = row.insertCell(5);

        //var routeText  = document.createTextNode('' + transit.ROUTE);
        c1.innerHTML =  "<input type='radio' name='radios'>" + e.EVENTNAME;
        //route.appendChild(routeText);

        c2.appendChild(document.createTextNode("" + e.SITENAME));
        c3.appendChild(document.createTextNode("" + e.PRICE));
        c4.appendChild(document.createTextNode("" + e.REMAIN));
        c5.appendChild(document.createTextNode("" + e.TOTALVISITS));
        c6.appendChild(document.createTextNode("" + e.MYVISIT));

        dates.push(e.STARTDATE);
        i++;
      });
    }
  });

  event.preventDefault();
});

viewBtn.addEventListener("click", function() {
  var checked = false;
  var sDate;
  var eName;
  var sName;
  var ticket;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 10; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      var sDate = dates[i-10];
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      var row = table.childNodes[i-10];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          eName = row.childNodes[j].innerText;
          //break;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].textContent);
        } else if (j === 1) {
          sName = row.childNodes[j].textContent;
          //ipc.send("error-log", "ROUTE: " + row.childNodes[j].innerText);
        } else if (j === 3) {
          ticket = row.childNodes[j].textContent;
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

    const modalPath = path.join('file://', __dirname, 'visitorEventDetail.html')
    ipc.send("load-page-dailyevent2", modalPath, 700, 725, eName, sName, sDate, ticket);
    //ipc.send("error-log", "GOT HERE");
    remote.getCurrentWindow().close();
});

window.addEventListener("load", function() {
  ipc.send("update-dailyevent2-value");
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

  $queryTransits = 'CALL event_detail("'+userName+'", "'+eSearch+'", "'+sSearch+'", "'+startDate+'", "'+endDate+'", "'+descSearch+'", "'+lowVisits+'", "'+highVisits+'", "'+lowPrice+'", "'+highPrice+
  '", "'+visit+'", "'+sold+'", "'+sortName+'", "'+sortStaff+'", "'+sortDay+'", "'+sortVisits+'", "'+sortRevenue+'", "'+sort6+'")';
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
