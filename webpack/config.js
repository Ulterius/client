"use strict"
let path = require("path")
let webpack = require("webpack")

let loaders = [
    {
        test: /\.tsx?$/,
        loaders: ['awesome-typescript-loader'],
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
        entry: [
            //'webpack-dev-server/client?http://0.0.0.0:8080',
            'webpack/hot/dev-server',
            path.resolve(__dirname, "../src/index.tsx")
        ],
        output: {
            path: path.resolve(__dirname, "../public"),
            publicPath: "/",
            filename: "bundle.js"
        },
        watchOptions: {
            // Delay the rebuild after the first change
            aggregateTimeout: 300,
            // Poll using interval (in ms, accepts boolean too)
            poll: 1000
        },
        node: nodeops,
        devtool: "eval-source-maps",
        resolve: {
            extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
        },
        module: {loaders},
        plugins: [
            new webpack.HotModuleReplacementPlugin({
                multiStep: true
            })
        ],
        ts: {
            transpileOnly: true
        } 
    }
    
    /*
    if (opts.development) {
        
    }
    */
    
}
