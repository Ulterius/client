
import React = require("react")
import Component = React.Component
import ReactDOM = require("react-dom")
import {GpuAvailability, bytesToSize, clearFunctions} from "../util"
import {systemStore, auxillarySystemStore, userStore} from "../store/system-stores"
import {listen} from "../api-layer"
import * as _ from "lodash"
import classNames = require("classnames")
import {TransitionMotion, spring, presets} from "react-motion"


export function Left({children}: {children?: React.ReactNode}) {
    return React.Children.only(children)
}

export function Right({children}: {children?: React.ReactNode}) {
    return React.Children.only(children)
}
//export const Left = ({children}: {children: React.ReactNode}) => children
//export const Right = ({children}: {children: React.ReactNode}) => children

const findChildren = (children: any[], type) => (
  children.reduce((memo, child) => (
    child.type === type ? child : memo
  ), null)
)

export const Either = ({children}: {children: React.ReactNode}) => {
    const childArray = React.Children.toArray(children)
    return _.find(children as any, (child) => child !== " ")
        ? findChildren(React.Children.toArray(children), Right)
        : findChildren(React.Children.toArray(children), Left)
}

export function Bar(props: {value?: number, color?: boolean, style?: any}) {
    let color = function(colored: boolean) {
        if (colored) {
            return "progress-bar-" +
            (percent < 60 ? "primary":
                (percent < 80 ? "warning" : "danger"))
        }
        else {
            return "progress-bar-primary"
        }
    }
    if (!props.value) {
        return <div className="progress" style={props.style || {}}>
            <div 
            className="progress-bar progress-bar-primary progress-bar-striped active" 
            aria-valuenow="100" 
            aria-valuemin="0"
            aria-valuemax="100"
            style={{
                width: `${100}%`,
                minWidth: "0%"
            }}>
            </div>
        </div>
    }
    let percent = props.value
    return <div className="progress" style={props.style || {}}>
        <div
        className={
            "progress-bar " + color(props.color)
        }
        aria-valuenow={percent.toString()}
        aria-valuemin="0"
        aria-valuemax="100"
        style={{
            width: `${percent}%`,
            minWidth: "0%"
        }}>
        </div>
    </div>
}

export class Bars extends React.Component<{ values: [string, number][] }, {}> {
    constructor(props) {
        super(props)
    }
    render() {
        return <div>
            {this.props.values.map(value => {
                let [name, percent] = value
                return (
                    <div style={{marginBottom: 5}}>
                    {name} {percent.toFixed(0) + "%"}<br />
                    <Bar value={percent} style={{width: "100%"}}/>
                    </div>
                )
            })}
        </div>
    }
}

export function IconMedia(props: {
    src: string, 
    alt: string, 
    size: [number, number], 
    children?: any
}) {
    return <div className="media icon-media">
        <div className="media-left">
            <div className="icon">
                <img className="media-object"
                    width={props.size[0].toString()}
                    height={props.size[1].toString()}
                    src={props.src}
                    alt={props.alt} />
            </div>
        </div>
        <div className="media-body">
            {props.children}
        </div>
    </div>
}

export function Temperature(props: {children?: any}) {
    let degs = Number(props.children)
    let color = (degs < 60 ? "primary" : (degs < 80 ? "warning" : "danger"))
    let extra = (degs > 90 ? "burning" : "")
    return <span className={"label label-" + color + " " + extra}>
        {props.children} {"°C"}
    </span>
}

export class UserWidget extends React.Component<{}, {user: UserInfo}> {
    constructor(props) {
        super(props)
        this.state = {user: null}
    }
    componentDidMount() {
        this.updateUser(userStore.getState())
        userStore.listen(this.updateUser)
    }
    componentWillUnmount() {
        userStore.unlisten(this.updateUser)
    }
    updateUser = (state) => {
        this.setState(state)
    }
    render() {
        if (!this.state.user) {
            return <div style={{float: "right"}}>Loading user...</div>
        }

        let {avatar, username} = this.state.user
        return <div className="user-widget">
            <Base64Img src={"data:image/png;base64," + avatar} className="img-circle" width="64" height="64" alt="avatar" />
            <div style={{marginTop: 5}}>Hi, {username}!</div>
        </div>

    }
}

interface Base64ImgProps extends React.HTMLAttributes, React.ClassAttributes<HTMLImageElement> {
    type?: string,
    data?: string
}

export function Base64Img(props: Base64ImgProps) {
    const {type, data} = props
    const other = _.omit(props, ["type", "data"])
    return <img src={`data:${type};base64,${data}`} {...other} />
}

