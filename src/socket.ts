import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"
import {appStore} from "./store"
import CryptoJS = require("crypto-js")
import {toHex, workerAsync, workerListen, byteArraysToBlobURL, downloadBlobURL, elementAfter, wrapWorker as ww} from "./util"
import {appActions, messageActions} from "./action"

let SocketWorker = require("worker?name=socket.worker.js!./socket-worker")

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

abstract class Connection {
    keyCounter = 0
    requestQueue = []
    socket: WebSocket
    socketWorker: Worker
    reconnectInterval = undefined
    callbacks: {[key: string]: Function} = {}
    listeners: {
        predicate: (message: any) => boolean,
        callback: (message: any) => any,
        once?: boolean
    }[] = []
    keyedListeners: {
        predicate: (key: string, message: any) => boolean,
        callbacks: {
            [key: string]: Function
        }
    }[] = []
    fallbackListeners: Function[] = []
    logPackets: boolean = false
    host: string
    port: string
    encrypted: boolean
    key: string = undefined
    iv: string = undefined
    
    constructor(public isDefault: boolean = false) {}
    
    abstract onMessage(message?: any)
    
    connect(host: string, port: string) {
        this.host = host
        this.port = port
        if (this.socket) {
            this.socket.close()
        }
        this.socket = undefined
        try {
            this.socket = new WebSocket(`ws://${this.host}:${this.port}`)
            console.log(this.socket)
            if (this.socket) {
                this.socketWorker = new SocketWorker
                this.setSocketEvents()
                this.setWorkerEvents()
            }
        }
        catch (e) {
            console.log("Failed to connect.")
        }
        
    }

    disconnect() {
        this.socket.close()
        if (this.isDefault)
            appActions.setHost({ host: "", port: "" })
    }
    
    promiseToSendPacket(packet, packetName: string = "unnamed") {
        let {logPackets, requestQueue} = this
        if (logPackets) {
            console.groupCollapsed("Queueing packet: " + packetName)
            console.log(packet)
        }
        requestQueue.push(packet)
        if (requestQueue.length == 1) {
            if (logPackets) {
                console.log("Queue empty, sending packet now")
                console.groupEnd()
            }
            this.sendPacket(packet, packetName)
        }
        if (logPackets)
            console.groupEnd()
    }
    
    sendPacket(packet, packetName: string = "unnamed") {
        let {logPackets, requestQueue, socketWorker} = this
        if (logPackets) {
            console.groupEnd()
            console.groupCollapsed("Sending packet: " + packetName)
            console.log(packet)
            console.log("Waiting messages: " + requestQueue.length)
            console.groupEnd()
        }
        ww(socketWorker).post("serialize", {
            encrypted: this.encrypted,
            key: this.key,
            iv: this.iv,
            data: packet
        })
        /*
        socketWorker.postMessage({
            type: "serialize",
            content: {
                encrypted: this.encrypted,
                key: this.key,
                iv: this.iv,
                data: packet
            }
        })
        */
        
        setTimeout(() => {
            if (this.requestQueue.indexOf(packet) != -1) {
                if (logPackets) console.log("Packet " + packet.endpoint + " timed out, discarding manually.")
                if (elementAfter(this.requestQueue, packet)) {
                    this.sendPacket(elementAfter(this.requestQueue, packet))
                }
                /*
                if (this.requestQueue[this.requestQueue.indexOf(packet) + 1]) {
                    this.sendPacket(this.requestQueue[this.requestQueue.indexOf(packet) + 1])
                }
                */
                _.pull(this.requestQueue, packet)
            }
        }, 5000)
    }
    
    encrypt(key: string, iv: string) {
        this.key = key
        this.iv = iv
        this.encrypted = true
    }
    
    unencrypt() {
        this.encrypted = false
        this.key = undefined
        this.iv = undefined
    }
    
    setWorkerEvents() {
        ww(this.socketWorker).listen({
            deserialize: (message) => {
                this.onDeserialize(message)
            },
            serialize: (message) => {
                try {
                    this.socket.send(message)
                }
                catch (e) {
                    console.log(e)
                }
            }
        })
    }
    
    onString() {
        
    }
    
    private onDeserialize(message: any) {
        this.onMessage(message)
        let caught = false
        for (let listener of this.listeners) {
            if (listener.predicate(message)) {
                listener.callback(message)
                caught = true
                if (listener.once) {
                    _.pull(this.listeners, listener)
                }
            }
        }
        for (let listener of this.keyedListeners) {
            _.forOwn(listener.callbacks, (callback, k) => {
                if (listener.predicate(k, message)) {
                    caught = true
                    callback(message)
                }
            })
        }
        if (!caught) {
            for (let listener of this.fallbackListeners) {
                listener(message)
            }
        }
    }
    
