import React = require("react")

import * as socket from "../socket"
import {Bars, UserWidget, TaskList, Stats, CameraPage} from "./"
import {taskStore} from "../store"
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

                <div className="page">
                    <UserWidget />
                    <ul className="nav nav-tabs">
                        <li className={
                            (this.getActive("/tasks") ||
                             this.getActive("/"))  ?  "active": ""}>
                            <Link to="/tasks">Task Manager</Link>
                        </li>
                        <li className={this.getActiveClassName("/info")} >
                            <Link to="/info">System Info</Link>
                        </li>
                        <li className={this.getActiveClassName("/cameras")} >
                            <Link to="/cameras">Cameras</Link>
                        </li>
                    </ul>
                    <div className="page-content">
                    {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
    getActive(path: string) {
        return this.props.location.pathname == path
    }
    getActiveClassName(path: string) {
        return this.props.location.pathname == path ? "active" : ""
    }
    
}
