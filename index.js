// Strongly influenced by https://github.com/leandrocostasouza/gitbook-plugin-bibtex

var fs = require('fs');
var path = require('path');
var util = require('util');
var bibtexParse = require('bibtex-parser');
var colors = require('colors');
var b = require("bibtex-to-csl-json");
var refs;
var bibtex;

// Keep track for info logged to console
var totalInlineCites = 0;

var maxAuthorsInline = 3; // This many or more will be contracted to "First-Author et al"

function myInit() {
    bibtex = bibtexParse(fs.readFileSync('literature.bib','utf8'));
    this.bibCount = 0;
    refs = {};
}


/*
function addToToc(file, num) {
    if (file !== undefined) {
        return '<a href="' + file + '.html#cite-' + num + '">[' + num + ']</a>';
    } else {
        return '<a href="#cite-' + num + '">[' + num + ']</a>';
    }
}
*/


function addToRefs(citation) {
    if (citation.number && !refs[citation.number]) {
	// console.log("==> ".magenta + "Added citation number ".green + citation.number);
	refs[citation.number] = citation;
    } else {
	// console.log("==> ".red + "Did NOT add citation number ".green + citation.number);
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


function myCiteYearOnly(key, braces) {

    var retCite = '';

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

	    }

	    var leftbrace = (braces ? "(" : "");
	    var rightbrace = (braces ? ")" : "");

	    if (citation.YEAR) {
		retCite = leftbrace + citation.YEAR + rightbrace;
	    }
	}
    }

    return retCite;
}

function myCite(key, year, braces) {

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
	    }

            addToRefs(citation);

	    var leftbrace = (braces ? "(" : "");
	    var rightbrace = (braces ? ")" : "");

            // Do not alter any string surrounded by { and }.
            if (checkDNA(citation.AUTHOR)) {
                retCite = displayDNA(citation.AUTHOR) + (year ? " " + leftbrace + citation.YEAR + rightbrace : "");
            } else {
                retCite = citeAuthorsInline(citation.AUTHOR) + (year ? " " + leftbrace + citation.YEAR + rightbrace : "");
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
        names.push(inlineAuthorSurname(entry));
    });

    var ret;

    // Contract to "et al" if necessary
    if (names.length >= maxAuthorsInline) {
	// names[0] = inlineAuthorSurame(names[0]);
	ret = names[0] + " et al"
    } else {
	// FIXME use inlineAuthorSurname() to convert name formats
	if (names.length === 2) {
	    ret = names.join(" and ");
	} else {
	    ret = names.join(", ");
	}
    }
    return ret;
}


function refsAuthors(auths) {
    // Convert "John Smith and Davey Crocket and Linda Bateson"
    // to "Smith J, Crocket D, Bateson L".

    var regexAnd = /\s+and\s+/;
    var authors = [];
    authors = auths.split(regexAnd);
    var names = [];

    authors.forEach(function(entry) {
        names.push(inlineAuthorSurnameAndInitial(entry));
    });

    return names.join(", ");
}


function inlineAuthorSurname(name) {
    // Convert "Adam Smith" or "A Smith" or "Smith, A" to "Smith"

    if (typeof name === 'string') {
        var regexSpace = /\s+/;
        var regexComma = /,/;
        var r = name.split(regexSpace);

	// If it contains a comma it's probably already in reverse order
	if (! name.match(regexComma)) {
            r.reverse();
	}
        name = r[0];
    }
    return name;
}



function inlineAuthorSurnameAndInitial(name) {
    // Convert "Adam Smith" or "A Smith" or "Smith, A" to "Smith A"

    if (typeof name === 'string') {
        var regexSpace = /\s+/;
        var regexComma = /,/;
        var r = name.split(regexSpace);

	// If it contains a comma it's probably already in reverse order
	if (! name.match(regexComma)) {
            r.reverse();
	}
        name = r[0] + " " + r[r.length-1].substr(0,1);
    }
    return name;
}


