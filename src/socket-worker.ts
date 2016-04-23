import CryptoJS = require("crypto-js")
import {toHex, getHandler} from "./util"

let pm = postMessage as (any) => void

let handle = getHandler(postMessage, addEventListener).bind(this)

handle("deserialize", ({appState, data}) => {
    return decrypt(appState, data)
})

handle("serialize", ({appState, data}) => {
    return encrypt(appState, data)
})

/*
addEventListener("message", ({data}) => {
    let message = data as WorkerMessage<any>
    
    if (message.type == "deserialize") {
        
        let {appState, data} = message.content
        pm({
            type: "deserialize",
            content: decrypt(appState, data)
        })
        
    }
    else if (message.type == "serialize") {
        let {appState, data} = message.content
        pm({
            type: "serialize",
            content: encrypt(appState, data)
        })
    }
    
})
*/

function encrypt(appState, packet) {
    //let appState = appStore.getState()
    let packetString = ""
    if (appState.crypto && appState.crypto.key && appState.crypto.iv) {
        let utf8Key = CryptoJS.enc.Utf8.parse(appState.crypto.key)
        let utf8Iv = CryptoJS.enc.Utf8.parse(appState.crypto.iv)
        packetString = CryptoJS.AES.encrypt(
            CryptoJS.enc.Utf8.parse(JSON.stringify(packet)),
            utf8Key, 
            {
                keySize: 128 / 8,
                iv: utf8Iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        ).toString()
    }
    else {
        packetString = JSON.stringify(packet)
    }
    return packetString
}

function decrypt(appState, data: string) {
    let ret
    try {
        ret = JSON.parse(data)
    }
    catch (err) {
        let decrypted = CryptoJS.AES.decrypt(
            data,
            CryptoJS.enc.Base64.parse(btoa(appState.crypto.key)),
            {
                iv: CryptoJS.enc.Hex.parse(toHex(appState.crypto.iv))
            }
        )
        try {
            ret = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
        }
        catch (errr) {
            console.log("Failed to parse a message!")
            ret = {
                endpoint: "error",
                results: {
                    message: "Failed to parse a message!",
                    exception: errr
                }
            }
        }
    }
    return ret
}