import React = require("react")
import {Router, Route, Link} from 'react-router'

import * as socket from "../socket"
import {TaskList} from "../component/tasks"
import {Bars, Stats} from "../component/components"
import TaskStore from "../store/task-store"
import setIntervals from "../interval"

export default class App extends React.Component<{}, {}> {
    render() {
        return (
            <div className="main">

                <div className="sidebar col-md-4 hidden-sm hidden-xs" data-spy="affix">
                    <h1 className="text-center">Ulterius</h1>
                    <Stats />
                </div>

                <div className="task-list">
                    <ul className="nav nav-pills">
                        <li role="presentation"><a>Task Manager</a></li>
                        <li><a>System Info</a></li>
                    </ul>
                    <TaskList />
                </div>
            </div>
        )
    }
}
