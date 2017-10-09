# SNOMED CT Snapshot REST API

[![Build Status](https://travis-ci.org/IHTSDO/sct-snapshot-rest-api.svg?branch=master)](https://travis-ci.org/IHTSDO/sct-snapshot-rest-api) [![Code Climate](https://codeclimate.com/github/IHTSDO/sct-snapshot-rest-api/badges/gpa.svg)](https://codeclimate.com/github/IHTSDO/sct-snapshot-rest-api) [![Join the chat at https://gitter.im/IHTSDO/sct-snapshot-rest-api](https://badges.gitter.im/IHTSDO/sct-snapshot-rest-api.svg)](https://gitter.im/IHTSDO/sct-snapshot-rest-api?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![license](https://img.shields.io/badge/license-Apache2-blue.svg)]()

Lightweight mongo server with a rest API for SNOMED CT Snapshot views, powered by the MEAN stack, <http://mean.io/>, (Node.js, Express & MongoDB). The minimum version of Node.js to be used is v4.4.2 onwards and has been tested on v5 and v7.10.0.

## API docs

The API documentation can be found here:

<http://ihtsdo.github.io/sct-snapshot-rest-api/api.html>

## How to install

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

IMPORTANT: This API needs to have local access to the MongoDB server where the terminology data has been loaded into. The SNOMED CT data for the mongo instance can be obtained via your local National Resource Center (info in <http://www.ihtsdo.org/members>).

Once you have the SNOMED CT Files in RF2 format (standard release files) you can create a JSON file for importing into Mongo using this project:

<https://github.com/IHTSDO/rf2-to-json-conversion>

**NOTE** ensure you are using versions 1.3 and above of the conversion tool to create the JSON files. Older versions will not work.

## Access the server

The server will start listening automatically on port 3000\. You can test a REST call by goint to a Web Browser and navigating to this link:

<http://127.0.0.1:3000/snomed/en-edition/v20160131/concepts/404684003>

This call will retrieve the data for the concept Clinical Finding (finding), idenfied by the SCTID 404684003, in the International edition (en-edition) for the January 2016 release (v20160131).

## NOTES:

The server will attempt to write a pid file at: /var/sct-snapshot-rest-api.pid to change this location please set the environment variable PID_FILE for example (windows): set PID_FILE=c:\temp\sct-snapshot-rest-api.pid
