// "use strict";

// require('babel-register');

// import 'babel-polyfill';

// Strongly influenced by https://github.com/leandrocostasouza/gitbook-plugin-bibtex
// Made possible by https://citation.js.org and https://github.com/fcheslack/citeproc-js-node

let Cite = require('./citation.js');
let util = require('util');
let colors = require('colors');

let citeCount = 0;

function myCite(key, yearBool, bracesBool, authorBool) {
    if (key === undefined) {
	return undefined;
    }
    let item = Cite.getItem(key);

    if (! item.entryTags || ! item) { return undefined; }

    let year = yearBool ? item.entryTags.year ? item.entryTags.year : '' : '';
    let leftBrace = bracesBool ? yearBool ? '(' : '' : '';
    let rightBrace = bracesBool ? yearBool ? ')' : '' : '';

    let author = Cite.formatAuthor(authorBool ? item.entryTags.author ? item.entryTags.author : '' : '');
    let ret = (author ? author + ' ' : '') + leftBrace + year + rightBrace;

    ret = ret.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\r|\n|\r\n/g, '');

    if (ret === '') {
	return undefined;
    }

    citeCount++;
    return ret;
}

module.exports = {
    hooks: {
	init: function init() {
	    console.log('Bibtex citations and references plugin...'.magenta);
            console.log('  Running in environment version ' + process.version);
	    return;
	},
	finish: function finish() {
	    String.prototype.rpad = function (padString, length) {
		// Just some fancy string padding
		let str = this;
		while (str.length < length) {
		    str = str + padString;
		}
		return str;
	    };
	    let refsCount = Cite.getCountRefs().toString();
	    citeCount = citeCount.toString();
	    let maxLen = refsCount.length >= citeCount.length ? refsCount.length : citeCount.length;

	    console.log('  ' + refsCount.rpad(' ', maxLen) + ' <--'.blue.bold + ' Number of references parsed.');
	    console.log('  ' + citeCount.rpad(' ', maxLen) + ' <--'.blue.bold + ' Number of citations generated.');
	    console.log('  Imagine typing all those manually! Phew!');
	    console.log('Finished generating bibtex citations and references.'.magenta);
	    return;
	}
    },

    filters: {
	// "Author A, Author B (2001)" i.e. standard inline citation.
	cite: function cite(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, true, true, true);
	},

	// "Author A, Author B, 2001" e.g. "See: Auth 1 2001; Auth 2 and A N Other 2002"
	citeNoBraces: function citeNoBraces(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, true, false, true);
	},

	// "Author A, Author B" e.g. "But Author later states..."
	citeNoYear: function citeNoYear(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, false, false, true);
	},

	// "(2001)" e.g. "...described in option A (2001) or option B (2002)"
	citeYearOnly: function citeYearOnly(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, true, true, false);
	},

	// "2001" e.g. "...as discussed in their work of 2001."
	citeYearOnlyNoBraces: function citeYearOnlyNoBraces(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, true, false, false);
	}
    },

    blocks: {
	references: {
	    process: function process(block) {
		if ((typeof block === 'undefined' ? 'undefined' : babelHelpers.typeof(block)) === undefined) {
		    throw Error('Function references expects one argument: block');
		}
		return Cite.refs();
	    }
	},
	refcsl: {
	    // This is deprecated. Fails silently for now.
	    process: function process(block) {
		return '';
	    }
	}
    }
};
