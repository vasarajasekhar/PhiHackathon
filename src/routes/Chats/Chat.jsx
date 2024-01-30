import React from "react";
import {useParams} from "react-router-dom";
import {query, doc, onSnapshot, setDoc, collection, getDoc, arrayUnion} from "firebase/firestore";
import {ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import {Bars} from "react-loader-spinner";
import { ReactMic } from "react-mic";

import {db} from "../../firebase/firestore";
import storage from "../../firebase/storage";
import MessageComp from "../ChatWithAdmin/MessageComp";
import Popup from "../../components/Popup";
import Sidebar from "../../components/Sidebar";

function Chat() {
    const {groupId} = useParams();

    const [popupEnabled, setPopupEnabled] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [data, setData] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [groupName, setGroupName] = React.useState("");
    const [allowedUsers, setAllowedUsers] = React.useState([]);
    const [fileUpload, setFilesUpload] = React.useState(null);
    const [loadingTrigger, setLoadingTrigger] = React.useState(false);
    const [isRecording, setIsRecording] = React.useState(false);
    const [blobURL, setBlobURL] = React.useState(null);
    // const [recording, setRecording] = React.useState(false);
    // const [audioURLState, setAudioURLState] = React.useState(null);
    // let mediaRecorder;

    function handleChange(event) {
        if(event.target.name === "messageValue") {
            setMessage(event.target.value);
        }
    }

    let uid;

    if (localStorage.auth != null) {
        let decodedAuth = atob(localStorage.auth);

        let split = decodedAuth.split("-");

        uid = split[0];
    }

    async function handleSend() {
        if(fileUpload !== null) {
            setLoadingTrigger(true);
            const fileToBeUploaded = fileUpload['0'];
            const uploadingFileName = fileToBeUploaded.name.split(".")[0]+Date.now()+"."+fileToBeUploaded.name.split(".")[1];
            const contentType = fileUpload['0'].type;
            const fileRef = ref(storage, `groups/${groupId}/${uploadingFileName}`);
            await uploadBytesResumable(fileRef, fileUpload['0']);
            await getDownloadURL(fileRef).then(async (url) => {
                const dataArray = [...data];
                dataArray.push({
                    senderRef: doc(db, "atlUsers", uid),
                    content: contentType,
                    fileName: uploadingFileName,
                    fileURL: url
                });
                setMessage("");
                await setDoc(doc(db, "chats", groupId), {
                    messages: dataArray
                }, {merge: true});
                setData(dataArray);
            });
            document.querySelector("#file").value = "";
            setFilesUpload(null);
            setLoadingTrigger(false);
        } else if(message !== "") {
            const dataArray = [...data];
            dataArray.push({
                senderRef: doc(db, "atlUsers", uid),
                content: message
            });
            setMessage("");
            await setDoc(doc(db, "chats", groupId), {
                messages: dataArray
            }, {merge: true});
            setData(dataArray);
        } else {
            alert("Please type a message");
        }
    }

    async function handleAddToGroup() {
        if(!allowedUsers.includes(document.querySelector("#user").value)) {
            const docRef = doc(db, "chats", groupId);
            const usersRefs = [];
            allowedUsers.forEach(allowedUser => {
                usersRefs.push(doc(db, "atlUsers", allowedUser));
            });
            usersRefs.push(doc(db, "atlUsers", document.querySelector("#user").value));

            await setDoc(docRef, {
                users: [...usersRefs]
            }, {merge: true});

            const userRef = doc(db, "atlUsers", document.querySelector("#user").value);
            const userSnap = await getDoc(userRef);
            let chats;
            if(userSnap.data().chats === null || userSnap.data().chats === undefined) {
                chats = [];
                chats.push({groupName: groupName, ref: doc(db, "chats", groupId)});
            } else{
                chats = userSnap.data().chats;
                chats.push({groupName: groupName, ref: doc(db, "chats", groupId)});
            }
            await setDoc(userRef, {
                chats: chats
            }, {merge: true});

            alert("Added user to chat group");
            setPopupEnabled(false);
        } else {
            alert("User is already in the chat group");
        }
    }

    function openPopUp() {
        setPopupEnabled(true);
    }

    function handleSelectFiles(event) {
        setFilesUpload(event.target.files);
    }

    async function onRecordingComplete(recordedBlob) {
        setBlobURL(recordedBlob.blob);
        setLoadingTrigger(true);
        const uploadingFileName = Date.now()+".mp3";
        const fileRef = ref(storage, `groups/${groupId}/voice-messages/${uploadingFileName}`);
        await uploadBytesResumable(fileRef, recordedBlob.blob);
        await getDownloadURL(fileRef).then(async (url) => {
            const dataArray = [...window.data];
            dataArray.push({
                senderRef: doc(db, "atlUsers", uid),
                content: "audio/mpeg",
                fileName: uploadingFileName,
                fileURL: url
            });
            setMessage("");
            await setDoc(doc(db, "chats", groupId), {
                messages: dataArray
            }, {merge: true});
            setMessage("");
            await setDoc(doc(db, "chats", groupId), {
                messages: dataArray
            }, {merge: true});
            setLoadingTrigger(false);
            setData(dataArray);
        });
    }

    window.data = data;

    function handleRecordReq() {
        if(isRecording) {
            setIsRecording(false);
        } else {
            setIsRecording(true);
        }
    }

    document.title = "Group Chat | Digital ATL";

    React.useEffect(() => {
        const q = query(doc(db, "chats", groupId));

        onSnapshot(q, snapshot => {
            if(!snapshot.exists()) {
                window.location.href = "/chats";
            }
            const dataArray = [];

            const tempAllowedUsers = [];
            snapshot.data().users.forEach(user => {
                tempAllowedUsers.push(user.path.replace("atlUsers/", ""));
            });

            setAllowedUsers(tempAllowedUsers);

            if(!tempAllowedUsers.includes(uid)) {
                window.location.href = "/chats";
            } else {
                setGroupName(snapshot.data().groupName);
                snapshot.data().messages.forEach(message => {
                    dataArray.push(message);
                    setData(dataArray);
                });
            }
        });
        
        const usersQuery = query(collection(db, "atlUsers"));

        onSnapshot(usersQuery, (snapshots) => {
            const usersData = [];
            snapshots.forEach(snap => {
                const tempData = snap.data();
                tempData.uid = snap.id;
                usersData.push(tempData);
            });
            setUsers(usersData);
        });
    }, [groupId, uid]);

    return (
        <div className="container">
            <Sidebar />
            <link rel="stylesheet" href="/CSS/form.css"/>
            <link rel="stylesheet" href="/CSS/report.css"/>
            <Popup trigger={popupEnabled} setPopupEnabled={setPopupEnabled} closeAllowed={true}>
                <h1 style={{display: "inline-block"}}>User: </h1>
                <select name="user" id="user">
                    {
                        users.map((user, index) => {
                            return <option key={index} value={user.uid}>{user.name}</option>
                        })
                    }
                </select>
                <br/>
                <button className="submitbutton" onClick={handleAddToGroup}>Add to chat group</button>
            </Popup>
            <Popup trigger={loadingTrigger} setPopupEnabled={setLoadingTrigger} closeAllowed={false}>
                {<Bars
                    height="80"
                    width="80"
                    radius="9"
                    color="black"
                    ariaLabel="loading"
                    wrapperStyle
                    wrapperClass
                />}
            </Popup>
            <div style={{height: "10vh"}}>
                <h1 className="title">Chat {groupName} | Digital ATL</h1>
                <hr/>
                <button className="resetbutton" style={{position: "fixed", top: "0", right: "1.5rem"}} onClick={openPopUp}><i className="fa-solid fa-user-plus"></i></button>
            </div>
            <div className="messagesContainer" style={{ height: "73vh", overflow: "auto"}}>
                {
                    data.map((message, index) => {
                        return <MessageComp id={index} key={index} fileName={message.fileName} fileURL={message.fileURL} senderUID={message.senderRef.path.replace("atlUsers/", "")} content={message.content} />
                    })
                }
            </div>
            <div className="messageInputsContainer" style={{
                width: "93%",
                display: "flex"
            }}>
                <label htmlFor="file" className="resetbutton" style={{cursor: "pointer", position: "relative", bottom: "0.4rem"}}><i className="fa-solid fa-upload"></i></label>
                <input type="file" name="file" id="file" className="resetbutton" accept=".pdf, .mp3, .mp4, .jpg, .jpeg" onChange={handleSelectFiles} style={{
                    display: "none"
                }} />
                <div className="micContainer" style={{display: "none"}}>
                    <ReactMic
                        record={isRecording}
                        onStop={onRecordingComplete}
                        strokeColor="#000"
                        backgroundColor="#fff"
                        mimeType="audio/mpeg"
                    />
                </div>
                {(isRecording)?(<button className="resetbutton" onClick={handleRecordReq} style={{position: "relative", bottom: "7px", left: "5px"}}><i className="fa-solid fa-microphone-slash"></i></button>):(<button className="submitbutton" onClick={handleRecordReq} style={{position: "relative", bottom: "7px", left: "5px"}}><i className="fa-solid fa-microphone"></i></button>)}
                <input type="text" name="messageValue" id="messageValue" placeholder="Type your message" autoComplete="off" onChange={handleChange} value={message} style={{
                    padding: "0.3rem",
                    fontSize: "1.2rem",
                    width: "95%",
                    border: "3px solid rgb(94, 94, 94)",
                    borderRadius: "10px",
                    outline: "none",
                    textAlign: "left",
                    transition: "0.3s",
                    margin: "0.5rem",
                }} />
                <button className="submitbutton" onClick={handleSend} style={{
                    position: "relative",
                    bottom: "0.5rem",
                    display: "flex",
                }}><i className="fa-solid fa-paper-plane" style={{marginRight: "10px"}}></i> Send</button>
            </div>
            <div style={{fontSize: "1rem"}}>{(fileUpload !== null) ? (fileUpload['0'].name+" file is selected") : ("No file is selected")}</div>
        </div>
    );
}

export default Chat;
