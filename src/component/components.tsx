
import React = require("react")
import {GpuAvailability, bytesToSize} from "../util"
import {systemStore, auxillarySystemStore, userStore} from "../store/system-stores"
import * as _ from "lodash"


export function Bar(props: {value: number, style?: any}) {
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
        return (
            <div>
            {
                this.props.values.map(value => {
                    let [name, percent] = value
                    return (
                        <div style={{marginBottom: 5}}>
                        {name} {percent.toFixed(0) + "%"}<br />
                        <Bar value={percent} style={{width: "100%"}}/>
                        </div>
                    )
                })
            }
            </div>
        )
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

export class Modal extends React.Component<{children?: any}, {}> {
    render() {
        return <div>
            <div className='modal-backdrop in' />
            <div
            className="modal in"
            tabIndex={-1}
            role="dialog"
            style={{display: "block"}}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        {this.props.children}
                    </div>
                </div>
            </div>
        </div>
    }
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
        if (this.state.user) {
            let {avatar, username} = this.state.user
            return <div className="user-widget">
                <Base64Img src={"data:image/png;base64," + avatar} className="img-circle" width="64" height="64" alt="avatar" />
                <div style={{marginTop: 5}}>{username}</div>
            </div>
        }
        else {
            return <div style={{float: "right"}}>Loading user...</div>
        }
    }
}

export function Base64Img(props: {type?: string, data?: string, [key:string]: any}) {
    const {type, data} = props
    const other = _.omit(props, ["type", "data"])
    return <img src={`data:${type};base64,${data}`} {...other} />
}

import {MessageState, messageStore} from "../store"
import {Alert} from "react-bootstrap"

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
        if (this.state) {
            return <div style={{zIndex: 9001}} className="messages">
            {
                this.state.messages.map(msg => {
                    return <Alert bsStyle={msg.style}>{msg.text}</Alert>
                })
            }
            </div>
        }
        else {
            return <div className="messages"></div>
        }
    }
}