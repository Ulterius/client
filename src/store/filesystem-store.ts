import alt from "../alt"
import AbstractStoreModel from "./abstract-store"
import {fileSystemActions} from "../action"
import * as _ from "lodash"

export interface FileSystemState {
    tree: FileSystemInfo.FileTree,
    pathStack: FileSystemInfo.FileTree[]
}

class FileSystemStore extends AbstractStoreModel<FileSystemState> {
    tree: FileSystemInfo.FileTree
    pathStack: FileSystemInfo.FileTree[]
    goingBack: boolean
    constructor() {
        super()
        this.pathStack = []
        this.goingBack = false
        this.bindListeners({
            handleUpdateFileTree: fileSystemActions.updateFileTree,
            handleBack: fileSystemActions.goBack,
            handleForward: fileSystemActions.goForward
        })
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