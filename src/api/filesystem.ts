import {fileSystemActions, messageActions} from "../action"
import {fileSystemStore} from "../store"
import {frameBufferToImageURL} from "../util"
import {sendCommandAsync} from "../socket"

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