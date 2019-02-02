import React, {Component} from 'react';
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Fab from "@material-ui/core/Fab";
import CloudUploadIcon from "../../node_modules/@material-ui/icons/CloudUpload";
import UpdateIcon from "../../node_modules/@material-ui/icons/Update";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import {DialogContent, DialogContentText} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";


export default class Tool extends Component{

    constructor(props) {
        super(props);

        this.state = {
            file: '',
            logs: [],
            aResult: null,
            worker: null,
            isWorkerLoaded: false,
            imgResultList: []
        };
        this.selectFile = this.selectFile.bind(this);
        this.convertToMp4 = this.convertToMp4.bind(this);
        this.convertToScreenShots = this.convertToScreenShots.bind(this);
        this.speedUp = this.speedUp.bind(this);
        this.slowDown = this.slowDown.bind(this);
    }

    selectFile(event) {
        let file = event.target.files[0];
        this.setState({
            file: file,
            logs: this.state.logs,
            aResult: this.state.aResult,
            worker: this.state.worker,
            isWorkerLoaded: this.state.isWorkerLoaded,
            imgResultList: this.state.imgResultList
        });
    }

    cleanUp() {
        this.setState({
            file: this.state.file,
            logs: [],
            aResult: null,
            worker: this.state.worker,
            isWorkerLoaded: this.state.isWorkerLoaded,
            imgResultList: []
        });
    }

