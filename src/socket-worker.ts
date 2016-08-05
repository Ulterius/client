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
    decrypt
} from "./util/crypto"

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


