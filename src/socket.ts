import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"

let socket = new WebSocket(config.server)

export function sendCommand(sock: WebSocket, action, args?) {
    var packet: any = {
        action: action,
        apiKey: config.key
    }
    if (args) packet.args = args
    try {
        sock.send(JSON.stringify(packet));
    } catch (exception) {
        console.log(exception);
    }
}

export function connect() {
    try {
        console.log('Socket Status: ' + socket.readyState)

        socket.onopen = function() {
            console.log('Socket Status: ' + socket.readyState + ' (open)')
            sendCommand(socket, "requestprocessinformation")

            setInterval(
                (() => sendCommand(socket, "requestprocessinformation")),
                5000
            )

        }

        socket.onmessage = function(e) {
            if (typeof e.data === "string") {
                let dataObject = JSON.parse(e.data)
                console.log(dataObject)

                let _dataObject = _(dataObject)
                let message = (dataObject as ApiMessage)

                apiLayer[message.endpoint](message.results)
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
