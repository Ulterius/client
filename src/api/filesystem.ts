import {fileSystemActions, messageActions} from "../action"
import {fileSystemStore, appStore, settingsStore} from "../store"
import {frameBufferToImageURL, workerAsync, downloadBlobURL, byteArraysToBlobURL, generatePassword} from "../util"
import {sendCommandAsync, sendCommandToDefault} from "../socket"
import * as _ from "lodash"
import FS = FileSystemInfo
let FsWorker = require("worker?name=filesystem.worker.js!./filesystem-worker")
let fsWorker: Worker = new FsWorker

export const fsApi = {
    requestFile(location: string) {
        let password = generatePassword()
        sendCommandAsync("requestFile", [location, password], (file) => {
            handleRequestFile(file, password)
        })
    },
    reloadFileTree(path: string) {
        sendCommandAsync("createFileTree", path, fileSystemActions.reloadFileTree)
    },
    createFileTree(path: string) {
        sendCommandToDefault("createFileTree", path)
    }
}

fsWorker.onmessage = ({data}) => {
    let message = data as WorkerMessage<any>
    if (message.type == "progress") {
        console.log("We get progres")
        fileSystemActions.downloadProgress(message.content)
    }
}

export function createFileTree(tree: FileSystemInfo.FileTree) {
    console.log(tree)
    fileSystemActions.updateFileTree(tree)
}

export function downloadFile(file: FileSystemInfo.FileDownload) {
    let url = frameBufferToImageURL(file.fileBytes)
    let a = document.createElement("a")
    a.href = url
    let as = (a as any)
    as.download = file.fileName
    document.body.appendChild(a)
    a.style.display = "none"
    a.click()
    document.body.removeChild(a)
    
    
    URL.revokeObjectURL(url)
    //you didn't see anything
    //please forget this ever happened
}

export function handleRequestFile(file: FileSystemInfo.Link, password: string) {
    console.log(file)
    let segs = file.tempWebPath.split("/")
    let fileName = _.last(segs)
    let port = segs[2].split(":")[1]
    let path = file.tempWebPath.split("/").slice(3).join("/")
    let fullPath = "http://" + 
        appStore.getState().connection.host + ":" +
        port +
        "/" + path
    console.log(fullPath)
    workerAsync(fsWorker, "requestFile", {
        password,
        location: fullPath,
        path
    }, (result) => {
        
        console.log("fuck")
        downloadBlobURL(byteArraysToBlobURL([result]), fileName)
    })
    /*
    let message: WorkerMessage<FileSystemInfo.InitialDownload> = {
        type: "requestFile",
        content: file
    }
    fsWorker.postMessage(message)
    fileSystemActions.addDownload(file)
    */
}

export function downloadData(data: FileSystemInfo.Data) {
    let message: WorkerMessage<FileSystemInfo.Data> = {
        type: "downloadData",
        content: data
    }
    fsWorker.postMessage(message)
    //fileSystemActions.downloadData(data)
}

export function uploadFile(file: FileSystemInfo.FileUpload) {
    if (file.fileUploaded) {
        messageActions.message({
            style: "success",
            text: `File ${file.fileName} uploaded to ${file.path}.`
        })
        sendCommandAsync("createFileTree", fileSystemStore.getState().tree.RootFolder.Name, fileSystemActions.reloadFileTree)
    }
    else {
        messageActions.message({
            style: "danger",
            text: `File ${file.fileName} failed to upload.`
        })
    }
}