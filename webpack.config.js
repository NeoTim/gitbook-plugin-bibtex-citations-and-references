module.exports = {
    // FIX for error wherein webpack doesn't understand that fs is a built-in module
    // Resolves error message:
    // Module not found: Error: Can't resolve 'fs'
    node: {
	fs: "empty"
    },

    entry: "src/index.js",

    output: {
	path: __dirname + "/build/",
	filename: "index.js"
    },

    module: {
	loaders: [
	    {
		test: /\.js$/,
		include: /node_modules/,
		loader: "babel-loader",
		query: { presets: [ "es2015" ] }
	    }
	]
    }
}
