import React = require("react")
import Component = React.Component
import {systemStore, auxillarySystemStore} from "../store/system-stores"
import {Bars, Bar, IconMedia, Temperature} from "./components"
import {GpuAvailability, bytesToSize} from "../util"
import {helpers} from "../api-layer"
//import {api} from "../api"
import {systemApi} from "../api-layer"
import Graph = require("react-chartist")
import {LoadingScreen, Gauge, Either, Left, Right, LovelyStyledTree} from "./"
import {panel, FlexRow, FlexCol, Meter, createDivComponent, glyphicon} from "./ui"
import * as _ from  "lodash"
import classNames = require("classnames")
import changeCase = require("change-case")
//import {Gauge} from "./ui"

const {Panel, Fixed, FixedCenter, Flex, FlexFixed, Header, HeaderCenter} = panel

const SystemFooter = createDivComponent("system-footer")

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
    height: "150px",
    width: "100%",
    chartPadding: {
        top: 20,
        bottom: -20,
        left: 0,
        right: 20
    }
}

function StatHeader(props: {
    headLeft?: React.ReactChild,
    headRight?: React.ReactChild
}) {
    const {headLeft, headRight} = props
    return <div className="clearfix stat-header">
        <div className="left" style={{float: "left"}}>{headLeft}</div>
        <div className="right" style={{float: "right"}}>{headRight}</div>
    </div>
}

function StatContainer(props: {
    children?: any
}) {
    const {children} = props
    return <div className="stat-container">
        {children}
    </div>
}

function StatItem(props: {head: string, isFooter?: boolean, children?: any}) {
    const {head, isFooter, children} = props
    return <div className={isFooter ? "foot-stat-item" : "stat-item"}>
        <span className="stat-item-head-text">{head}</span>
        <br />
        {children}
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
            <Panel style={{marginBottom: 20}}>
                <div className="header">
                    <StatHeader headLeft={"CPU"} />
                </div>
                <div className="body">
                    <StatContainer>
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
                </div>
            </Panel>
            <Panel>
                <div className="header">
                    <StatHeader headLeft="RAM" headRight={bytesToSize(this.state.stats.totalMemory)} />
                </div>
                <div className="body">
                    <StatContainer >
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
            </Panel>
        </div>
    }
}

interface SystemPanelProps extends React.HTMLProps<HTMLDivElement> {
    title: string,
    image: React.ReactChild,
    emptyBody?: boolean,
    flexGrow?: number,
    flexShrink?: number
}

function SystemPanel(props: SystemPanelProps) {
    let {title, image, flexGrow, flexShrink, children, emptyBody} = props
    const rest = _.omit(props, ["title", "image", "children", "flexGrow", "flexShrink"])
    return <Panel style={{flexGrow, flexShrink}} className="flex-child" {...rest}>
        <HeaderCenter>
            {title} <br /> <br />
            {image}
        </HeaderCenter>
        {emptyBody ? [
            <Flex />, 
            <FixedCenter>
                {children}
            </FixedCenter>
        ] : children}
    </Panel>
}

function Faded(props: {children?: any}) {
    return <span className="faded">
        {props.children}
    </span>
}

let updateInterval

function getNetworkDevices(count: number): NetworkDeviceInfo[] {
    let devices: NetworkDeviceInfo[] = []
    for (let i = 0; i < count; i++) {
        devices.push({
            Ip: "0.0.0.0",
            Name: "Unknown",
            MacAddress: "5404A6419018"
        })
    }
    return devices
}

let testDevices = getNetworkDevices(20)

function getDeviceGlyph(name: string) {
    let uName = name.toUpperCase()
    if (uName.indexOf("IPHONE") !== -1 || uName.indexOf("ANDROID") !== -1) {
        return "phone"
    }
    if (uName.indexOf("DESKTOP") !== -1 || uName.indexOf("MAC") !== -1) {
        return "user"
    }
    return "map-marker"
}

interface CollectionTableProps extends React.HTMLAttributes {
    collection: {[key: string]: any}[]
}

