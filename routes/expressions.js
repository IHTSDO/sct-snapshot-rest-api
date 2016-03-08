/**
 * Created by alo on 7/9/15.
 */
var express = require('express');
var router = express.Router();
var expressionsParser = require('../grammars/apg/expressionParser');
var MongoClient = require('mongodb').MongoClient;
var connectTimeout = require('connect-timeout');
var winston = require('winston');
var path = require('path');
// find the first module to be loaded
var topModule = module;
while(topModule.parent)
    topModule = topModule.parent;
var appDir = path.dirname(topModule.filename);

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: appDir +'/constraints.log' })
    ]
});


var databases = {};

var performMongoDbRequest = function(databaseName, callback) {
    if (databases[databaseName]) {
        //console.log("Using cache");
        callback(databases[databaseName]);
    } else {
        //console.log("Connecting");
        MongoClient.connect("mongodb://localhost:27017/"+databaseName, function(err, db) {
            if (err) {
                res.status(500);
                res.send(err.message);
                return;
            }
            //console.log("Connection OK")
            databases[databaseName] = db;
            callback(db);
        });
    }
};

/**
 * Parses the expression in the body
 */
router.post('/parse/:language', function (req, res) {
    var expression = req.body.expression.replace(/[^\x00-\x7F]/g, "");
    var language = req.param("language");
    var results = expressionsParser.parse(expression, language);
    res.send(results);
});

router.post('/:db/:collection/execute/:language', connectTimeout('120s'), function (req, res) {
    var request = req.body;
    var expression = request.expression.replace(/[^\x00-\x7F]/g, "");
    var language = req.param("language");
    var collectionName = req.params.collection;
    var results = expressionsParser.parse(expression, language);
    var responseData = {
        paserResponse: results,
        computeResponse: {}
    };
    if (!results.validation) {
        if (expression.charAt(0) == "(" && expression.charAt(expression.length-1) == ")") {
            expression = expression.substr(1, expression.length - 2);
            results = expressionsParser.parse(expression, language);
            responseData.paserResponse = results;
        }
    }
    if (results.validation) {
        // Execute query
        logger.log('info', 'Query execution started', {
            expression: expression,
            language: language
        });
        var start = process.hrtime();
        computeGrammarQuery3(results, request.form, req.params.db, collectionName, request.skip, request.limit, function(err, results) {
            if (err) {
                responseData.computeResponse = err;
                res.status(500);
                res.send(responseData);
            } else {
                var elapsed_time = function(note){
                    var precision = 0; // 3 decimal places
                    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
                    //console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
                    start = process.hrtime(); // reset the timer
                    return elapsed.toFixed(precision) + " ms.";
                };
                logger.log('info', 'Query execution finished', {
                    expression: "\" " + expression + " \"",
                    language: language,
                    matches: results.total,
                    time: elapsed_time()
                });
                responseData.computeResponse = results;
                res.send(responseData);
            }
        });
    } else {
        res.status(400);
        res.send(responseData);
    }
});

module.exports = router;

var readConceptReference = function(node, ast) {
    var conceptId;
    ast.getChildren(node, ast.nodes).forEach(function(referenceChild) {
        if (referenceChild.rule == "conceptId") {
            conceptId = referenceChild.content;
        }
    });
    return conceptId;
}

var readSimpleExpressionConstraint = function(node, ast) {
    var condition = {
        condition: node.rule,
        criteria: false,
        memberOf: false,
        conceptId: false
    };
    if (node.rule == "simpleExpressionConstraint") {
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            if (child.rule == "constraintOperator") {
                var constraintOperator = child;
                var operatorChildren = ast.getChildren(constraintOperator, ast.nodes);
                if (operatorChildren.length) {
                    condition.criteria = operatorChildren[0].rule;
                }
            } else if (child.rule == "focusConcept") {
                var focusConcept = child;
                var focusChildren = ast.getChildren(focusConcept, ast.nodes);
                if (focusChildren.length) {
                    focusChildren.forEach(function(loopFocusChild) {
                        if (loopFocusChild.rule == "conceptReference") {
                            condition.conceptId = readConceptReference(loopFocusChild, ast);
                        } else if (loopFocusChild.rule == "memberOf") {
                            condition.memberOf = true;
                        } else if (loopFocusChild.rule == "wildCard") {
                            condition.criteria = loopFocusChild.rule;
                        }
                    });
                }
            }
        });
        if (!condition.criteria) {
            condition.criteria = "self";
        }
    }
    return condition;
};

