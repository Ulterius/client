import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {fileSystemActions} from "../action"
import * as _ from "lodash"

export interface FileSystemState {
    tree?: FileSystemInfo.FileTree,
    pathStack?: FileSystemInfo.FileTree[]
    downloads?: {
        inProgress: {[key: string]: FileTransfer.Progress},
        complete: FileTransfer.Complete
    },
    uploads?: {[key: string]: FileTransfer.UploadProgress}
    searchResult?: SearchResult
}

export interface FileProgress {
    data?: number[],
    downloaded: number,
    total: number,
    complete: boolean
}

//key them by file path, since you can't download two of those at once
export interface Files {
    [key: string]: FileProgress
}

export function isLoaded(obj: any): obj is FileSystemInfo.LoadedFile {
    return ("data" in obj)
}

class FileSystemStore extends AbstractStoreModel<FileSystemState> {
    tree: FileSystemInfo.FileTree
    pathStack: FileSystemInfo.FileTree[]
    downloads: {
        inProgress: {[key: string]: FileTransfer.Progress},
        complete: FileTransfer.Complete
    }
    uploads: {[key: string]: FileTransfer.UploadProgress}
    goingBack: boolean
    searchResult: SearchResult
    constructor() {
        super()
        this.pathStack = []
        this.goingBack = false
        this.downloads = {
            inProgress: {},
            complete: undefined
        }
        this.uploads = {}
        this.bindListeners({
            handleUpdateFileTree: fileSystemActions.updateFileTree,
            handleBack: fileSystemActions.goBack,
            handleForward: fileSystemActions.goForward,
            handleReload: fileSystemActions.reloadFileTree,
            handleAddDownload: fileSystemActions.addDownload,
            handleDownloadProgress: fileSystemActions.downloadProgress,
            handleDownloadComplete: fileSystemActions.downloadComplete,
            handleRemoveDownload: fileSystemActions.removeDownload,
            handleUploadProgress: fileSystemActions.uploadProgress,
            handleSearch: fileSystemActions.search,
            handleClearSearch: fileSystemActions.clearSearch,
            handleCreateRoot: fileSystemActions.createRoot
        })
    }
    handleCreateRoot(drives: DriveInfo[]) {
        this.handleUpdateFileTree({
            DeepWalk: false,
            RootFolder: {
                Name: "",
                ChildFolders: drives.map(drive => {
                    console.log(drive.Name)
                    return {
                        Name: drive.Name,
                        ChildFolders: [],
                        Files: []
                    }
                }),
                Files: []
            }
        })
    }
    handleSearch(result: SearchResult) {
        this.searchResult = result
    }
    handleClearSearch() {
        this.searchResult = undefined
    }
    handleUploadProgress(file: FileTransfer.UploadProgress) {
        console.log("Uploadered shit ass anus dicks")
        _.assign(this.uploads, {[file.path]: file})
        if (file.uploaded >= file.total) {
            setTimeout(() => {
                this.setState({uploads: _.omit(this.uploads, file.path)})
            }, 2000)
        }
    }
    handleRemoveDownload(path: string) {
        if (this.downloads.complete.path == path) {
            this.downloads.complete = undefined
        }
        if (this.downloads.inProgress[path]) {
            delete this.downloads.inProgress[path]
        }
    }
    handleDownloadComplete(data: FileTransfer.Complete) {
        delete this.downloads.inProgress[data.path]
        this.downloads.complete = data
    }
    handleDownloadProgress(data: FileTransfer.Progress) {

        /*
        let download = this.downloads[data.path]
        if (!download) {
            console.log("Got data for a file that was never started!")
            return false
        }

        if (isLoaded(data)) {
            download.data = data.data
            download.downloaded = data.total
            download.complete = true
        }
        else {
            download.downloaded = data.downloaded
        }
        for (let byte of data.fileData) {
            this.downloads[data.path].data.push(byte)
        }
        */
        //this.downloads[data.path].data.push(...data.fileData)
        this.downloads.inProgress[data.path] = data
    }
    handleAddDownload(file: FileTransfer.Initial) {
        this.downloads.inProgress[file.path] = {
            path: file.path,
            downloaded: 0,
            total: file.size
        }
    }
    handleReload(tree: FileSystemInfo.FileTree) {
        this.tree = tree[0] // tree is an array ? code expects object
        console.log("refreshed", tree)
        //don't do anything to the history, right
    }
    handleUpdateFileTree(tree: FileSystemInfo.FileTree) {
        console.log(this.currentTreeIndex())
        if (this.currentTreeIndex() > 0) {
            this.pathStack = this.pathStack.slice(
                this.currentTreeIndex(),
                this.pathStack.length
            )
        }
        this.tree = tree
        this.pathStack.unshift(tree)
        if (this.pathStack.length > 10) {
            this.pathStack.pop()
        }
    }
    handleBack() {
        this.goingBack = true
        if (this.pathStack.indexOf(this.tree) != this.pathStack.length-1) {
            this.tree = this.pathStack[this.currentTreeIndex()+1]
        }
        else {
            this.tree = this.pathStack[1]
        }
    }
    handleForward() {
        if (this.pathStack.indexOf(this.tree) > 0) {
            this.tree = this.pathStack[this.currentTreeIndex()-1]
        }
    }
    currentTreeIndex() {
        return this.pathStack.indexOf(this.tree)
    }
}

export let fileSystemStore = alt.createStore<FileSystemState>(FileSystemStore, "FileSystemStore")
