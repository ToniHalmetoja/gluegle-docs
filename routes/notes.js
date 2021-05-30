var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const rand = require("random-key");
const sqlString = require("sqlstring");

router.post('/', function (req, res, next) {

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: "3307",
    database: "notes"
  });

  con.connect(function (err) {

    if (req.body.action == "getTitles") {
      let id = sqlString.escape(req.body.id);
      con.query(`SELECT CAST(keyid AS CHAR) keyid, title
      FROM saved 
      WHERE creator = ${id}`, function (err, result, fields) {
        if (err) throw err;
        res.send(result);
      });
    } 
    
    else if (req.body.action == "getContent") {
      let id = req.body.id;
      let keyid = req.body.keyid;
      con.query(`SELECT content, title, keyid 
    FROM saved 
    WHERE creator = ${id} 
    AND keyid = ${keyid}`,
        function (err, result, fields) {
          if (err) {
            res.status(500).send("Server error!");
          } else {
            res.send({title:result[0].title, content:result[0].content.toString(), key:result[0].keyid});
          }
        });
    } 
    
    else if (req.body.action == "saveFile") {
      let saveContent = sqlString.escape(req.body.content);
      let key = req.body.keyid;
      let id = req.body.id;
      con.query(`UPDATE saved 
    SET content = ${saveContent} 
    WHERE keyid = ${key} 
    AND creator = ${id}`,
        function (err, result, fields) {
          if (err) {
            console.log(err);
            res.status(500).send("Server error!");
          } else {
            res.send("Saved!");
          }
        });
    } 
    
    else if (req.body.action == "newFile") {
      let newKey = rand.generateDigits(9);
      let id = sqlString.escape(req.body.id);
      let title = sqlString.escape(req.body.title);
      con.query(`INSERT INTO saved(keyid, creator, title, content) 
                VALUES (${newKey},${id},${title},"")`,
        function (err, result, fields) {
          if (err) {
            console.log(err);
            res.status(403).send("Title too long! Please choose a shorter one.");
          } else {
            res.send(newKey);
          }
        });
    }

    else if (req.body.action == "deleteDoc") {
      con.query(`DELETE FROM saved WHERE keyid=${req.body.keyid} AND creator=${req.body.id}`,
        function (err, result, fields) {
          if (err) {
            console.log(err);
          } else {
            res.send("File deleted");
          }
        });
    }

  });

});

module.exports = router;