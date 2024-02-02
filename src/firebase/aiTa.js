import axios from "axios";
import {doc, setDoc} from "firebase/firestore";
import {db} from "./firestore";

async function taApiRequest(data, studentId) {
    // const prompt = `
    // A high school student has just completed doing the below Tinkering Activity.

    // ${JSON.stringify(data)}

    // Now assign the next Tinkering activity that the student can perform. The next tinkering activity should utilize his existing knowledge/skill he gained and add something more creatively so that he improves his/her skill upon doing the this next tinkering activity. 
    
    // Give it in a way that I can directly convert the given output into a javascript object and do not change the value name but do change taid by replacing last digits with current timestamps. So do not give any introductions like 'sure! I will do it" at the starting or endings like "yes, this is the code" at the endings.

    // Straight to the point, direct json object.

    // {"taID":"","introduction":"","goals":[],"materials":[],"instructions":[],"assessment":[],"tips":[],"extensions":[],"resources":[]}

    // If you want to include any explanation of anything related to the tinkering activity, you can use the the required fields which are given in the sample in the required format

    // At the end in your response I need only the above json object with required information and nothing else. Again Nothing else other than the json object.
    // `;
    
    const prompt = data[0];

    const rawResult = await axios.post('http://127.0.0.1:5001/hamaralabs-dev/us-central1/chatWithGPT/chat', { prompt: prompt}, {timeout: 500000});
    const result = rawResult.data.response.choices[0].message.content;
    console.log(result);
    const d = new Date();
    const jsonObject = {
        intro: result,
        taID: `${d.getFullYear()}${d.getMonth()+1}${d.getDate()}${d.getHours()}${d.getMinutes()}`,
        assessment: [],
        extensions: [],
        goals: [],
        instructions: [],
        materials: [],
        observation: [],
        resources: [],
        tips: [],
        taName: data[1]
    }
    const currentDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    jsonObject.status = [{status: "Assigned", modifiedAt: currentDate}];
    console.log(jsonObject);
    const assignPathDocRef = doc(db, "studentData", studentId, "taData", jsonObject.taID);
    try {
        await setDoc(assignPathDocRef, jsonObject);
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}

export default taApiRequest;
