var express = require('express');
var router = express.Router();
var winston = require('winston');
var MongoClient = require('mongodb').MongoClient;

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: '/root/concepts-json/node_modules/sct-snapshot-rest-api/search.log' })
    ]
});

//console.log("ÁáéÉ\u03A8 --> " + util.removeDiacritics("ÁáéÉ\u03A8"));
//var regextxt = "^186^1$1/1";
//console.log(regextxt + " --> " + util.regExpEscape(regextxt));

var databases = {};

var performMongoDbRequest = function(databaseName, callback) {
    if (databases[databaseName]) {
        //console.log("Using cache");
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
}

router.get('/:db/:collection/concepts/:sctid?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var idParamStr = req.params.sctid;
    var query = { '$or': [ {'conceptId': idParam }, {'conceptId': idParamStr } ]};
    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    performMongoDbRequest(req.params.db, function(db) {
        var collection = db.collection(req.params.collection);
        collection.find(query, options).nextObject(function(err, doc) {
            if (err) {
                console.log(err.message);
            }
            if (doc) {
                res.status(200);
                res.header('Content-Type', 'application/json');
                res.send(doc);
            } else {
                res.status(200);
                res.send("Concept not found for ConceptId = " + idParam);
            }

        });
    });
});

router.get('/:db/:collection/concepts/:sctid/descriptions/:descriptionId?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var idParamStr = req.params.sctid;
    var query = { '$or': [ {'conceptId': idParam }, {'conceptId': idParamStr } ]};
    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            if (o == "limit" || o == "skip") {
                options[o] = parseInt(req.query[o]);
            } else {
                options[o] = JSON.parse(req.query[o]);
            }
        }
    }
    performMongoDbRequest(req.params.db, function(db) {
        var collection = db.collection(req.params.collection);
        collection.find(query, options, function(err, cursor) {
            cursor.toArray(function(err, docs) {
                var result = [];
                if (docs && docs.length > 0) {
                    docs[0].descriptions.forEach(function(desc) {
                        if (req.params.descriptionId) {
                            if (parseInt(req.params.descriptionId) == desc.descriptionId || req.params.descriptionId == desc.descriptionId) {
                                result.push(desc);
                            }
                        } else {
                            result.push(desc);
                        }
                    });
                    res.status(200);
                    res.send(result);
                } else {
                    res.status(200);
                    res.send([]);
                }
            });
        });
    });
});

router.get('/:db/:collection/concepts/:sctid/relationships?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var idParamStr = req.params.sctid;
    var query = { '$or': [ {'conceptId': idParam }, {'conceptId': idParamStr } ]};
    var form = "all";
    if (req.query["form"]) {
        form = req.query["form"];
    }

    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }

    performMongoDbRequest(req.params.db, function(db) {
        var collection = db.collection(req.params.collection);
        collection.find(query, options, function(err, cursor) {
            cursor.toArray(function(err, docs) {
                var result = [];
                if (docs && docs.length > 0) {
                    if (form == "all" || form == "inferred") {
                        docs[0].relationships.forEach(function(desc) {
                            result.push(desc);
                        });
                    }
                    if (form == "all" || form == "stated") {
                        docs[0].statedRelationships.forEach(function(desc) {
                            result.push(desc);
                        });
                    }
                    res.status(200);
                    res.send(result);
                } else {
                    res.status(200);
                    res.send([]);
                }
            });
        });
    });
});

router.get('/:db/:collection/concepts/:sctid/children?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var idParamStr = req.params.sctid;
    var query = {"relationships": {"$elemMatch": {"$or": [ {"target.conceptId": idParam, "type.conceptId": 116680003 }, {"target.conceptId": idParamStr , "type.conceptId": "116680003"} ], "active": true}}};
    if (req.query["form"]) {
        if (req.query["form"] == "inferred") {
            query = {"relationships": {"$elemMatch": {"$or": [ {"target.conceptId": idParam, "type.conceptId": 116680003 }, {"target.conceptId": idParamStr , "type.conceptId": "116680003"} ], "active": true }}};
        }
        if (req.query["form"] == "stated") {
            query = {"statedRelationships": {"$elemMatch": {"$or": [ {"target.conceptId": idParam, "type.conceptId": 116680003 }, {"target.conceptId": idParamStr , "type.conceptId": "116680003"} ], "active": true }}};
        }

    }

    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    options["fields"] = {"defaultTerm": 1, "conceptId": 1, "active": 1, "definitionStatus": 1, "module": 1, "isLeafInferred": 1,"isLeafStated": 1};
    performMongoDbRequest(req.params.db, function(db) {
        var collection = db.collection(req.params.collection);
        collection.find(query, options, function(err, cursor) {
            cursor.toArray(function(err, docs) {
                var result = [];
                if (docs && docs.length > 0) {
                    docs.forEach(function(doc) {
                        result.push(doc);
                    });
                    res.status(200);
                    res.send(result);
                } else {
                    res.status(200);
                    res.send(result);
                }
            });
        });
    });
});

