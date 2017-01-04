import React = require("react")
import Component = React.Component
import {mainConnection as connection} from "../socket"
import {panel} from "./ui"
import {LovelyStyledTree} from "./debug"
import * as _ from "lodash"

const {Panel, Header, Flex, Fixed} = panel

export function ServerLogPage() {
    return <div className="server-log-page">
        <ServerLog />
    </div>
}

interface ServerLogState {
    log?: ServerLogInfo,
    expanded?: boolean
}

class ServerLog extends Component<{}, ServerLogState> {
    componentDidMount() {
        connection.sendAsync("getlogs").then((results) => {
            console.log("Got logs", results)
            this.setState({log: results})
        })
    }
    constructor(props, context) {
        super(props, context)
        this.state = {expanded: false} as any
    }
    toggleExpanded = () => {
        this.setState({expanded: !this.state.expanded})
    }
    render() {
        if (!this.state.log) {
            return <div>Retrieving logs...</div>
        }
        const {expanded} = this.state
        const {serverLog, exceptions} = this.state.log
        let log = serverLog.split("\r\n").map(line => {
            return <p className="server-log-line">{line}</p>
        })
        //console.log(serverLog.split("\r\n"))
        return <div>
            <Panel className="server-log-panel">
                <Header>Server Log</Header>
                <Flex style={{padding: "10px"}}>{expanded ? log : log.slice(log.length-10)}</Flex>
                <button className="btn text-button" onClick={this.toggleExpanded}>{expanded ? "Less" : "More"}</button>
            </Panel>
            {exceptions.map((exception, i) => {
                const [title, body] = [
                    encodeURIComponent("Server exception: " + exception.Type), encodeURIComponent(exception.Json)
                ]
                return <Panel key={i} className="server-log-panel">
                    <div className="double-header">
                        <div>{exception.Type}</div>
                        <div>{exception.Date}</div>
                    </div>
                    <Flex style={{padding: "10px"}}>
                        <LovelyStyledTree data={JSON.parse(exception.Json)}/>
                        <a target="_blank" className="btn text-button" href={
                            "https://github.com/ulterius/server/issues/new?title="+title+"&body="+body}
                        >
                            Report Issue
                        </a>
                    </Flex>
                </Panel>
            })}
        </div>
    }
}