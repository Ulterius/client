"use strict"
let path = require("path")
module.exports = function(grunt) {

    let nodeops = {
        global: true,
        events: true
    }
    
    let loaders = [
        {
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
            include: path.resolve("./src"),
            exclude: /node_modules/
        },
        {
            test: /\.s(c|a)ss$/,
            loaders: ["style", "css", "resolve-url", "sass?sourceMap&indentedSyntax"]
        },
        {
            test: /\.json$/,
            loader: "json-loader"
        }
    ]
    /*
    let worker = {
        output: {
            filename: "hash.worker.js",
            chunkFilename: "[id].hash.worker.js"
        }
    }
    */
    let wpops = {
        cache: false,
        entry: "./src/index.tsx",
        //devtool: "#inline-source-map",
        output: {
            path: __dirname + "/public",
            filename: "bundle.js"
        },
        node: nodeops,
        resolve: {
            extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
        },
        module: {loaders},
        ts: {
            transpileOnly: true
        }
    }
    let id = 0
    function hash() {
        id++
        return id
    }
    let wptestops = {
        cache: false,
        entry: {
            bundle: "./src/index.tsx",
            spec: "./test/spec.ts"
        },
        //devtool: "#inline-source-map",
        output: {
            path: __dirname + "/public",
            filename: "[name].js"
        },
        node: nodeops,
        resolve: {
            extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
        },
        module: {loaders}
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        webpack: {
            default: wpops,
            test: wptestops
        },
        "webpack-dev-server": {
            options: {
                keepalive: true,
                watch: true,
                contentBase: "public/",
                stats: {
                    exclude: ["node_modules"]
                }
            },
            default: {
                webpack: wpops
            },
            test: {
                webpack: wptestops
            }
        },
        copy: {
            default: {
                files: [
                    {
                        expand: true,
                        src: ["public/**", "!public/index.js"],
                        dest: "build/"
                    },
                    {
                        src: ["package.json"],
                        dest: "build/public/package.json"
                    }
                ]
            },
            nm: {
                files: [
                    {
                        src: ["package.json"],
                        dest: "public/package.json"
                    }
                ]
            }
        }
    })
    //grunt.loadNpmTasks("grunt-contrib-copy")
    grunt.loadNpmTasks("grunt-webpack")

    grunt.registerTask("nw", ["webpack", "copy:nm"])
    grunt.registerTask("default", ["webpack-dev-server"])
    grunt.registerTask("build", ["webpack"])
    grunt.registerTask("test", ["webpack-dev-server:test"])
}
