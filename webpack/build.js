"use strict"
let webpack = require("webpack")
let config = require("./config")()
let merge = require("webpack-merge")

//config.devtool = undefined

let buildConfig = merge(config, {
    devtool: false,
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
})

let compiler = webpack(buildConfig)

compiler.run((err, stats) => {
    if (err) {
        console.log(err)
    }
    else {
        console.log("Success.")
        console.log(stats)
    }
})