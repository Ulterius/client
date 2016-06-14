import {screenConnection as sC} from "../socket"
import {generateKey} from "../util/crypto"
import {base64toArray, arrayToBase64} from "../util"
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
    }
}

export function initialize() {
    sC.connect("localhost", "22009")
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
            console.log("Conncetedet to screen share")
            let {key, iv, encKey, encIV} = generateKey(msg.results.publicKey)
            sc.send({
                endpoint: "aesHandshake",
                args: [encKey, encIV]
            })
            sc.encrypt(key, iv)
        },
        aesHandshake(msg, sc) {
            if (msg.results.shook) {
                sc.send({
                    endpoint: "login",
                    args: ["ayy"]
                })
            }
        }
    })
    sC.listenBuffer(data => {
        //let compressedBuffer = base64toArray(data)
        //let imageBuffer = pako.inflate(compressedBuffer)
        //let base64Image = arrayToBase64(imageBuffer)
        screenEvents.frame(data)
    })
}
