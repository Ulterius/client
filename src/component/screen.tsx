import React = require("react")
import Component = React.Component
import {Button} from "react-bootstrap"
import {Base64Img, Center} from "./"
import {screenShareApi, screenEvents} from "../api/screen"
import {helpers} from "../api-layer"
import {tryUntil, clearFunctions} from "../util"
import {messageActions} from "../action"

/*
export let screenEvents = {
    frame(data: ScreenTile) {},
    frameData(data: FrameData) {},
    login() {},
    disconnect() {}
}
*/

export function ScreenPage() {
    return <ScreenShare />
}

interface ScreenCoordinates {
    screenX: number,
    screenY: number
}

//let img = new Image()

function sendKeyCombo(...codes: number[]) {
    //screenShareApi.keysDown(codes)
    codes.forEach((code, i) => {
        setTimeout(() => {
            screenShareApi.keyDown(code)
        }, 100*i)
        setTimeout(() => {
            screenShareApi.keyUp(code)
        }, 500 + (100*i))
    })
    //codes.forEach(screenShareApi.keyDown)
    //setTimeout(() => {codes.forEach(screenShareApi.keyUp)}, 500)
    //setTimeout(() => {screenShareApi.keysUp(codes)}, 500)
}

class ScreenShare extends Component<{}, {
    hasFrame?: boolean,
    maximized?: boolean,
    frame?: string,
    screenWidth?: number,
    screenHeight?: number,
    showKeyCombos?: boolean
}> {
    canvas: HTMLCanvasElement
    canvasCtx: CanvasRenderingContext2D
    keyCombos: HTMLDivElement
    failures: number = 0
    constructor() {
        super()
        this.state = {}
    }
    componentDidMount() {
        screenEvents.frame.attach((tile: ScreenTile) => {
            if (this.canvasCtx) {
                const {x, y, top, bottom, left, right, image} = tile
                const width = right - left
                const height = bottom - top
                //img.width = width
                //img.height = height

                const img = new Image(width, height)
                
                //img.src = `data:image/jpg;base64,${image}`
                img.src = image
                img.onload = () => {
                    this.canvasCtx.drawImage(img, x, y, width, height)
                    setTimeout(() => {
                        URL.revokeObjectURL(img.src)
                    }, 200)
                }
            }
        })
        screenEvents.frameData.attach((data: FrameData & {frameFailed: boolean}) => {
            if (data.frameFailed) {
                if (this.failures < 4) {
                    screenShareApi.requestFrame()
                    this.failures++
                }
                return;
            }
            console.log("frame data")
            console.log(data)
            console.log(data.screenBounds)
            this.setState({
                screenWidth: data.screenBounds.right,
                screenHeight: data.screenBounds.bottom
            })
        })
        screenEvents.start.attach(() => {
            console.log("login")
            this.bindKeys()
            tryUntil(() => !!this.state.screenWidth, (tryNumber, last) => {
                console.log("try")
                screenShareApi.requestFrame()
            }, 5, 2000, () => {
                messageActions.msg("danger", "Connection timed out.")
            })
        })
        screenEvents.disconnect.attach(() => {
            console.log("disconnect")
            this.setState({
                screenWidth: 0,
                screenHeight: 0,
                hasFrame: false
            })
            this.unbindKeys()
        })
        window.addEventListener("resize", this.onResize)
    }
    bindKeys() {
        document.addEventListener("keydown", this.onKeyDown)
        document.addEventListener("keyup", this.onKeyUp)
    }
    unbindKeys() {
        document.removeEventListener("keydown", this.onKeyDown)
        document.removeEventListener("keyup", this.onKeyUp)
    }
    componentWillUnmount() {
        screenShareApi.disconnect()
        _.forOwn(screenEvents, (event) => {
            event.detach()
        })
        this.unbindKeys()
        window.removeEventListener("resize", this.onResize)
    }
    cancelEvents(e: React.SyntheticEvent | Event) {
        e.preventDefault()
        e.stopPropagation()
    }
    transformMouse(e: React.MouseEvent) {
        
        let target = e.target as HTMLCanvasElement
        let rect = target.getBoundingClientRect()
        let sH = this.state.screenHeight || 1
        let sW = this.state.screenWidth || 1
        let vX = e.clientX - rect.left
        let vY = e.clientY - rect.top
        let screenX = sW * (vX / rect.width)
        let screenY = sH * (vY / rect.height)
        let transformed = _.assign({}, e, {
            screenX,
            screenY
        })
        return transformed as React.MouseEvent & ScreenCoordinates
    }
    onKeyDown = (e: KeyboardEvent) => {
        console.log("key press")
        this.cancelEvents(e)
        screenShareApi.keyDown(e.keyCode)
    }
    onKeyUp = (e: KeyboardEvent) => {
        this.cancelEvents(e)
        screenShareApi.keyUp(e.keyCode)
    }
    processMouse(e: React.MouseEvent) {
        this.cancelEvents(e)
        return this.transformMouse(e)
    }
    onResize = () => {
        console.log(this.canvas, this.keyCombos)
        if (this.canvas && this.keyCombos) {
            const rect = this.canvas.getBoundingClientRect()
            this.keyCombos.style.top = rect.top + "px"
            this.keyCombos.style.left = rect.left + "px"
        }
    }
    componentDidUpdate() {
        this.onResize()
    }
    keys() {
        const display = this.state.showKeyCombos ? "block" : "none"
        const s: React.CSSProperties = {
            display, 
            position: "fixed", 
            marginLeft: 10, 
            marginTop: 10
        }
        const ps: React.CSSProperties = {
            cursor: "pointer"
        }
        return <div style={s} ref={ref => {if (ref) this.keyCombos = ref}}>
            <div><kbd style={ps} onClick={() => {
                //sendKeyCombo(17, 18, 46)
                screenShareApi.ctrlAltDel()
            }}>ctrl + alt + delete</kbd></div>
            <div onClick={() => {sendKeyCombo(17, 67)}}><kbd style={ps}>alt + f4</kbd></div>
        </div>
    }
    frameImg() {
        let {screenWidth, screenHeight} = this.state
        return <canvas 
            width={screenWidth || "500"}
            height={screenHeight || "500"}
            style={{width: "100%", height: "auto"}}
            tabIndex={1}
            ref={(ref) => {
                this.canvas = ref
                if (ref) {
                    this.canvasCtx = ref.getContext("2d")
                }
            }} 
            onMouseMove={(e) => {
                let {screenX, screenY} = this.processMouse(e)
                screenShareApi.mouse.move(screenX, screenY)
            }}
            onContextMenu={(e) => {
                this.processMouse(e)
                screenShareApi.mouse.rightClick()
            }}
            onClick={(e) => {
                let {screenX, screenY} = this.processMouse(e)
                if (e.button == 0) {
                    screenShareApi.mouse.leftClick(screenX, screenY)
                }
            }} 
            onMouseDown={(e) => {
                this.processMouse(e)
                screenShareApi.mouse.down()
            }}
            onMouseUp={(e) => {
                this.processMouse(e)
                screenShareApi.mouse.up()
            }}
            onWheel={(e)=> {
                this.processMouse(e)
                screenShareApi.mouse.wheel(e.deltaY/20)
            }}
        />
    }
    requestFullScreen = (element) => {
        // Supports most browsers and their versions.
        var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

        if (requestMethod) { // Native full screen.
            requestMethod.call(element);
        }
    }
    maximize = () => {
        this.setState({
            maximized: true
        });
    }
    restoreSize = () => {
        this.setState({
            maximized: false
        });
    }
    resizeButtons = () => {
        if(this.state.maximized){
            return <button className="text-button" onClick={this.restoreSize}>
                <span className="glyphicon glyphicon-resize-small"></span>
                </button>
        }else{
            return <button className="text-button" onClick={this.maximize}>
                <span className="glyphicon glyphicon-resize-full"></span>
                </button>                
        }
    }
    goFullScreen = () => {
        var rd = document.getElementById('remoteDesktop');
        this.requestFullScreen(rd);
    }
    fullScreenButton = () => {
        return <button className="text-button" onClick={this.goFullScreen}>
                <span className="glyphicon glyphicon-fullscreen"></span>
                </button>
    }
    connected() {
        if (this.state.screenWidth) {
            return <div className="proxima-nova-14">
                Connected &nbsp; 
                <span style={{color: "green"}} className="glyphicon glyphicon-record"/>
                <button className="text-button" onClick={screenShareApi.disconnect}>
                    disconnect
                </button>
                &nbsp;
                {this.resizeButtons()}
                &nbsp;
                {this.fullScreenButton()}
            </div>

        }
         return <div className="proxima-nova-14">
            Not Connected &nbsp; <span style={{color: "red"}} className="glyphicon glyphicon-record"/>
        </div>
    }
    frame() {
        if (this.state.screenWidth) {
            console.log(this.canvasCtx)
            return <div id='remoteDesktop' className="fixed">
                {this.frameImg()}
                {this.keys()}
            </div>
        }
        return <Center noHeight style={{flexGrow: 1}}>
            <p>Not connected to Screen Share.</p>
            <button className="btn btn-primary text-button" onClick={() => {
                screenShareApi.start()
            }}>Connect</button>
        </Center>
    }
    render() {
        var screenClass = 'screen-page';
        if (this.state.maximized) screenClass += ' fullscreen';
        return <div  className={screenClass} style={{height: "100%"}}>
        <div className="ulterius-panel" style={{height: "100%"}}>
            <div className="double-header">
                <div onClick={() => this.setState({showKeyCombos: !this.state.showKeyCombos})}>screen share</div>
                {this.connected()}
            </div>
            {this.frame()}
            {/* 
            <Button onClick={() => {
                screenShareApi.login()
            }}>Connect</Button>
            <br />
            <Button onClick={() => {
                screenShareApi.requestFrame()
            }}/>
            */}
        </div>
        </div>
    }
}