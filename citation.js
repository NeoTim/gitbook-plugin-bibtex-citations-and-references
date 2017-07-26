var Cite = require('citation-js');
var basicParse = require('bibtex-parse-js');
var fs = require('fs');
var util = require('util');

var bibtex,
    styleName,
    styleCSL,
    localeName,
    localeXML,
    cite,
    opts,
    bibtexJSON;


function myInit() {
    styleName = 'apa-local';
    localeName = 'en-US'; // FIXME en-GB not supported by citation-js
    try { bibtex = fs.readFileSync('literature.bib','utf8'); } catch(e) { throw e; }
    try { styleCSL = fs.readFileSync('assets/csl/styles/' + styleName + '.csl','utf8'); } catch(e) { throw e; }
    try { localeXML = fs.readFileSync('assets/csl/locales/locales-' + localeName + '.xml','utf8'); } catch(e) { throw e; }

    opts = {
	type: 'string',
	style: 'citation-' + styleName,
	template: styleCSL
    }

    cite = new Cite();
    bibtexJSON = basicParse.toJSON(bibtex);

    var count = 0;

    var literal = { author: false };

    checkAllItems:
    for (var item in bibtexJSON) {
	if (! bibtexJSON.hasOwnProperty(item)) { continue checkAllItems; }

	var bibstring = '@';
	bibstring += bibtexJSON[item].entryType + '{';
	bibstring += bibtexJSON[item].citationKey + ',' + "\n";
	var entryTags = bibtexJSON[item].entryTags;

	var year;

	checkAllTags:
	for (var key in entryTags) {
	    if (! entryTags.hasOwnProperty(key)) { continue checkAllTags; }
	    var val = entryTags[key];
	    // FIXME Figure out a way to prevent citation-js from diddling with other fields, if necessary.
	    // bibtex-parse-js strips outer { } but leaves inner { }
	    // citation-js removes all { } surrounding items
	    // Citation-js only has a literal type for authors right now.
	    if (/^author$/i.test(key) && /^{/.test(val)) {
		val = val.replace(/^{+/,'');
		val = val.replace(/}+$/,'');
		literal.author = val;
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

    var injected = [];

    opts.type = 'html';

    // FIXME
    // Don't look, it gets brutal below here.... :(
    // citation-js appears to have a bug which destroys date information.
    // Use regexes to inject date.

    var raw = cite.get(opts).split(/\n|\r|\r\n/);

    trawlDivs:
    for (let r of raw) {
	var regex = /<div data\-csl\-entry\-id="([^"]+)"/g;
	var id = regex.exec(r);
	if (! id) { injected.push(r); continue trawlDivs; }
	if (! id[1]) { injected.push(r); continue trawlDivs; }
	id = id[1];

	findMatchingBibtexEntry:
	for (let b of bibtexJSON) {
	    if (b.citationKey !== id) { continue findMatchingBibtexEntry; }

	    // Ugh. Some chars may have been changed, for example ' -> "
	    // Yet the following two strings have to match:
	    //   Ahoy 'hoy
	    //   Ahoy "hoy

	    var year = b.entryTags.year ? b.entryTags.year : 'n.d.';
	    year = year.replace(/^{+/,'')
		.replace(/}+$/,'');
	    
	    var title = b.entryTags.title;
	    title = title.replace(/^{+/,'')
		.replace(/}+$/,'')
		.replace(/[^A-Za-z0-9\s]/g,'.')
		.replace(/\s/g,'\\s+')
		.toLowerCase();

	    var re = new RegExp(title, "i");
	    var original = re.exec(r);
	    r = r.replace(re, '(' + year + '). ' + original);
	    
	    break findMatchingBibtexEntry;
	}
	injected.push(r);
    }

    return function() {
	var ret = '';
	for (let i of injected) {
	    if (i) {
		ret += i + "\n";
	    }
	}
	return ret;
    }();
}

module.exports = {
    refs: refs()
}
