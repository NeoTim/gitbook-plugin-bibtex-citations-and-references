var Cite = require('./citation.js');
var util = require('util');
var colors = require('colors');


function myInit() {}
function stub() { return '[citation]'; }

module.exports = {
    hooks: {
	init: function() {
	    console.log('Bibtex citations and references plugin...'.magenta);
	    myInit;
	},
	finish: function() {
	    console.log('Finished generating bibtex citations and references.'.magenta);
	}
    },

    filters: {
	cite: function(key) { return stub(); },
	citeNoBraces: function(key) { return stub(); },
	citeNoYear: function(key) { return stub(); },
	citeNoYearNoBraces: function(key) { return stub(); },
	citeYearOnly: function(key) { return stub(); },
	citeYearOnlyNoBraces: function(key) { return stub(); },
    },

    blocks: {
	references: {
	    process: function(block) {
		if (typeof block === undefined) {
		    throw Error('Function references expects one argument: block');
		}
		var r = Cite.refs;
		return r;
	    }
	},
	refcsl: {
	    process: function(block) {
		return '[deprecated]';
	    }
	}
    }
}
