"use strict"
let webpack = require("webpack")
let WebpackDevServer = require("webpack-dev-server")
let config = require("./config")()

new WebpackDevServer(webpack(config), {
    watch: true,
    contentBase: "public",
    progress: true,
    colors: true
}).listen(8080, "localhost", function(err, result) {
    if (err) {
        console.log(err)
    }
})
