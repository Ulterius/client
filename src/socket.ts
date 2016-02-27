import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"

export let socket: WebSocket

let connectInterval = undefined

export function sendCommand(sock: WebSocket, action, args?) {
    var packet: any = {
        endpoint: action,
        apiKey: config.key,
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
        sock.send(JSON.stringify(packet));
    } catch (exception) {
        console.log(exception);
    }
}
//jank ass curry
export function sendCommandToDefault(action, args?) {
    sendCommand(socket, action, args)
}

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
                catch (e) {
                    console.log("Failed to parse a message!")
                    dataObject = {
                        endpoint: "error",
                        results: {
                            message: "Failed to parse a message!",
                            exception: e
                        }
                    }
                }
                

                let message = (dataObject as ApiMessage)
                if (message.endpoint != "getcameraframe") {
                    console.log(message.endpoint)
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
