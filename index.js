// Strongly influenced by https://github.com/leandrocostasouza/gitbook-plugin-bibtex

var fs = require('fs');
var path = require('path');
var util = require('util');
var bibtexParse = require('bibtex-parser');
var colors = require('colors');
// var bib2json = require('bib2json');

var refs;

var bibtex;

// Keep track for info logged to console
var totalInlineCites = 0;
var totalRefs = 0;

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
        totalRefs++;
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


function myCite(key, year) {

    var retCite;

    if (key !== undefined) {
        var citation = findBibEntryByKey(key);

        // console.log('.. '.magenta + "found citation with key: " + key);
        // console.log('.... '.magenta + "with citation: " + citation.toString);

        if (citation !== undefined) {

            if (!citation.used) {
                citation.used = true;
                this.bibCount++;
                citation.number = this.bibCount;
            
                addToRefs(citation);

                // Do not alter any string surrounded by { and }.
                if (checkDNA(citation.AUTHOR)) {
                    retCite = displayDNA(citation.AUTHOR) + (year ? " (" + citation.YEAR + ")" : "");
                } else {
                    retCite = citeAuthorsInline(citation.AUTHOR) + (year ? " (" + citation.YEAR + ")" : "");
                }
                
            } else {
                // console.log("!!!!!! citation not USED".red);
                retCite = undefined;
            }
        } else {
            // console.log("!!!!!! citation not FOUND".red);
            retCite = '[CITATION NOT FOUND: "' + key + '"]';
        }
    } else {
        // console.log("!!!!!! citation not SPECIFIED".red);
        retCite = '[CITATION NOT SPECIFIED]';
    }

    return retCite;
}


// This is for debugging purposes
function type(o) {
    var TYPES = {
        'undefined' : 'undefined',
        'number' : 'number',
        'boolean' : 'boolean',
        'string' : 'string',
        '[object Function]' : 'function',
        '[object RegExp]' : 'regexp',
        '[object Array]' : 'array',
        '[object Date]' : 'date',
        '[object Error]' : 'error'
    },
    TOSTRING = Object.prototype.toString;

    return TYPES[typeof o] || TYPES[toString.call(o)] || (o ? 'object' : 'null');
}


function citeAuthorsInline(auths) {
    totalInlineCites++;
    var regexAnd = /\s+and\s+/;
    var authors = [];
    authors = auths.split(regexAnd);
    // console.log(".. ".magenta + authors.length + "\t<- ".cyan, " found this many authors");
    var names = [];

    authors.forEach(function(entry) {
        names.push(nameInline(entry));
    });

    var ret = names.join(", ");
    return ret;
}


function refsAuthorsFromString(auths) {
    // Convert "John Smith and Davey Crocket and Linda Bateson"
    // to "Smith J, Crocket D, Bateson L".

    var regexAnd = /\s+and\s+/;
    var authors = [];
    authors = auths.split(regexAnd);
    var names = [];

    authors.forEach(function(entry) {
        names.push(nameInlineRefs(entry));
    });

    return names.join(", ");
}


function nameInlineRefs(name) {
    // Convert "Adam Smith" or "A Smith" to "Smith, A"
    // Ignore "names" that already contain a comma.

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


function findBibEntryByKey(key) {
    for (var e in bibtex) {

        // console.log("...... ".magenta + "Testing " + key.toString.blue + " against " + e.toString.blue);

        if (e.toUpperCase() === key.toUpperCase()) {
            return bibtex[e];
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
            console.log('Bibtex citations plugin...'.magenta);
            myInit();
        },

        finish: function() {
            console.log('.. '.magenta + totalInlineCites + "\t<- ".cyan + 'total number of inline citations');
            // console.log('.. '.magenta + totalRefs + "\t<- ".cyan + 'total number of references');
            console.log('.. '.magenta + refs.length + "\t<- ".cyan + 'total number of references');
            console.log('Finished generating bibtex citations.'.magenta);
        }
    },

    filters: {
        cite: function(key) {
            if (key !== undefined) {
                return myCite(key, true);
            } else {
                return undefined;
            }
        },
        citeNoYear: function(key) {
            if (key !== undefined) {
                return myCite(key, false);
            } else {
                return undefined;
            }
        },
        citeYearOnly: function(key) {
            // FIXME!
            return '1999';
        }
    },

    blocks: {
        references: {

            process: function(block) {

                var ret = '<ul>';               

                refs.forEach(function(r) {

                    // console.log("====> ".green + r.AUTHOR);

                    ret = ret + '<li>';

                    if (r.AUTHOR) {
                        if (checkDNA(r.AUTHOR)) {
                            ret = ret + displayDNA(r.AUTHOR) + ' ';
                        } else {
                            ret = ret + refsAuthorsFromString(r.AUTHOR) + ' ';
                        }
                    } else {
                        ret = ret + 'Unknown, ';
                    }
                    
                    if (r.YEAR) {
                        ret = ret + '(' + r.YEAR + '). ';
                    } else {
                        ret = ret + '(n.d.). ';
                    }
                    
                    if (r.TITLE) {
                        ret = ret + '<b>' + displayDNA(r.TITLE) + '.</b> ';
                    } else {
                        ret = ret + '<b>(Untitled.)</b> ';
                    }

                    if (r.JOURNAL) {
                        ret = ret + '<i>' + displayDNA(r.JOURNAL) + '</i>. ';
                    }
                        
                    if (r.VOLUME) {
                        ret = ret + '<b>' + r.VOLUME + '</b> ';
                    }
                        
                    if (r.ISSUE) {
                        if (r.VOLUME) {
                            ret = ret + '(' + r.ISSUE + ') ';
                        }
                    }
                        
                    if (r.PAGES) {
                        if (r.PAGES.match(/\-/)) { ret = ret + 'p'; }
                        ret = ret + 'p. ' + r.PAGES + '. ';
                    }
                        
                    if (r.URL) {
                        ret = ret + 'Available online at <a href="' + r.URL + '">' + r.URL + '</a>';
                    }

                    ret = ret + '</li>';

                });

                return ret;
            }
        }
    }
}
