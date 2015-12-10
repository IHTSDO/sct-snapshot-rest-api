/**
 * Created by alo on 9/7/15.
 */

var expParam = "<<19829001|disorder of lung|";
//var expParam = "(< 19829001|disorder of lung| OR ^ 700043003 |example problem list concepts reference set|) MINUS ^ 450976002|disorders and diseases reference set|";
//var expParam = "< 373873005 |pharmaceutical / biologic product|:[0..1] 127489000 |has active ingredient| = < 105590001 |substance|";
//var expParam = "< 404684003 |clinical finding|: { 363698007 |finding site| = << 39057004 |pulmonary valve structure|, 116676008 |associated morphology| = << 415582006 |stenosis|}, { 363698007 |finding site| = << 53085002 |right ventricular structure|, 116676008 |associated morphology| = << 56246009 |hypertrophy|}";

// Demo code
function parse(expression, language, printToConsole) {
    var log = new MsgLog();

    var sctBriefSyntax = require("./apg-sct-briefSyntax");
    var parserOpcodes = new sctBriefSyntax.ABNFOpcodes();
    // required, create a parser and attach the grammar-generated opcodes to it
    var parser = new ApgLib(parserOpcodes);
    // optional, create a list of syntax callback functions and attach to parser
    var synList = syntaxCallbackList(parserOpcodes.ruleIds);
    parser.syntaxInit(synList);
    // optional, create a list of semantic call back functions and attach to parser
    var semCallbacks = semanticCallbackList(parserOpcodes.ruleIds);
    parser.semanticInit(semCallbacks);
    // required, get the input string and process it into an array of character codes
    // NOTE: Some browsers will add line ending characters to the textarea content.
    var input = expression;
    var stringChars = [];
    grammarToChars(log, input, stringChars);
    // optional, generate an Abstract Syntax Tree (AST)
    // AST a) generate a list or rule name nodes and initialize the AST object
    var astNodes = astNodeList(semCallbacks)
    // AST b) construct the AST object (needs list of nodes, list of rules and the input string)
    var ast = new Ast(astNodes, parserOpcodes.rules, stringChars);
    // AST c) attach the AST object to the parser
    parser.astInit(ast);
    // optional, initialize the parser statistics object and attach to parser
    var parserStats = new Stats(parserOpcodes.rules);
    parser.statsInit(parserStats);
    // optional, initialize the trace object and attach to parser
    var parserTrace = new Trace();
    parserTrace.initRules(parserOpcodes.rules);
    parserTrace.initChars(stringChars);
    parser.traceInit(parserTrace);
    // optional, customize the parse tree nodes to trace
    //   by default, the parser records visits to all rule name nodes and ignores all other nodes
    //   here we are altering the defaults by turning ON the tracing for the TLS nodes
    parserTrace.setFilter(parserTrace.parseFilter, 'tls', true);
    parserTrace.setFilter(parserTrace.displayFilter, 'tls', true);
    // here we are turning OFF the saving of rules 18(wsp) and 21(any)
    // NOTE: comment out the following line for rule 18 to see empty strings in the trace output
    //parserTrace.setFilter(parserTrace.parseFilter, 'rule', false, 18);
    //parserTrace.setFilter(parserTrace.parseFilter, 'rule', false, 21);
    // optional, set up the user-defined data that the syntax analysis callback functions will need.
    var synData = {
        log : log,
        lineno : 0
    };
    // finally, parse the input string using rule 0(inifile) as the start rule,
    // stringChars as the input string and synData as the user-defined data
    // NOTE: the parser ignores synData. It is simply passed to the callback functions for them to use.
    var test = parser.syntaxAnalysis(0, stringChars, synData);
    //console.log("Is valid?",test); // Este es el resultado true false de la verificacion
    var draftTree = createTree(parserTrace, input);
    //console.log(simpleTree.length);
    var root = getRootNode(draftTree);
    //printTree(root, simpleTree);
    var result = {
        validation: test,
        ast: {
            nodes: draftTree,
            getRootNode: getRootNode,
            getChildren: getChildren
        },
        treeHtml: getTreeHtml(root, draftTree, ''),
        simpleTree: simplifyTree(root, draftTree),
        log: log
    };
    if (printToConsole) {
        printTree(root, draftTree);
    }
    return result;
};

module.exports.parse = parse;

var getRootNode = function(tree) {
    var result;
    tree.forEach(function(node) {
        if (node.depth == 0) {
            result = node;
        }
    });
    return result;
};
var getChildren = function(node, tree) {
    var result = [];
    tree.forEach(function(loopNode) {
        var goodChildren = true;

        // in next level of depth
        if (loopNode.depth != node.depth + 1) goodChildren = false;
        // contained in parents length
        if (!(loopNode.offset >= node.offset &&
            loopNode.offset + loopNode.length <= node.offset + node.length)) goodChildren = false;
        // not the same rule as parent
        if (loopNode.rule == node.rule) goodChildren = false;
        // prevent false positives
        if (node.rule == "subExpressionConstraint" && ["simpleExpressionConstraint","compoundExpressionConstraint","refinedExpressionConstraint"].indexOf(loopNode.rule) == -1) goodChildren = false;
        if (loopNode.rule == "subExpressionConstraint" && node.rule == "focusConcept") goodChildren = false;
        if (loopNode.rule == "simpleExpressionConstraint" && node.rule == "focusConcept") goodChildren = false;
        if (loopNode.rule == "simpleExpressionConstraint" && node.rule == "conceptReference") goodChildren = false;
        if (loopNode.rule == "simpleExpressionConstraint" && node.rule == "wildCard") goodChildren = false;
        if (loopNode.rule == "simpleExpressionConstraint" && node.rule == "compoundExpressionConstraint") goodChildren = false;
        //if (loopNode.rule == "nonNegativeIntegerValue" && node.rule != "cardinality") goodChildren = false;
        if (loopNode.rule == "constraintOperator" && ["exclusionExpressionConstraint","conjunctionExpressionConstraint","disjunctionExpressionConstraint"].indexOf(node.rule) > -1) goodChildren = false;
        if (loopNode.rule == "focusConcept" && ["exclusionExpressionConstraint","conjunctionExpressionConstraint","disjunctionExpressionConstraint"].indexOf(node.rule) > -1) goodChildren = false;

        if (goodChildren) {
            // add unique child
            if (!result.some(function(e) {
                return (e.rule == loopNode.rule && true && e.offset == loopNode.offset)
            })) {
                result.push(loopNode);
            }
        }
    });
    return result;
};

var getTreeHtml = function(node, tree, html) {
    var tab = new Array((node.depth*2) + 1).join( "-" );
    html+=node.depth + " " + tab + "<b><span class='text-primary'>" + node.rule + "</span></b>" + "&nbsp;:&nbsp;" + "<span class='text-success'>" + node.content + "</span>" + "<br>";
    var children = getChildren(node, tree);
    children.forEach(function(loopChild) {
        html = getTreeHtml(loopChild, tree, html);
    });
    return html;
};

var printTree = function(node, tree) {
    var tab = new Array((node.depth*2) + 1).join( "-" );
    console.log(node.depth, tab,node.rule, node.content);
    var children = getChildren(node, tree);
    children.forEach(function(loopChild) {
        printTree(loopChild, tree);
    });
};

var simplifyTree = function(node, tree) {
    var simpleTree = {
        nodes: [],
        getChildren: getChildren,
        getRootNode: getRootNode
    };
    simpleTree.nodes.push(node);
    simpleTree = addChildrenToSimpleTree(node, tree, simpleTree);
    return simpleTree;
};

var addChildrenToSimpleTree = function(node, tree, simpleTree) {
    var children = getChildren(node, tree);
    children.forEach(function(loopChild) {
        simpleTree.nodes.push(loopChild);
        simpleTree = addChildrenToSimpleTree(loopChild, tree, simpleTree);
    });
    return simpleTree;
}

var createTree = function(parserTrace, input) {
    var meaningfulTokens = [
        "ancestorOf",
        "ancestorOf",
        "ancestorOrSelfOf",
        "attribute",
        "attributeGroup",
        "attributeName",
        "attributeSet",
        "attributeOperator",
        "binaryOperator",
        "cardinality",
        "compoundExpressionConstraint",
        "conceptId",
        "conceptReference",
        "concreteComparisonOperator",
        "concreteValue",
        "conjunction",
        "conjunctionDisjunction",
        "conjunctionExpressionConstraint",
        "constraintOperator",
        "descendantOf",
        "descendantOrSelfOf",
        "disjunction",
        "disjunctionExpressionConstraint",
        "exclusion",
        "exclusionExpressionConstraint",
        "expressionComparisonOperator",
        "expressionConstraint",
        "expressionConstraintValue",
        "focusConcept",
        "many",
        "memberOf",
        "refinedExpressionConstraint",
        "refinement",
        "reverseFlag",
        //"sctId",
        "simpleExpressionConstraint",
        "subExpressionConstraint",
        "term",
        "to",
        "unrefinedExpressionConstraint",
        "subRefinement",
        "conjunctionRefinementSet",
        "disjunctionRefinementSet",
        "subAttributeSet",
        "conjunctionAttributeSet",
        "disjunctionAttributeSet",
        "nonNegativeIntegerValue",
        "wildCard"
    ];
    var tree = [];
    var max = parserTrace.parseCircular.items();
    parserTrace.parseCircular.initReplay();
    for (i = 0; i < max; i += 1) {
        var j = parserTrace.parseCircular.replay();
        line = parserTrace.lines[j];
        if (line.state == APG_MATCH && line.opType == RNM &&
            meaningfulTokens.indexOf(parserTrace.rules[line.ruleIndex].rule) > -1) {
            tree.push({
                depth: line.depth,
                offset: line.offset,
                length: line.length,
                rule: parserTrace.rules[line.ruleIndex].rule,
                content: input.substr(line.offset, line.length)
            })
        }
    }
    return tree;
};

var computeGrammarQuery = function(parserResults) {
    var conditions = [];
    var ast = parserResults.ast;
    var root = ast.getRootNode(ast.nodes);
    conditions = collectOperationsInGrammar(root, ast);
    return conditions;
};

module.exports.computeGrammarQuery = computeGrammarQuery;

