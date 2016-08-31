import React = require("react")
import Component = React.Component
import classNames = require("classnames")
import _ = require("lodash")
import {stringIf} from "../util"
import {Glyphicon} from "react-bootstrap"

/*
export function createDivComponent(className: string) {
    return (props: React.HTMLProps<HTMLDivElement>) => {
        return <div {...props} className={className + stringIf(!!props.className, " " + props.className)}>
            {props.children}
        </div>
    }
}
*/

export function createDivComponent(className: string) {
    return createSimpleComponent<HTMLDivElement>("div", className)
}

export function createSimpleComponent<T>(elementType: string, className: string) {
    return (props: React.HTMLProps<T>) => {
        return React.createElement(
            elementType, 
            _.assign(
                {},
                props, 
                {className: className + stringIf(!!props.className, " " + props.className)}
            )
        )
    }
}

export const panel = {
    Panel: createDivComponent("ulterius-panel"),
    Header: createDivComponent("header"),
    HeaderCenter: createDivComponent("header-center"),
    Fixed: createDivComponent("fixed"),
    FixedCenter: createDivComponent("fixed-center"),
    Flex: createDivComponent("flexible"),
    FlexFixed: createDivComponent("flex-fixed")
}

export const Panel = createDivComponent("ulterius-panel")
export const FlexRow = createDivComponent("flex-row")
export const FlexCol = createDivComponent("flex-col")

export function Meter() {
    return <svg viewBox="0 0 100 75">
        <path d="M25 40 C 35 20 65 20 75 40" style={{strokeWidth: 20}} stroke="black" fill="transparent"/>
    </svg>
}

interface ToggleSwitchProps {
    onChange?: (newValue: boolean) => any,
    label?: string,
    defaultState?: boolean,
    key?: any
}

interface ToggleSwitchState {
    on?: boolean
}

export class ToggleSwitch extends Component<ToggleSwitchProps, ToggleSwitchState> {
    constructor(props, context) {
        super(props, context)
        this.state = {on: this.props.defaultState}
    }
    innerSwitch() {
        let {key} = this.props
        let {on} = this.state
        return <div 
            key={key} 
            className={classNames(["toggle-switch", {on}])}
            onClick={() => {
                if (this.props.onChange) {
                    this.props.onChange(!this.state.on)
                }
                this.setState({on: !this.state.on})
            }}
        >
            <div className="inner">
                <div><Glyphicon glyph={on?"ok":"remove"}/></div>
            </div>
        </div>
    }
    render() {
        let {label, key} = this.props
        let on = this.state
        if (label) {
            return <div>
                <div key={key} className="toggle-label">{label}</div>
                {this.innerSwitch()}
            </div>
        }
        return this.innerSwitch()
    }
}

declare let require: (string) => any
require("justgage")
declare let JustGage: any

let gaugeId = 0
function getGaugeId() {
    gaugeId++
    return "gauge" + gaugeId
}

interface GaugeProps {
    title?: string,
    label: string,
    value: string | number,
    min: string | number,
    max: string | number
    width?: number,
    height?: number
}

export class Gauge extends Component<GaugeProps, {}> {
    gauge: any
    id: string
    componentDidMount() {
        this.gauge = new JustGage({
            id: this.id,
            value: Number(this.props.value),
            min: Number(this.props.min),
            max: Number(this.props.max),
            label: this.props.label || "",
            title: this.props.title || ""
        })
    }
    componentWillReceiveProps(nextProps: GaugeProps) {
        if (nextProps.value !== this.props.value) {
            this.gauge.refresh(nextProps.value)
        }
        if (nextProps.max !== this.props.max) {
            this.gauge.refresh(this.props.value, nextProps.max)
        }
    }
    constructor(props, context) {
        super(props, context)
        this.id = getGaugeId()
    }
    inner() {
        if (this.props.width && this.props.height) {
            return <div id={this.id} className={this.props.width+"x"+this.props.height+"px gauge"} />
        }
        return <div id={this.id} className="gauge"/>
    }
    render() {
        return <div className="gauge-outer">
            {this.inner()}
            <span className="stat-item-head-text">{this.props.title}</span> <br />
            <span className="stat-item-body-text">{this.props.value}{this.props.label}</span>
        </div>
    }
}

export function Center(props: React.HTMLAttributes & {noHeight?: boolean}) {
    //what the fuck is wrong with me again?
    return <div {...props} className={classNames({
                "center-parent": !props.noHeight, 
                "center-parent-no-height": props.noHeight
            }, props.className)}>
        <div className="center-child">
            {props.children}
        </div>
    </div>
}

interface TabPanelState {
    pages: React.ReactChild[],
    currentPage: number
}

export function TabPage(props: React.HTMLAttributes & {title: string}) {
    let {title} = props
    let divProps = _.omit(props, "title")
    
}

export class TabPanel extends Component<{}, TabPanelState> {

}

/*
export function ToggleSwitch({on, onClick, label, key}: ToggleSwitchProps) {
    function innerSwitch() {
        return <div key={key} className={classNames(["toggle-switch", {on}])}>
            <div className="inner">
                <div><Glyphicon glyph={on?"ok":"remove"}/></div>
            </div>
        </div>
    }
    if (label) {
        return <div>
            <div key={key} className="toggle-label">{label}</div>
            {innerSwitch()}
        </div>
    }
    return innerSwitch()
}
*/