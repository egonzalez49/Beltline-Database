const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const { remote } = require('electron')
var dialog = require('electron').remote.dialog
const registerBtn = document.getElementById('registerBtn')
const loginBtn = document.getElementById('loginBtn')
const email = document.getElementById('emailAddress')
const pass = document.getElementById('password')
//const axios = require('axios')
const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');

loginBtn.addEventListener('click', function (event) {
  var modalPath;
  var incorrectInfo = false;
  var unapproved = false;
  var approved = false;
  getUserName(function (rows) {
    rows.forEach(function (row) {
      if (row.EMAIL === email.value) {
        if (row.PASSWORD === pass.value) {
          if(row.STATUS === "a") {
            if (row.USERTYPE === 'u') {
              approved = true;
              modalPath = path.join('file://', __dirname, 'userFunc.html');
              ipc.send("load-page", modalPath, 500, 425);
              remote.getCurrentWindow().close();
              return;
            } else if (row.USERTYPE === 'v') {
              approved = true;
              modalPath = path.join('file://', __dirname, 'visitorFunc.html');
              ipc.send("load-page", modalPath, 500, 425);
              remote.getCurrentWindow().close();
              return;
            } else if (row.USERTYPE === 'a') {
              approved = true;
              modalPath = path.join('file://', __dirname, 'adminFunc.html');
              ipc.send("load-page", modalPath, 500, 425);
              remote.getCurrentWindow().close();
              return;
            } else if (row.USERTYPE === 'av') {
              approved = true;
              modalPath = path.join('file://', __dirname, 'adminvisFunc.html');
              ipc.send("load-page", modalPath, 500, 425);
              remote.getCurrentWindow().close();
              return;
            } else if (row.USERTYPE === 'm') {
              approved = true;
              modalPath = path.join('file://', __dirname, 'managerFunc.html');
              ipc.send("load-page", modalPath, 500, 425);
              remote.getCurrentWindow().close();
              return;
            } else if (row.USERTYPE === 'mv') {
              approved = true;
              modalPath = path.join('file://', __dirname, 'managervisFunc.html');
              ipc.send("load-page", modalPath, 500, 425);
              remote.getCurrentWindow().close();
              return;
            } else if (row.USERTYPE === 's') {
              approved = true;
              modalPath = path.join('file://', __dirname, 'staffFunc.html');
              ipc.send("load-page", modalPath, 500, 425);
              remote.getCurrentWindow().close();
              return;
            } else if (row.USERTYPE === 'sv') {
              approved = true;
              modalPath = path.join('file://', __dirname, 'staffvisFunc.html');
              ipc.send("load-page", modalPath, 500, 425);
              remote.getCurrentWindow().close();
              return;
            }
          } else {
            unapproved = true;
          }
        }
      }
    }
  );

  if (!unapproved) {
    incorrectInfo = true;
  }
  //console.log(unapproved);
  if (incorrectInfo && !approved) {
    dialog.showErrorBox('Incorrect login data.', 'Make sure your email or password is correct.')
  } else if (unapproved && !approved) {
    dialog.showErrorBox('Account not approved.', 'Account needs to be approved first.')
  }
  //console.log(incorrectInfo);
  });
})

registerBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'add.html')
  ipc.send("load-page", modalPath, 500, 425);
  remote.getCurrentWindow().close();
  //ipc.send('load-page', 'file://' + __dirname + '/add.html');
  /*let win = new BrowserWindow({ frame: true, width: 500, height: 375 })
  win.on('close', function () { win = null })
  win.loadURL(modalPath)
  win.show()*/
})

function getUserName(callback) {

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

//var price = document.querySelector('h1')
//var targetPrice = document.getElementById('targetPrice')
//var targetPriceVal

/*const notification = {
    title: 'BTC Alert',
    body: 'BTC just beat your target price!',
    icon: path.join(__dirname, '../assets/images/btc.png')
}

function getBTC() {
    axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD')
    .then(res => {
        const cryptos = res.data.BTC.USD
        price.innerHTML = '$'+cryptos.toLocaleString('en')

        if (targetPrice.innerHTML != '' && targetPriceVal < res.data.BTC.USD) {
            const myNotification = new window.Notification(notification.title, notification)
        }
    })
}
getBTC();
setInterval ( getBTC, 10000 );*/
