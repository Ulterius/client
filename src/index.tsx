
window["debug"] = {}

declare let require: (string) => any
require("../style/style.scss")
//require("html/index.html")
//require("vendor/eve.js")
//require("vendor/chartist.min.css")
//require("vendor/jsencrypt.js")
//require("vendor/raphael.min.js")
//require("vendor/bootstrap-filestyle.min.js")

import React = require("react")
import ReactDOM = require("react-dom")
//import {connect, socket, sendCommandToDefault} from "./socket"
import {RootRouter} from "./component"
import TaskStore from "./store/task-store"
import setIntervals from "./interval"
import App from "./component/app"
import {IndexRoute, Router, Route, Link} from 'react-router'
//let injectTapEventPlugin = require('react-tap-event-plugin')
//injectTapEventPlugin()


$(document).ready(function() {
    ReactDOM.render(
        <RootRouter />,
        window.document.getElementById("app")
    )
})
