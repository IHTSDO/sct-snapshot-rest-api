var express = require('express');
var router = express.Router();
var fs = require('fs');
var transform = require("../lib/transform");
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var serverDb;
var resourcesCol;

var mongoConnection = process.env['MONGO_DB_CONN'] || "localhost:27017";

MongoClient.connect("mongodb://" + mongoConnection + "/ca-edition", function(err, db) {
    if (err) {
        console.warn(err.message);
        process.exit();
    }
    serverDb = db;
    resourcesCol = db.collection("resources");
    console.log("Connected to server/resources db.")
});

router.get('/releases', function(req, res) {
    resourcesCol.find().toArray(function(err, doc) {
        if (err) {
            console.log(err.message);
        }
        if (doc) {
            res.status(200);
            res.header('Content-Type', 'application/json');
            var result=transform.getManifestsV1(doc);
            res.send(result);
        } else {
            res.status(200);
            res.send("Manifest not found for id = " + idParam);
        }
    });
});

router.get('/releases/:id', function(req, res) {
    var idParam = ObjectID.createFromHexString(req.params.id);
    if (idParam) {
        resourcesCol.find({_id: idParam}).nextObject(function(err, doc) {
            if (err) {
                console.log(err.message);
            }
            if (doc) {
                res.status(200);
                res.header('Content-Type', 'application/json');
                var result=transform.getManifestV1(doc);
                res.send(result);
            } else {
                res.status(200);
                res.send("Manifest not found for id = " + idParam);
            }

        });
    } else {
        res.status(200);
        res.send("Not a valid id");
    }

});


module.exports = router;

// Manifest model
var sampleManifest = {
    id: "4b7865c0-18e0-11e4-8c21-0800200c9a66",
    resourceSetName: "International Edition",
    effectiveTime: "20140731",
    databaseName: "en-edition",
    collectionName: "20140731",
    expirationDate: "20150201",
    modules: [
        {sctid: 900000000000207008, defaultTerm: "SNOMED CT core module"},
        {sctid: 900000000000012004, defaultTerm: "SNOMED CT model component module"}
    ],
    languageRefsets: [
        {sctid: 900000000000509007, defaultTerm: "US English"},
        {sctid: 900000000000508004, defaultTerm: "GB English"}
    ],
    refsets: [
        {sctid: 900000000000497000, defaultTerm: "CTV3 simple map"},
        {sctid: 446608001, defaultTerm: "ICD-O simple map reference set"},
        {sctid: 447566000, defaultTerm: "Virtual medicinal product simple reference set"}
    ],
    defaultTermLangCode: "en",
    defaultTermType: 900000000000003001,
    textIndexNormalized: true
}