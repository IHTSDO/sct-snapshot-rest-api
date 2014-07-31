var express = require('express');
var router = express.Router();
var fs = require('fs');

var path = require('path');
// find the first module to be loaded
var topModule = module;
while(topModule.parent)
    topModule = topModule.parent;
var appDir = path.dirname(topModule.filename);


router.get('/releases', function(req, res) {
    //TODO: retrieve manifests from db and return the list
});

router.get('/releases:id', function(req, res) {
    var idParam = parseInt(req.params.id);
    //TODO: retrieve single manifest using id
});


module.exports = router;

// Manifest model
var sampleManifest = {
    id: "4b7865c0-18e0-11e4-8c21-0800200c9a66",
    editionName: "International Edition",
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