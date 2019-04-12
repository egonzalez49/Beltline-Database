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
var lPrice;
var hPrice;


const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Added!',
    detail: 'Successfully created account.',
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


filterBtn.addEventListener("click", function() {
  lPrice = lowerPrice.value;
  //ipc.send("error-log", lPrice);
  hPrice = higherPrice.value;

  var transport = transportType.value;
  var site = dropdown.value;

  //Make sure prices are valid.
  if (validatePrice()) {
    return;
  }

  insertTransits(function(rows) {
    //Remove all table rows (except header)
    ipc.send("error-log", rows);
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }

    //Insert new rows
    var i = 0;
    rows = rows[0];
    rows.forEach(function(transit) {
      var row = table.insertRow(i);
      //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
      ipc.send("error-log", transit);

      var route = row.insertCell(0);
      var type = row.insertCell(1);
      var price = row.insertCell(2);
      var count = row.insertCell(3);

      var routeText  = document.createTextNode('' + transit.ROUTE);
      route.appendChild(routeText);

      type.appendChild(document.createTextNode("" + transit.TYPE));
      price.appendChild(document.createTextNode("" + transit.PRICE));
      count.appendChild(document.createTextNode("" + transit['COUNT(*)']));
      i++;
    });
  }, transport, site, lPrice, hPrice);

  event.preventDefault();
});


window.addEventListener("load", function() {
  console.log("Ran load code.")
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


function insertTransits(callback, transport, site, lPrice, hPrice) {

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

  $queryTransits = 'CALL transit_info("'+transport+'", "'+site+'", "'+lPrice+'", "'+hPrice+'")';
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
  ipc.send("load-page", 'file://' + __dirname + '/main.html', 500, 425);
  remote.getCurrentWindow().close();
})
