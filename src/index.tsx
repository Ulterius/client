import React = require("react")
import ReactDOM = require("react-dom")
import * as socket from "./socket"
import {Task} from "./component/components"

$(document).ready(function() {
    socket.connect()
    ReactDOM.render(<Task ayy="lmao" />, window.document.getElementById("ayy"))
})
