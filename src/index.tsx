
window["debug"] = {}

declare let require: (string) => any
require("../style/style.scss")
let scrypt = require("simplecrypto")
console.log(scrypt)

import React = require("react")
import ReactDOM = require("react-dom")
//import {connect, socket, sendCommandToDefault} from "./socket"
import {RootRouter} from "./component"
import TaskStore from "./store/task-store"
import setIntervals from "./interval"
import App from "./component/app"
import {IndexRoute, Router, Route, Link} from 'react-router'
let injectTapEventPlugin = require('react-tap-event-plugin')
//injectTapEventPlugin()


$(document).ready(function() {
    ReactDOM.render(
        <RootRouter />,
        window.document.getElementById("app")
    )
})
