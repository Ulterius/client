import React = require("react")
import Component = React.Component
import {settingsStore, SettingsState, appStore} from "../store"
import {Input, Button, ButtonGroup, ButtonToolbar} from "react-bootstrap"
import {MoveLeftTransition} from "./components"
//import {api} from "../api"
import {settingsApi} from "../api-layer"
import {ToggleSwitch} from "./ui"
import {appActions} from "../action"
import * as _ from "lodash"

class RadioGroup extends React.Component<{
    label: string, 
    options: string[], 
    default: string, 
    onChange?: (newSelected: string) => any
}, {selected: string}> {
    constructor(props) {
        super(props)
        this.state = ({} as any)
    }
    componentDidMount() {
        this.setState({selected: ""})
    }
    setSelected(option: string) {
        if (this.state.selected !== option) {
            this.setState({selected: option})
            this.props.onChange(option)
        }
    }
    render() {
        //<Button onClick={() => {this.setState({selected: opt})}} active={this.state.selected == opt}>{opt}</Button>
        return <div style={{marginBottom: 10}}>
            <label className="control-label">{this.props.label}</label> <br />
            <ButtonGroup>
                {this.props.options.map((opt, i) => {
                    return <Button bsStyle="primary" key={i} 
                        onClick={() => {this.setSelected(opt)}} 
                        active={this.state.selected == opt || (!this.state.selected && this.props.default == opt) }>
                        {opt}
                    </Button>
                })}
            </ButtonGroup>
        </div>
    }
}

export class SettingsPage extends React.Component<{}, {
    currentSettings?: SettingsState, 
    newSettings?: {[key: string]: any},
    restartConfirm?: boolean
}> {
    settingNames = {
        UseWebServer: "Use web server",
        WebServerPort: "Web server port",
        WebFilePath: "Web file path",
        TaskServerPort: "Task server port",
        SkipHostNameResolve: "Skip network hostname resolve",
        VncPort: "VNC server port",
        VncProxyPort: "VNC server proxy port",
        VncPass: "VNC password",
        AllowTerminal: "Enable Terminal"
    }
    constructor(props) {
        super(props)
        this.state = {}
    }
    componentDidMount() {
        this.getSettings(settingsStore.getState())
        this.setState({newSettings: {}})
        settingsStore.listen(this.getSettings)
    }
    componentWillUnmount() {
        settingsStore.unlisten(this.getSettings)
    }
    getSettings = (state: SettingsState) => {
        this.setState({currentSettings: state})
    }
    restart = () => {
        if (this.state.restartConfirm) {
            //sendCommandToDefault("restartServer")
            settingsApi.restartServer()
            this.state.restartConfirm = false
        }
        else {
            this.setState({restartConfirm: true})
        }
    }
    finalizeSettings = () => {
        /*
        _.forIn(this.state.newSettings, (v, k) => {
            settingsApi.changeSetting({k: v})
        }) */
    }
    render() {
        if (!this.state.currentSettings) {
            return <div>Loading settings...</div>
        }
            

        let page = []
        _.forIn(this.state.currentSettings.settings, (v, k) => {
            if (k == "LoadPlugins")
                return
            if (typeof v === "boolean") {
                page.push(
                    <RadioGroup 
                        key={k}
                        onChange={(val) => {
                            this.setState({newSettings: _.assign(this.state.newSettings, {[k]: (val=="yes")})})
                        }}
                        label={this.settingNames[k]} 
                        default={v?"yes":"no"} 
                        options={["yes", "no"]} />
                )
            }
            else {
                page.push(
                    <Input 
                        key={k}
                        type="text" 
                        label={this.settingNames[k]} 
                        defaultValue={String(v)}
                        onChange={(e) => {
                            this.setState({newSettings: _.assign(this.state.newSettings, {[k]: (e.target as HTMLInputElement).value})})
                        }}/>
                )
            }
        })
        return <div className="settings-page">
            {/* JSON.stringify(this.state) */}
            {page}
            <ButtonToolbar>
                <Button onClick={this.finalizeSettings} bsStyle="primary">Save</Button>
                <Button bsStyle="danger" onClick={this.restart}>{this.state.restartConfirm?"Confirm Restart":"Restart Server"}</Button>
            </ButtonToolbar>
        </div>
        
    }
}

