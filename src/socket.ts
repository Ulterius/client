import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"
import {appStore} from "./store"
import CryptoJS = require("crypto-js")
import {toHex, workerAsync, byteArraysToBlobURL, downloadBlobURL} from "./util"
import {appActions, messageActions} from "./action"

let SocketWorker = require("worker?name=socket.worker.js!./socket-worker")
let socketWorker: Worker = new SocketWorker

export let socket: WebSocket

let connectInterval = undefined

let overrideCounter = 0
function getSyncKey() {
    overrideCounter++
    return "override" + String(overrideCounter)
}

let callbacks: {[key: string]: Function} = {}

export function sendCommandAsync(action: string, ...rest) {
    let key = getSyncKey()
    let packet: any = {
        endpoint: action,
        syncKey: key
    }
    let args = []
    let callback = undefined
    for (let arg of rest) {
        if (typeof arg !== "function") {
            args.push(arg)
        }
    }
    args = _.flattenDeep(args)
    if (args.length > 0) {
        packet.args = args
    }
    if (typeof rest[rest.length-1] === "function") {
        callbacks[key] = rest[rest.length-1]
    }
    else {
        callbacks[key] = console.log.bind(console)
    }
    socketWorker.postMessage({
        type: "serialize",
        content: {
            appState: appStore.getState(),
            data: packet
        }
    })
}

export function sendCommand(sock: WebSocket, action, args?) {
    var packet: any = {
        endpoint: action,
        syncKey: "anus"
    }
    if (typeof args !== "undefined") {
        if (args instanceof Array) {
            packet.args = args
        }
        else {
            packet.args = [args]
        }
    }
    socketWorker.postMessage({
        type: "serialize",
        content: {
            appState: appStore.getState(),
            data: packet
        }
    })
}
//jank ass curry
export function sendCommandToDefault(action, args?) {
    sendCommand(socket, action, args)
}

(window as any).sendCommandToDefault = sendCommandToDefault

export function connect(host: string, port: string) {
    
    try {
        socket = new WebSocket(`ws://${host}:${port}`)
        //socket = new WebSocket(config.server)
        console.log('Socket Status: ' + socket.readyState)
        if (connectInterval === undefined)
        socket.onerror = function(e) {
            if (appStore.getState().connection.host) {
                connectInterval = setInterval(() => {
                    console.log("Not connected... trying to reconnect.")
                    connect(host, port)
                }, 4000)
            }
            else {
                messageActions.message({style: "danger", text: "Failed to connect. Host invalid."})
            }
        }
        socket.onopen = function() {
            console.log('Socket Status: ' + socket.readyState + ' (open)')
            if (connectInterval !== undefined && socket.readyState === 1) {
                
                clearInterval(connectInterval)
            }
            if (socket.readyState === 1) {
                appActions.setHost({host, port})
            }
        }
        
        socket.onmessage = function(e) {
            if (typeof e.data === "string") {
                workerAsync(
                    socketWorker,
                    "deserialize",
                    {appState: appStore.getState(), data: e.data},
                    (message: ApiMessage) => {
                        if (message.endpoint != "getcameraframe") {
                            console.log(message.endpoint)
                        }
                        if (!message.syncKey || (message.syncKey as string).indexOf("override") == -1) {
                            defaultHandleMessage(message)
                        }
                        else {
                            if (callbacks[message.syncKey] && typeof callbacks[message.syncKey] == "function") {
                                callbacks[message.syncKey](message.results)
                                callbacks[message.syncKey] = undefined
                            }
                        }
                    }
                )
                /*
                socketWorker.postMessage({
                    type: "deserialize",
                    content: {
                        appState: appStore.getState(),
                        data: e.data
                    }
                })
                */
            }
            else if (e.data instanceof ArrayBuffer) {
                console.log("ArrayBuffer get (for some reason): " + e.data)
            }
            else if (e.data instanceof Blob) {
                console.log("Blob get " + e.data)
                let reader = new FileReader()
                reader.readAsDataURL(e.data)
                reader.onloadend = () => {
                    workerAsync(socketWorker, "decrypt", {
                        appState: appStore.getState(),
                        data: reader.result
                    }, (data: Uint8Array) => {
                        //console.log(data)
                        downloadBlobURL(byteArraysToBlobURL([data]))
                    })
                    //console.log(reader.result)
                }
            }
            
            socket.onclose = function(e) {
                if (e.code !== 1000) {
                    console.log("Socket... died? Trying to reconnect in a sec...")
                    apiLayer.disconnectedFromUlterius()
                    connectInterval = setInterval(() => {
                        console.log("Disconnected. Trying to reconnect now...")
                        connect(appStore.getState().connection.host, appStore.getState().connection.port)
                    }, 4000)
                }
            }
        }

    }
    catch (err) {
        console.log(err)
    }
    finally {
        return socket
    }
}