var readSimpleExpressionConstraint = function(node, ast) {
    var condition = {
        condition: node.rule,
        criteria: false,
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
                    var conceptReference = focusChildren[0];
                    ast.getChildren(conceptReference, ast.nodes).forEach(function(referenceChild) {
                        if (referenceChild.rule == "conceptId") {
                            condition.conceptId = referenceChild.content;
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

var collectOperationsInGrammar = function(node, ast) {
    var conditions = [];
    if (node.rule == "simpleExpressionConstraint") {
        var condition = readSimpleExpressionConstraint(node, ast);
        if (condition.conceptId) {
            conditions.push(condition);
        }
    } else {
        ast.getChildren(node, ast.nodes).forEach(function(child) {
            var loopConditions = collectOperationsInGrammar(child, ast);
            conditions = conditions.concat(loopConditions);
        });
    }
    return conditions;
};

var annotateConditionsInTree = function(ast) {
    ast.nodes.forEach(function(loopNode) {
        if (loopNode.rule == "simpleExpressionConstraint") {
            loopNode.condition = readSimpleExpressionConstraint(loopNode, ast);
        } else if (loopNode.rule == "disjunctionExpressionConstraint") {
            loopNode.condition = readSimpleExpressionConstraint(loopNode, ast);
        }
    });
};

/****************************
 * apg-example.js
 */
/**
 * This void function is the prototype for all syntax callback functions. It is
 * for documentation purposes only.
 *
 * @param {array}
 *            state - [state, count] where "state" is the state of the parser
 *            and "count" is the number of characters matched to a phrase. On
 *            the downward traversal of the parse tree "state" will be
 *            APG_ACTIVE. On return or upward traversal, "state" will be one of:
 *
 * <pre>
 *            APG_NOMATCH - no phrase was matched
 *            APG_MATCH   - a phrase was matched, &quot;count&quot; will be the number of characters in the phrase
 *            APG_EMPTY   - an empty phrase was matched (redundant to APG_MATCH with count=0 but it is very useful
 *                          to distinguish these cases at the parser level.)
 * </pre>
 *
 * @param {array}
 *            chars - the array of character codes for the input string being
 *            parsed
 * @param {number}
 *            phraseIndex - index in the chars array to the first character of
 *            the phrase
 * @param {any}
 *            data - user-defined data, specified in the parse call to
 *            syntaxAnalysis()
 * @memberof Example
 *
 */
function syntaxCallbackPrototype(state, chars, phraseIndex, data) {
}

/**
 * Syntax callback function to recognize a Section Name.<br>
 * <b>Note:</b> JavaScript APG does not implement User-Defined Terminals (UDTs)
 * but this function is an example of how to use rule name callback functions to
 * implement one. That is, it skips the parsing of the parse tree branch below
 * this node and replaces it with a special, handwritten, phrase-recognition
 * function.
 *
 * @see see the [syntax callback prototype]{@link Example.syntaxCallbackPrototype}
 *      for the callback prototype parameters.
 * @memberof Example
 */
function synSectionName(state, chars, phraseIndex, data) {
    // handwritten parser to eliminate lots of calls to alpha & digit
    if (state[OP_STATE] == APG_ACTIVE) {
        var i, count = 0;
        for (i = phraseIndex; i < chars.length; i += 1) {
            var thisChar = chars[i];
            if ((thisChar >= 65 && thisChar <= 90)
                || (thisChar >= 97 && thisChar <= 122)
                || (thisChar >= 48 && thisChar <= 57) || (thisChar == 95)) {
                count += 1;
            } else {
                break
            }
        }
        if (count > 0) {
            state[OP_STATE] = APG_MATCH;
            state[OP_MATCHED] = count;
        } else {
            state[OP_STATE] = APG_NOMATCH;
            state[OP_MATCHED] = 0;
        }
    }
}

/**
 * Syntax callback function to recognize a Value Name.
 *
 * @see see the [syntax callback prototype]{@link Example.syntaxCallbackPrototype}
 *      for the callback prototype parameters.
 * @see see this [note]{@link Example.synSectionName} UDTs
 * @memberof Example
 */
function synValueName(state, chars, phraseIndex, data) {
    // handwritten parser to eliminate lots of calls to alpha & digit
    if (state[OP_STATE] == APG_ACTIVE) {
        var i, count = 0;
        for (i = phraseIndex; i < chars.length; i += 1) {
            var thisChar = chars[i];
            if ((thisChar >= 65 && thisChar <= 90)
                || (thisChar >= 97 && thisChar <= 122)
                || (thisChar >= 48 && thisChar <= 57) || (thisChar == 95)) {
                count += 1;
            } else {
                break
            }
        }
        if (count > 0) {
            state[OP_STATE] = APG_MATCH;
            state[OP_MATCHED] = count;
        } else {
            state[OP_STATE] = APG_NOMATCH;
            state[OP_MATCHED] = 0;
        }
    }
}

/**
 * Syntax callback function to recognize a string of alpha or digit characters.
 *
 * @see see the [syntax callback prototype]{@link Example.syntaxCallbackPrototype}
 *      for the callback prototype parameters.
 * @see see this [note]{@link Example.synSectionName} regarding UDTs
 * @memberof Example
 */
function synAlphaDigit(state, chars, phraseIndex, data) {
    // handwritten parser to eliminate lots of calls to alpha & digit
    if (state[OP_STATE] == APG_ACTIVE) {
        var i, count = 0;
        for (i = phraseIndex; i < chars.length; i += 1) {
            var thisChar = chars[i];
            if ((thisChar >= 65 && thisChar <= 90)
                || (thisChar >= 97 && thisChar <= 122)
                || (thisChar >= 48 && thisChar <= 57)) {
                count += 1;
            } else {
                break
            }
        }
        if (count > 0) {
            state[OP_STATE] = APG_MATCH;
            state[OP_MATCHED] = count;
        } else {
            state[OP_STATE] = APG_NOMATCH;
            state[OP_MATCHED] = 0;
        }
    }
}

/**
 * Syntax callback function to log an error on a bad section line.
 *
 * @see see the [syntax callback prototype]{@link Example.syntaxCallbackPrototype}
 *      for the callback prototype parameters.
 * @inner
 * @memberof Example
 */
function synBadSectionLine(state, chars, phraseIndex, data) {
    // error reporting on discovery of a bad section line
    if (state[OP_STATE] == APG_MATCH) {
        data.log.logMsg('bad section line at line number: ' + data.lineno);
    }
}

/**
 * Syntax callback function to log an error on a bad value line.
 *
 * @see see the [syntax callback prototype]{@link Example.syntaxCallbackPrototype}
 *      for the callback prototype parameters.
 * @memberof Example
 */
function synBadValueLine(state, chars, phraseIndex, data) {
    // error reporting on discovery of a bad value line
    if (state[OP_STATE] == APG_MATCH) {
        data.log.logMsg('bad value line at line number: ' + data.lineno);
    }
}

/**
 * Syntax callback function to count the lines in the input string.
 *
 * @see see the [syntax callback prototype]{@link Example.syntaxCallbackPrototype}
 *      for the callback prototype parameters.
 * @memberof Example
 */
function synLineEnd(state, chars, phraseIndex, data) {
    // counts the input string line numbers
    if (state[OP_STATE] == APG_MATCH) {
        data.lineno += 1;
    }
}

/**
 * Generate a list of syntax callback function pointers that the parser can
 * understand and use.
 *
 * @param {array}
 *            ruleIds - the array of rule ids from the generated opcodes object
 * @returns {array} the list of callback function pointers to be passed to the
 *          parser
 * @memberof Example
 */
function syntaxCallbackList(ruleIds) {
    var synList = [];
    // clear all call back functions
    for (var i = 0; i < ruleIds.length; i += 1) {
        synList[i] = false;
    }

    // specify only the call back functions that have been defined
    synList[ruleIds["badsectionline"]] = synBadSectionLine;
    synList[ruleIds["badvalueline"]] = synBadValueLine;
    synList[ruleIds["sectionname"]] = synSectionName;
    synList[ruleIds["valuename"]] = synValueName;
    synList[ruleIds["alphadigit"]] = synAlphaDigit;
    synList[ruleIds["lineend"]] = synLineEnd;
    return synList;
}

// /////////////////////////////////////////////////////////////////////////////
// 4. semantic call back functions
// /////////////////////////////////////////////////////////////////////////////
/**
 * This is the prototype for all semantic analysis callback functions.<br>
 * Note that at the point these functions are called the parser has done its job
 * and all arguments are input supplied to the callback function by the
 * translator.
 *
 * @param {number}
 *            state - the translator state (APG_PRE for downward traversal of
 *            the AST, APG_POST for upward traversal)
 * @param {array}
 *            chars - the array of character codes for the input string
 * @param {number}
 *            phraseIndex - index into the chars array to the first character of
 *            the phrase associated with this node
 * @param {number}
 *            phraseCount - the number of characters in the phrase
 * @param {any}
 *            data - user-defined data passed to the translator for use by the
 *            callback functions. Set in call to the function
 *            "semanticAnalysis()".
 * @memberof Example
 */
function semCallbackPrototype(state, chars, phraseIndex, phraseCount, data) {

}
/**
 * Set up and finish the full translation of the entire input string.
 *
 * @see see the [semantic callback prototype]{@link Example.semCallbackPrototype}
 *      for the semantic analysis callback function prototype for argument
 *      definitions.
 * @memberof Example
 */
function semIniFile(state, chars, phraseIndex, phraseCount, data) {
    var ret = APG_SEM_OK;
    if (state == APG_PRE) {
        // initialize for a new ini file
        data.total = 0;
        data.sectionName = '';
    } else if (state == APG_POST) {
        // convert the total cents to dollars
        data.total = data.total / 100;
    }
    return ret;
}

/**
 * Identify the section name so that we will know how to deal with the value.
 *
 * @see see the [semantic callback prototype]{@link Example.semCallbackPrototype}
 *      for the semantic analysis callback function prototype for argument
 *      definitions.
 * @memberof Example
 */
function semSectionName(state, chars, phraseIndex, phraseCount, data) {
    var ret = APG_SEM_OK;
    if (state == APG_POST) {
        // convert the section name characters to a string
        var name = charsToString(chars, phraseIndex, phraseCount);
        data.sectionName = name.toLowerCase();
    }
    return ret;
}

/**
 * Get the value and convert to cents if the value is dollars. Total the values.
 *
 * @see see the [semantic callback prototype]{@link Example.semCallbackPrototype}
 *      for the semantic analysis callback function prototype for argument
 *      definitions.
 * @memberof Example
 */
function semValue(state, chars, phraseIndex, phraseCount, data) {
    var ret = APG_SEM_OK;
    if (state == APG_POST) {
        if (data.sectionName == 'dollars' || data.sectionName == 'cents') {
            // get the integer value
            var value = 0;
            for (var i = 0; i < phraseCount; i += 1) {
                thisChar = chars[phraseIndex + i];
                if (thisChar < 48 || thisChar > 57) {
                    // log a value format error
                    var stringValue = charsToString(chars, phraseIndex,
                        phraseCount);
                    data.log.logMsg('non-integer value found: section: ['
                        + data.sectionName + '] value: ' + stringValue);
                    value = false;
                    break;
                }
                value = (value * 10) + (thisChar - 48);
            }
            if (value !== false) {
                if (data.sectionName == 'dollars') {
                    data.total += value * 100;
                } else {
                    data.total += value;
                }
            }
        }
        // ignore any other sections
    }
    return ret;
}

/**
 * Generate a list of semantic callback function pointers that the translator
 * can understand and use.
 *
 * @param {array}
 *            ruleIds - the array of rule ids from the generated opcodes object
 * @returns {array} the list of callback function pointers to be passed to the
 *          translator
 * @memberof Example
 */
function semanticCallbackList(ruleIds) {
    var semList = [];
    for (var i = 0; i < ruleIds.length; i += 1) {
        semList[i] = false;
    }
    semList[ruleIds["inifile"]] = semIniFile;
    semList[ruleIds["sectionname"]] = semSectionName;
    semList[ruleIds["value"]] = semValue;
    return semList;
}

/**
 * Generate a list of AST nodes that the parser can understand and use.
 *
 * @param {array}
 *            semList - the array semantic callback function pointers from
 *            semanticCallbackList(). Note that is the way this example is doing
 *            it. The AST node list does not have to be the same as the callback
 *            function list.
 * @returns {array} the list of AST nodes to be passed to the parser
 * @memberof Example
 */
function astNodeList(semList) {
    var astList = [];
    for (var i = 0; i < semList.length; i += 1) {
        if (semList[i]) {
            astList[i] = true;
        } else {
            astList[i] = false;
        }
    }
    return astList;
}

/****************************
 * apgAst.js
 */
function Ast(list, rules, ruleIds, chars)
{
    this.rules = rules;
    this.chars = chars;
    this.ruleIds = ruleIds;
    this.inPRD = 0;
    this.astList = [];
    this.ast = [];
    this.rulePhrases = [];
    this.ruleCount = rules.length;

    var i;
    for(i=0; i < this.ruleCount; i+=1)
    {
        // initialize the AST rule name node list
        if(list[i] === true){this.astList[i] = [];}
        else{this.astList[i] = null;}

        // initialize the rule phrases
        this.rulePhrases[i] = [];
    }

    /*****************************************************************************/
    /** clears the array of nodes */
    this.clear = function()
    {
        this.ast.length = 0;
    };

    /*****************************************************************************/
    /**
     * Test if a rule is defined.
     * @param {Number} ruleIndex - the index of the rule to test
     * @returns {boolean} true if the rule is defined, false otherwise.
     */
    this.ruleDefined = function(ruleIndex)
    {
        return (this.astList[ruleIndex] !== null);
    };

    /**
     * Creates and saves a record for the rule on the downward traversal of the parse tree.
     * @param {Number} ruleIndex - index of the rule name of the RNM node.
     * @returns {Number} the array index of the saved record
     */
    this.down = function(ruleIndex)
    {
        var thisIndex = this.ast.length;
        if(this.inPRD === 0)
        {
            // only record this node if not in a PRD opcode branch
            this.ast[thisIndex] = [];
            this.ast[thisIndex].down = true;
            this.ast[thisIndex].ruleIndex = ruleIndex;
            this.ast[thisIndex].upIndex = null;
        }
        return thisIndex;
    };

    /**
     * Creates and saves a record to the AST during upward traversal of the parse tree.
     * @param {Number} downIndex - index to the corresponding record saved for this RNM node on downward traversal
     * @param {Number} phraseIndex - offset into the character code array of the input string
     * for the beginning of the matched phrase
     * @param {Number} phraseLength - number of characters in the matched phrase
     * @returns {Number} the array index of the created record
     */
    this.up = function(downIndex, phraseIndex, phraseLength)
    {
        var thisIndex = this.ast.length;
        if(this.inPRD === 0)
        {
            // only record this node if not in a PRD opcode branch
            this.ast[thisIndex] = [];
            this.ast[thisIndex].down = false;
            this.ast[thisIndex].downIndex = downIndex;
            this.ast[thisIndex].phraseIndex = phraseIndex;
            this.ast[thisIndex].phraseLength = phraseLength;
            this.ast[downIndex].upIndex = thisIndex;
        }
        return thisIndex;
    };

    /**
     * Truncates all saved AST node records above "length" records.
     * Used to delete AST node records saved in al branch tha ultimately failed
     * and had to be backtracked over.
     * @param {Number} length - the length (number of records) to be retained.
     */
    this.truncate = function(length)
    {
        if(this.inPRD === 0){this.ast.length = length;}
    };

    /**
     * Find the number of AST records currently saved.
     * @returns {Number} the number of AST records saved
     */
    this.currentLength = function()
    {
        return this.ast.length;
    };

    /**
     * A specialty function to aid the EventLoop() in Interactive APG
     * in constructing a drop-down list of matched phrases.
     * Modifies this.rulePhrases.
     */
    this.countPhrases = function()
    {
        for(var i = 0; i < this.ast.length; i+=1)
        {
            if(this.ast[i].down)
            {
                // count and index the phrase
                this.rulePhrases[this.ast[i].ruleIndex].push(this.ast[i].upIndex);
            }
        }
    };

    /**
     * Specialty function to aid the EventLoop() function in Interactive APG
     * in constructing a drop-down list of matched phrases.
     * @param {Array} options - a list of options supplied by Interactive APG
     */
        // specialty function to aid EventLoop() in constructing the drop down list
        // of matched phrases for interactive display
    this.getDropDownOptions = function(options)
    {
        for(var i = 0; i < this.ruleCount; i+=1)
        {
            var j = this.ruleIds[i];
            options[j] = [];
            options[j].rule = this.rules[j].rule;
            options[j]['phrase-count'] = this.rulePhrases[j].length;
        }
    };

    // returns HTML ASCII-formatted input string with highlighted phrases for the
    // ruleIndex rule name
    /**
     * returns HTML ASCII-formatted input string with highlighted phrases for the given rule.
     * @param {number} ruleIndex - index of the rule to highlight
     */
    this.displayPhrasesAscii = function(ruleIndex)
    {
        var html = '';
        var list = [];
        var stack = [];
        var listIndex = 0;
        var node;
        var nextNode;

        list = this.rulePhrases[ruleIndex];
        if(list[listIndex] !== undefined)
        {
            nextNode = this.ast[list[listIndex]];
        }
        else{nextNode = undefined;}
        for(var i = 0; i < this.chars.length; i+=1)
        {
            if(nextNode && nextNode.phraseIndex === i)
            {
                if(nextNode.phraseLength === 0)
                {
                    // empty phrase
                    html += '<span class="ast-empty">&epsilon;</span>';
                    while(true)
                    {
                        listIndex+=1;
                        nextNode = (list[listIndex] !== undefined) ? this.ast[list[listIndex]] : undefined;
                        if(nextNode && nextNode.phraseIndex === i)
                        {
                            // empty phrase
                            html += '<span class="ast-empty">&epsilon;</span>';
                        }
                        else{break;}
                    }
                }
                else
                {
                    // open the next highlighted phrase
                    if(stack.length%2 === 0){html += '<span class="ast-highlight-even">';}
                    else{html += '<span class="ast-highlight-odd">';}
                    stack.push(nextNode);
                    listIndex+=1;
                    nextNode = (list[listIndex] !== undefined) ? this.ast[list[listIndex]] : undefined;
                }
            }

            if(this.chars[i] === 10){html += '<span class="control-char">LF</span><br />';}
            else if(this.chars[i] === 13){html +='<span class="control-char">CR</span>';}
            else if(this.chars[i] === 9){html += '<span class="control-char">TAB</span>';}
            else if(this.chars[i] < 32 || this.chars[i] > 126)
            {html +='<span class="non-ascii">x'+this.chars[i].toString(16).toUpperCase()+'</span>';}
            else if(this.chars[i] === 32){html += '&nbsp;';}
            else{html += '&#'+this.chars[i];}

            // check for end of last opened phrase
            if(stack.length > 0)
            {
                node = stack[stack.length - 1];
                while(node && (node.phraseIndex + node.phraseLength - 1) === i)
                {
                    html += '</span>';
                    stack.pop();
                    node = stack[stack.length - 1];
                }
            }
        }
        if(stack.length > 0)
        {
            apgAssert(stack.length === 1, 'displayPhrasesAscii: stack length: '+stack.length);
            html += '</span>';
            stack.pop();
        }

        return html;
    };

    // returns HTML hexidecimal-formatted input string with highlighted phrases for the
    // ruleIndex rule name
    /**
     * returns HTML hexidecimal-formatted input string with highlighted phrases for the given rule.
     * @param {number} ruleIndex - index of the rule to highlight
     */
    this.displayPhrasesHex = function(ruleIndex)
    {
        var html = '';
        var htmlHex = '';
        var htmlAscii = '';
        var list = [];
        var stack = [];
        var listIndex = 0;
        var node;
        var nextNode;
        var hexChar;
        var spanEven = '<span class="ast-highlight-even">';
        var spanOdd = '<span class="ast-highlight-odd">';
        var emptyHex = '<span class="ast-empty">00</span>';
        var emptyAscii = '<span class="ast-empty">&epsilon;</span>';

        var count = 0;
        var matchLen = 24;

        list = this.rulePhrases[ruleIndex];
        if(list[listIndex] !== undefined)
        {
            nextNode = this.ast[list[listIndex]];
        }
        else{nextNode = undefined;}
        for(var i = 0; i < this.chars.length; i+=1)
        {
            if(nextNode && nextNode.phraseIndex === i)
            {
                if(nextNode.phraseLength === 0)
                {
                    // empty phrase
                    htmlAscii += emptyAscii;
                    htmlHex += emptyHex;
                    count+=1;
                    if(count === matchLen)
                    {
                        htmlHex += '<br />';
                        htmlAscii += '<br />';
                        count = 0;
                    }
                    else
                    {
                        if(count%4 === 0){htmlHex += '&nbsp;';}
                    }
                    while(true)
                    {
                        listIndex+=1;
                        nextNode = (list[listIndex] !== undefined) ? this.ast[list[listIndex]] : undefined;
                        if(nextNode && nextNode.phraseIndex === i)
                        {
                            // empty phrase
                            htmlAscii += emptyAscii;
                            htmlHex += emptyHex;
                            count+=1;
                            if(count === matchLen)
                            {
                                htmlHex += '<br />';
                                htmlAscii += '<br />';
                                count = 0;
                            }
                            else
                            {
                                if(count%4 === 0){htmlHex += '&nbsp;';}
                            }
                        }
                        else{break;}
                    }
                }
                else
                {
                    // open the next highlighted phrase
                    if(stack.length%2 === 0){htmlAscii += spanEven; htmlHex += spanEven;}
                    else{htmlAscii += spanOdd; htmlHex += spanOdd;}
                    stack.push(nextNode);
                    listIndex+=1;
                    nextNode = (list[listIndex] !== undefined) ? this.ast[list[listIndex]] : undefined;
                }
            }

            if(this.chars[i] < 32 || this.chars[i] > 126){htmlAscii += '&#46;';}
            else if(this.chars[i] === 32){htmlAscii += '&nbsp;';}
            else{htmlAscii += '&#'+this.chars[i];}
            hexChar = this.chars[i].toString(16).toUpperCase();
            if(hexChar.length === 1){htmlHex += '0' + hexChar;}
            else{htmlHex += hexChar;}
            // check for end of last opened phrase
            if(stack.length > 0)
            {
                node = stack[stack.length - 1];
                if((node.phraseIndex + node.phraseLength - 1) === i)
                {
                    htmlHex += '</span>';
                    htmlAscii += '</span>';
                    stack.pop();
                }
            }

            count+=1;
            if(count === matchLen)
            {
                htmlHex += '<br />';
                htmlAscii += '<br />';
                count = 0;
            }
            else
            {
                if(count%4 === 0){htmlHex += '&nbsp;';}
            }

        }
        if(stack.length > 0)
        {
            apgAssert(stack.length === 1, 'displayPhrasesHex: stack length: '+stack.length);
            html += '</span>';
            stack.pop();
        }
        html += '<pre><table class="phrase-table"><tr><td>'+htmlHex+'</td><td>'+htmlAscii+'</td></tr></table></pre>';
        return html;
    };

    // helper function for dump() of the AST
    /**
     * @private
     */
    function printLine(indent, up, name, phraseIndex, phraseLength, chars)
    {
        var out = "";
        var i = 0;
        for(; i < indent; i+=1)
        {
            out += '&nbsp;';
        }
        if(up){out += '&uarr;';}
        else{out += '&darr;';}
        out += name+': ['+phraseIndex+']['+phraseLength+']';
        out += '<br />';
        return out;
    }

    // mostly for debugging
    // gives a quick HTML formatted dump of the entire AST
    /**
     * Gives a quick HTML-formatted dump of the entire AST. Just a debugging aid.
     * @param {object} the rules from the parser's opcodes object
     * @param {array} chars - the array of input string character codes
     */
    this.dump = function(rules, chars)
    {
        var i, indent, downIndex, upIndex, ruleIndex, name, index, count;
        var html = '';

        html += 'AST dump:';
        html += '<br />';
        indent = 0;
        i = 0;
        for(; i < this.ast.length; i+=1)
        {
            if(this.ast[i].down)
            {
                downIndex = i;
                upIndex = this.ast[downIndex].upIndex;
                ruleIndex = this.ast[downIndex].ruleIndex;
                name = rules[ruleIndex].rule;
                index = this.ast[upIndex].phraseIndex;
                count = this.ast[upIndex].phraseLength;
                html += printLine(indent, false, name, index, count, chars);
                indent+=1;
            }
            else
            {
                indent-=1;
                upIndex = i;
                downIndex = this.ast[upIndex].downIndex;
                ruleIndex = this.ast[downIndex].ruleIndex;
                name = rules[ruleIndex].rule;
                index = this.ast[upIndex].phraseIndex;
                count = this.ast[upIndex].phraseLength;
                html += printLine(indent, true, name, index, count, chars);
            }
        }
        return html;
    };
}

/****************************
 * apgTrace.js
 */
// trace configuration defaults
var DEFAULT_TRACE_ON = true;
var DEFAULT_TRACE_DISPLAY = 'auto';
var DEFAULT_MAX_SAVED = 100000;
var DEFAULT_MAX_DISPLAYED = 1000;
// var DEFAULT_LINE_RANGE = 'firstN';
var DEFAULT_LINE_RANGE = 'lastN';
// var DEFAULT_LINE_RANGE = 'record-range';

/**
 * @class The Trace class is used by the parser to trace its path through the
 *        syntax tree as the input string is consumed.
 *        <ul>
 *        <li> tracing is the primary debugging tool. </li>
 *        <li> used to find errors in the grammar syntax </li>
 *        <li> used to find errors in the input string </li>
 *        <li> typically, the parser visits many thousands of parse tree nodes
 *        </li>
 *        <li> controls are provided to filter out a small subset of nodes to
 *        trace </li>
 *        </ul>
 *        <p>
 *        Note: This class was originally written primarily to aid the
 *        interactive APG tool and has not been designed from the point of view
 *        of convenience for stand-alone use. Hopefully, the Trace class will
 *        get a better design if and when a stand-alone JavaScript APG generator is developed.
 *        In the meantime, see <a href="http://coasttocoastresearch.com/interactiveapg/help#help-tracing">the tracing help guide</a>
 *        at the APG website.
 *        </p>
 * @version 1.0
 * @copyright Copyright &copy; 2009 Lowell D. Thomas, all rights reserved
 * @license [GNU General Public License]{@link http://www.gnu.org/licenses/licenses.html}
 *          Version 2 or higher.
 * @constructor
 */
function Trace() {
    /* FILTERS */
    // tracing is filtered according to info in the parse filter
    // display of the filtered records is again filtered according to the info
    // in the display filter
    // used to set default values for the filters
    // filter - an array to receive the filter data
    // count - the value to use for "line-count"
    /**
     * @private
     */
    this.setDefaultFilter = function(filter, count) {
        filter.trace = DEFAULT_TRACE_ON;
        filter.display = DEFAULT_TRACE_DISPLAY;
        filter['max-saved'] = DEFAULT_MAX_SAVED;
        filter['max-displayed'] = DEFAULT_MAX_DISPLAYED;
        filter['line-range'] = DEFAULT_LINE_RANGE;
        filter['first-record'] = 0;
        filter['line-count'] = count;
        filter['last-record'] = 0;
        filter.match = true;
        filter.nomatch = true;
        filter.empty = true;
        filter.ops = [];
        filter.ops[ALT] = false;
        filter.ops[CAT] = false;
        filter.ops[REP] = false;
        filter.ops[PRD] = false;
        filter.ops[TRG] = false;
        filter.ops[TBS] = false;
        filter.ops[TLS] = false;
        filter.rules = [];
        filter['rule-map'] = [];
        filter['rule-names'] = [];
        for (var i = 0; i < this.rules.length; i += 1) {
            filter.rules[i] = true;
            filter['rule-names'][i] = this.rules[i].rule;
            filter['rule-map'][this.rules[i].rule] = i;
        }
    };

    // sets the default parse filter
    this.setDefaultParseFilter = function() {
        this.setDefaultFilter(this.parseFilter, DEFAULT_MAX_SAVED);
    }

    // sets the default display filter
    this.setDefaultDisplayFilter = function() {
        this.setDefaultFilter(this.displayFilter, DEFAULT_MAX_DISPLAYED);
    };

    // during debugging, changes may be made to the grammar, changing the number
    // and names of the rule names
    // reconciliation will keep the filter values for the rule names that have
    // not changed
    // and set default values for the new rule names
    this.reconcileRules = function(rules, filter) {
        var tempRules = [];
        var tempRuleMap = [];
        var tempRuleNames = [];
        var i, j, ruleName;
        for (i = 0; i < this.rules.length; i += 1) {
            ruleName = this.rules[i].rule;
            j = filter['rule-map'][ruleName];
            if (j === undefined) {
                tempRules[i] = true;
            } else {
                tempRules[i] = filter.rules[j];
            }
            tempRuleMap[ruleName] = i;
            tempRuleNames[i] = ruleName;
        }
        filter.rules = tempRules;
        filter['rule-map'] = tempRuleMap;
        filter['rule-names'] = tempRuleNames;
    };

    // disables any relevant parse filter options that are false
    // operators whose records were not saved during parsing must be disabled
    // when the user is choosing the operators to display
    this.maskDisplayFilter = function() {
        this.displayFilter.ops[ALT] = this.parseFilter.ops[ALT] ? this.parseFilter.ops[ALT]
            : undefined;
        this.displayFilter.ops[CAT] = this.parseFilter.ops[CAT] ? this.parseFilter.ops[CAT]
            : undefined;
        this.displayFilter.ops[REP] = this.parseFilter.ops[REP] ? this.parseFilter.ops[REP]
            : undefined;
        this.displayFilter.ops[PRD] = this.parseFilter.ops[PRD] ? this.parseFilter.ops[PRD]
            : undefined;
        this.displayFilter.ops[TRG] = this.parseFilter.ops[TRG] ? this.parseFilter.ops[TRG]
            : undefined;
        this.displayFilter.ops[TBS] = this.parseFilter.ops[TBS] ? this.parseFilter.ops[TBS]
            : undefined;
        this.displayFilter.ops[TLS] = this.parseFilter.ops[TLS] ? this.parseFilter.ops[TLS]
            : undefined;
        for (var i = 0; i < this.rules.length; i += 1) {
            this.displayFilter.rules[i] = this.parseFilter.rules[i] ? this.parseFilter.rules[i]
                : undefined;
        }
    };

    // sets one value in a filter
    // filter - the filter to modify
    // option - the filter array element to modify
    // value - the new value to set for the filter option
    // ruleIndex - only used for the rule option, it is the index of the rule to
    // set
    /**
     * Sets one value in one filter.
     *
     * @param {object}
     *            filter - the filter to set the value in
     * @param {string}
     *            option - the filter array element to modify (see code for
     *            available options)
     * @param {option-dependent}
     *            value - the value to set
     * @param {number}
     *            ruleIndex - if option = "rule", this is the index of the rule
     *            to use
     * @private
     */
    this.setFilter = function(filter, option, value, ruleIndex) {
        switch (option) {
            case 'trace':
                filter.trace = value;
                break;
            case 'max-saved':
                filter['max-saved'] = value;
                break;
            case 'display':
                filter.display = value;
                break;
            case 'max-displayed':
                filter['max-displayed'] = value;
                break;
            case 'line-range':
                filter['line-range'] = value;
                break;
            case 'first-record':
                filter['first-record'] = value;
                break;
            case 'line-count':
                filter['line-count'] = value;
                break;
            case 'last-record':
                filter['last-record'] = value;
                break;
            case 'match':
                filter.match = value;
                break;
            case 'nomatch':
                filter.nomatch = value;
                break;
            case 'empty':
                filter.empty = value;
                break;
            case 'alt':
                filter.ops[ALT] = value;
                break;
            case 'cat':
                filter.ops[CAT] = value;
                break;
            case 'rep':
                filter.ops[REP] = value;
                break;
            case 'prd':
                filter.ops[PRD] = value;
                break;
            case 'trg':
                filter.ops[TRG] = value;
                break;
            case 'tbs':
                filter.ops[TBS] = value;
                break;
            case 'tls':
                filter.ops[TLS] = value;
                break;
            case 'rule':
                filter.rules[ruleIndex] = value;
                break;
        }
    };

    // resets the parse filter to its default values
    this.resetParseFilter = function() {
        var temp = [];
        this.setDefaultFilter(temp, DEFAULT_MAX_SAVED);
        temp.rules = [];
        temp['rule-map'] = [];
        temp['rule-names'] = [];
        if (this.rules && this.parseFilter.rules) {
            for (var i = 0; i < this.rules.length; i += 1) {
                var ruleName = this.rules[i].rule;
                temp.rules[i] = true;
                temp['rule-map'][ruleName] = i;
                temp['rule-names'][i] = ruleName;
            }
        }
        this.parseFilter = temp;
    };

    // resets the display filter to its default values
    this.resetDisplayFilter = function() {
        var temp = [];
        this.setDefaultFilter(temp, DEFAULT_MAX_DISPLAYED);
        temp.ops[ALT] = this.displayFilter.ops[ALT] === undefined ? undefined
            : this.displayFilter.ops[ALT];
        temp.ops[CAT] = this.displayFilter.ops[CAT] === undefined ? undefined
            : this.displayFilter.ops[CAT];
        temp.ops[REP] = this.displayFilter.ops[REP] === undefined ? undefined
            : this.displayFilter.ops[REP];
        temp.ops[PRD] = this.displayFilter.ops[PRD] === undefined ? undefined
            : this.displayFilter.ops[PRD];
        temp.ops[TRG] = this.displayFilter.ops[TRG] === undefined ? undefined
            : this.displayFilter.ops[TRG];
        temp.ops[TBS] = this.displayFilter.ops[TBS] === undefined ? undefined
            : this.displayFilter.ops[TBS];
        temp.ops[TLS] = this.displayFilter.ops[TLS] === undefined ? undefined
            : this.displayFilter.ops[TLS];
        temp.rules = [];
        temp['rule-map'] = [];
        temp['rule-names'] = [];
        if (this.rules && this.parseFilter.rules) {
            for (var i = 0; i < this.rules.length; i += 1) {
                var ruleName = this.rules[i].rule;
                temp.rules[i] = this.displayFilter.rules[i] === undefined ? undefined
                    : true;
                temp['rule-map'][ruleName] = i;
                temp['rule-names'][i] = ruleName;
            }
        }
        this.displayFilter = temp;
    };

    // debugging use only
    // returns an HTML-formatted dump of a filter
    this.dumpFilter = function(filter) {
        var html = '';
        html += '<br />';
        html += 'Trace.dumpFilter:';
        html += '<br />display: ' + filter.display;
        html += '<br />max-saved: ' + filter['max-saved'];
        html += '<br />max-displayed: ' + filter['max-displayed'];
        html += '<br />line-range: ' + filter['line-range'];
        html += '<br />first-record: ' + filter['first-record'];
        html += '<br />line-count: ' + filter['line-count'];
        html += '<br />last-record: ' + filter['last-record'];
        html += '<br />match: ' + filter.match;
        html += '<br />nomatch: ' + filter.nomatch;
        html += '<br />empty: ' + filter.empty;
        html += '<br />alt: ' + filter.ops[ALT];
        html += '<br />cat: ' + filter.ops[CAT];
        html += '<br />rep: ' + filter.ops[REP];
        html += '<br />prd: ' + filter.ops[PRD];
        html += '<br />trg: ' + filter.ops[TRG];
        html += '<br />tbs: ' + filter.ops[TBS];
        html += '<br />tls: ' + filter.ops[TLS];
        for (var i = 0; i < filter.rules.length; i += 1) {
            html += '<br />rule[' + i + ']: ' + filter['rule-names'][i] + ': '
                + filter.rules[i];
        }
        return html;
    };

    /* TRACE */

    // saves a single trace record during downward traversal of the syntax tree
    // op - the opcode being traversed
    // state the current state of the node
    // offset - index of the phrase being parsed
    // length - length of the matched phrase
    this.traceDown = function(op, state, offset, length) {
        var circularSaved;
        if (this.parseFilter.trace) {
            // filter on operator selection
            if (this.parseOpFilter(op)) {
                this.depthStack[this.depth] = [];
                this.depthStack[this.depth].filteredLine = this.opFilteredLines;
                this.depthStack[this.depth].savedLine = undefined;
                this.depthStack[this.depth].savedSequenceNumber = undefined;
                if (this.firstOpFiltered === -1) {
                    this.firstOpFiltered = this.unfilteredLines;
                }

                // filter on line selection
                if (this.parseLineFilter(this.unfilteredLines, this.savedLines,
                    this.parseFilter)) {
                    if (this.firstSaved === -1) {
                        this.firstSaved = this.unfilteredLines;
                    }
                    circularSaved = this.parseCircular.collect();
                    this.depthStack[this.depth].savedLine = circularSaved;
                    this.depthStack[this.depth].savedSequenceNumber = this.unfilteredLines;
                    this.lines[circularSaved] = [];
                    this.lines[circularSaved].dir = 'down';
                    this.lines[circularSaved].depth = this.depth;
                    this.lines[circularSaved].sequenceNumber = this.unfilteredLines;
                    this.lines[circularSaved].otherSequenceNumber = undefined;
                    this.lines[circularSaved].thisSavedLine = circularSaved;
                    this.lines[circularSaved].otherSavedLine = undefined;
                    this.lines[circularSaved].opType = op.type;
                    this.lines[circularSaved].state = state;
                    this.lines[circularSaved].offset = offset;
                    this.lines[circularSaved].length = length;
                    if (op.type === RNM) {
                        this.lines[circularSaved].ruleIndex = op.ruleIndex;
                    }
                    this.savedLines += 1;
                    this.lastSaved = this.unfilteredLines;
                }
                this.opFilteredLines += 1;
                this.depth += 1;
                this.lastOpFiltered = this.unfilteredLines;
            }
            this.unfilteredLines += 1;
        }
    };

    // saves a single trace record during upward traversal of the syntax tree
    // op - the opcode being traversed
    // state the current state of the node
    // offset - index of the phrase being parsed
    // length - length of the matched phrase
    this.traceUp = function(op, state, offset, length) {
        var circularSaved;
        if (this.parseFilter.trace) {
            // filter on operator selection
            if (this.parseOpFilter(op)) {
                this.depth -= 1;
                var otherFilteredLine = this.depthStack[this.depth].filteredLine;
                var otherSavedLine = this.depthStack[this.depth].savedLine;
                var otherSequenceNumber = this.depthStack[this.depth].savedSequenceNumber;
                if (this.firstOpFiltered === -1) {
                    this.firstOpFiltered = this.unfilteredLines;
                }

                // filter on line selection
                if (this.parseLineFilter(this.unfilteredLines, this.savedLines,
                    this.parseFilter)) {
                    if (this.firstSaved === -1) {
                        this.firstSaved = this.unfilteredLines;
                    }
                    circularSaved = this.parseCircular.collect();
                    if (otherSavedLine !== undefined) {
                        this.lines[otherSavedLine].otherSavedLine = circularSaved;
                        this.lines[otherSavedLine].length = length;
                        this.lines[otherSavedLine].otherSequenceNumber = this.unfilteredLines;
                    }
                    this.lines[circularSaved] = [];
                    this.lines[circularSaved].dir = 'up';
                    this.lines[circularSaved].depth = this.depth;
                    this.lines[circularSaved].sequenceNumber = this.unfilteredLines;
                    this.lines[circularSaved].otherSequenceNumber = otherSequenceNumber;
                    this.lines[circularSaved].thisSavedLine = circularSaved;
                    this.lines[circularSaved].otherSavedLine = otherSavedLine;
                    this.lines[circularSaved].opType = op.type;
                    this.lines[circularSaved].state = state;
                    this.lines[circularSaved].offset = offset;
                    this.lines[circularSaved].length = length;
                    if (op.type === RNM) {
                        this.lines[circularSaved].ruleIndex = op.ruleIndex;
                    }
                    this.savedLines += 1;
                    this.lastSaved = this.unfilteredLines;
                }
                this.opFilteredLines += 1;
                this.lastOpFiltered = this.unfilteredLines;
            }
            this.unfilteredLines += 1;
        }
    };

    // filters on operators type according to the parse filter parameters
    this.parseOpFilter = function(op) {
        // check the operator
        var opMatch = false;
        if (op.type === RNM && this.parseFilter.rules[op.ruleIndex]) {
            opMatch = true;
        } else if (this.parseFilter.ops[op.type]) {
            opMatch = true;
        }
        return opMatch;
    };

    // filters the line range selection according to the parse filter parameters
    this.parseLineFilter = function(thisRecord, thisLine, filter) {
        var ret = false;
        var maxLines;
        if ((thisRecord >= filter['first-record'])) {
            switch (filter['line-range']) {
                case 'firstN':
                    if ((thisLine < this.linesMax)) {
                        ret = true;
                    }
                    break;
                case 'record-range':
                    if ((thisRecord <= filter['last-record'] && thisLine < filter['max-saved'])) {
                        ret = true;
                    }
                    break;
                case 'lastN':
                    // allow all lines
                    ret = true;
                    break;
                default:
                    throw [ 'Trace: parseLineFilter: unrecognized filter[\'line-range\']: '
                        + filter['line-range'] ];
                    break;
            }
        }
        return ret;
    };

    /* DISPLAY */
    // returns an HTML display of the saved and filtered trace records
    this.display = function() {
        if (this.parseFilter['line-range'] == 'lastN'
            && !this.parseCircularReversed) {
            this.parseReverse();
            this.parseCircularReversed = true;
        }
        this.filterSavedLines();
        return this.displayFiltered();
    };

    // re-compute the other sequence number using a reverse scan of the saved
    // lines
    // required after saving only the last N records
    this.parseReverse = function() {
        this.parseCircular.initReverse();
        this.depthStack.length = 0;
        var i, max, j, depth, line, otherLine;
        max = this.parseCircular.items();
        depth = 0;
        for (i = 0; i < max; i += 1) {
            j = this.parseCircular.reverse();
            line = this.lines[j];
            if (line.dir == 'up') {
                this.depthStack[depth] = [];
                this.depthStack[depth].depthLine = j;
                line.otherSequenceNumber = undefined;
                depth += 1;
            } else {
                depth -= 1;
                otherLine = this.depthStack[depth].depthLine;
                line.otherSequenceNumber = this.lines[otherLine].sequenceNumber;
                this.lines[otherLine].otherSequenceNumber = line.sequenceNumber;
            }
        }
    }

    // scans all saved trace records and filters them according to the display
    // filter
    this.filterSavedLines = function() {
        var i, j;
        var line, otherLine;
        this.initDisplay();

        // all saved lines
        var max = this.parseCircular.items();
        this.parseCircular.initReplay();
        for (i = 0; i < max; i += 1) {
            j = this.parseCircular.replay();
            line = this.lines[j];
            line.thisFilteredLine = undefined;

            // filter display lines on operator and state
            if (this.displayFilterOp(line) && this.displayFilterState(line)) {
                if (this.firstOpDisplayed === -1) {
                    this.firstOpDisplayed = line.sequenceNumber;
                }

                // filter display lines on line range
                if (this.displayLineFilter(this.displayedLines, line,
                    this.displayFilter)) {
                    if (this.firstDisplayed === -1) {
                        this.firstDisplayed = line.sequenceNumber;
                    }
                    this.dLines[this.displayCircular.collect()] = j;
                    line.thisFilteredLine = this.displayedLines;
                    if (line.dir === 'down') {
                        line.otherFilteredLine = undefined;
                    } else {
                        if (line.otherSavedLine !== undefined) {
                            otherLine = this.lines[line.otherSavedLine];
                            otherLine.otherFilteredLine = this.displayedLines;
                            line.otherFilteredLine = otherLine.thisFilteredLine;
                        }
                    }
                    this.displayedLines += 1;
                    this.lastDisplayed = line.sequenceNumber;
                }
                this.opDisplayedLines += 1;
                this.lastOpDisplayed = line.sequenceNumber;
            }
        }
    };

    // returns an HTML-tabular format of the filtered records
    this.displayFiltered = function() {
        var modeDisplay;
        if (this.displayFilter.display === 'ascii') {
            modeDisplay = this.displayAscii;
        } else if (this.displayFilter.display === 'hex') {
            modeDisplay = this.displayHex;
        } else {
            if (charsAreAscii(this.chars)) {
                modeDisplay = this.displayAscii;
            } else {
                modeDisplay = this.displayHex;
            }
        }
        var parseStats = '';
        parseStats += '<table class="log-table">';
        parseStats += '<caption>PARSER FILTER</caption>';
        parseStats += '<tr><td>max saved records:&nbsp;</td><td class="log-msg">'
            + this.parseFilter['max-saved'] + '</td></tr>';
        parseStats += '<tr><td>unfiltered records:&nbsp;</td><td class="log-msg">'
            + this.unfilteredLines + '</td></tr>';
        parseStats += '<tr><td>operator filtered records:&nbsp;</td><td class="log-msg">'
            + this.opFilteredLines + '</td></tr>';
        parseStats += '<tr><td>first:&nbsp;</td><td class="log-msg">'
            + this.firstOpFiltered + '</td></tr>';
        parseStats += '<tr><td>last:&nbsp;</td><td class="log-msg">'
            + this.lastOpFiltered + '</td></tr>';
        parseStats += '<tr><td>line-range filtered records:&nbsp;</td><td class="log-msg">'
            + this.parseCircular.items() + '</td></tr>';
        parseStats += '<tr><td>first:&nbsp;</td><td class="log-msg">'
            + this.firstSaved + '</td></tr>';
        parseStats += '<tr><td>last:&nbsp;</td><td class="log-msg">'
            + this.lastSaved + '</td></tr>';
        parseStats += '</table>';

        var html = '';
        var line, thisLine, otherLine;
        var i, j;
        var displayedLine = 0;
        html += '<tr><th>(a)</th><th>(b)</th><th>(c)</th><th>(d)</th><th>(e)</th><th>(f)</th><th>(g)</th>';
        html += '<th class="log-msg">operator</th><th class="log-msg">phrase</th></tr>';
        this.displayCircular.initReplay();
        var max = this.displayCircular.items();
        for (i = 0; i < max; i += 1) {
            j = this.dLines[this.displayCircular.replay()];
            line = this.lines[j];
            if (line.thisFilteredLine !== undefined) {
                thisLine = line.sequenceNumber;
                otherLine = (line.otherSequenceNumber !== undefined) ? line.otherSequenceNumber
                    : '--';
                // if(displayedLine%2 === 0){html += '<tr class="even">';}
                // else{html += '<tr class="odd">';}
                html += '<tr>';
                html += '<td>' + displayedLine + '</td>';
                html += '<td>' + thisLine + '</td><td>' + otherLine + '</td>';
                html += '<td>' + line.offset + '</td><td>' + line.length
                    + '</td>';
                html += '<td>' + line.depth + '</td>';
                html += '<td>';
                switch (line.state) {
                    case APG_ACTIVE:
                        html += '&darr;&nbsp;';
                        break;
                    case APG_MATCH:
                        html += '<span class="match">&uarr;M</span>';
                        break;
                    case APG_NOMATCH:
                        html += '<span class="nomatch">&uarr;N</span>';
                        break;
                    case APG_EMPTY:
                        html += '<span class="empty">&uarr;E</span>';
                        break;
                }
                html += '</td>';
                html += '<td class="log-msg">';
                html += this.indent(line.depth) + opcodeToString(line.opType);
                if (line.opType === RNM) {
                    html += '(' + this.rules[line.ruleIndex].rule + ') ';
                }
                html += '</td>';
                html += '<td class="log-msg">';
                html += modeDisplay(this.chars, line.offset, line.length,
                    line.state);
                html += '</td></tr>';
                displayedLine += 1;
            }
        }
        html += '<tr><th>(a)</th><th>(b)</th><th>(c)</th><th>(d)</th><th>(e)</th><th>(f)</th><th>(g)</th>';
        html += '<th class="log-msg">operator</th><th class="log-msg">phrase</th></tr>';
        html = '<table class="log-table">' + html + '</table>';
        html += '<p>';
        html += '(a)&nbsp;-&nbsp;filtered record number (sequential on displayed records)<br />';
        html += '(b)&nbsp;-&nbsp;unfiltered record number<br />';
        html += '(c)&nbsp;-&nbsp;matching unfiltered record number ("--" if matching record not displayed)<br />';
        html += '(d)&nbsp;-&nbsp;beginning phrase character number<br />';
        html += '(e)&nbsp;-&nbsp;phrase length<br />';
        html += '(f)&nbsp;-&nbsp;relative tree depth<br />';
        html += '(g)&nbsp;-&nbsp;operator state<br />';
        html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&darr;open<br />';
        html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&uarr;final<br />';
        html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;M phrase matched<br />';
        html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;N phrase not matched<br />';
        html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;E phrase matched, empty<br />';
        html += 'operator&nbsp;-&nbsp;ALT, CAT, REP, PRD, TRG, TLS, TBS or RNM(rule name)<br />';
        html += 'phrase&nbsp;&nbsp;&nbsp;-&nbsp;up to 128 characters of the phrase being matched<br />';
        html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&bull; = End of String<br />';
        html += '</p>';
        var displayStats = '';
        displayStats += '<table class="log-table">';
        displayStats += '<caption>DISPLAY FILTER</caption>';
        displayStats += '<tr><td>max displayed records:&nbsp;</td><td class="log-msg">'
            + this.displayFilter['max-displayed'] + '</td></tr>';
        displayStats += '<tr><td>saved records:&nbsp;</td><td class="log-msg">'
            + this.savedLines + '</td></tr>';
        displayStats += '<tr><td>operator filtered records:&nbsp;</td><td class="log-msg">'
            + this.opDisplayedLines + '</td></tr>';
        displayStats += '<tr><td>first:&nbsp;</td><td class="log-msg">'
            + this.firstOpDisplayed + '</td></tr>';
        displayStats += '<tr><td>last:&nbsp;</td><td class="log-msg">'
            + this.lastOpDisplayed + '</td></tr>';
        displayStats += '<tr><td>line-range filtered records:&nbsp;</td><td class="log-msg">'
            + this.displayedLines + '</td></tr>';
        displayStats += '<tr><td>first:&nbsp;</td><td class="log-msg">'
            + this.firstDisplayed + '</td></tr>';
        displayStats += '<tr><td>last:&nbsp;</td><td class="log-msg">'
            + this.lastDisplayed + '</td></tr>';
        displayStats += '</table>';
        var tableHtml = '';
        tableHtml += '<table class="log-table">';
        tableHtml += '<tr><td>' + parseStats + '</td><td>&nbsp;</td><td>'
            + displayStats + '</td></tr>';
        tableHtml += '</table><br />';
        return tableHtml + html;
    };

    // filters a record on operator type according to the display filter
    this.displayFilterOp = function(line) {
        var opMatch = false;
        if (line.opType === RNM && this.displayFilter.rules[line.ruleIndex]) {
            opMatch = true;
        } else if (this.displayFilter.ops[line.opType]) {
            opMatch = true;
        }
        return opMatch;
    };

    // filters a record on final state according to the display filter
    this.displayFilterState = function(line) {
        var display = false;
        switch (line.state) {
            case APG_ACTIVE:
                var otherLine = line.otherSavedLine;
                if (otherLine === undefined) {
                    display = true;
                } else if (this.lines[otherLine]) {
                    switch (this.lines[otherLine].state) {
                        case APG_MATCH:
                            if (this.displayFilter.match) {
                                display = true;
                            }
                            break;
                        case APG_NOMATCH:
                            if (this.displayFilter.nomatch) {
                                display = true;
                            }
                            break;
                        case APG_EMPTY:
                            if (this.displayFilter.empty) {
                                display = true;
                            }
                            break;
                        case APG_ACTIVE:
                            throw [ 'Trace: filterStateDisplay: ACTIVE state not allowed here' ];
                    }
                }
                break;
            case APG_MATCH:
                if (this.displayFilter.match) {
                    display = true;
                }
                break;
            case APG_NOMATCH:
                if (this.displayFilter.nomatch) {
                    display = true;
                }
                break;
            case APG_EMPTY:
                if (this.displayFilter.empty) {
                    display = true;
                }
                break;
        }
        return display;
    };

    // filters a record on line range according to the display filter
    this.displayLineFilter = function(thisLine, line, filter) {
        var ret = false;
        var thisRecord = line.sequenceNumber;
        if ((thisRecord >= filter['first-record'])) {
            switch (filter['line-range']) {
                case 'firstN':
                    if ((thisLine < this.displayMax)) {
                        ret = true;
                    }
                    break;
                case 'record-range':
                    if ((thisRecord <= filter['last-record'] && thisLine < filter['max-displayed'])) {
                        ret = true;
                    }
                    break;
                case 'lastN':
                    // allow all lines
                    ret = true;
                    break;
                default:
                    throw [ 'Trace: displayLineFilter: unrecognized filter[\'line-range\']: '
                        + filter['line-range'] ];
                    break;
            }
        }
        return ret;
    };

    // display helper - adds indenting spaces to a line
    this.indent = function(depth) {
        var html = '';
        for (var i = 0; i < depth; i += 1) {
            if (i % 2 === 0) {
                html += '&nbsp;';
            } else {
                html += '&#46;';
            }
        }
        return html;
    };

    // formats the phrase display in ASCII
    /**
     * Formats the phrase display in ASCII.
     *
     * @param {array}
     *            chars - array of input string character codes
     * @private
     *
     */
    this.displayAscii = function(chars, offset, len, state) {
        var matchLen = 128;
        if (offset < 0) {
            offset = 0;
        }
        var end = offset + matchLen;
        var lastChar = '';
        if (end > chars.length) {
            end = chars.length;
            lastChar = '<span class="eos">&bull;</span>';
        }
        var htmlAscii = '';
        var count = 0;
        if (state === APG_MATCH) {
            htmlAscii += '<span class="match">';
        }
        // else{htmlAscii = '<span class="nomatch">';}
        for (var i = offset; i < end; i += 1, count += 1) {
            if (chars[i] === 10) {
                htmlAscii += '<span class="control-char">LF</span>';
            } else if (chars[i] === 13) {
                htmlAscii += '<span class="control-char">CR</span>';
            } else if (chars[i] === 9) {
                htmlAscii += '<span class="control-char">TAB</span>';
            } else if (chars[i] < 32 || chars[i] > 126) {
                htmlAscii += '<span class="non-ascii">x'
                    + chars[i].toString(16) + '</span>';
            } else {
                htmlAscii += String.fromCharCode(chars[i]);
            }
            if (state === APG_MATCH && (count + 1) >= len) {
                htmlAscii += '</span>';
                // htmlAscii += '</span><span class="nomatch">';
            }
        }
        htmlAscii += lastChar;
        htmlAscii += '</span>';
        return htmlAscii;
    };

    // formats the phrase display in hexidecimal
    /**
     * Formats the phrase display in hexidecimal.
     *
     * @param {array}
     *            chars - array of input string character codes
     * @private
     */
    this.displayHex = function(chars, offset, len, state) {
        var matchLen = 16;
        if (offset < 0) {
            offset = 0;
        }
        var end = offset + matchLen;
        var htmlHex;
        var htmlAscii;
        var count = 0;
        var mid = matchLen / 2;
        var quarter = matchLen / 4;
        if (state === APG_MATCH) {
            htmlHex = '<span class="match">';
            htmlAscii = '<span class="match">';
        } else {
            htmlHex = '<span class="nomatch">';
            htmlAscii = '<span class="nomatch">';
        }
        for (var i = offset; i < end; i += 1, count += 1) {
            if (count > 0) {
                if (count % quarter === 0) {
                    htmlHex += '&nbsp;';
                }
                if (count % mid === 0) {
                    htmlHex += '&nbsp;';
                }
            }
            if (i >= chars.length) {
                htmlHex += '..';
            } else {
                var hexChar = chars[i].toString(16).toUpperCase();
                if (hexChar.length === 1) {
                    htmlHex += '0' + hexChar;
                } else {
                    htmlHex += hexChar;
                }
                if (chars[i] < 32 || chars[i] > 126) {
                    htmlAscii += '.';
                } else {
                    htmlAscii += String.fromCharCode(chars[i]);
                }
            }
            if (state === APG_MATCH && (count + 1) >= len) {
                htmlHex += '</span><span class="nomatch">';
                htmlAscii += '</span><span class="nomatch">';
            }
        }
        htmlHex += '</span>';
        htmlAscii += '</span>';
        return htmlHex + '&nbsp;&nbsp;' + htmlAscii;
    };

    // initialize the trace with the rules from the APG-generated opcodes
    /**
     * Initialize the trace with the rules from the APG-generated opcodes. Must
     * be done before syntax analysis with the same input string passed to the
     * parser.
     *
     * @param {object} rules - the opcode object's rules
     * @private
     */
    this.initRules = function(rules) {
        this.rules = rules;
        this.ruleCount = this.rules.length;
        this.reconcileRules(rules, this.parseFilter);
        this.reconcileRules(rules, this.displayFilter);
        this.initMembers();
    };

    // initialize the trace with the input string character codes
    /**
     * Initialize the trace with the input string character codes. Must be done
     * before syntax analysis with the same input string passed to the parser.
     *
     * @param {array} chars - array of input string character codes
     * @private
     */
    this.initChars = function(chars) {
        this.chars = chars;
        this.initMembers();
    };

    // initialize the parse filters stuff
    this.initMembers = function() {
        this.lines.length = 0;
        this.linesMax = this.parseFilter['max-saved'];
        if (this.linesMax > this.parseFilter['line-count']) {
            this.linesMax = this.parseFilter['line-count'];
        }
        this.parseCircular.initCollection(this.linesMax);
        this.parseCircularReversed = false;

        this.unfilteredLines = 0;
        this.opFilteredLines = 0;
        this.savedLines = 0;

        this.firstOpFiltered = -1;
        this.lastOpFiltered = -1;
        this.firstSaved = -1;
        this.lastSaved = -1;

        this.initDisplay();
    };

    // initialize the display filter stuff
    this.initDisplay = function() {
        this.depthStack.length = 0;
        this.depth = 0;
        this.dLines.length = 0;
        this.displayMax = this.displayFilter['max-displayed'];
        if (this.displayMax > this.displayFilter['line-count']) {
            this.displayMax = this.displayFilter['line-count'];
        }
        this.displayCircular.initCollection(this.displayMax);

        this.opDisplayedLines = 0;
        this.displayedLines = 0;

        this.firstOpDisplayed = -1;
        this.lastOpDisplayed = -1;
        this.firstDisplayed = -1;
        this.lastDisplayed = -1;
    };

    // MEMBER DATA & INITIALIZATION
    this.rules = [];
    this.chars = [];
    this.depthStack = [];
    this.depth = 0;

    // trace statistics (valid after completed trace)
    this.lines = [];
    this.parseFilter = [];
    this.parseFilter.rules = [];
    this.parseFilter['rule-map'] = [];
    this.parseFilter['rule-names'] = [];
    this.unfilteredLines = 0;
    this.opFilteredLines = 0;
    this.savedLines = 0;
    this.linesMax = 0;
    this.parseCircular = new Circular();
    this.parseCircularReversed = false;

    // display statistics (valid after a completed display of the trace)
    this.displayFilter = [];
    this.displayFilter.rules = [];
    this.displayFilter['rule-map'] = [];
    this.displayFilter['rule-names'] = [];
    this.opDisplayedLines = 0;
    this.displayedLines = 0;
    this.displayMax = 0;
    this.dLines = [];
    this.displayCircular = new Circular();

    this.firstOpFiltered = -1;
    this.lastOpFiltered = -1;
    this.firstSaved = -1;
    this.lastSaved = -1;

    this.firstOpDisplayed = -1;
    this.lastOpDisplayed = -1;
    this.firstDisplayed = -1;
    this.lastDisplayed = -1;

    // initialize both filters
    this.setDefaultParseFilter();
    this.setDefaultDisplayFilter();
}

/****************************
 * apgStats.js
 */
function Stats(rules)
{
    /**
     * clears the object, makes it ready to start collecting
     */
    this.clear = function()
    {
        this.statsALT.match = 0;
        this.statsALT.nomatch = 0;
        this.statsALT.empty = 0;
        this.statsALT.backtrack = 0;
        this.statsCAT.match = 0;
        this.statsCAT.nomatch = 0;
        this.statsCAT.empty = 0;
        this.statsREP.match = 0;
        this.statsREP.nomatch = 0;
        this.statsREP.empty = 0;
        this.statsREP.backtrack = 0;
        this.statsPRD.match = 0;
        this.statsPRD.nomatch = 0;
        this.statsPRD.empty = 0;
        this.statsPRD.backtrack = 0;
        this.statsRNM.match = 0;
        this.statsRNM.nomatch = 0;
        this.statsRNM.empty = 0;
        this.statsTRG.match = 0;
        this.statsTRG.nomatch = 0;
        this.statsTRG.empty = 0;
        this.statsTLS.match = 0;
        this.statsTLS.nomatch = 0;
        this.statsTLS.empty = 0;
        this.statsTBS.match = 0;
        this.statsTBS.nomatch = 0;
        this.statsTBS.empty = 0;
        if(this.rules)
        {
            for(var i = 0; i < this.rules.length; i+=1)
            {
                this.statsRules[i].match = 0;
                this.statsRules[i].nomatch = 0;
                this.statsRules[i].empty = 0;
                this.statsRules[i].rule = this.rules[i].rule;
            }
        }
    };

    /**
     * The primary interface with the parser. Increments node counts for the various parsing states.
     * @private
     * @param {Object} op - the opcode for this node
     * @param state - the final state after the parser has processed this node.
     */
    this.collect = function(op, state)
    {
        var whichState = '';
        switch(state[OP_STATE])
        {
            case APG_MATCH:
                whichState = 'match';
                break;

            case APG_NOMATCH:
                whichState = 'nomatch';
                break;

            case APG_EMPTY:
                whichState = 'empty';
                break;

            default:
                throw ['Trace.collect: invalid state: ' + state[OP_STATE]];

        }
        switch(op.type)
        {
            case ALT:
                this.statsALT[whichState]+=1;
                break;

            case CAT:
                this.statsCAT[whichState]+=1;
                break;

            case REP:
                this.statsREP[whichState]+=1;
                break;

            case PRD:
                this.statsPRD[whichState]+=1;
                break;

            case RNM:
                this.statsRNM[whichState]+=1;
                if(this.statsRules){this.statsRules[op.ruleIndex][whichState]+=1;}
                break;

            case TRG:
                this.statsTRG[whichState]+=1;
                break;

            case TLS:
                this.statsTLS[whichState]+=1;
                break;

            case TBS:
                this.statsTBS[whichState]+=1;
                break;

            default:
                throw ['Trace.collect: invalid opcode type: ' + op.type];
        }
    };

    // records back tracking statistics after ALT, REP or PRD back tracks
    this.backtrack = function(op)
    {
        switch(op.type)
        {
            case ALT:
                this.statsALT.backtrack+=1;
                break;

            case REP:
                this.statsREP.backtrack+=1;
                break;

            case PRD:
                this.statsPRD.backtrack+=1;
                break;

            default:
                throw ['Trace.backtrack: invalid opcode type: ' + op.type];
        }
    };

    // helper function for sorting the display of stats
    function compareCount(lhs, rhs)
    {
        var totalLhs, totalRhs;
        totalLhs = lhs.match + lhs.empty + lhs.nomatch;
        totalRhs = rhs.match + rhs.empty + rhs.nomatch;
        if(totalLhs < totalRhs){return 1;}
        if(totalLhs > totalRhs){return -1;}
        return 0;
    }

    // helper function for sorting the display of stats
    function compareName(lhs, rhs)
    {
        var nameLhs, nameRhs, lenLhs, lenRhs, len, i;
        nameLhs = lhs.rule.toLowerCase();
        nameRhs = rhs.rule.toLowerCase();
        lenLhs = nameLhs.length;
        lenRhs = nameRhs.length;
        len = (lenLhs < lenRhs) ? lenLhs : lenRhs;
        for(i = 0; i < len; i+=1)
        {
            if(nameLhs[i] < nameRhs[i]){return -1;}
            if(nameLhs[i] > nameRhs[i]){return 1;}
        }
        if(lenLhs < lenRhs){return -1;}
        if(lenLhs > lenRhs){return 1;}
        return 0;
    }

    // returns HTML tablular display of the statistics
    // caption - option table caption
    /**
     * Returns an HTML table of the statistics.
     * @param {string} caption - optional table caption
     * @returns {string} the HTML
     */
    this.display = function(caption)
    {
        var i, tot, total, html = '';
        total = [];
        total.match = this.statsALT.match +
            this.statsCAT.match +
            this.statsREP.match +
            this.statsPRD.match +
            this.statsRNM.match +
            this.statsTRG.match +
            this.statsTBS.match +
            this.statsTLS.match;
        total.nomatch = this.statsALT.nomatch +
            this.statsCAT.nomatch +
            this.statsREP.nomatch +
            this.statsPRD.nomatch +
            this.statsRNM.nomatch +
            this.statsTRG.nomatch +
            this.statsTBS.nomatch +
            this.statsTLS.nomatch;
        total.empty = this.statsALT.empty +
            this.statsCAT.empty +
            this.statsREP.empty +
            this.statsPRD.empty +
            this.statsRNM.empty +
            this.statsTRG.empty +
            this.statsTBS.empty +
            this.statsTLS.empty;
        total.backtrack = this.statsALT.backtrack +
            this.statsREP.backtrack +
            this.statsPRD.backtrack;

        if(this.statsRules)
        {
            this.statsRules.sort(compareName);
            this.statsRules.sort(compareCount);
        }

        html += '<table class="stats">';
        if(typeof(caption) === 'string')
        {
            html += '<caption>'+caption+'</caption>';
        }

        html += '<tr>';
        html += '<th>';
        html += '';
        html += '</th>';
        html += '<th>';
        html += 'MATCH';
        html += '</th>';
        html += '<th>';
        html += 'NOMATCH';
        html += '</th>';
        html += '<th>';
        html += 'EMPTY';
        html += '</th>';
        html += '<th>';
        html += 'ALL';
        html += '</th>';
        html += '<th>';
        html += 'BACKTRACKS';
        html += '</th>';
        html += '</tr>';

        html += '<tr>';
        html += '<td>';
        html += 'ALT';
        html += '</td>';
        html += '<td>';
        html += this.statsALT.match;
        html += '</td>';
        html += '<td>';
        html += this.statsALT.nomatch;
        html += '</td>';
        html += '<td>';
        html += this.statsALT.empty;
        html += '</td>';
        html += '<td>';
        html += (this.statsALT.match + this.statsALT.nomatch + this.statsALT.empty);
        html += '</td>';
        html += '<td>';
        html += this.statsALT.backtrack;
        html += '</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td>';
        html += 'CAT';
        html += '</td>';
        html += '<td>';
        html += this.statsCAT.match;
        html += '</td>';
        html += '<td>';
        html += this.statsCAT.nomatch;
        html += '</td>';
        html += '<td>';
        html += this.statsCAT.empty;
        html += '</td>';
        html += '<td>';
        html += (this.statsCAT.match + this.statsCAT.nomatch + this.statsCAT.empty);
        html += '</td>';
        html += '<td>';
        html += '';
        html += '</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td>';
        html += 'REP';
        html += '</td>';
        html += '<td>';
        html += this.statsREP.match;
        html += '</td>';
        html += '<td>';
        html += this.statsREP.nomatch;
        html += '</td>';
        html += '<td>';
        html += this.statsREP.empty;
        html += '</td>';
        html += '<td>';
        html += (this.statsREP.match + this.statsREP.nomatch + this.statsREP.empty);
        html += '</td>';
        html += '<td>';
        html += this.statsREP.backtrack;
        html += '</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td>';
        html += 'PRD';
        html += '</td>';
        html += '<td>';
        html += this.statsPRD.match;
        html += '</td>';
        html += '<td>';
        html += this.statsPRD.nomatch;
        html += '</td>';
        html += '<td>';
        html += this.statsPRD.empty;
        html += '</td>';
        html += '<td>';
        html += (this.statsPRD.match + this.statsPRD.nomatch + this.statsPRD.empty);
        html += '</td>';
        html += '<td>';
        html += this.statsPRD.backtrack;
        html += '</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td>';
        html += 'RNM';
        html += '</td>';
        html += '<td>';
        html += this.statsRNM.match;
        html += '</td>';
        html += '<td>';
        html += this.statsRNM.nomatch;
        html += '</td>';
        html += '<td>';
        html += this.statsRNM.empty;
        html += '</td>';
        html += '<td>';
        html += (this.statsRNM.match + this.statsRNM.nomatch + this.statsRNM.empty);
        html += '</td>';
        html += '<td>';
        html += '';
        html += '</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td>';
        html += 'TRG';
        html += '</td>';
        html += '<td>';
        html += this.statsTRG.match;
        html += '</td>';
        html += '<td>';
        html += this.statsTRG.nomatch;
        html += '</td>';
        html += '<td>';
        html += this.statsTRG.empty;
        html += '</td>';
        html += '<td>';
        html += (this.statsTRG.match + this.statsTRG.nomatch + this.statsTRG.empty);
        html += '</td>';
        html += '<td>';
        html += '';
        html += '</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td>';
        html += 'TBS';
        html += '</td>';
        html += '<td>';
        html += this.statsTBS.match;
        html += '</td>';
        html += '<td>';
        html += this.statsTBS.nomatch;
        html += '</td>';
        html += '<td>';
        html += this.statsTBS.empty;
        html += '</td>';
        html += '<td>';
        html += (this.statsTBS.match + this.statsTBS.nomatch + this.statsTBS.empty);
        html += '</td>';
        html += '<td>';
        html += '';
        html += '</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td>';
        html += 'TLS';
        html += '</td>';
        html += '<td>';
        html += this.statsTLS.match;
        html += '</td>';
        html += '<td>';
        html += this.statsTLS.nomatch;
        html += '</td>';
        html += '<td>';
        html += this.statsTLS.empty;
        html += '</td>';
        html += '<td>';
        html += (this.statsTLS.match + this.statsTLS.nomatch + this.statsTLS.empty);
        html += '</td>';
        html += '<td>';
        html += '';
        html += '</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td>';
        html += 'TOTAL';
        html += '</td>';
        html += '<td>';
        html += total.match;
        html += '</td>';
        html += '<td>';
        html += total.nomatch;
        html += '</td>';
        html += '<td>';
        html += total.empty;
        html += '</td>';
        html += '<td>';
        html += (total.match + total.nomatch + total.empty);
        html += '</td>';
        html += '<td>';
        html += total.backtrack;
        html += '</td>';
        html += '</tr>';

        html += '<tr>';
        html += '<td colspan="5">';
        html += '</td>';
        html += '<th class="stats-hdr"  colspan="6">';
        html += 'RULE NAME';
        html += '</th>';
        html += '</tr>';

        if(this.statsRules)
        {
            for(i = 0; i < this.rules.length; i+=1)
            {
                tot = this.statsRules[i].match + this.statsRules[i].nomatch + this.statsRules[i].empty;
                if(tot > 0)
                {
                    html += '<tr>';
                    html += '<td>';
                    html += '</td>';
                    html += '<td>';
                    html += this.statsRules[i].match;
                    html += '</td>';
                    html += '<td>';
                    html += this.statsRules[i].nomatch;
                    html += '</td>';
                    html += '<td>';
                    html += this.statsRules[i].empty;
                    html += '</td>';
                    html += '<td>';
                    html += tot;
                    html += '</td>';
                    html += '<td class="stats-hdr">';
                    html += this.statsRules[i].rule;
                    html += '</td>';
                    html += '</tr>';
                }
            }
        }

        html += '</table>';
        return html;
    };

    this.statsALT = [];
    this.statsCAT = [];
    this.statsREP = [];
    this.statsPRD = [];
    this.statsRNM = [];
    this.statsTRG = [];
    this.statsTLS = [];
    this.statsTBS = [];
    this.statsRules = null;
    this.rules = null;
    if(isArray(rules))
    {
        this.rules = rules;
        this.statsRules = [];
        for(var i = 0; i < this.rules.length; i+=1)
        {
            this.statsRules[i] = [];
        }
    }
    this.clear();
}

/****************************
 * apgLib.js
 */
// opcode operator types
var ALT = 1;
var CAT = 2;
var REP = 3;
var RNM = 4;
var TRG = 5;
var TLS = 6;
var TBS = 7;
var PRD = 8;

// opcode syntactic predicate types
var APG_NOT = 0;
var APG_AND = 1;

// opcode & syntax analysis states
var APG_ACTIVE = 1;
var APG_MATCH = 2;
var APG_EMPTY = 3;
var APG_NOMATCH = 4;

// opcode execution return state
var OP_STATE = 0;
var OP_MATCHED = 1;

// semantic analysis callback states
var APG_PRE = 5;
var APG_POST = 6;

// semantic analysis callback return values
var APG_SEM_OK = 1;
var APG_SEM_ERROR = 0;
var APG_SEM_SKIP = 2;

/**
 * @class
    The APG library class. This is the runtime library required by parsers generated by JavaScript APG.
 It has the API (public and documented here) as well as the private code for the node operators themselves.
 * @version 1.0
 * @copyright Copyright &copy; 2009 Lowell D. Thomas, all rights reserved
 * @license [GNU General Public License]{@link http://www.gnu.org/licenses/licenses.html}
 * Version 2 or higher.
 @constructor
 @param {Object} parser - a JavaScript APG-generated parser object.
 */
function ApgLib(parser)
{
    this.constructed = false;
    /**
     * Clear this object of any/all data that has been initialized or added to it.
     * Can be called to re-initialize this object for re-use.
     * @public
     */
    this.clear = function()
    {
        this.startRule = 0;
        this.ruleCount = this.rules.length;
        this.stats = null;
        this.ast = null;
        this.chars = null;
        this.charEOS = 0;
        this.treeDepth = 0;
        this.trace = null;
        this.stats = null;
        this.syntax = null;
        this.syntaxData = null;
        this.semantic = null;
        this.state = [APG_ACTIVE, 0];
    };
    while(true)
    {
        // validate the input
        if(parser === null){break;}
        if(isArray(parser)){break;}
        if(typeof(parser) !== "object"){break;}
        if(parser.stringTable.length === 0){break;}
        if(parser.rules.length === 0){break;}
        if(parser.opcodes.length === 0){break;}

        // initialize the object
        this.strings = parser.stringTable;
        this.rules = parser.rules;
        this.opcodes = parser.opcodes;
        this.constructed = true;
        this.clear();
        break;
    }

    /**
     * Initialize APG for syntax analysis. The callback functions will be
     * called at the specified rule name nodes each time the node
     * is visited during the parsing of the input string.
     * @param {Array} list - an array of callback function pointers
     * @public
     */
    this.syntaxInit = function(list)
    {
        this.syntax = [];
        if(isArray(list) && list.length > 0)
        {
            for(var i = 0; i < list.length; i+=1)
            {
                if(list[i]){this.syntax[i] = list[i];}
                else{this.syntax[i] = false;}
            }
        }
    };

    /**
     * Initialize APG for semantic analysis. The callback functions will be called
     * while traversing the AST after parsing the input string (syntax analysis) is done.
     * @param {Array} list - an array of callback functions.
     * @public
     */
    this.semanticInit = function(list)
    {
        this.semantic = [];
        if(isArray(list) && list.length > 0)
        {
            for(var i = 0; i < list.length; i+=1)
            {
                if(list[i]){this.semantic[i] = list[i];}
            }
        }
    };

    /**
     * Initialize the AST generation. Required for semantic analysis.
     * @public
     * @param {Object} ast - a previously constructed AST object.
     */
    this.astInit = function(ast)
    {
        this.ast = ast;
    };

    /*****************************************************************************/
    // initialize APG for tracing the parser
    // trace - a previously constructed Trace object
    /**
     * Initialize the parser for tracing the path of the parser through the parse tree.
     * @public
     * @param {object} trace - a previously created Trace object.
     */
    this.traceInit = function(trace)
    {
        if(trace){this.trace = trace;}
        else{this.trace = null;}

    };

    /*****************************************************************************/
    // initialize APG for statistics collection
    // stats - a previously constructed Stats object
    /**
     * Initialize the parser for node statistics gathering.
     * @public
     * @param {object} stats - a previously created Stats object.
     */
    this.statsInit = function(stats)
    {
        this.stats = stats;
    };

    /*****************************************************************************/
    // displays the collected statistics
    // caption - optional caption for the statistics table
    /**
     * Generate an HTML display of the parser's state.
     * @public
     * @param {string} caption - an optional caption for the state information table
     * @returns {string} an HTML table displaying the parser's state
     */
    this.stateDisplay = function(caption)
    {
        var html = '';
        if(this.stats)
        {
            html += '<table id="state-display">';
            if(typeof(caption) === 'string')
            {
                html += '<caption>PARSER STATE</caption>';
            }
            html += '<tr><th>Parser State:</th><td>'+stateToString(this.state[OP_STATE])+'</td></tr>';
            html += '<tr><th>Characters Input:</th><td>'+this.charEOS+'</td></tr>';
            html += '<tr><th>Characters Matched:</th><td>'+this.state[OP_MATCHED]+'</td></tr>';
            html += '</table>';
        }
        return html;
    };

    /*****************************************************************************/
    // evaluate any rule name
    // can be called from syntax call back functions for handwritten parsing
    // ruleIndex - index of the rule to execute (see the opcodes)
    // charIndex - what phrase to parser, offset into the input string
    // state - array to return the final state (OP_STATE) and number of matched characters (OP_MATCH)
    /**
     * Evaluates any given rule. This can be called from the syntax callback functions
     * to evaluate any rule in the grammar's rule list. Great caution should be used.
     * Use of this function will alter the language that the parser accepts.
     * The original grammar will still define the rules but use of this function will alter
     * the way the rules are combined to form language sentences.
     * @public
     * @param {number} ruleIndex - the index of the rule to evaluate
     * @param {number} charIndex - the index of the first character in the string to parse
     * @param {array} state - array to receive the parser's state on return state[0] = parser state, state[1] = number of matched characters
     */
    this.evaluateRule = function(ruleIndex, charIndex, state)
    {
        var length, valid = (ruleIndex < this.rules.length) && (charIndex < this.chars.length);
        if(valid)
        {
            // create a dummy RNM operator
            length = this.opcodes.length;
            this.opcodes[length] = [];
            this.opcodes[length].opNext = length + 1;
            this.opcodes[length].type = RNM;
            this.opcodes[length].ruleIndex = ruleIndex;
            this.opExecute(length, charIndex, state);
            this.opcodes.length = length;
        }
    };

    /*****************************************************************************/
    // parses the input string
    // start - the index of the start rule
    // input - array of character codes of the input string
    // data - options user-defined data, is passed to the syntax call back functions
    /**
     * Parses the input string.
     * @public
     * @param {number} start - index of the start rule (any of the grammar's rules may be used as the start rule)
     * @param {array} input - array of character codes of the input string to parse
     * @param {any} data - optional data to pass to the callback functions (not used by the parser)
     */
    this.syntaxAnalysis = function(start, input, data)
    {
        var ret = false, startOpIndex;
        while(true)
        {
            // validate input
            if(typeof(start) !== 'number'){break;}
            if(!isArray(input)){break;}
            if(start >= this.ruleCount){break;}

            // initialize
            this.chars = input;
            this.charEOS = input.length;
            this.startRule = start;
            this.syntaxData = data;
            if(this.ast){this.ast.ast.length = 0;}

            // create a dummy opcode for the start rule
            startOpIndex = this.opcodes.length;
            this.opcodes.push({'type':RNM, 'opCount':1, 'ruleIndex':this.startRule});

            // execute the start rule
            this.opExecute(startOpIndex, 0, this.state);
            this.opcodes.pop();

            // test the result
            if(this.state[OP_STATE] === APG_ACTIVE){break;}
            if(this.state[OP_MATCHED] !== this.charEOS){this.state[OP_STATE] = APG_NOMATCH;}
            if(this.state[OP_STATE] !== APG_NOMATCH){ret = true;}

            // success
            break;
        }
        return ret;
    };

    /*****************************************************************************/
    // translate the rule named phrases into APG JavaScript opcodes
    // data - optional user-defined data, passed to the semantic call back functions
    /**
     * Translate the input string. Traverses the AST and calls user-supplied callback
     * functions to do the translation.
     * @public
     * @param {any} data - optional data to pass to the callback functions (not used by the parser)
     */
    this.semanticAnalysis = function(data)
    {
        var i, forRet, ast, ret, downIndex, ruleIndex, upIndex, name, index, count;
        ret = false;
        //var lineNo = 0;
        if(this.ast !== null)
        {
            ast = this.ast.ast;
            forRet = true;
            for(i=0; i < ast.length; i+=1)
            {
                if(ast[i].down)
                {
                    downIndex = i;
                    ruleIndex = ast[downIndex].ruleIndex;
                    if(this.semantic[ruleIndex])
                    {
                        upIndex = ast[downIndex].upIndex;
                        name = this.rules[ruleIndex].rule;
                        index = ast[upIndex].phraseIndex;
                        count = ast[upIndex].phraseLength;
                        ret = this.semantic[ruleIndex](APG_PRE, this.chars, index, count, data);
                        if(ret === APG_SEM_SKIP){i = upIndex;}
                        else if(ret !== APG_SEM_OK){forRet = false; break;}
                    }
                }
                else
                {
                    upIndex = i;
                    downIndex = ast[upIndex].downIndex;
                    ruleIndex = ast[downIndex].ruleIndex;
                    if(this.semantic[ruleIndex])
                    {
                        upIndex = ast[downIndex].upIndex;
                        name = this.rules[ruleIndex].rule;
                        index = ast[upIndex].phraseIndex;
                        count = ast[upIndex].phraseLength;
                        ret = this.semantic[ruleIndex](APG_POST, this.chars, index, count, data);
                        if(ret !== APG_SEM_OK){forRet = false; break;}
                    }
                }
            }
            ret = forRet;
        }
        return ret;
    };

    /*****************************************************************************/
    // the ALTERNATION operator
    // opIndex - index of the ALT operator opcode
    // charIndex - input string index of the phrase to be parsed
    // state - array for return of the final state and matched phrase length
    /**
     * @private
     */
    this.opALT = function(opIndex, charIndex, state)
    {
        state[OP_STATE] = APG_NOMATCH;
        state[OP_MATCHED] = 0;
        var childOpIndex, op = this.opcodes[opIndex];
        if(op.type !== ALT){throw ['opALT: type ' + opcodeToString(op.type) +' not ALT'];}
        childOpIndex = opIndex + 1;
        for(; childOpIndex < op.opNext; childOpIndex = this.opcodes[childOpIndex].opNext)
        {
            this.opExecute(childOpIndex, charIndex, state);
            if(state[OP_STATE] !== APG_NOMATCH){break;}
            else if(this.stats !== null){this.stats.backtrack(op);}
        }
    };
    /*****************************************************************************/
    // the CONCATENATION operator
    /**
     * @private
     */
    this.opCAT = function(opIndex, charIndex, state)
    {
        state[OP_STATE] = APG_NOMATCH;
        state[OP_MATCHED] = 0;
        var op, astLength, catState, catCharIndex, catMatched, childOpIndex;
        op = this.opcodes[opIndex];
        if(op.type !== CAT){throw ['opCAT: type ' + opcodeToString(op.type) +' not CAT'];}
        astLength = (this.ast) ? this.ast.currentLength() : 0;
        catState = [APG_NOMATCH, 0];
        catCharIndex = charIndex;
        catMatched = 0;
        childOpIndex = opIndex + 1;
        for(; childOpIndex < op.opNext; childOpIndex = this.opcodes[childOpIndex].opNext)
        {
            this.opExecute(childOpIndex, catCharIndex, catState);
            catCharIndex += catState[OP_MATCHED];
            catMatched += catState[OP_MATCHED];
            if(catState[OP_STATE] === APG_NOMATCH){break;}
        }
        state[OP_MATCHED] = catMatched;
        if(childOpIndex === op.opNext)
        {
            // success
            state[OP_STATE] = catMatched === 0 ? APG_EMPTY : APG_MATCH;
        }
        if(this.ast && state[OP_STATE] === APG_NOMATCH){this.ast.truncate(astLength);}
    };
    /*****************************************************************************/
    // the REPETITION operator
    /**
     * @private
     */
    this.opREP = function(opIndex, charIndex, state)
    {
        state[OP_STATE] = APG_NOMATCH;
        state[OP_MATCHED] = 0;
        var nextState, nextCharIndex, matchedCount, op, childOpIndex, astLength;
        nextState = [APG_ACTIVE, 0];
        nextCharIndex = charIndex;
        matchedCount = 0;
        op = this.opcodes[opIndex];
        childOpIndex = opIndex + 1;
        if(op.type !== REP){throw ['opREP: type ' + opcodeToString(op.type) +' not REP'];}
        astLength = (this.ast) ? this.ast.currentLength() : 0;
        while(true)
        {
            // always end on End of String
            if(nextCharIndex >= this.charEOS){break;}

            // execute the child opcode
            this.opExecute(childOpIndex, nextCharIndex, nextState);

            // end on nomatch
            if(nextState[OP_STATE] === APG_NOMATCH)
            {
                if(this.stats !== null){this.stats.backtrack(op);}
                break;
            }

            // always end on empty
            if(nextState[OP_STATE] === APG_EMPTY){break;}

            // increment for next repetition
            matchedCount+=1;
            state[OP_MATCHED] += nextState[OP_MATCHED];
            nextCharIndex += nextState[OP_MATCHED];

            // end on maxed out matches
            if(matchedCount === op.max){break;}
        }

        // evaluate the match count
        if(state[OP_MATCHED] >= op.min)
        {
            // got a mathc
            state[OP_STATE] = (state[OP_MATCHED] === 0) ? APG_EMPTY : APG_MATCH;
        }
        else
        {
            // failed to meet minimum match requirement
            state[OP_STATE] = APG_NOMATCH;
            if(this.stats !== null){this.stats.backtrack(op);}
        }
        if(this.ast && state[OP_STATE] === APG_NOMATCH){this.ast.truncate(astLength);}
    };
    /*****************************************************************************/
    // the RULE NAME operator
    /**
     * @private
     */
    this.opRNM = function(opIndex, charIndex, state)
    {
        state[OP_STATE] = APG_ACTIVE;
        state[OP_MATCHED] = 0;
        var downIndex, astLength, op, rule, ruleOpIndex, ruleDefined;
        downIndex = 0;
        astLength = 0;
        op = this.opcodes[opIndex];
        if(op.type !== RNM){throw ['opRNM: type ' + opcodeToString(op.type) +' not RNM'];}

        rule = this.rules[op.ruleIndex];
        ruleOpIndex = rule.opcodeIndex;

        // AST
        ruleDefined = this.ast && this.ast.ruleDefined(op.ruleIndex);
        if(ruleDefined)
        {
            astLength = this.ast.currentLength();
            downIndex = this.ast.down(op.ruleIndex);
        }

        // syntax call back
        if(this.syntax && this.syntax[op.ruleIndex])
        {
            this.syntax[op.ruleIndex](state, this.chars, charIndex, this.syntaxData);
        }

        if(state[OP_STATE] === APG_ACTIVE)
        {
            // execute the rule
            this.opExecute(ruleOpIndex, charIndex, state);
        }

        // syntax call back
        if(this.syntax && this.syntax[op.ruleIndex])
        {
            this.syntax[op.ruleIndex](state, this.chars, charIndex, this.syntaxData);
        }

        // AST
        if(ruleDefined)
        {
            if(state[OP_STATE] === APG_NOMATCH){this.ast.truncate(astLength);}
            else{this.ast.up(downIndex, charIndex, state[OP_MATCHED]);}
        }
    };
    /*****************************************************************************/
    // the SYNTACTIC PREDICATE operator
    /**
     * @private
     */
    this.opPRD = function(opIndex, charIndex, state)
    {
        state[OP_STATE] = APG_NOMATCH;
        state[OP_MATCHED] = 0;
        var op, prdState = [APG_ACTIVE, 0];
        op = this.opcodes[opIndex];
        if(op.type !== PRD){throw ['opPRD: type ' + opcodeToString(op.type) +' not PRD'];}

        // execute the child opcode
        if(this.ast){this.ast.inPRD+=1;}
        this.opExecute((opIndex + 1), charIndex, prdState);
        if(this.ast){this.ast.inPRD-=1;}

        // evaluate the result
        switch(prdState[OP_STATE])
        {
            case APG_EMPTY:
            case APG_MATCH:
                if(op.and)
                {
                    // AND predicate
                    state[OP_STATE] = APG_EMPTY;
                }
                else
                {
                    // NOT predicate
                    state[OP_STATE] = APG_NOMATCH;
                    state[OP_MATCHED] = prdState[OP_MATCHED];
                }
                break;

            case APG_NOMATCH:
                if(op.and)
                {
                    // AND predicate
                    state[OP_STATE] = APG_NOMATCH;
                    state[OP_MATCHED] = prdState[OP_MATCHED];
                }
                else
                {
                    // NOT predicate
                    state[OP_STATE] = APG_EMPTY;
                }
                break;

            default:
                throw ['opPRD: invalid state ' + prdState[OP_STATE]];
        }
        // PRD always backtracks
        if(this.stats !== null){this.stats.backtrack(op);}
    };
    /*****************************************************************************/
    // the TERMINAL RANGE operator
    /**
     * @private
     */
    this.opTRG = function(opIndex, charIndex, state)
    {
        state[OP_STATE] = APG_NOMATCH;
        state[OP_MATCHED] = 0;
        var op = this.opcodes[opIndex];
        if(op.type !== TRG){throw ['opTRG: type ' + opcodeToString(op.type) +' not TRG'];}
        if(charIndex < this.charEOS)
        {
            if(op.min <= this.chars[charIndex] && this.chars[charIndex] <= op.max)
            {
                state[OP_STATE] = APG_MATCH;
                state[OP_MATCHED] = 1;
            }
        }
    };
    /*****************************************************************************/
    // the TERMINAL BINARY STRING operator
    /**
     * @private
     */
    this.opTBS= function(opIndex, charIndex, state)
    {
        state[OP_STATE] = APG_NOMATCH;
        state[OP_MATCHED] = 0;
        var i, op, len, stringIndex;
        op = this.opcodes[opIndex];
        if(op.type !== TBS){throw ['opTBS: type ' + opcodeToString(op.type) +' not TBS'];}
        len = op.length;
        stringIndex = op.stringIndex;
        if(len === 0){throw ['opTBS: string length cannot be 0'];}
        if((charIndex + len)  <= this.charEOS)
        {
            for(i=0; i < len; i+=1)
            {
                if(this.chars[charIndex + i] !== this.strings[stringIndex + i]){break;}
            }
            state[OP_MATCHED] = i;
            if(i === len){state[OP_STATE] = APG_MATCH;}
        }
    };
    /*****************************************************************************/
    // the TERMINAL LITERAL STRING operator
    /**
     * @private
     */
    this.opTLS = function(opIndex, charIndex, state)
    {
        state[OP_STATE] = APG_NOMATCH;
        state[OP_MATCHED] = 0;
        var i, code, strChar, len, stringIndex, op;
        op = this.opcodes[opIndex];
        if(op.type !== TLS){throw ['opTLS: type ' + opcodeToString(op.type) +' not TLS'];}
        len = op.length;
        stringIndex = op.stringIndex;
        if(len === 0)
        {
            state[OP_STATE] = APG_EMPTY;
        }
        else if((charIndex + len)  <= this.charEOS)
        {
            for(i=0; i < len; i+=1)
            {
                strChar = this.strings[stringIndex + i];
                if(strChar >= 65 && strChar <= 90){strChar += 32;}
                code = this.chars[charIndex + i];
                if(code >= 65 && code <= 90){code += 32;}
                if(code !== strChar){break;}
            }
            state[OP_MATCHED] = i;
            if(i === len){state[OP_STATE] = APG_MATCH;}
        }
    };
    /**
     * Generalized execute function to execute any node operator.
     * @private
     */
    this.opExecute = function(opIndex, charIndex, state)
    {
        var op, ret = true;
        op = this.opcodes[opIndex];

        // tree depth
        this.treeDepth+=1;

        // trace down
        state[OP_STATE] = APG_ACTIVE;
        state[OP_MATCHED] = 0;
        if(this.trace !== null){this.trace.traceDown(op, state[OP_STATE], charIndex, state[OP_MATCHED]);}

        switch(op.type)
        {
            case ALT:
                this.opALT(opIndex, charIndex, state);
                break;

            case CAT:
                this.opCAT(opIndex, charIndex, state);
                break;

            case RNM:
                this.opRNM(opIndex, charIndex, state);
                break;

            case REP:
                this.opREP(opIndex, charIndex, state);
                break;

            case PRD:
                this.opPRD(opIndex, charIndex, state);
                break;

            case TRG:
                this.opTRG(opIndex, charIndex, state);
                break;

            case TBS:
                this.opTBS(opIndex, charIndex, state);
                break;

            case TLS:
                this.opTLS(opIndex, charIndex, state);
                break;

            default:
                ret = false;
                break;
        }
        if((state[OP_STATE] !== APG_MATCH) && (state[OP_STATE] !== APG_NOMATCH) && (state[OP_STATE] !== APG_EMPTY))
        {throw ['opExecute: invalid state returned'];}

        // statistics up
        if(this.stats !== null){this.stats.collect(op, state);}

        // trace up
        if(this.trace !== null){this.trace.traceUp(op, state[OP_STATE], charIndex, state[OP_MATCHED]);}

        // tree depth
        this.treeDepth-=1;

        return ret;
    };
}

/****************************
 * apgUtilities.js
 */
var ASCII_CR = 13;
var ASCII_LF = 10;
var ASCII_TAB = 9;
var ASCII_SPACE = 32;
var ASCII_MIN = 32;
var ASCII_MAX = 126;
var ASCII_LANGLE = 60;
var ASCII_RANGLE = 62;

/**
 * Converts a decimal integer to a hexidecimal string, eg. 16 -> "FF"
 *
 * @param {Number}
 *            d - a decimal integer
 * @return {String} the hexidecimal string representation of the number
 * @memberof ApgUtilities
 */
function dec2hex(d) {
    return d.toString(16).toUpperCase();
}

/**
 * Convert a hexidecimal string to an integer, eg. "FF" -> 16
 *
 * @param {String}
 *            h - a string of hexidecimal digits (0-9, a-f)
 * @return {Number} the integer equivalent of the hexidecimal string
 * @memberof ApgUtilities
 */
function hex2dec(h) {
    return parseInt(h, 16);
}

/**
 * Determines whether and object is an array or not. Note that typeof does not
 * distinguish between objects and arrays.
 *
 * @param {object}
 *            a - the object to test
 * @return {boolean} true if the object is an array, false if not
 * @memberof ApgUtilities
 */
function isArray(a) {
    return (Object.prototype.toString.apply(a) === '[object Array]');
}


/**
 * Assertion. Tests the condition for true. Throws an exception if false.
 *
 * @param {boolean}
 *            condition - the condition to test
 * @param {string}
 *            msg - the message to throw if the assertion fails.
 * @throws {string}
 *             the input message
 * @memberof ApgUtilities
 */
function apgAssert(condition, msg) {
    if (!condition) {
        var message = "apgAssert: failed: ";
        if (typeof (msg) === 'string') {
            message += msg;
        }
        throw [ message ];
    }
}

/**
 * Tanslates a substring (phrase) from ASCII character codes to a string of
 * characters.
 *
 * @param {array}
 *            chars - an array of ASCII character codes (numbers 0-255)
 * @param {number}
 *            phraseIndex - offset into the chars array to the first character
 *            of the phrase
 * @param {number}
 *            phraseLength - number of characters in the phrase
 * @returns {string} the phrase as a string
 * @memberof ApgUtilities
 */
function charsToString(chars, phraseIndex, phraseLength) {
    var string = '';
    if (isArray(chars)) {
        var charIndex = (typeof (phraseIndex) === 'number') ? phraseIndex : 0;
        var charLength = (typeof (phraseLength) === 'number') ? phraseLength
            : chars.length;
        if (charLength > chars.length) {
            charLength = chars.length;
        }
        var charEnd = charIndex + charLength;
        for (var i = charIndex; i < charEnd; i += 1) {
            if (chars[i]) {
                string += String.fromCharCode(chars[i]);
            }
        }
    }
    return string;
}

/**
 * Translates a string to anormalized array of ASCII character codes. Normalized
 * means tranlating certain characters. The translations made are:
 *
 * <pre>
 * TAB(9) 		-&gt; SPACE (32)
 * CRLF(13.10) 	-&gt; LF(10)
 * CR(13) 		-&gt; LF(10)
 * EOF 			-&gt; LF EOF (if the LF is missing)
 * </pre>
 *
 * @param {object}
 *            log - an instance of MsgLog
 * @param {string}
 *            string - the string to translate
 * @param {array}
 *            chars - the array to receive the ASCII character codes
 * @returns {boolean} true if successful, false if an error was found (for
 *          example a non-ascii character was found)
 * @memberof ApgUtilities
 */
function grammarToChars(log, string, chars) {
    var ret = true;
    var lineNo = 0;
    var lineOffset = 0;
    var lineChar = 0;
    if (typeof (string) === 'string' && isArray(chars)) {
        var charIndex = 0;
        var codeIndex = 0;
        chars.length = 0;
        while (charIndex < string.length) {
            var code = string.charCodeAt(charIndex);
            // convert TAB to SPACE
            if (code === ASCII_TAB) {
                code = ASCII_SPACE;
            } else if (code === ASCII_CR) {
                // convert CRLF or CR to LF
                code = ASCII_LF;
                if (string.charCodeAt(charIndex + 1) === ASCII_LF) {
                    charIndex += 1;
                }
            } else if (code !== ASCII_LF
                && (code < ASCII_MIN || code > ASCII_MAX)) {
                log.logLine(lineNo, lineOffset, lineChar,
                        'stringToChar: non-ASCII character found: ' + code);
                ret = false;
            }
            chars[codeIndex] = code;
            charIndex += 1;
            codeIndex += 1;
            lineOffset += 1;
            lineChar += 1;
            if (code === ASCII_LF) {
                lineNo += 1;
                lineChar = 0;
            }
        }
        if (chars.length > 0 && chars[chars.length - 1] !== ASCII_LF) {
            // add missing line end
            chars[chars.length] = ASCII_LF;
        }
        if (chars.length === 0) {
            log.logLine(0, 0, 0, 'input string may not be empty');
            ret = false;
        }
    }
    return ret;
}

/**
 * Converts ASCII-formatted, binary characters to numbers, e.g. 0xFF to 15.
 *
 * @param {object}
 *            log - an instance of MsgLog
 * @param {string}
 *            string - the string to translate
 * @param {array}
 *            chars - the array to receive the ASCII character codes
 * @returns {boolean} true if successful, false if an error was found (for
 *          example a non-ascii character was found)
 * @memberof ApgUtilities
 */
function binaryStringToChars(log, string, chars) {
    var ret = false, test;
    var stringIndex = 0;
    var charIndex = 0;
    var code, text, strlen;
    while (true) {
        if (typeof (string) !== 'string') {
            log
                .logMsg('apgUtilities: binaryStringToChars: string not type \'string\'');
        }
        if (!isArray(chars)) {
            log
                .logMsg('apgUtilities: binaryStringToChars: chars not type \'array\'');
        }
        chars.length = 0;
        strlen = string.length;
        ret = true;
        while (stringIndex < strlen) {
            code = string.charCodeAt(stringIndex);
            if (code === 9 || code === 10 || code === 13 || code === 32) {
                // skip white space
                stringIndex += 1;
            } else {
                // get the next byte
                test = parseInt(string.substring(stringIndex));
                if (isNaN(test)) {
                    log
                        .logMsg('apgUtilities: binaryStringToChars: non-integer at: '
                            + stringIndex);
                    ret = false;
                    break;
                } else if (test > 255) {
                    log
                        .logMsg('apgUtilities: binaryStringToChars: integer > 255 at: '
                            + stringIndex);
                    ret = false;
                    break;
                } else {
                    // get the byte code
                    chars[charIndex] = test;
                    charIndex += 1;

                    // skip over the parsed int
                    for (; stringIndex < strlen; stringIndex += 1) {
                        code = string.charCodeAt(stringIndex);
                        if (!(code === 9 || code === 10 || code === 13 || code === 32)) {
                            continue;
                        }
                        break;
                    }
                }
            }
        }

        break;
    }
    return ret;
}

/**
 * Converts a string to an array of ASCII character codes.
 *
 * @param {object}
 *            log - an instance of MsgLog
 * @param {string}
 *            string - the string to translate
 * @param {array}
 *            chars - the array to receive the ASCII character codes
 * @returns {boolean} true if successful, false if an error was found (for
 *          example a non-ascii character was found)
 * @memberof ApgUtilities
 */
function stringToChars(log, string, chars) {
    var ret = false;
    if (typeof (string) === 'string' && isArray(chars)) {
        var charIndex = 0;
        while (charIndex < string.length) {
            chars[charIndex] = string.charCodeAt(charIndex);
            charIndex += 1;
        }
        if (charIndex > 0) {
            ret = true;
        }
    }
    return ret;
}

/**
 * Format a string to display line number and character counts for each line.
 *
 * @param {string}
 *            string - the string to format
 * @returns {string} the formatted string
 * @memberof ApgUtilities
 */
function formatString(string) {
    var ret = '';
    var line = '';
    var lineNo = 1;
    var lineLen = 0;
    var lineBeg = 0;
    var linePrint = false;
    var code;
    var i = 0;
    for (; i < string.length; i += 1) {
        if (linePrint) {
            // add the line prefix
            ret += lineNo + ':[' + lineBeg + '][' + (lineLen) + '] ' + line
                + '<br />';
            line = '';
            lineLen = 0;
            lineBeg = i;
            lineNo += 1;
            linePrint = false;
        }
        code = string.charCodeAt(i);
        if (code === ASCII_CR) {
            line += '<span class="non-ascii">CR</span>';
            if (string.charCodeAt(i + 1) !== ASCII_LF) {
                linePrint = true;
            }
        } else if (code === ASCII_LF) {
            line += '<span class="non-ascii">LF</span>';
            linePrint = true;
        } else if (code < ASCII_MIN || code > ASCII_MAX) {
            line += '<span class="non-ascii">x' + dec2hex(code) + '</span>';
        } else {
            line += string.charAt(i);
        }
        lineLen += 1;
    }
    if (lineLen > 0) {
        ret += lineNo + ':[' + lineBeg + '][' + (lineLen) + '] ' + line
            + '<br />';
    }
    return ret;
}

/**
 * Formats an array of character codes for HTML display of the string it
 * represents.
 *
 * @param {array}
 *            chars - the array of character codes
 * @returns {string} the HTML-formatted string
 * @memberof ApgUtilities
 */
function formatChars(chars) {
    var ret = '';
    var line = '';
    var lineNo = 1;
    var lineLen = 0;
    var lineBeg = 0;
    var linePrint = false;
    var code;
    var i = 0;
    for (; i < chars.length; i += 1) {
        if (linePrint) {
            // add the line prefix
            ret += lineNo + ':[' + lineBeg + '][' + (lineLen) + '] ' + line
                + '<br />';
            line = '';
            lineLen = 0;
            lineBeg = i;
            lineNo += 1;
            linePrint = false;
        }
        code = chars[i];
        if (code === ASCII_CR) {
            line += '<span class="non-ascii">CR</span>';
            if (chars[i + 1] !== ASCII_LF) {
                linePrint = true;
            }
        } else if (code === ASCII_LF) {
            line += '<span class="non-ascii">LF</span>';
            linePrint = true;
        } else if (code < ASCII_MIN || code > ASCII_MAX) {
            line += '<span class="non-ascii">x' + dec2hex(code) + '</span>';
        } else {
            line += String.fromCharCode(chars[i]);
        }
        lineLen += 1;
    }
    if (lineLen > 0) {
        ret += lineNo + ':[' + lineBeg + '][' + (lineLen) + '] ' + line
            + '<br />';
    }
    return ret;
}

/**
 * Tests the first 1000 values in an array of numbers to see if they are ASCII
 * character codes. This is used by interactive APG to auto detect the format of
 * the user's input string. Interactive APG allows formatting options to input
 * non-string data in an HTML textarea. Note that these tests are very often
 * accurate but not always. When they fail the user must configure the parser
 * for the specific type of input being used.
 *
 * @param {array}
 *            chars - the array of numbers to test
 * @returns {boolean} true if more than 25% of the numbers are ASCII character
 *          codes, false otherwise
 * @see {@link inputIsBinary} for a similar test of binary input
 * @memberof ApgUtilities
 */
this.charsAreAscii = function(chars) {
    var count = 0;
    var max = 1000;
    var len = (chars.length > max) ? max : chars.length;
    for (var i = 0; i < len; i += 1) {
        if (chars[i] === 9) {
            count += 1;
        } else if (chars[i] === 10) {
            count += 1;
        } else if (chars[i] === 13) {
            count += 1;
        } else if (chars[i] >= 32 && chars[i] <= 127) {
            count += 1;
        }
    }
    return (((count * 100) / len) >= 25);
};

/**
 * Tests to see if an array of number represents binary data. This is used by
 * interactive APG to auto detect the format of the user's input string.
 * Interactive APG allows formatting options to input non-string data in an HTML
 * textarea. Note that these tests are very often accurate but not always. When
 * they fail the user must configure the parser for the specific type of input
 * being used.
 *
 * @param {array}
 *            chars - the array of numbers to test
 * @returns {boolean} true if the input appears to be binary, false otherwise
 * @see {@link charsAreAscii} for a similar test of ASCII input
 * @memberof ApgUtilities
 */
function inputIsBinary(chars) {
    var ret = true;
    var isWhite, value, string;
    var count = 0;
    var i = 0;
    var len = chars.length;
    var max = 100;
    while (i < len && count < max) {
        // skip white space
        isWhite = true;
        while (i < len && isWhite) {
            if (chars[i] === 9 || chars[i] === 10 || chars[i] === 13
                || chars[i] === 32) {
                isWhite = true;
                i += 1;
            } else {
                isWhite = false;
            }
        }
        if (i === len) {
            break;
        }

        // get next binary value
        string = '';
        isWhite = false;
        while (i < len && !isWhite) {
            if (chars[i] === 9 || chars[i] === 10 || chars[i] === 13
                || chars[i] === 32) {
                isWhite = true;
            } else {
                string += String.fromCharCode(chars[i]);
                i += 1;
            }
        }

        value = parseInt(string, 10);
        if (isNaN(value)) {
            ret = false;
            break;
        } else {
            count += 1;
        }
    }
    if (count === 0) {
        ret = false;
    }
    return ret;
}

/**
 * Formats an array of character codes to an HTML table of hexidecimal format.
 *
 * @param {array}
 *            chars - an array of character codes
 * @returns {string} the HTML-formatted table
 * @memberof ApgUtilities
 */
function tableCharsHex(chars) {
    var html = '';
    var htmlHex = '';
    var htmlAscii = '';
    var htmlCount = '';
    var hexChar;
    var spanEven = '<span class="ast-highlight-even">';
    var spanOdd = '<span class="ast-highlight-odd">';
    var emptyHex = '<span class="ast-empty">00</span>';
    var emptyAscii = '<span class="ast-empty">&epsilon;</span>';
    var count = 0;
    var matchLen = 24;
    htmlCount += '0:<br />';
    for (var i = 0; i < chars.length; i += 1) {
        if (chars[i] < 32 || chars[i] > 126) {
            htmlAscii += '&#46;';
        } else if (chars[i] === 32) {
            htmlAscii += '&nbsp;';
        } else {
            htmlAscii += '&#' + chars[i];
        }
        hexChar = chars[i].toString(16).toUpperCase();
        if (hexChar.length === 1) {
            htmlHex += '0' + hexChar;
        } else {
            htmlHex += hexChar;
        }
        count += 1;
        if (count === matchLen) {
            htmlHex += '<br />';
            htmlAscii += '<br />';
            htmlCount += i + ':<br />';
            count = 0;
        } else {
            if (count % 4 === 0) {
                htmlHex += '&nbsp;';
            }
        }

    }
    html += '<pre><table class="phrase-table"><tr>';
    html += '<td class="right">' + htmlCount + '</td>';
    html += '<td>' + htmlHex + '</td>';
    html += '<td>' + htmlAscii + '</td>';
    html += '</tr></table></pre>';
    return html;
}

/**
 * Formats an array of character codes into an HTML table of ASCII lines
 *
 * @param {array}
 *            chars - an array of character codes
 * @returns {string} the HTML-formatted table of ASCII lines
 * @memberof ApgUtilities
 */
function tableChars(chars) {
    var html = '';
    var maxLineLen = 0;
    var line = '';
    var lineNo = 1;
    var lineLen = 0;
    var lineBeg = 0;
    var linePrint = false;
    var lineBreak = 128;
    var linePrintLen = 0;
    var lineContinue = false;
    var code;
    var i = 0;
    html += '<tr>';
    html += '<td>(a)</td>';
    html += '<td>(b)</td>';
    html += '<td>(c)</td>';
    html += '<td class="log-msg">&nbsp;</td>';
    html += '</tr>';
    for (; i < chars.length; i += 1) {
        if (linePrint) {
            if (lineNo % 2 === 0) {
                html += '<tr class="odd">';
            } else {
                html += '<tr class="even">';
            }
            linePrintLen += lineLen;
            if (lineContinue) {
                html += '<td>' + lineNo + ':</td>';
                html += '<td>' + lineBeg + ':</td>';
                html += '<td>&ndash;&gt;:</td>';
                html += '<td class="log-msg">' + line + '</td></tr>';
            } else {
                html += '<td>' + lineNo + ':</td>';
                html += '<td>' + lineBeg + ':</td>';
                html += '<td>' + linePrintLen + ':</td>';
                html += '<td class="log-msg">' + line + '</td></tr>';
                lineNo += 1;
                linePrintLen = 0;
            }
            line = '';
            if (maxLineLen < lineLen) {
                maxLineLen = lineLen;
            }
            lineLen = 0;
            lineBeg = i;
            linePrint = false;
            lineContinue = false;
        }
        code = chars[i];
        if (code === ASCII_CR) {
            line += '<span class="non-ascii">CR</span>';
            lineLen += 2;
            if (chars[i + 1] !== ASCII_LF) {
                linePrint = true;
            }
        } else if (code === ASCII_LF) {
            line += '<span class="non-ascii">LF</span>';
            lineLen += 2;
            linePrint = true;
        } else if (code < ASCII_MIN || code > ASCII_MAX) {
            line += '<span class="non-ascii">x' + dec2hex(code) + '</span>';
            lineLen += 3;
        } else if (chars[i] === 32) {
            line += '&nbsp;';
            lineLen += 1;
        } else {
            line += '&#' + chars[i];
            lineLen += 1;
        }
        if (lineLen >= lineBreak) {
            linePrint = true;
            lineContinue = true;
        }
    }
    if (lineLen > 0) {
        linePrintLen += lineLen;
        if (lineNo % 2 === 0) {
            html += '<tr class="odd">';
        } else {
            html += '<tr class="even">';
        }
        html += '<td>' + lineNo + ':</td>';
        html += '<td>' + lineBeg + ':</td>';
        html += '<td>' + linePrintLen + ':</td>';
        html += '<td class="log-msg">' + line + '</td></tr>';
    }
    html += '<tr>';
    html += '<td>(a)</td>';
    html += '<td>(b)</td>';
    html += '<td>(c)</td>';
    html += '<td class="log-msg">&nbsp;</td>';
    html += '</tr>';
    html = '<table width="' + (maxLineLen * 10) + '" class="log-table">' + html
        + '</table>';
    html += '<p class="log-msg">';
    html += '(a) - line number<br />';
    html += '(b) - first character of line (or line fragment<sup>*</sup>)<br />';
    html += '(c) - line length (or "&ndash;&gt;" for line fragment<sup>*</sup>)<br /><br />';
    html += '<sup>*</sup>Lines longer than ' + lineBreak
        + ' are displayed as multiple printed fragments<br />';
    html += '</p>';
    return html;
}

/**
 * Simple function to translate a boolean value to string values.
 *
 * @param {boolean}
 *            value - the boolean value to translate
 * @returns {string} "TRUE" if the value is true, "FALSE" otherwise
 * @memberof ApgUtilities
 */
function trueToString(value) {
    if (value) {
        return 'TRUE';
    } else {
        return 'FALSE';
    }
}

/**
 * Translates an APG state to a human-readable string.
 *
 * @param {number}
 *            state - the state to translate
 * @returns {string} the string value of the state or "unknown" if not a valid
 *          state.
 * @memberof ApgUtilities
 */
function stateToString(state) {
    var ret = 'unknown';
    switch (state) {
        case APG_ACTIVE:
            ret = 'ACTIVE';
            break;

        case APG_EMPTY:
            ret = 'EMPTY';
            break;

        case APG_NOMATCH:
            ret = 'NOMATCH';
            break;

        case APG_MATCH:
            ret = 'MATCH';
            break;

        case APG_PRE:
            ret = 'SEMANTIC PRE-BRANCH';
            break;

        case APG_POST:
            ret = 'SEMANTIC POST-BRANCH';
            break;
    }
    return ret;
}

/**
 * Translates an APG opcode type to a human-readable string.
 *
 * @param {number}
 *            type - the APG type to translate
 * @returns {string} the string representation of type or "unknown" if not a
 *          valid type.
 * @memberof ApgUtilities
 */
function opcodeToString(type) {
    var ret = 'unknown';
    switch (type) {
        case ALT:
            ret = 'ALT';
            break;

        case CAT:
            ret = 'CAT';
            break;

        case RNM:
            ret = 'RNM';
            break;

        case PRD:
            ret = 'PRD';
            break;

        case REP:
            ret = 'REP';
            break;

        case TRG:
            ret = 'TRG';
            break;

        case TBS:
            ret = 'TBS';
            break;

        case TLS:
            ret = 'TLS';
            break;
    }
    return ret;
}

/**
 * universal evaluation of a thrown object
 * @param {object} obj - object to evaluate
 * @memberof ApgUtilities
 */
function objEval(obj) {
    var ret = 'objEval: ';
    for ( var x in obj) {
        ret += x + ": " + obj[x];
        ret += '<br />\n';
    }
    return ret;
}

/**
 * selects all text in an HTML element with id="testarea"
 * @param {string} testarea - not used, this function is hard-coded to get the area "testarea"
 * @memberof ApgUtilities
 */
function SelecText(testarea) {
    window.document.getElementById("testarea").select();
}

/**
 * Dumps an arbitrary array or object for human viewing an interpretation.<br>
 * source: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
 * Function : dump() Arguments: The data - array,hash(associative array),object
 * The level - OPTIONAL Returns : The textual representation of the array. This
 * function was inspired by the print_r function of PHP. This will accept some
 * data as the argument and return a text that will be a more readable version
 * of the array/hash/object that is given.
 *
 * @param {object} arr - object to interpret
 * @param {number} level - the level of recursion to interpret
 * @returns {string} A textual representation of the object.
 * @memberof ApgUtilities
 */
function dump(arr, level) {
    var dumped_text = "";
    if (!level) {
        level = 0;
    }

    // The padding given at the beginning of the line.
    var level_padding = "";
    for (var j = 0; j < level; j += 1) {
        level_padding += "  ";
    }

    if (typeof (arr) === 'object') { // Array/Hashes/Objects
        for ( var item in arr) {
            var value = arr[item];

            if (typeof (value) === 'object') { // If it is an array,
                dumped_text += level_padding + "'" + item + "' ...\n";
                dumped_text += dump(value, level + 1);
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + value
                    + "\"\n";
            }
        }
    } else { // Stings/Chars/Numbers etc.
        dumped_text = "===>" + arr + "<===(" + typeof (arr) + ")";
    }
    return dumped_text;
}

/**
 * Converts the non-ASCII codes in an array of character codes to html entities (I think)<br>
 * from: http://elmicoxcodes.blogspot.com/2007/06/htmlentities-and-arraysearch-in.html
 * @param {array} texto - array of character codes to convert
 *
 * @memberof ApgUtilities
 */
function htmlentities(texto) {
    // by Micox - elmicoxcodes.blogspot.com - www.ievolutionweb.com
    var i, carac, letra, novo = '';
    for (i = 0; i < texto.length; i++) {
        carac = texto[i].charCodeAt(0);
        if ((carac > 47 && carac < 58) || (carac > 62 && carac < 127)) {
            // se for numero ou letra normal
            novo += texto[i];
        } else {
            novo += "&#" + carac + ";";
        }
    }
    return novo;
}

/**
 * Converts special charactes (<, >, &, ", \) to html entities.
 * @param {string} chars - string of characters
 *
 * @memberof ApgUtilities
 */
function htmlspecialchars(chars) {
    var i, c, html = '';
    for (i = 0; i < chars.length; i++) {
        c = chars.charAt(i);
        switch (c) {
            case '<':
                html += '&lt;';
                break;
            case '>':
                html += '&gt;';
                break;
            case '&':
                html += '&amp;';
                break;
            case '"':
                html += '&quot;';
                break;
            case '\'':
                html += '&#039;';
                break;
            default:
                html += c;
                break;
        }
    }
    return html;
}

/**
 * @class
    circular buffer
 used by Trace to keep track of where the last N records are in a circular
 buffer used to store at most N trace information records
 *
 * @version 1.0
 * @copyright Copyright &copy; 2009 Lowell D. Thomas, all rights reserved
 * @license [GNU General Public License]{@link http://www.gnu.org/licenses/licenses.html}
 * Version 2 or higher.
 * @memberof ApgUtilities
 */
function Circular() {
    this.lastIndex = 0;
    this.nextIndex = 0;
    this.bufferMax = 0;
    this.itemCount = 0;
    this.bufferSize = 0;

    // initialize the circular buffer for record collection
    this.initCollection = function(size) {
        this.bufferSize = size;
        this.lastIndex = 0;
        this.itemCount = 0;
        this.nextIndex = 0;
        this.sequential = true;
    };

    // called once for each record collected
    this.collect = function() {
        if (this.lastIndex >= this.bufferSize) {
            this.lastIndex = 0;
            this.sequential = false;
        }
        var ret = this.lastIndex;
        this.lastIndex += 1;
        if (this.lastIndex > this.itemCount) {
            this.itemCount = this.lastIndex;
        }
        return ret;
    };

    // returns the bufferSize (N))
    this.size = function() {
        return this.bufferSize;
    }

    // returns the total number of records saved
    this.items = function() {
        return this.itemCount;
    }

    // returns true if the number of records <= the buffer size
    // e.g. the records read top to bottom in the buffer
    this.isSequential = function() {
        return this.sequential;
    }

    // initialize a replay of the record numbers saved in the buffer
    this.initReplay = function() {
        if (this.isSequential()) {
            this.nextIndex = 0;
        } else {
            this.nextIndex = this.lastIndex;
        }
    };

    // on each call returns the buffer location of the next saved record
    // records are returned in ascending order
    // e.g. if last 100 of 1000 records were save, replay() would
    // successively return buffer positions corresponding to records 100, 101,
    // ... 198, 199
    this.replay = function() {
        var ret;
        if (this.nextIndex >= this.bufferSize) {
            this.nextIndex = 0;
        }
        ret = this.nextIndex;
        this.nextIndex += 1;
        return ret;
    };

    // initialize the replay for reverse order or descending
    this.initReverse = function() {
        if (this.isSequential()) {
            this.nextIndex = this.itemCount - 1;
        } else {
            this.nextIndex = this.lastIndex - 1;
        }
    };

    // returns records in opposite order of replay()
    this.reverse = function() {
        var ret;
        if (this.nextIndex < 0) {
            this.nextIndex = this.itemCount - 1;
            if (this.nextIndex < 0) {
                return 0;
            }
        }
        ret = this.nextIndex;
        this.nextIndex -= 1;
        return ret;
    };
}
/**
 * @class
 * A simple message log class. Provides methods for logging and displaying text
 * messages.
 * @version 1.0
 * @copyright Copyright &copy; 2009 Lowell D. Thomas, all rights reserved
 * @license [GNU General Public License]{@link http://www.gnu.org/licenses/licenses.html}
 * Version 2 or higher.
 * @memberof ApgUtilities
 * @constructor
 */
function MsgLog() {
    this.log = [];

    // returns the number of messages logged
    /**
     * Determine how many messages have been logged.
     *
     * @returns {number} the number of logged messages
     */
    this.count = function() {
        return this.log.length;
    };

    /**
     * Clear the message log. Removes all messages which have been logged.
     */
    this.clear = function() {
        this.log.length = 0;
    };

    /**
     * This is a specialty function for used by the generator (APG) for
     * precisely logging error locations in grammar source.
     *
     * @param {Number}
     *            line - the grammar line number
     * @param {Number}
     *            offset - character offset into the grammar file where the
     *            error occurred
     * @param {Number}
     *            len - the length of the (partially) matched phrase
     * @param {String}
     *            msg - the error message.
     */
    this.logLine = function(line, offset, len, msg) {
        if (typeof (msg) !== 'string') {
            msg = 'msg type: ' + typeof (msg);
        }
        if (typeof (line) !== 'number') {
            line = false;
        }
        if (typeof (offset) !== 'number') {
            offset = false;
        }
        if (typeof (len) !== 'number') {
            len = false;
        }
        this.log.push([ line, offset, len, ': ' + msg ]);
    };

    /**
     * Add a message to the log.
     *
     * @param {String}
     *            msg - the error message to log
     */
    this.logMsg = function(msg) {
        if (typeof (msg) !== 'string') {
            msg = 'msg type: ' + typeof (msg);
        }
        this.log.push([ false, false, false, msg ]);
    };

    /**
     * Displays the logged messages in HTML format.
     *
     * @param {String}
     *            title - an optional title to the display
     * @returns {string} the HTML markup for the list of logged messages table
     * @see also [logDisplayTable]{@link MsgLog#logDisplayTable} for display as
     *      an HTML table.
     */
    this.logDisplay = function(title) {
        var html = '';
        var i;
        if (typeof (title) === 'string') {
            html += title + '<br />';
        }
        if (this.log.length === 0) {
            html += '&lt;no messages&gt;<br />';
        } else {
            for (i = 0; i < this.log.length; i += 1) {
                var log = this.log[i];
                html += (i + 1) + ': ';
                if (!(log[0] === false)) {
                    html += ' line: ' + log[0];
                }
                if (!(log[1] === false)) {
                    html += ' offset: ' + log[1];
                }
                if (!(log[2] === false)) {
                    html += ' char: ' + log[2];
                }

                html += log[3];
                html += '<br />';
            }
        }
        return html;
    };

    /**
     * Displays the logged messages in an HTML table.
     *
     * @param {String}
     *            title - an optional title for the displayed table
     * @returns {string} the HTML markup for the list of logged messages
     * @see also [logDisplay]{@link MsgLog#logDisplay} for an alternative
     *      display.
     */
    this.logDisplayTable = function(title) {
        var line;
        var offset;
        var len;
        var html = '<table class="log-table">';
        var i;
        if (typeof (title) === 'string') {
            html += '<caption class="log-caption">' + title + '</caption>';
        }
        if (this.log.length === 0) {
            html += '<tr><td>0</td><td>&lt;no messages&gt;</td></tr>';
        } else {
            for (i = 0; i < this.log.length; i += 1) {
                var log = this.log[i];
                if (log[0] === false) {
                    line = '-';
                } else {
                    line = log[0];
                }
                if (log[1] === false) {
                    offset = '-';
                } else {
                    offset = log[1];
                }
                if (log[2] === false) {
                    len = '-';
                } else {
                    len = log[2];
                }
                if (i % 2 === 0) {
                    html += '<tr class="even"><td>' + line + '</td><td>'
                        + offset + '</td><td>' + len + '</td>';
                    html += '<td class="log-msg">' + log[3] + '</td></tr>';
                } else {
                    html += '<tr class="odd"><td>' + line + '</td><td>'
                        + offset + '</td><td>' + len + '</td>';
                    html += '<td class="log-msg">' + log[3] + '</td></tr>';
                }
            }
        }
        html += '</table>';
        return html;
    };
}

//var result = parse(expParam, "brief", true);
//annotateConditionsInTree(result.ast);
//console.log(JSON.stringify(result.ast));
