// Strongly influenced by https://github.com/leandrocostasouza/gitbook-plugin-bibtex
// Made possible by https://citation.js.org and https://github.com/fcheslack/citeproc-js-node

const util = require('util');
const colors = require('colors');
const fs = require('fs');
const citer = require('./citation.js');

let citeCount = 0;

function myCite(key, yearBool, bracesBool, authorBool) {
    if (key === undefined) {
	return undefined;
    }
    let item = citer.getItem(key);

    if (item === undefined) { return ''; }
    if (item.entryTags === undefined) { return ''; }

    let leftBrace = bracesBool ? (yearBool ? '(' : false) : '';
    let rightBrace = bracesBool ? (yearBool ? ')' : false) : '';

    let year = '';
    if (item.entryTags.year !== undefined) {
        year = yearBool ? item.entryTags.year : '';
    }

    let author;
    if (item.entryTags.author !== undefined) {
        author = authorBool ? citer.formatAuthor(item.entryTags.author) : undefined;
    }

    let ret = (author ? author + ' ' : '') + leftBrace + year + rightBrace;

    ret = ret.replace(/^\s+/, '').replace(/\s+$/, '').replace(/\r|\n|\r\n/g, '');

//    if (ret === '') {
//	return undefined;
//    }

    citeCount++;
    return ret;
}

module.exports = {
    hooks: {
	init: function() {
            citer.init();
	    console.log('Bibtex citations and references plugin...'.magenta);
            console.log('  Running in Node version ' + process.version + ' -- must be at least v6');
	    return;
	},
	finish: function() {
	    String.prototype.rpad = function (padString, length) {
		// Just some fancy string padding
		let str = this;
		while (str.length < length) {
		    str = str + padString;
		}
		return str;
	    };
	    let refsCount = citer.getCountRefs().toString();
	    citeCount = citeCount.toString();
	    let maxLen = refsCount.length >= citeCount.length ? refsCount.length : citeCount.length;

	    console.log('  ' + refsCount.rpad(' ', maxLen) + ' <--'.cyan + ' Number of references parsed.');
	    console.log('  ' + citeCount.rpad(' ', maxLen) + ' <--'.cyan + ' Number of citations generated.');
	    console.log('  Imagine typing all those manually! Phew!');
	    console.log('Finished generating bibtex citations and references.'.magenta);
	    return;
	}
    },

    filters: {
	// "Author A, Author B (2001)" i.e. standard inline citation.
	cite: function(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, true, true, true);
	},

	// "Author A, Author B, 2001" e.g. "See: Auth 1 2001; Auth 2 and A N Other 2002"
	citeNoBraces: function(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, true, false, true);
	},

	// "Author A, Author B" e.g. "But Author later states..."
	citeNoYear: function(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, false, false, true);
	},

	// "(2001)" e.g. "...described in option A (2001) or option B (2002)"
	citeYearOnly: function citeYearOnly(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, true, true, false);
	},

	// "2001" e.g. "...as discussed in their work of 2001."
	citeYearOnlyNoBraces: function(key) {
            if (key == undefined) { return undef; }
	    return myCite(key, true, false, false);
	}
    },

    blocks: {
	references: {
	    process: function(block) {
		if (typeof block === undefined) {
		    throw Error('Function references expects one argument: block');
		}
		return citer.refs();
	    }
	},
	refcsl: {
	    // This is deprecated. Fails silently for now.
	    process: function(block) {
                console.error("  Block function 'refcsl' is deprecated, please use 'references' instead.".red);
		return '';
	    }
	}
    }
};
