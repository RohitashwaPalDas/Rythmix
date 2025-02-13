import { useState, useEffect } from "react";
import "../public/css/MySong.css";
import Card2 from "../components/shared/card2";
import { makeAuthGETReq } from "../utils/serverHelper";
import LogInBP from "../boilerplates/LogInBP";
import {toast} from "react-toastify";

export default function MySong(){
    const [songData, setSongData] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                console.log("Fetching data from /songs/mysongs...");
                const res = await makeAuthGETReq("/songs/mysongs");
                if (res.error) {
                    throw new Error(res.error);
                }
                console.log("Data fetched successfully:", res);
                setSongData(res.data);
            } catch (error) {
                console.error("An error occurred inside useEffect:", error.message);
                toast.error("Error: " + error.message);
            }
        };
    
        getData();
    }, []);

    const removeSongFromUI = (songId) => {
        setSongData((prevSongs) => prevSongs.filter((song) => song._id !== songId));
    };

    return (
        <LogInBP>
            <div className="mySongSec">
                <h1>My Songs</h1>
                {songData.map((item, index) => (
                    <Card2 
                        key={index} 
                        info={item} 
                        openMenuId={openMenuId} 
                        setOpenMenuId={setOpenMenuId} 
                        showDeleteOption={true} 
                        removeSongFromUI={removeSongFromUI} 
                    />
                ))}
            </div>
        </LogInBP>
    );
}
