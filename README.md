SNOMED CT Snapshot REST API 
===========================

Lightweight mongo server with a rest API for SNOMED CT Snapshot views, powered by the MEAN stack, http://mean.io/, (Node.js, Express &amp; MongoDB). 

The minimum version of Node.js to be used is v4.4.2 onwards and has been tested on v5 and v7.10.0.

How to install
--------------

Clone this project
```
git clone https://github.com/newhippo/sct-snapshot-rest-api.git
```

Then do
```
docker-compose build
```

and then
```
docker-compose up
```
This will start a container called 'web' (for the node.js app) and a container called 'db' for mongo which will have a volume called db-data attached to it.

Next you'll need to stuff all the exciting snomed data into your mongo database. You can download the data in JSON format here: https://drive.google.com/file/d/1cDWc5tE0fp8BehxREFxfISYE3ZJl9Jku/view?usp=sharing (bug Paul if it's not working)

Extract the snomed data somewhere on you machine and go to that folder in a terminal and run 
```
./import.sh localhost ca-edition 20171031
```
(Note the last argument may change from time to time and should be consistent with the 'effectiveTime' of the dataset)

Once that's run (will take several minutes) you can test out the install by going to http://127.0.0.1:3000/snomed/ca-edition/v20171031/descriptions?query=heart%20attack which should show you some JSON formatted information about heart attacks, which are bad I guess? I don't know, I'm not a heart doctor.

NOTES:
-------------
```docker-compose down``` will cause you to lose the data you loaded into the mongodb. Use ```docker-compose stop``` instead


The server will attempt to write a pid file at:
/var/sct-snapshot-rest-api.pid
to change this location please set the environment variable
PID_FILE
for example (windows):
set PID_FILE=c:\temp\sct-snapshot-rest-api.pid



