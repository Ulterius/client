import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"
import {appStore} from "./store"
import CryptoJS = require("crypto-js")
import {toHex, workerAsync, byteArraysToBlobURL, downloadBlobURL} from "./util"
import {appActions, messageActions} from "./action"

let SocketWorker = require("worker?name=socket.worker.js!./socket-worker")
let socketWorker: Worker = new SocketWorker

//let connectInterval = undefined

//const logPackets = false

//let keyCounter = 0

/*
function getSyncKey(prepend: string) {
    keyCounter++
    return prepend + String(keyCounter)
}
*/

//let promiseChain: Promise<any>
//let resolves: {[key: string]: any}  = {}

//let callbacks: {[key: string]: Function} = {}

//let requestQueue = []

//let timeoutInterval;

export class Connection {
    keyCounter = 0
    requestQueue = []
    socket: WebSocket
    socketWorker: Worker
    reconnectInterval: number
    callbacks: {[key: string]: Function} = {}
    logPackets: boolean = false
    host: string
    port: string
    
    constructor(public isDefault: boolean) {
        this.socketWorker = new SocketWorker
    }
    
    connect(host: string, port: string) {
        this.host = host
        this.port = port
        this.socket = new WebSocket(`ws://${this.host}:${this.port}`)
        this.setSocketEvents()
        this.setWorkerEvents()
    }

    disconnect() {
        this.socket.close()
        appActions.setHost({ host: "", port: "" })
    }
    
    send(action, args?) {
        var packet: any = {
            endpoint: action.toLowerCase(),
            synckey: this.getSyncKey("normal")
        }
        if (typeof args !== "undefined") {
            if (args instanceof Array) {
                packet.args = args
            }
            else {
                packet.args = [args]
            }
        }
        this.promiseToSendPacket(packet)
    }
    
    sendAsync(action: string, ...rest) {
        let {callbacks} = this
        let key = this.getSyncKey("override")
        let packet: any = {
            endpoint: action,
            synckey: key
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
        if (typeof rest[rest.length - 1] === "function") {
            callbacks[key] = rest[rest.length - 1]
        }
        else {
            callbacks[key] = console.log.bind(console)
        }
        return this.promiseToSendPacket(packet)
    }
    
    promiseToSendPacket(packet) {
        let {logPackets, requestQueue} = this
        if (logPackets) {
            console.groupCollapsed("Queueing packet: " + packet.endpoint)
            console.log(packet)
        }
        requestQueue.push(packet)
        if (requestQueue.length == 1) {
            if (logPackets) {
                console.log("Queue empty, sending packet now")
                console.groupEnd()
            }
            this.sendPacket(packet)
        }
        if (logPackets)
            console.groupEnd()
    }
    
    sendPacket(packet) {
        let {logPackets, requestQueue, socketWorker} = this
        if (logPackets) {
            console.groupEnd()
            console.groupCollapsed("Sending packet: " + packet.endpoint)
            console.log(packet)
            console.log("Waiting messages: " + requestQueue.length)
            console.groupEnd()
        }

        socketWorker.postMessage({
            type: "serialize",
            content: {
                appState: appStore.getState(),
                data: packet
            }
        })
        
        setTimeout(() => {
            if (this.requestQueue.indexOf(packet) != -1) {
                if (logPackets) console.log("Packet " + packet.endpoint + " timed out, discarding manually.")
                if (this.requestQueue[this.requestQueue.indexOf(packet) + 1]) {
                    this.sendPacket(this.requestQueue[this.requestQueue.indexOf(packet) + 1])
                }
                _.pull(this.requestQueue, packet)
            }
        }, 5000)
    }
    
    setWorkerEvents() {
        let {socketWorker, socket} = this
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
    }
    
    setSocketEvents() {
        let {
            socket, 
            socketWorker, 
            host, 
            port, 
            isDefault, 
            requestQueue,
            reconnectInterval,
            logPackets,
            callbacks
        } = this
        
        socket.onopen = () => {
            console.log(`Socket (${host}:${port}${isDefault?", Default":""}) Status: ${socket.readyState} (open)`)
            if (reconnectInterval !== undefined && socket.readyState === 1) {
                clearInterval(reconnectInterval)
            }
            if (socket.readyState === 1 && isDefault) {
                appActions.setHost({host, port})
            }
        }
        socket.onmessage = (e) => {
            if (typeof e.data === "string") {
                workerAsync(socketWorker, "deserialize", {
                    appState: appStore.getState(),
                    data: e.data
                },
                (message: ApiMessage) => {
                    let {synckey, results, endpoint} = message
                    if (endpoint.toLowerCase() == "connectedtoulterius") {
                        this.requestQueue = []
                        //flush it all
                    }
                    let packet =_.find(this.requestQueue, (m: any) => m.synckey == synckey || 
                                        (endpoint && endpoint.toLowerCase() == "aeshandshake" && 
                                            m.endpoint.toLowerCase() == "aeshandshake"))
                    
                    if (endpoint != "getcameraframe") {
                        if (logPackets) {
                            console.groupCollapsed("Got packet: " + endpoint)
                            console.log(message)
                            if (packet) {
                                console.log("matching request found")
                                console.log("pending requests left: " + (this.requestQueue.length ? this.requestQueue.length - 1 : 0))
                                console.log(this.requestQueue)
                            }
                            console.groupEnd()
                        }
                    }
                    
                    if (packet) {
                        if (this.requestQueue[this.requestQueue.indexOf(packet)+1]) {
                            this.sendPacket(this.requestQueue[this.requestQueue.indexOf(packet)+1])
                        }
                        _.pull(this.requestQueue, packet)
                    }
                    

                    if (!synckey || (synckey as string).indexOf("override") == -1) {
                        defaultHandleMessage(message)
                    }
                    else {
                        if (callbacks[synckey] && 
                            typeof callbacks[synckey] == "function") {
                            callbacks[synckey](results)
                            callbacks[synckey] = undefined
                        }
                    }
                })
            }
            else if (e.data instanceof ArrayBuffer) {
                console.log("ArrayBuffer get (for some reason): " + e.data)
            }
            else if (e.data instanceof Blob) {
                console.log("Blob get " + e.data)
            }
            
            socket.onclose = (e) => {
                if (e.code !== 1000) {
                    socket.close()
                    console.log("Socket... died? Trying to reconnect in a sec...")
                    if (isDefault) apiLayer.disconnectedFromUlterius()
                    reconnectInterval = setInterval(() => {
                        console.log("Disconnected. Trying to reconnect now...")
                        this.connect(appStore.getState().connection.host, appStore.getState().connection.port)
                    }, 4000) as any as number
                }
            }
        }
    }
    
    getSyncKey(prepend: string) {
        this.keyCounter++
        return prepend + String(this.keyCounter)
    }
}

//keep this function in the module, since it relies heavily on the api import
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

let mainConnection = new Connection(true)
mainConnection.logPackets = true

//legacy module api for the main connection
export let connect = mainConnection.connect.bind(mainConnection)
export let sendCommandToDefault = mainConnection.send.bind(mainConnection)

export function sendCommand(sock: WebSocket, action: string, args?: any) {
    sendCommandToDefault(action, args)
}

export let sendCommandAsync = mainConnection.sendAsync.bind(mainConnection)
export let disconnect = mainConnection.disconnect.bind(mainConnection)