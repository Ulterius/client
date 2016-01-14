
declare let require: (string) => any
require("../style/style.sass")

import React = require("react")
import ReactDOM = require("react-dom")
import {connect, socket, sendCommandToDefault} from "./socket"
import {Bars, Stats, SystemPage} from "./component/components"
import TaskStore from "./store/task-store"
import setIntervals from "./interval"
import App from "./component/app"
import config from "./config"
import {IndexRoute, Router, Route, Link} from 'react-router'
import {TaskList} from "./component/tasks"
import appState from "./app-state"


$(document).ready(function() {
    connect().onopen = function() {
        sendCommandToDefault("authenticate", config.auth.password)
    }

    //setIntervals(socket.connect())
    ReactDOM.render((
        <Router>
            <Route path="/" component={App}>
                <IndexRoute component={TaskList} />
                <Route path="tasks" component={TaskList} />
                <Route path="info" component={SystemPage} />
            </Route>
        </Router>),
        window.document.getElementById("app")
    )
    console.log(TaskStore)
})