function CollectionTable(props: CollectionTableProps) {
    const {collection, ...other} = props
    return <table {...other}>
        <thead>
            <tr>
                {_.map(collection[0], (v, k) => {
                    return <th>{k}</th>
                })}
            </tr>
        </thead>
        <tbody>
            {collection.map(obj => {
                return <tr>
                    {_.map(obj, (v, k) => {
                        return <td>{v}</td>
                    })}
                </tr>
            })}
        </tbody>
    </table>
}

interface PopoutRowProps extends React.HTMLAttributes {
}
class PopoutRow extends Component<PopoutRowProps, {}> {
    barElement: HTMLDivElement
    render() {
        return <div className="popout-row" ref={ref => this.barElement = ref}>
            {React.Children.map(this.props.children, (child: React.ReactElement<any>) => {
                return React.cloneElement(child, {externalParent: this.barElement})
            })}
            {/*this.props.popouts.map(popout => {
                return <Popout label={popout.label} externalParent={this.barElement}>
                    {React.cloneElement(popout.content)}
                </Popout>
            })*/}
        </div>
    }
}

interface PopoutProps extends React.HTMLAttributes {
    label?: string,
    externalParent?: HTMLDivElement,
    anchor?: string
}
interface PopoutState {
    open?: boolean
}
class Popout extends Component<PopoutProps, PopoutState> {
    arrowElement: HTMLDivElement
    popoutElement: HTMLDivElement
    constructor(props, context) {
        super(props, context)
        this.state = {
            open: false
        }
    }
    toggle = () => {
        if (this.state.open) {
            document.removeEventListener("click", this.clickHandler)
        }
        else {
            document.addEventListener("click", this.clickHandler)
        }
        this.setState({open: !this.state.open})
    }
    componentWillUnmount() {
        document.removeEventListener("click", this.clickHandler)
    }
    table() {
        const {subject, externalParent, anchor} = this.props
        const a = externalParent || this.arrowElement
        const {open} = this.state
        let top = 0
        let left = 0
        let width = 0
        let right = 0
        if (a) {
            top = a.offsetTop + a.clientHeight + 10
            left = a.offsetLeft
            width = a.offsetWidth
            right = window.innerWidth - (a.offsetLeft + a.offsetWidth)
            if (open && this.popoutElement && this.popoutElement.clientWidth == 0) {
                setTimeout(() => this.setState({}), 0) //force a repaint so we get the right width
            }
            if (this.popoutElement && this.popoutElement.clientWidth < a.offsetWidth) {
                right += (a.offsetWidth - this.popoutElement.clientWidth)/2
            }
        }
        //const top = arrowElement.offsetTop
        let style: React.CSSProperties
        if (!anchor) {
            style = {
                position: "absolute",
                top,
                left,
                width,
                display: open ? "block" : "none"
            }
        }
        else if (anchor == "right") {
            style = {
                position: "absolute",
                top,
                right,
                display: open ? "block" : "none",
                opacity: this.popoutElement && this.popoutElement.clientWidth == 0 ? 0 : 1
            }
        }
        return <div className="popout-content-container" style={style} ref={ref => this.popoutElement = ref}>
            {this.props.children}
        </div>
    }
    clickHandler = (e: MouseEvent) => {
        if (this.popoutElement && this.state.open && !this.popoutElement.contains(e.target as any)) {
            this.toggle()
        }
    }
    arrow() {
        const {open} = this.state
        const {label} = this.props
        return <div 
            onClick={this.toggle} 
            className="popout-arrow" 
            ref={ref => this.arrowElement = ref}
        >
            {(!!label && label + " ")}{glyphicon(open ? "chevron-up" : "chevron-down")}
        </div>
    }
    render() {
        const {label, externalParent, ...others} = this.props
        return <div className="popout-container" {...others}>
            {this.arrow()}
            {this.table()}
        </div>
    }
}

