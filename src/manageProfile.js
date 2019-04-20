const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const fname = document.getElementById('fname')
const lname = document.getElementById('lname')
const userN = document.getElementById('username')
const siteName = document.getElementById('siteName')
const employeeID = document.getElementById('employeeID')
const phone = document.getElementById('phone')
const address = document.getElementById('address')
const emails = document.getElementById('email')
const visitor = document.getElementById('visitor')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const updateBtn = document.getElementById('registerBtn')
const backBtn = document.getElementById('cancelBtn')

var userName;
var type;
var visitorAccount;
var accountType;
var oldEmails = "";
//ipc.send("update-username-value");

const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Updated!',
    detail: 'Successfully updated profile.',
};

ipc.on("userName", function(event, name, userType) {
  userName = name;
  type = userType;
  //ipc.send("error-log", "USERNAME FROM LOAD: " + userName);
  insertInfo(function(rows) {
    //ipc.send("error-log", "DATA FROM GETPROFILE: " + rows);
    var emailList = "";
    var i = 0;
    rows = rows[0];
    rows.forEach(function(row) {
      console.log(row);
      if (i === 0) {
        emailList = emailList.concat("" + row.EMAIL);
        console.log("CONCATTED : " + emailList);
      } else {
        emailList = emailList.concat(", " + row.EMAIL);
      }
      i++;
    });

    ipc.send("error-log", "Emails: " + emailList);
    console.log("EMAIL LIST: " + emailList);
    oldEmails = emailList.split(',');
    oldEmails.forEach(function (e) {
      e = '' + e.trim();
    });

    fname.value = rows[0].FNAME;
    lname.value = rows[0].LNAME;
    userN.innerHTML = "" + userName;
    employeeID.innerHTML = "" + rows[0].EID;
    if (rows[0].SITENAME === null) {
      siteName.innerHTML = "";
    } else {
      siteName.innerHTML = "" + rows[0].SITENAME;
    }
    address.innerHTML = "" + rows[0].STREET + ", " + rows[0].CITY + ", " + rows[0].STATE + " " + rows[0].ZIP;
    accountType = rows[0].USERTYPE;
    if (rows[0].USERTYPE === "sv" || rows[0].USERTYPE === "av" || rows[0].USERTYPE === "mv") {
      visitor.checked = true;
      visitorAccount = true;
    }
    phone.value = rows[0].PHONE;
    emails.value = emailList;
  }, userName);
});

window.addEventListener("load", function() {
  ipc.send("update-username-value-type");
});

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

function validateEmail(mail)
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return true;
  }
    dialog.showErrorBox('Incorrect data.', 'Make sure all your emails are valid.');
    return false;
}

