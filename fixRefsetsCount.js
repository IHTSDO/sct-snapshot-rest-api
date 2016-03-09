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

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});
//performMongoDbRequest("server",function(db){
//    var endWithMessage = function(err){
//        console.log(err);
//        process.exit();
//    };
//    console.log("getting all manifests");
//    var collection = db.collection("resources");
//    collection.find({"databaseName" : "en-edition"}, {resourceSetName: 1, databaseName: 1, collectionName: 1, refsets: 1}, function(err, cursor) {
//        if (err){
//            endWithMessage(err);
//        }else{
//            cursor.toArray(function(err, docs) {
//                if (err){
//                    endWithMessage(err);
//                }else if (docs && docs.length){
//                    console.log(docs.length, "manifests matching params");
//                    //docs.forEach(function(manifest, indM){
//                    var indM = 0;
//                    var updateManifest = function(){
//                        var manifest = docs[indM];
//                        console.log("Manifest:", manifest.resourceSetName, manifest.databaseName, manifest.collectionName);
//                        console.log("getting all the counts of the refsets");
//                        if (manifest.refsets && manifest.refsets.length){
//                            performMongoDbRequest(manifest.databaseName, function(db){
//                                collection = db.collection("v" + manifest.collectionName);
//                                var findsDone = 0, percentage = 0;
//                                manifest.refsets.forEach(function(refset, indR){
//                                    var idParam = refset.conceptId;
//                                    var idParamStr = refset.conceptId + "";
//                                    var query = {"memberships": {"$elemMatch": {"$or": [ {"refset.conceptId": idParam }, {"refset.conceptId": idParamStr } ], "active": true}}};
//                                    collection.count(query, function (err, total) {
//                                        findsDone++;
//                                        if (percentage != parseInt(findsDone * 100 / manifest.refsets.length)){
//                                            percentage = parseInt(findsDone * 100 / manifest.refsets.length);
//                                            console.log(percentage + " %");
//                                        }
//                                        if (err){
//                                            console.log(err);
//                                        }else{
//                                            //console.log("Replace", refset.count, "with", total, idParamStr);
//                                            manifest.refsets[indR].count = total;
//                                        }
//                                        if (findsDone == manifest.refsets.length){
//                                            console.log("Updating the manifest");
//                                            //_id
//                                            performMongoDbRequest("server",function(db){
//                                                var collection = db.collection("resources");
//                                                collection.update({_id: manifest._id}, {$set: {refsets: manifest.refsets}}, {safe: true, upsert: false}, function (err, obj) {
//                                                    indM++;
//                                                    console.log(indM, "of", docs.length, "manifests updated");
//                                                    if (indM == docs.length){
//                                                        if (err){
//                                                            endWithMessage(err);
//                                                        }else{
//                                                            endWithMessage("Finish");
//                                                        }
//                                                    }else{
//                                                        updateManifest();
//                                                    }
//                                                });
//                                            });
//                                        }
//                                    });
//                                });
//                            });
//                        }
//                    };
//                    updateManifest();
//                }else{
//                    endWithMessage("No manifests found");
//                }
//            });
//        }
//    });
//});