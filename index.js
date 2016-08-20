// Strongly influenced by https://github.com/leandrocostasouza/gitbook-plugin-bibtex

var fs = require('fs');
var path = require('path');
var util = require('util');
var bibtexParse = require('bibtex-parser');
// var bib2json = require('bib2json');

var refs;

function myInit() {
    // bibtex = bib2json(fs.readFileSync('literature.bib','utf8'));
    bibtex = bibtexParse(fs.readFileSync('literature.bib','utf8'));
    this.bibCount = 0;
    refs = [];
}


function addToToc(file, num) {
    if (file !== undefined) {
	return '<a href="' + file + '.html#cite-' + num + '">[' + num + ']</a>';
    } else {
	return '<a href="#cite-' + num + '">[' + num + ']</a>';
    }
}


function addToRefs(citation) {
    if (citation.AUTHOR || citation.TITLE || citation.URL) {
	refs.push(citation);
    }
}


function checkDNA(str) {
    var regexDNA = /^[{](.*?)[}]$/;
    if (str.match(regexDNA)) {
	return true;
    }
    return false;
}


function displayDNA(str) {
    var regexDNA = /^[{](.*?)[}]$/;
    if (str.match(regexDNA)) {
	str = str.replace(/^[{]/, '').replace(/[}]$/, '');
    }
    return str;
}


function myCite(key) {
    if (key !== undefined) {
	var citation = findBibEntryByKey(bibtex, key);

	if (citation !== undefined) {
	    
	    if (!citation.used) {
		citation.used = true;
		this.bibCount++;
		citation.number = this.bibCount;
	    
		var auth = citation.AUTHOR;
		
		// Do not alter any string surrounded by { and }.
		if (checkDNA(auth)) {
		    return displayDNA(auth) + " (" + citation.YEAR + ")";
		}
		
		/*
		  var tocFile = undefined;
		  try {
		      tocFile = this.options.pluginsConfig.bibtex.tocfile;
		  } catch (e) {
		      // ...?
		  }
		  addToToc(tocFile, citation.number);
		*/
	    
		addToRefs(citation); // FIXME THe refs are huge and full of errors :(
		
		var r = citeAuthorsInline(auth) + " (" + citation.YEAR + ")";
		return r;
	    } else {
		return undefined;
	    }
	} else {
	    return '[CITATION NOT FOUND: "' + key + '"]';
	}
    } else {
	return '[CITATION NOT SPECIFIED]';
    }
}

function citeAuthorsInline(auths) {
    // FIXME This is causing stack overflow?? :(
    return auths;

    var regexAnd = /\s+and\s+/;
    var authors = [];
    authors = auths.split(regexAnd);
    var names = [];
    for (var i in authors) {
	var a = authors[i];
	var b = nameInline(a);
	names.push(b);
    }
    return names.join(", ");
}


function refsAuthorsFromString(auths) {

    return auths; // FIXME

    var regexAnd = /\s+and\s+/;
    var authors = [];
    authors = auths.split(regexAnd);
    var names = [];
    for (var i in authors) {
	var a = authors[i];
	var b = nameInlineRefs(a);
	names.push(b);
    }
    return names.join(", ");
}


function nameInlineRefs(name) {
    // Convert "Adam Smith" or "A Smith" to "Smith, A"
    if (typeof name === 'string') {
	var regexSpace = /\s+/;
	var regexComma = /,/;
	if (! name.match(regexComma)) {
	    var r = name.split(regexSpace);
	    r[0] = r[0].substring(0,1);
	    r.reverse();
	    name = r.join(' ');
	}
    }
    return name;
}


function nameInline(name) {
    // Convert "Smith, A" to "A Smith"

    return name; // FIXME

    if (typeof name === 'string') {
	var regexComma = /,/;
	var n = '';
	if (name.match(regexComma)) {
	    var r = name.split(regexComma);
	    r.reverse();
	    n = r.join(' ');
	    // Convert "A Smith" (or "Adam Smith") to "Smith"
	    var all = n.split(/\s+/);
	    return all[all.length-1];
	}
    }
    return name;
}


function findBibEntryByKey(bib, key) {
    for (var e in bib) {
	if (e.toUpperCase() === key.toUpperCase()) {
	    return bib[e];
	}
    }
    /*
    for(var i in bibtex.entries) {
	if (bibtex.entries[i].EntryKey.toUpperCase() === key.toUpperCase()) {
	    return bibtex.entries[i].Fields;
	}
    }
    */
    return undefined;
}

module.exports = {
    hooks: {
        init: function() {
	    myInit();
	}
    },

    filters: {
	cite: function(key) {
	    if (key !== undefined) {
		return myCite(key);
	    } else {
		return undefined;
	    }
	}
    },

    blocks: {
	references: {

	    process: function(block) {

		var ret = '<ul>';
		
		for (var r in refs) {
		    
		    if (refs[r].AUTHOR || refs[r].TITLE) {
			
			ret = ret + '<li>';
			
			if (refs[r].AUTHOR) {
			    ret = ret + refsAuthorsFromString(refs[r].AUTHOR) + ', ';
			} else {
			    ret = ret + 'Unknown, ';
			}
			
			if (refs[r].YEAR) {
			    ret = ret + '(' + refs[r].YEAR + '). ';
			} else {
			    ret = ret + '(n.d.). ';
			}
			
			if (refs[r].TITLE) {
			    ret = ret + '<b>' + displayDNA(refs[r].TITLE )+ '.</b> ';
			} else {
			    ret = ret + '<b>(Untitled.)</b> ';
			}
			
			if (refs[r].JOURNAL) {
			    ret = ret + '<i>' + displayDNA(refs[r].JOURNAL) + '</i>. ';
			}
			
			if (refs[r].VOLUME) {
			    ret = ret + '<b>' + refs[r].VOLUME + '</b> ';
			}
			
			if (refs[r].ISSUE) {
			    if (refs[r].VOLUME) {
				ret = ret + '(' + refs[r].ISSUE + ') ';
			    }
			}
			
			if (refs[r].PAGES) {
			    if (refs[r].PAGES.match(/\-/)) { ret = ret + 'p'; }
			    ret = ret + 'p. ' + refs[r].PAGES + '. ';
			}
			
			if (refs[r].URL) {
			    ret = ret + 'Available online at <a href="' + refs[r].URL + '">' + refs[r].URL + '</a>';
			}
			
			ret = ret + "\n";
		    }
		    ret = ret + '</li>' + "\n";
		}
		return ret;
	    }
	}
    }
}
