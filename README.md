# SNOMED CT Snapshot REST API

Lightweight mongo server with a rest API for SNOMED CT Snapshot views, powered by the MEAN stack, http://mean.io/, (Node.js, Express &amp; MongoDB).

## API docs

The API documentation can be found here:

<http://ihtsdo.github.io/sct-snapshot-rest-api/api.html>


## How to install

Clone this project
```
git clone https://github.com/newhippo/sct-snapshot-rest-api.git
```

and then
```
docker-compose up -d
```
This will start a container called 'web' (for the node.js app) and a container called 'db' for mongo which will have a volume called db-data attached to it. The db-data volume maps to local folders under ~/mongo/, allowing you to re-use the data between different versions of the container

(Note, you might have to create the paths ```/data/db```, ```/var/lib/mongodb```, and ```/var/log/mongodb``` and ensure that they are writable by the user running your mongo container.)

Next you'll need to stuff all the exciting SNOMED CT data into your mongo database. You can get access to download the data in JSON format from SNOMED International by contacting [techsupport@snomed.org)](mailto:techsupport@snomed.org). If you want to create the JSON yourself follow the instructions here -

Install mongodb client (via MongoDB Community Edition) on your OS X Machine with homebrew:
```
brew install mongodb
```

Extract the snomed data somewhere on your machine and go to that folder in a terminal and run
```
{path to sct-snapshot-rest-api}/data-scripts/import.sh localhost en-edition 20180131
```
(Note the last argument may change from time to time and should be consistent with the 'effectiveTime' of the dataset.)

Once that's run (will take several minutes) you can test out the install by going to
 http://localhost:3000/snomed/en-edition/v20180131/descriptions?query=heart%20attack
 which should show you some JSON formatted information about heart attacks.

## NOTES:

The server will attempt to write a pid file at:
/var/sct-snapshot-rest-api.pid
to change this location please set the environment variable
PID_FILE
for example (windows):
set PID_FILE=c:\temp\sct-snapshot-rest-api.pid
