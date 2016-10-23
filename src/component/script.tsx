import React = require("react")
import {
    scriptStore, 
    ScriptState, 
    blankScript, 
    scriptById, 
    activeScriptOf
} from "../store"
import {scriptApi as api} from "../api-layer"
import {scriptActions} from "../action"
import {
    glyphicon, 
    Toolbar, ToolbarButton as TButton,
    ToolbarTextBox as TTextBox, TextInput,
    ToolbarLabel as TLabel,
    ToolbarRightAlign as TRightAlign,
    Either, Left, Right,
    LovelyStyledTree
} from "./"
import classNames = require("classnames")
import Component = React.Component
import CodeMirror = require("react-codemirror")
import JSONTree from "react-json-tree"
import {pick, assign, merge} from "lodash"
import cronstrue = require("cronstrue")
require("codemirror/mode/powershell/powershell")

interface ScriptPageState extends ScriptState {
    editorText?: string
    scheduleText?: string
    nameText?: string
    activeScriptType?: string
}

interface ListToolbarProps {
    onNew: () => void
    daemonRunning: boolean
}
function ListToolbar({onNew, daemonRunning}: ListToolbarProps) {
    return <Toolbar>
        <TButton btnStyle="primary" onClick={onNew}>
            {glyphicon("plus")}
        </TButton>
        <TRightAlign>
            <TLabel>{daemonRunning ? "Daemon running" : " Daemon stopped"}</TLabel>
            {(() => {
                if (daemonRunning) {
                    return <TButton icon="stop" onClick={() => api.daemon.stop()}>
                        Stop
                    </TButton>
                }
                else {
                    return <TButton icon="play" onClick={() => api.daemon.start()}>
                        Start
                    </TButton>
                }
            })()}
        </TRightAlign>
    </Toolbar>
}

