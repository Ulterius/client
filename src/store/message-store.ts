import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {messageActions} from "../action"
import * as _ from "lodash"

export interface Message {
    style: string, //bootstrap styles: primary, default, success, warning, danger
    text: string
}

export interface MessageState{
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