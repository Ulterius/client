import React = require("react")
import Component = React.Component
import ReactElement = React.ReactElement
import classNames = require("classnames")
import _ = require("lodash")
import {omit, assign} from "lodash"
import {stringIf, addClassName} from "../util"
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
            assign(
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
        let {height, width} = this.props
        if (width && height) {
            return <div id={this.id} className={width+"x"+height+"px gauge"} />
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


//why why why why WHY
type TabPageProps = React.HTMLAttributes & {title?: string}
export function TabPage(props: TabPageProps) {
    let {title} = props
    let divProps = omit(props, "title")
    return <div {...divProps}>
        {props.children}
    </div>
}

interface TabPanelProps extends React.HTMLAttributes {
    virtualTabs?: string[],
    onAdd?: (index: number) => any,
    onClose?: (index: number) => any,
    onChangeTab?: (index: number) => any,
    currentTab?: number
    //children: ReactElement<TabPageProps> | ReactElement<TabPageProps>[]
}

interface TabPanelState {
    currentPage: number
}

export function glyphicon(glyph: string) {
    return <span className={"glyphicon glyphicon-" + glyph} />
}

export class TabPanel extends Component<TabPanelProps, TabPanelState> {
    constructor(props, context) {
        super(props, context)
        this.state = {
            currentPage: 0
        }
    }
    closeButton(index: number) {
        if (this.props.onClose) {
            return <span 
                style={{cursor: "pointer"}} 
                className={"close-icon glyphicon glyphicon-remove"} 
                onClick={(e) => {
                    e.stopPropagation()
                    this.props.onClose(index)
                }}
            />
        }
        else {
            return null
        }
    }
    getTab(index: number, title: string) {
        let active = this.equalsCurrentTab(index)
        return <div
            key={index}
            className={classNames("tab-bar-tab", { "tab-bar-tab-active": active })}
            onClick={() => this.changeTab(index)}
        >
            {title} &nbsp; {this.closeButton(index)}
        </div>
    }
    isVirtual() {
        return this.props.virtualTabs && this.props.virtualTabs.length > 0
    }
    equalsCurrentTab(i: number) {
        if (this.isControlled()) {
            return i === this.props.currentTab
        }
        return i === this.state.currentPage
    }
    tabBar() {
        let {children, onAdd, virtualTabs} = this.props
        let tabCount: number, tabs: React.ReactNode[] 
        if (this.isVirtual()) {
            tabCount = virtualTabs.length
            tabs = virtualTabs.map((title, i) => {
                return this.getTab(i, title)
            })
        }
        else {
            tabCount = React.Children.count(children)
            tabs = React.Children.map(children, (child: ReactElement<TabPageProps>, i) => {
                return this.getTab(i, child.props.title)
            })
        }
        //regarding the onAdd callback: give it the index of the next potential tab
        //since it ought to be assumed that onAdd will give the shit another page
        return <div className="tab-bar">
            {tabs}
            <div 
                className="tab-bar-tab" 
                onClick={() => onAdd && onAdd(tabCount)}
            >
                {glyphicon("plus")}
            </div>
        </div>
    }
    changeTab(index: number) {
        this.props.onChangeTab && this.props.onChangeTab(index)
        if (!this.isControlled()) {
            this.setState({currentPage: index})
        }
    }
    isControlled() {
        return this.props.currentTab !== undefined
    }
    render() {
        let {children, virtualTabs, currentTab} = this.props
        let {currentPage} = this.state
        let activeTab
        if (this.isVirtual()) {
            activeTab = React.Children.only(children)
        }
        else {
            activeTab = React.Children.toArray(children).filter((child, i) => {
                if (this.isControlled()) {
                    return i === currentTab
                }
                return i === currentPage
            })[0]
        }
        let panelProps = omit(addClassName(this.props, "tab-panel"), 
            "onAdd", "virtualTabs", "onChangeTab", "onClose"
        )
        return <div {...panelProps}>
            {this.tabBar()}
            {activeTab}
        </div>
    }
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