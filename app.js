var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
const rand = require("random-key");
const CryptoJS = require("crypto-js");

var indexRouter = require('./routes/index');
var notesRouter = require('./routes/notes');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("32wedf234%"));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/notes', notesRouter);

app.post('/users', function (req, res, next) {
    
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        port: "3307",
        database: "notes"
    });

    con.connect(function (err) {
        /*Placeholder saltkey*/
        con.query(`SELECT password FROM users WHERE email = "${req.body.email}"`, 
        function (err, result, fields) {
            if (req.body.password == CryptoJS.AES.decrypt(result[0].password,"'8Q/b}DZ+Q&K8fub").toString(CryptoJS.enc.Utf8)){
                con.query(`SELECT CAST(id AS CHAR) id, email FROM users WHERE email = "${req.body.email}"`, 
                function (err, result, fields) {
                    console.log(err);
                    if (err) {
                        res.status(500).send("Server error!");
                    } 
                    else {
                        res.cookie("userId", result[0].id, {signed: true, maxage: 3600});
                        res.cookie("userEmail", result[0].email, {signed: true, maxage: 3600});
                        res.send(result);
                    }
                });
            }
        })
    });
})

app.post('/users/reg', function (req, res, next) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        port: "3307",
        database: "notes"
    });

    con.connect(function (err) {
        let newId = rand.generateDigits(9);
        /*Placeholder saltkey*/
        let newPass = CryptoJS.AES.encrypt(req.body.password,"'8Q/b}DZ+Q&K8fub").toString();
        con.query(`INSERT INTO users(id, email, password) VALUES ("${newId}","${req.body.email}","${newPass}")`,
        function (err, result, fields) {
            if (err) {
                console.log(err);
                res.status(403).send("Email already exists in database!");
            } 
            else {
                res.send("New user registered! Please log in with your new username and password!");
            }
        });
    });

})

module.exports = app;
