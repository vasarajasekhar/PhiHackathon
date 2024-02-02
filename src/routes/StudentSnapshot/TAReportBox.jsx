import React from "react";
import Popup from "../../components/Popup";
import {arrayUnion, doc, setDoc} from "firebase/firestore";
import db, {deleteAssignedTA} from "../../firebase/firestore";
import DateViewer from "../../components/DateViewer";
import {Bars} from "react-loader-spinner";
import taApiRequest from "../../firebase/aiTa";

function ReportBox(props) {
    const [displayValue, setDisplayValue] = React.useState("none");

    const [status, setStatus] = React.useState(props.status[props.status.length-1]);
    const [popupOpen, setPopupOpen] = React.useState(false);
    const [loadingTrigger, setLoadingTrigger] = React.useState(false);

    async function modifyStatus(event) {
        const docRef = doc(db, "studentData", props.studentId, "taData", props.taID);
        const d = new Date();
        const currentDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        await setDoc(docRef, {
            status: arrayUnion({status: status, modifiedAt: currentDate})
        }, {merge: true});
        alert("Modified");
        setPopupOpen(false);
    }

    async function aiTa() {
        setLoadingTrigger(true);
        await taApiRequest([props.intro, props.taName], props.studentId);
        setLoadingTrigger(false);
    }

    function handleMouseOver(event) {
        setDisplayValue("block");
    }

    function handleMouseOut(event) {
        setDisplayValue("none");
    }

    async function handleDelete(event) {
        console.log(props.docId);
        if(window.confirm("You are about to delete a student's assigned Activity")) {
            await deleteAssignedTA(props.studentId, props.docId)
                .then(() => {
                    alert("Student's TA has been deleted.");
                })
                .catch(err => {
                    console.log(err)
                    alert("An error has occurred please try again later.");
                });
        }
    }

    function handleEdit() {
        window.location.href = "/student-data/snapshot/"+props.studentId+"/ta/edit/"+props.taID;
    }

    const role = atob(localStorage.getItem("auth")).split("-")[2];

    return (
        <div className="box" id={props.id} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <link rel="stylesheet" href="/CSS/form.css"/>
            <Popup trigger={loadingTrigger} setPopupEnabled={setLoadingTrigger} closeAllowed={false}>
                <div style={{height: "85%", display: "flex", alignItems: "center", justifyContent: "center"}}>
                    {<Bars
                        height="80"
                        width="80"
                        radius="9"
                        color="black"
                        ariaLabel="loading"
                        wrapperStyle
                        wrapperClass
                    />}
                </div>
            </Popup>
            {
                popupOpen ?
                    <Popup trigger={popupOpen} setPopupEnabled={setPopupOpen} closeAllowed={true}>
                        <h1 className="title">Modify Status</h1>
                        <div className="formContainer">
                            <label htmlFor="status">Status: </label>
                            <select name="status" id="status" onChange={e => setStatus(e.target.value)} value={status}>
                                {
                                    props.status[props.status.length-1] !== "On Hold" ? <option value="On Hold">On Hold</option> : ""
                                }
                                {
                                    props.status[props.status.length-1] !== "Mentor Needed"? <option value="Mentor Needed">Mentor Needed</option> : ""
                                }
                                {
                                    props.status[props.status.length-1] !== "Started Completing"? <option value="Started Completing">Started Completing</option> : ""
                                }
                                {
                                    props.status[props.status.length-1] !== "Ongoing" ? <option value="Ongoing">Ongoing</option> : ""
                                }
                                {
                                    props.status[props.status.length-1] !== "Nearly Completed" ? <option value="Nearly Completed">Nearly Completed</option> : ""
                                }
                                {
                                    props.status[props.status.length-1] !== "In Review" ? <option value="In Review">In Review</option> : ""
                                }
                                {
                                    props.status[props.status.length-1] !== "Review Completed"? <option value="Review Completed">Review Completed</option> : ""
                                }
                                {
                                    props.status[props.status.length-1] !== "TA Completed" ? <option value="TA Completed">TA Completed</option> : ""
                                }
                            </select>
                            <br/>
                            <button className="submitbutton" onClick={modifyStatus}>Modify</button>
                        </div>
                    </Popup> : ""
            }
            <div className="name" style={{fontSize: "1.5rem"}}>{props.taName}</div>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>TA ID:</span> {props.taID}</div>
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Introduction:</span> {props.intro}</div>
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Goals:</span> <br/> {
                props.goals.map((goal, index) => {
                    return <span key={index}>{index+1}. {goal} <br/></span>
                })
            }
            </div>
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Materials:</span> <br/> {
                props.materials.map((material, index) => {
                    return <span key={index}>{index+1}. {material} <br/></span>
                })
            }
            </div>
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Instructions:</span> <br/> {
                props.instructions.map((instruction, index) => {
                    return <span key={index}>{index+1}. {instruction} <br/></span>
                })
            }
            </div>
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Observation:</span> <br/> {
                props.assessment.map((assessment, index) => {
                    return <span key={index}>{index+1}. {assessment} <br/></span>
                })
            }
            </div>
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Tips:</span> <br/> {
                props.tips.map((tip, index) => {
                    return <span key={index}>{index+1}. {tip} <br/></span>
                })
            }
            </div>
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Extensions:</span> <br/> {
                props.extensions.map((extension, index) => {
                    return <span key={index}>{index+1}. {extension} <br/></span>
                })
            }
            </div>
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Resources:</span> <br/> {
                props.resources.map((resource, index) => {
                    return <span key={index}>{index+1}. {resource} <br/></span>
                })
            }
            </div>
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Comments:  </span>{props.comment}</div>
            <br/>
            {props.uploadFile?<div className="boxContainer"><span style={{fontWeight: "600"}}>Upload File: </span><a href={props.uploadFile} target="_blank" rel="noreferrer">Click here to open</a></div>:<div className="boxContainer"><span style={{fontWeight: "600"}}>Upload File: </span>None</div>}
            <br/>
            <div className="boxContainer"><span style={{fontWeight: "600"}}>Status Tracking:</span> <br/> {
                props.status.map((eachStatus, index) => {
                    return <span key={index}>{index+1}. {eachStatus.status} - <DateViewer date={eachStatus.modifiedAt} /> <br/></span>
                })
            }</div>
            <br/>
            <div className="boxContainer">
                <span style={{fontWeight: "600"}}>Current Status:</span> {props.status[props.status.length-1].status} - <DateViewer date={props.status[props.status.length-1].modifiedAt} />
            </div>
            {
                props.status[props.status.length-1] !== "TA Completed" || role === "admin" || role === "atlIncharge" ?
                    <div className="buttonsContainer" id={"btnContainer"+props.id} style={{display: displayValue}}>
                        <button className="resetbutton editBtn" onClick={handleEdit}><i className="fa-solid fa-pencil"></i></button>
                        <button className="submitbutton deleteBtn" onClick={handleDelete}><i className="fa-solid fa-trash-can"></i></button>
                        <button className="submitbutton" onClick={() => {setPopupOpen(true)}}>Modify Status</button>
                        {
                            role === "admin" ? 
                                <button className="submitbutton" onClick={async () => {await aiTa()}}>Generate TA</button> : ""
                        }
                    </div>: ""
            }
        </div>
    );
}

export default ReportBox;