import {MessageState, messageStore} from "../store"
import {Alert} from "react-bootstrap"
import ReactCSSTransitionGroup = require("react-addons-css-transition-group")

export function FadeTransition(props: {children?: any}) {
    return <ReactCSSTransitionGroup 
        transitionName={"fade"}
        transitionAppear={false} 
        transitionEnterTimeout={300} 
        transitionAppearTimeout={300} 
        transitionLeaveTimeout={300}
    >
        {props.children}
    </ReactCSSTransitionGroup>
}

export function SlideTransition(props: {children?: any}) {
    return <ReactCSSTransitionGroup 
        transitionName={"slide"}
        transitionAppear={true} 
        transitionEnterTimeout={300} 
        transitionAppearTimeout={300} 
        transitionLeaveTimeout={300}
    >
        {props.children}
    </ReactCSSTransitionGroup>
}

export class Messages extends React.Component<{}, MessageState> {
    messageHeight: number = 0
    constructor(props, context) {
        super(props, context)
        this.state = {
            messages: []
        }
    }
    componentDidMount() {
        this.updateMessages(messageStore.getState())
        messageStore.listen(this.updateMessages)
    }
    componentWillUnmount() {
        messageStore.unlisten(this.updateMessages)
    }
    updateMessages = (state) => {
        this.setState(state)
    }
    willLeave() {
        return {x: spring(250, presets.noWobble)}
    }
    willEnter(initial) {
        return {
            x: 250,
            negativeMargin: 1
        }
    }
    render() {
        if (!this.state) {
            return <div className="messages"></div>
        }
        let style = {
            zIndex: 9001,
            position: "fixed",
        }
        return <TransitionMotion
            willLeave={this.willLeave}
            willEnter={this.willEnter}
            styles={this.state.messages.map(msg => ({
                key: String(msg.key),
                style: {
                    x: spring(0, presets.noWobble),
                    negativeMargin: spring(0, presets.noWobble)
                },
                data: _.assign({}, msg)
            }))}
            
        >
            {interpolatedStyles => {
                return <div style={{
                    zIndex: 9001,
                    position: "fixed",
                    bottom: 10,
                    right: 10,
                    width: 220
                }}>
                    {interpolatedStyles.map(s => 
                        <div 
                            key={s.key} 
                            ref={ref => {ref && (this.messageHeight = ref.clientHeight)}}
                            className={"alert alert-" + s.data.style}
                            style={{
                                transform: `translateX(${s.style.x || 0}px)`,
                                marginTop: -((s.style.negativeMargin || 0) * (this.messageHeight + 21))
                            }}
                        >
                            {s.data.text}
                        </div>
                    )}
                </div>
            }}
        </TransitionMotion>
            {/*<FadeTransition>
                {this.state.messages.map((msg, i) => {
                    return <div className={"alert alert-" + msg.style}>{msg.text}</div>
                    //return <Alert key={i} bsStyle={msg.style}>{msg.text}</Alert>
                })}
            </FadeTransition> */}
        
    }
}

import {Input, Button, Glyphicon} from "react-bootstrap"

export class EntryBox extends React.Component<
    {
        onConfirmation: (text: string) => any, 
        onEscape?: () => any,
        glyph?: string, 
        buttonText?: string,
        buttonStyle?: string,
        placeholder?: string,
        type?: string,
        defaultValue?: string,
        list?: string
    }, 
    {text?: string, customized?: boolean}> {
    constructor(props) {
        super(props)
        this.state = {}
    }
    render() {
        const confirmButton = 
            <Button
            bsStyle={this.props.buttonStyle || "primary"}
            onClick={() => {this.props.onConfirmation(this.state.text)}}>
                {this.props.glyph ? <Glyphicon glyph={this.props.glyph} /> : false}
                {this.props.buttonText ? this.props.buttonText : false}
            </Button>
        return <Input
            list={this.props.list}
            type={this.props.type || "text"}
            placeholder={this.props.placeholder || ""}
            buttonAfter={confirmButton}
            onChange={e => this.setState({text: (e.target as any).value, customized: true})}
            value={this.state.customized ? this.state.text : this.props.defaultValue}
            onKeyDown={e => {
                if (e.keyCode == 13) {
                    this.props.onConfirmation(this.state.text)
                }
                if (e.keyCode == 27) {
                    if (this.props.onEscape)
                        this.props.onEscape()
                }
            }} 
        />
    }
}