updateBtn.addEventListener("click", function() {
  if (fname.value === null || fname.value === "" || lname.value === null || lname.value === "") {
    dialog.showErrorBox('Incorrect data.', 'Make sure the name fields are filled in.');
    return;
  }

  if (phone.value === '') {
    dialog.showErrorBox('Incorrect data.', 'Make sure your phone field is filled in.');
    return;
  } else if (phone.value.length != 10) {
    dialog.showErrorBox('Incorrect data.', 'Make sure your phone number is 10 numbers.');
    return;
  }

  const email = emails.value;
  var emailList = email.split(',');
  var correctEmail = false;
  emailList.forEach(function (e) {
    e = '' + e.trim();
    if (!validateEmail(e)) {
      correctEmail = true;
    }
    console.log(e);
  });
  if (correctEmail) {
    return;
  }

  var number = phone.value;
  var first = fname.value;
  var last = lname.value;
  var visitorCheck = visitor.checked;
  var addVisitor = 0;
  var removeVisitor = 0;
  if (visitorCheck) {
    if (visitorAccount) {
      //do nothing
    } else {
      accountType = accountType.concat("v");
      console.log(accountType);
      addVisitor = 1;
    }
  } else {
    if (visitorAccount) {
      accountType = (accountType.split("v"))[0];
      console.log(accountType);
      removeVisitor = 1;
    }
  }

  var error = false;

  updateInfo(function(error) {
    if (!error) {
      dialog.showMessageBox(null, options, (response) => {
        console.log(response);
      });
      if (addVisitor = 1) {
        ipc.send("update-type-add");
      } else if (removeVisitor = 1) {
        ipc.send("update-type-remove");
      }
    }
  //   //Remove all table rows (except header)
  //   //ipc.send("error-log", rows);
  //
  //   //Insert new rows
  //   var i = 0;
  //   rows = rows[0];
  //   if (rows.length === 0) {
  //     dialog.showErrorBox('No results.', 'No results match the filter constraints.');
  //   } else {
  //     while (table.firstChild) {
  //       table.removeChild(table.firstChild);
  //     }
  //     rows.forEach(function(transit) {
  //       var row = table.insertRow(i);
  //       //row.innerHTML = "<td>" + transit.ROUTE + "</td><td>" + transit.TYPE + "</td><td>" + transit.PRICE + "</td><td>" + transit.COUNT + "</td>";
  //       ipc.send("error-log", transit);
  //
  //       var route = row.insertCell(0);
  //       var type = row.insertCell(1);
  //       var price = row.insertCell(2);
  //       var count = row.insertCell(3);
  //
  //       //var routeText  = document.createTextNode('' + transit.ROUTE);
  //       route.innerHTML =  "" + transit.DATE.toISOString().split('T')[0];
  //       //route.appendChild(routeText);
  //
  //       type.appendChild(document.createTextNode("" + transit.ROUTE));
  //       price.appendChild(document.createTextNode("" + transit.TYPE));
  //       count.appendChild(document.createTextNode("" + transit.PRICE));
  //       i++;
  //     });
  //   }
}, userName, first, last, number, accountType, emailList, addVisitor, removeVisitor, oldEmails, error);

  event.preventDefault();
});

function updateInfo(callback, user, firstN, lastN, pnum, acType, eList, add, remove, old, error) {

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

  var values = [];
  eList.forEach(function (e) {
    values.push([''+user, e]);
  });

  var oldValues = [];
  old.forEach(function (e) {
    oldValues.push([''+user, e]);
  });

  //if site is null, check
  $queryUpdate = 'CALL update_employee("'+user+'", "'+firstN+'", "'+lastN+'", "'+pnum+'", "'+acType+'", "'+add+'", "'+remove+'")';
  //ipc.send("error-log", $queryTransits);
  connection.query($queryUpdate, function(err, rows, result) {
      if(err) {
        ipc.send("error-log", err);
        if (err.code === 'ER_DUP_ENTRY') {
           dialog.showErrorBox('Duplicate phone number.', 'Make sure phone number is unique. Phone number not updated.')
           error = true;
        }
        console.log("An error occurred performing the query.");
        console.log(err);
        connection.end(function(){});
        return;
      }

      $query = 'INSERT INTO `email` (USERNAME, EMAIL) VALUES ?';
      connection.query($query, [values], function(err, result) {
          if(err) {
            error = true;
            if (err.code === 'ER_DUP_ENTRY') {
               dialog.showErrorBox('Duplicate email(s).', 'Make sure emails are unique and try again.')
               error = true;

               $query = 'INSERT INTO `email` (USERNAME, EMAIL) VALUES ?';
               connection.query($query, [oldValues], function(err, result) {
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
            callback(error);
          }

          connection.end(function() {
               // The connection has been closed
          });
          callback(error);
      });
      //ipc.send("error-log", rows);
      //callback(rows);
      //connection.end(function(){});
  });

  return;
}


function insertInfo(callback, user) {

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

  $queryInfo = 'CALL get_profile("'+user+'")';
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

function checkEmailExist(callback, user) {

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

  $queryInfo = 'CALL check_email("'+user+'")';
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
  checkEmailExist(function(error) {
    ipc.send("error-log", error);
    ipc.send("error-log", error[0]);
    ipc.send("error-log", error[0][0].EXIST);
    if (error[0][0].EXIST === 1) {
      ipc.send("load-back-page");
      //ipc.send("load-page", 'file://' + __dirname + '/main.html', 500, 425);
      remote.getCurrentWindow().close();
    } else {
      dialog.showErrorBox('One or More Invalid Emails.', 'Must update with valid emails.')
      //event.preventDefault();
      return;
    }
  }, userName);
  event.preventDefault();
})
