import asmCrypto = require("asmcrypto.js")
import CryptoJS = require("crypto-js")
import pako = require("pako")

import {toHex, getHandler, base64toArray, arrayBufferToBase64} from "./util"

let pm = postMessage as (any) => void

let handle = getHandler(postMessage, addEventListener).bind(this)

handle("test", () => {
    console.log("Started...")
    let counter = 0;
    for(let i = 0; i < 600000000; i++) {
        counter++;
    }
    return "successful! " + counter
})

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

handle("decryptBuffer", ({key, iv, data}: {key: string, iv: string, data: ArrayBuffer}) => {
    if (!(key && iv)) {
        return decompressData(arrayBufferToBase64(data))
    }
    else {
        return decompressData(
            decryptData(key, iv, arrayBufferToBase64(data))
        )
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
        ret = decrypted.toString(CryptoJS.enc.Base64)
        /*
        ret = {
            endpoint: "error",
            results: {
                message: "Failed to parse a message!",
                exception: errr
            }
        }
        */
    }
    return ret
}

function decryptData(key: string, iv: string, data: string) {
    let pass = CryptoJS.enc.Utf8.parse(key)
    let criv = CryptoJS.enc.Utf8.parse(iv)
    
    let cipherParams = (CryptoJS as any).lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(data)
    })
    
    let decrypted = CryptoJS.AES.decrypt(data, pass, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: criv
    })
    
    return decrypted.toString(CryptoJS.enc.Base64)
}

function decompressData(data: string) {
    let compressedBuffer = base64toArray(data)
    let buffer = pako.inflate(compressedBuffer)
    return arrayBufferToBase64(buffer)
}