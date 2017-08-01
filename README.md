# Gitbook plugin: bibtex citations and references

## Description

Plugin for Gitbook that handles citations and references. Beta quality, still some missing functionality. Expects bibtex references in 'literature.bib'. Uses Citation Style Language stylesheets to generate references courtesy of (citation-js)[https://github.com/citation-js/].

## WARNING

NOTE: this WILL NOT WORK on Gitbook's cloud servers since they continue to use Node v5, and modules required by this plugin require Node v6 or above. Consequently you will need to run this in your own Gitbook/Node environment.
