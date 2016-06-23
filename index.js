var fs = require('fs');
var bibtexParse = require('bibtex-parser');

var citeproc = require("citeproc-js-node");
var sys = new citeproc.simpleSys();

var styleString;
var langString;
var lang;
var engine;


var DEBUG = false;

var bibtext;


function deTexString(str, context, style) {
    // Attempt some brutal translation of the TeX string in a bibtex
    // object into plain text. Attempts some sensible defaults.
    // Context is used to determine behaviour.
    // Style is used to determine output style.
    // Returns a string or undef.

    if (str === undefined) {
        return undefined;
    }
    if (context === undefined) {
        context = "author";
    }
    if (style === undefined) {
        style = "default";
    }

    context = context.toLowerCase();
    style = style.toLowerCase();
    
    // Trim carriage returns etc
    // str = str.replace(/(\r\n|\n|\r)$/,"");

    // bibtex declares that strings wrapped in {} should not be altered.
    var regexDoNotAlter = /^[{](.+)[}]$/;

    // Authors should be separated by " and " e.g "Tom Jones and Katy Perry and Percy Smith".
    var regexSplitAuthors = "/ and /";

    // Set a flag:
    var doNotAlter = false;

    if (str.match(regexDoNotAlter)) {
        str = str.replace(regexDoNotAlter, '$1');
        doNotAlter = true;
    }

    // Alter the output based on context and style.
    if (context === "author") {
        if (style === "default") {
            str = str;
        }
    }
    if (context === "year") {
	if (style === "default") {
	    str = "(" + str + ")";
	}
    }

    return str;
}

function findBibEntryByKey(parsedBibtex, searchKey) {
    // Search the whole bibtex file for a citation key.
    // Since these should be unique, it stops at the first succesful match.
    // Returns a single bibtex object, or undef.
    if (parsedBibtex != undefined && searchKey != undefined) {
        for (var k in parsedBibtex) {
            if (k.toUpperCase() == searchKey.toUpperCase()) {
                if (Object.prototype.hasOwnProperty.call(parsedBibtex, k)) {
                    return parsedBibtex[k];
                }
            }
        }
    }
    return undefined;
}

function getBibDetail(bibObj, prop) {
    // Searches a single bibtex object for a property
    // e.g. year, author, etc.
    // Since these should be unique, it stops at the first succesful match.
    // Returns a single bibtex object, or undef.
    if (bibObj != undefined && prop != undefined) {
        for (var k in bibObj) {
            if (k.toUpperCase() == prop.toUpperCase()) {
                return bibObj[k];
            }
        }
    }
    return undefined;
}

module.exports = {

    hooks: {
        init: function() {

	    bibtex = bibtexParse(fs.readFileSync('literature.bib', 'utf8'));

            if (DEBUG) {
		var bibDetail = getBibDetail(findBibEntryByKey(bibtex, "Wallace2013"), "title");
                console.log("#####################################");
                console.log("# Got bib detail: " + bibDetail);
                console.log("#####################################");
                console.log("# Got sensible string: " + deTexString(bibDetail, "author", "default"));
                console.log("#####################################");
            }
            // this.bib = bp;
            this.bibCount = 0;

	    // FIXME Implement CSL stuff!
	    // See https://github.com/citation-style-language/ and https://github.com/citation-style-language/locales
	    // There are hundreds of possible languages and styles.
	    // FIXME Should be selectable in options.
	    // FIXME Should I clone them all into this plugin, or download dynamically??
	    langString = 'en-GB';
	    lang = fs.readFileSync('./csl/locales/locales-' + langString + '.xml', 'utf8');
	    sys.addLocale(langString, lang);

	    styleString = fs.readFileSync('./csl/styles/harvard-imperial-college-london.csl', 'utf8');
	    engine = sys.newEngine(styleString, langString, null);
        }
    },

    blocks: {
        references: {
            process: function(block) {
                var ret = 'REFERENCES WILL GO HERE!<br><br><hr>Debugging info below (you were warned, the plugin gitbook-plugin-bibtex-citations-and-references is ALPHA! :)<br>';
                ret = ret + block;
                return ret;
            }
        }
    },

    filters: {
        cite: function(key) {
            // var citation = _.find(this.bib, {'citationKey': key.toUpperCase()});
            // return "<pre>DEBUG: Seeking key: " + key + "\n\n... inside... \n\n" + "</pre>";
            var citation = findBibEntryByKey(bibtex, key.toUpperCase());
            var ret;

            if (citation != undefined) {
                if (!citation.used) {
                    citation.used = true;
                    this.bibCount++;
                    citation.number = this.bibCount;
                }

		if (citation.AUTHOR) {
                    ret = deTexString(citation.AUTHOR, "author", "default");
                } else {
                    ret = "[Author not found for key: " + key + "]";
                }

		if (citation.YEAR) {
		    ret = ret + " " + deTexString(citation.YEAR, "year", "default");
		}

                return ret;

            } else {
		return "[Citation not found for key: " + key + "]";
            }
        },

        citeWithoutYear: function(key) {
            return "[Cite without year: " + key + "]";
        },

        citeOnlyYear: function(key) {
            return "[Cite only year: " + key + "]";
        },
    }
}
