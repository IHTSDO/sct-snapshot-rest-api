SNOMED CT Snapshot REST API [![Build Status](https://travis-ci.org/IHTSDO/sct-snapshot-rest-api.svg?branch=master)](https://travis-ci.org/IHTSDO/sct-snapshot-rest-api) [![Code Climate](https://codeclimate.com/github/IHTSDO/sct-snapshot-rest-api/badges/gpa.svg)](https://codeclimate.com/github/IHTSDO/sct-snapshot-rest-api)
===========================

Rest API for SNOMED CT Snapshot views, powered by Node.js, Express &amp; MongoDB.

How to install
--------------

Clone this project into the server, by using:
```
git clone https://github.com/IHTSDO/sct-snapshot-rest-api.git
```

In the "sct-snapshot-rest-api" folder use Node.js to install all dependencies:
```
sct-snapshot-rest-api: $ npm install
```

And then run the server:
```
sct-snapshot-rest-api: $ node app.js
```

IMPORTANT: This API needs to have local access to the MongoDB server where the terminology data has been loaded into.
The data for the mongo instance is obtained via the National Library of Medicine (info in www.ihtsdo.org).

Once you have the SNOMED CT Files in RF2 format (standard release files) you can create a JSON file for importing into Mongo using this project:

https://github.com/IHTSDO/rf2-to-json-conversion


Access the server
-----------------

The server will start listening automatically on port 3000. You can test a REST call by goint to a Web Browser and navigating to this link:

http://127.0.0.1:3000/snomed/en-edition/v20140731/concepts/404684003

This call will retrieve the data for the concept Clinical Finding (finding), idenfied by the SCTID 404684003, in the International edition (en-edition) for the July 2014 release (v20140731).

REST API docs
-------------

Browse the interactive documentation of the REST API here:

http://docs.sctsnapshotrestapi.apiary.io

NOTES:
-------------
The server will attempt to write a pid file at:
/var/sct-snapshot-rest-api.pid
to change this location please set the environment variable
PID_FILE
for example (windows):
set PID_FILE=c:\temp\sct-snapshot-rest-api.pid