export class ScriptPage extends Component<{}, ScriptPageState> {
    constructor(props, context) {
        super(props, context)
        this.state = {
            scripts: [],
            daemonRunning: false,
            editorText: "",
            scheduleText: "",
            nameText: ""
        }
    }
    componentDidMount() {
        this.setStore(scriptStore.getState())
        scriptStore.listen(this.setStore)
        api.daemon.getStatus()
        api.getAll()
    }
    componentWillUnmount() {
        this.saveLocally()
        scriptStore.unlisten(this.setStore)
    }
    setStore = (store: ScriptState) => {
        this.setState(prevState => {
            let newState = store
            const newActiveScript = activeScriptOf(newState)
            const activeScript = activeScriptOf(prevState)
            console.log(newState.activeScriptId, prevState.activeScriptId)
            if (newState.activeScriptId && 
                (newState.activeScriptId != prevState.activeScriptId) || 
                (activeScript == undefined && newActiveScript != undefined) ||
                (activeScript && newActiveScript)) 
            {
                assign(newState, {
                    editorText: newActiveScript.ScriptContents,
                    scheduleText: newActiveScript.Schedule,
                    nameText: newActiveScript.Name,
                    activeScriptType: newActiveScript.Type
                })
                console.log("text changed m8y")
            }
            else if (activeScript != undefined && newActiveScript == undefined) {
                assign(newState, {
                    editorText: "",
                    scheduleText: "",
                    nameText: "",
                    activeScriptType: "cmd"
                })
            }
            return newState
        })
    }
    onScheduleChange = (e: React.FormEvent) => {
        if (!!this.state.activeScriptId) {
            this.setState({scheduleText: (e.target as any).value})
        }
    }
    onNameChange = (e: React.FormEvent) => {
        if (!!this.state.activeScriptId) {
            this.setState({nameText: (e.target as any).value})
        }
    }
    onTypeChange = (e: React.FormEvent) => {
        if (!!this.state.activeScriptId) {
            this.setState({activeScriptType: (e.target as any).value})
        }
    }
    save = (callback: (sc: ScriptInfo.FullScript) => any) => {
        const {scripts, activeScriptId} = this.state
        const {scheduleText, editorText, nameText, activeScriptType} = this.state
        //editor haet multiline destructured assignments

        if (!activeScriptId) {
            return;
        }
        const changedScript = assign({}, scriptById(scripts, activeScriptId))
        if (editorText == changedScript.ScriptContents &&
            scheduleText == changedScript.Schedule &&
            nameText == changedScript.Name &&
            activeScriptType == changedScript.Type) 
        {
            return;
        }
        if (editorText != changedScript.ScriptContents) {
            changedScript.ScriptContents = editorText
        }
        if (scheduleText != changedScript.Schedule) {
            changedScript.Schedule = scheduleText
        }
        if (nameText != changedScript.Name) {
            changedScript.Name = nameText
        }
        if (activeScriptType != changedScript.Type) {
            changedScript.Type = activeScriptType
        }
        console.log(activeScriptId)
        callback(changedScript)
    }
    saveLocally() {
        this.save(scriptActions.mergeLocally)
    }
    saveToServer = () => {
        this.save(api.addOrUpdate)
    }
    activeScript() {
        return scriptById(this.state.scripts, this.state.activeScriptId)
    }
    changeTab(id: string) {
        this.saveLocally()
        scriptActions.setActive(id)
    }
    scheduleBox() {
        const {scheduleText, activeScriptId, daemonRunning} = this.state
        let scheduleDescription = "No schedule."
        let endSegment = daemonRunning ? "." : ", when the daemon is started."
        if (activeScriptId) {
            try {
                let cron = cronstrue.toString(scheduleText)
                cron = cron[0].toLowerCase() + cron.slice(1)
                scheduleDescription = "Script will run " + cron + endSegment
            }
            catch (e) {
                scheduleDescription = e
            }
            return <div className="schedule-box">
                {scheduleDescription}
            </div>
        }
    }
    render() {
        const {scripts, activeScriptId, editorText} = this.state
        const {scheduleText, nameText, daemonRunning, activeScriptType} = this.state
        const activeScript = this.activeScript()
        

        return <div className="full-height script-page">
            <div className="script-panel">
                <div className="script-list">
                    <ListToolbar daemonRunning={daemonRunning} onNew={() => {
                        const newScript = blankScript()
                        scriptActions.mergeLocally(newScript)
                        this.changeTab(newScript.Guid)
                        //scriptActions.setActive(newScript.Guid)
                    }} />
                    <div className="script-list-body"> 
                        <ul className="scripts">
                            {scripts.map(script => (
                                <li key={script.Guid} 
                                className={classNames({
                                    active: script.Guid === activeScriptId
                                })}
                                onClick={() => {
                                    this.changeTab(script.Guid)
                                }}>
                                    {script.Name}
                                </li>
                            ))}
                        </ul>
                        {/*
                        <LovelyStyledTree data={pick(this.state, 
                            "activeScript", "scripts", "daemonRunning"
                        )} /> */}
                    </div>
                </div>
                <div className="script-editor">
                    <Toolbar>
                        <TButton 
                            mergeRight 
                            icon="floppy-disk" 
                            onClick={this.saveToServer}
                        >
                            Save
                        </TButton>
                        <TButton icon="trash" onClick={() => api.remove(activeScriptId)}>
                            Delete
                        </TButton>
                        <TTextBox style={{width: 200}}>
                            <TextInput 
                                value={nameText}
                                onChange={this.onNameChange}
                                leftAddon={"Name"}
                            />
                        </TTextBox>
                        <TTextBox style={{width: 200}}>
                                <TextInput 
                                    value={this.state.scheduleText}
                                    onChange={this.onScheduleChange}
                                    leftAddon={"Schedule"}
                                />
                        </TTextBox>
                        <TRightAlign>
                            <TLabel className="dark-label-text">type</TLabel>
                            <select 
                                className="script-type-select" 
                                value={activeScriptType} 
                                onChange={this.onTypeChange}
                            >
                                <option value="cmd">cmd</option>
                                <option value="Powershell">Powershell</option>
                            </select>
                        </TRightAlign>
                    </Toolbar>
                    {this.scheduleBox()}
                    <div className="script-editor-body">
                        <Either> {this.state.activeScriptId}
                            <Right>
                                <CodeMirror 
                                    value={editorText} 
                                    onChange={(text) => {
                                        this.setState({editorText: text})
                                    }}
                                    options={{
                                        lineWrapping: true,
                                        lineNumbers: true,
                                        mode: "powershell"
                                    }} 
                                />
                            </Right>
                        </Either>
                    </div>
                </div>
            </div>
        </div>
    }
}