import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {messageActions, dialogActions} from "../action"
import * as _ from "lodash"

export interface Message {
    style: string, //bootstrap styles: primary, default, success, warning, danger
    text: string
}

export interface MessageState {
    messages: Message[]
}

class MessageStore extends AbstractStoreModel<MessageState> {
    messages: Message[] = []
    constructor() {
        super()
        this.bindListeners({
            handleMessage: [
                messageActions.message,
                messageActions.plainMessage,
                messageActions.processHasBeenKilled
            ]
        })
    }
    handleMessage(message: Message) {
        this.messages.push(message)
        setTimeout(() => {
            this.setState({messages: this.messages.filter(msg => msg != message)})
        }, 3000)
    }
}

export let messageStore = alt.createStore<MessageState>(MessageStore, "MessageStore")



export interface DialogState {
    dialogs: DialogContent[]
}

class DialogStore extends AbstractStoreModel<DialogState> {
    dialogs: DialogContent[] = []
    constructor() {
        super()
        this.bindListeners({
            addDialog: dialogActions.showDialog,
            closeFirstDialog: dialogActions.closeFirstDialog
        })
    }
    addDialog(dialog: DialogContent) {
        this.dialogs.push(dialog)
    }
    closeFirstDialog() {
        this.dialogs.shift()
    }
}

export let dialogStore = alt.createStore<DialogState>(DialogStore, "DialogStore")