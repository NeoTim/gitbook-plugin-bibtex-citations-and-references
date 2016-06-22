var bibtexParse = require('bibtex-parser-js');
var fs = require('fs');
var _ = require('lodash');

module.exports = {

    hooks: {
	init: function() {
            var bib = fs.readFileSync('literature.bib', 'utf8');
            this.bib = bibtexParse.toJSON(bib);
            this.bibCount = 0;
        }
    },

    blocks: {
	references: {
	    process: function(block) {
		var ret = 'REFERENCES WILL GO HERE!<br><br><hr>';
		for (var myprop in block) {
		    ret = ret + "<br>" + myprop + block[myprop];
		}
		retun ret;
	    }
	}
    },

    filters: {
	cite: function(key) {
	    var citation = _.find(this.book.bib, {'citationKey': key.toUpperCase()});
	    if (citation != undefined) {
                if (!citation.used) {
                    citation.used = true;
                    this.book.bibCount++;
                    citation.number = this.book.bibCount;
                }
		var ret = '';
		if (citation.author) {
		    ret = citation.author;
		} else if (citation.authors) {
		    ret = citation.authors;
		} else {
		    ret = "[Authors not found for citation: " + key + "]";
		}
                return ret;
            } else {
                return "[Citation not found for citation: " + key + "]";
            }
	},
	citeWithoutYear: function(key) { return "[Cite without year: " + key + "]"; },
	citeOnlyYear: function(key) { return "[Cite only year: " + key + "]"; },
    }
}
