import React = require("react")

import * as socket from "../socket"
import {Bars, UserWidget, TaskList, Stats, CameraPage, LoginScreen, Messages} from "./"
import {taskStore, appStore, AppState, userStore, UserState} from "../store"
import setIntervals from "../interval"
import {Router, Route, Link} from 'react-router'


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
            return <div className="main">Loading stores..</div>
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
