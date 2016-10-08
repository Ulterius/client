import config from "./config"
import * as _ from "lodash"

import * as apiLayer from "./api-layer"
import {appStore} from "./store"
import CryptoJS = require("crypto-js")
import {
    toHex, 
    workerAsync, 
    arrayBufferToBase64, 
    workerListen, 
    byteArraysToBlobURL, 
    downloadBlobURL, 
    elementAfter, 
    wrapWorker as ww, 
    SocketType,
    isCameraFrame
} from "./util"
import {encrypt, decrypt} from "./util/crypto"
import {WorkerPool} from "./util/worker"
import {appActions, messageActions} from "./action"
import {loginEvents, disconnectEvents} from "./component"


let SocketWorker = require("worker?name=socket.worker.js!./socket-worker")

interface Callback {
    (message: any, connection: Connection): any
}

interface Predicate {
    (message: any, connection: Connection): boolean
}

interface KeyPredicate {
    (key: string, message: any, connection: Connection): boolean
}

export abstract class Connection {
    keyCounter = 0
    useQueue: boolean = true
    requestQueue = []
    socket: WebSocket
    socketPool: WorkerPool
    reconnect: boolean = true
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
    socketType: SocketType
    disconnecting: boolean = false
    connectResolve: (value?: WebSocket | Thenable<WebSocket>) => void
    path: string = ""
    
    constructor(public poolSize = 3, public isDefault: boolean = false) {

    }

    useWorker() {
        return this.poolSize !== 0
    }
    
    abstract onMessage(message?: any)
    
    connect(host: string, port: string, keepEncryption: boolean = false) {
        this.host = host
        this.port = port
        this.ofb = false
        if (!keepEncryption) {
            this.unencrypt()
        }
        if (this.socket) {
            this.socket.close()
        }
        this.socket = undefined

        if (this.useWorker) {
            this.socketPool = new WorkerPool(SocketWorker, this.poolSize)
            this.setWorkerEvents()
        }

        let connectReject
        let connectPromise = new Promise<WebSocket>((resolve, reject) => {
            connectReject = reject
            this.connectResolve = resolve
        })

        try {
            this.socket = new WebSocket(`ws://${this.host}:${this.port}/${this.path}`)
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
            connectReject("Failed to connect.")
        }
        return connectPromise
        
    }

    onConnect() {}

    disconnect = () => {
        if (!this.connected) {
            return;
        }
        this.disconnecting = true
        if (this.socket) {
            this.socket.onclose = () => {}
            this.socket.close(1000)
            this.socket = undefined
        }
        if (this.useWorker() && this.socketPool) {
            this.socketPool.terminate()
        }
        this.connected = false
        if (this.isDefault)
            appActions.setHost({ host: "", port: "" })
    }

    abstract send(action: string, ...rest: any[])
    
