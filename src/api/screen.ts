import {screenConnection as sC} from "../socket"
import {generateKey, decompressData} from "../util/crypto"
import {base64toArray, arrayToBase64, addImageHeader} from "../util"
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
    login: new SyncEvent
}

export let screenShareApi = {
    requestFrame() {
        sC.send({
            EventType: "Frame",
            Action: "Full"
        })
    },
    login() {
        sC.send({
            endpoint: "login",
            args: ["password"]
        })
    },
    disconnect() {
        sC.disconnect()
    },
    mouse: {
        move(PointerX: number, PointerY: number) {
            sC.sendEvent("Mouse", "Move", {
                PointerX, PointerY
            })
        },
        leftClick(PointerX: number, PointerY: number) {
            sC.sendEvent("Mouse", "LeftClick", {
                PointerX, PointerY
            })
        },
        rightClick() {
            sC.sendEvent("Mouse", "RightClick")
        },
        down() {
            sC.sendEvent("Mouse", "Down")
        },
        up() {
            sC.sendEvent("Mouse", "Up")
        },
        wheel(delta: number) {
            sC.sendEvent("Mouse", "Scroll", {
                delta
            })
        }
    },
    keyDown(code: number) {
        sC.sendEvent("Keyboard", "KeyDown", {
            KeyCodes: [code]
        })
    },
    keyUp(code: number) {
        sC.sendEvent("Keyboard", "KeyUp", {
            KeyCodes: [code]
        })
    }
}

export function initialize(host, port) {
    sC.connect(host, port)
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
    sC.listenKeys<typeof sC>((key, msg) => msg.endpoint && msg.endpoint.toLowerCase() == key.toLowerCase(), {
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
        login(msg, sc) {
            console.log("login")
            sc.ofb = true
            screenEvents.login.post({})
        },
        frameData(msg, sc) {
            let result: FrameData = msg.results
            let includedFrame = decompressData(new Uint8Array(msg.results.frameData)) 
            screenEvents.frameData.post(result)
            screenEvents.frame.post({
                x: 0,
                y: 0,
                top: 0,
                left: 0,
                bottom: result.Bounds.Bottom,
                right: result.Bounds.Right,
                image: includedFrame
            })
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


