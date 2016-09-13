import {screenConnection as sC} from "../socket"
import {generateKey, decompressData} from "../util/crypto"
import {base64toArray, arrayToBase64, addImageHeader, endpointMatch} from "../util"
//import {screenEvents} from "../component/screen"
import {settingsStore} from "../store"
import {messageActions} from "../action"
import pako = require("pako")
import EventEmitter = require("events")
import {SyncEvent} from "ts-events"

let debug: any = {}
window["debug"].screen = debug

export function eventPacket(type: string, action: string) {
    return {
        EventType: type,
        Action: action
    }
}

export let screenEvents = {
    disconnect: new SyncEvent,
    frame: new SyncEvent<ScreenTile>(),
    frameData: new SyncEvent<FrameData>(),
    start: new SyncEvent
}

export let screenShareApi = {
    start() {
        console.log(sC.encrypted)
        sC.callEndpoint("startscreenshare")
        /*
        sC.send({
            endpoint: "startscreenshare",
            args: []
        })
        */
    },
    requestFrame() {
        sC.callEndpoint("fullframe")
        /*
        sC.send({
            endpoint: "fullframe",
            args: []
        })
        */
    },
    login() {
        sC.send({
            endpoint: "login",
            args: ["password"]
        })
    },
    disconnect() {
        sC.callEndpoint("stopscreenshare")
    },
    mouse: {
        move(PointerX: number, PointerY: number) {
            sC.callEndpoint("mousemove", [PointerY, PointerX])
        },
        leftClick(PointerX: number, PointerY: number) {
            sC.callEndpoint("leftclick")
        },
        rightClick() {
            sC.callEndpoint("rightclick")
        },
        down() {
            sC.callEndpoint("mousedown")
        },
        up() {
            sC.callEndpoint("mouseup")
        },
        wheel(delta: number) {
            sC.callEndpoint("mousescroll", delta)
        }
    },
    keyDown(code: number) {
        sC.callEndpoint("keydown", [[code]])

    },
    keyUp(code: number) {
        sC.callEndpoint("keyup", [[code]])
    }
}


export function disconnect() {
    screenEvents.disconnect.post({})
    sC.disconnect()
}

export function isTile(message): message is ScreenTile {
    let {top, bottom, left, right, image} = message
    return [top, bottom, left, right].every(prop => typeof prop === "number") &&
            typeof image === "string"
}

/*
const packetGuards = {
    connectedToScreenShare(msg) {
        return msg.endpoint && msg.endpoint == 
    }
}
*/


export function register() {
    sC.fallbackListen(console.log.bind(console))
    sC.listenKeys<typeof sC>(endpointMatch, {
        /*
        connectedToScreenShare(msg, sc) {
            sc.unencrypt()
            console.log("Conncetedet to screen share")
            let {key, iv, encKey, encIV} = generateKey(msg.results.publicKey)
            sc.send({
                endpoint: "aesHandshake",
                args: [encKey, encIV]
            })
            sc.encrypt(key, iv)
        },
        */
        /*
        aesHandshake(msg, sc) {
            console.log("Screen share AES handshake dun.")
            console.log(msg)
            let password = settingsStore.getState().settings.ScreenShareService.ScreenSharePass
            console.log(password)
            console.log(settingsStore.getState())
            if (msg.results.shook) {
                if (password) {
                    console.log("Password good, logging in.")
                    sc.send({
                        endpoint: "login",
                        args: [password]
                    })
                }
                else {
                    messageActions.message({
                        style: "danger", 
                        text: "No screen share password. Set one!"
                    })
                }
            }
        },
        */
        /*
        login(msg, sc) {
            console.log("login")
            sc.ofb = true
            screenEvents.login.post({})
        },
        */
        startScreenShare(result) {
            console.log(result)
            if (result.screenStreamStarted) {
                screenEvents.start.post({})
            }
        },
        stopScreenShare(result) {
            if (result.streamStopped) {
                screenEvents.disconnect.post({})
            }
        },
        fullFrame(msg, sc) {
            let result: FrameData = msg
            let includedFrame = decompressData(new Uint8Array(result.frameData)) 
            screenEvents.frameData.post(result)
            screenEvents.frame.post({
                x: 0,
                y: 0,
                top: 0,
                left: 0,
                bottom: result.screenBounds.bottom,
                right: result.screenBounds.right,
                image: includedFrame
            })
        },
        screenShareData(msg: ScreenTile) {
            console.log("fraem got")
            screenEvents.frame.post(msg)
        }
    })
    sC.listen(isTile, (msg: ScreenTile, sc) => {
        screenEvents.frame.post(msg)
    })
    /*
    sC.listenBuffer(data => {
        //let compressedBuffer = base64toArray(data)
        //let imageBuffer = pako.inflate(compressedBuffer)
        //let base64Image = arrayToBase64(imageBuffer)
        screenEvents.frame(data)
    })
    */
}


