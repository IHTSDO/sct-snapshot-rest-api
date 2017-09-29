/**
 * Created by tbertonatti on 11/1/16.
 */
var MongoClient = require('mongodb').MongoClient;
var databases = {};
var transform=require("./transform");
var defaultTermTypes={};
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
    var v1;
    if (options.v1) {
        v1=true;
        delete options.v1;
    }
    getObject(dbP, collectionP, {'conceptId': conceptId }, options, function(err, docs){
        if (err) callback(err);
        else if (docs && docs.length>0) {
            if (!docs[0].v || docs[0].v!="2") {
                callback("The db isnot version 2. It must be created with the new conversion module.");

            }else {
                if (v1) {
                    getDefaultTermType(dbP, collectionP, function(err,defTermType) {
                        if (err) callback(err);
                        else {
                            var result = transform.getV1Concept(docs[0], defTermType);
                            callback(false, result);
                        }
                    });
                }else {
                    callback(false, docs[0]);
                }
            }
        }else{
            callback(true, "There are no data for this conceptId:" + conceptId);
        }
    });
};

var getDescriptions = function(dbP, collectionP, conceptId, descriptionId, options, callback){

    var v1;
    if (options.v1) {
        v1=true;
        delete options.v1;
    }
    getConcept(dbP, collectionP, conceptId, options, function(err, doc){
        if (err) callback(err);
        else if (doc){
            var result = [];
            if (!doc.v || doc.v!="2") {
                callback( "The db isnot version 2. It must be created with the new conversion module.");

            }else {
                if (doc.descriptions) {
                    doc.descriptions.forEach(function (desc) {
                        if (descriptionId) {
                            if (descriptionId == desc.descriptionId) {
                                result.push(desc);
                            }
                        } else {
                            result.push(desc);
                        }
                    });
                    if (v1) {
                        result = transform.getV1Descriptions(result);
                    }
                }
                callback(false, result);
            }
        }
    });
};

var getRelationShips = function(dbP, collectionP, conceptId, form, options, callback){

    var v1;
    if (options.v1) {
        v1=true;
        delete options.v1;
    }
    getConcept(dbP, collectionP, conceptId, options, function(err, doc) {
        if (err) callback(err);
        else if (doc) {
            var result = [];
            if (!doc.v || doc.v!="2") {
                callback( "The db isnot version 2. It must be created with the new conversion module.");

            }else{
                if (doc.relationships) {
                    doc.relationships.forEach(function (desc) {
                        if (form == "all") {
                            result.push(desc);
                        } else if (form == "inferred" && desc.characteristicType.conceptId == "900000000000011006") {
                            result.push(desc);
                        } else if (form == "stated" && desc.characteristicType.conceptId == "900000000000010007") {
                            result.push(desc);
                        } else if (form == "additional" && desc.characteristicType.conceptId == "900000000000227009") {
                            result.push(desc);
                        }
                    });
                    if (v1) {

                        getDefaultTermType(dbP, collectionP, function(err,defTermType) {
                            if (err) callback(err);
                            else {
                                result = transform.getV1Relationships(result, defTermType);
                                callback(false, result);
                            }
                        });
                    }else{
                        callback(false, result);
                    }
                }else{
                    callback(false, result);
                }
            }
        }
    });
};

