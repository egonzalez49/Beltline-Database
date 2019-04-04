const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const registerBtn = document.getElementById('registerBtn')
const backBtn = document.getElementById('cancelBtn')
const firstName = document.getElementById('fname')
const lastName = document.getElementById('lname')
const userName = document.getElementById('username')
const pass = document.getElementById('password')
const confirmPass = document.getElementById('confirm')
const email = document.getElementById('email')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
var bcrypt = require('bcryptjs');

//for hashing, does some shit I think
//maybe like how many times to pass through a blender
const saltRounds = 10;

registerBtn.addEventListener('click', function() {
  const fname = firstName.value;
  const lname = lastName.value;
  const password = pass.value;
  const confirm = confirmPass.value;
  if (!(password === confirm)) {
    dialog.showErrorBox('Incorrect login data.', 'Make sure your passwords are the same.')
  }
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  console.log(hash);
  const emails = email.value;
  var emailList = emails.split(',');
  emailList.forEach(function (e) {
    e = e.trim();
    //console.log(e);
  });

})

function insertUser(callback) {

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
  $query = 'SELECT `*` FROM `user` INNER JOIN `email` ON user.USERNAME = email.USERNAME';

  connection.query($query, function(err, rows, fields) {
      if(err){
          console.log("An error occurred performing the query.");
          console.log(err);
          return;
      }
      console.log("Query succesfully executed", rows);

      callback(rows);
  });

  // Close the connection
  connection.end(function(){
      // The connection has been closed
  });

  return;
}

backBtn.addEventListener('click', function() {
  ipc.send("load-page", 'file://' + __dirname + '/add.html', 500, 425);
  remote.getCurrentWindow().close();
})
