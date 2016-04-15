import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"
import {appStore} from "./store"
import CryptoJS = require("crypto-js")
import {toHex} from "./util"
import {appActions, messageActions} from "./action"

export let socket: WebSocket

let connectInterval = undefined

let overrideCounter = 0
function getSyncKey() {
    overrideCounter++
    return "override" + String(overrideCounter)
}

let callbacks: {[key: string]: Function} = {}

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
    try {
        socket.send(encrypt(packet))
    }
    catch (exception) {
        console.log(exception)
    }
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
    try {
        sock.send(encrypt(packet))
    } 
    catch (exception) {
        console.log(exception);
    }
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
                let dataObject = {}
                try {
                    dataObject = JSON.parse(e.data)
                }
                catch (err) {
                    let decrypted = CryptoJS.AES.decrypt(
                        e.data, 
                        CryptoJS.enc.Base64.parse(btoa(appStore.getState().crypto.key)), 
                        {
                            iv: CryptoJS.enc.Hex.parse(toHex(appStore.getState().crypto.iv))
                        }
                    )
                    try {
                        dataObject = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
                    }
                    catch (errr) {
                        console.log("Failed to parse a message!")
                        dataObject = {
                            endpoint: "error",
                            results: {
                                message: "Failed to parse a message!",
                                exception: errr
                            }
                        }
                    }
                }
                let message = (dataObject as ApiMessage)
                if (message.endpoint != "getcameraframe") {
                    //console.log(message.endpoint)
                }
                if ( !message.syncKey || (message.syncKey as string).indexOf("override") == -1 ) {
                    defaultHandleMessage(message)
                }
                else {
                    if (callbacks[message.syncKey] && typeof callbacks[message.syncKey] == "function") {
                        callbacks[message.syncKey](message.results)
                        callbacks[message.syncKey] = undefined
                    }
                }
            }
            else if (e.data instanceof ArrayBuffer) {
                console.log("ArrayBuffer get (for some reason): " + e.data)
            }
            else if (e.data instanceof Blob) {
                console.log("Blob get " + e.data)
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