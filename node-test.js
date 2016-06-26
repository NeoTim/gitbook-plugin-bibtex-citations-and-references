var cite = require('./index.js');
var util = require('util');

cite.hooks.init();

console.log("\nTesting with these refs:\n");
console.log(cite.filters.cite('Glasziou2005'));
console.log(cite.filters.cite('Glasziou2011'));
console.log(cite.filters.cite('Wallace2013'));

console.log("\nGenerated the following bibliography:\n")
console.log(cite.blocks.references());

