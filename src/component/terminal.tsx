import React = require("react")
import * as _ from "lodash"
import {terminalStore, TerminalState, FullTerminal} from "../store"
import {terminalActions} from "../action"
import {terminalApi} from "../api-layer"

export function TerminalPage() {
    return <Terminal />
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
            "-moz-user-select": "text",
            "-khtml-user-select": "text",
            "-webkit-user-select": "text",
            "-o-user-select": "text",
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

const terminalStyle: React.CSSProperties = {
    backgroundColor: "black",
    color: "white",
    padding: 10,
    fontFamily: "menlo, monaco, consolas, monospace",
    height: "100%",
    lineHeight: "10px",
    overflow: "auto",
    fontSize: "14px"
}

const inputStyle: React.CSSProperties = {
    border: "none",
    backgroundColor: "black",
    color: "white",
    fontFamily: "menlo, monaco, consolas, monospace",
    outline: "none"
}

interface TermComponentState {
    store?: TerminalState
}

export class Terminal extends React.Component<{}, TermComponentState> {
    terminalElement: HTMLDivElement
    constructor(props, context) {
        super(props, context)
        this.state = {}
    }
    componentWillMount() {
        this.setStore(terminalStore.getState())
        terminalStore.listen(this.setStore)
    }
    componentWillUnmount() {
        terminalStore.unlisten(this.setStore)
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
    render() {
        const {terminals} = this.state.store
        return <div style={{height: "100%"}}>
            {/*JSON.stringify(this.state.store)*/}
            <div style={terminalStyle} ref={ref => {
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
        </div>
    }
}

