import React = require("react")
import ReactDOM = require("react-dom")
import * as socket from "./socket"
import {TaskList} from "./component/components"
import TaskStore from "./store/task-store"

$(document).ready(function() {
    socket.connect()
    ReactDOM.render(<TaskList />, window.document.getElementById("ayy"))
    console.log(TaskStore)
})
