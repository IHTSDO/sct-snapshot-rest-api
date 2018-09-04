/**
 * Created by tbertonatti on 11/1/16.
 */
var MongoClient = require('mongodb').MongoClient;
var databases = {};

var performMongoDbRequest = function(databaseName, callback) {
    if (databases[databaseName]) {
        callback(databases[databaseName]);
    } else {
        //console.log("Connecting");
        MongoClient.connect("mongodb://localhost:27017/"+databaseName, function(err, db) {
            if (err) {
                console.warn(getTime() + " - " + err.message);
                res.status(500);
                res.send(err.message);
                return;
            }
            //console.log("Connection OK")
            databases[databaseName] = db;
            callback(db);
        });
    }
};
var getObject = function(dbP, collectionP, query, options, callback){
    performMongoDbRequest(dbP, function(db){
        var collection = db.collection(collectionP);
        //var query = { '$or': [ {'conceptId': conceptId }, {'conceptId': parseInt(conceptId) } ]};
        //collection.find(query, options).nextObject(function(err, doc) {
        collection.find(query, options, function(err, cursor) {
            if (err) {
                callback(err.message);
            }else{
                cursor.toArray(function(err, docs) {
                    if (err){
                        callback(err.message);
                    }else if (docs) {
                        callback(false, docs);
                    } else {
                        callback("Docs not found for = " + JSON.stringify(query));
                    }
                });
            }
        });
    });
};

var getConcept = function(dbP, collectionP, conceptId, options, callback){
    getObject(dbP, collectionP, {'$or': [ {'conceptId': conceptId }, {'conceptId': parseInt(conceptId) } ]}, options, function(err, docs){
        if (err) callback(err);
        else if (docs) callback(false, docs[0]);
    });
};

var getDescriptions = function(dbP, collectionP, conceptId, descriptionId, options, callback){
    getConcept(dbP, collectionP, conceptId, options, function(err, doc){
        if (err) callback(err);
        else if (doc){
            var result = [];
            doc.descriptions.forEach(function(desc) {
                if (descriptionId) {
                    if (parseInt(descriptionId) == desc.descriptionId || descriptionId == desc.descriptionId) {
                        result.push(desc);
                    }
                } else {
                    result.push(desc);
                }
            });
            callback(false, result);
        }
    });
};

var getRelationShips = function(dbP, collectionP, conceptId, form, options, callback){
    getConcept(dbP, collectionP, conceptId, options, function(err, doc) {
        if (err) callback(err);
        else if (doc) {
            var result = [];
            if (form == "all" || form == "inferred") {
                doc.relationships.forEach(function(desc) {
                    result.push(desc);
                });
            }
            if (form == "all" || form == "stated") {
                doc.statedRelationships.forEach(function(desc) {
                    result.push(desc);
                });
            }
            callback(false, result);
        }
    });
};

var getParents = function (dbP, collectionP, conceptId, form, options, callback) {
    getConcept(dbP, collectionP, conceptId, options, function(err, doc) {
        if (err) callback(err);
        else if (doc) {
            var result = [];
            if (typeof doc.relationships != 'undefined') {
                if (form) {
                    if (form == "inferred" && doc.relationships) {
                        doc.relationships.forEach(function(rel) {
                            if (rel.active == true && (rel.type.conceptId == 116680003 || rel.type.conceptId == "116680003")) {
                                result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm, definitionStatus: rel.target.definitionStatus, module: rel.target.module, statedDescendants: rel.target.statedDescendants});
                            }
                        });
                    } else if (form == "stated" && doc.statedRelationships) {
                        doc.statedRelationships.forEach(function(rel) {
                            if (rel.active == true && (rel.type.conceptId == 116680003 || rel.type.conceptId == "116680003")) {
                                result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm, definitionStatus: rel.target.definitionStatus, module: rel.target.module, statedDescendants: rel.target.statedDescendants});
                            }
                        });
                    }
                } else if (doc.relationships) {
                    doc.relationships.forEach(function(rel) {
                        if (rel.active == true && (rel.type.conceptId == 116680003 || rel.type.conceptId == "116680003")) {
                            result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm, definitionStatus: rel.target.definitionStatus, module: rel.target.module});
                        }
                    });
                }
            }
            callback(false, result);
        }
    });
};

var getMembers = function (dbP, collectionP, conceptId, options, callback) {
    var query = {"memberships": {"$elemMatch": {"refset.conceptId": conceptId, "active": true}}};
    if (options.filter) {
        var searchTerm = "\\b" + regExpEscape(options.filter).toLowerCase();
        query.defaultTerm = {"$regex": searchTerm, "$options":"i"};
    }
    if (options.activeOnly == "true" ) {
        query.active = "true";
    }
    //console.log(JSON.stringify(query));
    var getTotalOf = function(refsetId, callback){
        getObject("server", "resources",{"databaseName" : dbP, "collectionName": collectionP.replace("v", "")}, {refsets: 1}, function(err, docs){
            if (err){
                callback(err);
            }else{
                var total = 0, error = "No refset matching in the manifest";
                docs[0].refsets.forEach(function(refset){
                    if (refset.conceptId == refsetId){
                        error = false;
                        total = refset.count;
                    }
                });
                callback(error, total);
            }
        });
    };
    getTotalOf(conceptId, function(err, totalR){
        var total = totalR;
        if (err) total = err;
        getObject(dbP, collectionP, query, options, function(err, docs){
            if (err) callback(err);
            else{
                var result = {};
                result.members = [];
                result.details = {'total': total, 'refsetId': conceptId };
                if (docs && docs.length > 0)
                    result.members = docs;
                callback(false, result);
            }
        });
    });
};

