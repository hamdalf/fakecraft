"use strict";

/*
    Load Dependencies
*/
var express = require("express"),
    app = express(),
    path = require("path"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser");
    
mongoose.connect('mongodb://localhost/officemap');
mongoose.connection.on('error', function (ex) {
    console.log('database connection error: ' + ex.message);
});
mongoose.connection.on('connected', function () {
    console.log('officemap database connection open');
});
mongoose.connection.on('disconnected', function () {
    console.log('officemap database connection closed');
});

// Load routers
var userRouters = require('./routes/users');

// specifies this directory is cleared for serving static files
app.use(express.static(path.join(__dirname, "static")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', userRouters);

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
    console.log('Root directory is %s', __dirname);
});

//module.exports = app;