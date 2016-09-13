import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {terminalActions as tA, messageActions} from "../action"
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
    waitingForNewTerminal: boolean,
    terminals: {[key: string]: FullTerminal},
    orderedTerminals: FullTerminal[]
}

class TerminalStore extends AbstractStoreModel<TerminalState> {
    terminals: {[key: string]: FullTerminal} = {}
    orderedTerminals: FullTerminal[] = []
    waitingForNewTerminal = false

    constructor() {
        super()
        this.bindListeners({
            handleAddTerminal: tA.addTerminal,
            handleRemoveTerminal: tA.removeTerminal,
            handleOutput: tA.output,
            handleExpectTerminal: tA.expectTerminal
        })
    }

    handleRemoveTerminal(id: string) {
        let terminal = this.terminals[id]
        if (terminal) {
            console.log(this.orderedTerminals)
            console.log(_.without(this.orderedTerminals, terminal))
            
            this.orderedTerminals = _.without(this.orderedTerminals, terminal)
            delete this.terminals[id]
        }
    }

    handleExpectTerminal() {
        this.waitingForNewTerminal = true
        setTimeout(() => {
            if (this.waitingForNewTerminal) {
                this.setState({waitingForNewTerminal: false})
                messageActions.message({style: "danger", text: "Terminal creation timed out."})
            }
        }, 5000)
    }

    handleAddTerminal(descriptor: Ti.Terminal) {
        this.waitingForNewTerminal = false
        let terminal = createFullTerminal(descriptor)
        this.terminals[descriptor.id] = terminal
        this.orderedTerminals.push(terminal)
    }
    
    handleOutput(out: Ti.Output) {
        let id = out.terminalId
        if (this.terminals[id]) {
            let {correlationId, output, sensitive, endOfCommand} = out
            let lines = this.terminals[id].lines
            this.terminals[id].lines.push({correlationId, output, sensitive})
            this.terminals[id].endOfCommand = endOfCommand
            this.terminals[id].descriptor.currentPath = out.currentPath
            if (endOfCommand && lines.length > 100) {
                this.terminals[id].lines = lines.slice(lines.length-100)
            }
        }
    }
}

export let terminalStore = alt.createStore<TerminalState>(TerminalStore, "TerminalStore")
export default terminalStore
