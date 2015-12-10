
/********************************************************************
  JavaScript APG - an ABNF Parser Generator
  Copyright (C) 2009 Lowell D. Thomas, all rights reserved

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

  	  author: Lowell Thomas
	          lowell@coasttocoastresearch.com
	          http://www.coasttocoastresearch.com

*********************************************************************/
function ABNFOpcodes()
{
    // SUMMARY
    // string table length: 8
    //               rules: 22
    //             opcodes: 113

    // string table
    this.stringTable = [];
    this.stringTable[0] = 91;
    this.stringTable[1] = 93;
    this.stringTable[2] = 91;
    this.stringTable[3] = 61;
    this.stringTable[4] = 44;
    this.stringTable[5] = 13;
    this.stringTable[6] = 10;
    this.stringTable[7] = 59;

    // rule identifiers
    this.ruleIds = [];
    this.ruleIds.inifile = 0;
    this.ruleIds.section = 1;
    this.ruleIds.sectionline = 2;
    this.ruleIds.goodsectionline = 3;
    this.ruleIds.badsectionline = 4;
    this.ruleIds.valueline = 5;
    this.ruleIds.goodvalueline = 6;
    this.ruleIds.badvalueline = 7;
    this.ruleIds.valuearray = 8;
    this.ruleIds.sectionname = 9;
    this.ruleIds.valuename = 10;
    this.ruleIds.value = 11;
    this.ruleIds.dquotedstring = 12;
    this.ruleIds.squotedstring = 13;
    this.ruleIds.alphadigit = 14;
    this.ruleIds.blankline = 15;
    this.ruleIds.lineend = 16;
    this.ruleIds.comment = 17;
    this.ruleIds.wsp = 18;
    this.ruleIds.alpha = 19;
    this.ruleIds.digit = 20;
    this.ruleIds.any = 21;

    // rule identifiers (alphabetical)
    this.ruleIds[0] = 19; // alpha
    this.ruleIds[1] = 14; // AlphaDigit
    this.ruleIds[2] = 21; // any
    this.ruleIds[3] = 4; // BadSectionLine
    this.ruleIds[4] = 7; // BadValueLine
    this.ruleIds[5] = 15; // BlankLine
    this.ruleIds[6] = 17; // comment
    this.ruleIds[7] = 20; // digit
    this.ruleIds[8] = 12; // DQuotedString
    this.ruleIds[9] = 3; // GoodSectionLine
    this.ruleIds[10] = 6; // GoodValueLine
    this.ruleIds[11] = 0; // IniFile
    this.ruleIds[12] = 16; // LineEnd
    this.ruleIds[13] = 1; // Section
    this.ruleIds[14] = 2; // SectionLine
    this.ruleIds[15] = 9; // SectionName
    this.ruleIds[16] = 13; // SQuotedString
    this.ruleIds[17] = 11; // Value
    this.ruleIds[18] = 8; // ValueArray
    this.ruleIds[19] = 5; // ValueLine
    this.ruleIds[20] = 10; // ValueName
    this.ruleIds[21] = 18; // wsp

    // rules
    this.rules = [];
    this.rules[0] = [];
    this.rules[0].rule = 'IniFile';
    this.rules[0].lower = 'inifile';
    this.rules[0].syntax = null;
    this.rules[0].semantic = null;
    this.rules[0].opcodeIndex = 0;

    this.rules[1] = [];
    this.rules[1].rule = 'Section';
    this.rules[1].lower = 'section';
    this.rules[1].syntax = null;
    this.rules[1].semantic = null;
    this.rules[1].opcodeIndex = 5;

    this.rules[2] = [];
    this.rules[2].rule = 'SectionLine';
    this.rules[2].lower = 'sectionline';
    this.rules[2].syntax = null;
    this.rules[2].semantic = null;
    this.rules[2].opcodeIndex = 11;

    this.rules[3] = [];
    this.rules[3].rule = 'GoodSectionLine';
    this.rules[3].lower = 'goodsectionline';
    this.rules[3].syntax = null;
    this.rules[3].semantic = null;
    this.rules[3].opcodeIndex = 14;

    this.rules[4] = [];
    this.rules[4].rule = 'BadSectionLine';
    this.rules[4].lower = 'badsectionline';
    this.rules[4].syntax = null;
    this.rules[4].semantic = null;
    this.rules[4].opcodeIndex = 24;

    this.rules[5] = [];
    this.rules[5].rule = 'ValueLine';
    this.rules[5].lower = 'valueline';
    this.rules[5].syntax = null;
    this.rules[5].semantic = null;
    this.rules[5].opcodeIndex = 29;

    this.rules[6] = [];
    this.rules[6].rule = 'GoodValueLine';
    this.rules[6].lower = 'goodvalueline';
    this.rules[6].syntax = null;
    this.rules[6].semantic = null;
    this.rules[6].opcodeIndex = 32;

    this.rules[7] = [];
    this.rules[7].rule = 'BadValueLine';
    this.rules[7].lower = 'badvalueline';
    this.rules[7].syntax = null;
    this.rules[7].semantic = null;
    this.rules[7].opcodeIndex = 42;

    this.rules[8] = [];
    this.rules[8].rule = 'ValueArray';
    this.rules[8].lower = 'valuearray';
    this.rules[8].syntax = null;
    this.rules[8].semantic = null;
    this.rules[8].opcodeIndex = 49;

    this.rules[9] = [];
    this.rules[9].rule = 'SectionName';
    this.rules[9].lower = 'sectionname';
    this.rules[9].syntax = null;
    this.rules[9].semantic = null;
    this.rules[9].opcodeIndex = 57;

    this.rules[10] = [];
    this.rules[10].rule = 'ValueName';
    this.rules[10].lower = 'valuename';
    this.rules[10].syntax = null;
    this.rules[10].semantic = null;
    this.rules[10].opcodeIndex = 62;

    this.rules[11] = [];
    this.rules[11].rule = 'Value';
    this.rules[11].lower = 'value';
    this.rules[11].syntax = null;
    this.rules[11].semantic = null;
    this.rules[11].opcodeIndex = 67;

    this.rules[12] = [];
    this.rules[12].rule = 'DQuotedString';
    this.rules[12].lower = 'dquotedstring';
    this.rules[12].syntax = null;
    this.rules[12].semantic = null;
    this.rules[12].opcodeIndex = 71;

    this.rules[13] = [];
    this.rules[13].rule = 'SQuotedString';
    this.rules[13].lower = 'squotedstring';
    this.rules[13].syntax = null;
    this.rules[13].semantic = null;
    this.rules[13].opcodeIndex = 78;

    this.rules[14] = [];
    this.rules[14].rule = 'AlphaDigit';
    this.rules[14].lower = 'alphadigit';
    this.rules[14].syntax = null;
    this.rules[14].semantic = null;
    this.rules[14].opcodeIndex = 85;

    this.rules[15] = [];
    this.rules[15].rule = 'BlankLine';
    this.rules[15].lower = 'blankline';
    this.rules[15].syntax = null;
    this.rules[15].semantic = null;
    this.rules[15].opcodeIndex = 89;

    this.rules[16] = [];
    this.rules[16].rule = 'LineEnd';
    this.rules[16].lower = 'lineend';
    this.rules[16].syntax = null;
    this.rules[16].semantic = null;
    this.rules[16].opcodeIndex = 94;

    this.rules[17] = [];
    this.rules[17].rule = 'comment';
    this.rules[17].lower = 'comment';
    this.rules[17].syntax = null;
    this.rules[17].semantic = null;
    this.rules[17].opcodeIndex = 98;

    this.rules[18] = [];
    this.rules[18].rule = 'wsp';
    this.rules[18].lower = 'wsp';
    this.rules[18].syntax = null;
    this.rules[18].semantic = null;
    this.rules[18].opcodeIndex = 102;

    this.rules[19] = [];
    this.rules[19].rule = 'alpha';
    this.rules[19].lower = 'alpha';
    this.rules[19].syntax = null;
    this.rules[19].semantic = null;
    this.rules[19].opcodeIndex = 106;

    this.rules[20] = [];
    this.rules[20].rule = 'digit';
    this.rules[20].lower = 'digit';
    this.rules[20].syntax = null;
    this.rules[20].semantic = null;
    this.rules[20].opcodeIndex = 109;

    this.rules[21] = [];
    this.rules[21].rule = 'any';
    this.rules[21].lower = 'any';
    this.rules[21].syntax = null;
    this.rules[21].semantic = null;
    this.rules[21].opcodeIndex = 110;

    // opcodes
    this.opcodes = [];
    this.opcodes[0] = [];
    this.opcodes[0].opNext = 5;
    this.opcodes[0].type = CAT;

    this.opcodes[1] = [];
    this.opcodes[1].opNext = 3;
    this.opcodes[1].type = REP;
    this.opcodes[1].min = 0;
    this.opcodes[1].max = Infinity;

    this.opcodes[2] = [];
    this.opcodes[2].opNext = 3;
    this.opcodes[2].type = RNM;
    this.opcodes[2].ruleIndex = 15;

    this.opcodes[3] = [];
    this.opcodes[3].opNext = 5;
    this.opcodes[3].type = REP;
    this.opcodes[3].min = 0;
    this.opcodes[3].max = Infinity;

    this.opcodes[4] = [];
    this.opcodes[4].opNext = 5;
    this.opcodes[4].type = RNM;
    this.opcodes[4].ruleIndex = 1;

    this.opcodes[5] = [];
    this.opcodes[5].opNext = 11;
    this.opcodes[5].type = CAT;

    this.opcodes[6] = [];
    this.opcodes[6].opNext = 7;
    this.opcodes[6].type = RNM;
    this.opcodes[6].ruleIndex = 2;

    this.opcodes[7] = [];
    this.opcodes[7].opNext = 11;
    this.opcodes[7].type = REP;
    this.opcodes[7].min = 0;
    this.opcodes[7].max = Infinity;

    this.opcodes[8] = [];
    this.opcodes[8].opNext = 11;
    this.opcodes[8].type = ALT;

    this.opcodes[9] = [];
    this.opcodes[9].opNext = 10;
    this.opcodes[9].type = RNM;
    this.opcodes[9].ruleIndex = 15;

    this.opcodes[10] = [];
    this.opcodes[10].opNext = 11;
    this.opcodes[10].type = RNM;
    this.opcodes[10].ruleIndex = 5;

    this.opcodes[11] = [];
    this.opcodes[11].opNext = 14;
    this.opcodes[11].type = ALT;

    this.opcodes[12] = [];
    this.opcodes[12].opNext = 13;
    this.opcodes[12].type = RNM;
    this.opcodes[12].ruleIndex = 3;

    this.opcodes[13] = [];
    this.opcodes[13].opNext = 14;
    this.opcodes[13].type = RNM;
    this.opcodes[13].ruleIndex = 4;

    this.opcodes[14] = [];
    this.opcodes[14].opNext = 24;
    this.opcodes[14].type = CAT;

    this.opcodes[15] = [];
    this.opcodes[15].opNext = 16;
    this.opcodes[15].type = TLS;
    this.opcodes[15].length = 1;
    this.opcodes[15].stringIndex = 0;

    this.opcodes[16] = [];
    this.opcodes[16].opNext = 17;
    this.opcodes[16].type = RNM;
    this.opcodes[16].ruleIndex = 18;

    this.opcodes[17] = [];
    this.opcodes[17].opNext = 18;
    this.opcodes[17].type = RNM;
    this.opcodes[17].ruleIndex = 9;

    this.opcodes[18] = [];
    this.opcodes[18].opNext = 19;
    this.opcodes[18].type = RNM;
    this.opcodes[18].ruleIndex = 18;

    this.opcodes[19] = [];
    this.opcodes[19].opNext = 20;
    this.opcodes[19].type = TLS;
    this.opcodes[19].length = 1;
    this.opcodes[19].stringIndex = 1;

    this.opcodes[20] = [];
    this.opcodes[20].opNext = 21;
    this.opcodes[20].type = RNM;
    this.opcodes[20].ruleIndex = 18;

    this.opcodes[21] = [];
    this.opcodes[21].opNext = 23;
    this.opcodes[21].type = REP;
    this.opcodes[21].min = 0;
    this.opcodes[21].max = 1;

    this.opcodes[22] = [];
    this.opcodes[22].opNext = 23;
    this.opcodes[22].type = RNM;
    this.opcodes[22].ruleIndex = 17;

    this.opcodes[23] = [];
    this.opcodes[23].opNext = 24;
    this.opcodes[23].type = RNM;
    this.opcodes[23].ruleIndex = 16;

    this.opcodes[24] = [];
    this.opcodes[24].opNext = 29;
    this.opcodes[24].type = CAT;

    this.opcodes[25] = [];
    this.opcodes[25].opNext = 26;
    this.opcodes[25].type = TLS;
    this.opcodes[25].length = 1;
    this.opcodes[25].stringIndex = 2;

    this.opcodes[26] = [];
    this.opcodes[26].opNext = 28;
    this.opcodes[26].type = REP;
    this.opcodes[26].min = 0;
    this.opcodes[26].max = Infinity;

    this.opcodes[27] = [];
    this.opcodes[27].opNext = 28;
    this.opcodes[27].type = RNM;
    this.opcodes[27].ruleIndex = 21;

    this.opcodes[28] = [];
    this.opcodes[28].opNext = 29;
    this.opcodes[28].type = RNM;
    this.opcodes[28].ruleIndex = 16;

    this.opcodes[29] = [];
    this.opcodes[29].opNext = 32;
    this.opcodes[29].type = ALT;

    this.opcodes[30] = [];
    this.opcodes[30].opNext = 31;
    this.opcodes[30].type = RNM;
    this.opcodes[30].ruleIndex = 6;

    this.opcodes[31] = [];
    this.opcodes[31].opNext = 32;
    this.opcodes[31].type = RNM;
    this.opcodes[31].ruleIndex = 7;

    this.opcodes[32] = [];
    this.opcodes[32].opNext = 42;
    this.opcodes[32].type = CAT;

    this.opcodes[33] = [];
    this.opcodes[33].opNext = 34;
    this.opcodes[33].type = RNM;
    this.opcodes[33].ruleIndex = 10;

    this.opcodes[34] = [];
    this.opcodes[34].opNext = 35;
    this.opcodes[34].type = RNM;
    this.opcodes[34].ruleIndex = 18;

    this.opcodes[35] = [];
    this.opcodes[35].opNext = 36;
    this.opcodes[35].type = TLS;
    this.opcodes[35].length = 1;
    this.opcodes[35].stringIndex = 3;

    this.opcodes[36] = [];
    this.opcodes[36].opNext = 37;
    this.opcodes[36].type = RNM;
    this.opcodes[36].ruleIndex = 18;

    this.opcodes[37] = [];
    this.opcodes[37].opNext = 38;
    this.opcodes[37].type = RNM;
    this.opcodes[37].ruleIndex = 8;

    this.opcodes[38] = [];
    this.opcodes[38].opNext = 39;
    this.opcodes[38].type = RNM;
    this.opcodes[38].ruleIndex = 18;

    this.opcodes[39] = [];
    this.opcodes[39].opNext = 41;
    this.opcodes[39].type = REP;
    this.opcodes[39].min = 0;
    this.opcodes[39].max = 1;

    this.opcodes[40] = [];
    this.opcodes[40].opNext = 41;
    this.opcodes[40].type = RNM;
    this.opcodes[40].ruleIndex = 17;

    this.opcodes[41] = [];
    this.opcodes[41].opNext = 42;
    this.opcodes[41].type = RNM;
    this.opcodes[41].ruleIndex = 16;

    this.opcodes[42] = [];
    this.opcodes[42].opNext = 49;
    this.opcodes[42].type = CAT;

    this.opcodes[43] = [];
    this.opcodes[43].opNext = 46;
    this.opcodes[43].type = ALT;

    this.opcodes[44] = [];
    this.opcodes[44].opNext = 45;
    this.opcodes[44].type = TRG;
    this.opcodes[44].min = 33;
    this.opcodes[44].max = 90;

    this.opcodes[45] = [];
    this.opcodes[45].opNext = 46;
    this.opcodes[45].type = TRG;
    this.opcodes[45].min = 92;
    this.opcodes[45].max = 126;

    this.opcodes[46] = [];
    this.opcodes[46].opNext = 48;
    this.opcodes[46].type = REP;
    this.opcodes[46].min = 0;
    this.opcodes[46].max = Infinity;

    this.opcodes[47] = [];
    this.opcodes[47].opNext = 48;
    this.opcodes[47].type = RNM;
    this.opcodes[47].ruleIndex = 21;

    this.opcodes[48] = [];
    this.opcodes[48].opNext = 49;
    this.opcodes[48].type = RNM;
    this.opcodes[48].ruleIndex = 16;

    this.opcodes[49] = [];
    this.opcodes[49].opNext = 57;
    this.opcodes[49].type = CAT;

    this.opcodes[50] = [];
    this.opcodes[50].opNext = 51;
    this.opcodes[50].type = RNM;
    this.opcodes[50].ruleIndex = 11;

    this.opcodes[51] = [];
    this.opcodes[51].opNext = 57;
    this.opcodes[51].type = REP;
    this.opcodes[51].min = 0;
    this.opcodes[51].max = Infinity;

    this.opcodes[52] = [];
    this.opcodes[52].opNext = 57;
    this.opcodes[52].type = CAT;

    this.opcodes[53] = [];
    this.opcodes[53].opNext = 54;
    this.opcodes[53].type = RNM;
    this.opcodes[53].ruleIndex = 18;

    this.opcodes[54] = [];
    this.opcodes[54].opNext = 55;
    this.opcodes[54].type = TLS;
    this.opcodes[54].length = 1;
    this.opcodes[54].stringIndex = 4;

    this.opcodes[55] = [];
    this.opcodes[55].opNext = 56;
    this.opcodes[55].type = RNM;
    this.opcodes[55].ruleIndex = 18;

    this.opcodes[56] = [];
    this.opcodes[56].opNext = 57;
    this.opcodes[56].type = RNM;
    this.opcodes[56].ruleIndex = 11;

    this.opcodes[57] = [];
    this.opcodes[57].opNext = 62;
    this.opcodes[57].type = REP;
    this.opcodes[57].min = 1;
    this.opcodes[57].max = Infinity;

    this.opcodes[58] = [];
    this.opcodes[58].opNext = 62;
    this.opcodes[58].type = ALT;

    this.opcodes[59] = [];
    this.opcodes[59].opNext = 60;
    this.opcodes[59].type = RNM;
    this.opcodes[59].ruleIndex = 19;

    this.opcodes[60] = [];
    this.opcodes[60].opNext = 61;
    this.opcodes[60].type = RNM;
    this.opcodes[60].ruleIndex = 20;

    this.opcodes[61] = [];
    this.opcodes[61].opNext = 62;
    this.opcodes[61].type = TRG;
    this.opcodes[61].min = 95;
    this.opcodes[61].max = 95;

    this.opcodes[62] = [];
    this.opcodes[62].opNext = 67;
    this.opcodes[62].type = REP;
    this.opcodes[62].min = 1;
    this.opcodes[62].max = Infinity;

    this.opcodes[63] = [];
    this.opcodes[63].opNext = 67;
    this.opcodes[63].type = ALT;

    this.opcodes[64] = [];
    this.opcodes[64].opNext = 65;
    this.opcodes[64].type = RNM;
    this.opcodes[64].ruleIndex = 19;

    this.opcodes[65] = [];
    this.opcodes[65].opNext = 66;
    this.opcodes[65].type = RNM;
    this.opcodes[65].ruleIndex = 20;

    this.opcodes[66] = [];
    this.opcodes[66].opNext = 67;
    this.opcodes[66].type = TRG;
    this.opcodes[66].min = 95;
    this.opcodes[66].max = 95;

    this.opcodes[67] = [];
    this.opcodes[67].opNext = 71;
    this.opcodes[67].type = ALT;

    this.opcodes[68] = [];
    this.opcodes[68].opNext = 69;
    this.opcodes[68].type = RNM;
    this.opcodes[68].ruleIndex = 12;

    this.opcodes[69] = [];
    this.opcodes[69].opNext = 70;
    this.opcodes[69].type = RNM;
    this.opcodes[69].ruleIndex = 13;

    this.opcodes[70] = [];
    this.opcodes[70].opNext = 71;
    this.opcodes[70].type = RNM;
    this.opcodes[70].ruleIndex = 14;

    this.opcodes[71] = [];
    this.opcodes[71].opNext = 78;
    this.opcodes[71].type = CAT;

    this.opcodes[72] = [];
    this.opcodes[72].opNext = 73;
    this.opcodes[72].type = TRG;
    this.opcodes[72].min = 34;
    this.opcodes[72].max = 34;

    this.opcodes[73] = [];
    this.opcodes[73].opNext = 77;
    this.opcodes[73].type = REP;
    this.opcodes[73].min = 1;
    this.opcodes[73].max = Infinity;

    this.opcodes[74] = [];
    this.opcodes[74].opNext = 77;
    this.opcodes[74].type = ALT;

    this.opcodes[75] = [];
    this.opcodes[75].opNext = 76;
    this.opcodes[75].type = TRG;
    this.opcodes[75].min = 32;
    this.opcodes[75].max = 33;

    this.opcodes[76] = [];
    this.opcodes[76].opNext = 77;
    this.opcodes[76].type = TRG;
    this.opcodes[76].min = 35;
    this.opcodes[76].max = 126;

    this.opcodes[77] = [];
    this.opcodes[77].opNext = 78;
    this.opcodes[77].type = TRG;
    this.opcodes[77].min = 34;
    this.opcodes[77].max = 34;

    this.opcodes[78] = [];
    this.opcodes[78].opNext = 85;
    this.opcodes[78].type = CAT;

    this.opcodes[79] = [];
    this.opcodes[79].opNext = 80;
    this.opcodes[79].type = TRG;
    this.opcodes[79].min = 39;
    this.opcodes[79].max = 39;

    this.opcodes[80] = [];
    this.opcodes[80].opNext = 84;
    this.opcodes[80].type = REP;
    this.opcodes[80].min = 1;
    this.opcodes[80].max = Infinity;

    this.opcodes[81] = [];
    this.opcodes[81].opNext = 84;
    this.opcodes[81].type = ALT;

    this.opcodes[82] = [];
    this.opcodes[82].opNext = 83;
    this.opcodes[82].type = TRG;
    this.opcodes[82].min = 32;
    this.opcodes[82].max = 38;

    this.opcodes[83] = [];
    this.opcodes[83].opNext = 84;
    this.opcodes[83].type = TRG;
    this.opcodes[83].min = 40;
    this.opcodes[83].max = 126;

    this.opcodes[84] = [];
    this.opcodes[84].opNext = 85;
    this.opcodes[84].type = TRG;
    this.opcodes[84].min = 39;
    this.opcodes[84].max = 39;

    this.opcodes[85] = [];
    this.opcodes[85].opNext = 89;
    this.opcodes[85].type = REP;
    this.opcodes[85].min = 1;
    this.opcodes[85].max = Infinity;

    this.opcodes[86] = [];
    this.opcodes[86].opNext = 89;
    this.opcodes[86].type = ALT;

    this.opcodes[87] = [];
    this.opcodes[87].opNext = 88;
    this.opcodes[87].type = RNM;
    this.opcodes[87].ruleIndex = 19;

    this.opcodes[88] = [];
    this.opcodes[88].opNext = 89;
    this.opcodes[88].type = RNM;
    this.opcodes[88].ruleIndex = 20;

    this.opcodes[89] = [];
    this.opcodes[89].opNext = 94;
    this.opcodes[89].type = CAT;

    this.opcodes[90] = [];
    this.opcodes[90].opNext = 91;
    this.opcodes[90].type = RNM;
    this.opcodes[90].ruleIndex = 18;

    this.opcodes[91] = [];
    this.opcodes[91].opNext = 93;
    this.opcodes[91].type = REP;
    this.opcodes[91].min = 0;
    this.opcodes[91].max = 1;

    this.opcodes[92] = [];
    this.opcodes[92].opNext = 93;
    this.opcodes[92].type = RNM;
    this.opcodes[92].ruleIndex = 17;

    this.opcodes[93] = [];
    this.opcodes[93].opNext = 94;
    this.opcodes[93].type = RNM;
    this.opcodes[93].ruleIndex = 16;

    this.opcodes[94] = [];
    this.opcodes[94].opNext = 98;
    this.opcodes[94].type = ALT;

    this.opcodes[95] = [];
    this.opcodes[95].opNext = 96;
    this.opcodes[95].type = TBS;
    this.opcodes[95].length = 2;
    this.opcodes[95].stringIndex = 5;

    this.opcodes[96] = [];
    this.opcodes[96].opNext = 97;
    this.opcodes[96].type = TRG;
    this.opcodes[96].min = 10;
    this.opcodes[96].max = 10;

    this.opcodes[97] = [];
    this.opcodes[97].opNext = 98;
    this.opcodes[97].type = TRG;
    this.opcodes[97].min = 13;
    this.opcodes[97].max = 13;

    this.opcodes[98] = [];
    this.opcodes[98].opNext = 102;
    this.opcodes[98].type = CAT;

    this.opcodes[99] = [];
    this.opcodes[99].opNext = 100;
    this.opcodes[99].type = TLS;
    this.opcodes[99].length = 1;
    this.opcodes[99].stringIndex = 7;

    this.opcodes[100] = [];
    this.opcodes[100].opNext = 102;
    this.opcodes[100].type = REP;
    this.opcodes[100].min = 0;
    this.opcodes[100].max = Infinity;

    this.opcodes[101] = [];
    this.opcodes[101].opNext = 102;
    this.opcodes[101].type = RNM;
    this.opcodes[101].ruleIndex = 21;

    this.opcodes[102] = [];
    this.opcodes[102].opNext = 106;
    this.opcodes[102].type = REP;
    this.opcodes[102].min = 0;
    this.opcodes[102].max = Infinity;

    this.opcodes[103] = [];
    this.opcodes[103].opNext = 106;
    this.opcodes[103].type = ALT;

    this.opcodes[104] = [];
    this.opcodes[104].opNext = 105;
    this.opcodes[104].type = TRG;
    this.opcodes[104].min = 32;
    this.opcodes[104].max = 32;

    this.opcodes[105] = [];
    this.opcodes[105].opNext = 106;
    this.opcodes[105].type = TRG;
    this.opcodes[105].min = 9;
    this.opcodes[105].max = 9;

    this.opcodes[106] = [];
    this.opcodes[106].opNext = 109;
    this.opcodes[106].type = ALT;

    this.opcodes[107] = [];
    this.opcodes[107].opNext = 108;
    this.opcodes[107].type = TRG;
    this.opcodes[107].min = 65;
    this.opcodes[107].max = 90;

    this.opcodes[108] = [];
    this.opcodes[108].opNext = 109;
    this.opcodes[108].type = TRG;
    this.opcodes[108].min = 97;
    this.opcodes[108].max = 122;

    this.opcodes[109] = [];
    this.opcodes[109].opNext = 110;
    this.opcodes[109].type = TRG;
    this.opcodes[109].min = 48;
    this.opcodes[109].max = 57;

    this.opcodes[110] = [];
    this.opcodes[110].opNext = 113;
    this.opcodes[110].type = ALT;

    this.opcodes[111] = [];
    this.opcodes[111].opNext = 112;
    this.opcodes[111].type = TRG;
    this.opcodes[111].min = 32;
    this.opcodes[111].max = 126;

    this.opcodes[112] = [];
    this.opcodes[112].opNext = 113;
    this.opcodes[112].type = TRG;
    this.opcodes[112].min = 9;
    this.opcodes[112].max = 9;

}
