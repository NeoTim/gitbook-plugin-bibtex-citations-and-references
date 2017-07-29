"use strict";

require('babel-register');

let i = require('.');
let color = require('colors');

let id = 'Glasziou2005';
console.log(("\nFind a specific entry: " + id + "\n").green);
console.log('  Full citation:        ' + i.filters.cite(id));
console.log('  No braces:            ' + i.filters.citeNoBraces(id));
console.log('  No year:              ' + i.filters.citeNoYear(id));
console.log('  Year only:            ' + i.filters.citeYearOnly(id));
console.log('  Year only, no braces: ' + i.filters.citeYearOnlyNoBraces(id));

console.log("\nMessages gitbook.io will show:\n".green);
i.hooks.init();
i.hooks.finish();

console.log();
