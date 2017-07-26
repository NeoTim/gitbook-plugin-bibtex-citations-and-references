var Cite = require('citation-js');
var basicParse = require('bibtex-parse-js');
var fs = require('fs');
var util = require('util');

var bibtex,
    styleName,
    styleCSL,
    localeName,
    localeXML,
    cite,
    cite2,
    opts,
    basicBibtex;


function myInit() {
    styleName = 'water-science-and-technology-patched';
    localeName = 'en-US'; // FIXME en-GB not supported by citation-js
    try { bibtex = fs.readFileSync('literature.bib','utf8'); } catch(e) { throw e; }
    try { styleCSL = fs.readFileSync('assets/csl/styles/' + styleName + '.csl','utf8'); } catch(e) { throw e; }
    try { localeXML = fs.readFileSync('assets/csl/locales/locales-' + localeName + '.xml','utf8'); } catch(e) { throw e; }

    // cite = new Cite();
    // cite.set(bibtex);

    // console.log(util.inspect(cite,true,null,true));

    opts = {
	format: 'string',
	type: 'string',
	style: 'citation-harvard1',
	style: 'citation-apa',
	style: 'citation-vancouver',
	lang: 'en-US'
    }

    // Go through each entry
    // If it has { } then add it as a literal.
    // Otherwise add it as it is.

    // Ditto with dates

    cite = new Cite();
    var json = basicParse.toJSON(bibtex);
    // console.dir(json);

    // Items that should be literals if they are surrounded in {{ }}
    var literal = { author: false, journal: false, publisher: false, title: false };
	    

    var count = 0;
    for (var item in json) {
	if (json.hasOwnProperty(item)) {
	    // console.dir(json[item]);
	    // console.log("===================");

	    var bibstring = '@';
	    bibstring += json[item].entryType + '{';
	    bibstring += json[item].citationKey + ',' + "\n";
	    var entryTags = json[item].entryTags;
	    for (var key in entryTags) {
		if (entryTags.hasOwnProperty(key)) {
		    var val = entryTags[key];
		    // bibtex parser strips outer { } but leaves inner { }
		    if (/^author$/i.test(key)) {
			if (/^{+/.test(val)) {
			    val = val.replace(/^{+/,'');
			    val = val.replace(/}+$/,'');
			    literal.author = val;
			}
		    }
		    bibstring += '  ' + key + ' = ' + val + ",\n";
		}
	    }
	    bibstring += '}' + "\n";

	    cite.add(bibstring);
	    
	    if (literal.author !== false) {
		cite.data[count].author = [{ literal: literal.author }];
		literal.author = false;
	    }

	    count++;
	}
	// console.log(bibstring + "\n=======================\n");
    }
}

function get() {

    myInit();
    return cite.get(opts);
    // console.log(cite2.get(opts));
}

module.exports = {
    get: get()
}