var readAttribute = function(node, ast) {
    var condition = {
        criteria: node.rule,
        cardinality: false,
        reverseFlag: false,
        attributeOperator: false,
        typeId: false,
        expressionComparisonOperator: false,
        targetNode: false
    };
    if (node.rule == "attribute") {
        ast.getChildren(node, ast.nodes).forEach(function(attrChild) {
            if (attrChild.rule == "attributeOperator") {
                ast.getChildren(attrChild, ast.nodes).forEach(function(operator) {
                    condition.attributeOperator = operator.rule;
                });
            } else if (attrChild.rule == "attributeName") {
                ast.getChildren(attrChild, ast.nodes).forEach(function(nameChild) {
                    if (nameChild.rule == "wildCard") {
                        condition.typeId = "*";
                    } else if (nameChild.rule == "conceptReference") {
                        condition.typeId = readConceptReference(nameChild, ast);
                    }
                });
            } else if (attrChild.rule == "expressionComparisonOperator") {
                condition.expressionComparisonOperator = attrChild.content;
            } else if (attrChild.rule == "expressionConstraintValue") {
                ast.getChildren(attrChild, ast.nodes).forEach(function(valueChild) {
                    //if (valueChild.rule == "simpleExpressionConstraint") {
                    condition.targetNode = valueChild;
                    //}
                });
            } else if (attrChild.rule == "cardinality") {
                condition.cardinality = true;
            } else if (attrChild.rule == "reverseFlag") {
                condition.reverseFlag = true;
            }
        });
    }
    return condition;
};

var rulesThatRequireAnd = [
    "refinedExpressionConstraint"
];

var rulesThatShouldNotBeFollowedIn = [
    "conjunction"
];

