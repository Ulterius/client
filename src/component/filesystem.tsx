import React = require("react")
import {EntryBox} from "./"
import {Button, ButtonGroup, ButtonToolbar, Table, Glyphicon, Input} from "react-bootstrap"
import {FileSystemState, fileSystemStore} from "../store"
import {fileSystemActions} from "../action"
import {bytesToSize, lastPathSegment} from "../util"
import {sendCommandToDefault} from "../socket"

export class FileList extends React.Component<{}, FileSystemState> {
    box: EntryBox
    upload: any
    componentDidMount() {
        this.updateState(fileSystemStore.getState())
        fileSystemStore.listen(this.updateState)
    }
    componentWillUnmount() {
        fileSystemStore.unlisten(this.updateState)
    }
    updateState = (state: FileSystemState) => {
        this.setState(state)
        if (this.box) {
            this.box.setState({customized: false})
        }
    }
    openFolder = (path: string) => {
        sendCommandToDefault("createFileTree", path)
    }
    goBack = () => {
        if (this.state.pathStack.length > 1) {
            fileSystemActions.goBack()
            //this.openFolder(this.state.pathStack[0].RootFolder.Name)
        }
    }
    handleUpload = (e) => {
        let reader = new FileReader()
        
        reader.onload = ee => {
            sendCommandToDefault("uploadFile", [
                this.state.tree.RootFolder.Name + "\\" + readerAny.name,
                [].slice.call(new Int8Array((ee.target as any).result))
            ])
        }
        reader.onerror = function (e) {
            console.error(e);
		}
        console.log(e.target.files)
        let readerAny = (reader as any)
        readerAny.name = e.target.files[0].name
        reader.readAsArrayBuffer(e.target.files[0])
    }
    render() {
        if (!this.state) {
            return <div>loading files...</div>
        }
            
            
        let {tree} = this.state
        return <div>
            {/* this.state.pathStack.map(tree => tree.RootFolder.Name) */}
            {/* this.state.pathStack.indexOf(this.state.tree) */}
            <input ref={ref => this.upload = ref} className="upload" type="file" onChange={this.handleUpload}/>
            <div className="row">
                <div className="col-sm-3">
                    <ButtonToolbar>
                    <ButtonGroup justified>
                        <ButtonGroup>
                            <Button onClick={fileSystemActions.goBack}>
                                <Glyphicon glyph="arrow-left" />
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button onClick={fileSystemActions.goForward}>
                                <Glyphicon glyph="arrow-right" />
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button bsStyle="primary" onClick={() => this.upload.click()}>
                                <Glyphicon glyph="export" />
                            </Button>
                        </ButtonGroup>
                    </ButtonGroup>
                    </ButtonToolbar>
                </div>
                <div className="col-sm-9">
                    <EntryBox 
                    ref={box => this.box = box}
                    onConfirmation={this.openFolder}
                    defaultValue={tree.RootFolder.Name}
                    glyph="chevron-right" />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    <Table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tree.RootFolder.ChildFolders.map(folder => {
                                return <tr>
                                    <td width="16"><Glyphicon glyph="folder-close"/></td>
                                    <td>
                                        <span
                                        style={{cursor: "pointer"}}
                                        onClick={() => this.openFolder(folder.Name)}>
                                            {lastPathSegment(folder.Name)}
                                        </span>
                                    </td>
                                    <td></td>
                                </tr>
                            })}
                            {tree.RootFolder.Files.map(file => {
                                return <tr>
                                    <td><Glyphicon glyph="file" /></td>
                                    <td>
                                        <span
                                        onClick={() => sendCommandToDefault("downloadFile", file.Path)} 
                                        style={{cursor: "pointer"}}>
                                            {lastPathSegment(file.Path)}
                                        </span>
                                    </td>
                                    <td>{bytesToSize(file.FileSize)}</td>
                                </tr>
                            })}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    }
}

export function FilePage(props: any) {
    return <div className="file-page">
        <FileList />
    </div>
}