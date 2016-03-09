/**
 * Created by tbertonatti on 3/9/16.
 */
var MongoClient = require('mongodb').MongoClient;
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
};

performMongoDbRequest("server",function(db){
    var errorCantContinue = function(err){
        console.log(err);
        process.exit();
    };
    console.log("getting all manifests");
    var collection = db.collection("resources");
    collection.find({"databaseName" : "en-edition"}, {resourceSetName: 1, databaseName: 1, collectionName: 1, refsets: 1}, function(err, cursor) {
        if (err){
            errorCantContinue(err);
        }else{
            cursor.toArray(function(err, docs) {
                if (err){
                    errorCantContinue(err);
                }else if (docs && docs.length){
                    //docs.forEach(function(manifest, indM){
                    var manifest = docs[0];
                    console.log("Manifest:", manifest.resourceSetName, manifest.databaseName, manifest.collectionName);
                    console.log("getting all the counts of the refsets");
                        if (manifest.refsets && manifest.refsets.length){
                            performMongoDbRequest(manifest.databaseName, function(db){
                                collection = db.collection("v" + manifest.collectionName);
                                var findsDone = 0, percentage = 0;
                                manifest.refsets.forEach(function(refset, indR){
                                    var idParam = parseInt(refset.conceptId);
                                    var idParamStr = refset.conceptId + "";
                                    var query = {"memberships": {"$elemMatch": {"$or": [ {"refset.conceptId": idParam }, {"refset.conceptId": idParamStr } ], "active": true}}};
                                    collection.count(query, function (err, total) {
                                        findsDone++;
                                        if (percentage != parseInt(findsDone * 100 / manifest.refsets.length)){
                                            percentage = parseInt(findsDone * 100 / manifest.refsets.length);
                                            console.log(percentage + " %");
                                        }
                                        if (err){
                                            console.log(err);
                                        }else{
                                            console.log("Replace", refset.count, "with", total, idParam);
                                            manifest.refsets[indR].count = total;
                                        }
                                        if (findsDone == manifest.refsets.length){
                                            console.log("Updating the manifest");
                                            //_id
                                            //performMongoDbRequest("server",function(db){
                                            //    var collection = db.collection("resources");
                                            //    collection
                                            //});
                                            process.exit();
                                        }
                                    });
                                });
                            });
                        }
                    //});
                }else{
                    errorCantContinue("No manifests found");
                }
            });
        }
    });
});