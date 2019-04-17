const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const siteDropdown = document.getElementById('siteDropdown')
const managerDropdown = document.getElementById('managerDropdown')
const openEverydayDropdown = document.getElementById('openEverydayDropdown')
const table = document.getElementById('tBody')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const filterBtn = document.getElementById('filterBtn')
const createBtn = document.getElementById('createBtn')
const editBtn = document.getElementById('editBtn')
const deleteBtn = document.getElementById('deleteBtn')
const backBtn = document.getElementById('cancelBtn')
var sortN = 0;
var sortM = 0;
var sortO = 0;
var arrowName = document.getElementById('sortName');
var arrowManager = document.getElementById('sortManager');
var arrowOpen = document.getElementById('sortOpen');


const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Success!',
    detail: 'Successfully deleted site.',
};

function sorting(value) {
  ipc.send("error-log", value);
  if (value === 1) {
    if (sortN === 0) {
      sortN = 1; //down arrow
      arrowName.className = "icon icon-down-dir"
    } else {
      sortN = 0;
      arrowName.className = "icon icon-up-dir"
    }
  } else if (value === 2) {
    if (sortM === 0) {
      sortM = 1;
      arrowManager.className = "icon icon-up-dir"
    } else {
      sortM = 0;
      arrowManager.className = "icon icon-down-dir"
    }
  } else if (value === 3) {
    if (sortO === 0) {
      sortO = 1;
      arrowOpen.className = "icon icon-up-dir"
    } else {
      sortO = 0;
      arrowOpen.className = "icon icon-down-dir"
    }
  }

  filterBtn.click();
}

filterBtn.addEventListener("click", function() {
  var site = siteDropdown.value;
  if (site === 'All') {
    //transport = '';
  }

  var manager = managerDropdown.value;
  if (manager === 'All') {
    //site = '';
    //ipc.send("error-log", site);
  }

  var openEveryday = openEverydayDropdown.value;
  if (openEveryday === 'All') {
    //site = '';
    //ipc.send("error-log", site);
  } else if (openEveryday === 'Yes') {
    openEveryday = 'y';
  } else if (openEveryday === 'No') {
    openEveryday = 'n';
  }

  insertSites(function(rows) {
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
      rows.forEach(function(site) {
        ipc.send("error-log", "SITE: " + site);
        var row = table.insertRow(i);
        //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
        //ipc.send("error-log", user);

        var route = row.insertCell(0);
        var type = row.insertCell(1);
        var price = row.insertCell(2);
        //var count = row.insertCell(3);

        //var routeText  = document.createTextNode('' + transit.ROUTE);
        route.innerHTML =  "<input type='radio' name='radios'>" + site.SITENAME;
        //route.appendChild(routeText);

        type.appendChild(document.createTextNode("" + site.MANAGER));

        if (site.OPENEVERYDAY === 'y' || site.OPENEVERYDAY === 'Y') {
          price.appendChild(document.createTextNode("Yes"));
        } else if (site.OPENEVERYDAY === 'n' || site.OPENEVERYDAY === 'N') {
          price.appendChild(document.createTextNode("No"));
        }

        i++;
      });
    }
  }, site, manager, openEveryday, sortN, sortM, sortO);

  event.preventDefault();
});

createBtn.addEventListener("click", function() {
    var checked = false;
    var sitesName;
    checkboxes = document.getElementsByTagName("input");
    for (var i = 0; i < checkboxes.length; i++) {
      var checkbox = checkboxes[i];
      if(checkbox.checked) {
        checked = true;
        //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
        var row = table.childNodes[i];
        //ipc.send("error-log", "row length" + row.childNodes.length);
        for (var j = 0; j < row.childNodes.length; j++) {
          if (j === 0) {
            sitesName = row.childNodes[j].innerText;
            break;
            //ipc.send("error-log", "USER: " + user2Approve);
          }
        }
        break;
      }
    }

    // if (!checked) {
    //   event.preventDefault();
    //   dialog.showErrorBox('No site selected.', 'Please select a site.');
    //   return true;
    // }
    const modalPath = path.join('file://', __dirname, 'createSite.html')
    ipc.send("load-page-site", modalPath, 500, 625, sitesName);
    remote.getCurrentWindow().close();
});

