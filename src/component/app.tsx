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
    VncPage,
    
    Dialogs,
    dialogEvents,
    LoginScreen,
    Messages,
    FadeTransition,
    SlideDownTransition,
    MoveRightTransition,
    LoadingScreen,
    ConnectScreen
    
} from "./"
import {taskStore, appStore, AppState, userStore, UserState} from "../store"
import setIntervals from "../interval"
import {Router, IndexRoute, Route, Link} from 'react-router'
import {Glyphicon, Button} from "react-bootstrap"
import {bootstrapSizeMatches} from "../util"
import {appActions} from "../action"
import MediaQuery = require("react-responsive")

export function RootRouter(props: any) {
    return <Router>
        <Route path="/" component={App}>
            <IndexRoute component={TaskPage} />
            <Route path="tasks" component={TaskPage} />
            <Route path="info" component={SystemPage} />
            <Route path="cameras" component={CameraPage} />
            <Route path="settings" component={SettingsPage} />
            <Route path="filesystem" component={FilePage} />
            <Route path="vnc" component={VncPage} />
            {/* <Route path="plugin" component={PluginPage} /> */}
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
    constructor(props) {
        super(props)
        this.state = {}
    }
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
    mainContent() {
        if (!this.state.app || !this.state.app.connection.host) {
            return <ConnectScreen />
        }
        if (!this.state.user) {
            return <LoadingScreen>
                Connecting to server
            </LoadingScreen>
        }
        if (!this.state.app.auth.loggedIn) {
            return <LoginScreen
                username={this.state.user.username} 
                avatar = {this.state.user.avatar}
                onLogin = {pwd => {
                    socket.sendCommandToDefault("authenticate", pwd)
                    appActions.setPassword(pwd)
                }} />
        }
        return <div>
            <Sidebar activePath={this.props.location.pathname} />
            <div className="page">
                <FadeTransition>
                    <div className="page-content container-fluid">
                        {this.props.children}
                    </div>
                </FadeTransition>
            </div>
        </div>
    }
    render() {
        return <div className="main">
            <Messages />
            <Dialogs />
            {this.mainContent()}
        </div>
    }
}

function Overlay(props: any) {
    const style = _.assign({}, props.style, {
        zIndex: 10,
        position: "fixed",
        width: "100%",
        height: "100%",
        opacity: 0.5,
        backgroundColor: "black"
    })
    
    return <div {...props} style={style}>
    </div>
    
}

class Sidebar extends React.Component<{activePath: string}, {
    open: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {open: false}
    }
    componentDidMount() {
        this.setState({open: false})
    }
    getActiveClassName(path: string) {
          return this.props.activePath == path ? "active" : ""
    }
    getActive(path: string) {
        return this.props.activePath == path
    }
    sidebarContent() {
        return <div className="sidebar col-md-4" data-spy="affix">
            <h1 className="text-center">Ulterius</h1>
            <UserWidget />
            <ul className="nav nav-pills nav-stacked">
                <NavItem 
                    className={
                        (this.getActive("/tasks") ||
                            this.getActive("/"))  ?  "active": ""} 
                    path="/tasks"
                    glyph="tasks"
                    label="Task Manager" />
                <NavItem 
                    className={this.getActiveClassName("/info")} 
                    path="/info"
                    glyph="stats"
                    label="System Info" />
                <NavItem 
                    className={this.getActiveClassName("/cameras")} 
                    path="/cameras"
                    glyph="facetime-video"
                    label="Cameras" />
                <NavItem 
                    className={this.getActiveClassName("/filesystem")} 
                    path="/filesystem"
                    glyph="hdd"
                    label="Filesystem" />
                {/*<NavItem 
                    className={this.getActiveClassName("/plugin")} 
                    path="/plugin"
                    glyph="plus-sign"
                    label="Plugins"/>*/}
                <NavItem 
                    className={this.getActiveClassName("/settings")} 
                    path="/settings"
                    glyph="cog"
                    label="Settings" />
                <NavItem
                    className={this.getActiveClassName("/vnc")}
                    path="/vnc"
                    glyph="picture"
                    label="VNC" />
                <li>
                    <a style={{cursor: "pointer"}} onClick={() => {
                        dialogEvents.dialog({
                            title: "Disconnect?",
                            body: <p>Are you sure you want to disconnect?</p>,
                            buttons: [
                                {bsStyle: "primary", children: "Yes", onClick: socket.disconnect},
                                {bsStyle: "default", children: "No"}
                            ]
                        })
                    }}>
                        <Glyphicon glyph="log-out" />
                        <span className="tab-label">&nbsp; Disconnect</span>
                    </a>
                </li>
            </ul>
        </div>
    }
    modalSidebar = () => {
        let toggleOpen = () => this.setState({open: !this.state.open})
        let contents
        /*
        if (this.state.open) {
            contents = <div>
                <Overlay onClick={toggleOpen}/>
                {this.sidebarContent()}
            </div>
            //contents = this.sidebarContent()
        }
        else {
            contents = <div className="btn btn-default" style={{position: "fixed", zIndex: 10000, opacity: 0.6}} onClick={toggleOpen}>
                <Glyphicon glyph="menu-hamburger" />
            </div>
        }
        
        */
        contents = <div>
            <div className="btn btn-default" style={{position: "fixed", zIndex: 10000, opacity: 0.6}} onClick={toggleOpen}>
                <Glyphicon glyph="menu-hamburger" />
            </div>
            {this.state.open ? <Overlay onClick={toggleOpen}/> : null}
            <MoveRightTransition show={this.state.open}>
                {this.sidebarContent()}
            </MoveRightTransition>
        </div>
        return contents

    }
    render() {
        return <div>
            <MediaQuery minWidth={786}>
                {this.sidebarContent()}
            </MediaQuery>
            <MediaQuery maxWidth={785}>
                {this.modalSidebar()}
            </MediaQuery>
        </div>
    }
}