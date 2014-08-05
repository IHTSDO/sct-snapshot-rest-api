var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');


fs.writeFile("/var/run/sct-snapshot-rest-api.pid", process.pid);

var routes = require('./routes/index');
var snomed = require('./routes/snomed');
var util = require('./routes/util');
var server = require('./routes/server');

var accessControlConfig = {
    "allowOrigin": "*",
        "allowMethods": "GET,POST,PUT,DELETE,HEAD,OPTIONS"
};

//  ************************

var app = express();
// view engine setu
// p
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    var oneof = false;
    if(req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        oneof = true;
    }
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        oneof = true;
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        oneof = true;
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});

app.use('/', routes);
app.use('/snomed', snomed);
app.use('/util', util);
app.use('/server', server);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
// Adding raw body support
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });

//    var data='';
//    req.setEncoding('utf8');
//    req.on('data', function(chunk) {
//        data += chunk;
//    });
//
//    req.on('end', function() {
//        req.body = data;
//        next();
//    });

});

var port = process.env.PORT || 3000;
var server = require('http').Server(app);

server.listen(port);

console.log('Express app started on port '+port);

module.exports = app;
module.exports.accessControlConfig = accessControlConfig;
