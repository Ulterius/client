import React = require("react")
import taskStore from "../store/task-store"
import {createSortOnProperty, bytesToSize} from "../util"
import {socket, sendCommandToDefault} from "../socket"
import appState from "../app-state"

export class TaskList extends React.Component<
    {},
    {tasks?: Array<TaskInfo>, sortProperty?: string, sortType?: string}
> {
    constructor(props) {
        super(props)
        this.state = {tasks: [], sortProperty: "id", sortType: "asc"}
        this.onChange = this.onChange.bind(this)
    }
    componentDidMount() {
        taskStore.listen(this.onChange)
        if (appState.authenticated) {
            //sendCommandToDefault("requestProcessInformation")
            this.setState(taskStore.getState())
        }
    }
    componentWillUnmount() {
        taskStore.unlisten(this.onChange)
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
            return (
                <p>Loading task list; hang on pleaaase...</p>
            )
        }
        if (this.state.sortProperty.length > 0) {
            this.state.tasks.sort(createSortOnProperty<TaskInfo>(this.state.sortProperty, this.state.sortType))
        }
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th onClick={() => this.setSort("name")}>Name</th>
                        <th onClick={() => this.setSort("id")}>ID</th>
                        <th onClick={() => this.setSort("cpuUsage")}>CPU</th>
                        <th onClick={() => this.setSort("ramUsage")}>Memory</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.tasks.map(task => {
                            return (<Task key={task.id} info={task} />)
                        })
                    }
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
        sendCommandToDefault("killProcess", this.props.info.id.toString())
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
    render() {
        if (!this.state.expanded) {
            return (
                //onClick={() => this.setState({expanded: true})}
                //<button className="btn btn-danger">confirm</button>
                <tr>
                    <td style={{width: "39px"}}>
                        <img src={"data:image/png;base64," + this.props.info.icon} />
                    </td>
                    <td>{this.props.info.name}</td>
                    <td style={{width: 20}}>{this.props.info.id}</td>
                    <td style={{width: 20}}>{this.props.info.cpuUsage + "%"}</td>
                    <td>{bytesToSize(this.props.info.ramUsage)}</td>
                    <td
                    className="close-button"
                    onClick={() => this.setState({gonnaDie: !this.state.gonnaDie})}
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
