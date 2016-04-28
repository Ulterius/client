import * as _ from "lodash"
import {getHandler, toHex, b64toArray,arrayToBase64, arrayBufferToBase64, convertFromHex} from "../util"
let pm = postMessage as (any) => void
import CryptoJS = require("crypto-js")
let handle = getHandler(postMessage, addEventListener)
let files: {[key: string]: FileSystemInfo.LoadedFile} = {}

handle("requestFile", ({password, location}) => {
    let req = new XMLHttpRequest()
    req.open("GET", location, true)
    req.responseType = "arraybuffer"
    req.addEventListener("load", (e) => {
        let buffer = req.response
        //console.log(atob(decryptData(password, arrayBufferToBase64(req.response))))
        pm({
            type: "requestFile",
            content: b64toArray(decryptData(password, arrayBufferToBase64(req.response)))
        })
        
        //console.log(atob(arrayBufferToBase64(req.response)))
    })
    req.send()
    return false
})

/*
handle("requestFile", (file: FileSystemInfo.InitialDownload) => {
    //let file = data as FileSystemInfo.InitialDownload
    files[file.path] = {
        path: file.path,
        data: [],
        total: file.size
    }
    pm(getBareProgress(files[file.path]))
    return false
})

handle("downloadData", (chunk: FileSystemInfo.Data) => {
    let file = files[chunk.path]
    file.data = file.data.concat(chunk.fileData)
    file.total = chunk.totalSize
    console.log(chunk.fileData[600])
    console.log(chunk.fileData[20000])
    let newLen = file.data.length
    console.log(file.data.length)
    console.log(file.total)
    if (newLen < file.total) {
        pm(getBareProgress(file))
    }
    else {
        pm({
            type: "downloadData",
            content: file
        })
        //files[chunk.path] = null
    }
    return false
})

function getBareProgress(file: FileSystemInfo.LoadedFile) {
    return {
        type: "downloadData",
        content: {
            path: file.path,
            downloaded: file.data.length,
            total: file.total
        }
    }
}
*/

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