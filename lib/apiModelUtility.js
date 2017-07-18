var snomedLib = require("./snomed");

module.exports.convertToV1 = function(concept) {
    if (typeof concept.module == "string") {
        var moduleId = concept.module + "";
        concept.module = {
            conceptId: moduleId,
            preferredTerm: modules[moduleId]
        };
    }
    if (typeof concept.definitionStatus == "string") {
        if (concept.definitionStatus == "Primitive") {
            concept.definitionStatus = {
                conceptId: "900000000000074008",
                preferredTerm: "Primitive"
            }
        } else {
            concept.definitionStatus = {
                conceptId: "900000000000073002",
                preferredTerm: "Defined"
            }
        }
    }
};

var modules = {}; // Load this modules cache on startup

module.exports.loadModules = function(databaseName, collectionName) {
    snomedLib.loadModules(databaseName, collectionName, function(dbModules) {
        modules = dbModules;
        console.log("Modules cache initialized");
    });
};