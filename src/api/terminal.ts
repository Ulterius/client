import {terminalConnection} from "../socket"
import {generateHexString} from "../util"
import {generateKey} from "../util/crypto"
import {appStore} from "../store"
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

export function isClosedEvent(message: Ti.Message): message is Ti.Closed {
    return message.type == "ClosedTerminalEvent"
}

//export function isClosedEvent

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
    },
    create(terminalType: string) {
        terminalActions.expectTerminal()
        tC.send("CreateTerminalRequest", {
            terminalType, 
            correlationId: tC.nextCorrelationId()
        })
    },
    close(terminalId: string) {
        tC.send("CloseTerminalRequest", {
            terminalId, correlationId: tC.nextCorrelationId()
        })
    }
}

export function initialize() {
    terminalConnection.connect(appStore.getState().connection.host, "22008")
}

tC.fallbackListen(console.log.bind(console))

tC.listenAll<typeof tC>(
    [(msg, t) => !!msg.publicKey && !msg.aesShook && !t.encrypted, (msg, t) => {
        let {key, iv, encKey, encIV} = generateKey(msg.publicKey)
        /*
        let encrypt = new JSEncrypt()
        encrypt.setPublicKey(atob(msg.publicKey))
        let key = generateHexString(16)
        let iv = generateHexString(16)
        let encKey = encrypt.encrypt(key)
        let encIV = encrypt.encrypt(iv)
        */
        t.send("AesHandShakeRequest", {
            encryptedKey: encKey,
            encryptedIv: encIV
        })
        t.encrypt(key, iv)
    }],
    [msg => isSessionStateEvent(msg) && msg.aesShook, (msg, tc) => {
        console.log(msg)
        console.log("Shake got, sending create terminal shit")
        /*
        tc.send("CreateTerminalRequest", {
            terminalType: "cmd.exe", 
            correlationId: tc.nextCorrelationId()
        }) */
    }],
    [isCreatedEvent, (msg: Ti.Created) => {
        terminalActions.addTerminal(getDescriptor(msg))
    }],
    [isOutputEvent, (msg: Ti.Output) => {
        terminalActions.output(msg)
    }],
    [isClosedEvent, (msg: Ti.Closed) => {
        terminalActions.removeTerminal(msg.terminalId)
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