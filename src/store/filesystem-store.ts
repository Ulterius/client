import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {fileSystemActions} from "../action"
import * as _ from "lodash"

export interface FileSystemState {
    tree: FileSystemInfo.FileTree,
    pathStack: string[]
}

class FileSystemStore extends AbstractStoreModel<FileSystemState> {
    tree: FileSystemInfo.FileTree
    pathStack: string[]
    goingBack: boolean
    constructor() {
        super()
        this.pathStack = []
        this.goingBack = false
        this.bindListeners({
            handleUpdateFileTree: fileSystemActions.updateFileTree,
            handleBack: fileSystemActions.goBack
        })
    }
    handleUpdateFileTree(tree: FileSystemInfo.FileTree) {
        this.tree = tree
        if (!this.goingBack) {
            this.pathStack.unshift(tree.RootFolder.Name)
        }
        else {
            this.goingBack = false
        }
        if (this.pathStack.length > 10) {
            this.pathStack.pop()
        }
    }
    handleBack() {
        this.pathStack.shift()
        this.goingBack = true
    }
}

export let fileSystemStore = alt.createStore<FileSystemState>(FileSystemStore, "FileSystemStore")