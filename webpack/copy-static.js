"use strict"

let fs = require("fs-extra")
let path = require("path")
let pr = path.resolve

let srcDir = pr(__dirname, "../static")
let destDir = pr(__dirname, "../public")

module.exports = function (indexName) {
    fs.ensureDirSync(destDir)
    fs.copy(
        pr(srcDir, indexName), 
        pr(destDir, "index.html")
    )
    fs.copy(
        pr(srcDir, "b"), 
        pr(destDir, "b")
    )
    fs.copy(
        pr(srcDir, "vendor"), 
        pr(destDir, "vendor")
    )
}