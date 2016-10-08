import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {messageActions, dialogActions} from "../action"
import * as _ from "lodash"

let currentKey = 0
function nextKey() {
    currentKey++
    return currentKey
}

export interface Message {
    style: string, //bootstrap styles: primary, default, success, warning, danger
    text: string
}

export interface KeyedMessage extends Message {
    key: number
}

export interface MessageState {
    messages: KeyedMessage[]
}

class MessageStore extends AbstractStoreModel<MessageState> {
    messages: KeyedMessage[] = []
    constructor() {
        super()
        this.bindListeners({
            handleMessage: [
                messageActions.message,
                messageActions.msg,
                messageActions.plainMessage,
                messageActions.processHasBeenKilled
            ]
        })
    }
    handleMessage(message: Message) {
        let fullMessage = _.assign({}, message, {key: nextKey()})
        this.messages.push(fullMessage)
        setTimeout(() => {
            this.setState({messages: this.messages.filter(msg => msg != fullMessage)})
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