/*
  JavaScript APG Runtime Library, Version 1.0
  
  APG - an ABNF Parser Generator
  Copyright (C) 2009 Lowell D. Thomas, all rights reserved

  author:  Lowell D. Thomas
  email:   lowell@coasttocoastresearch.com
  website: http://www.coasttocoastresearch.com

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 2 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see
  <http://www.gnu.org/licenses/old-licenses/gpl-2.0.html>
  or write to the Free Software Foundation, Inc.,
  51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
/**
 * This code in this namespace gives a complete example of how to set up and use a JavaScript APG
 * parser. See the [driver]{@link Example.driver} function and the objects it creates.
 * 
 * <pre>
 * HTML requirements - a web page or pages capable of:
 *    - capturing the input string to be parsed (e.g. textarea)
 *    - running the JavaScript parser (e.g. button click)
 *    - displaying the output (e.g. putting HTML in a &lt;div&gt; element)
 * </pre>
 * 
 * The web page must have the following elements:
 * 
 * <pre>
 * 1. include APG library
 *      ApgLib.js 		- required
 *      ApgUtilities.js	- optional, has useful functions for display of output
 *      ApgTrace.js 	- optional, required for tracing
 *      ApgStats.js 	- optional, required for statistics gathering
 *      ApgAst.js 		- optional, required for generation of an AST
 * 2. include the opcodes object from the generator (see [Interactive APG]{@link http://www.coasttocoastresearch.com/interactiveapg/})
 *      at that link, select the "Initialization File" example
 *      click "Generate"
 *      cut and paste the opcodes object from the "Generated Parser" page of the Parser Output.
 * 3. user-written JavaScript syntax call back functions (optional, but required for user interaction with the parser)
 * 4. user-written JavaScript semantic call back functions (optional, but required for translation of the AST)
 * 5. user-written JavaScript driver program to set up and execute the parser
 * </pre>
 * 
 * @namespace Example
 * @version 1.0
 * @copyright Copyright &copy; 2009 Lowell D. Thomas, all rights reserved
 * @license [GNU General Public License]{@link http://www.gnu.org/licenses/licenses.html}
 * Version 2 or higher.
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

/**
 * The main, driver program. Called from the "Parse"" button click. It performs
 * the following steps:
 * 
 * <pre>
 * 1. intitialize 
 *    - an error message log
 *    - the generated opcodes for the ABNF grammar-defined language
 *    - the parser
 *    - the syntax call back functions
 *    - the semantic call back functions
 *    - the input string
 *    - the Abstract Syntax Tree (AST)
 *    - the parsing statistics
 *    - the parser trace
 * 2. parse input string
 *    - syntax analysis
 * 3. translate the input string
 *    - semantic analysis
 * 4. display
 *    - the translation
 *    - the parser's final state
 *    - the parsing statistics
 *    - the parser trace
 * </pre>
 * 
 * @see See also the detailed documentation in the driver function code itself.
 * @memberof Example
 */
