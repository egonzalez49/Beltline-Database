const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const dropdown = document.getElementById('dropdown')
const transportType = document.getElementById('transportType')
const startDate = document.getElementById('startDate')
const endDate = document.getElementById('endDate')
const routeName = document.getElementById('routeName')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const backBtn = document.getElementById('cancelBtn')
var sDate;
var eDate;
var sortD = 0;
var sortR = 0;
var sortTT = 0;
var sortP = 0;
var arrowD = document.getElementById('sortD');
var arrowR = document.getElementById('sortR');
var arrowTT = document.getElementById('sortTT');
var arrowP = document.getElementById('sortP');
//var arrowSC = document.getElementById('sortSC');


const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Logged!',
    detail: 'Successfully logged transit.',
};


//Validates the price range. Returns false if no errors.
function validateDate() {
  //ipc.send("error-log", dates.compare(sDate, eDate));
  if (sDate > eDate) {
    dialog.showErrorBox('Incorrect date range.', 'Make sure the date range is valid.');
    return true;
  }

  //console.log("Range: " + lPrice + " - " + hPrice);

  //No errors. Return false.
  return false;
}

function sorting(value) {
  ipc.send("error-log", value);
  if (value === 1) {
    if (sortD === 0) {
      sortD = 1; //down arrow
      arrowD.className = "icon icon-down-dir"
    } else {
      sortD = 0;
      arrowD.className = "icon icon-up-dir"
    }
  } else if (value === 2) {
    if (sortR === 0) {
      sortR = 1;
      arrowR.className = "icon icon-up-dir"
    } else {
      sortR = 0;
      arrowR.className = "icon icon-down-dir"
    }
  } else if (value === 3) {
    if (sortTT === 0) {
      sortTT = 1;
      arrowTT.className = "icon icon-up-dir"
    } else {
      sortTT = 0;
      arrowTT.className = "icon icon-down-dir"
    }
  } else if (value === 4) {
    if (sortP === 0) {
      sortP = 1;
      arrowP.className = "icon icon-up-dir"
    } else {
      sortP = 0;
      arrowP.className = "icon icon-down-dir"
    }
  }
  filterBtn.click();
}

filterBtn.addEventListener("click", function() {
  sDate = startDate.value;
  eDate = endDate.value;

  if (sDate === null || sDate === "" || eDate === null || eDate === "") {
    dialog.showErrorBox('Date fields not filled in.', 'Please select a start and end date.');
    return true;
  }



  var transport = transportType.value;
  var site = dropdown.value;
  var route = routeName.value;
  ipc.send("error-log", "ROUTE: " + route);
  if (route === "") {
    route = null;
    ipc.send("error-log", "ROUTE: " + route);
  }

  //Make sure prices are valid.
  if (validateDate()) {
    return;
  }

  insertTransits(function(rows) {
    //Remove all table rows (except header)
    //ipc.send("error-log", rows);

    //Insert new rows
    var i = 0;
    rows = rows[0];
    if (rows.length === 0) {
      dialog.showErrorBox('No results.', 'No results match the filter constraints.');
    } else {
      while (table.firstChild) {
        table.removeChild(table.firstChild);
      }
      rows.forEach(function(transit) {
        var row = table.insertRow(i);
        //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
        ipc.send("error-log", transit);

        var route = row.insertCell(0);
        var type = row.insertCell(1);
        var price = row.insertCell(2);
        var count = row.insertCell(3);

        //var routeText  = document.createTextNode('' + transit.ROUTE);
        route.innerHTML =  "" + transit.DATE.toISOString().split('T')[0];
        //route.appendChild(routeText);

        type.appendChild(document.createTextNode("" + transit.ROUTE));
        price.appendChild(document.createTextNode("" + transit.TYPE));
        count.appendChild(document.createTextNode("" + transit.PRICE));
        i++;
      });
    }
  }, userName, transport, site, sDate, eDate, route, sortD, sortR, sortTT, sortP);

  event.preventDefault();
});

var userName;

ipc.on("userName", function(event, name) {
  userName = name;
});

window.addEventListener("load", function() {
  console.log("Ran load code.")
  ipc.send("update-username-value");
  //Populate the dropdown for sites.
  const dropdownToPopulate = document.getElementById('dropdown');
  insertSites(function(siteList) {
    ipc.send("error-log", siteList);
    siteList.forEach(function(site) {
      //Create new dropdown item
      var element = document.createElement("option");
      element.textContent = site.SITENAME;
      element.value = site.SITENAME;
      dropdownToPopulate.appendChild(element);
    });
  });
});


function insertTransits(callback, user, transport, site, stDate, enDate, route, sortDate, sortRoute, sortTransport, sortPrice) {

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

  //if site is null, check
  $queryTransits = 'CALL transit_history("'+user+'", "'+transport+'", "'+route+'", "'+stDate+'", "'+enDate+'", "'+site+'", "'+sortDate+'", "'+sortRoute+'", "'+sortTransport+'", "'+sortPrice+'")';
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
