import React = require("react")
import {Modal, Button} from "react-bootstrap"
import Component = React.Component
import {dialogStore, DialogState} from "../store"
import {dialogActions} from "../action"

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
        if (!this.state || this.state.dialogs.length == 0)
            return <div style={{display: "none"}}></div>
            
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