    promiseToSendPacket(packet, packetName: string = "unnamed") {
        let {logPackets, useQueue, requestQueue} = this
        /*
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
        */
        this.sendPacket(packet, packetName)
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
            console.groupEnd()
        }
        this.serialize(packet)
        /*
        socketPool.post("serialize", {
            encrypted: this.encrypted,
            key: this.key,
            iv: this.iv,
            data: packet
        })
        */
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
                listener.callback(this.messageFilter(message), this)
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
                    callback(this.messageFilter(message), this)
                }
            })
        }
        if (!caught) {
            for (let listener of this.fallbackListeners) {
                listener(this.messageFilter(message), this)
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
                    if (this.useWorker) this.socketPool.terminate()
                    if (this.isDefault && appStore.getState().connection.host) {
                        this.reconnectInterval = setInterval(() => {
                            console.log("Not connected... trying to reconnect.")
                            this.connect(host, port)
                        }, 4000)
                    }
                    else {
                        loginEvents.fail("Failed to connect, host invalid.")
                        messageActions.message({ style: "danger", text: "Failed to connect. Host invalid." })
                    }
                }
            }
            socket.onopen = () => {
                console.log(`Socket (${host}:${port}${isDefault ? ", Default" : ""}) Status: ${socket.readyState} (open)`)
                if (this.reconnectInterval !== undefined && socket.readyState === 1) {
                    clearInterval(this.reconnectInterval)
                    disconnectEvents.reconnect()
                    this.reconnectInterval = undefined
                }
                if (socket.readyState === 1 && isDefault) {
                    appActions.setHost({host, port})
                }
                this.connectResolve(socket)
            }
            socket.onmessage = (e) => {
                const {key, iv, ofb} = this
                if (typeof e.data === "string" || e.data instanceof ArrayBuffer) {
                    this.deserialize(e.data)
                }
                else if (e.data instanceof Blob) {
                    console.log("Blob get " + e.data)
                }
            }
            socket.onclose = (e) => {
                console.log(e.code)
                if (
                    !this.disconnecting && 
                    e.code !== 1000 && 
                    this.reconnect &&
                    this.reconnectInterval === undefined && 
                    appStore.getState().connection.host
                ) {
                    console.log("Socket... died? Trying to reconnect in a sec...")
                    if (isDefault) { 
                        apiLayer.disconnectedFromUlterius()
                        disconnectEvents.disconnect() 
                    }
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
    deserialize(data: string | ArrayBuffer) {
        const {key, iv, ofb, socketType} = this
        if (this.useWorker()) {
            if (data instanceof ArrayBuffer) {
                this.socketPool.post("deserialize", {
                    key, iv, ofb, data: data, type: socketType
                }, [data])
            }
            else if (typeof data === "string") {
                this.socketPool.post("deserialize", {
                    key, iv, ofb, data: data, type: socketType
                })
            }
        }
        else {
            let dataAny = data as any
            let ret
            if (!(key && iv)) {
                ret = JSON.parse(dataAny)
            }
            try {
                ret = JSON.parse(dataAny)
            }
            catch (err) {
                ret = decrypt(key, iv, dataAny, socketType, ofb)
            }
            if (typeof ret === "string") {
                this.onArrayBuffer(ret)
            }
            else {
                this.onDeserialize(ret)
            }
        }
    }
    serialize(packet: any) {
        const {encrypted, key, iv} = this
        if (this.useWorker()) {
            this.socketPool.post("serialize", {
                encrypted: encrypted,
                key: this.key,
                iv: this.iv,
                data: packet
            })
        }
        else {
            let encryptedPacket
            if (encrypted && key && iv) {
                encryptedPacket =  encrypt(key, iv, packet)
            }
            else {
                encryptedPacket = JSON.stringify(packet)
            }
            try {
                this.socket.send(encryptedPacket)
            }
            catch (e) {
                console.log(e)
            }
        }
        
    }
    messageFilter(message) {
        return message
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
        /*
        let handler = apiLayer[_.find(Object.keys(apiLayer), fn => {
            return fn == endpoint
        })]
        */
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
    /*
    if (!caught) {
        console.log("Uncaught message: " + message.endpoint)
        console.log(message)
    }
    */
}

function endpointSendFn(
    getSyncKey: () => string,
    sendPacket: (packet: any, endpoint: string) => any
) {
    return function (action: string, args?) {
        let packet: any = {
            endpoint: action.toLowerCase(),
            synckey: getSyncKey()
        }
        if (typeof args !== "undefined") {
            if (args instanceof Array) {
                packet.args = args
            }
            else {
                packet.args = [args]
            }
        }
        sendPacket(packet, packet.endpoint)
    }
}

export class UlteriusConnection extends Connection {
    socketType = SocketType.Main
    bindLegacy: boolean = true
    asyncResolves: {
        [syncKey: string]: (value?: any | Thenable<any>) => void
    } = {}
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
            //callbacks[key] = console.log.bind(console)
        }
        this.promiseToSendPacket(packet, packet.endpoint)
        return new Promise<any>((resolve, reject) => {
            _.assign(this.asyncResolves, {[key]: resolve})
            setTimeout(() => {
                reject("Timed out.")
                delete this.asyncResolves[key]
            }, 4000)
        })
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
        /*
        if (endpoint && endpoint.toLowerCase() == "connectedtoulterius") {
            this.requestQueue = []
            //flush it all
        }
        */
        let packet = _.find(this.requestQueue, (m: any) => m.synckey == synckey ||
            (endpoint && endpoint.toLowerCase() == "aeshandshake" &&
                m.endpoint.toLowerCase() == "aeshandshake"))

        if (endpoint && endpoint != "getcameraframe" && !isCameraFrame(message)) {
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

        if (
            endpoint && 
            (!synckey || (synckey as string).indexOf("override") == -1) && 
            this.bindLegacy
        ) {
            defaultHandleMessage(message)
        }
        else {
            if (callbacks[synckey] &&
                typeof callbacks[synckey] == "function") {
                callbacks[synckey](results, message)
                delete callbacks[synckey]
            }
            if (this.asyncResolves[synckey]) {
                this.asyncResolves[synckey](results)
                delete this.asyncResolves[synckey]
            }
        }
    }

    getSyncKey(prepend: string) {
        this.keyCounter++
        return prepend + String(this.keyCounter)
    }

    messageFilter(message) {
        return message.results
    }
}

class TerminalConnection extends Connection {
    correlationId: number = 1
    socketType = SocketType.Terminal
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
    }
    nextCorrelationId() {
        return this.correlationId++
    }
}

class ScreenShareConnection extends Connection {
    loggedIn: boolean = true
    socketType = SocketType.ScreenShare
    send(packet: any) {
        this.promiseToSendPacket(packet, "ScreenShare")
    }
    callEndpoint = endpointSendFn(
        () => null,
        (packet, endpoint) => {
            this.promiseToSendPacket(packet, endpoint)
        }
    )
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
        this.loggedIn = true
    }
    onMessage(message: any) {
        this.requestQueue = []
        console.log(message)
        if (message.endpoint == "login")
            console.log(message)
        if (message.endpoint == "login" && message.results.loggedIn) {
            this.loggedIn = true
        }
    }
    messageFilter(message) {
        return message.results
    }
}

export let terminalConnection = new TerminalConnection(1, false)
_.assign(terminalConnection, {
    path: "terminal",
    logPackets: false
})

export let screenConnection = new ScreenShareConnection(3, false)
_.assign(screenConnection, {
    path: "screenshare",
    logPackets: true,
    useQueue: false,
    reconnect: false
})

export let mainConnection = new UlteriusConnection(2, true)
_.assign(mainConnection, {
    path: "api",
    logPackets: false,
    useQueue: false
})

export let alternativeConnection = new UlteriusConnection(2, false)
_.assign(alternativeConnection, {
    path: "webcam",
    bindLegacy: false,
    useQueue: false,
    logPackets: false,
    reconnect: false
})

window.onbeforeunload = () => {
    terminalConnection.disconnect()
    screenConnection.disconnect()
    mainConnection.disconnect()
    alternativeConnection.disconnect()
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

export function getSenderFactory(connection: Connection) {
    return (endpoint: string) => (...args: any[]) => {
        if (args.length) {
            connection.send(endpoint, args)
        }
        else {
            connection.send(endpoint)
        }
    }
}
