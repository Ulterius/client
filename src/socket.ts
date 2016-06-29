import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"
import {appStore} from "./store"
import CryptoJS = require("crypto-js")
import {toHex, workerAsync, arrayBufferToBase64, workerListen, byteArraysToBlobURL, downloadBlobURL, elementAfter, wrapWorker as ww} from "./util"
import {WorkerPool} from "./util/worker"
import {appActions, messageActions} from "./action"


let SocketWorker = require("worker?name=socket.worker.js!./socket-worker")

/*
let pool = new WorkerPool(SocketWorker, 3)
pool.listen({
    test(message) {
        console.log(message)
    }
})
pool.post("test")
pool.post("test")
pool.post("test")
pool.post("test")
pool.post("test")
*/

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



interface Callback {
    (message: any, connection: Connection): any
}

interface Predicate {
    (message: any, connection: Connection): boolean
}

interface KeyPredicate {
    (key: string, message: any, connection: Connection): boolean
}

abstract class Connection {
    keyCounter = 0
    useQueue: boolean = true
    requestQueue = []
    socket: WebSocket
    socketPool: WorkerPool
    reconnectInterval = undefined
    callbacks: {[key: string]: Function} = {}
    listeners: {
        predicate: Predicate,
        callback: Callback,
        once?: boolean
    }[] = []
    bufferListeners: Callback[] = []
    keyedListeners: {
        predicate: KeyPredicate,
        callbacks: {
            [key: string]: Callback
        }
    }[] = []
    fallbackListeners: Callback[] = []
    logPackets: boolean = false
    host: string
    port: string
    connected: boolean
    encrypted: boolean
    ofb: boolean = false
    key: string = undefined
    iv: string = undefined
    
    constructor(public poolSize = 3, public isDefault: boolean = false) {

    }
    
    abstract onMessage(message?: any)
    
    connect(host: string, port: string) {
        this.host = host
        this.port = port
        this.ofb = false
        this.unencrypt()
        if (this.socket) {
            this.socket.close()
        }

        this.socketPool = new WorkerPool(SocketWorker, this.poolSize)
        this.setWorkerEvents()
        this.socket = undefined
        try {
            this.socket = new WebSocket(`ws://${this.host}:${this.port}`)
            this.socket.binaryType = "arraybuffer"
            console.log(this.socket)
            if (this.socket) {
                this.setSocketEvents()
                this.connected = true
                this.onConnect()
            }
        }
        catch (e) {
            console.log("Failed to connect.")
        }
        
    }

    onConnect() {}

    disconnect() {
        if (this.socket) {
            this.socket.close(1000)
        }
        this.socketPool.terminate()
        this.connected = false
        if (this.isDefault)
            appActions.setHost({ host: "", port: "" })
    }
    
    promiseToSendPacket(packet, packetName: string = "unnamed") {
        let {logPackets, useQueue, requestQueue} = this
        if (logPackets) {
            console.groupCollapsed("Queueing packet: " + packetName)
            console.log(packet)
        }
        if (useQueue) {
            requestQueue.push(packet)
            if (requestQueue.length == 1) {
                if (logPackets) {
                    console.log("Queue empty, sending packet now")
                    console.groupEnd()
                }
                this.sendPacket(packet, packetName)
            }
        }
        else {
            if (logPackets)
                console.log("Queue disabled, Sending Packet: " + packetName)
            this.sendPacket(packet, packetName)
        }
        if (logPackets)
            console.groupEnd()
    }
    