function encrypt(packet) {
    let appState = appStore.getState()
    let packetString = ""
    if (appState.crypto && appState.crypto.key && appState.crypto.iv) {
        let utf8Key = CryptoJS.enc.Utf8.parse(appState.crypto.key)
        let utf8Iv = CryptoJS.enc.Utf8.parse(appState.crypto.iv)
        packetString = CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(JSON.stringify(packet)),
            utf8Key, 
            {
                keySize: 128 / 8,
                iv: utf8Iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        ).toString()
    }
    else {
        packetString = JSON.stringify(packet)
    }
    return packetString
}

function decrypt(data: string) {
    let ret
    try {
        ret = JSON.parse(data)
    }
    catch (err) {
        let decrypted = CryptoJS.AES.decrypt(
            data,
            CryptoJS.enc.Base64.parse(btoa(appStore.getState().crypto.key)),
            {
                iv: CryptoJS.enc.Hex.parse(toHex(appStore.getState().crypto.iv))
            }
        )
        try {
            ret = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
        }
        catch (errr) {
            console.log("Failed to parse a message!")
            ret = {
                endpoint: "error",
                results: {
                    message: "Failed to parse a message!",
                    exception: errr
                }
            }
        }
    }
    return ret
}

function defaultHandleMessage(message: ApiMessage) {
    let caught = false
    for (let endpoint of Object.keys(apiLayer)) {
        if (message.endpoint &&
            message.endpoint.toLowerCase() == endpoint.toLowerCase() &&
            typeof apiLayer[endpoint] == "function") {

            apiLayer[endpoint](message.results)
            caught = true
        }
    }
    if (message.endpoint && apiLayer.listeners[message.endpoint.toLowerCase()]) {
        for (let fn of apiLayer.listeners[message.endpoint.toLowerCase()]) {
            fn(message.results)
        }
    }
    if (!caught) {
        console.log("Uncaught message: " + message.endpoint)
        console.log(message)
    }
}

export function disconnect() {
    socket.close()
    appActions.setHost({host: "", port: ""})
}

socketWorker.addEventListener("message", ({data}) => {
    let wmessage = data as WorkerMessage<any>
    
    if (wmessage.type == "deserialize") {
        /*
        //let dataObject = decrypt(e.data)
        let dataObject = wmessage.content

        let message = (dataObject as ApiMessage)
        if (message.endpoint != "getcameraframe") {
            console.log(message.endpoint)
        }
        if (!message.syncKey || (message.syncKey as string).indexOf("override") == -1) {
            defaultHandleMessage(message)
        }
        else {
            if (callbacks[message.syncKey] && typeof callbacks[message.syncKey] == "function") {
                callbacks[message.syncKey](message.results)
                callbacks[message.syncKey] = undefined
            }
        }
        */
    }
    else if (wmessage.type == "serialize") {
        try {
            socket.send(wmessage.content)
        }
        catch (e) {
            console.log(e)
        }
    }
})