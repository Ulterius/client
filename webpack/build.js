"use strict"
let webpack = require("webpack")
let config = require("./config")()
let merge = require("webpack-merge")

//config.devtool = undefined

let setFreeVariable = function(key, value) {
    const env = {}
    env[key] = JSON.stringify(value)

    return {
        plugins: [
            new webpack.DefinePlugin(env)
        ]
    }
}

let buildConfig = merge(config, setFreeVariable('process.env.NODE_ENV', 'production'), {
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