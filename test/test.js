let i = require('..');
let color = require('colors');

i.hooks.init();

let id = 'Glasziou2005';
console.log(("\nFind entry: " + id + "\n").green);
console.log('  Full citation:        ' + i.filters.cite(id));
console.log('  No braces:            ' + i.filters.citeNoBraces(id));
console.log('  No year:              ' + i.filters.citeNoYear(id));
console.log('  Year only:            ' + i.filters.citeYearOnly(id));
console.log('  Year only, no braces: ' + i.filters.citeYearOnlyNoBraces(id));

id = 'Glasziou2011';
console.log(("\nFind entry: " + id + "\n").green);
console.log('  Full citation:        ' + i.filters.cite(id));
console.log('  No braces:            ' + i.filters.citeNoBraces(id));
console.log('  No year:              ' + i.filters.citeNoYear(id));
console.log('  Year only:            ' + i.filters.citeYearOnly(id));
console.log('  Year only, no braces: ' + i.filters.citeYearOnlyNoBraces(id));

id = 'Wallace2013';
console.log(("\nFind entry: " + id + "\n").green);
console.log('  Full citation:        ' + i.filters.cite(id));
console.log('  No braces:            ' + i.filters.citeNoBraces(id));
console.log('  No year:              ' + i.filters.citeNoYear(id));
console.log('  Year only:            ' + i.filters.citeYearOnly(id));
console.log('  Year only, no braces: ' + i.filters.citeYearOnlyNoBraces(id));

id = 'InstMed2001';
console.log(("\nFind entry: " + id + "\n").green);
console.log('  Full citation:        ' + i.filters.cite(id));
console.log('  No braces:            ' + i.filters.citeNoBraces(id));
console.log('  No year:              ' + i.filters.citeNoYear(id));
console.log('  Year only:            ' + i.filters.citeYearOnly(id));
console.log('  Year only, no braces: ' + i.filters.citeYearOnlyNoBraces(id));

id = 'ORiordan2011';
console.log(("\nFind entry: " + id + "\n").green);
console.log('  Full citation:        ' + i.filters.cite(id));
console.log('  No braces:            ' + i.filters.citeNoBraces(id));
console.log('  No year:              ' + i.filters.citeNoYear(id));
console.log('  Year only:            ' + i.filters.citeYearOnly(id));
console.log('  Year only, no braces: ' + i.filters.citeYearOnlyNoBraces(id));

console.log();
i.hooks.finish();
console.log();