export function LoadingScreen(props: {percentage?: number, children?: string}) {
    return <div style={{width: "100%", height: "100%"}}>
        <div style={{
            position: "absolute", 
            top: "calc(50% - 20px)", left:"calc(50% - 60px)", 
            height: 40, width: 120, 
            textAlign: "center"
        }}>
            <Bar value={props.percentage} color={false}/> <br />
            {props.children}
        </div>
    </div>
}


export class DragElement extends React.Component<{
    orderKey?: number,
    children?: any,
    [key: string]: any
}, {}> {
    child: HTMLDivElement
    constructor(props) {
        super(props)
    }
    render() {
        const passDown = _.omit(this.props, "orderKey")
        return <div {...passDown} ref={ref => this.child = ref}>
            {this.props.children}
        </div>
    }
}

export class DragGroup extends React.Component<{children?: React.ReactElement<any>[]}, {
    order: number[]
}> {
    references: React.ReactElement<any>[]
    
    dragging: number
    constructor(props) {
        super(props)
        this.state = {
            order: React.Children.toArray(props.children).map((child, i) => {
                return i
            })
        }
    }
    componentWillReceiveProps(nextProps) {
        //reset everything if there is a different number of children than before
        //otherwise do not
        
        if (React.Children.toArray(nextProps.children).length != this.state.order.length) {
            console.log("Refreshing the shit")
            this.setState({order: React.Children.toArray(nextProps.children).map((child, i) => {
                return i
            })})
        }
    }
    componentDidMount() {
        document.addEventListener("dragover", (e) => e.preventDefault(), false)
    }
    handleDragStart = (child, i, {target, pageX, pageY}) => {
        //this.dragging = this.childArray[this.indexOfKey(target.props.orderKey)]
        this.dragging = i
    }
    handleDrop = ({target,pageX, pageY}) => {
        //console.log([target, pageX, pageY])
        
    }
    swapChildren(key1: number, key2: number) {
        
    }
    indexOfKey(key: number) {
        
    }
    handleDropTwo = (child, i, e) => {
        e.preventDefault()
        let newOrder = this.state.order.slice()
        let oldI = _.indexOf(newOrder, this.dragging)
        let newI = _.indexOf(newOrder, i)
        newOrder[newI] = this.state.order[oldI]
        newOrder[oldI] = this.state.order[newI]
        console.log(this.state.order)
        console.log(newOrder)
        this.setState({order: newOrder})
    }
    render() {
        let childArray = React.Children.toArray(this.props.children).map((child, i) => {
            let ch = child as any
            return React.cloneElement(ch, {
                style: _.assign({}, ch.props.style, {display: "inline-block"}),
                draggable: true, 
                onDragStart: (e: any) => {
                    this.handleDragStart(child, i, e)
                },
                onDrop: e => {
                    this.handleDropTwo(child, i, e)
                }
            })
        })
        return <div>
            {this.state.order.map(i => {
                return childArray[i]
            })}
        </div>
    }
}

import {stringIf} from "../util"

export class Dropdown extends React.Component<{
    text: React.ReactNode,
    dropStyle?: React.CSSProperties,
    children?: any
}, {
    visible?: boolean,
    position?: [number, number]
}> {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            position: [0, 0]
        }
    }
    componentDidMount() {
        document.addEventListener("click", this.clickHide)
    }
    componentWillUnmount() {
        document.removeEventListener("click", this.clickHide)
    }
    clickHide = ({target}) => {
        if (target != this.refs["span"]) {
            this.hide()
        }
    }
    hide = () => {
        this.setState({visible: false})
    }
    show = () => {
        this.setState({visible: true})
    }
    moveTo = (position: [number, number]) => {
        this.setState({position})
    }
    render() {
        return <span>
            <span ref="span" style={{cursor: "pointer"}} onClick={({pageX, pageY}) => {
                //this.moveTo([pageX, pageY])
                //this.show()
                this.setState({visible: !this.state.visible})
            }}>
                {this.props.text}
            </span> <br />
            <div style={{height: 0, width: "auto"}}>
                <SlideDownTransition show={this.state.visible}>
                    <div style={_.assign({}, {zIndex: 2}, this.props.dropStyle)}>
                        {this.props.children}
                    </div>
                </SlideDownTransition>
            </div>
        </span>
    }
    
}

