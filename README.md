# SNOMED CT Snapshot REST API

Lightweight mongo server with a rest API for SNOMED CT Snapshot views, powered by the MEAN stack, http://mean.io/, (Node.js, Express &amp; MongoDB).

This repository also now provides Docker config to make it easier to use and install.

## API docs

The API documentation can be found here:

<http://ihtsdo.github.io/sct-snapshot-rest-api/api.html>


## How to run using Docker

Clone this project
```
git clone https://github.com/IHTSDO/sct-snapshot-rest-api.git
```

and then
```
docker-compose up -d
```
This will start a few containersone of which is a volume called db-data attached to it. The db-data volume maps to local folders under ~/mongo/, allowing you to re-use the data between different versions of the container

(Note, you might have to create the paths ```/data/db```, ```/var/lib/mongodb```, and ```/var/log/mongodb``` and ensure that they are writable by the user running your mongo container.)

Next you'll need to get SNOMED CT data into your mongo database. You can get access to download the data already generated ready for the MongoDB from SNOMED International by contacting [techsupport@snomed.org)](mailto:techsupport@snomed.org).

If you want to create the JSON yourself follow the instructions here once you have the SNOMED CT Files in RF2 format (standard release files). You can then create the JSON files for importing into Mongo using this project:

<https://github.com/IHTSDO/rf2-to-json-conversion>

**NOTE** ensure you are using versions 1.3, <https://github.com/IHTSDO/rf2-to-json-conversion/releases/tag/1.3> and above of the conversion tool to create the JSON files. Older versions will not work.

Instructions on how to then import into the MongoDB are also in that repository.

Once that's you have it all up and running, you can test out the install by going to
 http://localhost:3000/snomed/en-edition/v20180131/descriptions?query=heart%20attack
 which should show you some JSON formatted information about heart attacks.

## How to install manually

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

**IMPORTANT:** This API needs to have local access to the MongoDB server where the terminology data has been loaded into. The SNOMED CT data for the mongo instance can be obtained via your local National Resource Center (info in <http://www.ihtsdo.org/members>).

Once you have the SNOMED CT Files in RF2 format (standard release files) you can create a JSON file for importing into Mongo using this project:

<https://github.com/IHTSDO/rf2-to-json-conversion>

**NOTE** ensure you are using versions 1.3 and above of the conversion tool to create the JSON files. Older versions will not work.

Instructions on how to then import into the MongoDB are also in that repository.

## Access the server

The server will start listening automatically on port 3000\. You can test a REST call by goint to a Web Browser and navigating to this link:

<http://127.0.0.1:3000/snomed/en-edition/v20180131/concepts/404684003>

This call will retrieve the data for the concept Clinical Finding (finding), idenfied by the SCTID 404684003, in the International edition (en-edition) for the January 2016 release (v20160131).
```

## NOTES:

The server will attempt to write a pid file at:
/var/sct-snapshot-rest-api.pid
to change this location please set the environment variable
PID_FILE
for example (windows):
set PID_FILE=c:\temp\sct-snapshot-rest-api.pid
