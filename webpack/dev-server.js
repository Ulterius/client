"use strict"
let webpack = require("webpack")
let WebpackDevServer = require("webpack-dev-server")
let config = require("./config")({index: "dev.html"})
let merge = require("webpack-merge")
let copyStatic = require("./copy-static")

let devConfig = merge(config, {
    devtool: "eval-source-maps"
})

//copyStatic("dev.html")

new WebpackDevServer(webpack(devConfig), {
    watch: true,
    contentBase: "public",
    progress: true,
    colors: true,
    hot: true
}).listen(8080, "localhost", function(err, result) {
    if (err) {
        console.log(err)
    }
})