var searchDescription = function(dbP, collectionP, filters, query, options, callback){
    console.log("Search" , JSON.stringify(query));
    var start = Date.now();
    var processMatches = function(docs){
        var dbDuration = Date.now() - start;
        var result = {};
        result.matches = [];
        result.details = {'total': 0, 'skipTo': filters.skipTo, 'returnLimit': filters.returnLimit};
        result.filters = {};
        result.filters.lang = {};
        result.filters.semTag = {};
        result.filters.module = {};
        result.filters.refsetId = {};
        if (docs && docs.length > 0) {
            result.details = {'total': docs.length, 'skipTo': filters.skipTo, 'returnLimit': filters.returnLimit};
            if (filters.idParamStr == docs[0].descriptionId) {
                result.matches.push({"term": docs[0].term, "conceptId": docs[0].conceptId, "active": docs[0].active, "conceptActive": docs[0].conceptActive, "fsn": docs[0].fsn, "module": docs[0].module});
                callback(false, result);
            } else {
                var matchedDescriptions = docs.slice(0);
                if (filters.searchMode == "regex" || filters.searchMode == "partialMatching") {
                    matchedDescriptions.sort(function (a, b) {
                        if (a.term.length < b.term.length)
                            return -1;
                        if (a.term.length > b.term.length)
                            return 1;
                        return 0;
                    });
                }
                var count = 0;
                var conceptIds = [];
                matchedDescriptions.forEach(function(doc) {
                    var refsetOk = false;
                    if (doc.refsetIds){
                        doc.refsetIds.forEach(function (refset){
                            if (refset == filters.refsetFilter){
                                refsetOk = true;
                            }
                        });
                    }
                    if (filters.semanticFilter == "none" || (filters.semanticFilter == doc.semanticTag)) {
                        if (filters.langFilter == "none" || (filters.langFilter == doc.lang)) {
                            if (filters.moduleFilter == "none" || (filters.moduleFilter == doc.module)) {
                                if (filters.refsetFilter == "none" || refsetOk) {
                                    if (!filters["groupByConcept"] || conceptIds.indexOf(doc.conceptId) == -1) {
                                        conceptIds.push(doc.conceptId);

                                        if (count >= filters.skipTo && count < (filters.skipTo + filters.returnLimit)) {
                                            result.matches.push({"term": doc.term, "conceptId": doc.conceptId, "active": doc.active, "conceptActive": doc.conceptActive, "fsn": doc.fsn, "module": doc.module, "definitionStatus": doc.definitionStatus});
                                        }
                                        if (result.filters.semTag.hasOwnProperty(doc.semanticTag)) {
                                            result.filters.semTag[doc.semanticTag] = result.filters.semTag[doc.semanticTag] + 1;
                                        } else {
                                            result.filters.semTag[doc.semanticTag] = 1;
                                        }
                                        if (result.filters.lang.hasOwnProperty(doc.lang)) {
                                            result.filters.lang[doc.lang] = result.filters.lang[doc.lang] + 1;
                                        } else {
                                            result.filters.lang[doc.lang] = 1;
                                        }
                                        if (result.filters.module.hasOwnProperty(doc.module)) {
                                            result.filters.module[doc.module] = result.filters.module[doc.module] + 1;
                                        } else {
                                            result.filters.module[doc.module] = 1;
                                        }
                                        if (doc.refsetIds) {
                                            doc.refsetIds.forEach(function (refset) {
                                                if (result.filters.refsetId.hasOwnProperty(refset)) {
                                                    result.filters.refsetId[refset] = result.filters.refsetId[refset] + 1;
                                                } else {
                                                    result.filters.refsetId[refset] = 1;
                                                }
                                            });
                                        }
                                        count = count + 1;
                                    }
                                }
                            }
                        }
                    }
                });
                result.details.total = count;
                callback(false, result);
            }
        } else {
            var duration = Date.now() - start;
            result.matches = [];
            result.details = {'total': 0, 'skipTo': filters.skipTo, 'returnLimit': filters.returnLimit};
            callback(false, result);
        }
    };
    if (filters.searchMode == "regex" || filters.searchMode == "partialMatching") {
        console.log("Entering part match search");
        getObject(dbP, collectionP + "tx", query, options, function(err, docs){
            console.log("Result: ", docs.length);
            processMatches(docs);
        });
    } else {
        performMongoDbRequest(dbP, function(db) {
            var collection = db.collection(collectionP + 'tx');
            collection.find(query, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" }, length: 1 }, function (err, cursor) {
                if (err) processMatches([]);
                else{
                    cursor.toArray(function(err, docs) {
                        processMatches(docs);
                    });
                }
            });
        });
    }
};

var getTime = function() {
    var currentdate = new Date();
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
        + (currentdate.getMonth()+1)  + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    return datetime;
};

module.exports.getObject = getObject;
module.exports.getConcept = getConcept;
module.exports.getDescriptions = getDescriptions;
module.exports.getRelationShips = getRelationShips;
module.exports.getParents = getParents;
module.exports.getMembers = getMembers;
module.exports.searchDescription = searchDescription;

var regExpEscape = function(s) {
    return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
    replace(/\x08/g, '\\x08');
};