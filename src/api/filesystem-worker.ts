import * as _ from "lodash"
import {getHandler} from "../util"
let pm = postMessage as (any) => void

let handle = getHandler(postMessage, addEventListener)

let files: {[key: string]: FileSystemInfo.LoadedFile} = {}

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