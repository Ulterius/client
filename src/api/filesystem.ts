import {fileSystemActions, messageActions} from "../action"
import {fileSystemStore} from "../store"
import {frameBufferToImageURL} from "../util"
import {sendCommandAsync} from "../socket"

let FsWorker = require("worker?name=filesystem.worker.js!./filesystem-worker")
let fsWorker: Worker = new FsWorker

fsWorker.onmessage = ({data}) => {
    let message = data as WorkerMessage<any>
    if (message.type == "downloadData") {
        if (message.content.downloaded || message.content.data) {
            fileSystemActions.downloadData(message.content)
        }
        if (message.content.data) {
            fileSystemActions.removeDownload(message.content.path)
        }
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

export function requestFile(file: FileSystemInfo.InitialDownload) {
    console.log(file)
    let message: WorkerMessage<FileSystemInfo.InitialDownload> = {
        type: "requestFile",
        content: file
    }
    fsWorker.postMessage(message)
    fileSystemActions.addDownload(file)
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