export class Transition extends React.Component<{
    style?: React.CSSProperties,
    styleHere: React.CSSProperties,
    styleGone: React.CSSProperties,
    timeOut: number,
    show: boolean,
    children?: React.ReactChild
}, {
    visible?: boolean,
    leaving?: boolean,
    entering?: boolean
}> {
    constructor(props) {
        super(props)
        this.state = {
            visible: props.show,
            leaving: false,
            entering: false
        }
    }
    componentWillReceiveProps({show}) {
        //entering is true at the very moment of entering
        //in order to prime transitions, it first makes the element styled like it's gone
        if (show) {
            this.setState({entering: true})
            setTimeout(() => {this.setState({visible:true, entering: false})}, 5)
        }
        if (!show && this.props.show) {
            this.setState({leaving: true})
            setTimeout(() => {this.setState({visible: false, leaving: false})}, this.props.timeOut)
        }
    }
    render() {
        if (!this.state.visible && !this.state.entering) {
            return null
        }
        const childArray = React.Children.toArray(this.props.children).map(ch => {
            let child = ch as any
            let style = _.assign(
                {},
                child.props.style,
                this.props.style,
                this.state.leaving||this.state.entering? 
                    this.props.styleGone : 
                    this.props.styleHere
            )
            return React.cloneElement(child, {style})
        })
        if (childArray.length > 1) {
            return <div>{childArray}</div>
        }
        return childArray[0]
    }
}


export function TransformTransition(props: {
    show: boolean,
    length?: number, 
    here: string, 
    gone: string,
    easing?: string,
    origin?: string,
    children?: React.ReactNode
}) {
    return <Transition
        show={props.show}
        style={{
            transition: "transform " + (props.easing || "ease ") + (props.length || "250") + "ms",
            transformOrigin: props.origin || "left top"
        }}
        styleHere={{transform: props.here}}
        styleGone={{transform: props.gone}}
        timeOut={length || 250}
    >
        {props.children}
    </Transition>
}

export function SlideDownTransition(props: {show: boolean, children?: React.ReactNode}) {
    return <TransformTransition 
        show={props.show}
        here="scale(1, 1)"
        gone="scale(1, 0)"
    >
        {props.children}
    </TransformTransition>
}

export function MoveRightTransition(props: {show: boolean, children?: React.ReactNode}) {
    return <TransformTransition
        show={props.show}
        here={"translateX(0px)"}
        gone={"translateX(-200px)"}
    >
        {props.children}
    </TransformTransition>
}



export function MoveLeftTransition(props: {
    show: boolean, 
    distance?: number,
    children?: React.ReactNode}
) {
    let distance = props.distance || 200
    return <TransformTransition
        show={props.show}
        here={"translateX(0px)"}
        gone={`translateX(${distance}px)`}
    >
        {props.children}
    </TransformTransition>
}

export function Overlay(props: any) {
    /*
    if (!props) {
        props = {}
    }
    if (!props.style) {
        props.style = {}
    }
    */
    const style = _.assign({}, props.style, {
        zIndex: (props.style && props.style.zIndex ? props.style.zIndex : 10),
        position: "fixed",
        width: "100%",
        height: "100%",
        //opacity: 0.5,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    })
    
    return <div {...props} style={style}>
        {props.children}
    </div>
    
}

export let disconnectEvents = {
    disconnect() {},
    reconnect() {}
}

export function Spinner(props: React.HTMLAttributes & {dark?: boolean}) {
    return <div {...props} className={classNames("sk-circle", {"circle-dark": props.dark}, props.className)}>
        <div className="sk-circle1 sk-child"></div>
        <div className="sk-circle2 sk-child"></div>
        <div className="sk-circle3 sk-child"></div>
        <div className="sk-circle4 sk-child"></div>
        <div className="sk-circle5 sk-child"></div>
        <div className="sk-circle6 sk-child"></div>
        <div className="sk-circle7 sk-child"></div>
        <div className="sk-circle8 sk-child"></div>
        <div className="sk-circle9 sk-child"></div>
        <div className="sk-circle10 sk-child"></div>
        <div className="sk-circle11 sk-child"></div>
        <div className="sk-circle12 sk-child"></div>
    </div>
}

export class DisconnectOverlay extends Component<{}, {
    visible?: boolean
}> {
    constructor(props, context) {
        super(props, context)
        this.state = {visible: false}
    }
    componentDidMount() {
        disconnectEvents.disconnect = () => {
            this.setState({visible: true})
        }
        disconnectEvents.reconnect = () => {
            this.setState({visible: false})
        }
    }
    componentWillUnmount() {
        clearFunctions(disconnectEvents)
    }
    render() {
        if (this.state.visible) {
            return <div>
                <Overlay style={{zIndex: 55, color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                    <Spinner />
                    <div>Disconnected. Attempting to reconnect...</div>
                </Overlay>
            </div>
        }
        return null;
    }
}

