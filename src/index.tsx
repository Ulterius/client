import React = require("react")
import ReactDOM = require("react-dom")
import * as socket from "./socket"
import {TaskList} from "./component/components"
import TaskStore from "./store/task-store"

$(document).ready(function() {
    socket.connect()
    ReactDOM.render(
        <div className="container">
            <TaskList />
        </div>,
        window.document.getElementById("app")
    )
    console.log(TaskStore)
})
