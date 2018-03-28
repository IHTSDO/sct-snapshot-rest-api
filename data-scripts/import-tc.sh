#!/usr/bin/env bash
# Import json data
# import.sh database collection
mongo --eval "db = db.getSiblingDB('server');db.resources.remove({'databaseName': '$1', 'collectionName': '$2'});"
mongo --eval "db = db.getSiblingDB('$1');db.dropDatabase();"
mongoimport --file concepts.json -d $1 -c v$2
mongoimport --file text-index.json -d $1 -c v$2tx
mongoimport --file manifest.json -d server -c resources
mongoimport --file statedTransitiveClosure.json -d $1 -c v$2stc
mongoimport --file inferredTransitiveClosure.json -d $1 -c v$2itc
mongo --eval "db = db.getSiblingDB('$1');db.v$2.ensureIndex({'conceptId' : 1});db.v$2.ensureIndex({'relationships.target.conceptId' : 1,'relationships.type.conceptId' : 1});db.v$2.ensureIndex({'statedRelationships.target.conceptId' : 1,'statedRelationships.type.conceptId' : 1});db.v$2.ensureIndex({'memberships.refset.conceptId' :1});"
mongo --eval "db = db.getSiblingDB('$1');db.v$2tx.ensureIndex({'descriptionId' : 1});db.v$2tx.ensureIndex({term: 'text'});db.v$2tx.ensureIndex({term: 1});db.v$2tx.ensureIndex({words: 1});"
echo "Done!"