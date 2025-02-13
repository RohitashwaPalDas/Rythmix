import { useState, useEffect, useContext } from "react"
import "../public/css/MySong.css"
import Card2 from "../components/shared/card2"
import { makeAuthGETReq, makeAuthPOSTReq } from "../utils/serverHelper"
import {Howl, Howler} from 'howler';
import LogInBP from "../boilerplates/LogInBP"
import SongContext from "../contexts/SongContext";
import {toast} from "react-toastify";

export default function Recents(){
    const {historyData, setHistoryData} = useContext(SongContext);
    const [openMenuId, setOpenMenuId] = useState(null); // To track which menu is open

    

    useEffect(() => {
        const getData = async () => {
            try {
                console.log("Fetching data from /history...");
                const res = await makeAuthGETReq("/history");
                if (res.error) {
                    throw new Error(res.error);
                }
                console.log("Data fetched successfully:", res.data);
                setHistoryData(res.data);
            } catch (error) {
                console.error("An error occurred inside useEffect:", error.message);
                toast.error("Error: " + error.message); // Optional: Display an alert for visibility
            }
        };
    
        getData();
    }, []);

    return(
        <LogInBP>
            <div className="mySongSec">
                <h1>Recents</h1>
                {historyData.map((item, index) => {
                    return <Card2 key={index} info={item.song} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}/>
                })}
            </div>
        </LogInBP>
    )
}