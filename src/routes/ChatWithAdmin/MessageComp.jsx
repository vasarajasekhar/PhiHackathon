import React from "react";
import {doc, query, onSnapshot} from "firebase/firestore";

import {db} from "../../firebase/firestore";

function MessageComp(props) {
    const [senderData, setSenderData] = React.useState({});
    // const [audioURL, setAudioURL] = React.useState("");
    let uid;
    const ref = React.useRef();

    React.useEffect(() => {
      //  ref.current?.scrollIntoView({ behavior: "smooth" });
        const q = query(doc(db, "atlUsers", props.senderUID));
        onSnapshot(q, (snapshot) => {
            setSenderData(snapshot.data());
        });
    }, []);


    if (localStorage.auth != null) {
        let decodedAuth = atob(localStorage.auth);

        let split = decodedAuth.split("-");

        uid = split[0];
    }

    return (
        <div className={(props.senderUID !== uid)?"receivedMessageContainer":"sentMessageContainer"}>
            <div className={(props.senderUID === uid)?"messageBox sent":"messageBox received"} style={{display: "block"}}>
                {(props.senderUID !== uid)?<div className="name" style={{display: "block", textAlign: "left", fontSize: "1.2rem", color: "#fff"}}>{senderData.name}</div>:undefined}
                <div className="content" style={{display: "block", textAlign: "left"}}>
                    {(props.content === "image/png" ||  props.content === "image/jpg" || props.content === "image/jpeg")
                        ?(<img src={props.fileURL} alt="" style={{maxHeight: "50vh"}} />)
                        :((props.content.replace("application/") !== props.content || props.content.replace("text/") !== props.content)
                            ?(<a href={props.fileURL} rel="noreffer">{props.fileName}</a>):
                            ((props.content === "audio/mpeg") ? (<audio src={props.fileURL} controls={true} />) : ((props.content === "video/mp4")?
                                (<video src={props.fileURL} style={{maxHeight: "45vh"}} controls={true}></video>):(props.content))))}
                </div>
            </div>
            <span ref={ref}></span>
        </div>
    );
}

export default MessageComp;
