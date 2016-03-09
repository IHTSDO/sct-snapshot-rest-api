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
    console.log("getting all manifests");
    var collection = db.collection("resources");
    collection.find({}, function(err, cursor) {
        if (err){

        }else{
            cursor.toArray(function(err, docs) {
                if (err){

                }else if (docs && docs.length){
                    docs.forEach(function(manifest, indM){
                        if (manifest.refsets && manifest.refsets.length){
                            performMongoDbRequest(manifest.databaseName, function(db){
                                collection = db.collection("v" + manifest.collectionName);
                                var idParam = parseInt(req.params.sctid);
                                var idParamStr = req.params.sctid;
                                var query = {"memberships": {"$elemMatch": {"$or": [ {"refset.conceptId": idParam }, {"refset.conceptId": idParamStr } ], "active": true}}};
                                collection.find();
                            });
                            manifest.refsets.forEach(function(refset, indR){

                            });
                        }
                    });
                }
            });
        }
    });
});