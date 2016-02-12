import React = require("react")
import {settingsStore, SettingsState} from "../store"

export class SettingsPage extends React.Component<{}, SettingsState> {
    componentDidMount() {
        this.getSettings(settingsStore.getState())
        settingsStore.listen(this.getSettings)
    }
    componentWillUnmount() {
        settingsStore.unlisten(this.getSettings)
    }
    
    getSettings = (state: SettingsState) => {
        this.setState(state)
    }
    render() {
        if (this.state) {
            return <div>
                {JSON.stringify(this.state)}
            </div>
        }
        else {
            return <div>Loading settings...</div>
        }
        
    }
}