import alt from "../alt"
import AbstractActions from "./abstract-actions"
import {Message} from "../store"

interface MessageActionFunctions {
    plainMessage(message: string): Message
    processHasBeenKilled(process: KilledProcessInfo): Message
    message(message: Message): Message
}

class MessageActions extends AbstractActions implements MessageActionFunctions {
    processHasBeenKilled(process: KilledProcessInfo) {
        return {
            style: "success",
            text: "Process killed: " + process.processName + ", ID: " + process.processName
        }
    }
    plainMessage(message: string) {
        return {
            style: "info",
            text: message
        }
    }
    message(message: Message) {
        return message
    }
}

export let messageActions = alt.createActions<MessageActionFunctions>(MessageActions)
