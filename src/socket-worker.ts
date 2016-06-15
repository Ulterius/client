import asmCrypto = require("asmcrypto.js")
import pako = require("pako")

import {toHex, getHandler, base64toArray, arrayBufferToBase64} from "./util"
import {hexStringtoArray, Base64Binary, ab2str} from "./util/crypto"

declare let require: (string) => any

if (!TextEncoder) {
    let encoding = require("text-encoding")
    TextEncoder = encoding.TextEncoder as typeof TextEncoder
    TextDecoder = encoding.TextDecoder as typeof TextDecoder
}

let encoder = new TextEncoder("utf-8")
let decoder = new TextDecoder("utf-8")

let pm = postMessage as (any) => void

let handle = getHandler(postMessage, addEventListener)

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
        return decompressData(new Uint8Array(data))
    }
    else {
        return decompressData(
            decryptData(key, iv, data)
        )
    }
})

function encrypt(key, iv, packet) {

    /*
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
    */
    //asmCrypto.AES_CBC.BLOCK_SIZE = 128
    let encodedPacket = encoder.encode(JSON.stringify(packet))
    let encryptedPacket = asmCrypto.AES_CBC.encrypt(
        encodedPacket,
        encoder.encode(key), 
        true,
        encoder.encode(iv)
    )
    return encryptedPacket
}

function decrypt(key, iv, data) {
    //asmCrypto.AES_CBC.BLOCK_SIZE = 128
    console.log(key)
    const decrypted = asmCrypto.AES_CBC.decrypt(
        data,
        encoder.encode(key), 
        true, 
        encoder.encode(iv)
    )

    const decoded = decoder.decode(decrypted)
    let ret
    try {
        ret = JSON.parse(decoded)
    }
    catch (errr) {
        ret = decoded
    }
    return ret
}

function decryptData(key: string, iv: string, data: ArrayBuffer) {
    /*
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
    */
    let decrypted = asmCrypto.AES_CBC.decrypt(
        data,
        encoder.encode(key),
        true,
        encoder.encode(iv)
    )

    return decrypted
}

function decompressData(data: Uint8Array) {
    //let compressedBuffer = base64toArray(data)
    let buffer = pako.inflate(data)
    return arrayBufferToBase64(buffer)
}