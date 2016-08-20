"use strict"
let path = require("path")
let webpack = require("webpack")

const assetPath = path.resolve(__dirname, "../assets")
const htmlPath = path.resolve(__dirname, "../html")
const indexPage = path.resolve(htmlPath, "index.html")
const validate = require("webpack-validator")

let loaders = [
    {
        test: /\.tsx?$/,
        loaders: ['awesome-typescript-loader'],
        include: path.resolve(__dirname, "../src"),
        exclude: /node_modules/
    },
    {
        test: /\.scss$/,
        loaders: ["style", "css", "resolve-url", "sass?sourceMap"]
        //loaders: ["style", "css", "resolve-url", "sass?sourceMap&indentedSyntax"]
    },
    {
        test: /\.json$/,
        loader: "json-loader"
    },
    {
        include: [
            assetPath
        ],
        test: /(\.png|\.svg|\.otf|\.woff2?|\.css|\.js)$/,
        loader: "file-loader?name=[path][name].[ext]"
    }
    /*
    {
        test: indexPage,
        include: [htmlPath],
        loaders: ["file?name=[name].[ext]", "extract", "html?attrs=script:src"]
    }
    */
]

let nodeops = {
    global: true,
    events: true
}


module.exports = function(opts) {
    return validate({
        context: path.resolve(__dirname, ".."),
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
        resolve: {
            alias: {
                img: path.resolve(assetPath, "img"),
                icon: path.resolve(assetPath, "img/newicon"),
                font: path.resolve(assetPath, "font"),
            },
            extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
        },
        module: {loaders},
        plugins: [
            new webpack.HotModuleReplacementPlugin({
                multiStep: true
            })
        ]
    })
    
    /*
    if (opts.development) {
        
    }
    */
    
}
