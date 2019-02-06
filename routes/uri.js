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
    var db=process.env.TS_MONGO_DB;
    var collection=process.env.TS_MONGO_COLLECTION;

    var hostname=req.headers.host;
    console.log("hostname:" + hostname);
    if (format=="json"){
        var db=process.env.TS_MONGO_DB;
        var collection=process.env.TS_MONGO_COLLECTION;
        console.log("db:" + db + " , collection:" + collection);
        res.redirect("http://ihmi.termspace.com/api/snomed/" + db + "/" + collection + "/concepts/" + id);
        return
    }else{
        res.redirect("http://ihmi.termspace.com/?perspective=full&conceptId1=" + id + "&edition=" + db+ "&release=" + collection + "&langRefset=900000000000509007&acceptLicense=true");

        return ;
    }

});
module.exports = router;
