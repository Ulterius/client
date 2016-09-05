import React = require("react")
import {taskStore, appStore} from "../store"
import {createSortOnProperty, bytesToSize} from "../util"
import {sendCommandToDefault} from "../socket"
import {Stats, LoadingScreen, dialogEvents} from "./"
import {Panel} from "./ui"
import {Button, Input, Glyphicon} from "react-bootstrap"
import setIntervals from "../interval"
import {intervals} from "../api-layer"
import {AutoAffix} from "react-overlays"

export class ProcessCreator extends React.Component<{}, {exe: string, box?: any}> {
    startProcess = () => {
        if (this.state && this.state.exe) {
            console.log(this.state.exe)
            sendCommandToDefault("startProcess", this.state.exe)
            if (this.state.box) {
                this.state.box.value = ""
            }
        }
        
    }
    render() {
        const createButton = <Button bsStyle="primary" onClick={this.startProcess}>start</Button>
        return <div className="bare-input-button">
            <Input 
            type="text" 
            placeholder="Enter new process name..." 
            onChange={e => this.setState({exe: (e.target as HTMLInputElement).value, box: e.target})} 
            onKeyDown={(e) => {
                if (e.keyCode == 13) {
                    this.startProcess()
                    //e.target.value = ""
                }
            }}
            buttonAfter={createButton}/>
        </div>
    }
}

export class TaskList extends React.Component<
    {},
    {tasks?: Array<TaskInfo>, sortProperty?: string, sortType?: string}
> {
    columns: {[key:string]: string}
    constructor(props) {
        super(props)
        this.state = {tasks: [], sortProperty: "Id", sortType: "asc"}
        this.onChange = this.onChange.bind(this)
        this.columns = {Name: "Name", Id: "ID", CpuUsage: "CPU", RamUsage: "Memory"}
    }
    componentDidMount() {
        taskStore.listen(this.onChange)
        if (appStore.getState().auth.loggedIn) {
            _.assign(intervals, setIntervals())
            this.setState(taskStore.getState())
        }
    }
    componentWillUnmount() {
        taskStore.unlisten(this.onChange)
        console.log(intervals)
        _.forEach(intervals, (v: number, k) => {
            clearInterval(v)
        })
    }
    getName(property: string) {
        if (this.state.sortProperty == property) {
            return <span>
                <Glyphicon glyph={(this.state.sortType == "asc" ? "menu-up" : "menu-down")} /> 
                <br />
                {this.columns[property]}
            </span>
        }
        else {
            return <span>{this.columns[property]}</span>
        }
    }
    onChange(tasks) {
        this.setState(tasks)
    }
    setSort(prop: string) {
        if (this.state.sortProperty == prop) {
            this.setState({ sortType: (this.state.sortType == "asc" ? "desc" : "asc") })
        }
        else {
            this.setState({sortProperty: prop})
        }
    }
    render() {
        if (this.state.tasks.length == 0) {
            return <LoadingScreen>
                Loading task list
            </LoadingScreen>
            /*
            return (
                <p>Loading task list; hang on pleaaase...</p>
            )
            */
        }
        if (this.state.sortProperty.length > 0) {
            this.state.tasks.sort(createSortOnProperty<TaskInfo>(this.state.sortProperty, this.state.sortType))
        }
        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th className="task-name-head" onClick={() => this.setSort("Name")}>
                            {this.getName("Name")}
                        </th>
                        <th className="task-id-head" onClick={() => this.setSort("Id")}>
                            {this.getName("Id")}
                        </th>
                        <th className="task-cpu-head" onClick={() => this.setSort("CpuUsage")}>
                            {this.getName("CpuUsage")}
                        </th>
                        <th className="task-memory-head" onClick={() => this.setSort("RamUsage")}>
                            {this.getName("RamUsage")}
                        </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.tasks.map(task => {
                        return (<Task key={task.Id} info={task} />)
                    })}
                </tbody>
            </table>
        )
    }
}

export class Task extends React.Component<
    {key: number, info: TaskInfo},
    {expanded?: boolean, gonnaDie?: boolean}> {
    constructor(props) {
        super(props)
        this.state = {expanded: false, gonnaDie: false}
    }
    killSelf = () => {
        sendCommandToDefault("killProcess", this.props.info.Id.toString())
    }
    closeButton() {
        return (this.state.gonnaDie ?
            <button onClick={this.killSelf}
                    className="btn btn-danger btn-sm animated fadeInRight"
                    style={{position: "absolute", marginLeft: -80, marginTop: -7}}>
                Confirm
            </button>
            : false)
    }
    confirmKill() {
        dialogEvents.dialog({
            title: "Confirm close process",
            body: <p>Are you sure you want to kill process {this.props.info.Name}?</p>,
            buttons: [
                <Button bsStyle="primary" onClick={this.killSelf}>Yes</Button>,
                <Button bsStyle="default">No</Button>
            ]
        })
    }
    render() {
        if (!this.state.expanded) {
            return (
                //onClick={() => this.setState({expanded: true})}
                //<button className="btn btn-danger">confirm</button>
                <tr>
                    <td style={{width: "39px"}}>
                        <img src={"data:image/png;base64," + this.props.info.Icon} />
                    </td>
                    <td className="task-name">
                        {this.props.info.Name.slice(0, 30)}
                    </td>
                    <td className="task-id" style={{width: 20}}>
                        {this.props.info.Id}
                    </td>
                    <td className="task-cpu" style={{width: 20}}>
                        {this.props.info.CpuUsage.toFixed(0) + "%"}
                    </td>
                    <td className="task-memory">
                        {bytesToSize(this.props.info.RamUsage)}
                    </td>
                    <td
                    className="close-button"
                    onClick={() => {
                        this.confirmKill()
                        //this.setState({gonnaDie: !this.state.gonnaDie})
                    }}
                    style={{width: 60, textAlign: "right"}}>
                        {this.closeButton()}
                        <span className={"glyphicon " + (this.state.gonnaDie ?
                            "glyphicon-ban-circle":"glyphicon-remove")}></span>
                    </td>
                </tr>
            )
        }
        else {
            return (
                <tr onClick={() => this.setState({expanded: false})}>
                    <td colSpan={5}>ssssssssssssssssssssssssssssssssssssssssssss</td>
                </tr>
            )
        }
    }
}


export function TaskPage(props: any) {
    return <div className="task-page" style={{height: "100%"}}>
        <div className="row">
            
        </div>
        <div className="row" style={{height: "100%"}}>
            <div className="col-md-7" style={{minHeight: "600px", height: "100%"}}>
                <Panel className="full-height">
                    <div className="header">processes</div>
                    <div className="fixed dashed-bottom" style={{height: 43}}>
                        <ProcessCreator />
                    </div>
                    <div className="body" style={{overflow: "auto"}}>
                        <TaskList />
                    </div>
                </Panel>
            </div>
            <div className="col-md-5 col-collapsed-left">
                <div>
                    <Stats />
                </div>
            </div>
        </div>
    </div>
}
