var fs = require('fs');
var path = require('path');
// var glob = require('glob');
var util = require('util');
var bibtexParse = require('bibtex-parser');
var bibtexParseJSON = require('bibtex-parser-js');
var bib2json = require('bib2json');
// var citeproc = require('citeproc-js-node');

myInit();
console.log(cite("InstMed2001"));
console.log(cite("Wallace2013"));
console.log(cite("Glasziou2011"));

function myInit() {
    // FIXME If only this worked :(
    // var locales = fs.readFileSync(glob.sync(path.join('./assets/csl/locales/', 'locales-*.xml'))[0].toString(), 'utf8');
    // var styles  = fs.readFileSync(glob.sync(path.join('./assets/csl/styles/',  '*.csl'))[0].toString(), 'utf8');
    // var sys = new citeproc.simpleSys();

    // bibtex = bib2json(fs.readFileSync('literature.bib','utf8'));
    bibtex = bibtexParse(fs.readFileSync('literature.bib','utf8'));
}

function cite(key) {
    var citation = findBibEntryByKey(bibtex, key);
    var auth = citation.AUTHOR;

    // Do not alter any string surrounded by { and }.
    var regexDNA = /^[{](.*?)[}]$/;
    if (auth.match(regexDNA)) {
	auth = auth.replace(/^[{]/, '').replace(/[}]$/, '');
	return auth + " (" + citation.YEAR + ")";
    }

    var r = citeAuthorsInline(auth) + " (" + citation.YEAR + ")";
    return r;
}

function citeAuthorsInline(auths) {
    var regexAnd = /\s+and\s+/;
    var authors = [];
    authors = auths.split(regexAnd);
    var names = [];
    for (var i in authors) {
	names.push(nameInline(authors[i]));
    }
    return names.join(", ");
}

function nameInline(name) {
    // Convert "Smith, A" to "A Smith"
    var regexComma = /,/;
    var n = '';
    if (name.match(regexComma)) {
	var r = name.split(regexComma);
	r = r.reverse;
	n = r.join(' ');
	name = n;
    }
    // Convert "Adam Smith" to "Smith"
    var all = name.split(/\s+/);
    return all[all.length-1];
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
	    cite(key);
	}
    }
}
