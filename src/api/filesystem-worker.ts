import * as _ from "lodash"
import {getHandler, toHex, b64toArray,arrayToBase64, arrayBufferToBase64, convertFromHex, wrapPostMessage} from "../util"
let pm = wrapPostMessage(postMessage)
import CryptoJS = require("crypto-js")
let handle = getHandler(postMessage, addEventListener)
let files: {[key: string]: FileSystemInfo.LoadedFile} = {}

handle("requestFile", ({password, location, path}) => {
    let req = new XMLHttpRequest()
    req.open("GET", location, true)
    req.responseType = "arraybuffer"
    req.addEventListener("progress", e => {
        console.log(e.loaded)
        console.log(e.total)
        pm("progress", {
            path,
            downloaded: e.loaded,
            total: e.total
        })
    })
    req.addEventListener("load", (e) => {
        let buffer = req.response
        //console.log(atob(decryptData(password, arrayBufferToBase64(req.response))))
        pm("requestFile", {
            type: "requestFile",
            content: b64toArray(decryptData(password, arrayBufferToBase64(req.response)))
        })
        
        //console.log(atob(arrayBufferToBase64(req.response)))
    })
    req.send()
    return false
})


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