import React = require("react")
import * as _ from "lodash"
import {terminalStore, TerminalState} from "../store"
import {terminalActions} from "../action"
import {terminalApi} from "../api-layer"

export function TerminalPage() {
    return <Terminal />
}

class InputEntry extends React.Component<{
    onChange?: (text: string) => any,
    onEntry?: (text: string) => any
}, {}> {
    inputElement: HTMLSpanElement
    render() {
        const {onChange, onEntry} = this.props
        return <span
            contentEditable
            style={{outline: "none"}}
            ref={ref => this.inputElement = ref}
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

const terminalStyle: React.CSSProperties = {
    backgroundColor: "black",
    color: "white",
    padding: 10,
    fontFamily: "monospace",
    height: "100%",
    lineHeight: "10px",
    overflow: "auto"
}

const inputStyle: React.CSSProperties = {
    border: "none",
    backgroundColor: "black",
    color: "white",
    fontFamily: "monospace",
    outline: "none"
}

interface TermComponentState {
    store?: TerminalState,
}

export class Terminal extends React.Component<{}, TermComponentState> {
    componentWillMount() {
        this.setStore(terminalStore.getState())
        terminalStore.listen(this.setStore)
    }
    componentWillUnmount() {
        terminalStore.unlisten(this.setStore)
    }
    setStore = (store: TerminalState) => {
        this.setState({store})
    }
    render() {
        const {terminals} = this.state.store
        return <div style={{height: "100%"}}>
            {/*JSON.stringify(this.state.store)*/}
            <div style={terminalStyle}>
                {_.map(terminals, (terminal, id) => {
                    return terminal.lines.map(line => {
                        return <p>{line}</p>
                    })
                })}
                {_.map(terminals, (terminal, id) => {
                    return <p>
                        {terminal.descriptor.currentPath}{">"}
                        <InputEntry
                            onEntry={text => {
                                terminalActions.output({
                                    terminalId: terminal.descriptor.id, 
                                    output: terminal.descriptor.currentPath + ">" + text
                                })
                                terminalApi.send(text, terminal.descriptor.id)
                            }} 
                        />
                    </p>
                })}
            </div>
        </div>
    }
}

