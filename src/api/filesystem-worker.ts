import * as _ from "lodash"
import {getHandler, toHex, base64toArray,arrayToBase64, arrayBufferToBase64, convertFromHex, wrapPostMessage} from "../util"
let pm = wrapPostMessage(postMessage)
import CryptoJS = require("crypto-js")
let handle = getHandler(postMessage, addEventListener)
let files: {[key: string]: FileSystemInfo.LoadedFile} = {}

handle("requestFile", ({password, location, localLocation}) => {
    let req = new XMLHttpRequest()
    req.open("GET", location, true)
    req.responseType = "arraybuffer"
    req.addEventListener("progress", e => {
        console.log(e.loaded)
        console.log(e.total)
        pm("progress", {
            path: localLocation,
            downloaded: e.loaded,
            total: e.total
        })
    })
    req.addEventListener("load", e => {
        let buffer = req.response
        pm("requestFile", {
            path: localLocation,
            data: base64toArray(decryptData(password, arrayBufferToBase64(req.response)))
        })
    })
    req.send()
    return false
})

handle("uploadFile", ({path, destination, data, password}) => {
    let encryptedData = encryptData(password, arrayBufferToBase64(data))
    let formData = new FormData()
    let fileBlob = new Blob([base64toArray(encryptedData)])
    formData.append("file", fileBlob)
    let req = new XMLHttpRequest()
    req.open("POST", destination, true)
    req.setRequestHeader("File-Key", password)
    req.addEventListener("load", e => {
        console.log(req.responseText)
        pm("uploadFile", {
            sent: true
        })
    })
    req.send(formData)
})

function encryptData(key: string, data: string): string {
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
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64)
}

function decryptData(key: string, data: string) {
    let pass = CryptoJS.enc.Utf8.parse(key)
    
    let cipherParams = (CryptoJS as any).lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(data)
    })
    
    let decrypted = CryptoJS.AES.decrypt(data, pass, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
        iv: pass
    })
    return decrypted.toString(CryptoJS.enc.Base64)
}