    checkFile() {
        let file = this.state.file;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            if (!file.name.match(/\.(asx|asf|mpg|wmv|3gp|mp4|mov|avi|flv)$/)) {
                alert('File type is not correct');
                return false;
            }
        } else {
            alert('The File APIs are not fully supported in this browser');
            return false;
        }
        return true;
    }

    parseArguments(text) {
        text = text.replace(/\s+/g, ' ');
        let args = [];
        // Allow double quotes to not split args.
        text.split('"').forEach(function(t, i) {
            t = t.trim();
            if ((i % 2) === 1) {
                args.push(t);
            } else {
                args = args.concat(t.split(" "));
            }
        });
        return args;
    }

    runCommand(cmd, fileName, fileData) {
        document.getElementById("imgLoader").style.visibility = "visible";
        let args = this.parseArguments(cmd);
        console.log(args);
        let worker = this.state.worker;
        worker.postMessage({
            type: "command",
            arguments: args,
            files:[
                {
                    name: fileName,
                    data: fileData
                }
            ]
        })
    }

    convertToMp4() {
        if(this.checkFile()) {
            let reader = new FileReader();
            reader.onload = (e) => {
                let arrayBuffer = e.target.result;
                let array =new Uint8Array(arrayBuffer);
                let file = this.state.file;
                let cmd = "-i " + file.name + " -vf showinfo -strict -2 output.mp4";
                this.runCommand(cmd, file.name, array);
            };
            reader.readAsArrayBuffer(this.state.file);
        }
    }

    convertToScreenShots() {
        if(this.checkFile()) {
            let reader = new FileReader();
            reader.onload = (e) => {
                let arrayBuffer = e.target.result;
                let array =new Uint8Array(arrayBuffer);
                let file = this.state.file;
                let cmd = "-i " + file.name + " -s 100x100 -f image2 -vf fps=fps=1,showinfo -an out%d.jpeg";
                this.runCommand(cmd, file.name, array);
            };
            reader.readAsArrayBuffer(this.state.file);
        }
    }

    convertToGif() {
        if(this.checkFile()) {
            let reader = new FileReader();
            reader.onload = (e) => {
                let arrayBuffer = e.target.result;
                let array =new Uint8Array(arrayBuffer);
                let file = this.state.file;
                let span = document.getElementById("gifSpan").value;
                let cmd = "-t " + span + " -i " + file.name + " -vf showinfo -strict -2 output.gif";
                this.runCommand(cmd, file.name, array);
            };
            reader.readAsArrayBuffer(this.state.file);
        }
    }

    speedUp() {
        if(this.checkFile()) {
            let reader = new FileReader();
            reader.onload = (e) => {
                let arrayBuffer = e.target.result;
                let array =new Uint8Array(arrayBuffer);
                let file = this.state.file;
                let cmd = "-i " + file.name + " -an -r 60 -filter:v \"setpts=2.0*PTS\" output.mp4";
                this.runCommand(cmd, file.name, array);
            };
            reader.readAsArrayBuffer(this.state.file);
        }
    }

    slowDown() {
        if(this.checkFile()) {
            let reader = new FileReader();
            reader.onload = (e) => {
                let arrayBuffer = e.target.result;
                let array =new Uint8Array(arrayBuffer);
                let file = this.state.file;
                let cmd = "-i " + file.name + " -an -filter:v \"setpts=0.5*PTS\" output.mp4";
                this.runCommand(cmd, file.name, array);
            };
            reader.readAsArrayBuffer(this.state.file);
        }
    }

    componentDidMount() {
        let worker = new Worker('/worker-asm.js');
        worker.onmessage = (e) => {
            let message = e.data;
            if (message.type === "ready") {
                this.setState({
                    file: this.state.file,
                    logs: this.state.logs,
                    aResult: this.state.aResult,
                    worker: worker,
                    isWorkerLoaded: true,
                    imgResultList: this.state.imgResultList
                });
                worker.postMessage({
                    type: "command",
                    arguments: ["-help"]
                });
            } else if (message.type === "stdout") {
                let logs = this.state.logs;
                logs.push(message.data);
                this.setState({
                    file: this.state.file,
                    logs: logs,
                    aResult: this.state.aResult,
                    worker: this.state.worker,
                    isWorkerLoaded: true,
                    imgResultList: this.state.imgResultList
                });
            } else if (message.type === "start") {
                let logs = this.state.logs;
                logs.push("Worker has received command");
                this.setState({
                    file: this.state.file,
                    logs: logs,
                    aResult: this.state.aResult,
                    worker: this.state.worker,
                    isWorkerLoaded: true,
                    imgResultList: this.state.imgResultList
                });
            } else if (message.type === "done") {
                document.getElementById("imgLoader").style.visibility = "hidden";
                let buffers = message.data;
                if (buffers.length) {
                    // to do ...
                }
                buffers.forEach((file) => {
                    if (file.name.match(/\.jpeg|\.gif|\.jpg|\.png/)) {
                        let blob = new Blob([file.data]);
                        let src = window.URL.createObjectURL(blob);
                        let img = document.createElement('img');
                        img.src =src;
                        let imgResultList = this.state.imgResultList;
                        imgResultList.push(img);
                        this.setState({
                            file: this.state.file,
                            logs: this.state.logs,
                            aResult: this.state.aResult,
                            worker: this.state.worker,
                            isWorkerLoaded: true,
                            imgResultList: imgResultList
                        })
                    } else {
                        let a = document.createElement('a');
                        a.download = file.name;
                        let blob = new Blob([file.data]);
                        a.href = window.URL.createObjectURL(blob);
                        a.textContent = 'Click here to download ' + file.name + "!";
                        this.setState({
                            file: this.state.file,
                            logs: this.state.logs,
                            aResult: a,
                            worker: this.state.worker,
                            isWorkerLoaded: true,
                            imgResultList: this.state.imgResultList
                        })
                    }
                });
            }
        };
    }

    render() {
        const styles = theme => ({
            paper: {
                display: 'flex',
                padding: '16px 24px 24px 24px',
                alignItems: 'center',
                flexDirection: 'column'
            },
            list: {
                width: '100%',
                maxWidth: 400
            },
            fab: {
                margin: '16px'
            },
            icon: {
                marginRight: '16px'
            }
        });

        return (
                <Paper className={styles.paper}>
                    <List className={styles.list}>
                        <ListItem>
                            <Fab variant="extended" color="secondary" aria-label="upload large" className={styles.fab} onClick={() => {document.getElementById('fileUploader').click()}}>
                                <CloudUploadIcon />
                            </Fab>
                        </ListItem>
                        <ListItem>
                            <Typography variant="subtitle1">{ this.state.file.name == null ? '' : this.state.file.name}</Typography>
                            <img id="imgLoader" src="../style/img/load.gif" style={{visibility: "hidden"}} />
                            <input id="fileUploader" type="file" hidden="hidden" onChange={e => this.selectFile(e)} />
                        </ListItem>
                        <ListItem>
                            <Fab variant="extended" aria-label="To MP4" className={styles.fab} onClick={() => this.convertToMp4()}>
                                <UpdateIcon className={styles.icon} />
                                To MP4
                            </Fab>
                        </ListItem>
                        <ListItem>
                            <Fab variant="extended" aria-label="To MP4" className={styles.fab} onClick={() => this.convertToGif()}>
                                <UpdateIcon className={styles.icon} />
                                To GIF
                            </Fab>
                            <TextField
                                id="gifSpan"
                                label="Seconds"
                                style={{marginLeft: '16px', marginRight: '16px'}}
                                onChange={() => {}}
                                margin="normal"
                                variant="outlined"
                            />
                        </ListItem>
                        <ListItem>
                            <Fab variant="extended" aria-label="To Screenshots" className={styles.fab} onClick={() => this.convertToScreenShots()}>
                                <UpdateIcon className={styles.icon} />
                                To Screenshots
                            </Fab>
                        </ListItem>
                        <ListItem>
                            <Fab variant="extended" aria-label="Speed Up" className={styles.fab} onClick={() => this.speedUp()}>
                                <UpdateIcon className={styles.icon} />
                                Speed * 2
                            </Fab>
                        </ListItem>
                        <ListItem>
                            <Fab variant="extended" aria-label="Slow Down" className={styles.fab} onClick={() => this.slowDown()}>
                                <UpdateIcon className={styles.icon} />
                                Speed / 2
                            </Fab>
                        </ListItem>
                        <ListItem>
                            <Fab variant="extended" aria-label="Slow Down" className={styles.fab} onClick={() => this.cleanUp()}>
                                <UpdateIcon className={styles.icon} />
                                Clear Log
                            </Fab>
                        </ListItem>
                        <ListItem>
                            {this.state.aResult != null &&
                                <div ref={(nodeElement) => {
                                    nodeElement.appendChild(this.state.aResult)
                                }}/>
                            }
                        </ListItem>
                        <ListItem>
                            <Grid container spacing={24}
                                  alignItems="center"
                                  direction="row"
                                  justify="center">
                                {this.state.imgResultList.map(imgResult => {
                                    console.log(imgResult.src);
                                    if (imgResult && imgResult.src){
                                        return (
                                            <Grid item>
                                                <img src={imgResult.src} />
                                            </Grid>
                                        )
                                    }
                                    return '';
                                })
                                }
                            </Grid>
                        </ListItem>
                        <ListItem>
                            <List>
                                { this.state.logs.map(log => {
                                        return (
                                            <ListItem>
                                                { log }
                                            </ListItem>
                                        )
                                    })
                                }
                            </List>
                        </ListItem>
                    </List>
                    <Dialog
                    open={!this.state.isWorkerLoaded}
                    keepMounted
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                    >
                    <DialogTitle id="alert-dialog-slide-title">{"Loading Worker File..."}</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                    <img id="imgLoader" src="../style/img/load.gif" style={{visibility: "hidden"}} />
                    </DialogContentText>
                    </DialogContent>
                    </Dialog>
                </Paper>
        );
    };
}

