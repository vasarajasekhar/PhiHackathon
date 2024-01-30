import React from "react";
import {useParams} from "react-router-dom";
import {doc, onSnapshot, query, setDoc} from "firebase/firestore";

import MessageComp from "./MessageComp";
import {db} from "../../firebase/firestore";
import Sidebar from "../../components/Sidebar";

function AdminIndividualChat() {
    const { userId } = useParams();

    const [message, setMessage] = React.useState("");
    const [data, setData] = React.useState([]);
    const [user, setUser] = React.useState("a user");

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

    React.useEffect(() => {
        const q = query(doc(db, "chatWithAdmin", userId));

        onSnapshot(q, snapshot => {
            const dataArray = [];
            snapshot.data().messages.forEach(message => {
                dataArray.push(message);
                setData(dataArray);
            });
        });

        const q2 = query(doc(db, "atlUsers", userId));

        onSnapshot(q2, snap => {
            setUser(snap.data().name);
        });
    }, [userId]);

    async function handleSend() {
        if(message !== "") {
            const dataArray = data;
            dataArray.push({
                senderUID: uid,
                content: message
            });
            console.log(dataArray);
            setMessage("");
            await setDoc(doc(db, "chatWithAdmin", userId), {
                messages: dataArray
            });
            setData(dataArray);
        } else {
            alert("Please type a message");
        }
    }

    document.title = "Chat with Admin | Digital ATL";

    return (
        <div className="container">
            <Sidebar />
            <link rel="stylesheet" href="/CSS/form.css"/>
            <div style={{height: "10vh"}}>
                <h1 className="title">Chat With Admin | Digital ATL</h1>
                <p style={{fontSize: "1rem"}}>You are currently chatting with {user}</p>
                <hr/>
            </div>
            <div className="messagesContainer" style={{ height: "73vh", overflow: "auto"}}>
                {
                    data.map((message, index) => {
                        return <MessageComp id={index} key={index} senderUID={message.senderUID} content={message.content} />
                    })
                }
            </div>
            <div className="messageInputsContainer" style={{
                width: "93%",
                display: "flex"
            }}>
                <input type="text" name="messageValue" id="messageValue" placeholder="Type your message" onChange={handleChange} value={message} style={{
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
        </div>
    );
}

export default AdminIndividualChat;
