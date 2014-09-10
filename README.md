SNOMED CT Snapshot REST API
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

Access the server
-----------------

The server will start listening automatically on port 3000. You can test a rest call by goint to a Web Browsera and navigating to this link:

http://127.0.0.1:3000/snomed/en-edition/v20140731/concepts/404684003

This call will retrieve the data for the concept Clinical Finding (finding), idenfied by the SCTID 404684003, in the International edition (en-edition) for the July 2014 release (v20140731).
