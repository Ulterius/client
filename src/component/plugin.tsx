import React = require("react")
import Component = React.Component //why haven't I been doing this...?
import {pluginStore, PluginState} from "../store"
import {Glyphicon, Input, ListGroup, ListGroupItem} from "react-bootstrap"
import {Base64Img, EntryBox} from "./"
import {sendCommandToDefault} from "../socket"
import * as _ from "lodash"

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
    runPlugin = (args: string, guid: string) => {
        let argArr = args ? args.split(",").map(arg => arg.trim()) : []
        argArr.unshift(guid)
        console.log(argArr)
        sendCommandToDefault("plugin", argArr)
    }
    render() {
        if (!this.state) {
            return <div>Loading...</div>
        }
        
        return <div>
            {/* JSON.stringify(this.state) */}
            <ListGroup>
                {_.map(this.state.plugins, (v, k) => {
                    return <ListGroupItem>
                        <div className="clearfix">
                            <div style={{float: "left"}}>
                                <Base64Img type="image/png" data={v.Icon} style={{display: "inline", verticalAlign: "top"}} />
                                &nbsp;
                                <h2 style={{display: "inline"}}>{v.Name}</h2>
                                <br />
                                {v.Description}
                                <br />
                                By {v.Author}&nbsp; <a href={v.Website}><Glyphicon glyph="link"/></a>
                                <br />
                                {v.CanonicalName}, Version {v.Version}
                            </div>
                            <div style={{float: "right"}}>
                                <EntryBox 
                                    placeholder="arg, arg2, ..." 
                                    onConfirmation={(t) => this.runPlugin(t, k)} 
                                    glyph="play" 
                                />
                            </div>
                        </div>
                    </ListGroupItem>
                })}
            </ListGroup>
        </div>
    }
}

export function PluginPage(props: any) {
    return <div className="plugin-page">
        <PluginList />
    </div>
}