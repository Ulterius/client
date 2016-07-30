import {screenConnection as sC} from "../socket"
import {generateKey, decompressData} from "../util/crypto"
import {base64toArray, arrayToBase64, addImageHeader} from "../util"
import {screenEvents} from "../component/screen"
import pako = require("pako")

let debug: any = {}
window["debug"].screen = debug

export function eventPacket(type: string, action: string) {
    return {
        EventType: type,
        Action: action
    }
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
            /*
            if (msg.results.shook) {
                sc.send({
                    endpoint: "login",
                    args: ["ayy"]
                })
            }
            */
        },
        login(msg, sc) {
            sc.ofb = true
            screenEvents.login()
        },
        frameData(msg, sc) {
            let result: FrameData = msg.results
            let includedFrame = decompressData(new Uint8Array(msg.results.frameData)) 
            screenEvents.frameData(result)
            screenEvents.frame({
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
        screenEvents.frame(msg)
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
