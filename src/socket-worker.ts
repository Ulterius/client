import CryptoJS = require("crypto-js")

import {toHex, getHandler, base64toArray} from "./util"

let pm = postMessage as (any) => void

let handle = getHandler(postMessage, addEventListener).bind(this)

handle("deserialize", ({key, iv, data}) => {
    if (!(key && iv)) {
        return JSON.parse(data)
    }
    let ret
    try {
        ret = JSON.parse(data)
    }
    catch (err) {
        ret = decrypt(key, iv, data)
    }
    return ret
})

handle("serialize", ({encrypted, key, iv, data}) => {
    if (encrypted && key && iv) {
        return encrypt(key, iv, data)
    }
    else {
        return JSON.stringify(data)
    }
})

function encrypt(key, iv, packet) {
    let packetString = ""
    let utf8Key = CryptoJS.enc.Utf8.parse(key)
    let utf8Iv = CryptoJS.enc.Utf8.parse(iv)
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
    return packetString
}

function decrypt(key, iv, data: string) {
    let ret
    let decrypted = CryptoJS.AES.decrypt(
        data,
        CryptoJS.enc.Base64.parse(btoa(key)),
        {
            iv: CryptoJS.enc.Hex.parse(toHex(iv))
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
    return ret
}