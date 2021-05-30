var express = require('express');
var router = express.Router();
var mysql = require('mysql'); 

/* GET home page. */
router.get('/', function(req, res, next) {

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "s@fetyD@NCE",
  database: "notes"
});

con.connect(function(err) {
  let test;
  if (err) throw err;
  con.query("SELECT DISTINCT productLine FROM products", function (err, result, fields) {
    if (err) throw err;
    test = JSON.parse(JSON.stringify(result));
    console.log(test[0].productLine);
  });

  con.query("SELECT * FROM products WHERE productLine ='Classic Cars'", function (err, result, fields) {
    if (err) throw err;
    test = JSON.parse(JSON.stringify(result));
    console.log(test);
  });

  
});

  res.render('index', { title: 'Gluegle' });
});

module.exports = router;