function trimCruft(s) {
    s = s.replace(/\s+$/, "");
    s = s.replace(/\.+$/, "");
    return s;
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
            console.log('Bibtex citations and references plugin...'.magenta);
            myInit();
        },

        finish: function() {
            console.log('.. '.magenta + totalInlineCites + "\t<- ".cyan + "total number of inline citations you didn't have to fiddle with!");
            console.log('.. '.magenta + Object.keys(refs).length + "\t<- ".cyan + "total number of references you didn't have to edit repeatedly!");
            console.log('Finished generating bibtex citations and references.'.magenta);
        }
    },

    filters: {
        cite: function(key) {
            if (key !== undefined) {
                return myCite(key, true, true);
            } else {
                return undefined;
            }
        },
        citeNoBraces: function(key) {
            if (key !== undefined) {
                return myCite(key, true, false);
            } else {
                return undefined;
            }
        },
        citeNoYear: function(key) {
            if (key !== undefined) {
                return myCite(key, false, true);
            } else {
                return undefined;
            }
        },
        citeNoYearNoBraces: function(key) {
            if (key !== undefined) {
                return myCite(key, false, false);
            } else {
                return undefined;
            }
        },
        citeYearOnly: function(key) {
            if (key !== undefined) {
                return myCiteYearOnly(key, true);
            } else {
                return undefined;
            }
        },
        citeYearOnlyNoBraces: function(key) {
            if (key !== undefined) {
                return myCiteYearOnly(key, false);
            } else {
                return undefined;
            }
        }
    },

    blocks: {

        references: {

            process: function(block) {

                var ret = '<ul class="b2cj-references">';

		for (var key in refs) {
		    var r = refs[key];

                    // console.log("====> ".green + util.inspect(r,true,null,true).blue);

		    // FIXME Build this using an array instead of concatenating strings.
		    // FIXME Sort the list by author names!
		    // FIXME Get rid of horrible nested ifs.
		    
                    ret = ret + '<li class="b2cj-ref-item" id="b2cj-ref-item-' + r.number + '">';

                    if (r.AUTHOR) {
                        if (checkDNA(r.AUTHOR)) {
                            ret = ret + displayDNA(r.AUTHOR) + ' ';
                        } else {
                            ret = ret + refsAuthors(trimCruft(r.AUTHOR)) + ' ';
                        }
                    } else {
                        ret = ret + 'Unknown ';
                    }
		    
                    if (r.YEAR) {
                        ret = ret + '(' + trimCruft(r.YEAR) + '). ';
                    } else {
                        ret = ret + '(n.d.). ';
                    }
		    
                    if (r.TITLE) {
			if (checkDNA(r.TITLE)) {
                            ret = ret + '<b>' + displayDNA(r.TITLE) + '</b> ';
			} else {
                            ret = ret + '<b>' + trimCruft(r.TITLE) + '</b> ';
			}
		    } else {
                        ret = ret + '<b>(Untitled.)</b> ';
                    }
		    
                    if (r.JOURNAL) {
			if (checkDNA(r.JOURNAL)) {
                            ret = ret + '<i>' + displayDNA(r.JOURNAL) + '</i>. ';
			} else {
                            ret = ret + '<i>' + trimCruft(r.JOURNAL) + '</i>. ';
			}
                    }
		    
                    if (r.VOLUME) {
			if (checkDNA(r.VOLUME)) {
                            ret = ret + '<b>' + displayDNA(r.VOLUME) + '</b>';
			} else {
			    ret = ret + '<b>' + trimCruft(r.VOLUME) + '</b>';
			}
			if (! r.NUMBER) {
			    ret = ret + ' ';
			}
                    }
		    
                    if (r.NUMBER) {
			if (checkDNA(r.NUMBER)) {
                            ret = ret + '(' + displayDNA(r.NUMBER) + ')';
			} else {
                            ret = ret + '(' + trimCruft(r.NUMBER) + ')';
			}
			if (r.PAGES) {
			    ret = ret + '.';
			}
			ret = ret + ' ';
                    }
		    
                    if (r.PAGES) {
			if (r.PAGES.match(/\-/)) { ret = ret + 'p'; }
			if (checkDNA(r.PAGES)) {
                            ret = ret + 'p.' + displayDNA(r.PAGES) + '. ';
			} else {
                            ret = ret + 'p.' + trimCruft(r.PAGES) + '. ';
			}
                    }
		    
                    if (r.URL) {
                        ret = ret + 'Available online at <a href="' + r.URL + '">' + r.URL + '</a>';
                    }
		    
                    ret = ret + '</li>' + "\n\n";
		    
                };
	    
		return "\n\n" + ret + "\n\n";
            }
        },
	
	refcsl: {
	    process: function(block) {
		// FIXME Warning -- do not use this function yet! Very much ALPHA QUALITY :)
		var cslJson, bibliography, bibfile, lang, localesfiles, cslfile;

		// Read vars, use defaults if necessary
		bibfile = block.args[0] ? block.args[0] : "./literature.bib";
		lang = block.args[1] ? block.args[1] : "en-GB";
		localesfile = block.args[2] ? block.args[2] : "./assets/csl/locales/locales-en-GB.xml";
		cslfile = block.args[3] ? block.args[3] : "./assets/csl/styles/harvard-imperial-college-london.csl";

		var b2cj = b.b2cj(bibfile, lang, localesfile, cslfile);
		// console.log(util.inspect(b2cj,true,null,true));

		var ret = "";
		// cslJson = (typeof b2cj[0] !== "undefined" && b2cj[0].csljson) ? b2cj[0].csljson : undefined;
		ret = b2cj.bibliography[0].bibstart;
		b2cj.bibliography[1].forEach(function(entry) {
		    ret += entry;
		});
		ret += b2cj.bibliography[0].bibend;
		return ret;
	    }
	}
    }
}
