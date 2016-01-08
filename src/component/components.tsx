//yeah yeah I'll break this shit up later
//just testing things right now

import React = require("react")
import taskStore from "../store/task-store"
import {createSortOnProperty, bytesToSize} from "../util"

/*
export let Task = React.createClass<{ayy: string}, any>({
    render: function() {
        return (
            <p>
                {this.props.ayy}
            </p>
        )
    }
})
*/

export class TaskList extends React.Component<{}, {tasks?: Array<TaskInfo>, sortProperty?: string}> {
    constructor(props) {
        super(props)
        this.state = {tasks: [], sortProperty: "id"}
        this.onChange = this.onChange.bind(this)
    }
    componentDidMount() {
        console.log("mount")
        taskStore.listen(this.onChange)
    }
    componentWillUnmount() {
        taskStore.unlisten(this.onChange)
    }
    onChange(tasks) {
        this.setState(tasks)
        console.log(this.state)
    }
    render() {
        if (this.state.tasks.length == 0) {
            return (
                <p>Loading task list; hang on pleaaase...</p>
            )
        }
        if (this.state.sortProperty.length > 0) {
            this.state.tasks.sort(createSortOnProperty<TaskInfo>(this.state.sortProperty))
        }
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Icon</th>
                        <th onClick={() => this.setState({sortProperty: "id"})}>ID</th>
                        <th onClick={() => this.setState({sortProperty: "cpuUsage"})}>CPU</th>
                        <th onClick={() => this.setState({sortProperty: "ramUsage"})}>Memory</th>
                        <th onClick={() => this.setState({sortProperty: "name"})}>Name</th>
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

export class Task extends React.Component<{key: number, info: TaskInfo}, {}> {

    render() {
        return (
            <tr>
                <td><img src={"data:image/png;base64," + this.props.info.icon} /></td>
                <td>{this.props.info.id}</td>
                <td>{this.props.info.cpuUsage + "%"}</td>
                <td>{bytesToSize(this.props.info.ramUsage)}</td>
                <td>{this.props.info.name}</td>
            </tr>
        )
    }
}