    setSocketEvents() {
        let {
            socket, 
            socketWorker, 
            host, 
            port, 
            isDefault, 
            logPackets,
            callbacks
        } = this
        try {
            if (this.reconnectInterval === undefined) {
                socket.onerror = (e) => {
                    this.socket.close(1000)
                    this.socketWorker.terminate()
                    if (this.isDefault && appStore.getState().connection.host) {
                        this.reconnectInterval = setInterval(() => {
                            console.log("Not connected... trying to reconnect.")
                            this.connect(host, port)
                        }, 4000)
                    }
                    else {
                        messageActions.message({ style: "danger", text: "Failed to connect. Host invalid." })
                    }
                }
            }
            socket.onopen = () => {
                console.log(`Socket (${host}:${port}${isDefault ? ", Default" : ""}) Status: ${socket.readyState} (open)`)
                if (this.reconnectInterval !== undefined && socket.readyState === 1) {
                    clearInterval(this.reconnectInterval)
                    this.reconnectInterval = undefined
                }
                if (socket.readyState === 1 && isDefault) {
                    appActions.setHost({host, port})
                }
            }
            
            socket.onmessage = (e) => {
                if (typeof e.data === "string") {
                    this.onString()
                    ww(this.socketWorker).post("deserialize", {
                        key: this.key,
                        iv: this.iv,
                        data: e.data
                    })
                }
                else if (e.data instanceof ArrayBuffer) {
                    console.log("ArrayBuffer get (for some reason): " + e.data)
                }
                else if (e.data instanceof Blob) {
                    console.log("Blob get " + e.data)
                }
            }
            
            socket.onclose = (e) => {
                console.log(e.code)
                if (e.code !== 1000 && this.reconnectInterval === undefined) {
                    console.log("Socket... died? Trying to reconnect in a sec...")
                    if (isDefault) apiLayer.disconnectedFromUlterius()
                    this.reconnectInterval = setInterval(() => {
                        console.log("Disconnected. Trying to reconnect now...")
                        this.connect(this.host, this.port)
                    }, 4000)
                }
                this.socketWorker.terminate()
            }
        }
        catch (e) {
            console.log(e)
        }
    }
    
    listen(predicate: (message: any) => boolean, callback: (message: any) => any) {
        this.listeners.push({
            predicate,
            callback,
            once: false
        })
    }
    
    listenAll(...listeners: [(message: any) => boolean, (message: any) => any][]) {
        for (let listener of listeners) {
            this.listeners.push({
                predicate: listener[0],
                callback: listener[1],
                once: false
            })
        }
    }
    
    listenKeys(predicate: (key: string, message: any) => boolean, callbacks: {[key: string]: Function}) {
        this.keyedListeners.push({
            predicate,
            callbacks
        })
    }
    
    listenOnce(predicate: (any) => boolean, callback: (message: any) => any) {
        this.listeners.push({
            predicate,
            callback,
            once: true
        })
    }
    
    fallbackListen(callback: Function) {
        this.fallbackListeners.push(callback)
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


class UlteriusConnection extends Connection {
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
        this.promiseToSendPacket(packet, packet.endpoint)
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
        return this.promiseToSendPacket(packet, packet.endpoint)
    }
    
    onMessage(message: ApiMessage) {
        let {
            socket, 
            socketWorker, 
            host, 
            port, 
            isDefault, 
            logPackets,
            callbacks
        } = this

        let {synckey, results, endpoint} = message
        if (endpoint.toLowerCase() == "connectedtoulterius") {
            this.requestQueue = []
            //flush it all
        }
        let packet = _.find(this.requestQueue, (m: any) => m.synckey == synckey ||
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
            if (elementAfter(this.requestQueue, packet)) {
                this.sendPacket(elementAfter(this.requestQueue, packet))
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
                delete callbacks[synckey]
            }
        }
    }
    getSyncKey(prepend: string) {
        this.keyCounter++
        return prepend + String(this.keyCounter)
    }
}

class TerminalConnection extends Connection {
    correlationId: number = 1
    send(type: string, restOfPacket: any) {
        //this.socket.send(JSON.stringify(packet))
        let packet = _.assign({}, {type}, restOfPacket)
        this.promiseToSendPacket(packet, "Terminal")
    }
    sendAsync(type: string, restOfPacket: any, callback: (message: any) => any) {
        let correlationId = this.nextCorrelationId()
        this.send(type, _.assign({}, restOfPacket, {correlationId}))
        this.listenOnce(
            msg => (msg.correlationId && msg.correlationId == correlationId), 
            callback
        )
    }
    onMessage(message: any) {
        this.requestQueue = []
        console.log("Terminal message got.")
    }
    nextCorrelationId() {
        return this.correlationId++
    }
}

export let terminalConnection = new TerminalConnection(false)
terminalConnection.logPackets = true

export let mainConnection = new UlteriusConnection(true)
mainConnection.logPackets = false

//let terminalConnection = new Connection()

//legacy module api for the main connection
export let connect = mainConnection.connect.bind(mainConnection)
export let sendCommandToDefault = mainConnection.send.bind(mainConnection)

export function sendCommand(sock: WebSocket, action: string, args?: any) {
    sendCommandToDefault(action, args)
}

export let sendCommandAsync = mainConnection.sendAsync.bind(mainConnection)
export let disconnect = mainConnection.disconnect.bind(mainConnection)