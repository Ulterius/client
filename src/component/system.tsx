import React = require("react")
import {systemStore, auxillarySystemStore} from "../store/system-stores"
import {Bars, Bar, IconMedia, Temperature} from "./components"
import {GpuAvailability, bytesToSize} from "../util"

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
        this.state = {}
    }
    onChange = (info) => {
        this.setState(info)
    }
    render() {
        let {os, cpu, network, gpu, stats} = this.state
        if (os && cpu && network && gpu && stats) {
            //stats.cpuTemps.push(25, 67, 2, 1000)
            return (
                <div style={{marginLeft: 30, marginTop: 40, maxWidth: 900}}>
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
                        <br />
                        {stats.cpuTemps.map((temp, i) => {
                            return <span>
                                {i == stats.cpuTemps.length - 1 ? " Package: " : " "}
                                <Temperature>{temp.toFixed(1)}</Temperature>
                            </span>
                        })}
                    </IconMedia>
                    <IconMedia src="/img/icon/motherboard.svg" size={[60, 67]} alt="motherboard">
                        <h4 className="media-heading">Motherboard</h4>
                        {stats.motherBoard} <br />
                        BIOS from {stats.biosInfo.biosManufacturer} <br />
                        {stats.biosInfo.biosCaption}
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
                                        style={{width: "100%"}} />
                                    {bytesToSize(drive.FreeSpace)} free of {bytesToSize(drive.TotalSize)}
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