var computeGrammarQuery3 = function(parserResults, form, databaseName, collectionName, skip, limit, callback) {
    var ast = parserResults.simpleTree;
    var root = ast.getRootNode(ast.nodes);
    var computer = {};
    var queryOptions = {
        limit: limit,
        skip: skip
    };
    var exitWithError = function(message) {
        console.log("Error:", message);
        callback({message: message}, {});
    };
    computer.resolve = function(node, ast, queryPart) {
        console.log(node.rule);
        if (typeof computer[node.rule] == "undefined") {
            exitWithError("Unsupported rule: " + node.rule);
        } else {
            computer[node.rule](node, ast, queryPart);
        }
    };
    computer.expressionConstraint = function(node, ast, queryPart) {
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            computer.resolve(child, ast, queryPart);
        });
    };
    computer.simpleExpressionConstraint = function(node, ast, queryPart) {
        node.condition = readSimpleExpressionConstraint(node, ast);
        if (node.condition.memberOf) {
            queryPart.push({"memberships.refset.conceptId": node.condition.conceptId});
            if (node.condition.criteria && node.condition.criteria != "self") {
                exitWithError("Unsupported condition: combined memberOf and hierarchy criteria");
            }
        } else if (node.condition.criteria == "self") {
            queryPart.push({"conceptId": node.condition.conceptId});
        } else if (node.condition.criteria == "descendantOf") {
            if (form == "stated") {
                queryPart.push({"statedAncestors": node.condition.conceptId});
            } else {
                queryPart.push({"inferredAncestors": node.condition.conceptId});
            }
        } else if (node.condition.criteria == "descendantOrSelfOf") {
            var or = {$or: []};
            or["$or"].push({"conceptId": node.condition.conceptId});
            if (form == "stated") {
                or["$or"].push({"statedAncestors": node.condition.conceptId});
            } else {
                or["$or"].push({"inferredAncestors": node.condition.conceptId});
            }
            queryPart.push(or);
        } else if (node.condition.criteria == "ancestorOf") {
            // Not supported right now
            exitWithError("Unsupported condition: " +node. condition.criteria);
        } else if (node.condition.criteria == "ancestorOrSelfOf") {
            queryPart.push({"conceptId": node.condition.conceptId});
            // Not supported right now
            exitWithError("Unsupported condition: " + node.condition.criteria);
        }
    };
    computer.compoundExpressionConstraint = function(node, ast, queryPart) {
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            computer.resolve(child, ast, queryPart);
        });
    };
    computer.subExpressionConstraint = function(node, ast, queryPart) {
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            result = computer.resolve(child, ast, queryPart);
        });
    };
    computer.exclusionExpressionConstraint = function(node, ast, queryPart) {
        var children = ast.getChildren(node, ast.nodes);
        if (children.length != 3) {
            exitWithError("Problem with exclusionExpressionConstraint: " + node.content);
        }
        //var excl = {$and:[]};
        var excl = queryPart;
        computer.resolve(children[0], ast, excl);
        var nor = [];
        computer.resolve(children[2], ast, nor);
        var not = {$nor: nor};
        queryPart.push(not);
    };
    computer.disjunctionExpressionConstraint = function(node, ast, queryPart) {
        var or = {$or:[]};
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            if (child.rule == "subExpressionConstraint") {
                computer.resolve(child, ast, or["$or"]);
            }
        });
        queryPart.push(or);
    };
    computer.conjunctionExpressionConstraint = function(node, ast, queryPart) {
        var and = {$and:[]};
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            if (child.rule == "subExpressionConstraint") {
                computer.resolve(child, ast, and["$and"]);
            }
        });
        queryPart.push(and);
    };
    computer.refinedExpressionConstraint = function(node, ast, queryPart) {
        var children = ast.getChildren(node, ast.nodes);
        if (children.length != 2) {
            exitWithError("Problem with refinedExpressionConstraint: " + node.content);
        }
        //var and = {$and:[]};
        computer.resolve(children[0], ast, queryPart);
        computer.resolve(children[1], ast, queryPart);
        //queryPart.push(and);
    };
    computer.refinement = function(node, ast, queryPart) {
        var children = ast.getChildren(node, ast.nodes);
        if (children.length == 1) {
            computer.resolve(children[0], ast, queryPart);
        } else {
            if (children[1].rule == "conjunctionRefinementSet") {
                var and = {$and:[]};
                computer.resolve(children[0], ast, and["$and"]);
                computer.resolve(children[1], ast, and["$and"]);
                queryPart.push(and);
            } else if (children[1].rule == "disjunctionRefinementSet") {
                var or = {$or:[]};
                computer.resolve(children[0], ast, or["$or"]);
                computer.resolve(children[1], ast, or["$or"]);
                queryPart.push(or);
            }
        }
    };
    computer.disjunctionRefinementSet = function(node, ast, queryPart) {
        var or = {$or:[]};
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            if (child.rule == "subRefinement") {
                computer.resolve(child, ast, or["$or"]);
            }
        });
        queryPart.push(or);
    };
    computer.conjunctionRefinementSet = function(node, ast, queryPart) {
        var and = {$and:[]};
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            if (child.rule == "subRefinement") {
                computer.resolve(child, ast, and["$and"]);
            }
        });
        queryPart.push(and);
    };
    computer.subRefinement = function(node, ast, queryPart) {
        //var or = {$or:[]};
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            computer.resolve(child, ast, queryPart);
        });
        //queryPart.push(or);
    };
    computer.attributeSet = function(node, ast, queryPart) {
        var children = ast.getChildren(node, ast.nodes);
        if (children.length == 1) {
            computer.resolve(children[0], ast, queryPart);
        } else {
            if (children[1].rule == "conjunctionAttributeSet") {
                var and = {$and:[]};
                computer.resolve(children[0], ast, and["$and"]);
                computer.resolve(children[1], ast, and["$and"]);
                queryPart.push(and);
            } else if (children[1].rule == "disjunctionAttributeSet") {
                var or = {$or:[]};
                computer.resolve(children[0], ast, or["$or"]);
                computer.resolve(children[1], ast, or["$or"]);
                queryPart.push(or);
            }
        }
    };
    computer.conjunctionAttributeSet = function(node, ast, queryPart) {
        var and = {$and:[]};
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            if (child.rule == "subAttributeSet") {
                computer.resolve(child, ast, and["$and"]);
            }
        });
        queryPart.push(and);
    };
    computer.disjunctionAttributeSet = function(node, ast, queryPart) {
        var or = {$or:[]};
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            if (child.rule == "subAttributeSet") {
                computer.resolve(child, ast, or["$or"]);
            }
        });
        queryPart.push(or);
    };
    computer.subAttributeSet = function(node, ast, queryPart) {
        //var or = {$or:[]};
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            if (child.rule == "attribute" || child.rule == "attributeSet") {
                computer.resolve(child, ast, queryPart);
            }
        });
        //queryPart.push(or);
    };
    computer.attributeGroup = function(node, ast, queryPart) {
        //TODO: Implement cardinality
        var or = {$or:[]};
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            if (child.rule == "attributeSet") {
                computer.resolve(child, ast, or["$or"]);
            }
        });
        queryPart.push(or);
    };
    computer.attribute = function(node, ast, queryPart) {
        var elemMatch = {};
        var condition = readAttribute(node, ast);
        // Process attribute name
        var attributeNameResults = false;
        if (condition.cardinality) {
            exitWithError("Unsupported condition: cardinality");
        }
        if (condition.reverseFlag) {
            exitWithError("Unsupported condition: reverseFlag");
        }
        if (condition.typeId != "*") {
            if (condition.attributeOperator) {
                if (condition.attributeOperator == "descendantOrSelfOf") {
                    elemMatch["$or"] = [];
                    elemMatch["$or"].push({"type.conceptId" : condition.conceptId});
                    elemMatch["$or"].push({"typeInferredAncestors" : condition.conceptId});
                } else if (condition.attributeOperator == "descendantOf") {
                    elemMatch["typeInferredAncestors"] = condition.conceptId;
                } else {
                    elemMatch["type.conceptId"] = condition.typeId;
                }
            } else {
                elemMatch["type.conceptId"] = condition.typeId;
            }
        }
        // Process attribute value
        //if (condition.targetNode.content != "*") {
        //    var temp = [];
        //    computer.resolve(condition.targetNode, ast, temp;
        //}
        //queryPart.push({relationships: {"$elemMatch": elemMatch}});
        //TODO: update for nested definitions in attributes
        if (condition.targetNode) {
            if (condition.targetNode.rule == "simpleExpressionConstraint") {
                var targetExp = readSimpleExpressionConstraint(condition.targetNode, ast);
                //console.log(JSON.stringify(targetExp));
                if (targetExp.memberOf) {
                    elemMatch["targetMemberships"] = targetExp.conceptId;
                } else if (targetExp.criteria == "descendantOrSelfOf") {
                    elemMatch["$or"] = [];
                    elemMatch["$or"].push({"target.conceptId" : targetExp.conceptId});
                    elemMatch["$or"].push({"targetInferredAncestors" : targetExp.conceptId});
                } else if (targetExp.criteria == "descendantOf") {
                    elemMatch["targetInferredAncestors"] = targetExp.conceptId;
                } else {
                    elemMatch["target.conceptId"] = targetExp.conceptId;
                }
            } else {
                exitWithError("Unsupported condition: Nested definitions");
            }
        }
        if (Object.keys(elemMatch).length > 0) {
            elemMatch["active"] = true;
            queryPart.push({relationships: {"$elemMatch": elemMatch}});
        }
    };

    var mongoQuery = {$and:[]};
    computer.resolve(root, ast,mongoQuery["$and"]);
    console.log(JSON.stringify(mongoQuery));
    var returnData = {};
    performMongoDbRequest(databaseName, function(db) {
        var collection = db.collection(collectionName);
        collection.count(mongoQuery, function(err, count) {
            returnData.total = count;
            collection.find(mongoQuery,{conceptId:1, defaultTerm:1}, queryOptions, function(err, cursor) {
                returnData.limit = queryOptions.limit;
                returnData.skip = queryOptions.skip;
                returnData.matches = [];
                returnData.query = mongoQuery;
                cursor.toArray(function (err, docs) {
                    if (docs) {
                        //var page = docs.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
                        returnData.matches = docs;
                        callback(null, returnData);
                    } else {
                        returnData.total = 0;
                        returnData.matches = [];
                        callback(null, returnData);
                    }
                });
            });
        });
    });
};

