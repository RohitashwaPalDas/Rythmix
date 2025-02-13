import { useState, useEffect } from "react"
import "../public/css/MySong.css"
import Card2 from "../components/shared/card2"
import { makeAuthGETReq } from "../utils/serverHelper"
import {Howl, Howler} from 'howler';
import LogInBP from "../boilerplates/LogInBP"
import { toast } from "react-toastify";

export default function LikedSongs(){
    const [likeSongData, setLikeSongData] = useState([]);
    const [songPlayed, setSongPlayed] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null); // To track which menu is open

    // const playSound = (SongSrc)=>{
    //     if(songPlayed){
    //         songPlayed.stop();
    //     }
    //     let sound = new Howl({
    //         src: [SongSrc],
    //         html5: true,
    //       });
    //       setSongPlayed(sound);
    //       sound.play();
    //       console.log(sound);
    //       console.log('Duration:', sound.duration());
    // }

    useEffect(() => {
        const getData = async () => {
            try {
                console.log("Fetching data from /liked-songs...");
                const res = await makeAuthGETReq("/likedSongs");
                setLikeSongData(res.data);
                if (res.error) {
                    throw new Error(res.error);
                }
                console.log("Data fetched successfully:", res);
            } catch (error) {
                console.error("An error occurred inside useEffect:", error.message);
                toast.error("Error: " + error.message); // Optional: Display an alert for visibility
            }
        };
    
        getData();
    }, []);

    const removeItemFromUI = (songId) => {
        setLikeSongData((prevSongs) => prevSongs.filter((song) => song._id !== songId));
    };

    return(
        <LogInBP>
            <div className="mySongSec">
                <h1>Liked Songs</h1>
                {likeSongData.map((item, index) => {
                    return <Card2 key={index} info={item} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} 
                    removeItemFromUI={removeItemFromUI}/>
                })}
            </div>
        </LogInBP>
    )
}
