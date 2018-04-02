var express = require('express');
var path = require('path');
// var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var pidFile = process.env.PID_FILE || "mongodb-rest.pid";

var routes = require('./routes/index');
var snomed = require('./routes/snomed');
var snomedv1 = require('./routes/snomedv1');
var util = require('./routes/util');
var server = require('./routes/server');
var serverv1 = require('./routes/serverv1');
var expressions = require('./routes/expressions');
var expressionsv1 = require('./routes/expressionsv1');

var accessControlConfig = {
    "allowOrigin": "*",
        "allowMethods": "GET,POST,PUT,DELETE,HEAD,OPTIONS"
};

//  ************************

var app = express();
// view engine setu
// p
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
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
app.use('/v2/snomed',snomed);
app.use('/v1/snomed',snomedv1);
app.use('/util', util);
app.use('/server', serverv1);
app.use("/expressions", expressionsv1);
app.use('/v2/util', util);
app.use('/v2/server', server);
app.use("/v2/expressions", expressions);
app.use('/v1/util', util);
app.use('/v1/server', serverv1);
app.use("/v1/expressions", expressionsv1);

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
        res.status(err.status >= 100 && err.status < 600 ? err.code : 500).send(err.message);
    });
}

// production error handler
// no stacktraces leaked to user
// Adding raw body support
app.use(function(err, req, res, next) {
    res.status(err.status >= 100 && err.status < 600 ? err.code : 500).send(err.message);
});

var cluster = require('cluster');
var port = process.env.PORT || 3000;

if(cluster.isMaster) {
    fs.writeFile(pidFile, process.pid);
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    //var app = require('express')();
    // app.all('/*', function(req, res) {res.send('process ' + process.pid + ' says hello!').end();})

    var server = app.listen(port, function() {
        console.log('Process ' + process.pid + ' is listening in port ' + port + ' to all incoming requests');
    });
}

// var server = require('http').Server(app);
//
// server.listen(port);
//
// console.log('Express app started on port '+port);

module.exports = app;
module.exports.accessControlConfig = accessControlConfig;