var getParents = function (dbP, collectionP, conceptId, form, options, callback) {

    var v1;
    if (options.v1) {
        v1=true;
        delete options.v1;
    }
    getConcept(dbP, collectionP, conceptId, options, function(err, doc) {
        if (err) callback(err);
        else if (doc) {
            var result = [];

            if (!doc.v || doc.v!="2") {
                callback( "The db isnot version 2. It must be created with the new conversion module.");

            }else {
                if (typeof doc.relationships != 'undefined') {
                    if (form) {
                        if (form == "inferred" && doc.relationships) {
                            doc.relationships.forEach(function (rel) {
                                if (rel.characteristicType.conceptId == "900000000000011006" && rel.active == true && rel.type.conceptId == "116680003") {
                                    result.push({
                                        conceptId: rel.destination.conceptId,
                                        preferredTerm: rel.destination.preferredTerm,
                                        fullySpecifiedName: rel.destination.fullySpecifiedName,
                                        definitionStatus: rel.destination.definitionStatus,
                                        module: rel.destination.module,
                                        statedDescendants: rel.destination.statedDescendants
                                    });
                                }
                            });
                        } else if (form == "stated" && doc.relationships) {
                            doc.relationships.forEach(function (rel) {
                                if (rel.characteristicType.conceptId == "900000000000010007" && rel.active == true && rel.type.conceptId == "116680003") {
                                    result.push({
                                        conceptId: rel.destination.conceptId,
                                        preferredTerm: rel.destination.preferredTerm,
                                        fullySpecifiedName: rel.destination.fullySpecifiedName,
                                        definitionStatus: rel.destination.definitionStatus,
                                        module: rel.destination.module,
                                        statedDescendants: rel.destination.statedDescendants
                                    });
                                }
                            });
                        }
                    } else if (doc.relationships) {
                        doc.relationships.forEach(function (rel) {
                            if (rel.active == true && rel.type.conceptId == "116680003") {
                                result.push({
                                    conceptId: rel.destination.conceptId,
                                    preferredTerm: rel.destination.preferredTerm,
                                    fullySpecifiedName: rel.destination.fullySpecifiedName,
                                    definitionStatus: rel.destination.definitionStatus,
                                    module: rel.destination.module,
                                    statedDescendants: rel.destination.statedDescendants
                                });
                            }
                        });
                    }
                    if (v1 && result.length>0) {

                        getDefaultTermType(dbP, collectionP, function(err,defTermType) {
                            if (err) callback(err);
                            else {
                                result = transform.getV1ConceptDescriptors(result, defTermType);
                                callback(false, result);
                            }
                        });
                    }else{
                        callback(false, result);

                    }
                }else{
                    callback(false, result);
                }
            }
        }
    });
};

var getMembers = function (dbP, collectionP, conceptId, options, callback) {

    var v1;
    if (options.v1) {
        v1=true;
        delete options.v1;
    }
    var query = {"memberships": {"$elemMatch": {"refset.conceptId": conceptId, "active": true}}};
    if (options.filter) {
        var searchTerm = "\\b" + regExpEscape(options.filter).toLowerCase();
        query.preferredTerm = {"$regex": searchTerm, "$options":"i"};
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
            else {
                var result = {};
                result.members = [];
                result.details = {'total': total, 'refsetId': conceptId};
                if (docs && docs.length > 0) {
                    if (!docs[0].v || docs[0].v != "2") {
                        callback( "The db isnot version 2. It must be created with the new conversion module.");

                    } else {
                        result.members = docs;

                        if (v1 ) {

                            getDefaultTermType(dbP, collectionP, function(err,defTermType) {
                                if (err) callback(err);
                                else {
                                    result.members = transform.getV1ConceptDescriptors(result.members, defTermType);
                                    callback(false, result);
                                }
                            });

                        }else {
                            callback(false, result);
                        }
                    }
                }else{
                    callback(false, result);
                }
            }
        });
    });
};

