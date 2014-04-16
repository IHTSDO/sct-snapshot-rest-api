/* 
    util.js
    mongodb-rest

    Created by Tom de Grunt on 2010-10-03.
    Copyright (c) 2010 Tom de Grunt.
		This file is part of mongodb-rest.
*/ 
var mongo = require("mongodb"),
    config = module.parent.parent.exports.config;

/*
 * flavorize - Changes JSON based on flavor in configuration 
 */
module.exports.flavorize = function(doc, direction) {
  if (direction == "in") {
    switch (config.flavor) {
      case "sproutcore":
        delete doc['guid']; // only do this in case flavor is set to sproutcore
        break;
      case "nounderscore":
        delete doc['id']; // only do this in case flavor is set to sproutcore
        break;
      default: 
        break;
    }
  } else {
    switch (config.flavor) {
      case "sproutcore":
        var guid = doc._id.toHexString();
        delete doc['_id'];
        doc.guid = guid;
        break;
      case "nounderscore":
        var id = doc._id.toHexString();
        delete doc['_id'];
        doc.id = id;
        break;
      default:
        doc._id = doc._id.toHexString();
        break;
    }
  }
  return doc;
};

var defaultDiacriticsRemovalMap = [
    {'base':'a','letters':/[\u00E1\u00E2\u00E3\u00E4\u00E5\u0101\u0103\u0105\u01CE\u01FB\u00C0\u00C4]/g},
    {'base':'ae','letters':/[\u00E6\u01FD]/g},
    {'base':'c','letters':/[\u00E7\u0107\u0109\u010B\u010D]/g},
    {'base':'d','letters':/[\u010F\u0111\u00F0]/g},
    {'base':'e','letters':/[\u00E8\u00E9\u00EA\u00EB\u0113\u0115\u0117\u0119\u011B]/g},
    {'base':'f','letters':/[\u0192]/g},
    {'base':'g','letters':/[\u011D\u011F\u0121\u0123]/g},
    {'base':'h','letters':/[\u0125\u0127]/g},
    {'base':'i','letters':/[\u00ED\u00EC\u00EE\u00EF\u0129\u012B\u012D\u012F\u0131]/g},
    {'base':'ij','letters':/[\u0133]/g},
    {'base':'j','letters':/[\u0135]/g},
    {'base':'k','letters':/[\u0137\u0138]/g},
    {'base':'l','letters':/[\u013A\u013C\u013E\u0140\u0142]/g},
    {'base':'n','letters':/[\u00F1\u0144\u0146\u0148\u0149\u014B]/g},
    {'base':'o','letters':/[\u00F2\u00F3\u00F4\u00F5\u00F6\u014D\u014F\u0151\u01A1\u01D2\u01FF]/g},
    {'base':'oe','letters':/[\u0153]/g},
    {'base':'r','letters':/[\u0155\u0157\u0159]/g},
    {'base':'s','letters':/[\u015B\u015D\u015F\u0161]/g},
    {'base':'t','letters':/[\u0163\u0165\u0167]/g},
    {'base':'u','letters':/[\u00F9\u00FA\u00FB\u00FC\u0169\u016B\u016B\u016D\u016F\u0171\u0173\u01B0\u01D4\u01D6\u01D8\u01DA\u01DC]/g},
    {'base':'w','letters':/[\u0175]/g},
    {'base':'y','letters':/[\u00FD\u00FF\u0177]/g},
    {'base':'z','letters':/[\u017A\u017C\u017E]/g},
    {'base':'A','letters':/[\u00C1\u00C2\u00C3\uCC04\u00C5\u00E0\u0100\u0102\u0104\u01CD\u01FB]/g},
    {'base':'AE','letters':/[\u00C6]/g},
    {'base':'C','letters':/[\u00C7\u0106\u0108\u010A\u010C]/g},
    {'base':'D','letters':/[\u010E\u0110\u00D0]/g},
    {'base':'E','letters':/[\u00C8\u00C9\u00CA\u00CB\u0112\u0114\u0116\u0118\u011A]/g},
    {'base':'G','letters':/[\u011C\u011E\u0120\u0122]/g},
    {'base':'H','letters':/[\u0124\u0126]/g},
    {'base':'I','letters':/[\u00CD\u00CC\u00CE\u00CF\u0128\u012A\u012C\u012E\u0049]/g},
    {'base':'IJ','letters':/[\u0132]/g},
    {'base':'J','letters':/[\u0134]/g},
    {'base':'K','letters':/[\u0136]/g},
    {'base':'L','letters':/[\u0139\u013B\u013D\u013F\u0141]/g},
    {'base':'N','letters':/[\u00D1\u0143\u0145\u0147\u0149\u014A]/g},
    {'base':'O','letters':/[\u00D2\u00D3\u00D4\u00D5\u00D6\u014C\u014E\u0150\u01A0\u01D1]/g},
    {'base':'OE','letters':/[\u0152]/g},
    {'base':'R','letters':/[\u0154\u0156\u0158]/g},
    {'base':'S','letters':/[\u015A\u015C\u015E\u0160]/g},
    {'base':'T','letters':/[\u0162\u0164\u0166]/g},
    {'base':'U','letters':/[\u00D9\u00DA\u00DB\u00DC\u0168\u016A\u016C\u016E\u0170\u0172\u01AF\u01D3\u01D5\u01D7\u01D9\u01DB]/g},
    {'base':'W','letters':/[\u0174]/g},
    {'base':'Y','letters':/[\u0178\u0176]/g},
    {'base':'Z','letters':/[\u0179\u017B\u017D]/g},
    // Greek letters
    {'base':'ALPHA','letters':/[\u0391\u03B1]/g},
    {'base':'BETA','letters':/[\u0392\u03B2]/g},
    {'base':'GAMMA','letters':/[\u0393\u03B3]/g},
    {'base':'DELTA','letters':/[\u0394\u03B4]/g},
    {'base':'EPSILON','letters':/[\u0395\u03B5]/g},
    {'base':'ZETA','letters':/[\u0396\u03B6]/g},
    {'base':'ETA','letters':/[\u0397\u03B7]/g},
    {'base':'THETA','letters':/[\u0398\u03B8]/g},
    {'base':'IOTA','letters':/[\u0399\u03B9]/g},
    {'base':'KAPPA','letters':/[\u039A\u03BA]/g},
    {'base':'LAMBDA','letters':/[\u039B\u03BB]/g},
    {'base':'MU','letters':/[\u039C\u03BC]/g},
    {'base':'NU','letters':/[\u039D\u03BD]/g},
    {'base':'XI','letters':/[\u039E\u03BE]/g},
    {'base':'OMICRON','letters':/[\u039F\u03BF]/g},
    {'base':'PI','letters':/[\u03A0\u03C0]/g},
    {'base':'RHO','letters':/[\u03A1\u03C1]/g},
    {'base':'SIGMA','letters':/[\u03A3\u03C3]/g},
    {'base':'TAU','letters':/[\u03A4\u03C4]/g},
    {'base':'UPSILON','letters':/[\u03A5\u03C5]/g},
    {'base':'PHI','letters':/[\u03A6\u03C6]/g},
    {'base':'CHI','letters':/[\u03A7\u03C7]/g},
    {'base':'PSI','letters':/[\u03A8\u03C8]/g},
    {'base':'OMEGA','letters':/[\u03A9\u03C9]/g}


];
var changes;

module.exports.removeDiacritics = function(str) {
    if(!changes) {
        changes = defaultDiacriticsRemovalMap;
    }
    for(var i=0; i<changes.length; i++) {
        str = str.replace(changes[i].letters, changes[i].base);
    }
    return str;
}

module.exports.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};