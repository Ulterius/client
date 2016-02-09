import React = require("react")

import * as socket from "../socket"
import {Bars, UserWidget, TaskList, Stats, CameraPage, LoginScreen, Messages} from "./"
import {taskStore, appStore, AppState, userStore, UserState} from "../store"
import setIntervals from "../interval"
import {Router, Route, Link} from 'react-router'
import {Glyphicon} from "react-bootstrap"
import {bootstrapSizeMatches} from "../util"


export default class App extends React.Component<{
    children?: any, 
    location?: any,
    appState?: AppState
}, 
{
    app?: AppState,
    user?: UserInfo
}> {
    componentDidMount() {
        this.onAppChange(appStore.getState())
        this.onUserChange(userStore.getState())
        appStore.listen(this.onAppChange)
        userStore.listen(this.onUserChange)
    }
    componentWillUnmount() {
        appStore.unlisten(this.onAppChange)
        userStore.unlisten(this.onUserChange)
    }
    onAppChange = (appState: AppState) => {
        this.setState({app: appState})
    }
    onUserChange = (userState: UserState) => {
        this.setState({user: userState.user})
    }
    render() {
        if (!this.state || !this.state.app || !this.state.user) {
            return <div className="main">Connecting to server...</div>
        }
        if (!this.state.app.auth.loggedIn) {
            return <div className="main">
                <Messages />
                <LoginScreen 
                    username={this.state.user.username} 
                    avatar = {this.state.user.avatar}
                    onLogin = {pwd => {
                        console.log(pwd)
                        socket.sendCommandToDefault("authenticate", pwd)
                    }} />
            </div>
        }
        return (
            <div className="main animated fadeIn">
                <Messages />
                <div className="sidebar col-md-4" data-spy="affix">
                    <h1 className="text-center">Ulterius</h1>
                    <UserWidget />
                    <ul className="nav nav-pills nav-stacked">
                        <li className={
                            (this.getActive("/tasks") ||
                             this.getActive("/"))  ?  "active": ""}>
                            <Link to="/tasks"><Glyphicon glyph="tasks" />  <span className="tab-label">&nbsp;Task Manager</span></Link>
                        </li>
                        <li className={this.getActiveClassName("/info")} >
                            <Link to="/info"><Glyphicon glyph="stats" /> <span className="tab-label">&nbsp;System Info </span></Link>
                        </li>
                        <li className={this.getActiveClassName("/cameras")} >
                            <Link to="/cameras"><Glyphicon glyph="record" /> <span className="tab-label">&nbsp;Cameras </span></Link>
                        </li>
                    </ul>
                </div>
                <div className="page">
                    <div className="page-content container-fluid">
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