editBtn.addEventListener("click", function() {
    var checked = false;
    var sitesName;
    checkboxes = document.getElementsByTagName("input");
    for (var i = 0; i < checkboxes.length; i++) {
      var checkbox = checkboxes[i];
      if(checkbox.checked) {
        checked = true;
        //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
        var row = table.childNodes[i];
        //ipc.send("error-log", "row length" + row.childNodes.length);
        for (var j = 0; j < row.childNodes.length; j++) {
          if (j === 0) {
            sitesName = row.childNodes[j].innerText;
            break;
            //ipc.send("error-log", "USER: " + user2Approve);
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
    const modalPath = path.join('file://', __dirname, 'editSite.html')
    ipc.send("load-page-site", modalPath, 500, 625, sitesName);
    remote.getCurrentWindow().close();
});

deleteBtn.addEventListener("click", function() {
  var checked = false;
  var sitesName;
  checkboxes = document.getElementsByTagName("input");
  for (var i = 0; i < checkboxes.length; i++) {
    var checkbox = checkboxes[i];
    if(checkbox.checked) {
      checked = true;
      //ipc.send("error-log", "SUCCESSFULLY FOUND CHECKED AT " + i);
      var row = table.childNodes[i];
      //ipc.send("error-log", "row length" + row.childNodes.length);
      for (var j = 0; j < row.childNodes.length; j++) {
        if (j === 0) {
          sitesName = row.childNodes[j].innerText;
          break;
          //ipc.send("error-log", "USER: " + user2Approve);
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

    var error = false;
    removeSite(function(err) {
      if (!err) {
        dialog.showMessageBox(null, options, (response) => {
          console.log(response);
        });
      }
    }, sitesName, error);
    //event.preventDefault();
});

var userName;

ipc.on("userName", function(event, name) {
  userName = name;
});

window.addEventListener("load", function() {
  console.log("Ran load code.")
  ipc.send("update-username-value");

  const dropdownToPopulate = document.getElementById('siteDropdown');
  const dropdownToPopulate2 = document.getElementById('managerDropdown');
  getSites(function(siteList) {
    ipc.send("error-log", siteList);
    siteList = siteList[0];
    siteList.forEach(function(site) {
      //Create new dropdown item
      var element = document.createElement("option");
      element.textContent = site.SITENAME;
      element.value = site.SITENAME;
      dropdownToPopulate.appendChild(element);
      var element2 = document.createElement("option");
      element2.textContent = site.MANAGER;
      element2.value = site.MANAGER;
      dropdownToPopulate2.appendChild(element2);
    });
  });
});

function getSites(callback) {

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

  $querySites = 'CALL populate_dropdown_manage_site()';
  connection.query($querySites, function(err, rows, result) {
      if(err){
        ipc.send("error-log", err);
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){});
        return;
      }
      callback(rows);
      connection.end(function(){});
  });

  return;
}


function insertSites(callback, siteName, siteManager, siteOpen, sitesort, managersort, opensort) {

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

  $queryUsers = 'CALL retrieve_site("'+siteName+'", "'+siteManager+'", "'+siteOpen+'", "'+sitesort+'", "'+managersort+'", "'+opensort+'")';
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

function removeSite(callback, siteName, error) {

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

  $queryUsers = 'CALL delete_site("'+siteName+'")';
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

backBtn.addEventListener('click', function() {
  ipc.send("load-back-page");
  //ipc.send("load-page", 'file://' + __dirname + '/main.html', 500, 425);
  remote.getCurrentWindow().close();
})
