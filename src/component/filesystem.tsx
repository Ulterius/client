import React = require("react")
import {EntryBox, Dropdown, Bar, Spinner} from "./"
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

function UploadList({uploads}: {uploads: {[key: string]: FileTransfer.UploadProgress}}) {
    if (!uploads || _.size(uploads) === 0) {
        return <div />
    }
    return <div className="uploads">
        <div className="header">uploads</div>
        {_.map(uploads, (upload, path) => {
            let {uploaded, total} = upload
            return <div className="bar-container">
                {lastPathSegment(path)}{uploaded >= total ? ": Complete!" : ""}<br />
                <Bar value={Number(((uploaded/total)*100).toFixed(0))}/>
            </div>
        })}
    </div>
}

export class FileList extends React.Component<{}, FileSystemState & {
    searchQuery?: string,
    searchResultCount?: number,
    searching?: boolean
}> {
    box: EntryBox
    upload: any
    fileDownloading: string = ""
    fileList: HTMLDivElement
    headerBar: HTMLDivElement
    lastComplete: string = ""
    constructor(props, context) {
        super(props, context)
        this.state = {
            searchQuery: "",
            searchResultCount: 200,
            searching: false
        }
    }
    componentDidMount() {
        fsApi.createFileTree("")
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
            this.headerBar.style.width = this.fileList.getBoundingClientRect().width-30 + "px"
        }
    }
    onResize = () => {
        this.setState({}) //force a redraw of this component
    }
    updateState = (state: FileSystemState) => {
        this.setState(state)
        if (state.searchResult) {
            this.setState({searching: false})
        }
        if (this.box) {
            this.box.setState({customized: false})
        }
        
        let v = state.downloads.complete
        if (v) {
            if (this.lastComplete != v.path) {
                downloadBlobURL(byteArraysToBlobURL([v.data]), lastPathSegment(v.path))
                fsApi.removeFile(lastPathSegment(v.path))
                setTimeout(() => fileSystemActions.removeDownload(v.path), 0)
                this.lastComplete = v.path
            }
        }
        else {
            this.lastComplete = ""
        }
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
    getFileList() {
        let {tree} = this.state
        return [
            tree.RootFolder.ChildFolders.map(folder => {
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
            }),
            tree.RootFolder.Files.map(file => {
                return <tr key={file.Path}>
                    <td width="16"><Glyphicon glyph="file"/></td>
                    <td>
                        <Dropdown text={lastPathSegment(file.Path)} dropStyle={{width: 150}}>
                            <ListGroup>
                                <ListGroupItem onClick={() => this.download(file.Path)}><Glyphicon glyph="download"/> &nbsp; Download</ListGroupItem>
                            </ListGroup>
                        </Dropdown>
                        {_.map(this.state.downloads.inProgress, (v, k) => {
                            if (v && k == file.Path) {
                                return <Bar value={
                                    Number(((v.downloaded/v.total) * 100)
                                    .toFixed(0))
                                }/>
                            }
                        })}
                    </td>
                    <td>{bytesToSize(file.FileSize)}</td>
                </tr>
            })
        ]
    }
    getSearchList() {
        let {searchResult, searchResultCount} = this.state
        if(!searchResult.success) {
            let details = ""
            if (searchResult.message.indexOf("scanning") !== -1) {
                details = "Try again in a minute."
            }
            return [
                <tr>
                    <td>Search failed: {searchResult.message}</td>
                </tr>,
                <tr>
                    <td>{details}</td>
                </tr>
            ]
        }
        return searchResult.searchResults.slice(0, searchResultCount).map(result => {
            return <tr key={result}>
                <td width="16"><Glyphicon glyph="file"/></td>
                <td>
                    <Dropdown text={lastPathSegment(result)} dropStyle={{width: 150}}>
                        <ListGroup>
                            <ListGroupItem onClick={() => this.download(result)}>
                                <Glyphicon glyph="download"/> &nbsp; Download
                            </ListGroupItem>
                        </ListGroup>
                    </Dropdown>
                    <span className="small-grey-text">{result}</span>
                </td>
            </tr>
        })
    }
    outerTable() {
        return <Table>
            <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Size</th>
                </tr>
            </thead>
            <tbody>
                {this.state.searchResult ? this.getSearchList() : this.getFileList()}
            </tbody>
        </Table>
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
        let {tree, uploads} = this.state
        return <div className="ulterius-panel">
            <input ref={ref => this.upload = ref} className="upload" type="file" onChange={this.handleUpload}/>
            <div className="fixed-toolbar" ref={ref => this.headerBar = ref}>
                <div className="toolbar-button merge-right" onClick={fileSystemActions.goBack}>
                    <Glyphicon glyph="arrow-left" />
                </div>
                <div className="toolbar-button" onClick={fileSystemActions.goForward}>
                    <Glyphicon glyph="arrow-right" />
                </div>
                <div className="toolbar-button-bare" onClick={() => this.upload.click()}>
                    <Glyphicon glyph="export" />
                </div>
                <div className="toolbar-button-bare" onClick={() => 
                    this.refresh(this.state.tree.RootFolder.Name)
                }>
                    <Glyphicon glyph="refresh" />
                </div>
                <div className="file-bar">
                    <EntryBox 
                        ref={box => this.box = box}
                        onConfirmation={this.openFolder}
                        defaultValue={tree.RootFolder.Name}
                        buttonText="go" 
                    />
                </div>
                <div className="search-bar">
                    <EntryBox onConfirmation={(text) => {
                        if (text == "") {
                            fileSystemActions.clearSearch()
                            this.setState({searching: false})
                        }
                        else {
                            fsApi.search(text)
                            this.setState({searching: true})
                        }
                    }}
                    onEscape={() => {
                        fileSystemActions.clearSearch()
                        this.setState({searching: false})
                    }} placeholder="Search..." glyph="search" />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12" style={{marginTop: 70}} ref={ref => this.fileList = ref}>
                    {this.state.searching ? <Spinner dark/> : this.outerTable()}
                    <div style={{textAlign: "center", marginBottom: 30}}>
                        {this.state.searchResult ? <Button bsStyle="link" onClick={() => {
                        this.setState({searchResultCount: this.state.searchResultCount + 200})
                    }}>Load more...</Button> : null}
                    </div>  
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