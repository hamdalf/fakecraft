"use strict";

/*
    Load Dependencies
*/
var express = require("express");
var path = require("path");

// Instace of an express.js app
var app = express();

// specifies this directory is cleared for serving static files
app.use(express.static(path.join(__dirname, "static")));

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
    console.log('Root directory is %s', __dirname);
});