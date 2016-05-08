import React = require("react")
import {systemStore, auxillarySystemStore} from "../store/system-stores"
import {Bars, Bar, IconMedia, Temperature} from "./components"
import {GpuAvailability, bytesToSize} from "../util"
import {helpers} from "../api-layer"
//import {api} from "../api"
import {systemApi} from "../api-layer"
import Graph = require("react-chartist")
import {LoadingScreen} from "./"
import * as _ from  "lodash"

let graphOptions = {
    axisX: {
        showLabel: false,
        showGrid: false
    },
    axisY: {
        showLabel: true,
        showGrid: true
    },
    showArea: true,
    showPoint: false,
    high: 100,
    low: 0,
    //height: "100px",
    width: "100%",
    chartPadding: {
        top: 5,
        bottom: 5,
        left: -10,
        right: 5
    }
}

function StatContainer(props: {
    headLeft: any,
    headRight: any,
    children?: any
}) {
    let {headLeft, headRight, children} = props
    return <div style={{marginBottom: 10}}>
        <div className="clearfix">
            <div style={{float: "left"}}>{headLeft}</div>
            <div style={{float: "right"}}>{headRight}</div>
        </div>
        {children}
    </div>
}

function StatItem(props: {head: string, children?: any}) {
    return <div style={{
            display: "inline-block",
            marginRight: 10
        }}>
            <span style={{color: "grey"}}>{props.head}</span>
            <br />
            {props.children}
        </div>
}

export class Stats extends React.Component<{},{ stats?: SystemInfo, statStack?: SystemInfo[] }> {
    componentDidMount() {
        this.onChange(systemStore.getState())
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
        if (!(this.state.stats && this.state.stats.cpuUsage)) {
            return <p>Loading stats...</p>
        }

        let cpuSeries = []
        for (var i=0; i<this.state.stats.cpuUsage.length; i++) {
            cpuSeries.push(this.state.statStack.map(stats => {
                return stats.cpuUsage[i]
            }))
        }
        cpuSeries = cpuSeries.map((cpu) => {
            return _(cpu as Array<number>).reverse().value()
        })

        //when you stare into the abyss
        //the abyss may also stare into you
        let processors = cpuSeries.length
        cpuSeries = cpuSeries.reduce((cpu1, cpu2) => {
            return cpu1.map((v, i) => {
                return (v + cpu2[i])
            })
        }).map(cpu => {
            return cpu/processors
        })
        let ramSeries = this.state.statStack.map(stats => {
            return (stats.usedMemory/stats.totalMemory)*100
        })
        ramSeries = _(ramSeries).reverse().value()
        let {stats} = this.state
        return <div>
            <br />
            <StatContainer headLeft={<h4>CPU</h4>} headRight={<h4>Ayylmao</h4>}>
                <StatItem head="Usage">
                    {cpuSeries[cpuSeries.length-1].toFixed(0)}%
                </StatItem>
                <StatItem head="Processes">
                    {this.state.stats.runningProcesses}
                </StatItem>
            </StatContainer>
            <Graph
                data={{
                    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
                    series: [cpuSeries]
                }}
                options={graphOptions}
                type={"Line"} />
            <StatContainer headLeft={<h4>RAM</h4>} headRight={<h4>{bytesToSize(this.state.stats.totalMemory)}</h4>}>
                <StatItem head="Usage">
                    {ramSeries[ramSeries.length-1].toFixed(0)}%
                </StatItem>
                <StatItem head="In Use">
                    {bytesToSize(stats.usedMemory)}
                </StatItem>
                <StatItem head="Free">
                    {bytesToSize(stats.availableMemory)}
                </StatItem>
            </StatContainer>
            <Graph
                data={{
                    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
                    series: [ramSeries]
                }}
                options={graphOptions}
                type={"Line"} />
        </div>
    }
}

export class SystemPage extends React.Component<{}, {
    cpu?: CpuInfo,
    os?: OSInfo,
    network?: NetworkInfo,
    stats?: SystemInfo,
    gpu?: GpusInfo
}> {
    constructor(props) {
        super(props)
        this.state = {}
    }
    componentDidMount() {
        systemApi.getAuxillaryStats()
        systemStore.listen(this.onChange)
        auxillarySystemStore.listen(this.onChange)
        this.setState(auxillarySystemStore.getState())
        this.setState(systemStore.getState())
    }
    componentWillUnmount() {
        systemStore.unlisten(this.onChange)
        auxillarySystemStore.unlisten(this.onChange)
    }
    onChange = (info) => {
        this.setState(info)
    }
    render() {
        let {os, cpu, network, gpu, stats} = this.state
        if (!(os && cpu && network && gpu && stats)) {
            let percent = [os, cpu, network, gpu, stats].map(e => (e ? 1 : 0)).reduce((a, b) => a+b) * 20
            return <LoadingScreen percentage={percent}>
                Loading system information <br />
                {_.map(_.omit(this.state, "statStack") as any, (v, k) => {
                    return k + " "
                })}
            </LoadingScreen>
        }

        return (
            <div 
            className="animated fadeInDown" 
            style={{marginLeft: 30, marginTop: 40, maxWidth: 900}}>
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
                        return <span key={i}>
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
                            <p key={gpu.Name}>
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
                                &nbsp;
                                <Temperature>{gpu.Temperature}</Temperature>
                            </p>
                        )
                    })}
                </IconMedia>
                <IconMedia src="/img/icon/sdd.svg" size={[60, 55]} alt="drive">
                    <h4 className="media-heading">Drives</h4>
                    {stats.drives.map((drive, i) => {
                        return (
                            <div key={drive.RootDirectory}>
                                {drive.VolumeLabel.length > 0 ? drive.VolumeLabel : "No label"}, {drive.RootDirectory}
                                <br />
                                <Bar
                                    value={100 - ((drive.FreeSpace/drive.TotalSize)*100)}
                                    style={{width: "100%"}} 
                                    color={true}/>
                                {bytesToSize(drive.FreeSpace)} free of {bytesToSize(drive.TotalSize)}
                            </div>
                        )
                    })}
                </IconMedia>
            </div>
        )

    }
}
