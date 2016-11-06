import React = require("react")
import {Modal, Button} from "react-bootstrap"
import Component = React.Component
import {dialogStore, DialogState} from "../store"
import {dialogActions} from "../action"
import events = require("events")
import ReactMarkdown = require("react-markdown")
import * as _ from "lodash"

export class Dialog extends React.Component<{}, DialogState> {
    componentDidMount() {
        this.onChange(dialogStore.getState())
        dialogStore.listen(this.onChange)
    }
    componentWillUnmount() {
        dialogStore.unlisten(this.onChange)
    }
    onChange = (state: DialogState) => {
        this.setState(state)
    }
    close = () => {
        dialogActions.closeFirstDialog()
    }
    render() {
        if (!this.state || this.state.dialogs.length == 0) {
            return <div style={{display: "none"}}></div>
        }
            
        let {dialogs} = this.state
        let dialog = dialogs[0]
        return <Modal show={dialogs.length > 0} onHide={this.close}>
            <Modal.Header closeButton>
                <Modal.Title>{dialog.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {dialog.body}
            </Modal.Body>
            <Modal.Footer>
                <Button bsStyle="primary" onClick={this.close}>Close</Button>
            </Modal.Footer>
        </Modal>
    }
}

export interface dialogContent {
    title: string, 
    body: React.ReactNode | string,
    buttons?: any[],
    onClose?: () => any
}

//use this pattern instead of an event emitter because I want to keep type safety
export let dialogEvents = {
    dialog(content: dialogContent) {}
}

export class Dialogs extends React.Component<{}, {
    dialogs: dialogContent[]
}> {
    lastDialog: dialogContent
    constructor(props) {
        super(props)
        this.state = {dialogs: []}
    }
    componentDidMount() {
        dialogEvents.dialog = this.addDialog
    }
    componentWillUnmount() {
        dialogEvents.dialog = () => {}
    }
    addDialog = (content: dialogContent) => {
        this.setState((prevState, props) => {
            return {dialogs: _.flatten([content, prevState.dialogs])}
        })
    }
    closeFirstDialog() {
        let {dialogs} = this.state
        if (dialogs[0] && dialogs[0].onClose) {
            dialogs[0].onClose()
        }
        if (dialogs.length == 1) {
            this.lastDialog = dialogs[0]
        }
        if (dialogs.length > 0) {
            this.setState({dialogs: _.tail(dialogs)})
        }
    }
    render() {
        /*
        if (this.state.dialogs.length == 0) {
            return <div style={{display: "none"}}></div>
        }
        */
        
        let {dialogs} = this.state
        let dialog = dialogs[0] || this.lastDialog //the things I do for proper animations...
        let buttons
        if (dialog) {
            if (dialog.buttons) {
                buttons = dialog.buttons.map(btn => {
                    return React.cloneElement(btn, {onClick: () => {
                        if (btn.props.onClick) {
                            btn.props.onClick()
                        }
                        this.closeFirstDialog()
                    }})
                })
            }
            else {
                buttons = <Button onClick={() => this.closeFirstDialog()}>Close</Button>
            }
        }
        
        return <div>
            <Modal show={dialogs.length > 0} onHide={() => {}}>
                <Modal.Header>
                    <Modal.Title>{dialog ? dialog.title : ""}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {dialog ? (
                        typeof dialog.body !== "string" ? 
                            dialog.body : <ReactMarkdown source={dialog.body as string} />
                    ) : ""}
                </Modal.Body>
                <Modal.Footer>
                    {buttons || null}
                    {/* dialog? dialog.buttons.map((props, i) => {
                        return <Button {...props} key={i} onClick={() => {
                            if (typeof props.onClick == "function") {
                                props.onClick()
                            }
                            
                            this.closeFirstDialog()
                        }} />
                    }): "" */}

                </Modal.Footer>
            </Modal>
        </div>
    }
}