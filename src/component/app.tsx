import React = require("react")

import * as socket from "../socket"
import {
    Bars,
    UserWidget,
    TaskList,
    Stats,
    
    CameraPage,
    TaskPage,
    SystemPage,
    SettingsPage,
    FilePage,
    PluginPage,
    Dialog,
    LoginScreen,
    Messages,
    FadeTransition
} from "./"
import {taskStore, appStore, AppState, userStore, UserState} from "../store"
import setIntervals from "../interval"
import {Router, IndexRoute, Route, Link} from 'react-router'
import {Glyphicon} from "react-bootstrap"
import {bootstrapSizeMatches} from "../util"
import {appActions} from "../action"

export function RootRouter(props: any) {
    return <Router>
        <Route path="/" component={App}>
            <IndexRoute component={TaskPage} />
            <Route path="tasks" component={TaskPage} />
            <Route path="info" component={SystemPage} />
            <Route path="cameras" component={CameraPage} />
            <Route path="settings" component={SettingsPage} />
            <Route path="filesystem" component={FilePage} />
            {/*<Route path="plugin" component={PluginPage} />*/}
        </Route>
    </Router>
}

function NavItem(props: {className: string, path: string, label: string, glyph: string}) {
    let {className, path, label, glyph} = props
    return <li className={className}>
        <Link to={path}>
            <Glyphicon glyph={glyph} />
            <span className="tab-label">&nbsp; {label}</span>
        </Link>
    </li>
}

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
            console.log(this.state)
            return <div className="main">Connecting to server...</div>
        }
        if (!this.state.app.auth.loggedIn) {
            return <div className="main">
                <Messages />
                <LoginScreen 
                    username={this.state.user.username} 
                    avatar = {this.state.user.avatar}
                    onLogin = {pwd => {
                        socket.sendCommandToDefault("authenticate", pwd)
                        appActions.setPassword(pwd)
                    }} />
            </div>
        }
        return (
            <div className="main animated fadeIn">
                <Messages />
                <Dialog />
                <div className="sidebar col-md-4" data-spy="affix">
                    <h1 className="text-center">Ulterius</h1>
                    <UserWidget />
                    <ul className="nav nav-pills nav-stacked">
                        <NavItem 
                            className={
                                (this.getActive("/tasks") ||
                                    this.getActive("/"))  ?  "active": ""} 
                            path="/tasks"
                            glyph="tasks"
                            label="Task Manager"/>
                        <NavItem 
                            className={this.getActiveClassName("/info")} 
                            path="/info"
                            glyph="stats"
                            label="System Info"/>
                        <NavItem 
                            className={this.getActiveClassName("/cameras")} 
                            path="/cameras"
                            glyph="facetime-video"
                            label="Cameras"/>
                        <NavItem 
                            className={this.getActiveClassName("/filesystem")} 
                            path="/filesystem"
                            glyph="hdd"
                            label="Filesystem"/>
                        {/*<NavItem 
                            className={this.getActiveClassName("/plugin")} 
                            path="/plugin"
                            glyph="plus-sign"
                            label="Plugins"/>*/}
                        <NavItem 
                            className={this.getActiveClassName("/settings")} 
                            path="/settings"
                            glyph="cog"
                            label="Settings"/>
                    </ul>
                </div>
                <div className="page">
                    <FadeTransition>
                        <div className="page-content container-fluid">
                            {this.props.children}
                        </div>
                    </FadeTransition>
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
