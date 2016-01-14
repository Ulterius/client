import React = require("react")

import * as socket from "../socket"
import {TaskList} from "../component/tasks"
import {Bars, Stats} from "../component/components"
import TaskStore from "../store/task-store"
import setIntervals from "../interval"
import {Router, Route, Link} from 'react-router'

export default class App extends React.Component<{children?: any, location?: any}, {}> {
    render() {
        return (
            <div className="main">

                <div className="sidebar col-md-4 hidden-sm hidden-xs" data-spy="affix">
                    <h1 className="text-center">Ulterius</h1>
                    <Stats />
                </div>

                <div className="task-list">
                    <ul className="nav nav-tabs">
                        <li className={
                            (this.props.location.pathname == "/tasks" ||
                            this.props.location.pathname == "/")  ?  "active": ""}>
                            <Link to="/tasks">Task Manager</Link>
                        </li>
                        <li className={this.props.location.pathname == "/info" ?  "active" : ""} >
                            <Link to="/info">System Info</Link>
                        </li>
                    </ul>
                    <div>
                    {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}
