import * as _ from "lodash"
import {getHandler, toHex, base64toArray,arrayToBase64, arrayBufferToBase64, convertFromHex, wrapPostMessage} from "../util"
import {getTextEncoder} from "../util/crypto"
let pm = wrapPostMessage(postMessage)
import CryptoJS = require("crypto-js")
import asmCrypto = require("asmcrypto.js")
let handle = getHandler(postMessage, addEventListener)
let files: {[key: string]: FileSystemInfo.LoadedFile} = {}

/*
if (!TextEncoder) {
    let encoding = require("text-encoding")
    TextEncoder = encoding.TextEncoder as typeof TextEncoder
    TextDecoder = encoding.TextDecoder as typeof TextDecoder
}

let encoder = new TextEncoder("utf-8")
let decoder = new TextDecoder("utf-8")
*/
let {encoder, decoder} = getTextEncoder()

handle("requestFile", ({password, location, localLocation}) => {
    let req = new XMLHttpRequest()
    req.open("GET", location, true)
    req.responseType = "arraybuffer"
    req.addEventListener("progress", e => {
        pm("progress", {
            path: localLocation,
            downloaded: e.loaded,
            total: e.total
        })
    })
    req.addEventListener("load", e => {
        let buffer = req.response
        let file = decryptData(password, buffer)
        pm("requestFile", {
            path: localLocation,
            data: file
        })
    })
    req.send()
    return false
})

handle("uploadFile", ({path, destination, data, password, fileKey}) => {
    let encryptedData = encryptData(password, data)
    let formData = new FormData()
    let fileBlob = new Blob([encryptedData])
    formData.append("file", fileBlob)
    let req = new XMLHttpRequest()
    req.open("POST", destination, true)
    req.setRequestHeader("File-Key", fileKey)
    req.upload.onprogress = e => {
        pm("uploadProgress", {
            path,
            uploaded: e.loaded,
            total: e.total
        })
    }
    req.addEventListener("load", e => {
        console.log(req.responseText)
        pm("uploadFile", {
            sent: true,
            path
        })
    })
    req.send(formData)
})

function encryptData(key: string, data: ArrayBuffer) {

    let encKey = encoder.encode(key)
    let encrypted = asmCrypto.AES_CBC.encrypt(data, encKey, true, encKey)
    return encrypted
    /*
    let pass = CryptoJS.enc.Utf8.parse(key)
    let encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Base64.parse(data),
        pass,
        {
            keySize: 128 / 8,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
            iv: pass
        }
    )
    return (encrypted.ciphertext as any).toString(CryptoJS.enc.Base64)
    */
}

function decryptData(key: string, data: ArrayBuffer) {
    let encKey = encoder.encode(key)
    let decrypted = asmCrypto.AES_CBC.decrypt(data, encKey, true, encKey)
    return decrypted;
}