
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

export class IconMedia extends React.Component<{
    src: string,
    alt: string,
    size: [number, number],
    children?: any
}, {}> {
    render() {
        return (
            <div className="media">
                <div className="media-left">
                    <div className="icon">
                        <img className="media-object"
                        width={this.props.size[0].toString()}
                        height={this.props.size[1].toString()}
                        src={this.props.src}
                        alt={this.props.alt} />
                    </div>
                </div>
                <div className="media-body">
                {this.props.children}
                </div>
            </div>
        )
    }
}

export class SystemPage extends React.Component<{}, {
    cpu?: CpuInfo,
    os?: OSInfo,
    network?: NetworkInfo,
    stats?: SystemInfo
}> {

    componentDidMount() {
        systemStore.listen(this.onChange)
        auxillarySystemStore.listen(this.onChange)
        this.setState(auxillarySystemStore.getState())
        this.setState(systemStore.getState())
    }

    componentWillUnmount() {
        systemStore.unlisten(this.onChange)
        auxillarySystemStore.unlisten(this.onChange)
    }

    constructor(props) {
        super(props)
        this.state = {cpu: null, os: null, network: null}
    }

    onChange = (info) => {
        this.setState(info)
    }

    render() {
        if (this.state.os && this.state.cpu && this.state.network) {
            return (
                <div style={{marginLeft: 30}}>
                    <IconMedia src="/img/icon/pc.svg" size={[40, 75]} alt="PC">
                        <h4 className="media-heading">Operating System</h4>
                        {this.state.os.name} {this.state.os.architecture}, version {this.state.os.version}
                        <br />
                        build {this.state.os.build}
                    </IconMedia>
                    <IconMedia src="/img/icon/microchip.svg" size={[60, 75]} alt="chip">
                        <h4 className="media-heading">CPU</h4>
                        {this.state.cpu.cpuName} running at {this.state.cpu.speedMhz} Mhz
                        <br />
                        {this.state.cpu.cores} cores and {this.state.cpu.threads} threads
                    </IconMedia>
                    <IconMedia src="/img/icon/motherboard.svg" size={[60, 67]} alt="motherboard">
                        <h4 className="media-heading">Motherboard</h4>
                        {this.state.stats.motherBoard}
                    </IconMedia>
                    <IconMedia src="/img/icon/routers.svg" size={[60, 58]} alt="routers">
                        <h4 className="media-heading">Network</h4>
                        Public IP address is {this.state.network.publicIp}
                        <br />
                        Internal IP address is {this.state.network.internalIp}
                        <br />
                        MAC address is {this.state.network.macAddress}
                    </IconMedia>

                </div>
            )
        }
        else {
            return <p>Loading system information...</p>
        }
    }
}
