import React = require("react")

import * as socket from "../socket"
import {
    Bars,
    UserWidget,
    TaskList,
    Stats,
    Overlay,
    
    CameraPage,
    TaskPage,
    SystemPage,
    ModalSettings,
    FilePage,
    PluginPage,
    
    Dialogs,
    dialogEvents,
    DisconnectOverlay,
    LoginScreen,
    Messages,
    FadeTransition,
    SlideDownTransition,
    MoveRightTransition,
    LoadingScreen,
    ConnectScreen
} from "./"
import {DebugPage} from "./debug"
import {TerminalPage} from "./terminal"
import {ScreenPage} from "./screen"
import {ScriptPage} from "./script"
import {taskStore, appStore, AppState, userStore, UserState} from "../store"
import setIntervals from "../interval"
import {Router, IndexRoute, Route, Link, hashHistory} from 'react-router'
import {Glyphicon, Button} from "react-bootstrap"
import {bootstrapSizeMatches} from "../util"
import {appActions} from "../action"
import MediaQuery = require("react-responsive")


interface Page {
    route: string,
    label: string,
    title: string,
    icon: string,
    component: React.ReactType
}

function newPage(route: string, label: string, icon: string, component: React.ReactType) {
    return {route, label, title: label, icon, component}
}

const pages: Page[] = [
    ["/tasks", "Task Manager", "task.svg", TaskPage],
    ["/info", "System Information", "stats.svg", SystemPage],
    ["/cameras", "Cameras", "camera.svg", CameraPage],
    ["/filesystem", "Filesystem", "filesystem.svg", FilePage],
    ["/screen", "Screen Share", "screenshare.svg", ScreenPage],
    ["/terminal", "Terminal", "terminal.svg", TerminalPage],
    ["/script", "Cron jobs", "cron.png", ScriptPage]
].map(pg => newPage.apply(null, pg))

const debugPage = newPage("/debug", "API Debug", "terminal.svg", DebugPage)

function NavItem(props: {className: string, path: string, label: string, icon: string}) {
    let {className, path, label, icon} = props
    return <li className={className}>
        <Link to={path}>
            <img src={require("icon/"+icon)} />
            <span className="tab-label">&nbsp; &nbsp; {label}</span>
        </Link>
    </li>
}

const fullHeight: React.CSSProperties = {
    height: "100%"
}

function TopBar({currentPage, children}: {
    currentPage: string, 
    children?: React.ReactElement<any> | React.ReactElement<any>[]
}) {
    let items = React.Children.map(children, (child: React.ReactElement<any>) => {
        return React.cloneElement(child, {className: "bar-item"})
    })
    return <div className="top-bar">
        <div className="page-title">{currentPage}</div>
        <div className="item-area">
            {items}
        </div>
    </div>
}

