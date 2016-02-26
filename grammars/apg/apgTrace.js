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
"use strict";
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
