import React from "react";

function DateViewer(props) {
    const [date, setDate] = React.useState("");

    React.useEffect(() => {
        const d = new Date(props.date);
        let day = String(d.getDate());
        if(day.length === 1) {
            day = "0" + day;
        }
        let month = String(d.getMonth() + 1);
        if(month.length === 1) {
            month = "0" + month;
        }
        let year = String(d.getFullYear());
        const fullDate = `${day}-${month}-${year}`;
        setDate(fullDate);
    }, []);

    return <span>{date}</span>;
}

export default DateViewer;
