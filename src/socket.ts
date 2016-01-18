import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"

export let socket = new WebSocket(config.server)

export function sendCommand(sock: WebSocket, action, args?) {
    var packet: any = {
        endpoint: action,
        apiKey: config.key,
        syncKey: "anus"
    }
    if (args) {
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
        console.log('Socket Status: ' + socket.readyState)

        socket.onmessage = function(e) {
            if (typeof e.data === "string") {
                let dataObject = JSON.parse(e.data)

                console.log(dataObject)

                let message = (dataObject as ApiMessage)

                let caught = false
                for (let endpoint of Object.keys(apiLayer)) {
                    if (message.endpoint.toLowerCase() == endpoint.toLowerCase() &&
                        typeof apiLayer[endpoint] == "function") {

                        apiLayer[endpoint](message.results)
                        caught = true
                    }
                }
                if (!caught) {
                    console.log("Uncaught message! " + message.endpoint)
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
                console.log("Blob get (for some reason): " + e.data)
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
