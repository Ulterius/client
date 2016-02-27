import React = require("react")
import Component = React.Component //why haven't I been doing this...?
import {pluginStore, PluginState} from "../store"

export class PluginList extends Component<{}, PluginState> {
    componentDidMount() {
        this.setState(pluginStore.getState())
        pluginStore.listen(this.updateState)
    }
    componentWillUnmount() {
        pluginStore.unlisten(this.updateState)
    }
    updateState = (state: PluginState) => {
        this.setState(state)
    }
    render() {
        if (!this.state) {
            return <div>Loading...</div>
        }
        
        return <div>
            {JSON.stringify(this.state)}
        </div>
    }
}

export function PluginPage(props: any) {
    return <div className="plugin-page">
        <PluginList />
    </div>
}