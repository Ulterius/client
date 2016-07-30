import asmCrypto = require("asmcrypto.js")
import pako = require("pako")

import jDataView = require("jdataview")

import {toHex, getHandler, base64toArray, arrayBufferToBase64, SocketType, bytesToGuid} from "./util"
import {hexStringtoArray, Base64Binary, ab2str, decompressData} from "./util/crypto"

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

interface DeserializeArgs {
    key: string,
    iv: string, 
    ofb: boolean,
    type: SocketType,
    data: any
}

handle("deserialize", ({key, iv, ofb, data, type}: DeserializeArgs) => {
    if (!(key && iv)) {
        return JSON.parse(data)
    }

    let ret
    try {
        ret = JSON.parse(data)
    }
    catch (err) {
        ret = decrypt(key, iv, data, type, ofb)
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

/*
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
*/

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

function decrypt(key, iv, data, type, ofb?) {
    //asmCrypto.AES_CBC.BLOCK_SIZE = 128
    let decrypted
    let [encKey, encIv] = [encoder.encode(key), encoder.encode(iv)]

    if (ofb) {
        decrypted = asmCrypto.AES_OFB.decrypt(data, encKey, encIv)
    }
    else {
        decrypted = asmCrypto.AES_CBC.decrypt(data, encKey, true, encIv)
    }
    
    let decoded = decoder.decode(decrypted)
    let ret
    try {
        ret = JSON.parse(decoded)
    }
    catch (errr) {
        try {
            if (type === SocketType.ScreenShare) {
                ret = unpackFrameData(decrypted)
            }
            else {
                ret = unpackCameraFrameData(decrypted)
            }
            
        }
        catch (e) {
            console.log(e)
            //means it's actually not ofb
            decrypted = asmCrypto.AES_CBC.decrypt(data, encKey, true, encIv)
            decoded = decoder.decode(decrypted)
            ret = JSON.parse(decoded)
        }
    }
    return ret
}

function unpackFrameData(data: Uint8Array) {
    let fv = new jDataView(data, 0, data.length, true)
    //let uid = fv.getString(16)
    let x = fv.getInt32(16)
    let y = fv.getInt32()
    let top = fv.getInt32()
    let bottom = fv.getInt32()
    let left = fv.getInt32()
    let right = fv.getInt32()
    let image = decompressData(data.subarray(16 + (4*6)))
    return {
        x, y, top, bottom, left, right, image
    }
}

function unpackCameraFrameData(data: Uint8Array) {
    let fv = new jDataView(data, 0, data.length, true)
    let guid = fv.getString(32)
    let cameraImage = decompressData(data.subarray(32))
    return {
        results: {
            guid, cameraImage
        }
    }
}

