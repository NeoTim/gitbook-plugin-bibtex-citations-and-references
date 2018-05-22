let Cite = require('citation-js');
let bibtexJSON;

const basicParse = require('bibtex-parse-js');
const util = require('util');
const fs = require('fs');
const path = require('path');

let cite = new Cite();

let etAl = 3; // FIXME Get rid of this

// FIXME These should be passed as arguments:
let styleName = 'apa-local';
let style = 'citation-' + styleName;
let localeName = 'en-GB';
let cslDir = path.join(__dirname, 'assets', 'csl')

const styleCSL = myReadFile(path.join(cslDir, 'styles', styleName + '.csl'),'utf8');
const localeXML = myReadFile(path.join(cslDir, 'locales', 'locales-' + localeName + '.xml'),'utf8');

let opts = {
    type: 'string',
    style: style,
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

    cite = new Cite(bibtexJSON, opts)
    // console.log(cite);
    // process.exit();
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
    // FIXME Must be a way of doing this directly with citation-js
    let rebuild = '@misc{x, author={' + author.entryTags.author + '},'
    if (author.entryTags.year) {
	// FIXME Fudge the date object, only year is reported so assign January
	rebuild = rebuild + 'date="' + author.entryTags.year + '-01-01",'
	rebuild = rebuild + 'year=' + author.entryTags.year + ', month=1,'
    }
    rebuild = rebuild + '}'
    let c = new Cite(rebuild, opts)
    let r = c.get()
    return r;
}

function oldFormatAuthor(author) {
    // FIXME Use citation-js to apply CSL
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
