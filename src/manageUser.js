const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const statusDropdown = document.getElementById('dropdown')
const userDropdown = document.getElementById('userType')
const userSearch = document.getElementById('userSearch')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const approveBtn = document.getElementById('approveBtn')
const declineBtn = document.getElementById('declineBtn')
const backBtn = document.getElementById('cancelBtn')
var sortU = 0;
var sortE = 0;
var sortT = 0;
var sortST = 0;
var arrowUser = document.getElementById('sortUser');
var arrowEmail = document.getElementById('sortEmail');
var arrowType = document.getElementById('sortType');
var arrowStatus = document.getElementById('sortStatus');


const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Success!',
    detail: 'Successfully changed user status.',
};

function sorting(value) {
  ipc.send("error-log", value);
  if (value === 1) {
    if (sortU === 0) {
      sortU = 1; //down arrow
      arrowUser.className = "icon icon-down-dir"
    } else {
      sortU = 0;
      arrowUser.className = "icon icon-up-dir"
    }
  } else if (value === 2) {
    if (sortE === 0) {
      sortE = 1;
      arrowEmail.className = "icon icon-up-dir"
    } else {
      sortE = 0;
      arrowEmail.className = "icon icon-down-dir"
    }
  } else if (value === 3) {
    if (sortT === 0) {
      sortT = 1;
      arrowType.className = "icon icon-up-dir"
    } else {
      sortT = 0;
      arrowType.className = "icon icon-down-dir"
    }
  } else if (value === 4) {
    if (sortST === 0) {
      sortST = 1;
      arrowStatus.className = "icon icon-up-dir"
    } else {
      sortST = 0;
      arrowStatus.className = "icon icon-down-dir"
    }
  }

  filterBtn.click();
}

filterBtn.addEventListener("click", function() {
  var type = userDropdown.value;
  if (type === 'All') {
    //transport = '';
  } else if (type === 'User'){
    type = 'u';
  } else if (type === 'Visitor'){
    type = 'v';
  } else if (type === 'Manager'){
    type = 'm';
  } else if (type === 'Staff'){
    type = 's';
  }

  var status = statusDropdown.value;
  if (status === 'All') {
    //site = '';
    //ipc.send("error-log", site);
  } else if (status === 'Pending'){
    status = 'p';
  } else if (status === 'Approved'){
    status = 'a';
  } else if (status === 'Declined'){
    status = 'd';
  }

  var nameSearch = userSearch.value;
  if (nameSearch === '') {
    nameSearch = 'null';
  }

  insertUsers(function(rows) {
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
      rows.forEach(function(user) {
        var row = table.insertRow(i);
        //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
        ipc.send("error-log", user);

        var route = row.insertCell(0);
        var type = row.insertCell(1);
        var price = row.insertCell(2);
        var count = row.insertCell(3);

        //var routeText  = document.createTextNode('' + transit.ROUTE);
        route.innerHTML =  "<input type='radio' name='radios'>" + user.USERNAME;
        //route.appendChild(routeText);

        type.appendChild(document.createTextNode("" + user['COUNT(*)']));
        if (user.USERTYPE === 'a' || user.USERTYPE === 'av') {
          price.appendChild(document.createTextNode("Admin"));
        } else if (user.USERTYPE === 's' || user.USERTYPE === 'sv') {
          price.appendChild(document.createTextNode("Staff"));
        } else if (user.USERTYPE === 'm' || user.USERTYPE === 'mv') {
          price.appendChild(document.createTextNode("Manager"));
        } else if (user.USERTYPE === 'v') {
          price.appendChild(document.createTextNode("Visitor"));
        } else if (user.USERTYPE === 'u') {
          price.appendChild(document.createTextNode("User"));
        }

        if (user.STATUS === 'a') {
          count.appendChild(document.createTextNode("Approved"));
        } else if (user.STATUS === 'p') {
          count.appendChild(document.createTextNode("Pending"));
        } else if (user.STATUS === 'd') {
          count.appendChild(document.createTextNode("Declined"));
        }

        i++;
      });
    }
  }, nameSearch, type, status, sortU, sortE, sortT, sortST);

  event.preventDefault();
});

