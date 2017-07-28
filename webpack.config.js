const webpack = require('webpack');
const glob = require('glob');
const path = require('path');


module.exports = {
    // FIX for error wherein webpack doesn't understand that fs is a built-in module
    // Resolves error message:
    // Module not found: Error: Can't resolve 'fs'
    node: {
        fs: "empty"
    },

    entry: getAllEntries(),

    output: {
        // path: __dirname + "/build/",
        filename: "[name]"
    },

    module: {
        loaders: [{
            loader: "babel-loader",
            test: /\.js?$/,
            include: /node_modules/,
            exclude: /node_modules\/citation-js\/lib/,
            // exclude: /node_modules/,
            // query: { presets: [ "es2015", { "modules": false } ] }
        }]
    },

//     plugins: [
//          new webpack.optimize.UglifyJsPlugin({
//              compress: { warnings: false, },
//              output: { comments: false, },
//          }),
//     ]
}

function getEntries(pattern, from, to) {
    const entries = {};
    glob.sync(pattern).forEach((file) => {
        if (from && to) {
            entries[file.replace('src/', 'build/')] = path.join(__dirname, file);
        } else {
            entries[file] = path.join(__dirname, file);
        }
    });
    return entries;
}

function getAllEntries() {
    var obj = {};
    Object.assign(obj,getEntries('src/**/*.js', 'src', 'build'));
    // Object.assign(obj,getEntries('node_modules/**/*.js', 'node_modules', 'build/node_modules'));
    // console.dir(obj);
    // throw '';
    return obj;
}

