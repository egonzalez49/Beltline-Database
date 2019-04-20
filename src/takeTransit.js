const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const dropdown = document.getElementById('dropdown')
const transportType = document.getElementById('transportType')
const lowerPrice = document.getElementById('lowerPrice')
const higherPrice = document.getElementById('higherPrice')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const backBtn = document.getElementById('cancelBtn')
const logDate = document.getElementById('logDate')
const logBtn = document.getElementById('logBtn')
var lPrice;
var hPrice;
var sortTT = -1;
var sortP = -1;
var sortSC = -1;
var arrowTT = document.getElementById('sortTT');
var arrowP = document.getElementById('sortP');
var arrowSC = document.getElementById('sortSC');


const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Logged!',
    detail: 'Successfully logged transit.',
};


//Validates the price range. Returns false if no errors.
function validatePrice() {
  //When the range is left empty, do the following:
  if (lPrice === null || lPrice === "") {
    lPrice = 0.00;
  }

  if (hPrice === null || hPrice === "") {
    hPrice = 99;
  }

  if (lPrice > hPrice) {
    dialog.showErrorBox('Incorrect price range.', 'Make sure the price range is valid.');
    return true;
  } else if (lPrice < 0 || hPrice < 0) {
    dialog.showErrorBox('Incorrect price range.', 'Make sure the prices are positive or zero.');
    return true;
  }

  console.log("Range: " + lPrice + " - " + hPrice);

  //No errors. Return false.
  return false;
}

function sorting(value) {
  ipc.send("error-log", value);
  if (value === 1) {
    if (sortTT === -1) {
      sortTT = 0;
      arrowTT.className = "icon icon-up-dir";
    } else if (sortTT === 0) {
      sortTT = 1; //down arrow
      arrowTT.className = "icon icon-down-dir";
    } else if (sortTT === 1) {
      sortTT = -1;
      arrowTT.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 2) {
    if (sortP === -1) {
      sortP = 0;
      arrowP.className = "icon icon-up-dir";
    } else if (sortP === 0) {
      sortP = 1; //down arrow
      arrowP.className = "icon icon-down-dir";
    } else if (sortP === 1) {
      sortP = -1;
      arrowP.className = "icon icon-arrow-combo";
      return;
    }
  } else if (value === 3) {
    if (sortSC === -1) {
      sortSC = 0;
      arrowSC.className = "icon icon-up-dir";
    } else if (sortSC === 0) {
      sortSC = 1; //down arrow
      arrowSC.className = "icon icon-down-dir";
    } else if (sortSC === 1) {
      sortSC = -1;
      arrowSC.className = "icon icon-arrow-combo";
      return;
    }
  }
  filterBtn.click();
}

filterBtn.addEventListener("click", function() {
  //ipc.send("error-log", "Ran from filter.");
  lPrice = lowerPrice.value;
  //ipc.send("error-log", lPrice);
  hPrice = higherPrice.value;

  var transport = transportType.value;
  if (transport === 'All') {
    //transport = '';
  }
  var site = dropdown.value;
  if (site === 'All') {
    //site = '';
    //ipc.send("error-log", site);
  }
  //Make sure prices are valid.
  if (validatePrice()) {
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
        route.innerHTML =  "<input type='radio' name='radios'>" + transit.ROUTE;
        //route.appendChild(routeText);

        type.appendChild(document.createTextNode("" + transit.TYPE));
        price.appendChild(document.createTextNode("" + transit.PRICE));
        count.appendChild(document.createTextNode("" + transit['COUNT(*)']));
        i++;
      });
    }
  }, transport, site, lPrice, hPrice, sortTT, sortP, sortSC);

  event.preventDefault();
});

var userName;

ipc.on("userName", function(event, name) {
  userName = name;
});

logBtn.addEventListener("click", function() {
  var error = false;
  //ipc.send("error-log", "USERNAME: " + userName);

  var type;
  var route;
  var date;
  var checked = false;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 2; i < checkboxes.length - 1; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      var row = table.childNodes[i-2];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          route = row.childNodes[j].innerText;
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
    dialog.showErrorBox('No transit selected.', 'Please select a transit.');
    return true;
  }

  //ipc.send("error-log", type + " " + route);

  date = logDate.value;
  if (date === null || date === "") {
    dialog.showErrorBox('No date selected.', 'Please select a date.');
    return true;
  }

  //ipc.send("error-log", "DATE: " + date);

  logTransit(function(err) {
    if (!err) {
      dialog.showMessageBox(null, options, (response) => {
        console.log(response);
      });
    }
  }, userName, type, route, date);

  event.preventDefault();
});

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


function insertTransits(callback, transport, site, lPrice, hPrice, sortTransport, sortPrice, sortSite) {

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

  $queryTransits = 'CALL transit_info("'+transport+'", "'+site+'", "'+lPrice+'", "'+hPrice+'", "'+sortTransport+'", "'+sortPrice+'", "'+sortSite+'")';
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
