const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const firstName = document.getElementById('fname')
const lastName = document.getElementById('lname')
const userName = document.getElementById('username')
const pass = document.getElementById('password')
const confirmPass = document.getElementById('confirm')
const email = document.getElementById('email')
const dropd = document.getElementById('dropdown')
const number = document.getElementById('phone')
const address = document.getElementById('addr')
const city = document.getElementById('city')
const state = document.getElementById('state')
const zipcode = document.getElementById('zip')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
var bcrypt = require('bcryptjs');
const registerBtn = document.getElementById('registerBtn')
const backBtn = document.getElementById('cancelBtn')

const options = {
    buttons: ['Ok'],
    defaultId: 2,
    title: 'Success',
    message: 'Added!',
    detail: 'Successfully created account.',
};


  function validateData() {
    if (firstName.value === "" || lastName.value === "") {
      dialog.showErrorBox('Incorrect data.', 'Make sure the name fields are filled in.');
      return true;
    } else if (userName.value === ""){
      dialog.showErrorBox('Incorrect data.', 'Make sure the username field is filled in.');
      return true;
    } else if (pass.value === "" || confirmPass.value === ""){
      dialog.showErrorBox('Incorrect data.', 'Make sure the password fields is filled in.');
      return true;
    } else if (pass.value.length < 8){
      dialog.showErrorBox('Incorrect data.', 'Make sure your password is at least 8 characters.');
      return true;
    } else if (number.value === ''){
      dialog.showErrorBox('Incorrect data.', 'Make sure your phone field is filled in.');
      return true;
    } else if (number.value.length != 10){
      dialog.showErrorBox('Incorrect data.', 'Make sure your phone number is 10 numbers.');
      return true;
    } else if (address.value === ''){
      dialog.showErrorBox('Incorrect data.', 'Make sure your address field is filled in.');
      return true;
    } else if (city.value === ''){
      dialog.showErrorBox('Incorrect data.', 'Make sure your city field is filled in.');
      return true;
    } else if (state.value === ''){
      dialog.showErrorBox('Incorrect data.', 'Make sure your state field is filled in.');
      return true;
    } else if (zipcode.value === ''){
      dialog.showErrorBox('Incorrect data.', 'Make sure your zipcode field is filled in.');
      return true;
    } else if (zipcode.value.length != 5){
      dialog.showErrorBox('Incorrect data.', 'Make sure your zipcode is 5 numbers.');
      return true;
    } else if (email.value === ""){
      dialog.showErrorBox('Incorrect data.', 'Make sure the email field is filled in.');
      return true;
    }
  }

  //TODO VALIDATE ZIP

  function validateEmail(mail)
  {
   if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
      return true;
    }
      dialog.showErrorBox('Incorrect data.', 'Make sure all your emails are valid.');
      return false;
  }

  //for hashing, does some stuff I think
  //maybe like how many times to pass through a blender
  const saltRounds = 10;
  registerBtn.addEventListener('click', function() {
    if (validateData()) {
      return;
    }
    const fname = firstName.value;
    const lname = lastName.value;
    const password = pass.value;
    const confirm = confirmPass.value;
    const userN = userName.value;
    const type = dropd.value;
    const pnum = number.value;
    const addy = address.value;
    const city1 = city.value;
    const state1 = state.value;
    const zipcode1 = zipcode.value;

    var error = false;
    if (!(password === confirm)) {
      dialog.showErrorBox('Incorrect data.', 'Make sure your passwords are the same.');
      return;
    }
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    hash = hash;
    //console.log(hash);
    const emails = email.value;
    var emailList = emails.split(',');
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

    insertUser(function (error) {
      if (!error) {
        dialog.showMessageBox(null, options, (response) => {
          console.log(response);
        });
      }
    }, userN, fname, lname, hash, emailList, type, pnum, addy, city1, state1, zipcode1);

  })

  function insertUser(callback, userN, fname, lname, hash, emailList, type, pnum, addy, city1, state1, zipcode1, error) {

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
    emailList.forEach(function (e) {
      values.push([''+userN, e]);
    });

    // Perform a query
    $queryUser = 'INSERT INTO `user` (USERNAME, FNAME, LNAME, STATUS, PASSWORD, USERTYPE) VALUES ("'+userN+'", "'+fname+'", "'+lname+'", "'+'a'+'", "'+hash+'", "'+type+'")';
    connection.query($queryUser, function(err, result) {
        if(err){
          if (err.code === 'ER_DUP_ENTRY') {
            dialog.showErrorBox('Duplicate username.', 'Make sure username is unique.')
            error = true;
          }
          ipc.send("error-log", err);
          console.log("An error occurred performing the query.");
          console.log(err);
          connection.end(function(){
              // The connection has been closed
          });
          return;
        }

        $query = 'INSERT INTO `email` (USERNAME, EMAIL) VALUES ?';
        connection.query($query, [values], function(err, result) {
            if(err){
              error = true;
              if (err.code === 'ER_DUP_ENTRY') {
                 dialog.showErrorBox('Duplicate email.', 'Make sure email is unique.')
                 error = true;

                 $query3 = 'DELETE FROM `user` WHERE USERNAME = "'+userN+'"';
                 connection.query($query3, function(err, result) {
                     if(err){
                       ipc.send("error-log", err);
                       console.log("An error occurred performing the query.");
                       console.log(err);
                       return;
                     }

                     callback(error);
                 });
              }

              console.log("An error occurred performing the query.");
              console.log(err);
              connection.end(function(){
                  // The connection has been closed
              });

              callback(error);
              return;
            }
            //
            // connection.end(function(){
            //     // The connection has been closed
            // });
            //callback(error);
        });

        $queryEmp = 'INSERT INTO `employee` (USERNAME, PHONE, STREET, CITY, STATE, ZIP, TYPE) VALUES ("'+userN+'", "'+pnum+'", "'+addy+'", "'+city1+'", "'+state1+'", "'+Number(zipcode1)+'", "'+type+'")';
        connection.query($queryEmp, function(err, result) {
            if(err){
              error = true;
              ipc.send("error-log", err);
              if (err.code === 'ER_DUP_ENTRY') {
                 dialog.showErrorBox('Duplicate phone number.', 'Make sure your phone number is unique.')
                 error = true;

                 $query3 = 'DELETE FROM `user` WHERE USERNAME = "'+userN+'"';
                 connection.query($query3, function(err, result) {
                     if(err){
                       ipc.send("error-log", err);
                       console.log("An error occurred performing the query.");
                       console.log(err);
                       return;
                     }

                     callback(error);
                 });
              }

              console.log("An error occurred performing the query.");
              console.log(err);
              connection.end(function(){
                  // The connection has been closed
              });

              callback(error);
              return;
            }

            connection.end(function(){
                // The connection has been closed
            });
            callback(error);
        });
    });


    return;
  }

backBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/add.html', 500, 425);
  remote.getCurrentWindow().close();
})
