const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const site = document.getElementById('siteName')
const zip = document.getElementById('zip')
const address = document.getElementById('address')
const managerDropdown = document.getElementById('managerDropdown')
const openEveryday = document.getElementById('openEveryday')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const updateBtn = document.getElementById('updateBtn')
const backBtn = document.getElementById('cancelBtn')

// var userName;
// var type;
// var visitorAccount;
// var accountType;
// var oldEmails = "";
//ipc.send("update-username-value");

const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Updated!',
    detail: 'Successfully updated site.',
};

ipc.on("site", function(event, siteName) {
  //ipc.send("error-log", "USERNAME FROM LOAD: " + userName);
  insertInfo(function(rows) {

    rows = rows[0];
    console.log(rows[0]);
    site.value = rows[0].SITENAME;
    zip.value = rows[0].ZIP;
    address.value = rows[0].ADDRESS;
    if (rows[0].OPENEVERYDAY === "y" || rows[0].OPENEVERYDAY === "Y") {
      openEveryday.checked = true;
    } else {
      openEveryday.checked = false;
    }
  }, siteName);

  insertManagers(function(managers) {
    managers = managers[0];
    console.log(managers[0]);
    managers.forEach(function(m) {
      var element = document.createElement("option");
      element.textContent = m.USERNAME;
      element.value = m.USERNAME;
      managerDropdown.appendChild(element);
    });
  }, siteName);
});

window.addEventListener("load", function() {
  ipc.send("update-site-value");
});

updateBtn.addEventListener("click", function() {
  if (site.value === null || site.value === "" || zip.value === null || zip.value === "") {
    dialog.showErrorBox('Incorrect data.', 'Make sure the name and zipcode fields are filled in.');
    return;
  }

  if (zip.value.length != 5) {
    dialog.showErrorBox('Incorrect data.', 'Make sure zipcode has 5 digits.');
    return;
  }

  var newName = site.value;
  var newZip = zip.value;
  var newAddress = address.value;
  var openCheck = openEveryday.checked;
  if (openCheck) {
    openCheck = 'y';
  } else {
    openCheck = 'n';
  }

  var myManager = managerDropdown.value;

  var error = false;

  updateInfo(function(error) {
    if (!error) {
      dialog.showMessageBox(null, options, (response) => {
        console.log(response);
      });
    }
  }, newName, newAddress, newZip, myManager, openCheck, error);

  event.preventDefault();
});

function updateInfo(callback, newName, newAddress, newZip, myManager, openCheck, error) {

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
  $queryUpdate = 'CALL edit_site("'+newName+'", "'+newAddress+'", "'+newZip+'", "'+myManager+'", "'+openCheck+'")';
  //ipc.send("error-log", $queryTransits);
  connection.query($queryUpdate, function(err, rows, result) {
      if(err) {
        ipc.send("error-log", err);
        if (err.code === 'ER_DUP_ENTRY') {
           dialog.showErrorBox('Duplicate site name.', 'Make sure site name is unique. Site name not updated.')
           error = true;
        }
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){});
        return;
      }
      //ipc.send("error-log", rows);
      callback(error);
      connection.end(function(){});
  });

  return;
}


function insertInfo(callback, site) {

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

  $queryInfo = 'CALL get_site("'+site+'")';
  //ipc.send("error-log", "USERNAME IN QUERY: " + user);
  connection.query($queryInfo, function(err, rows, result) {
      if(err){
        ipc.send("error-log", err);
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){});
        return;
      }
      //ipc.send("error-log", "ROWS FROM QUERY: " + rows[0]);
      //console.log(rows);
      callback(rows);
      connection.end(function(){});
  });

  return;
}

function insertManagers(callback, site) {

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

  $queryInfo = 'CALL get_manager_list("'+site+'")';
  //ipc.send("error-log", "USERNAME IN QUERY: " + user);
  connection.query($queryInfo, function(err, rows, result) {
      if(err){
        ipc.send("error-log", err);
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){});
        return;
      }
      //ipc.send("error-log", "ROWS FROM QUERY: " + rows[0]);
      //console.log(rows);
      callback(rows);
      connection.end(function(){});
  });

  return;
}

backBtn.addEventListener('click', function() {
    ipc.send("load-page", 'file://' + __dirname + '/manageSite.html', 500, 625);
    remote.getCurrentWindow().close();
})
