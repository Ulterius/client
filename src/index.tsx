
declare let require: (string) => any
require("../style/style.sass")

import React = require("react")
import ReactDOM = require("react-dom")
import {connect, socket, sendCommandToDefault} from "./socket"
import {RootRouter} from "./component"
import TaskStore from "./store/task-store"
import setIntervals from "./interval"
import App from "./component/app"
import {IndexRoute, Router, Route, Link} from 'react-router'


$(document).ready(function() {
    (window as any).send = sendCommandToDefault
    connect()
    ReactDOM.render(
        <RootRouter />,
        window.document.getElementById("app")
    )
})