const panels = {
    OS(os: OSInfo) {
        return <SystemPanel emptyBody 
            flexGrow={1} 
            style={{width: "50%"}} 
            title="operating system" 
            image={
                <img src={require("icon/pc.svg")} width="62" height="49" />
            }>
                {os.name} {os.architecture} <br />
                <Faded>
                    Version {os.version} <br />
                    Build {os.build}
                </Faded>
            </SystemPanel>
    },
    motherboard(stats: SystemInfo) {
        return <SystemPanel emptyBody 
            flexGrow={1} 
            style={{width: "50%"}} 
            title="motherboard" 
            image={
            <img src={require("icon/motherboard.svg")} width="45" height="40" />
        }>
            {stats.motherBoard} <br />
            <Faded>
                BIOS from {stats.biosInfo.biosManufacturer} <br />
                {stats.biosInfo.biosCaption}
            </Faded>
        </SystemPanel>
    },
    network(network: NetworkInfo, stats: SystemInfo) {
        return <SystemPanel flexGrow={1} title="network" image={
            <img src={require("icon/network.svg")} width="52" height="40" />
        }>
            <FixedCenter>Devices</FixedCenter>
            <FlexFixed>
                {network.networkDevices
                    .filter(d => d.MacAddress !== network.macAddress)
                    .map(device => {
                    return <FixedCenter>
                        {glyphicon(getDeviceGlyph(device.Name))} <br />
                        {device.Name} <br />
                        <Faded>{device.Ip}</Faded>
                    </FixedCenter>
                })}
            </FlexFixed>
            <SystemFooter>
                <StatItem isFooter head="public ip">
                    <span className="hover-container">
                        <span className="hover">{network.publicIp}</span>
                        <span className="unhovered highlighted">Hidden</span>
                    </span>
                </StatItem>
                <StatItem isFooter head="internal ip">
                    {network.internalIp}
                </StatItem>
                <StatItem isFooter head="mac address">
                    {network.macAddress}
                </StatItem>
                <StatItem isFooter head="data sent">
                    {bytesToSize(stats.networkInfo.totalBytesSent)}
                </StatItem>
                <StatItem isFooter head="data received">
                    {bytesToSize(stats.networkInfo.totalBytesReceived)}
                </StatItem>
            </SystemFooter>
        </SystemPanel>
    },
    cpu(cpu: CpuInfo, stats: SystemInfo) {
        const {cpuName, cores, threads, speedMhz, ...cpuOther} = cpu
        return <SystemPanel flexGrow={1} title="CPU" image={
            <img src={require("icon/cpu.svg")} width="40" height="40" />
        }>
            <FixedCenter>
                {cpu.cpuName}
            </FixedCenter>
            <Flex>
                <div className="gauge-box">
                    <Gauge 
                        title="Temperature" 
                        label="° C" 
                        value={stats.cpuTemps[stats.cpuTemps.length-1].toFixed(0)} 
                        min={0} max={100}
                    />
                </div>
            </Flex>
            <Flex>
                <Popout style={{textAlign: "center"}} label="details" anchor="right">
                    <table className="cpu-table">
                        <tbody>
                            {_(cpuOther).map((v, k) => {
                                return <tr><td>{changeCase.sentenceCase(k)}</td><td>{v}</td></tr>
                            }).value()}
                        </tbody>
                    </table>
                </Popout>
            </Flex>
            <SystemFooter>
                <StatItem isFooter head="cores">
                    {cores}
                </StatItem>
                <StatItem isFooter head="threads">
                    {threads}
                </StatItem>
                <StatItem isFooter head="clock speed">
                    {(speedMhz/1000).toFixed(1)} GHz
                </StatItem>
            </SystemFooter>
        </SystemPanel>
    },
    gpu(gpu: GpusInfo) {
        return <SystemPanel style={{width: "66%"}} title="video cards" image={
            <img src={require("icon/gpu.svg")} width="54" height="40" />
        }>
            <FlexFixed>
                {gpu.gpus.map(info => {
                    let temp = info.Temperature
                    return <FixedCenter style={{flexGrow: 1, flexBasis: 0}} key={info.Name}>
                        {info.Name} <br />
                        <Faded>Driver Version: {info.DriverVersion}</Faded> <br />
                        <span
                        className={"label label-" + (info.Status == "OK" ? "success" : "danger")}>
                            {info.Status}
                        </span>
                        &nbsp;
                        <span className="label label-success">
                            {GpuAvailability[info.Availability]}
                        </span>
                        <div className="gauge-box">
                            <Gauge 
                                title="Temperature"
                                label={temp != -1 ? "° C" : ""} 
                                value={temp != -1 ? temp.toFixed(0) : "N/A"} 
                                min={0} max={100} 
                            />
                        </div>
                    </FixedCenter>
                })}
            </FlexFixed>
            <Flex />
        </SystemPanel>
    },
    drive(stats: SystemInfo) {
        return <SystemPanel flexGrow={1} title="drives" image={
            <img src={require("icon/drive.svg")} width="30" height="40" />
        }>
            <Fixed>
                {stats.drives.map(drive => {
                    return <div className="drive-item">
                        <div key={drive.RootDirectory} className="graph-item">
                            <div className="graph-label">
                                {drive.VolumeLabel.length > 0 ? drive.VolumeLabel : "No label"},&nbsp;
                                {drive.RootDirectory} <br /> 
                                <Faded>{bytesToSize(drive.TotalSize)}</Faded>
                            </div>
                            <div className="graph-bar">
                                <Bar
                                    value={100 - ((drive.FreeSpace/drive.TotalSize)*100)}
                                    style={{width: "100%"}} 
                                    color={true}
                                />
                                <Faded>{bytesToSize(drive.FreeSpace)} Free</Faded>
                            </div>
                            
                        </div>
                        <div className="drive-popout-row">
                            <PopoutRow>
                                <Popout label="smart" anchor="right">
                                    <CollectionTable className="smart-table" collection={
                                        drive.SmartData.map(d => _.omit(d, "RawData"))
                                    } />
                                </Popout>
                                <Popout label="partitions" anchor="right">
                                    {drive.Partitions.map(p => {
                                        let {Name, ...therest} = p
                                        return <div className="partition-information">
                                            <p><strong>{Name}</strong></p>
                                            <table>
                                                <tbody>
                                                    {_.map(therest as any, (v, k: string) => {
                                                        return <tr><td>{changeCase.sentenceCase(k)}</td><td>{v}</td></tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    })}
                                </Popout>
                            </PopoutRow>

                            {/*<PopoutRow popouts={[
                                {label: "smart", content: <CollectionTable collection={drive.SmartData} />},
                                {label: "partitions", content: <div>other info</div>}
                            ]}/> */}
                        </div>
                        {/*<Popout label="SMART">
                            <CollectionTable collection={drive.SmartData} />
                        </Popout> */}
                    </div>
                })}
            </Fixed>
            <Flex />
        </SystemPanel>
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
        updateInterval = setInterval(() => {
            systemApi.getStats()
            systemApi.getAuxillaryStats()
        }, 10000)
        systemApi.getStats()
        systemApi.getAuxillaryStats()
        systemStore.listen(this.onChange)
        auxillarySystemStore.listen(this.onChange)
        this.setState(auxillarySystemStore.getState())
        this.setState(systemStore.getState())
    }
    componentWillUnmount() {
        clearInterval(updateInterval)
        systemStore.unlisten(this.onChange)
        auxillarySystemStore.unlisten(this.onChange)
    }
    onChange = (info) => {
        this.setState(info)
    }
    render() {
        let {os, cpu, network, gpu, stats} = this.state
        if (!(os && cpu && network && gpu && stats)) {
            let percent = ([os, cpu, network, gpu, stats]
                .map(e => (e ? 1 : 0)) as number[]).reduce((a, b) => a+b) * 20
                
            return <LoadingScreen percentage={percent}>
                Loading system information <br />
                {_.map(_.omit(this.state, "statStack") as any, (v, k) => {
                    return k + " "
                })}
            </LoadingScreen>
        }

        return (
            <div className="system-page">
                <FlexCol>
                    <FlexRow>
                        <FlexCol style={{width: "66%"}}>
                            <FlexRow>
                                {panels.OS(os)}
                                {panels.motherboard(stats)}
                            </FlexRow>
                            <FlexRow>
                                {panels.network(network, stats)}
                            </FlexRow>
                        </FlexCol>
                        {panels.cpu(cpu, stats)}
                    </FlexRow>
                    <FlexRow>
                        {panels.gpu(gpu)}
                        {panels.drive(stats)}
                    </FlexRow>
                </FlexCol>
            </div>
        )
    }
}
