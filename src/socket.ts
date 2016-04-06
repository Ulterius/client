import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"
import {appStore} from "./store"
import CryptoJS = require("crypto-js")
import {toHex} from "./util"

export let socket: WebSocket

let connectInterval = undefined

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
        let appState = appStore.getState()
        if (appState.crypto && appState.crypto.key && appState.crypto.iv) {
            let utf8Key = CryptoJS.enc.Utf8.parse(appState.crypto.key)
            let utf8Iv = CryptoJS.enc.Utf8.parse(appState.crypto.iv)
            let packetString = CryptoJS.AES.encrypt(
                CryptoJS.enc.Utf8.parse(JSON.stringify(packet)),
                utf8Key, 
                {
                    keySize: 128 / 8,
                    iv: utf8Iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            ).toString()
            sock.send(packetString)
            
        }
        else {
            sock.send(JSON.stringify(packet))
        }
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

export function connect() {
    
    try {
        socket = new WebSocket(config.server)
        console.log('Socket Status: ' + socket.readyState)
        if (connectInterval === undefined)
        socket.onerror = function() {
            connectInterval = setInterval(() => {
                console.log("Not connected... trying to reconnect.")
                connect()
            }, 4000)
        }
        socket.onopen = function() {
            console.log('Socket Status: ' + socket.readyState + ' (open)')
            if (connectInterval !== undefined && socket.readyState === 1) {
                clearInterval(connectInterval)
            }
            //sendCommandToDefault("authenticate", config.auth.password)
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
                let caught = false
                for (let endpoint of Object.keys(apiLayer)) {
                    if (message.endpoint && 
                        message.endpoint.toLowerCase() == endpoint.toLowerCase() &&
                        typeof apiLayer[endpoint] == "function") {

                        apiLayer[endpoint](message.results)
                        caught = true
                    }
                }
                if (!caught) {
                    console.log("Uncaught message: " + message.endpoint)
                    console.log(dataObject)
                }

                /*
                if (apiLayer[message.endpoint] && typeof apiLayer[message.endpoint] == "function") {
                    apiLayer[message.endpoint](message.results)
                }

                else {
                    console.log("Uncaught message! " + message.endpoint)
                }
                */

            }
            else if (e.data instanceof ArrayBuffer) {
                console.log("ArrayBuffer get (for some reason): " + e.data)
            }
            else if (e.data instanceof Blob) {
                console.log("Blob get " + e.data)
            }
            
            socket.onclose = function() {
                console.log("Socket... died? Trying to reconnect in a sec...")
                apiLayer.disconnectedFromUlterius()
                connectInterval = setInterval(() => {
                    console.log("Disconnected. Trying to reconnect now...")
                    connect()
                }, 4000)
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
