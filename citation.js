let Cite = require('citation-js'); // This gets added to, so not a const
let bibtexJSON;

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
const opts = {
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
    // console.log(cite.get(opts));
    // return cite.get(opts);

    // FIXME -- NO LONGER REQUIRED SINCE citation-js v0.3.0-11
    // Workaround for bug in citation-js which destroys date information.
    // See https://github.com/larsgw/citation.js/issues/53
    // Don't look, it gets brutal below here.... :(
    // Use regexes to inject date. COuld probably do this far more
    // nicely, perhaps using proxyquire.

    // FIXME This won't correctly handle multiple refs with same
    // author(s) and year. Should output "2015a", "2015b" etc..?

    let raw = cite.get(opts).split(/\n|\r|\r\n/);

    let injected = [];

    trawlDivs:
    for (let r of raw) {
	let regex = /<div data\-csl\-entry\-id="([^"]+)"/g;
	let id = regex.exec(r);
	if (! id) { injected.push(r); continue trawlDivs; }
	if (! id[1]) { injected.push(r); continue trawlDivs; }
	id = id[1];

	// FIXME Replace with bibtexJSON.find(x => x.id == id)
	
	findMatchingBibtexEntry:
	for (let b of bibtexJSON) {
	    if (b.citationKey !== id) { continue findMatchingBibtexEntry; }

	    // Cannot use simple string matching since some chars may have been changed,
	    // for example ' -> " or `` etc.
	    // The following two strings have to match:
	    //   Ahoy 'hoy
	    //   Ahoy "hoy
	    // So swap non-alphnums for \. (brutal)

	    let year = b.entryTags.year ? b.entryTags.year : 'n.d.';
	    year = year.replace(/^{+/,'')
		.replace(/}+$/,'');

	    let title = b.entryTags.title;
	    title = title
		.replace(/^{+/,'')
		.replace(/}+$/,'')
		.replace(/[^A-Za-z0-9\s]/g,'.')
		.replace(/\s/g,'\\s+');
		// .toLowerCase();

	    let re = new RegExp(title, "i");
	    let originalTitle = re.exec(r);
	    r = r.replace(re, '(' + year + '). ' + originalTitle);

	    break findMatchingBibtexEntry;
	}
	injected.push(r);
    }

    return function() {
	let ret = '';
	for (let i of injected) {
	    if (i) {
		ret += i + "\n";
	    }
	}
	return ret;
    }();
}


function getItem(key) {
    if (key === undefined ) { return undefined; }
    let ret = bibtexJSON.find(x => x.citationKey.toLowerCase() === key.toLowerCase());
    return ret;
}

function formatAuthor(author) {
    // FIXME Apply CSL
    author = author.replace(/^{+/,'').replace(/}+$/,'');
    return author;
}

module.exports = {
    refs: refs,
    init: function() { myInit(); return true; },
    getItem: function(key) { return getItem(key) },
    formatAuthor: function(author) { return formatAuthor(author) },
    getCountRefs: function() { return bibtexJSON.length }
}