function driver() {
	// optional, initialize the output string which will be used to display the parser's results
	var html = '';

	// optional, initialize a message log for error/info reporting
	var log = new MsgLog();

	// required, initialize the APG-generated opcodes
	// NOTE: To get this object for any given grammar, go to the APG website Interactive APG page.
	//       Generate a parser for the grammar there.
	//       Click the "Generated Parser" button and cut & paste into a file to include here.
	//       Clumsy, but it will have to do until a stand-alone version of the generator is available.
	var parserOpcodes = new ABNFOpcodes();

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
	var input = window.document.getElementById('input-string').value;
	var stringChars = [];
	grammarToChars(log, input, stringChars);

	// optional, generate an Abstract Syntax Tree (AST)
	// AST a) generate a list or rule name nodes and initialize the AST object
	var astNodes = astNodeList(semCallbacks)
//    console.log("Pasando");

	// AST b) construct the AST object (needs list of nodes, list of rules and the input string)
	var ast = new Ast(astNodes, parserOpcodes.rules, stringChars);

//    console.log(ast.dump(parserOpcodes.rules, stringChars));

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
	parserTrace.setFilter(parserTrace.parseFilter, 'rule', false, 18);
	parserTrace.setFilter(parserTrace.parseFilter, 'rule', false, 21);
	
	// optional, set up the user-defined data that the syntax analysis callback functions will need.
	var synData = {
		log : log,
		lineno : 0
	};

	// finally, parse the input string using rule 0(inifile) as the start rule,
	// stringChars as the input string and synData as the user-defined data
	// NOTE: the parser ignores synData. It is simply passed to the callback functions for them to use.
	var test = parser.syntaxAnalysis(0, stringChars, synData);

    //console.log("test");
    //console.log(test); // Este es el resultado true false de la verificacion

    //console.log(parserTrace.lines);
    var createTree = function(parserTrace, input) {
        var meaningfulTokens = [
            "ancestorOf",
            "ancestorOf",
            "ancestorOrSelfOf",
            "attribute",
            "attributeGroup",
            "attributeName",
            "attributeSet",
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
            "unrefinedExpressionConstraint"
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

    var simpleTree = createTree(parserTrace, input);
    console.log(simpleTree.length);

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
            if (loopNode.depth == node.depth + 1 &&
                loopNode.offset >= node.offset &&
                loopNode.offset + loopNode.length <= node.offset + node.length &&
                loopNode.rule != node.rule) {
                //loopNode.content.trim() != node.content.trim()
                if (!result.some(function(e) {
                        return (e.rule == loopNode.rule && true && e.offset == loopNode.offset)
                    })) {
                    result.push(loopNode);
                }
            }
        });
        return result;
    };

    var printTree = function(node) {
        var tab = new Array((node.depth*2) + 1).join( "-" );
        console.log(tab,node.rule, node.content);
        var children = getChildren(node, simpleTree);
        children.forEach(function(loopChild) {
            printTree(loopChild);
        });
    };

    var root = getRootNode(simpleTree);
    printTree(root);
    var compiler = {};
    compiler.expressionConstraint = function(node, tree) {
        var children = getChildren(node, tree);
        children.forEach(function(loopChild) {
            compiler[loopChild.rule](loopChild, tree);
        });
    };
    compiler.simpleExpressionConstraint = function(node, tree) {
        console.log("A simple constraint ");
        var children = getChildren(node, tree);
        children.forEach(function(loopChild) {
            if (loopChild.rule == "constraintOperator") {
                console.log("An operation of type " + loopChild.content);
            }
        });
        children.forEach(function(loopChild) {
            if (loopChild.rule == "focusConcept") {
                console.log("on focus concept " + loopChild.content);
            }
        });
    };

    compiler.refinedExpressionConstraint = function(node, tree) {
        console.log("A refined constraint ");
        var children = getChildren(node, tree);
        children.forEach(function(loopChild) {
            compiler[loopChild.rule](loopChild, tree);
        });
    };

    compiler.compoundExpressionConstraint = function(node, tree) {
        console.log("A compound constraint ");
        var children = getChildren(node, tree);
        children.forEach(function(loopChild) {
            compiler[loopChild.rule](loopChild, tree);
        });
    };

    compiler.conjunctionExpressionConstraint = function(node, tree) {
        console.log("A conjuction constraint ");
        var children = getChildren(node, tree);
        children.forEach(function(loopChild) {
            compiler[loopChild.rule](loopChild, tree);
        });
    };

    compiler.disjunctionExpressionConstraint = function(node, tree) {
        console.log("A disjunction constraint ");
        var children = getChildren(node, tree);
        children.forEach(function(loopChild) {
            compiler[loopChild.rule](loopChild, tree);
        });
    };

    compiler.exclusionExpressionConstraint = function(node, tree) {
        console.log("An exclusion constraint ");
        var children = getChildren(node, tree);
        children.forEach(function(loopChild) {
            compiler[loopChild.rule](loopChild, tree);
        });
    };

    compiler.subExpressionConstraint = function(node, tree) {
        console.log("An subexpression constraint ");
        var children = getChildren(node, tree);
        children.forEach(function(loopChild) {
            compiler[loopChild.rule](loopChild, tree);
        });
    };

    compiler.refinement = function(node, tree) {
        console.log(" with this refinment ", node.content);
    };

    //compiler[root.rule](root, simpleTree);


    var max = parserTrace.parseCircular.items();
    parserTrace.parseCircular.initReplay();
    for (i = 0; i < max; i += 1) {
        var j = parserTrace.parseCircular.replay();
        line = parserTrace.lines[j];
        if (
            //line.dir == "down"
                line.state == APG_MATCH &&
                line.opType == RNM
            ) {
            if (parserTrace.rules[line.ruleIndex].rule == "conceptReference") {
//                console.log(line);
//                console.log(parserTrace.rules[line.ruleIndex].rule);
//                console.log(input.substr(line.offset, line.length));
            }
            if (parserTrace.rules[line.ruleIndex].rule == "refinedExpressionConstraint") {
//                console.log(line);
//                console.log(parserTrace.rules[line.ruleIndex].rule);
//                console.log(input.substr(line.offset, line.length));
            }
//            if (parserTrace.rules[line.ruleIndex].rule == "unrefinedExpressionConstraint") {
//                console.log(line);
//                console.log(parserTrace.rules[line.ruleIndex].rule);
//                console.log(input.substr(line.offset, line.length));
//            }
//            if (parserTrace.rules[line.ruleIndex].rule == "expressionConstraint") {
//                console.log(line);
//                console.log(parserTrace.rules[line.ruleIndex].rule);
//                console.log(input.substr(line.offset, line.length));
//            }
//            if (parserTrace.rules[line.ruleIndex].rule == "refinement") {
//                console.log(line);
//                console.log(parserTrace.rules[line.ruleIndex].rule);
//                console.log(input.substr(line.offset, line.length));
//            }
//            if (parserTrace.rules[line.ruleIndex].rule == "attribute") {
//                console.log(line);
//                console.log(parserTrace.rules[line.ruleIndex].rule);
//                console.log(input.substr(line.offset, line.length));
//            }
//            if (parserTrace.rules[line.ruleIndex].rule == "expressionConstraintValue") {
//                console.log(line);
//                console.log(parserTrace.rules[line.ruleIndex].rule);
//                console.log(input.substr(line.offset, line.length));
//            }

//            console.log(parserTrace.rules[line.ruleIndex].rule);
//            console.log(line);
                //, parserTrace.displayAscii(parserTrace.chars, line.offset, line.length,line.state));
            //console.log(line);
        }
    }
    console.log("fin");

	// "while" is used here simply as a single-point-of-exit error handling loop
	while (true) {
		// test for any errors logged during syntaxAnalysis
		if (log.count() !== 0) {
			html += log.logDisplay('syntaxAnalysis analysis errors encountered');
			break;
		}

		// test for a possible parser failure that was not logged
		if (!test) {
			html += '<br><br>parser: syntaxAnalysis analysis errors of unknown type encountered';
			break;
		}

		// optional, initialize the user-defined data needed by the semantic callback functions
		var semData = {
			log : log,
			sectionName : '',
			total : 0
		};

		// translate the string (semantic analysis)
		// this is a traversal of the AST, calling the callback functions assigned to the saved AST nodes
		parser.semanticAnalysis(semData);

		// report any logged semantic analysis errors
		if (log.count() !== 0) {
			html += log.logDisplay('semanticAnalysis analysis errors encountered');
			break;
		}

		// success, if we are here all is well
		html += '<h4>Parser Translation:</h4>';
		html += 'total dollars and cents: $' + semData.total;
		break;
	}

	// put the results in HTML format
	html += '<h4>Parser State:</h4>';
	html += parser.stateDisplay(); // display the parser state
	html += '<h4>Parser Statistics:</h4>';
	html += parserStats.display(); // display the parser statistics
	html += '<h4>Parser Trace:</h4>';
	html += parserTrace.display(); // display the parser trace

	// display the results on the web page
	window.document.getElementById('parser-output').innerHTML = html;
}
