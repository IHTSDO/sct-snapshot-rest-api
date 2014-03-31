var mongo = require("mongodb"),
        app = module.parent.exports.app,
        config = module.parent.exports.config,
        util = require("./util");

var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: '/root/concepts-json/node_modules/sct-snapshot-rest-api/search.log' })
    ]
});

app.get('/:db/:collection/concepts/:sctid?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {'conceptId': idParam};
    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}), {safe:false});
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        var result = [];
                        if (docs.length > 0) {
                            result = util.flavorize(docs[0], "out");
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            res.send([]);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});
app.get('/:db/:collection/concepts/:sctid/descriptions/:descriptionId?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {'conceptId': idParam};
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
    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}), {safe:false});
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        var result = [];
                        if (docs.length > 0) {
                            docs[0].descriptions.forEach(function(desc) {
                                if (req.params.descriptionId) {
                                    if (parseInt(req.params.descriptionId) == desc.descriptionId) {
                                        result.push(desc);
                                    }
                                } else {
                                    result.push(desc);
                                }
                            });
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            res.send([]);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});
app.get('/:db/:collection/concepts/:sctid/relationships?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {'conceptId': idParam};
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

    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}), {safe:false});
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        var result = [];
                        if (docs.length > 0) {
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
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            res.send([]);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});
app.get('/:db/:collection/concepts/:sctid/children?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {"relationships": {"$elemMatch": {"target.conceptId": idParam, "active": true, "type.conceptId": 116680003}}};
    if (req.query["form"]) {
        if (req.query["form"] == "inferred") {
            query = {"relationships": {"$elemMatch": {"target.conceptId": idParam, "active": true, "type.conceptId": 116680003}}};
        }
        if (req.query["form"] == "stated") {
            query = {"statedRelationships": {"$elemMatch": {"target.conceptId": idParam, "active": true, "type.conceptId": 116680003}}};
        }

    }

    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }

    options["fields"] = {"defaultTerm": 1, "conceptId": 1, "active": 1};
    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}), {safe:false});
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        var result = [];
                        if (docs.length > 0) {
                            docs.forEach(function(doc) {
                                result.push(util.flavorize(doc, "out"));
                            });
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            res.send(result);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});

app.get('/:db/:collection/concepts/:sctid/parents?', function(req, res) {
    var idParam = parseInt(req.params.sctid);
    var query = {'conceptId': idParam};
    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    options["fields"] = {"relationships": 1, "statedRelationships": 1};
    var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}), {safe:false});
    db.open(function(err, db) {
        db.authenticate(config.db.username, config.db.password, function() {
            db.collection(req.params.collection, function(err, collection) {
                collection.find(query, options, function(err, cursor) {
                    cursor.toArray(function(err, docs) {
                        if (docs.length > 0) {
                            var result = [];
                            if (typeof docs[0].relationships != 'undefined') {
                                if (req.query["form"]) {
                                    if (req.query["form"] == "inferred") {
                                        docs[0].relationships.forEach(function(rel) {
                                            if (rel.active == true && rel.type.conceptId == 116680003) {
                                                result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm});
                                            }
                                        });
                                    } else if (req.query["form"] == "stated") {
                                        docs[0].statedRelationships.forEach(function(rel) {
                                            if (rel.active == true && rel.type.conceptId == 116680003) {
                                                result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm});
                                            }
                                        });
                                    }
                                } else {
                                    docs[0].relationships.forEach(function(rel) {
                                        if (rel.active == true && rel.type.conceptId == 116680003) {
                                            result.push({conceptId: rel.target.conceptId, defaultTerm: rel.target.defaultTerm});
                                        }
                                    });
                                }
                            }
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            res.send([]);
                        }
                        db.close();
                    });
                });
            });
        });
    });
});