router.get('/:db/:collection/concepts/:sctid/references?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var idParamStr = req.params.sctid;
    var query = {"relationships": {"$elemMatch": {"$or": [ {"target.conceptId": idParam }, {"target.conceptId": idParamStr } ], "active": true}}};
    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }

    if (req.query["form"]) {
        if (req.query["form"] == "inferred") {
            query = {"relationships": {"$elemMatch": {"$or": [ {"target.conceptId": idParam }, {"target.conceptId": idParamStr } ], "active": true}}};
//            options["relationships"] = {"$elemMatch": {"target.conceptId": idParam, "active": true}};
            options["fields"] = {"relationships": {"$elemMatch": {"$or": [ {"target.conceptId": idParam }, {"target.conceptId": idParamStr } ], "active": true}}, "defaultTerm": 1, "conceptId": 1, "active": 1, "definitionStatus": 1, "effectiveTime": 1, "module": 1};
        }
        if (req.query["form"] == "stated") {
            query = {"statedRelationships": {"$elemMatch": {"$or": [ {"target.conceptId": idParam }, {"target.conceptId": idParamStr } ], "active": true}}};
            options["fields"] = {"statedRelationships": {"$elemMatch": {"$or": [ {"target.conceptId": idParam }, {"target.conceptId": idParamStr } ], "active": true}}, "defaultTerm": 1, "conceptId": 1, "active": 1, "definitionStatus": 1, "effectiveTime": 1, "module": 1};
        }
    }

//    .findOne({"relationships": {"$elemMatch": {"target.conceptId": idParam, "active": true}}},{"relationships": {"$elemMatch": {"target.conceptId": idParam, "active": true}}

    performMongoDbRequest(req.params.db, function(db) {
        var collection = db.collection(req.params.collection);
        collection.find(query, options, function(err, cursor) {
            cursor.toArray(function(err, docs) {
                var result = [];
                if (docs && docs.length > 0) {
                    docs.forEach(function(doc) {
                        result.push(doc);
                    });
                    res.status(200);
                    res.send(result);
                } else {
                    res.status(200);
                    res.send(result);
                }
            });
        });
    });
});

router.get('/:db/:collection/concepts/:sctid/parents?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var idParamStr = req.params.sctid;
    var query = {"$or": [ {"conceptId": idParam }, {"conceptId": idParamStr } ]};
    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    options["fields"] = {"relationships": 1, "statedRelationships": 1};
    performMongoDbRequest(req.params.db, function(db) {
        var collection = db.collection(req.params.collection);
        collection.find(query, options, function(err, cursor) {
            cursor.toArray(function(err, docs) {
                if (docs && docs.length > 0) {
                    var result = [];
                    if (typeof docs[0].relationships != 'undefined') {
                        if (req.query["form"]) {
                            if (req.query["form"] == "inferred" && docs[0].relationships) {
                                docs[0].relationships.forEach(function(rel) {
                                    if (rel.active == true && (rel.type.conceptId == 116680003 || rel.type.conceptId == "116680003")) {
                                        result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm, definitionStatus: rel.target.definitionStatus, module: rel.target.module});
                                    }
                                });
                            } else if (req.query["form"] == "stated" && docs[0].statedRelationships) {
                                docs[0].statedRelationships.forEach(function(rel) {
                                    if (rel.active == true && (rel.type.conceptId == 116680003 || rel.type.conceptId == "116680003")) {
                                        result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm, definitionStatus: rel.target.definitionStatus, module: rel.target.module});
                                    }
                                });
                            }
                        } else if (docs[0].relationships) {
                            docs[0].relationships.forEach(function(rel) {
                                if (rel.active == true && (rel.type.conceptId == 116680003 || rel.type.conceptId == "116680003")) {
                                    result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm, definitionStatus: rel.target.definitionStatus, module: rel.target.module});
                                }
                            });
                        }
                    }
                    res.status(200);
                    res.send(result);
                } else {
                    res.status(200);
                    res.send([]);
                }
            });
        });
    });
});

