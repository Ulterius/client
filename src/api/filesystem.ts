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
import {WorkerPool} from "../util/worker"
import {sendCommandAsync, sendCommandToDefault} from "../socket"
import * as _ from "lodash"
import FS = FileSystemInfo
let FsWorker = require("worker?name=filesystem.worker.js!./filesystem-worker")
//let fsWorker: Worker = new FsWorker
let fsWorkerPool = new WorkerPool(FsWorker, 1)

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
                    handleUploadFile(path, fileKey, password, data)
                }
            }
        )
    },
    search(query: string) {
        sendCommandAsync("searchFiles", query, (result: SearchResult) => {
            fileSystemActions.search(result)
        })
    },
    reloadFileTree(path: string) {
        sendCommandAsync("createFileTree", path, fileSystemActions.reloadFileTree)
    },
    removeFile(path: string) {
        const name = lastPathSegment(path)
        sendCommandAsync("removeFile", 
            settingsStore.getState().settings.WebServer.WebFilePath + "temp/" + name, 
            (response) => {
                if (response.deleted) {
                    fileSystemActions.removeDownload(path)
                }
            }
        )
    },
    createFileTree(path: string = "") {
        if (path == "") {
            sendCommandAsync("requestSystemInformation", (info: SystemInfo) => {
                fileSystemActions.createRoot(info.drives)
            })
        }
        else {
            sendCommandToDefault("createFileTree", path)
        }
    }
}

fsWorkerPool.listen({
    uploadProgress(progress) {
        console.log(progress)
        fileSystemActions.uploadProgress(progress)
    },
    uploadFile({sent, path}) {
        messageActions.message({style: "success", text: "File uploaded."})
        fsApi.reloadFileTree(untilLastPathSegment(path))
    },
    requestFile(result) {
        console.log("Download compree.")
        sendCommandAsync("removeFile", [lastPathSegment(result.path)])
        fileSystemActions.downloadComplete(result)
    },
    progress(content) {
        //console.log(content)
        console.log("We get progress.")
        fileSystemActions.downloadProgress(content)
    }
})

function handleUploadFile(path: string, fileKey: string, password: string, data: ArrayBuffer) {
    let {host} = appStore.getState().connection
    let port = settingsStore.getState().settings.WebServer.WebServerPort
    console.log(settingsStore.getState())
    let destination =  "http://" + 
        appStore.getState().connection.host + ":" +
        port +
        "/upload/"
    fsWorkerPool.post("uploadFile", {
        password,
        path,
        fileKey,
        destination,
        data
    })
}

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
    fsWorkerPool.post("requestFile", {
        password,
        location: fullPath,
        localLocation: location
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
    fsWorkerPool.post("downloadData", data)
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