app.get('/:db/:collection/descriptions/:sctid?', function(req, res) {
    var idParam = null;
    var query = {'descriptions.descriptionId': 0};
    var searchMode = "regex";
    var searchTerm = null;
    var lang = "english";
    var semanticFilter = "none";
    var statusFilter;
    var returnLimit = 100;
    var start = Date.now();
    if (req.params.sctid) {
        idParam = parseInt(req.params.sctid);
        query = {'descriptionId': idParam};
    } else {
        if (req.query["query"]) {
            if (!req.query["statusFilter"]) {
                statusFilter = 'activeOnly';
            } else {
                statusFilter = req.query["statusFilter"];
            }
            //console.log("statusFilter " + statusFilter);
            if (!req.query["searchMode"] || req.query["searchMode"] == "partialMatching") {
                searchMode = req.query["searchMode"];
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
                    var expWord = "^" + word.toLowerCase() + "x*";
                    query.$and.push({"words": {"$regex": expWord}});
                });
            } else if (req.query["searchMode"] == "fullText") {
                searchMode = req.query["searchMode"];
                searchTerm = req.query["query"];
                if (statusFilter == 'inactiveOnly') {
                    query = {"text": {"search": searchTerm, "limit": 10000000, filter: {"$or": [{"active": false},{"conceptActive": false}]}}};
                } else if (statusFilter == 'activeAndInactive') {
                    query = {"text": {"search": searchTerm, "limit": 10000000}};
                } else {
                    query = {"text": {"search": searchTerm, "limit": 10000000, filter: {"active": true, "conceptActive": true}}};
                }
            } else if (req.query["searchMode"] == "regex") {
                searchMode = req.query["searchMode"];
                searchTerm = req.query["query"];
                //var wildcarded = "^" + req.query["query"] + ".*"; OLD STARTSWITH
                if (statusFilter == 'inactiveOnly') {
                    query = {"term": {"$regex": searchTerm}, "$or": [{"active": false},{"conceptActive": false}]};
                } else if (statusFilter == 'activeAndInactive') {
                    query = {"term": {"$regex": searchTerm}};
                } else {
                    query = {"term": {"$regex": searchTerm}, "active": true, "conceptActive": true};
                }
            } else {
                res.send([]);
                return;
            }
        }
    }

    if (req.query["lang"]) {
        lang = req.query["lang"];
    }
    if (req.query["semanticFilter"]) {
        semanticFilter = req.query["semanticFilter"];
    }
    if (req.query["returnLimit"]) {
        returnLimit = req.query["returnLimit"];
    }

    var options = req.params.options || {};
    var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
    for (o in req.query) {
        if (test.indexOf(o) >= 0) {
            options[o] = JSON.parse(req.query[o]);
        }
    }
    options["limit"] = 10000000;

    if (searchMode == "regex" || searchMode == "partialMatching")  {
        var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}), {safe:false});
        db.open(function(err, db) {
            db.authenticate(config.db.username, config.db.password, function() {
                db.collection(req.params.collection + 'tx', function(err, collection) {
                    collection.find(query, options, function(err, cursor) {
                        var dbDuration = Date.now() - start;
                        logger.log('info', "Starting in = " + (Date.now() - start));
                        var docs = [];
                        cursor.each(function(err, item) {
                            logger.log('info', "iterating = " + (Date.now() - start));
                            docs.push(item);
                        });
                        //cursor.toArray(function(err, docs) {
                            logger.log('info', "Arrayed in = " + (Date.now() - start) + " Array: " + docs.length);
                            var result = [];
                            if (docs.length > 0) {
                                if (idParam == docs[0].descriptionId) {
                                    result.push(docs[0]);
                                } else {
                                    var matchedDescriptions = docs.slice(0);
                                    //logger.log('info', "Sliced in = " + (Date.now() - start));
                                    matchedDescriptions.sort(function(a, b) {
                                        if (a.term.length < b.term.length)
                                            return -1;
                                        if (a.term.length > b.term.length)
                                            return 1;
                                        return 0;
                                    });
                                    //logger.log('info', "Sorted in = " + (Date.now() - start));
                                    var count = 0;
                                    matchedDescriptions.forEach(function(doc) {
                                        if (count < returnLimit) {
                                            if (semanticFilter == "none" || (semanticFilter == doc.semanticTag)) {
                                                result.push({"term": doc.term, "conceptId": doc.conceptId, "active": doc.active, "conceptActive": doc.conceptActive, "fsn": doc.fsn});
                                                count = count + 1;
                                            }
                                        }
                                    });
                                    //logger.log('info', "Written in = " + (Date.now() - start));
                                    var duration = Date.now() - start;
                                    logger.log('info', 'Search for ' + searchTerm + ' result = ' + docs.length, {searchTerm: searchTerm, database: req.params.db, collection: req.params.collection, searchMode: searchMode, language: lang, matches: docs.length, duration: duration, dbduration: dbDuration});
                                    res.header('Content-Type', 'application/json');
                                    res.send(result);
                                }
                            } else {
                                var duration = Date.now() - start;
                                logger.log('info', 'Search for ' + searchTerm + ' result = ' + docs.length, {searchTerm: searchTerm, database: req.params.db, collection: req.params.collection, searchMode: searchMode, language: lang, matches: docs.length, duration: duration, dbduration: dbDuration});
                                res.send([]);
                            }
                            db.close();
                        });
                    //});
                });
            });
        });
    } else if (searchMode == "fullText") {
        var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {'auto_reconnect': true}), {safe:false});
        db.open(function(err, db) {
            db.authenticate(config.db.username, config.db.password, function() {
                db.command({text: req.params.collection + 'tx', search: searchTerm, language: lang, filter: {"active": true, "conceptActive": true}}, function(e, cb) {
                    var dbDuration = Date.now() - start;
                    if (e) {
                        console.log(e, 'error');
                        var duration = Date.now() - start;
                        logger.log('error', 'Search for ' + searchTerm + ' ERROR', {searchTerm: searchTerm, database: req.params.db, collection: req.params.collection, searchMode: searchMode, language: lang, duration: duration, dbDuration: dbDuration});
                        res.send(501);
                    } else {
                        //console.log("cb: " + JSON.stringify(cb));
                        var result = [];
                        var matchedDescriptions = cb.results.slice(0);
                        matchedDescriptions.sort(function(a, b) {
                            if (levDist(a.obj.term, searchTerm) < levDist(b.obj.term, searchTerm))
                                return -1;
                            if (levDist(a.obj.term, searchTerm) > levDist(b.obj.term, searchTerm))
                                return 1;
                            return 0;
                        });
                        if (matchedDescriptions.length > 0) {
                            var count = 0;
                            matchedDescriptions.forEach(function(doc) {
                                if (count < returnLimit) {
                                    result.push({"term": doc.obj.term, "conceptId": doc.obj.conceptId, "active": doc.obj.active, "conceptActive": doc.obj.conceptActive, "fsn": doc.obj.fsn});
                                    count = count + 1;
                                }
                            });
                            var duration = Date.now() - start;
                            logger.log('info', 'Search for ' + searchTerm + ' result = ' + cb.results.length, {searchTerm: searchTerm, database: req.params.db, collection: req.params.collection, searchMode: searchMode, language: lang, matches: cb.results.length, duration: duration, dbDuration: dbDuration});
                            res.header('Content-Type', 'application/json');
                            res.send(result);
                        } else {
                            var duration = Date.now() - start;
                            logger.log('info', 'Search for ' + searchTerm + ' result = ' + cb.results.length, {searchTerm: searchTerm, database: req.params.db, collection: req.params.collection, searchMode: searchMode, language: lang, matches: cb.results.length, duration: duration, dbDuration: dbDuration});
                            res.send([]);
                        }
                    }
                    db.close();

                });
            });
        });
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