router.get('/:db/:collection/concepts/:sctid/members?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var idParamStr = req.params.sctid;
    var query = {"memberships": {"$elemMatch": {"refset.conceptId": idParamStr, "active": true}}};

    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    options["fields"] = {"defaultTerm": 1, "conceptId": 1, "active": 1, "definitionStatus": 1, "module": 1, "isLeafInferred": 1,"isLeafStated": 1};
    if (!options.limit) {
        options.limit = 100;
    }
    if (!options.skip) {
        options.skip = 0;
    }
    var getTotalOf = function(refsetId, callback){
        performMongoDbRequest("server",function(db){
            var collection = db.collection("resources");
            collection.find({"databaseName" : req.params.db, "collectionName": req.params.collection.replace("v", "")}, {refsets: 1}, function(err, cursor) {
                if (err){
                    callback(err);
                }else{
                    cursor.toArray(function(err, docs) {
                        if (err)
                            callback(err);
                        else{
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
                }
            });
        });
    };

    getTotalOf(idParam, function(err, totalR){
        performMongoDbRequest(req.params.db, function(db) {
            var collection = db.collection(req.params.collection);
            //collection.count(query, function (err, total) {
            var total = totalR;
            if (err) total = err;
            // Performance update, only sort small refsets
            //if (total < 1000) {
            //    options.sort = {defaultTerm: 1};
            //}
            collection.find(query, options, function (err, cursor) {
                cursor.toArray(function (err, docs) {
                    var result = {};
                    result.members = [];
                    result.details = {'total': total, 'refsetId': idParam };
                    if (docs && docs.length > 0) {
                        result.members = docs;
                        res.status(200);
                        res.send(result);
                    } else {
                        res.status(200);
                        res.send(result);
                    }
                });
            });
            //});
        });
    });
});

router.get('/:db/:collection/descriptions/:sctid?', function(req, res) {
    var idParam = null;
    var idParamStr = null;
    var query = {'descriptions.descriptionId': 0};
    var searchMode = "regex";
    var searchTerm = null;
    var lang = "english";
    var semanticFilter = "none";
    var moduleFilter = "none";
    var langFilter = "none";
    var refsetFilter = "none";
    var statusFilter;
    var returnLimit = 100;
    var skipTo = 0;
    var start = Date.now();
    if (req.params.sctid) {
        idParam = parseInt(req.params.sctid);
        idParamStr = req.params.sctid;
        query = {"$or": [ {"descriptionId": idParam }, {"descriptionId": idParamStr } ]};
    } else {
        if (req.query["query"]) {
            if (!req.query["statusFilter"]) {
                statusFilter = 'activeOnly';
            } else {
                statusFilter = req.query["statusFilter"];
            }
            //console.log("statusFilter " + statusFilter);
            if (!req.query["searchMode"] || req.query["searchMode"] == "partialMatching") {
                searchMode = "partialMatching";
                searchTerm = req.query["query"];
                var words = searchTerm.split(" ");

                if (statusFilter == 'inactiveOnly') {
                    query = {"$and": [],"$or": [{"active": false},{"conceptActive": false}]};
                } else if (statusFilter == 'activeAndInactive') {
                    query = {"$and": []};
                } else {
                    query = {"$and": [], "active": true, "conceptActive": true};
                }

                words.forEach(function(word) {
                    if (req.query["normalize"] && req.query["normalize"] == "true") {
                        var expWord = "^" + removeDiacritics(regExpEscape(word).toLowerCase()) + ".*";
                        //console.log("Normalizing");
                    } else {
                        //console.log("Not normalizing");
                        var expWord = "^" + regExpEscape(word).toLowerCase() + ".*";
                    }
                    query.$and.push({"words": {"$regex": expWord}});
                });
            } else if (req.query["searchMode"] == "fullText") {
                //{ $text: { $search: <string>, $language: <string> } }
                searchMode = req.query["searchMode"];
                searchTerm = req.query["query"];
                if (statusFilter == 'inactiveOnly') {
                    query = {"$text": { "$search": searchTerm, "$language": lang }, "$or": [{"active": false},{"conceptActive": false}]};
                } else if (statusFilter == 'activeAndInactive') {
                    query = {"$text": { "$search": searchTerm, "$language": lang } };
                } else {
                    query = {"$text": { "$search": searchTerm, "$language": lang }, "$and": [{"active": true},{"conceptActive": true}]};
                }
            } else if (req.query["searchMode"] == "regex") {
                searchMode = req.query["searchMode"];
                searchTerm = req.query["query"];
                if (statusFilter == 'inactiveOnly') {
                    query = {"term": {"$regex": searchTerm}, "$or": [{"active": false},{"conceptActive": false}]};
                } else if (statusFilter == 'activeAndInactive') {
                    query = {"term": {"$regex": searchTerm}};
                } else {
                    query = {"term": {"$regex": searchTerm}, "$and": [{"active": true},{"conceptActive": true}]};
                }
            } else {
                res.status(400);
                res.send("Error: Search mode not supported (" + req.query["searchMode"] + ")");
            }
        } else {
            res.status(400);
            res.send("Error: Missing Query and missing SCTID, no search parameters.");
        }
    }

    if (req.query["lang"]) {
        lang = req.query["lang"];
    }
    if (req.query["semanticFilter"]) {
        semanticFilter = req.query["semanticFilter"];
    }
    if (req.query["moduleFilter"]) {
        moduleFilter = req.query["moduleFilter"];
    }
    if (req.query["langFilter"]) {
        langFilter = req.query["langFilter"];
    }
    if (req.query["refsetFilter"]) {
        refsetFilter = req.query["refsetFilter"];
    }
    if (req.query["returnLimit"]) {
        returnLimit = parseInt(req.query["returnLimit"]);
    }
    if (req.query["skipTo"]) {
        skipTo = parseInt(req.query["skipTo"]);
    }

    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    options["limit"] = 10000000;
    if (searchMode == "regex" || searchMode == "partialMatching" || searchMode == "fullText")  {
        performMongoDbRequest(req.params.db, function(db) {
            var collection = db.collection(req.params.collection + 'tx');
            function processMatches(cursor) {
                var dbDuration = Date.now() - start;
                //logger.log('info', "Starting in = " + (Date.now() - start));
                cursor.toArray(function(err, docs) {
                    //logger.log('info', "Arrayed in = " + (Date.now() - start) + " Array: " + docs.length);
                    var result = {};
                    result.matches = [];
                    result.details = {'total': 0, 'skipTo': skipTo, 'returnLimit': returnLimit};
                    result.filters = {};
                    result.filters.lang = {};
                    result.filters.semTag = {};
                    result.filters.module = {};
                    result.filters.refsetId = {};
                    if (docs && docs.length > 0) {
                        result.details = {'total': docs.length, 'skipTo': skipTo, 'returnLimit': returnLimit};
                        if (idParam == docs[0].descriptionId || idParamStr == docs[0].descriptionId) {
                            result.matches.push({"term": docs[0].term, "conceptId": docs[0].conceptId, "active": docs[0].active, "conceptActive": docs[0].conceptActive, "fsn": docs[0].fsn, "module": docs[0].module});
                            var duration = Date.now() - start;
                            logger.log('info', 'Search for ' + searchTerm + ' result = ' + docs.length, {searchTerm: searchTerm, database: req.params.db, collection: req.params.collection, searchMode: searchMode, language: lang, statusFilter: statusFilter, matches: docs.length, duration: duration, dbduration: dbDuration});
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            var matchedDescriptions = docs.slice(0);
                            //logger.log('info', "Sliced in = " + (Date.now() - start));
                            if (searchMode == "regex" || searchMode == "partialMatching") {
                                matchedDescriptions.sort(function (a, b) {
                                    if (a.term.length < b.term.length)
                                        return -1;
                                    if (a.term.length > b.term.length)
                                        return 1;
                                    return 0;
                                });
                            }
                            //logger.log('info', "Sorted in = " + (Date.now() - start));
                            var count = 0;

                            var conceptIds = [];

                            matchedDescriptions.forEach(function(doc) {
                                var refsetOk = false;
                                if (doc.refsetIds){
                                    doc.refsetIds.forEach(function (refset){
                                        if (refset == refsetFilter){
                                            refsetOk = true;
                                        }
                                    });
                                }
                                if (semanticFilter == "none" || (semanticFilter == doc.semanticTag)) {
                                    if (langFilter == "none" || (langFilter == doc.lang)) {
                                        if (moduleFilter == "none" || (moduleFilter == doc.module)) {
                                            if (refsetFilter == "none" || refsetOk) {
                                                if (!req.query["groupByConcept"] || conceptIds.indexOf(doc.conceptId) == -1) {
                                                    conceptIds.push(doc.conceptId);

                                                    if (count >= skipTo && count < (skipTo + returnLimit)) {
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
//                                                if (result.filters.refsetId.hasOwnProperty(doc))
                                                    count = count + 1;
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                            result.details.total = count;
                            //logger.log('info', "Written in = " + (Date.now() - start));
                            var duration = Date.now() - start;
                            logger.log('info', 'Search for ' + searchTerm + ' result = ' + docs.length, {searchTerm: searchTerm, database: req.params.db, collection: req.params.collection, searchMode: searchMode, language: lang, statusFilter: statusFilter, moduleFilter: moduleFilter, matches: docs.length, duration: duration, dbduration: dbDuration});
                            res.header('Content-Type', 'application/json');
                            res.status(200);
                            res.send(result);
                        }
                    } else {
                        var duration = Date.now() - start;
                        //logger.log('info', 'Search for ' + searchTerm + ' result = ' + docs.length, {searchTerm: searchTerm, database: req.params.db, collection: req.params.collection, searchMode: searchMode, language: lang, statusFilter: statusFilter, matches: docs.length, duration: duration, dbduration: dbDuration});
                        var result = {};
                        result.matches = [];
                        result.details = {'total': 0, 'skipTo': skipTo, 'returnLimit': returnLimit};
                        res.send(result);
                    }
                });
            }
            if (searchMode == "regex" || searchMode == "partialMatching") {
                collection.find(query, options, function(err, cursor) {
                    if (err) {
                        console.warn(getTime() + " - " + err.message);
                        res.status(500);
                        res.send(err.message);
                        return;
                    }
                    processMatches(cursor);
                });
            } else {
                collection.find(query, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" }, length: 1 }, function (err, cursor) {
                    if (err) {
                        console.warn(getTime() + " - " + err.message);
                        res.status(500);
                        res.send(err.message);
                        return;
                    }
                    processMatches(cursor);
                });
            }
        });
    } else {
        res.status(400);
        res.send("Error: Search mode not supported (" + req.query["searchMode"] + ")");
    }
});

var levDist = function(s, t) {
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n == 0)
        return m;
    if (m == 0)
        return n;

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--)
        d[i] = [];

    // Step 2
    for (var i = n; i >= 0; i--)
        d[i][0] = i;
    for (var j = m; j >= 0; j--)
        d[0][j] = j;

    // Step 3
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (var j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4)
                return n;

            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

            if (b < mi)
                mi = b;
            if (c < mi)
                mi = c;

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }

    // Step 7
    return d[n][m];
}

var defaultDiacriticsRemovalMap = [
    {'base':'a','letters':/[\u00E1\u00E2\u00E3\u00E4\u00E5\u0101\u0103\u0105\u01CE\u01FB\u00C0\u00C4]/g},
    {'base':'ae','letters':/[\u00E6\u01FD]/g},
    {'base':'c','letters':/[\u00E7\u0107\u0109\u010B\u010D]/g},
    {'base':'d','letters':/[\u010F\u0111\u00F0]/g},
    {'base':'e','letters':/[\u00E8\u00E9\u00EA\u00EB\u0113\u0115\u0117\u0119\u011B]/g},
    {'base':'f','letters':/[\u0192]/g},
    {'base':'g','letters':/[\u011D\u011F\u0121\u0123]/g},
    {'base':'h','letters':/[\u0125\u0127]/g},
    {'base':'i','letters':/[\u00ED\u00EC\u00EE\u00EF\u0129\u012B\u012D\u012F\u0131]/g},
    {'base':'ij','letters':/[\u0133]/g},
    {'base':'j','letters':/[\u0135]/g},
    {'base':'k','letters':/[\u0137\u0138]/g},
    {'base':'l','letters':/[\u013A\u013C\u013E\u0140\u0142]/g},
    {'base':'n','letters':/[\u00F1\u0144\u0146\u0148\u0149\u014B]/g},
    {'base':'o','letters':/[\u00F2\u00F3\u00F4\u00F5\u00F6\u014D\u014F\u0151\u01A1\u01D2\u01FF]/g},
    {'base':'oe','letters':/[\u0153]/g},
    {'base':'r','letters':/[\u0155\u0157\u0159]/g},
    {'base':'s','letters':/[\u015B\u015D\u015F\u0161]/g},
    {'base':'t','letters':/[\u0163\u0165\u0167]/g},
    {'base':'u','letters':/[\u00F9\u00FA\u00FB\u00FC\u0169\u016B\u016B\u016D\u016F\u0171\u0173\u01B0\u01D4\u01D6\u01D8\u01DA\u01DC]/g},
    {'base':'w','letters':/[\u0175]/g},
    {'base':'y','letters':/[\u00FD\u00FF\u0177]/g},
    {'base':'z','letters':/[\u017A\u017C\u017E]/g},
    {'base':'A','letters':/[\u00C1\u00C2\u00C3\uCC04\u00C5\u00E0\u0100\u0102\u0104\u01CD\u01FB]/g},
    {'base':'AE','letters':/[\u00C6]/g},
    {'base':'C','letters':/[\u00C7\u0106\u0108\u010A\u010C]/g},
    {'base':'D','letters':/[\u010E\u0110\u00D0]/g},
    {'base':'E','letters':/[\u00C8\u00C9\u00CA\u00CB\u0112\u0114\u0116\u0118\u011A]/g},
    {'base':'G','letters':/[\u011C\u011E\u0120\u0122]/g},
    {'base':'H','letters':/[\u0124\u0126]/g},
    {'base':'I','letters':/[\u00CD\u00CC\u00CE\u00CF\u0128\u012A\u012C\u012E\u0049]/g},
    {'base':'IJ','letters':/[\u0132]/g},
    {'base':'J','letters':/[\u0134]/g},
    {'base':'K','letters':/[\u0136]/g},
    {'base':'L','letters':/[\u0139\u013B\u013D\u013F\u0141]/g},
    {'base':'N','letters':/[\u00D1\u0143\u0145\u0147\u0149\u014A]/g},
    {'base':'O','letters':/[\u00D2\u00D3\u00D4\u00D5\u00D6\u014C\u014E\u0150\u01A0\u01D1]/g},
    {'base':'OE','letters':/[\u0152]/g},
    {'base':'R','letters':/[\u0154\u0156\u0158]/g},
    {'base':'S','letters':/[\u015A\u015C\u015E\u0160]/g},
    {'base':'T','letters':/[\u0162\u0164\u0166]/g},
    {'base':'U','letters':/[\u00D9\u00DA\u00DB\u00DC\u0168\u016A\u016C\u016E\u0170\u0172\u01AF\u01D3\u01D5\u01D7\u01D9\u01DB]/g},
    {'base':'W','letters':/[\u0174]/g},
    {'base':'Y','letters':/[\u0178\u0176]/g},
    {'base':'Z','letters':/[\u0179\u017B\u017D]/g},
    // Greek letters
    {'base':'ALPHA','letters':/[\u0391\u03B1]/g},
    {'base':'BETA','letters':/[\u0392\u03B2]/g},
    {'base':'GAMMA','letters':/[\u0393\u03B3]/g},
    {'base':'DELTA','letters':/[\u0394\u03B4]/g},
    {'base':'EPSILON','letters':/[\u0395\u03B5]/g},
    {'base':'ZETA','letters':/[\u0396\u03B6]/g},
    {'base':'ETA','letters':/[\u0397\u03B7]/g},
    {'base':'THETA','letters':/[\u0398\u03B8]/g},
    {'base':'IOTA','letters':/[\u0399\u03B9]/g},
    {'base':'KAPPA','letters':/[\u039A\u03BA]/g},
    {'base':'LAMBDA','letters':/[\u039B\u03BB]/g},
    {'base':'MU','letters':/[\u039C\u03BC]/g},
    {'base':'NU','letters':/[\u039D\u03BD]/g},
    {'base':'XI','letters':/[\u039E\u03BE]/g},
    {'base':'OMICRON','letters':/[\u039F\u03BF]/g},
    {'base':'PI','letters':/[\u03A0\u03C0]/g},
    {'base':'RHO','letters':/[\u03A1\u03C1]/g},
    {'base':'SIGMA','letters':/[\u03A3\u03C3]/g},
    {'base':'TAU','letters':/[\u03A4\u03C4]/g},
    {'base':'UPSILON','letters':/[\u03A5\u03C5]/g},
    {'base':'PHI','letters':/[\u03A6\u03C6]/g},
    {'base':'CHI','letters':/[\u03A7\u03C7]/g},
    {'base':'PSI','letters':/[\u03A8\u03C8]/g},
    {'base':'OMEGA','letters':/[\u03A9\u03C9]/g}


];
var changes;

removeDiacritics = function(str) {
    if(!changes) {
        changes = defaultDiacriticsRemovalMap;
    }
    for(var i=0; i<changes.length; i++) {
        str = str.replace(changes[i].letters, changes[i].base);
    }
    return str;
}

regExpEscape = function(s) {
    return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
        replace(/\x08/g, '\\x08');
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
}

module.exports = router;