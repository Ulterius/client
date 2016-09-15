import React = require("react")
import * as _ from "lodash"
import {omit, isEmpty, values, without, keys, concat} from "lodash"
import {terminalStore, TerminalState, FullTerminal} from "../store"
import {terminalActions} from "../action"
import {terminalApi} from "../api-layer"
import {TabPanel, TabPage, Center, EntryBox, Spinner} from "./"

export function TerminalPage() {
    return <div className="terminal-page">
        <Terminal />
    </div>
}

class InputEntry extends React.Component<{
    onChange?: (text: string) => any,
    onEntry?: (text: string) => any,
    invisible?: boolean
}, {}> {
    inputElement: HTMLSpanElement
    componentDidMount() {
        
    }
    render() {
        const {onChange, onEntry} = this.props
        let style = {
            outline: "none",
            MozUserSelect: "text",
            KhtmlUserSelect: "text",
            WebkitUserSelect: "text",
            OUserSelect: "text",
            paddingLeft: 3,
            paddingRight: 3
        }
        if (this.props.invisible) {
            style["opacity"] = "0"
        }
        return <span
            contentEditable
            style={style}
            ref={ref => {
                if (ref != null) {
                    //ref.innerText = "&nbsp;"
                }
                this.inputElement = ref
            }}
            onInput={e => {
                let ea = e as any
                onChange && onChange(ea.target.innerText)
                if (ea.target.innerText.indexOf("\n") != -1) {
                    ea.target.innerText = ""
                }
            }}
            onKeyDown={e => {
                if (e.keyCode  == 13) {
                    onEntry && onEntry(this.inputElement.innerText)
                }
            }}></span>
    }
}

interface TermComponentState {
    store?: TerminalState,
    activeTerminal?: number,
    newTerminalPending?: boolean
}

