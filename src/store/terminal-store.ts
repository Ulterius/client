import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {terminalActions as tA} from "../action"
import Ti = TerminalInfo


export interface FullTerminal {
    descriptor: TerminalInfo.Terminal,
    lines: TerminalInfo.Line[],
    endOfCommand: boolean
}

function createFullTerminal(descriptor: Ti.Terminal): FullTerminal {
    return {
        lines: [],
        descriptor,
        endOfCommand: true
    }
}

export interface TerminalState {
    terminals: {[key: string]: FullTerminal}
}

class TerminalStore extends AbstractStoreModel<TerminalState> {
    terminals: {[key: string]: FullTerminal} = {}

    constructor() {
        super()
        this.bindListeners({
            handleAddTerminal: tA.addTerminal,
            handleOutput: tA.output
        })
    }

    handleAddTerminal(descriptor: Ti.Terminal) {
        this.terminals[descriptor.id] = createFullTerminal(descriptor)
    }
    
    handleOutput(out: Ti.Output) {
        let id = out.terminalId
        let {correlationId, output, sensitive, endOfCommand} = out
        if (this.terminals[id]) {
            this.terminals[id].lines.push({correlationId, output, sensitive})
            this.terminals[id].endOfCommand = endOfCommand
        }
    }
}

export let terminalStore = alt.createStore<TerminalState>(TerminalStore, "TerminalStore")
export default terminalStore