    sendPacket(packet, packetName: string = "unnamed") {
        if (!this.connected) {
            return;
        }
        let {logPackets, requestQueue, socketPool} = this
        if (logPackets) {
            console.groupEnd()
            console.groupCollapsed("Sending packet: " + packetName)
            console.log(packet)
            console.log("Waiting messages: " + requestQueue.length)
            console.groupEnd()
        }
        socketPool.post("serialize", {
            encrypted: this.encrypted,
            key: this.key,
            iv: this.iv,
            data: packet
        })
        /*
        socketPool.postMessage({
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
        this.socketPool.listen({
            deserialize: (message) => {
                if (typeof message === "string") {
                    this.onArrayBuffer(message)
                }
                else {
                    this.onDeserialize(message)
                }
            },
            serialize: (message) => {
                try {
                    this.socket.send(message)
                }
                catch (e) {
                    console.log(e)
                }
            },
            decryptBuffer: (message) => {
                this.onArrayBuffer(message)
            }
        })
    }
    
    onString() {}
    //base64 string, by the way
    onArrayBuffer(data: string) {
        this.requestQueue = []
        this.bufferListeners.forEach(listener => {
            listener(data, this)
        })
    }
    
    private onDeserialize(message: any) {
        this.onMessage(message)
        let caught = false
        for (let listener of this.listeners) {
            if (listener.predicate(message, this)) {
                listener.callback(message, this)
                caught = true
                if (listener.once) {
                    _.pull(this.listeners, listener)
                }
            }
        }
        for (let listener of this.keyedListeners) {
            _.forOwn(listener.callbacks, (callback, k) => {
                if (listener.predicate(k, message, this)) {
                    caught = true
                    callback(message, this)
                }
            })
        }
        if (!caught) {
            for (let listener of this.fallbackListeners) {
                listener(message, this)
            }
        }
    }
    
    setSocketEvents() {
        let {
            socket, 
            socketPool, 
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
                    this.socketPool.terminate()
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
                const {key, iv, ofb} = this
                if (typeof e.data === "string") {
                    this.onString()
                    this.socketPool.post("deserialize", {
                        key: this.key,
                        iv: this.iv,
                        data: e.data
                    })
                }
                else if (e.data instanceof ArrayBuffer) {
                    this.socketPool.post("deserialize", {
                        key,
                        iv,
                        ofb,
                        data: e.data
                    }, [e.data])
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
                this.connected = false
                this.socketPool.terminate()
            }
        }
        catch (e) {
            console.log(e)
        }
    }
    
    listen(predicate: Predicate, callback: Callback) {
        this.listeners.push({
            predicate,
            callback,
            once: false
        })
    }
    
    listenAll<T extends Connection>(...listeners: [
        (message: any, connection: T) => boolean, 
        (message: any, connection: T) => any
    ][]) {
        for (let listener of listeners) {
            this.listeners.push({
                predicate: listener[0],
                callback: listener[1],
                once: false
            })
        }
    }
    listenKeys<T extends Connection>(
        predicate: (key: string, message: any, connection: T) => boolean, 
        callbacks: {[key: string]: (message: any, connection: T) => any}
    ) {
        this.keyedListeners.push({
            predicate,
            callbacks
        })
    }
    listenBuffer(callback: Callback) {
        this.bufferListeners.push(callback)
    }
    listenOnce(predicate: Predicate, callback: Callback) {
        this.listeners.push({
            predicate,
            callback,
            once: true
        })
    }
    fallbackListen(callback: Callback) {
        this.fallbackListeners.push(callback)
    }

    //override this for queue usage
    doesMessageMatch(message, queueMessage) {
        return true
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

    doesMessageMatch(message, queueMessage) {
        return (message.synckey == queueMessage.synckey)
    }
    
    onMessage(message: ApiMessage) {
        let {
            socket, 
            socketPool, 
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

class ScreenShareConnection extends Connection {
    loggedIn: boolean = false
    send(packet: any) {
        this.promiseToSendPacket(packet, "ScreenShare")
    }
    sendMessage(action: string, args?) {
        var packet: any = {
            endpoint: action.toLowerCase(),
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
    sendEvent(EventType: string, Action: string, additional: any = {}) {
        if (!this.loggedIn)
            return;

        let packet = {
            EventType,
            Action
        }
        _.assign(packet, additional)
        this.promiseToSendPacket(packet, packet.Action)
    }
    onConnect() {
        this.loggedIn = false
    }
    onMessage(message: any) {
        this.requestQueue = []
        if (message.endpoint == "login")
            console.log(message)
        if (message.endpoint == "login" && message.results.loggedIn) {
            this.loggedIn = true
        }
    }
}

export let terminalConnection = new TerminalConnection(1, false)
terminalConnection.logPackets = false

export let screenConnection = new ScreenShareConnection(3, false)
screenConnection.logPackets = false
screenConnection.useQueue = false

export let mainConnection = new UlteriusConnection(2, true)
mainConnection.logPackets = false

window.onbeforeunload = () => {
    terminalConnection.disconnect()
    screenConnection.disconnect()
    mainConnection.disconnect()
}

//let terminalConnection = new Connection()

//legacy module api for the main connection
export let connect = mainConnection.connect.bind(mainConnection)
export let sendCommandToDefault = mainConnection.send.bind(mainConnection)

export function sendCommand(sock: WebSocket, action: string, args?: any) {
    sendCommandToDefault(action, args)
}

export let sendCommandAsync = mainConnection.sendAsync.bind(mainConnection)
export let disconnect = mainConnection.disconnect.bind(mainConnection)