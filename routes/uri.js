var express = require('express');
var router = express.Router();
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: '/root/concepts-json/node_modules/sct-snapshot-rest-api/search.log' })
    ]
});

router.get('/', function(req, res,next) {
    var uri=req.query.uri;
    console.log("uri:" + uri);
    if (uri.indexOf("http://snomed.info/")<0){

        res.status(400);
        res.send("{Error:400, message:'system not found'}");
        return ;
    }
    var bar=uri.lastIndexOf("/");
    var id=uri.substring(bar + 1);
    var format="json";
    if (req.query.format) {
        format = req.query.format.toLowerCase();
    }
    console.log("format:" + format);
    console.log("id:" + id);
    if (format=="json"){
        var db=process.env.TS_MONGO_DB;
        var collection=process.env.TS_MONGO_COLLECTION;
        console.log("db:" + db + " , collection:" + collection);
        req.url="/" + db + "/" + collection + "/concepts/" + id;
        return router.handle(req, res, next);
    }else{
        req.url="http://ihmi.termspace.com/?perspective=full&conceptId1=" + id + "&edition=en-edition&release=v20180731&langRefset=900000000000509007";

        return router.handle(req, res, next);
    }

});
module.exports = router;
