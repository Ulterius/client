
import React = require("react")
import {GpuAvailability, bytesToSize} from "../util"
import {systemStore, auxillarySystemStore} from "../store/system-stores"

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
                    minWidth: "0%"
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
            <div> {
                this.props.values.map(value => {
                    let [name, percent] = value
                    return (
                        <div style={{marginBottom: 5}}>
                        {name} {percent.toFixed(0) + "%"}<br />
                        <Bar value={percent} style={{width: "100%"}}/>
                        </div>
                    )
                })
            }</div>
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
            <div className="media icon-media">
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

export class Temperature extends React.Component<{children?: any}, {}> {
    render() {
        let degs = Number(this.props.children)
        let color = (degs < 60 ? "primary" : (degs < 80 ? "warning" : "danger"))
        let extra = (degs > 90 ? "burning" : "")
        return <span className={"label label-" + color + " " + extra}>{this.props.children} {"°C"}</span>
    }
}
