let Cite = require('citation-js');
let bibtexJSON;

// Number before "et al" in inline citations.
// More than this results in "Author A et al"
// Fewer results in "Author A, Author B and Author C"
// or "Author A and Author B" or "Author A".
// FIXME should be an arg/preference
const etAl = 3;

const basicParse = require('bibtex-parse-js');
const util = require('util');
const fs = require('fs');
const path = require('path');
const cite = new Cite();
const styleName = 'apa-local'; // FIXME Pass as arg.

// FIXME en-GB not supported by citation-js
// see https://github.com/larsgw/citation.js/issues/40
const localeName = 'en-US'; 

const styleCSL = myReadFile(__dirname + '/assets/csl/styles/' + styleName + '.csl','utf8');
const localeXML = myReadFile(__dirname + '/assets/csl/locales/locales-' + localeName + '.xml','utf8');

let opts = {
    type: 'string',
    style: 'citation-' + styleName,
    template: styleCSL
};

function myReadFile(n,t) {
    if (!n || !t) { throw 'Need filename and encoding type'; }
    try {
	return fs.readFileSync(n,t);
    } catch(e) { throw e; }
}

function myInit() {

    // FIXME Is it really necessary to use global.process.env.PWD here?
    let bibtex = myReadFile(path.join(global.process.env.PWD, 'literature.bib'),'utf8');
    bibtexJSON = basicParse.toJSON(bibtex);

    // Note:
    // Bibtex format allows use of {{ }} or "{ }" to indicate items
    // that must not be decomposed, i.e. must be reproduced verbatim.
    // Unfortunately citation-js does not seem to spot this currently.
    // See https://github.com/larsgw/citation.js/issues/54
    // bibtex-parse-js strips outer { } but leaves inner { }.
    // So parse each item, use cite.add() to re-add them, taking advantage
    // of cite.data[].author = [{ literal: <author-details> }]
    // citation-js only has a literal type for authors right now.

    let count = 0;
    let literal = { author: false };

    checkAllItems:
    for (let item in bibtexJSON) {
	if (! bibtexJSON.hasOwnProperty(item)) { continue checkAllItems; }

	let bibstring = '@';
	bibstring += bibtexJSON[item].entryType + '{';
	bibstring += bibtexJSON[item].citationKey + ',' + "\n";
	let entryTags = bibtexJSON[item].entryTags;

        if (! entryTags) { continue checkAllItems; }

	let year;

	checkAllTags:
	for (let key in entryTags) {
	    if (! entryTags.hasOwnProperty(key)) { continue checkAllTags; }
	    let val = entryTags[key];

	    if (/^author$/i.test(key) && /^{/.test(val)) {
		literal.author = val;
                literal.author = literal.author.replace(/^{+/,'');
		literal.author = literal.author.replace(/}+$/,'');
	    }
            bibstring += '  ' + key + ' = {' + val + "},\n";
	    if (key == 'year') { year = val; }
	}
	bibstring += '}' + "\n";

	cite.add(bibstring);

	if (literal.author !== false) {
	    cite.data[count].author = [{ literal: literal.author }];
	    literal.author = false;
	}

	if (year) {
	    cite.data[count].issued = [{ 'date-parts': [ year ] }];
	}

	count++;
    }
}

function refs() {
    myInit();
    opts.type = 'html';
    return cite.get(opts);
}

function getItem(key) {
    if (key === undefined ) { return undefined; }
    let ret = bibtexJSON.find(x => x.citationKey.toLowerCase() === key.toLowerCase());
    return ret;
}

function formatAuthor(author) {
    // FIXME Apply CSL
    if (/^{+/.test(author)) {
        author = author.replace(/^{+/,'').replace(/}+$/,'');
        return author;
    }
    author = author.replace(/^{+/,'').replace(/}+$/,'');

    if (! / and /i.test(author)) { return formatNameToInline(author); }
    let ret = [];
    let auths = author.split(/ and /i);
    if (auths.length > etAl) {
        return formatNameToInline(auths[0]) + ' et al';
    }

//     auths.forEach((a) => {
//         ret.push(formatNameToInline(a))
//     });
    ret = auths.slice(0,etAl);

    var retString = formatNameToInline(ret.pop());
    if (ret.length > 0) {
        retString = formatNameToInline(ret.pop()) + ' and ' + retString;
        while ((a = ret.pop()) !== undefined) {
            retString = formatNameToInline(a) + ', ' + retString;
        }
    }
    return retString;
}

function formatNameToInline(name) {
    let alreadyReversed = false;
    if (/,/.test(name)) { alreadyReversed = true; }
    name.replace(',','');
    let names = name.split(/\s+/);
    if (alreadyReversed) {
        return names[0]; // + ' ' + names[names.length - 1].charAt(0);
    }
    return names[names.length -1]; // + ' ' + names[0].charAt(0);
}

module.exports = {
    refs: refs,
    init: function() { myInit(); return true; },
    getItem: function(key) { return getItem(key) },
    formatAuthor: function(author) { return formatAuthor(author) },
    getCountRefs: function() { return bibtexJSON.length }
}
