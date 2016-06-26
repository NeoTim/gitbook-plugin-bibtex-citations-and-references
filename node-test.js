var cite = require('./index.js');
var util = require('util');

cite.hooks.init();
console.log(cite.filters.cite('Glasziou2005'));
console.log(cite.filters.cite('Glasziou2011'));
console.log(cite.filters.cite('Wallace2013'));
