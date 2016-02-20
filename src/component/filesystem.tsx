import React = require("react")
import {EntryBox} from "./"
import {Button, Table, Glyphicon} from "react-bootstrap"
import {FileSystemState, fileSystemStore} from "../store"
import {fileSystemActions} from "../action"
import {bytesToSize, lastPathSegment} from "../util"
import {sendCommandToDefault} from "../socket"

export class FileList extends React.Component<{}, FileSystemState> {
    componentDidMount() {
        this.updateState(fileSystemStore.getState())
        fileSystemStore.listen(this.updateState)
    }
    componentWillUnmount() {
        fileSystemStore.unlisten(this.updateState)
    }
    updateState = (state: FileSystemState) => {
        this.setState(state)
    }
    openFolder = (path: string) => {
        sendCommandToDefault("createFileTree", path)
    }
    goBack = () => {
        if (this.state.pathStack.length > 1) {
            fileSystemActions.goBack()
            this.openFolder(this.state.pathStack[0])
        }
    }
    render() {
        if (this.state) {
            return <div>
                {JSON.stringify(this.state.pathStack)}
                <div className="row">
                    <div className="col-xs-4">
                        <Button onClick={this.goBack}><Glyphicon glyph="arrow-left" /></Button>
                    </div>
                    <div className="col-xs-8">
                        <EntryBox onConfirm={console.log} glyph="arrow-right" />
                    </div>
                </div>
                <div className="row">
                    <Table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.tree.RootFolder.ChildFolders.map(folder => {
                                return <tr>
                                    <td width="16"><Glyphicon glyph="folder-close"/></td>
                                    <td style={{cursor: "pointer"}} onClick={() => this.openFolder(folder.Name)}>{lastPathSegment(folder.Name)}</td>
                                    <td></td>
                                </tr>
                            })
                        }
                        {
                            this.state.tree.RootFolder.Files.map(file => {
                                return <tr>
                                    <td><Glyphicon glyph="file" /></td>
                                    <td>{lastPathSegment(file.Path)}</td>
                                    <td>{bytesToSize(file.FileSize)}</td>
                                </tr>
                            })
                        }
                        </tbody>
                    </Table>
                </div>
            </div>
        }
        else {
            return <div>loading files...</div>
        }
    }
}

export function FilePage(props: any) {
    return <div className="file-page">
        <FileList />
    </div>
}