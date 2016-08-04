"use strict"
let webpack = require("webpack")

let config = require("./config")()

let compiler = webpack(config)

compiler.run((err, stats) => {
    if (err) {
        console.log(err)
    }
    else {
        console.log("Success.")
        console.log(stats)
    }
})