approveBtn.addEventListener("click", function() {
    var checked = false;
    var user2Approve;
    checkboxes = document.getElementsByTagName("input");
    for (var i = 1; i < checkboxes.length; i++) {
      var checkbox = checkboxes[i];
      if(checkbox.checked) {
        checked = true;
        //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
        var row = table.childNodes[i-1];
        //ipc.send("error-log", "row length" + row.childNodes.length);
        for (var j = 0; j < row.childNodes.length; j++) {
          if (j === 0) {
            user2Approve = row.childNodes[j].innerText;
            //break;
            //ipc.send("error-log", "USER: " + user2Approve);
          } else if (j === 3) {
            if (row.childNodes[j].innerText === 'Approved') {
              dialog.showErrorBox('Not Possible.', 'Cannot approve a user already approved.');
              event.preventDefault();
              return;
            }
          }
        }
        break;
      }
    }

    if (!checked) {
      dialog.showErrorBox('No user selected.', 'Please select a user.');
      return true;
    }

    var approveStatus = 'a';
    var error = false;
    changeStatus(function(err) {
      if (!err) {
        dialog.showMessageBox(null, options, (response) => {
          console.log(response);
        });
      }
    }, user2Approve, approveStatus, error);
    event.preventDefault();
});

declineBtn.addEventListener("click", function() {
    var checked = false;
    var user2Approve;
    checkboxes = document.getElementsByTagName("input");
    for (var i = 1; i < checkboxes.length; i++) {
      var checkbox = checkboxes[i];
      if(checkbox.checked) {
        checked = true;
        //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
        var row = table.childNodes[i-1];
        //ipc.send("error-log", "row length" + row.childNodes.length);
        for (var j = 0; j < row.childNodes.length; j++) {
          if (j === 0) {
            user2Approve = row.childNodes[j].innerText;
            //break;
            //ipc.send("error-log", "USER: " + user2Approve);
          } else if (j === 3) {
            if (row.childNodes[j].innerText === 'Approved' || row.childNodes[j].innerText === 'Declined') {
              dialog.showErrorBox('Not Possible.', 'Cannot decline a user already approved or declined.');
              event.preventDefault();
              return;
            }
          }
        }
        break;
      }
    }

    if (!checked) {
      dialog.showErrorBox('No user selected.', 'Please select a user.');
      return true;
    }

    var approveStatus = 'd';
    var error = false;
    changeStatus(function(err) {
      if (!err) {
        dialog.showMessageBox(null, options, (response) => {
          console.log(response);
        });
      }
    }, user2Approve, approveStatus, error);
    event.preventDefault();
});

function changeStatus(callback, user, statusChange, error) {

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
  if (statusChange === 'a') {
    $queryLog = 'CALL approve_user("'+user+'")';
  } else {
    $queryLog = 'CALL decline_user("'+user+'")';
  }
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

      callback(error);
      connection.end(function(){
          // The connection has been closed
      });
  });

  return;
}

var userName;

ipc.on("userName", function(event, name) {
  userName = name;
});

window.addEventListener("load", function() {
  console.log("Ran load code.")
  ipc.send("update-username-value");
});


function insertUsers(callback, name1, types, status1, usersort, emailsort, typesort, statussort) {

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

  $queryUsers = 'CALL get_users("'+name1+'", "'+types+'", "'+status1+'", "'+usersort+'", "'+emailsort+'", "'+typesort+'", "'+statussort+'")';
  connection.query($queryUsers, function(err, rows, result) {
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
  ipc.send("load-back-page");
  //ipc.send("load-page", 'file://' + __dirname + '/main.html', 500, 425);
  remote.getCurrentWindow().close();
})