let settingNames = {
    ToggleWebServer: "Use web server",
    WebServerPort: "Web server port",
    WebFilePath: "Web file path",
    TaskServerPort: "Task server port",
    SkipHostNameResolve: "Skip network hostname resolve",
    VncPort: "VNC server port",
    VncProxyPort: "VNC server proxy port",
    VncPass: "VNC password",
    AllowTerminal: "Enable Terminal",
    TerminalPort: "Terminal Port",
    UseWebcams: "Enable Webcams",
    UpnpEnabled: "Enable UPNP",
    WebcamPort: "Webcam Streaming Port",
    ScreenSharePort: "Screen Share Port"
}

interface ModalSettingsProps {
    show: boolean
}

interface ModalSettingsState {
    store?: SettingsState,
    newSettings?: any,
    restartConfirm?: boolean
}

export class ModalSettings extends Component<ModalSettingsProps, ModalSettingsState> {
    constructor() {
        super()
        this.state = {
            store: {},
            newSettings: {},
            restartConfirm: false
        } as any
    }
    componentDidMount() {
        this.setStore(settingsStore.getState())
        settingsStore.listen(this.setStore)
    }
    componentWillUnmount() {
        settingsStore.unlisten(this.setStore)
    }
    setStore = (store: SettingsState) => {
        this.setState({store})
    }
    finalizeSettings = () => {
        let entireNewSettings = _.assign({}, this.state.store.settings)
        _.forOwn(entireNewSettings, (category, categoryName) => {
            _.forOwn(this.state.newSettings, (newValue, newName) => {
                if (_.some(_.keys(category), (settingName) => settingName == newName)) {
                    category[newName] = newValue
                }
            })
        })
        console.log(entireNewSettings)
        settingsApi.changeSettings(entireNewSettings)
        /*
        _.forIn(this.state.newSettings, (v, k) => {
            settingsApi.changeSetting({[k]: v})
        }) */
        this.setState({newSettings: {}})
    }
    restart = () => {
        if (this.state.restartConfirm) {
            //sendCommandToDefault("restartServer")
            settingsApi.restartServer()
            this.state.restartConfirm = false
        }
        else {
            this.setState({restartConfirm: true})
        }
    }
    settingsBody() {
        if (!this.state.store.settings) {
            return <div className="fixed settings-body" />
        }

        const s = this.state.store.settings
        const ns = this.state.newSettings
        let displaySettings = [
            _.omit(s.TaskServer, "Encryption"),
            _.omit(s.Network, "BindLocal"),
            s.WebServer,
            s.Webcams,
            s.Terminal,
            s.ScreenShareService
        ]
        let body = []
        displaySettings.forEach((category) => {
            _.forOwn(category, (value, name) => {
                if (_.isBoolean(value)) {
                    body.push(
                        <ToggleSwitch key={name} label={settingNames[name]} defaultState={value} onChange={newValue => {
                            this.setState({
                                newSettings: _.assign(this.state.newSettings, {[name]: newValue})
                            })
                        }} />
                    )
                }
                else {
                    body.push(
                        <Input 
                            key={name}
                            type={name == "ScreenSharePass" ? "password" : "text"}
                            label={settingNames[name]}
                            defaultValue={value}
                            onChange={(e) => {
                                let text = (e.target as HTMLInputElement).value
                                this.setState({
                                    newSettings: _.assign(this.state.newSettings, {[name]: text})
                                })
                            }}
                        />
                    )
                }
            })
        })
        return <div className="flex settings-body">
            {body}
            <ToggleSwitch 
                key="debug" 
                label="Enable debug page" 
                defaultState={appStore.getState().debugMenu}
                onChange={newValue => {
                    appActions.setDebugMenu(newValue)
                }} 
            />
        </div>
    }
    render() {

        return <MoveLeftTransition show={this.props.show} distance={500}>
            <div className="settings-panel">
                <div className="header">settings</div>
                <div className="panel-button-bar">
                    <div className="panel-button" onClick={this.finalizeSettings}>
                        apply changes
                    </div>
                    <div className="green-panel-button" onClick={this.restart}>
                        {this.state.restartConfirm ? "confirm restart" : "restart server"}
                    </div>
                </div>
                {/*JSON.stringify(this.state.newSettings*/}
                {this.settingsBody()}
            </div>
        </MoveLeftTransition>
    }
}