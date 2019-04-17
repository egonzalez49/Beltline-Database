const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const routeName = document.getElementById('routeName')
const transportType = document.getElementById('transportType')
const price = document.getElementById('price')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const updateBtn = document.getElementById('updateBtn')
const backBtn = document.getElementById('cancelBtn')


const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Edited!',
    detail: 'Successfully edited transit.',
};

var transitRoute;
var transitType;
var connected = [];

ipc.on("transit", function(event, name, type) {
  transitRoute = name;
  transitType = type;

  console.log("ROUTE: " + transitRoute);
  console.log("TYPE: " + transitType);


  getConnected(function(rows) {
    rows = rows[0];
    rows.forEach(function(r) {
      connected.push(r.SITENAME);
    });
    price.value = rows[0].PRICE;
    routeName.value = rows[0].ROUTE;
    transportType.innerHTML = '' +rows[0].TYPE;



    insertTransits(function(rows2) {
      var i = 0;
      rows2 = rows2[0];

      if (rows2.length === 0) {
        dialog.showErrorBox('No results.', 'No results match the filter constraints.');
      } else {
        while (table.firstChild) {
          table.removeChild(table.firstChild);
        }
        rows2.forEach(function(transit) {
          var row = table.insertRow(i);
          //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
          ipc.send("error-log", transit);

          var site = row.insertCell(0);

          //var routeText  = document.createTextNode('' + transit.ROUTE);
          if (connected.includes(transit.SITENAME)) {
            site.innerHTML =  "<input type='checkbox' checked>" + transit.SITENAME;
          } else {
            site.innerHTML =  "<input type='checkbox'>" + transit.SITENAME;
          }
          //route.appendChild(routeText);
          i++;
        });
      }

    });

  }, transitRoute, transitType);
});

updateBtn.addEventListener("click", function() {
  var newprice = price.value;
  if (newprice === null || newprice === '' || newprice.value < 0) {
    event.preventDefault();
    dialog.showErrorBox('Invalid price.', 'Please input a valid price.');
    return true;
  }
  var newroute = routeName.value;
  if (newroute === null || newroute === '') {
    event.preventDefault();
    dialog.showErrorBox('Invalid route name.', 'Please input a valid route name.');
    return true;
  }

  var checked = false;
  var number = 0;
  var sitesList = [];
  checkboxes = document.getElementsByTagName("input");
  for (var i = 2; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      //console.log(table.childNodes[i-3]);
      var row = table.childNodes[i-2];
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
    dialog.showErrorBox('No site selected.', 'Please select a site.');
    return true;
  }

  if (number < 2) {
    event.preventDefault();
    dialog.showErrorBox('2 Sites Minimum.', 'Please select at least 2 sites.');
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
  }, transitRoute, transitType, newroute, newprice, sitesList, connected, error);
  event.preventDefault();

  // const modalPath = path.join('file://', __dirname, 'editTransit.html')
  // ipc.send("load-page-transit", modalPath, 500, 625, transitName);
  // remote.getCurrentWindow().close();
});

function editTransit(callback, oldroute, oldtype, newroute, newprice, sitesList, oldsitesList, error) {

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
  sitesList.forEach(function (e) {
    values.push([''+oldtype, ''+newroute, e]);
  });

  var oldvalues = [];
  oldsitesList.forEach(function (e) {
    oldvalues.push([''+oldtype, ''+oldroute, e]);
  });

  //TODO: KEEP LIST OF OLD SITES TO INSERT WHEN ROUTE NAME AND SITES NOT UPDATED

  console.log(values);

  // Perform a query
  $queryLog = 'CALL edit_transit_info("'+oldroute+'", "'+oldtype+'", "'+newroute+'", "'+newprice+'")';
  connection.query($queryLog, function(err, result) {
      if(err){
        if (err.code === 'ER_DUP_ENTRY') {
          dialog.showErrorBox('Duplicate entry.', 'Cannot have two transits with same route and type. Transit not updated.')
          error = true;
          callback(error);
             $query = 'INSERT INTO `transit_connect` (TYPE, ROUTE, SITENAME) VALUES ?';
             connection.query($query, [oldvalues], function(err, result) {
                 if(err) {
                   console.log("An error occurred performing the query.");
                   console.log(err);
                   ipc.send("error-log", err);
                   connection.end(function(){
                       // The connection has been closed
                   });

                   //callback(error);
                   return;
                 }

                 connection.end(function() {
                      // The connection has been closed
                 });

             });
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


window.addEventListener("load", function() {
  console.log("Ran load code.")
  ipc.send("update-transit-value");
});

function getConnected(callback, route, type) {

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

  $queryTransits = 'CALL get_transit("'+type+'", "'+route+'")';
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

function insertTransits(callback) {

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

  $queryTransits = 'CALL get_sites_list()';
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
  ipc.send("load-page", 'file://' + __dirname + '/manageTransit.html', 705, 700);
  remote.getCurrentWindow().close();
})
