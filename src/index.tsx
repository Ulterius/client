
declare let require: (string) => any
require("../style/style.sass")

import React = require("react")
import ReactDOM = require("react-dom")
import {connect, socket, sendCommandToDefault} from "./socket"
import {Bars, Stats, SystemPage, CameraPage, TaskPage, SettingsPage, FilePage} from "./component"
import TaskStore from "./store/task-store"
import setIntervals from "./interval"
import App from "./component/app"
import {IndexRoute, Router, Route, Link} from 'react-router'


$(document).ready(function() {
    (window as any).send = sendCommandToDefault
    connect()
    ReactDOM.render((
        <Router>
            <Route path="/" component={App}>
                <IndexRoute component={TaskPage} />
                <Route path="tasks" component={TaskPage} />
                <Route path="info" component={SystemPage} />
                <Route path="cameras" component={CameraPage} />
                <Route path="settings" component={SettingsPage} />
                <Route path="filesystem" component={FilePage} />
            </Route>
        </Router>),
        window.document.getElementById("app")
    )
})
