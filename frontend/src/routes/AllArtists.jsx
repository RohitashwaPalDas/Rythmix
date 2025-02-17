import LogInBP from "../boilerplates/LogInBP";
import "../public/css/Home.css";
import { makeAuthGETReq } from "../utils/serverHelper";
import { useEffect, useState } from "react";
import ArtistCard2 from "../components/shared/artistCard2";

export default function AllArtists(){
    const [allArtist, setAllArtist] = useState(null);
    useEffect(() => {
        console.log("AllArtists component mounted");
      }, []);
      
    useEffect(() => {
        const fetchAllArtists = async () => {
            try {
                const res = await makeAuthGETReq("/allArtists");
                setAllArtist(res.data);
            } catch (error) {
                console.error("An error occurred: ", error.message);
            }
        };

        fetchAllArtists();
    }, []);

    if (!allArtist) {
        return <div>Loading...</div>; // Display a loading message while data is being fetched
    }
    return(
        <LogInBP>
            <div className="mainSec">
                <h2 className="homeHead">Artists</h2>
                <div className="allArtists">
                    {allArtist.map((item, index)=>{
                        return <ArtistCard2 key={index} info={item} />
                    })}
                </div>
            </div>
        </LogInBP>
    )
}