//yeah yeah I'll break this shit up later
//just testing things right now
import React = require("react")
import taskStore from "../store/task-store"

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

export class TaskList extends React.Component<{}, {tasks: Array<TaskInfo>}> {
    constructor(props) {
        super(props)
        this.state = {tasks: []}
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
        return (
            <table className="table">
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
                <td>{this.props.info.name}</td>
            </tr>
        )
    }
}
