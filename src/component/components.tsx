
import React = require("react")
import {systemStore, auxillarySystemStore} from "../store/system-stores"

export class Stats extends React.Component<{},{ stats?: SystemInfo }> {
    componentDidMount() {
        systemStore.listen(this.onChange)
    }
    componentWillUnmount() {
        systemStore.unlisten(this.onChange)
    }
    constructor(props) {
        super(props)
        this.state = {}
    }

    onChange = (stats) => {
        this.setState(stats)
    }

    render() {
        if (this.state.stats) {
            let cpuUsages: [string, number][] = this.state.stats.cpuUsage.map(function(e, i) {
                return (["CPU"+i, e] as [string, number])
            })
            return (
                <Bars values={cpuUsages} />
            )
        }
        else {
            return <p>Loading stats...</p>
        }
    }
}

export class Bars extends React.Component<{ values: [string, number][] }, {}> {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <table className="table">
                <tbody>
                {
                    this.props.values.map(value => {
                        let [name, percent] = value
                        return (
                            <tr>
                                <td style={{width: "30%"}}>{name}</td>
                                <td style={{width: "70%"}}>
                                    <div className="progress">
                                        <div
                                        className="progress-bar"
                                        aria-valuenow={percent.toString()}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                        style={{
                                            width: `${percent}%`,
                                            minWidth: "15%"
                                        }}>
                                            {percent.toFixed(0) + "%"}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        )
    }
}

export class SystemPage extends React.Component<{}, {
    cpu: CpuInfo,
    os: OSInfo,
    network: NetworkInfo
}> {

    componentDidMount() {
        auxillarySystemStore.listen(this.onChange)
        this.setState(auxillarySystemStore.getState())
    }
    componentWillUnmount() {
        auxillarySystemStore.unlisten(this.onChange)
    }

    constructor(props) {
        super(props)
    }

    onChange = () => {

    }
    render() {
        return <p></p>
    }
}
