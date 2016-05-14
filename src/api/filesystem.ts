import {fileSystemActions, messageActions} from "../action"
import {fileSystemStore, appStore, settingsStore} from "../store"
import {
    frameBufferToImageURL,
    workerAsync,
    downloadBlobURL,
    byteArraysToBlobURL,
    generatePassword,
    lastPathSegment,
    untilLastPathSegment
} from "../util"
import {sendCommandAsync, sendCommandToDefault} from "../socket"
import * as _ from "lodash"
import FS = FileSystemInfo
let FsWorker = require("worker?name=filesystem.worker.js!./filesystem-worker")
let fsWorker: Worker = new FsWorker

export const fsApi = {
    requestFile(location: string) {
        let password = generatePassword()
        sendCommandAsync("requestFile", [location, password], (file) => {
            handleRequestFile(file, password, location)
        })
    },
    uploadFile(path: string, data: ArrayBuffer) {
        let password = generatePassword()
        let fileKey = generatePassword()
        sendCommandAsync("approveFile", 
            [fileKey, path, password], 
            (response: FileTransfer.Approved) => {
                if (response.fileApproved) {
                    handleUploadFile(path, fileKey,password, data)
                }
            }
        )
    },
    reloadFileTree(path: string) {
        sendCommandAsync("createFileTree", path, fileSystemActions.reloadFileTree)
    },
    removeFile(path: string) {
        const name = lastPathSegment(path)
        sendCommandAsync("removeFile", 
            settingsStore.getState().settings.WebFilePath + "temp/" + name, 
            (response) => {
                if (response.deleted) {
                    fileSystemActions.removeDownload(path)
                }
            }
        )
    },
    createFileTree(path: string) {
        sendCommandToDefault("createFileTree", path)
    }
}

function handleUploadFile(path: string, fileKey: string, password: string, data: ArrayBuffer) {
    let {host} = appStore.getState().connection
    let port = settingsStore.getState().settings.WebServerPort
    let destination =  "http://" + 
        appStore.getState().connection.host + ":" +
        port +
        "/upload/"
    workerAsync(fsWorker, "uploadFile", {
        password,
        path,
        fileKey,
        destination,
        data
    }, ({sent}) => {
        messageActions.message({style: "success", text: "File uploaded."})
        fsApi.reloadFileTree(untilLastPathSegment(path))
    })
}

fsWorker.addEventListener("message", ({data}) => {
    console.log(data)
    let message = data as WorkerMessage<any>
    if (message.type == "progress") {
        console.log("We get progres")
        fileSystemActions.downloadProgress(message.content)
    }
})

export function createFileTree(tree: FileSystemInfo.FileTree) {
    console.log(tree)
    fileSystemActions.updateFileTree(tree)
}

export function handleRequestFile(file: FileSystemInfo.Link, password: string, location: string) {
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
        localLocation: location
    }, (result) => {
        fileSystemActions.downloadComplete(result)
        //downloadBlobURL(byteArraysToBlobURL([result]), fileName)
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