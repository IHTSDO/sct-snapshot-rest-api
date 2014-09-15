var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var WorkUnit = mongoose.model('WorkUnit');
var Version = mongoose.model('Version');
var WorkflowAction = mongoose.model('WorkflowAction');
var BSON = require('mongodb').BSONPure;
var passport = require('passport');
var MongoClient = require('mongodb').MongoClient;

var sourceDatabase = "translation";
var sourceCollection = "workunits";
/* GET workunits listing. */
router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    if (req.query["sctid"]) {
        var sctid = req.query["sctid"];
        WorkUnit.find({ 'conceptId': sctid }, function (err, workUnits) {
            var response = "Creating response: <br>";
            if (err) return console.error(err);
            workUnits.forEach(function(item) {
                response = response + item._id + " " + item.batch + "<br>";
            });
            response = response + "END"
            res.send(workUnits);
        })
    } else if (req.query["summaries"]) {
        var project = req.query["project"];
        if (!project) project = "any";
        var user = req.query["user"];
        if (!user) user = "any";

        var dbQuery = {};

        if (project != "any") {
            dbQuery.project = project;
        }

        if (user != "any") {
            dbQuery.asignee = user;
        }

        var batch = req.query["batch"];

        if (batch) {
          dbQuery.batch = batch;
        }

        WorkUnit.find(dbQuery).sort({'conceptTerm': 1}).exec(function (err, workUnits) {

            if (err) return console.error(err);
            if (!batch && workUnits[0]) batch = workUnits[0].batch;
            var result = {};
            result.selectedBatch = batch;
            result.workUnits = workUnits;
            result.batches = {};
            result.totalReturned = result.workUnits.length;

            res.send(result);
        });

    }else if (req.query["batchlistgrouped"]) {
        MongoClient.connect("mongodb://localhost:27017/"+sourceDatabase, function(err, db) {
            var project = req.query["project"];
            if (!project) project = "any";
            var user = req.query["user"];
            if (!user) user = "any";

            var dbQuery = {};

            if (project != "any") {
                dbQuery.project = project;
            }

            if (user != "any") {
                dbQuery.asignee = user;
            }

            var batch = req.query["batch"];

            if (batch) {
                dbQuery.batch = batch;
            }
            var wu = db.collection(sourceCollection);
            wu.aggregate([{
                $match:dbQuery},
                {$group: {_id: "$batch",total: { $sum: 1 } }}
            ], function(err, lists) {
                if (err){
                    console.log("error:" + err);
                }
                //console.log("result:" + JSON.stringify(result));
                if (!batch && lists[0]) batch = lists[0]._id;

                var result = {};
                result.selectedBatch = batch;
                result.workUnits = [];
                result.batches = {};
                if (err) return console.error(err);
                var itemCount=0;
                lists.forEach(function(item) {
                    result.batches[item._id] = item.total;
                    itemCount+=item.total;
                });

                result.totalReturned = itemCount;

                res.send(result);
                db.close();
            });

        });

    }
    else {
        WorkUnit.find(function (err, workUnits) {
            if (err) return console.error(err);
            res.send(workUnits);
        });
    }
});

router.get('/add', passport.authenticate('bearer', { session: false }), function(req, res) {
    var response = "Adding one <br>";
    var uno = new WorkUnit({ batch: 'batch ' + Math.floor((Math.random() * 100) + 1) });
    uno.save();
    response = response + "Added - END"
    res.send(response);
});

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var wu = new WorkUnit(req.body);
    var upsertData = wu.toObject();
    delete upsertData._id;
    WorkUnit.findByIdAndUpdate({_id: wu._id}, upsertData, {upsert: true}, function(err, obj){
        if(err){
            console.log( err );
        }
        //console.log(num, n);
        res.end('Post complete');
    });
});

router.post('/:id/version', passport.authenticate('bearer', { session: false }), function(req, res) {
    //console.log("Pusing version");
    var version = new Version(req.body);
    var upsertData = version.toObject();
    delete upsertData.time;
    upsertData._id =  mongoose.Types.ObjectId();
    var obj_id = BSON.ObjectID.createFromHexString(req.params.id);
    WorkUnit.findByIdAndUpdate({_id: obj_id}, {$push: {versions: upsertData}},{safe: true, upsert: false}, function(err, obj){
        if(err){
            console.log( err );
        }
        res.end('Update complete');
        //console.log(num, n);
    });
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var wu = new WorkflowAction(req.body);
    var obj_id = BSON.ObjectID.createFromHexString(req.params.id);
    WorkUnit.findByIdAndUpdate({_id: obj_id}, {$set: {asignee: wu.asignee, state: wu.state}},{safe: true, upsert: false}, function(err, obj){
        if(err){
            console.log( err );
        } else {
            //console.log( "Update 1 OK" );
        }
    });
    var action = new WorkflowAction();
    action.author = wu.author;
    action.state = wu.state;
    action.asignee = wu.asignee;
    var upsertData = action.toObject();
    WorkUnit.findByIdAndUpdate({_id: obj_id}, {$push: {workflowActions: upsertData}},{safe: true, upsert: false}, function(err, obj){
        if(err){
            console.log( err );
        } else {
            //console.log( "Update 2 OK" );
        }
    });
    res.end('Update complete');
});

module.exports = router;
