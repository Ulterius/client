import alt from "../alt"
import AbstractActions from "./abstract-actions"

interface MessageActionFunctions {
    plainMessage(message: string): string
    processHasBeenKilled(process: KilledProcessInfo): string
}

class MessageActions extends AbstractActions implements MessageActionFunctions {
    processHasBeenKilled(process: KilledProcessInfo) {
        return "Process killed: " + process.processName + ", ID: " + process.processName
    }
    plainMessage(message: string) {
        return message
    }
}

export let messageActions = alt.createActions<MessageActionFunctions>(MessageActions)
