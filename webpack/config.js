"use strict"
let path = require("path")

let loaders = [
    {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        include: path.resolve(__dirname, "../src"),
        exclude: /node_modules/
    },
    {
        test: /\.s[ca]ss$/,
        loaders: ["style", "css", "resolve-url", "sass?sourceMap&indentedSyntax"]
    },
    {
        test: /\.json$/,
        loader: "json-loader"
    }
]

let nodeops = {
    global: true,
    events: true
}


module.exports = function(opts) {
    return {
        entry: path.resolve(__dirname, "../src/index.tsx"),
        output: {
            path: path.resolve(__dirname, "../public"),
            filename: "bundle.js"
        },
        node: nodeops,
        devtool: "eval-source-maps",
        resolve: {
            extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
        },
        module: {loaders},
        ts: {
            transpileOnly: true
        } 
    }
    
    /*
    if (opts.development) {
        
    }
    */
    
}
