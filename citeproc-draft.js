var fs = require('fs');
var path = require('path');
var glob = require('glob');
var util = require('util');

var bibtexParse = require('bibtex-parser');
var citeproc = require('citeproc-js-node');

var locales = fs.readFileSync(glob.sync(path.join('./assets/csl/locales/', 'locales-*.xml'))[0].toString(), 'utf8');
var styles  = fs.readFileSync(glob.sync(path.join('./assets/csl/styles/',  '*.csl'))[0].toString(), 'utf8');

var to_json = require('xmljson').to_json;
var bib2json = require('bib2json');
var bibtex  = bibtexParse(fs.readFileSync('literature.bib', 'utf8'));
var bibtex2 = bib2json(fs.readFileSync('literature.bib','utf8'));
var stylejson = to_json(styles, function(err,data) { return data; });
var langString = 'en-GB';

console.log(util.inspect(bibtex2.entries[1], { depth:null, showhidden:true }));

var sys = new citeproc.simpleSys();

// sys.addLocale(langString, locales);
// console.log(util.inspect(sys, {depth:null, showHidden:true}));


// FIXME: http://citeproc-js.readthedocs.io/en/latest/deployments.html?highlight=retrieveitem

// var engine = sys.newEngine(styles, langString, null);
// var engine = sys.newEngine(bibtex, langString, null);
// var engine = sys.newEngine(bibtex2, langString, null);
// var engine = sys.newEngine(stylejson, langString, null);

// var engine = new citeproc.CSL.Engine(sys, styles, langString, null);
// var engine = new citeproc.CSL.Engine(sys, bibtex, langString, null);
// var engine = new citeproc.CSL.Engine(sys, bibtex2, langString, null);
// var engine = new citeproc.CSL.Engine(sys, stylejson, langString, null);