export default class App extends React.Component<{
    children?: any, 
    location?: any,
    appState?: AppState,
}, 
{
    app?: AppState,
    user?: UserInfo,
    showSettings?: boolean
}> {
    pathMap = {
        "/tasks": "Task Manager",
        "/info": "System Information",
        "/cameras": "Cameras",
        "/filesystem": "Filesystem",
        "/settings": "Settings",
        "/vnc": "VNC",
        "/screen": "Screen Share",
        "/terminal": "Terminal",
        "/debug": "API Debug",
        "/script": "Cron jobs"
    }
    constructor(props) {
        super(props)
        this.state = {showSettings: false}
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
    fullHeightIf(path: string) {
        return this.props.location.pathname == path ? {height: "100%"} : {}
    }
    logOut = () => {
        /*
        dialogEvents.dialog({
            title: "Disconnect?",
            body: <p>Are you sure you want to disconnect?</p>,
            buttons: [
                { bsStyle: "primary", children: "Yes", onClick: socket.disconnect },
                { bsStyle: "default", children: "No" }
            ]
        })
        */
        dialogEvents.dialog({
            title: "Disconnect?",
            body: <p>Are you sure you want to disconnect?</p>,
            buttons: [
                <Button bsStyle="primary" onClick={socket.disconnect}>Yes</Button>,
                <Button bsStyle="default">No</Button>
            ]
        })
    }
    mainContent() {
        let {app, showSettings} = this.state
        let path = this.props.location.pathname
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
        return <div style={fullHeight}>
            <Sidebar activePath={this.props.location.pathname} debugMenu={this.state.app.debugMenu}/>
            <ModalSettings show={showSettings} />
            <TopBar currentPage={this.pathMap[this.props.location.pathname] || "Task Manager"}>
                <div onClick={() => {
                    this.setState({showSettings: true})
                }}>
                    <Glyphicon glyph="cog" /> &nbsp; Settings
                </div>
                <div onClick={this.logOut}><Glyphicon glyph="log-out" /> &nbsp; Disconnect</div>
            </TopBar>
            <div className="page" style={fullHeight}>
                <div className="page-content container-fluid" style={fullHeight}>
                    {this.props.children}
                </div>
            </div>
        </div>
    }
    render() {
        return <div className="main" style={fullHeight}>
            <Messages />
            <DisconnectOverlay />
            {this.state.showSettings ? <Overlay onClick={() => {
                this.setState({showSettings: false})
                console.log("clicc")
            }} /> : null}
            <Dialogs />
            {this.mainContent()}
        </div>
    }
}


class Sidebar extends React.Component<{
    activePath: string,
    debugMenu: boolean
}, {
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
          return this.getActive(path) ? "active" : ""
    }
    getActive(path: string) {
        return this.props.activePath == path || (this.props.activePath == "/" && path == "/tasks")
    }
    debugItem() {
        if (this.props.debugMenu) {
            return <NavItem
                className={this.getActiveClassName("/debug")}
                path="/debug"
                icon="terminal.svg"
                label="API Debug"
            />
        }
        return null
    }
    sidebarContent() {
        return <div className="sidebar col-md-4" data-spy="affix">
            <div className="header">
                <img src={require("img/logo.png")} height="20" /> &nbsp; ULTERIUS
            </div>
            <UserWidget />
            <ul className="nav nav-pills nav-stacked">
                {pages.map(({route, icon, label}) => {
                    return <NavItem 
                        className={this.getActiveClassName(route)}
                        path={route}
                        icon={icon}
                        label={label}
                        key={route}
                    />
                })}
                {/*
                <NavItem 
                    className={
                        (this.getActive("/tasks") ||
                            this.getActive("/"))  ?  "active": ""} 
                    path="/tasks"
                    icon="task"
                    label="Task Manager" />
                <NavItem 
                    className={this.getActiveClassName("/info")} 
                    path="/info"
                    icon="stats"
                    label="System Information" />
                <NavItem 
                    className={this.getActiveClassName("/cameras")} 
                    path="/cameras"
                    icon="camera"
                    label="Cameras" />
                <NavItem 
                    className={this.getActiveClassName("/filesystem")} 
                    path="/filesystem"
                    icon="filesystem"
                    label="Filesystem" />
                <NavItem
                    className={this.getActiveClassName("/screen")}
                    path="/screen"
                    icon="screenshare"
                    label="Screen Share" />
                <NavItem
                    className={this.getActiveClassName("/terminal")}
                    path="/terminal"
                    icon="terminal"
                    label="Terminal" />
                <NavItem 
                    className={this.getActiveClassName("/script")}
                    path="/script"
                    icon="terminal"
                    label="Cron jobs" /> */}
                {this.debugItem()}
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

const routes = <Route path="/" component={App}>
            <IndexRoute component={TaskPage} />
            <Route path="tasks" component={TaskPage} />
            <Route path="info" component={SystemPage} />
            <Route path="cameras" component={CameraPage} />
            <Route path="filesystem" component={FilePage} />
            <Route path="screen" component={ScreenPage} />
            <Route path="terminal" component={TerminalPage} />
            <Route path="script" component={ScriptPage} />
            <Route path="debug" component={DebugPage} />
            {/* <Route path="plugin" component={PluginPage} /> 
            <Route path="settings" component={SettingsPage} />*/}
        </Route>

export class RootRouter extends React.Component<{}, {}> {
    render() {
        return <Router history={hashHistory}>
            {routes}
        </Router>
    }
}