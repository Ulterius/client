
declare let require: (string) => any
require("../style/style.sass")

import React = require("react")
import ReactDOM = require("react-dom")
import * as socket from "./socket"
import {TaskList} from "./component/tasks"
import {Bars, Stats} from "./component/components"
import TaskStore from "./store/task-store"
import setIntervals from "./interval"

$(document).ready(function() {
    setIntervals(socket.connect())
    ReactDOM.render(
        <div className="main">

            <div className="sidebar col-md-4 hidden-sm hidden-xs" data-spy="affix">
                <h1 className="text-center">Ulterius</h1>
                <Stats />
            </div>

            <div className="task-list">
                <TaskList />
            </div>

        </div>,
        window.document.getElementById("app")
    )
    console.log(TaskStore)
})
