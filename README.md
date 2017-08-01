# Gitbook plugin: bibtex citations and references

## Description

Plugin for Gitbook that handles citations and references. Beta quality, still some missing functionality.


## WARNING

NOTE: this WILL NOT WORK on Gitbook's cloud servers since they continue to use Node v5, and modules required by this plugin require Node v6 or above. Consequently you will need to run this in your own Gitbook/Node environment.

## How to use it

In your `book.json` file in your Gitbook repo, add this as a plugin:

```json
{
    "plugins": [
        "bibtex-citations-and-references"
    ]
}
```

Tell Gitbook to install this and any other plugins:

```
gitbook install
```

Create or edit `literature.bib` in the root of your Gitbook repository. It needs to be valid bibtex. Here's an example:

```bibtex
@article{Wallace2013,
  url = {http://apt.rcpsych.org/content/19/4/250},
  year = {2013},
  publisher = {{Royal College of Psychiatrists}},
  doi = {10.1192/apt.bp.112.010389},
  volume = {19},
  number = {4},
  pages = {250-258},
  journal = {{BJPsych Advances}},
  author = {John Wallace},
  title = {{Lost in translation: transferring knowledge from research to clinical practice}},
}

@article{Glasziou2005,
  url = {http://ebn.bmj.com/content/8/2/36.full},
  year = {2005},
  publisher = {{British Medical Journal}},
  doi = {10.1136/ebn.8.2.36},
  volume = {8},
  pages = {36-38},
  journal = {{Evidence Based Nursing}},
  author = {Paul Glasziou and Brian Haynes},
  title = {{The paths from research to improved health outcomes}},
}
```

Note that citation-js does not recognise all entry-types. You may see error messages during the Gitbook rendering process.

## Add citations and references in your Gitbook

Exposed functions/API:

* `cite`
* `citeNoBraces`
* `citeNoYear`
* `citeYearOnly`
* `citeYearOnlyNoBraces`

For example, the following in your Gitbook source...:

`The 'research-to-practice gap' describes the well-recognised struggle to put evidence into effective practice. {{"Glasziou2005"|cite}} use a 'pipeline' analogy and describe evidence 'leaking' at all stages along this pipeline.`

...will render like this:

> The 'research-to-practice gap' describes the well-recognised struggle to put evidence into effective practice. Glasziou and Haynes (2005) use a 'pipeline' analogy and describe evidence 'leaking' at all stages along this pipeline. 

To insert a complete list of references, add this into a Gitbook source page:

```
{% references %}

{% endreferences %}
```

This uses citation-js to style the references, which in turn uses [CSL](https://github.com/citation-style-language). Full styling here is a work-in-progress.

The above bibtex example will produce the following references:

> Glasziou, P., & Haynes, B. (2005). The paths from research to improved health outcomes. *Evidence Based Nursing*, 8, 36–38. https://doi.org/10.1136/ebn.8.2.36
> 
> Wallace, J. (2013). Lost in translation: transferring knowledge from research to clinical practice. *BJPsych Advances*, 19(4), 250–258. https://doi.org/10.1192/apt.bp.112.010389

Obviously, you need to `gitbook build` to see the output.

## Thanks

Uses Citation Style Language stylesheets to generate references courtesy of https://github.com/larsgw/citation.js
