import asmCrypto = require("asmcrypto.js")
import pako = require("pako")

import jDataView = require("jdataview")

import {
    toHex, 
    getHandler, 
    base64toArray, 
    arrayBufferToBase64, 
    SocketType, 
    bytesToGuid
} from "./util"

import {
    hexStringtoArray, 
    Base64Binary, 
    ab2str, 
    decompressData,
    encrypt,
    decrypt,
    getTextEncoder,
    unpackPacket,
    unpackFrameData,
    decodeJSON
} from "./util/crypto"

declare let require: (string) => any

//let encoderShim = require("text-encoding")
/*
if (typeof TextEncoder === "undefined") {
    self["TextEncoder"] = encoderShim.TextEncoder as typeof TextEncoder
    self["TextDecoder"] = encoderShim.TextDecoder as typeof TextDecoder
}

let encoder = new TextEncoder("utf-8")
let decoder = new TextDecoder("utf-8")
*/

/*
let encoder: TextEncoding.TextEncoder
let decoder: TextEncoding.TextDecoder
if (typeof TextEncoder === "undefined") {
    encoder = (new encoderShim.TextEncoder("utf-8") as TextEncoding.TextEncoder)
    decoder = (new encoderShim.TextDecoder("utf-8") as TextEncoding.TextDecoder)
}
else {
    encoder = new TextEncoder("utf-8")
    decoder = new TextDecoder("utf-8")
}
*/
let {encoder, decoder} = getTextEncoder()

let pm = postMessage as (any) => void

let handle = getHandler(postMessage, addEventListener)

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

    let ret = {} as any
    try {
        ret = JSON.parse(data)
    }
    catch (err) {
        let dataArray = new Uint8Array(data)
        let {encryptionMode, endpoint, body} = unpackPacket(dataArray)
        let decryptedBody = decrypt(key, iv, body, type, encryptionMode)
        
        if (endpoint == "screensharedata") {
            ret.results = unpackFrameData(decryptedBody)
        }
        else {
            ret = decodeJSON(decryptedBody)
        }
        ret.endpoint = endpoint
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