export class Terminal extends React.Component<{}, TermComponentState> {
    terminalElement: HTMLDivElement
    constructor(props, context) {
        super(props, context)
        this.state = {
            activeTerminal: 0,
            newTerminalPending: true,
        }
        this.state.store = terminalStore.getState()
    }
    componentDidMount() {
        this.setStore(terminalStore.getState())
        terminalStore.listen(this.setStore)
    }
    componentWillUnmount() {
        terminalStore.unlisten(this.setStore)
    }
    inRealTerminal() {
        return !!(this.state.store && this.state.store.orderedTerminals[this.state.activeTerminal])
    }
    currentTerminal() {
        return this.state.store.orderedTerminals[this.state.activeTerminal]
    }
    terminalIn(terminal: FullTerminal, terminals: FullTerminal[]) {
        return terminals.some(t => t.descriptor.id === terminal.descriptor.id)
    }
    setStore = (store: TerminalState) => {
        this.setState({store})
        if (this.terminalElement) {
            this.terminalElement.scrollTop = this.terminalElement.scrollHeight
        }
    }
    isHidden(terminal: FullTerminal) {
        //return terminal.lines[terminal.lines.length-1]
                    //.output.indexOf("password") != -1
        return terminal.lines[terminal.lines.length-1] && 
            terminal.lines[terminal.lines.length-1].sensitive
    }
    isIndexSensitive(terminal: FullTerminal, index: number) {
        return terminal.lines[index] && terminal.lines[index].sensitive
    }
    newTerminal() {
        let {waitingForNewTerminal} = this.state.store
        let newTerminalContent
        if (waitingForNewTerminal) {
            newTerminalContent = <div className="new-terminal">
                <Spinner />
            </div>
        }
        else {
            newTerminalContent = <div className="new-terminal">
                <h2>Create New Terminal</h2>
                <datalist id="shells">
                    <option value="cmd.exe" />
                    <option value="powershell" />
                </datalist>
                <EntryBox 
                    onConfirmation={text => {
                        this.setState({newTerminalPending: false})
                        terminalApi.create(text)
                    }}
                    placeholder="Enter shell executable..."
                    glyph="chevron-right"
                    list="shells"
                />
            </div>
        }
        return <div className="pseudo-terminal">
            <Center>
                {newTerminalContent}
            </Center>
        </div>
    }
    getTerminalElement(terminalIndex: number) {
        const emptyTerminal: FullTerminal = {
            lines: [{
                correlationId: 0, 
                sensitive: false, 
                output: "Please wait..."
            }], 
            endOfCommand: false, 
            descriptor: {
                id: "", 
                terminalType: "", 
                currentPath: ""
            }
        }
        let {orderedTerminals} = this.state.store
        //const terminal = this.state.store.orderedTerminals[terminalIndex] || emptyTerminal
        
        let displayTerminal
        if (orderedTerminals[terminalIndex]) {
            const terminal = orderedTerminals[terminalIndex]
            displayTerminal = <div className="terminal" ref={ref => {
                this.terminalElement = ref
                if (this.terminalElement) {
                    this.terminalElement.scrollTop = this.terminalElement.scrollHeight
                }
            }}>
                {terminal.lines.map((line, lineNo) => {
                        return <pre 
                            key={lineNo} 
                        >
                            {this.isIndexSensitive(terminal, lineNo-1) ? " " : line.output}
                        </pre>
                    })
                }
                <p>
                    {terminal.endOfCommand ? terminal.descriptor.currentPath +">": null}
                    <InputEntry
                        invisible={this.isHidden(terminal)}
                        onEntry={text => {
                            terminalActions.output({
                                terminalId: terminal.descriptor.id, 
                                output: terminal.descriptor.currentPath + ">" + text,
                            })
                            terminalApi.send(text, terminal.descriptor.id)
                        }} 
                    />
                </p>
            </div>
        }
        else {
            displayTerminal = this.newTerminal()
        }

        return displayTerminal
        /*
        return <div style={terminalStyle} ref={ref => {
            this.terminalElement = ref
            if (this.terminalElement) {
                this.terminalElement.scrollTop = this.terminalElement.scrollHeight
            }
        }}>
            {_.map(terminals, (terminal, id) => {
                return terminal.lines.map((line, lineNo) => {
                    return <pre 
                        key={lineNo} 
                    >
                        {this.isIndexSensitive(terminal, lineNo-1) ? " " : line.output}
                    </pre>
                })
            })}
            {_.map(terminals, (terminal, id) => {
                return <p>
                    {terminal.endOfCommand ? terminal.descriptor.currentPath +">": null}
                    <InputEntry
                        invisible={this.isHidden(terminal)}
                        onEntry={text => {
                            terminalActions.output({
                                terminalId: terminal.descriptor.id, 
                                output: terminal.descriptor.currentPath + ">" + text,
                            })
                            terminalApi.send(text, terminal.descriptor.id)
                        }} 
                    />
                </p>
            })}
        </div>
        */
    }
    closeTerminal(index: number) {
        let {orderedTerminals} = this.state.store
        let {activeTerminal} = this.state
        if (orderedTerminals[index]) {
            if (activeTerminal >= index && activeTerminal !== 0) {
                this.setState({activeTerminal: activeTerminal - 1})
            }
            terminalApi.close(orderedTerminals[index].descriptor.id)
        }
        else if (orderedTerminals.length > 0){
            this.setState({newTerminalPending: false})
        }
    }
    render() {
        
        let {terminals, orderedTerminals, waitingForNewTerminal} = this.state.store
        let {newTerminalPending} = this.state
        let titles = orderedTerminals.map(terminal => 
            terminal.descriptor.terminalType + " - " + terminal.descriptor.currentPath)
        if (newTerminalPending || waitingForNewTerminal) {
            titles.push("New Terminal")
        }
        return <div style={{height: "100%"}}>
            <TabPanel 
                style={{height: "100%"}} 
                virtualTabs={titles} 
                currentTab={this.state.activeTerminal}
                onAdd={() => {
                    this.setState({
                        newTerminalPending: true,
                        activeTerminal: orderedTerminals.length
                    })
                }}
                onChangeTab={newTab => this.setState({activeTerminal: newTab})}
                onClose={i => this.closeTerminal(i)}
            >
                {this.getTerminalElement(this.state.activeTerminal)}
            </TabPanel>
        </div>
        
    }
}

