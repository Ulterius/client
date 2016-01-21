
import React = require("react")
import {GpuAvailability, bytesToSize} from "../util"
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
            let usages: [string, number][] = this.state.stats.cpuUsage.map(function(e, i) {
                return (["CPU"+i, e] as [string, number])
            })
            usages.push(["RAM", (this.state.stats.usedMemory/this.state.stats.totalMemory)*100])
            return (
                <Bars values={usages} />
            )
        }
        else {
            return <p>Loading stats...</p>
        }
    }
}

export class Bar extends React.Component<{value: number, style?: any}, {}> {
    render() {
        let percent = this.props.value
        return (
            <div className="progress" style={this.props.style || {}}>
                <div
                className={
                    "progress-bar progress-bar-" +
                    (percent < 60 ? "primary":
                        (percent < 80 ? "warning" : "danger"))
                }
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
        )
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
                                        className={
                                            "progress-bar progress-bar-" +
                                            (percent < 60 ? "primary":
                                                (percent < 80 ? "warning" : "danger"))
                                        }
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
    stats?: SystemInfo,
    gpu?: GpusInfo
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
        let {os, cpu, network, gpu, stats} = this.state
        if (os && cpu && network && gpu && stats) {
            return (
                <div style={{marginLeft: 30}}>
                    <IconMedia src="/img/icon/pc.svg" size={[40, 75]} alt="PC">
                        <h4 className="media-heading">Operating System</h4>
                        {os.name} {os.architecture}, version {os.version}
                        <br />
                        build {os.build}
                    </IconMedia>
                    <IconMedia src="/img/icon/microchip.svg" size={[60, 75]} alt="chip">
                        <h4 className="media-heading">CPU</h4>
                        {cpu.cpuName} running at {cpu.speedMhz} Mhz
                        <br />
                        {cpu.cores} cores and {cpu.threads} threads
                    </IconMedia>
                    <IconMedia src="/img/icon/motherboard.svg" size={[60, 67]} alt="motherboard">
                        <h4 className="media-heading">Motherboard</h4>
                        {stats.motherBoard}
                    </IconMedia>
                    <IconMedia src="/img/icon/routers.svg" size={[60, 58]} alt="routers">
                        <h4 className="media-heading">Network</h4>
                        Public IP address is {network.publicIp}
                        <br />
                        Internal IP address is {network.internalIp}
                        <br />
                        MAC address is {network.macAddress}
                    </IconMedia>
                    <IconMedia src="/img/icon/videocard.svg" size={[60, 55]} alt="GPU">
                        <h4 className="media-heading">{gpu.gpus.length > 1 ? "GPUs" : "GPU"}</h4>
                        {gpu.gpus.map((gpu, i) => {
                            return (
                                <p>
                                    {gpu.Name} <br />
                                    Driver version {gpu.DriverVersion} <br />
                                    <span
                                    className={"label label-" + (gpu.Status == "OK" ? "success" : "danger")}>
                                        {gpu.Status}
                                    </span>
                                    &nbsp;
                                    <span className="label label-default">
                                        {GpuAvailability[gpu.Availability]}
                                    </span>
                                </p>
                            )
                        })}
                    </IconMedia>
                    <IconMedia src="/img/icon/sdd.svg" size={[60, 55]} alt="drive">
                        <h4 className="media-heading">Drives</h4>
                        {stats.drives.map((drive, i) => {
                            return (
                                <div>
                                    {drive.VolumeLabel.length > 0 ? drive.VolumeLabel : "No label"}, {drive.RootDirectory}
                                    <br />
                                    <Bar
                                        value={100 - ((drive.FreeSpace/drive.TotalSize)*100)}
                                        style={{width: 400}} />
                                    {bytesToSize(drive.FreeSpace)} free of {bytesToSize(drive.TotalSize)} total
                                </div>
                            )
                        })}
                    </IconMedia>

                </div>
            )
        }
        else {
            return <p>Loading system information...</p>
        }
    }
}
