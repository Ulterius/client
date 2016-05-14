import React = require("react")
import {EntryBox, Dropdown, Bar} from "./"
import {Button, ButtonGroup, ButtonToolbar, Table, Glyphicon, Input, ListGroup, ListGroupItem} from "react-bootstrap"
import {FileSystemState, fileSystemStore, isLoaded} from "../store"
import {fileSystemActions, messageActions} from "../action"
import {bytesToSize, lastPathSegment, downloadFile, downloadBlobURL, byteArraysToBlobURL} from "../util"
import {sendCommandToDefault, sendCommandAsync} from "../socket"
import {AutoAffix} from "react-overlays"
//import {api} from "../api"
import {fsApi} from "../api-layer"

interface fsComponentState extends FileSystemState {
    width?: number
}

export class FileList extends React.Component<{}, FileSystemState> {
    box: EntryBox
    upload: any
    fileDownloading: string = ""
    fileList: HTMLDivElement
    headerBar: HTMLDivElement
    componentDidMount() {
        this.updateState(fileSystemStore.getState())
        fileSystemStore.listen(this.updateState)
        window.addEventListener("resize", this.onResize)
        this.onResize()
    }
    componentWillUnmount() {
        fileSystemStore.unlisten(this.updateState)
        window.removeEventListener("resize", this.onResize)
    }
    componentDidUpdate() {
        //all life is pain, you know
        if (this.fileList && this.headerBar) {
            this.headerBar.style.width = this.fileList.getBoundingClientRect().width + "px"
        }
    }
    onResize = () => {
        this.setState({}) //force a redraw of this component
    }
    updateState = (state: FileSystemState) => {
        this.setState(state)
        if (this.box) {
            this.box.setState({customized: false})
        }
        _.forOwn(state.downloads.complete, (v: FileTransfer.Complete, k) => {
            downloadBlobURL(byteArraysToBlobURL([v.data]), lastPathSegment(v.path))
            fsApi.removeFile(lastPathSegment(v.path))
        })
    }
    openFolder = (path: string) => {
        fsApi.createFileTree(path)
    }
    goBack = () => {
        if (this.state.pathStack.length > 1) {
            fileSystemActions.goBack()
            //this.openFolder(this.state.pathStack[0].RootFolder.Name)
        }
    }
    refresh = (path: string) => {
        fsApi.reloadFileTree(path)
        //sendCommandAsync("createFileTree", path, fileSystemActions.reloadFileTree)
    }
    handleUpload = (e) => {
        let reader = new FileReader()
        
        reader.onload = ee => {
            messageActions.message({style: "success", text: "File upload started."})
            fsApi.uploadFile(
                this.state.tree.RootFolder.Name + "\\" + readerAny.name,
                (ee.target as any).result as ArrayBuffer
            )
            /*
            sendCommandToDefault("uploadFile", [
                this.state.tree.RootFolder.Name + "\\" + readerAny.name,
                [].slice.call(new Int8Array((ee.target as any).result))
            ])
            */
        }
        reader.onerror = function (e) {
            console.error(e);
		}
        console.log(e.target.files)
        let readerAny = (reader as any)
        readerAny.name = e.target.files[0].name
        reader.readAsArrayBuffer(e.target.files[0])
    }
    download = (path: string) => {
        fsApi.requestFile(path)
    }
    render() {
        if (!this.state || !this.state.tree) {
            console.log(this.state)
            return <div className="row">
                <div className="col-xs-12" ref="fileList">
                    loading files...
                </div>
            </div>
        }
            
        let {tree} = this.state
        return <div>
            <input ref={ref => this.upload = ref} className="upload" type="file" onChange={this.handleUpload}/>
                <div className="row" ref={ref => this.headerBar = ref} style={{position: "fixed", zIndex: 2}}>
                    <div className="col-xs-12">
                    <div style={{width: 200, float: "left"}}>
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
                            <ButtonGroup>
                                <Button bsStyle="primary" onClick={() => this.refresh(this.state.tree.RootFolder.Name)}>
                                    <Glyphicon glyph="refresh" />
                                </Button>
                            </ButtonGroup>
                        </ButtonGroup>
                        </ButtonToolbar>
                    </div>
                    <div style={{marginLeft: 220}}>
                        <EntryBox 
                        ref={box => this.box = box}
                        onConfirmation={this.openFolder}
                        defaultValue={tree.RootFolder.Name}
                        glyph="chevron-right" />
                    </div>
                </div>
                </div>
            <div className="row">
                <div className="col-xs-12" style={{marginTop: 50}} ref={ref => this.fileList = ref}>
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
                                return <tr key={folder.Name}>
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
                                return <tr key={file.Path}>
                                    <td><Glyphicon glyph="file" /></td>
                                    <td>
                                        <Dropdown text={lastPathSegment(file.Path)} dropStyle={{width: 150}}>
                                            <ListGroup>
                                                <ListGroupItem onClick={() => this.download(file.Path)}><Glyphicon glyph="download"/> &nbsp; Download</ListGroupItem>
                                            </ListGroup>
                                        </Dropdown>
                                        {_.map(this.state.downloads.inProgress, (v, k) => {
                                            if (v && k == file.Path) {
                                                return <Bar value={Number(((v.downloaded/v.total) * 100).toFixed(0))}/>
                                            }
                                        })}
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