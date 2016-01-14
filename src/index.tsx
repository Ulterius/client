
declare let require: (string) => any
require("../style/style.sass")

import React = require("react")
import ReactDOM = require("react-dom")
import {connect, socket, sendCommandToDefault} from "./socket"
import {TaskList} from "./component/tasks"
import {Bars, Stats} from "./component/components"
import TaskStore from "./store/task-store"
import setIntervals from "./interval"
import App from "./component/app"
import config from "./config"


$(document).ready(function() {
    connect().onopen = function() {
        sendCommandToDefault("authenticate", config.auth.password)
    }

    //setIntervals(socket.connect())
    ReactDOM.render(
        <App />,
        window.document.getElementById("app")
    )
    console.log(TaskStore)
})
