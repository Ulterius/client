import React = require("react")
import JSONTree from "react-json-tree"
import * as _ from "lodash"
import Component = React.Component
import {EntryBox, glyphicon} from "./"
import {mainConnection} from "../socket"
import {concat, without} from "lodash"


interface DebugPageState {
    debugObjects: ApiMessage[]
}

export function LovelyStyledTree({data}: {data: any}) {
    return <JSONTree 
        theme={{
            tree: {
                backgroundColor: "none"
            }
        }}
        data={data}
    />
}

export class DebugPage extends Component<{}, DebugPageState> {
    objectsElement: HTMLDivElement
    constructor(props, context) {
        super(props, context)
        this.state = {
            debugObjects: [
            ]
        }
    }
    componentDidMount() {

    }
    componentWillUnmount() {
        
    }
    remove(obj: ApiMessage) {
        this.setState({debugObjects: without(this.state.debugObjects, obj)})
    }
    closeButton(obj: ApiMessage) {
        return glyphicon("remove", {
            style: {cursor: "pointer"},
            onClick: () => this.remove(obj)
        })
    }
    render() {
        const {debugObjects} = this.state
        return <div className="full-height debug-page">
            <div className="debug-objects" ref={ref => {
                this.objectsElement = ref
                if (this.objectsElement) {
                    this.objectsElement.scrollTop = this.objectsElement.scrollHeight
                }
            }}>
                {this.state.debugObjects.map(obj => {
                    return <div className="ulterius-panel debug-panel" style={{marginBottom: 10}}>
                        <div className="double-header">
                            <div>
                                {glyphicon("map-marker")} {obj.endpoint} 
                                &nbsp; &nbsp;
                                {glyphicon("link")} {obj.synckey}
                            </div> 
                            <div> {this.closeButton(obj)}</div>
                        </div>
                        <div className="flex">
                            <JSONTree data={obj.results} theme={{
                                tree: {
                                    backgroundColor: "none"
                                }
                            }} />
                        </div>
                    </div>
                })}
            </div>
            <div className="debug-entry">
                <EntryBox 
                    placeholder={
                        "API call: endpoint | endpoint() | endpoint(arg0, arg1, ..., argn)"
                    }
                    glyph="chevron-right" onConfirmation={text => {
                    let [endpoint, args] = text.split("(")
                    let argArray
                    if (args) {
                        args = "[" + args.slice(0, args.length-1) + "]"
                        console.log(args)
                        argArray = JSON.parse(args)
                    }
                    else {
                        argArray = []
                    }
                    mainConnection.sendAsync(endpoint, argArray, (results, message) => {
                        console.log("Message")
                        if (this.objectsElement) {
                            this.objectsElement.scrollTop = this.objectsElement.scrollHeight
                        }
                        this.setState({debugObjects: concat(debugObjects, message)})
                    })
                }}/>
            </div>
        </div>
    }
}