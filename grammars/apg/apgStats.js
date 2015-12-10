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
/**
 * @class
 * Collects node count and other statistics during parsing.
 * @version 1.0
 * @copyright Copyright &copy; 2009 Lowell D. Thomas, all rights reserved
 * @license [GNU General Public License]{@link http://www.gnu.org/licenses/licenses.html}
 * Version 2 or higher.
 * @constructor
 * @param {Array} rules - the APG-generated rule list
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
