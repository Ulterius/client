
import React = require("react")
import {GpuAvailability, bytesToSize} from "../util"
import {systemStore, auxillarySystemStore, userStore} from "../store/system-stores"
import {listen} from "../api-layer"
import * as _ from "lodash"


export function Bar(props: {value?: number, color?: boolean, style?: any}) {
    if (!props.value) {
        return <div className="progress" style={props.style || {}}>
            <div 
            className="progress-bar progress-bar-primary progress-bar-striped active" 
            aria-valuenow="100" 
            aria-valuemin="0"
            aria-valuemax="100"
            style={{
                width: `${100}%`,
                minWidth: "0%"
            }}>>
            </div>
        </div>
    }
    let percent = props.value
    return <div className="progress" style={props.style || {}}>
        <div
        className={
            "progress-bar progress-bar-" +
            (percent < 60 ? "primary":
                (percent < 80 ? "warning" : "danger"))
        }
        aria-valuenow={percent.toString()}
        aria-valuemin="0"
        aria-valuemax="100"
        style={{
            width: `${percent}%`,
            minWidth: "0%"
        }}>
        </div>
    </div>
}

export class Bars extends React.Component<{ values: [string, number][] }, {}> {
    constructor(props) {
        super(props)
    }
    render() {
        return <div>
            {this.props.values.map(value => {
                let [name, percent] = value
                return (
                    <div style={{marginBottom: 5}}>
                    {name} {percent.toFixed(0) + "%"}<br />
                    <Bar value={percent} style={{width: "100%"}}/>
                    </div>
                )
            })}
        </div>
    }
}

export function IconMedia(props: {
    src: string, 
    alt: string, 
    size: [number, number], 
    children?: any
}) {
    return <div className="media icon-media">
        <div className="media-left">
            <div className="icon">
                <img className="media-object"
                    width={props.size[0].toString()}
                    height={props.size[1].toString()}
                    src={props.src}
                    alt={props.alt} />
            </div>
        </div>
        <div className="media-body">
            {props.children}
        </div>
    </div>
}

export function Temperature(props: {children?: any}) {
    let degs = Number(props.children)
    let color = (degs < 60 ? "primary" : (degs < 80 ? "warning" : "danger"))
    let extra = (degs > 90 ? "burning" : "")
    return <span className={"label label-" + color + " " + extra}>
        {props.children} {"°C"}
    </span>
}

export class UserWidget extends React.Component<{}, {user: UserInfo}> {
    constructor(props) {
        super(props)
        this.state = {user: null}
    }
    componentDidMount() {
        this.updateUser(userStore.getState())
        userStore.listen(this.updateUser)
    }
    componentWillUnmount() {
        userStore.unlisten(this.updateUser)
    }
    updateUser = (state) => {
        this.setState(state)
    }
    render() {
        if (!this.state.user) {
            return <div style={{float: "right"}}>Loading user...</div>
        }

        let {avatar, username} = this.state.user
        return <div className="user-widget">
            <Base64Img src={"data:image/png;base64," + avatar} className="img-circle" width="64" height="64" alt="avatar" />
            <div style={{marginTop: 5}}>{username}</div>
        </div>

    }
}

export function Base64Img(props: {type?: string, data?: string, [key:string]: any}) {
    const {type, data} = props
    const other = _.omit(props, ["type", "data"])
    return <img src={`data:${type};base64,${data}`} {...other} />
}

import {MessageState, messageStore} from "../store"
import {Alert} from "react-bootstrap"
import ReactCSSTransitionGroup = require("react-addons-css-transition-group")

export function FadeTransition(props: {children?: any}) {
    return <ReactCSSTransitionGroup 
        transitionName={"fade"}
        transitionAppear={false} 
        transitionEnterTimeout={300} 
        transitionAppearTimeout={300} 
        transitionLeaveTimeout={300}>
        {props.children}
    </ReactCSSTransitionGroup>
}

export function SlideTransition(props: {children?: any}) {
    return <ReactCSSTransitionGroup 
        transitionName={"slide"}
        transitionAppear={true} 
        transitionEnterTimeout={300} 
        transitionAppearTimeout={300} 
        transitionLeaveTimeout={300}>
        {props.children}
    </ReactCSSTransitionGroup>
}

export class Messages extends React.Component<{}, MessageState> {
    componentDidMount() {
        this.updateMessages(messageStore.getState())
        messageStore.listen(this.updateMessages)
    }
    componentWillUnmount() {
        messageStore.unlisten(this.updateMessages)
    }
    updateMessages = (state) => {
        this.setState(state)
    }
    
    render() {
        if (!this.state) {
            return <div className="messages"></div>
        }
        let style = {
            zIndex: 9001,
            position: "fixed",
            
        }
        return <div style={{
            zIndex: 9001,
            position: "fixed",
            bottom: 10,
            right: 10
        }}>
            <FadeTransition>
            {
                this.state.messages.map((msg, i) => {
                    return <Alert key={i} bsStyle={msg.style}>{msg.text}</Alert>
                
                })
            }
            </FadeTransition>
        </div>
    }
}

import {Input, Button, Glyphicon} from "react-bootstrap"

export class EntryBox extends React.Component<
    {
        onConfirmation: (text: string) => any, 
        glyph: string, 
        buttonStyle?: string,
        placeholder?: string,
        type?: string,
        defaultValue?: string
    }, 
    {text?: string, customized?: boolean}> {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const confirmButton = 
            <Button
            bsStyle={this.props.buttonStyle || "primary"}
            onClick={() => {this.props.onConfirmation(this.state.text)}}>
                <Glyphicon glyph={this.props.glyph} />
            </Button>
        return ( 
            <Input
            type={this.props.type || "text"}
            placeholder={this.props.placeholder || ""}
            buttonAfter={confirmButton}
            onChange={e => this.setState({text: e.target.value, customized: true})}
            value={this.state.customized ? this.state.text : this.props.defaultValue}
            onKeyDown={e => {
                if (e.keyCode == 13) {
                    this.props.onConfirmation(this.state.text)
                }
            }} />
        )
        
    }
}

export function LoadingScreen(props: {percentage?: number, caption?: string}) {
    return <div style={{width: "100%", height: "100%"}}>
        <div style={{position: "absolute", top: "calc(50% - 20px)", left:"calc(50% - 60px)", height: 40, width: 120, textAlign: "center"}}>
            <Bar value={props.percentage} /> <br />
            {props.caption}
        </div>
    </div>
}