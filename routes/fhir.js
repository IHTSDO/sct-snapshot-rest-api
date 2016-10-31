/**
 * Created by alo on 10/31/16.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var capabilityStatement = require('./capabilityStatement').capabilityStatement;

var serverDb;
var resourcesCol;

MongoClient.connect("mongodb://localhost:27017/server", function(err, db) {
    if (err) {
        console.warn(getTime() + " - " + err.message);
        res.status(500);
        res.send(err.message);
        return;
    }
    serverDb = db;
    resourcesCol = db.collection("resources");
    console.log("Connected to server/resources db.")
});

router.get('/metadata', function(req, res) {
    res.status(200);
    res.send(capabilityStatement);
});

router.get('/CodeSystem/:system/([\$])lookup', function(req, res) {
    var code = "";
    if (!req.query["code"]) {
        // Bad request
    } else {
        code = req.query["code"];
    }
    res.status(200);
    res.send({system: req.params.system, code: code});
});

router.get('/CodeSystem/([\$])lookup', function(req, res) {
    var code = "";
    if (!req.query["code"]) {
        // Bad request
    } else {
        code = req.query["code"];
    }
    var system = "";
    if (!req.query["system"]) {
        // Bad request
    } else {
        system = req.query["system"];
    }
    res.status(200);
    res.send({system: system, code: code});
});

module.exports = router;