var searchDescription = function(dbP, collectionP, filters, query, options, callback){
    console.log("Search" , JSON.stringify(query));
    var processMatches = function(docs){
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
                result.matches.push({
                    "term": docs[0].term,
                    "conceptId": docs[0].conceptId,
                    "active": docs[0].active,
                    "conceptActive": docs[0].conceptActive,
                    "fsn": docs[0].fsn,
                    "module": docs[0].stringModule
                });
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
                } else {
                    matchedDescriptions.sort(function (a, b) {
                        if (a.score > b.score)
                            return -1;
                        if (a.score < b.score)
                            return 1;
                        return 0;
                    });
                }
                var count = 0;
                var conceptIds = [];
                matchedDescriptions.forEach(function (doc) {
                    var refsetOk = false;
                    if (doc.refsetIds) {
                        doc.refsetIds.forEach(function (refset) {
                            if (refset == filters.refsetFilter) {
                                refsetOk = true;
                            }
                        });
                    }
                    if (filters.semanticFilter == "none" || (filters.semanticFilter == doc.semanticTag)) {
                        if (filters.langFilter == "none" || (filters.langFilter == doc.languageCode)) {
                            if (filters.moduleFilter == "none" || (filters.moduleFilter == doc.stringModule)) {
                                if (filters.refsetFilter == "none" || refsetOk) {
                                    if (!filters["groupByConcept"] || conceptIds.indexOf(doc.conceptId) == -1) {
                                        conceptIds.push(doc.conceptId);

                                        if (count >= filters.skipTo && count < (filters.skipTo + filters.returnLimit)) {
                                            result.matches.push({
                                                "term": doc.term,
                                                "conceptId": doc.conceptId,
                                                "active": doc.active,
                                                "conceptActive": doc.conceptActive,
                                                "fsn": doc.fsn,
                                                "module": doc.stringModule,
                                                "definitionStatus": doc.definitionStatus
                                            });
                                        }
                                        if (result.filters.semTag.hasOwnProperty(doc.semanticTag)) {
                                            result.filters.semTag[doc.semanticTag] = result.filters.semTag[doc.semanticTag] + 1;
                                        } else {
                                            result.filters.semTag[doc.semanticTag] = 1;
                                        }
                                        if (result.filters.lang.hasOwnProperty(doc.languageCode)) {
                                            result.filters.lang[doc.languageCode] = result.filters.lang[doc.languageCode] + 1;
                                        } else {
                                            result.filters.lang[doc.languageCode] = 1;
                                        }
                                        if (result.filters.module.hasOwnProperty(doc.stringModule)) {
                                            result.filters.module[doc.stringModule] = result.filters.module[doc.stringModule] + 1;
                                        } else {
                                            result.filters.module[doc.stringModule] = 1;
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
            result.matches = [];
            result.details = {'total': 0, 'skipTo': filters.skipTo, 'returnLimit': filters.returnLimit};
            callback(false, result);
        }
    };
    if (filters.searchMode == "regex" || filters.searchMode == "partialMatching") {
        //console.log("Entering part match search");
        getObject(dbP, collectionP + "tx", query, options, function(err, docs){
            //console.log("Result: ", docs.length);
            processMatches(docs);
        });
    } else {
        getObject(dbP, collectionP + "tx", query, {score: { $meta: "textScore" }}, function(err, docs){
            //console.log("Result: ", docs.length);
            processMatches(docs);
        });
    }
    // else {
    //     performMongoDbRequest(dbP, function(db) {
    //         console.log(collectionP);
    //         var collection = db.collection(collectionP + 'tx');
    //         collection.find(query, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" }}, function (err, cursor) {
    //             if (err) {
    //                 console.log("Text index search error",err);
    //                 processMatches([]);
    //             } else{
    //                 cursor.toArray(function(err, docs) {
    //                     console.log("docs found",docs.length);
    //                     processMatches(docs);
    //                 });
    //             }
    //         });
    //     });
    // }
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

var getDefaultTermType=function(dbP, collectionP, callback){

    var typeId ="900000000000003001";
    if (defaultTermTypes[dbP + "-" + collectionP] ){
        typeId=defaultTermTypes[dbP + "-" + collectionP];
        callback(null, typeId);
    }else {
        var options = {};
        options["fields"] = {"defaultTermType": 1};
        var query = {databaseName: dbP, collectionName: collectionP.replace("v", "")};

        getObject("server", "resources", query, options, function (err, docs) {
            //console.log("Result: ", docs.length);
            if (err)callback(err);
            else {
                if (docs && docs.length > 0) {
                    typeId = docs[0].defaultTermType;
                }
                defaultTermTypes[dbP + "-" + collectionP]=typeId;
                callback(null, typeId);
            }
        });
    }
};

module.exports.getObject = getObject;
module.exports.getConcept = getConcept;
module.exports.getDescriptions = getDescriptions;
module.exports.getRelationShips = getRelationShips;
module.exports.getParents = getParents;
module.exports.getMembers = getMembers;
module.exports.searchDescription = searchDescription;
module.exports.getDefaultTermType = getDefaultTermType;

var regExpEscape = function(s) {
    return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
    replace(/\x08/g, '\\x08');
};