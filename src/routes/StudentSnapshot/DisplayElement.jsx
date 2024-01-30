import React from "react";
import CompetitionsReportBox from "./CompetitionsReportBox";
import CoursesReportBox from "./CoursesReportBox";
import {collection, onSnapshot, query} from "firebase/firestore";
import db, {deleteActivity, deleteCompetition, deleteCourse} from "../../firebase/firestore";
import TAReportBox from "./TAReportBox";

function DisplayElement(props) {
    const [sortBy, setSortBy] = React.useState("latest");
    const [tas, setTAs] = React.useState([]);
    const [competitions, setCompetitions] = React.useState([]);
    const [courses, setCourses] = React.useState([]);
    React.useEffect(() => {
        if(props.type === "competitions") {
            const q = query(collection(db, "studentData", props.studentId, "competitionData"));
            onSnapshot(q, snaps => {
                const temp = [];
                snaps.forEach(snap => {
                    const data1 = snap.data();
                    data1.docId = snap.id;
                    temp.push(data1);
                });

                temp.sort((a, b) => {
                    const aDate = new Date(a.status[0].modifiedAt);
                    const bDate = new Date(b.status[0].modifiedAt);

                    if(sortBy === "latest") {
                        return aDate - bDate;
                    } else {
                        return bDate - aDate;
                    }
                });

                setCompetitions(temp);
            });
        }
    }, [props.type, props.studentId]);

    React.useEffect(() => {
        const temp = [...competitions];

        temp.sort((a, b) => {
            const aDate = new Date(a.status[0].modifiedAt);
            const bDate = new Date(b.status[0].modifiedAt);

            if(sortBy === "latest") {
                return aDate - bDate;
            } else {
                return bDate - aDate;
            }
        });

        setCompetitions(temp);
    }, [sortBy]);

    //Add for courses 11.2
    React.useEffect(() => {
        if(props.type === "courses") {
            const q = query(collection(db, "studentData", props.studentId, "coursesData"));
            onSnapshot(q, snaps => {
                const temp = [];
                snaps.forEach(snap => {
                    const data2 = snap.data();
                    data2.docId = snap.id;
                    temp.push(data2);
                    console.log(temp);
                });
                

                temp.sort((a, b) => {
                    const aDate = new Date(a.status[0].modifiedAt);
                    const bDate = new Date(b.status[0].modifiedAt);

                    if(sortBy === "latest") {
                        return aDate - bDate;
                    } else {
                        return bDate - aDate;
                    }
                });

                setCourses(temp);
            });
        }
    }, [props.type, props.studentId]);

    React.useEffect(() => {
        const temp = [...courses];

        temp.sort((a, b) => {
            const aDate = new Date(a.status[0].modifiedAt);
            const bDate = new Date(b.status[0].modifiedAt);

            if(sortBy === "latest") {
                return aDate - bDate;
            } else {
                return bDate - aDate;
            }
        });

        setCourses(temp);
    }, [sortBy]);

    //courses 11.2

    React.useEffect(() => {
        if(props.type === "tas") {
            const q = query(collection(db, "studentData", props.studentId, "taData"));
            onSnapshot(q, snaps => {
                const temp = [];
                snaps.forEach(snap => {
                    const data = snap.data();
                    data.docId = snap.id;
                    temp.push(data);
                });

                temp.sort((a, b) => {
                    const aDate = new Date(a.status[0].modifiedAt);
                    const bDate = new Date(b.status[0].modifiedAt);

                    if(sortBy === "latest") {
                        return aDate - bDate;
                    } else {
                        return bDate - aDate;
                    }
                });

                setTAs(temp);
            });
        }
    }, [props.type, props.studentId]);

    React.useEffect(() => {
        const temp = [...tas];

        temp.sort((a, b) => {
            const aDate = new Date(a.status[0].modifiedAt);
            const bDate = new Date(b.status[0].modifiedAt);

            if(sortBy === "latest") {
                return aDate - bDate;
            } else {
                return bDate - aDate;
            }
        });

        setTAs(temp);
    }, [sortBy]);

    if(props.type === "competitions") {
        if(competitions !== null && competitions !== undefined) {
            return <div>
            <br/>
            <div className="boxContainer">
                Sort by: <select name="sortBy" id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="latest">Date - Latest</option>
                <option value="oldest">Date - Oldest</option>
            </select>
            </div>
                {competitions.map((competition, index) => {
                    console.log(competition);
                    return (
                        <CompetitionsReportBox
                                    key={index}
                                    id={index}
                                    competition={competition}
                                    docId={competition.docId}
                                    competName={competition.name}
                                    description={competition.description}
                                    organizedBy={competition.organizedBy}
                                    applStartDate={competition.applicationStartDate}
                                    applEndDate={competition.applicationEndDate}
                                    compStartDate={competition.competitionStartDate}
                                    compEndDate={competition.competitionEndDate}
                                    classesFrom ={competition.eligibility.classesFrom}
                                    classesTo={competition.eligibility.classesTo}
                                    atlSchools={competition.eligibility.atlSchools}
                                    nonAtlSchools={competition.eligibility.nonAtlSchools}
                                    individual={competition.eligibility.individual}
                                    team={competition.eligibility.team}
                                    paymentDetails={competition.paymentDetails}
                                    refLink ={competition.refLink}
                                    requirements={competition.requirements}
                                    fileURL={competition.fileURL}
                                    comments={competition.comments}
                                    studentSubmission={competition.studentUploadFile}
                                    studentId={props.studentId}
                                    status={competition.status}
                                    deleteCompetition={deleteCompetition}
                                />
                    );
                })}
            </div>
        }
    } else if(props.type === "courses") {
        if(courses !== null && courses !== undefined) {
            console.log(props.courses);
            return <div>
            <br/>
            <div className="boxContainer">
                Sort by: <select name="sortBy" id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="latest">Date - Latest</option>
                <option value="oldest">Date - Oldest</option>
            </select>
            </div>
                {courses.map((course, index) => {
                    return (
                        <CoursesReportBox
                            key={index}
                            id={index}
                            course={course}
                            docId={course.docId}
                            courseName ={course.courseName}
                            courseTag ={course.courseTag}
                            description ={course.description}
                            organizedBy ={course.organizedBy}
                            applStartDate={course.applicationStartDate}
                            applEndDate={course.applicationEndDate}
                            crsStartDate={course.crsStartDate}
                            crsEndDate={course.crsEndDate}
                            classesFrom ={course.classesFrom}
                            classesTo={course.classesTo}
                            refLink ={course.refLink}
                            requirements={course.requirements}
                            comments={course.comments}
                            fileURL={course.courseUploadFile}
                            studentId={props.studentId}
                            schools={course.schools}
                            status={course.status}
                            deleteCourse={deleteCourse}
                        />
                    );
                })}
            </div>
        }
    } else if(props.type === "tas") {
        return <div>
            <br/>
            <div className="boxContainer">
                Sort by: <select name="sortBy" id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="latest">Date - Latest</option>
                <option value="oldest">Date - Oldest</option>
            </select>
            </div>
            {tas.map((activity, index) => {
                return (
                    <TAReportBox
                        key={index}
                        id={index}
                        docId={activity.docId}
                        taID={activity.taID}
                        taName={activity.taName}
                        intro={activity.intro}
                        tips={activity.tips}
                        resources={activity.resources}
                        materials={activity.materials}
                        instructions={activity.instructions}
                        goals={activity.goals}
                        extensions={activity.extensions}
                        assessment={activity.assessment}
                        comment={activity.comment}//newline
                        studentId={props.studentId}
                        uploadFile={activity.uploadFile}//newline
                        status={activity.status}
                        deleteActivity={deleteActivity}
                    />
                );
            })}
        </div>
    }
}

export default DisplayElement;