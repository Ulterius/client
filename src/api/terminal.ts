import {terminalConnection} from "../socket"
import {generateHexString} from "../util"
import {terminalActions} from "../action"
import Ti = TerminalInfo
const tC = terminalConnection
declare let JSEncrypt: any

export function isOutputEvent(message: any): message is Ti.Output {
    return message.type == "TerminalOutputEvent"
}

export function isSessionStateEvent(message: Ti.Message): message is Ti.SessionState {
    return message.type == "SessionStateEvent"
}

export function isCreatedEvent(message: Ti.Message): message is Ti.Created {
    return message.type == "CreatedTerminalEvent"
}

function getDescriptor(message: Ti.Created) {
    return {
        terminalType: message.terminalType,
        id: message.terminalId,
        currentPath: message.currentPath
    }
}

export let terminalApi = {
    send(input: string, terminalId: string) {
        tC.send("TerminalInputRequest", {
            input,
            terminalId,
            correlationId: tC.nextCorrelationId()
        })
    }
}

export function initialize() {
    terminalConnection.connect("localhost", "22008")
}

tC.fallbackListen(console.log.bind(console))

tC.listenAll(
    [msg => !!msg.publicKey && !msg.aesShook && !tC.encrypted, msg => {
        let encrypt = new JSEncrypt()
        encrypt.setPublicKey(atob(msg.publicKey))
        let key = generateHexString(16)
        let iv = generateHexString(16)
        let encKey = encrypt.encrypt(key)
        let encIV = encrypt.encrypt(iv)
        tC.send("AesHandShakeRequest", {
            encryptedKey: encKey,
            encryptedIv: encIV
        })
        tC.encrypt(key, iv)
    }],
    [msg => isSessionStateEvent(msg) && msg.aesShook, msg => {
        console.log(msg)
        console.log("Shake got, sending create terminal shit")
        tC.send("CreateTerminalRequest", {
            terminalType: "cmd.exe", 
            correlationId: tC.nextCorrelationId()
        })
    }],
    [isCreatedEvent, (msg: Ti.Created) => {
        terminalActions.addTerminal(getDescriptor(msg))
    }],
    [isOutputEvent, (msg: Ti.Output) => {
        terminalActions.output(msg)
    }]
)

/*
tC.listen(msg => !!msg.publicKey && !msg.aesShook && !terminalConnection.encrypted, msg => {
    let encrypt = new JSEncrypt()
    encrypt.setPublicKey(atob(msg.publicKey))
    let key = generateHexString(16)
    let iv = generateHexString(16)
    let encKey = encrypt.encrypt(key)
    let encIV = encrypt.encrypt(iv)
    terminalConnection.send("AesHandShakeRequest", {
        encryptedKey: encKey,
        encryptedIv: encIV
    })
    terminalConnection.encrypt(key, iv)
})

tC.listen(msg => (msg.type == "SessionStateEvent" && msg.aesShook), msg => {
    console.log(msg)
    console.log("Shake got, sending create terminal shit")
    terminalConnection.send("CreateTerminalRequest", {terminalType: "cmd.exe", correlationId: terminalConnection.nextCorrelationId()})
    //terminalConnection.sendAsync("CreateTerminalRequest", {terminalType: "powershell"}, msg => {console.log(msg)})
})

tC.listen(msg => isCreatedEvent(msg), (msg: Ti.Created) => {
    terminalActions.addTerminal(getDescriptor(msg))
})
*/