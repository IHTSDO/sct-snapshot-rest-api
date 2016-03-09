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
                                            console.log("Replace", refset.count, "with", total);
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
                    var man = {"resourceSetName":"International Edition","effectiveTime":"20160131","databaseName":"en-edition","collectionName":"20160131","expirationDate":"20170801","modules":[{"conceptId":"900000000000012004","defaultTerm":"SNOMED CT model component module (core metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"conceptId":"900000000000207008","defaultTerm":"SNOMED CT core module (core metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"}],"languageRefsets":[{"conceptId":"900000000000508004","defaultTerm":"Great Britain English language reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"conceptId":"900000000000509007","defaultTerm":"United States of America English language reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"}],"refsets":[{"count":16992,"type":"ASSOCIATION","conceptId":"900000000000524003","defaultTerm":"MOVED TO association reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":24015,"type":"SIMPLEMAP","conceptId":"446608001","defaultTerm":"ICD-O simple map reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":5558,"type":"ASSOCIATION","conceptId":"900000000000526001","defaultTerm":"REPLACED BY association reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":424758,"type":"SIMPLEMAP","conceptId":"900000000000498005","defaultTerm":"SNOMED RT identifier simple map (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":424758,"type":"SIMPLEMAP","conceptId":"900000000000497000","defaultTerm":"CTV3 simple map reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":258304,"type":"ATTRIBUTE_VALUE","conceptId":"900000000000490003","defaultTerm":"Description inactivation indicator attribute value reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":21402,"type":"ASSOCIATION","conceptId":"900000000000528000","defaultTerm":"WAS A association reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":44606,"type":"ASSOCIATION","conceptId":"900000000000527005","defaultTerm":"SAME AS association reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":177,"type":"ASSOCIATION","conceptId":"900000000000530003","defaultTerm":"ALTERNATIVE association reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":31957,"type":"ASSOCIATION","conceptId":"900000000000523009","defaultTerm":"POSSIBLY EQUIVALENT TO association reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":97372,"type":"ATTRIBUTE_VALUE","conceptId":"900000000000489007","defaultTerm":"Concept inactivation indicator attribute value reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"},{"count":833,"type":"ASSOCIATION","conceptId":"900000000000531004","defaultTerm":"REFERS TO concept association reference set (foundation metadata concept)","definitionStatus":"Primitive","statedDescendants":0,"inferredDescendants":0,"active":true,"effectiveTime":"20020131","module":"900000000000012004"}],"languageRefsetsAbbrev":{},"defaultTermLangCode":"en","defaultTermType":"900000000000003001","defaultTermLangRefset":"900000000000509007","textIndexNormalized":true};
                    collection.insert(man, function(err){
                        if (err){
                            console.log(err);
                        }
                        errorCantContinue("No manifests found");
                    });
                }
            });
        }
    });
});