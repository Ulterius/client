"use strict"
let webpack = require("webpack")
let WebpackDevServer = require("webpack-dev-server")
let config = require("./config")()
let merge = require("webpack-merge")

let devConfig = merge(config, {
    devtool: "eval-source-maps"
})

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
