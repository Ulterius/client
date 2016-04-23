import * as _ from "lodash"
let pm = postMessage as (any) => void

let files: {[key: string]: FileSystemInfo.LoadedFile} = {}

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

addEventListener("message", ({data}) => {
    let d = data as WorkerMessage<any>
    if (d.type == "requestFile") {
        let file = d.content as FileSystemInfo.InitialDownload
        files[file.path] = {
            path: file.path,
            data: [],
            total: file.size
        }
        pm(getBareProgress(files[file.path]))
    }
    else if (d.type == "downloadData") {
        let chunk = d.content as FileSystemInfo.Data
        let file = files[chunk.path]
        file.data = file.data.concat(chunk.fileData)
        let newLen = file.data.length
        if (newLen < file.total) {
            pm(getBareProgress(file))
        }
        else {
            pm({
                type: "downloadData",
                content: file
            })
            files[chunk.path] = null
        }
    }
})