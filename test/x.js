let Cite = require('citation-js');

// See https://citation.js.org/api/tutorial-output_plugins.html#csl-plugins
// and https://github.com/larsgw/citation.js/issues/148#issuecomment-391675201

let bibtex = '@article{Steinbeck2003, author = {Steinbeck, Christoph and Han, Yongquan and Kuhn, Stefan and Horlacher, Oliver and Luttmann, Edgar and Willighagen, Egon}, year = {2003}, title = {{The Chemistry Development Kit (CDK): an open-source Java library for Chemo- and Bioinformatics.}}, journal = {Journal of chemical information and computer sciences}, volume = {43}, number = {2}, pages = {493--500}, doi = {10.1021/ci025584y}, isbn = {2214707786}, issn = {0095-2338}, pmid = {12653513}, url = {http://www.ncbi.nlm.nih.gov/pubmed/12653513} }'


let cite = new Cite(bibtex);
cite.format('bibliography', {
    template: 'apa',
    lang: 'en-US',
    format: 'html'
});

