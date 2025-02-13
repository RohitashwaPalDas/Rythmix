
import LogInBP from "../boilerplates/LogInBP";
import "../public/css/Home.css";
import { makeAuthGETReq } from "../utils/serverHelper";
import { useEffect, useState, useContext } from "react";
import PlaylistCard from "../components/shared/PlaylistCard";
import SongContext from "../contexts/SongContext"; // Import the context

export default function AllPlaylists(){
    const [allPlaylist, setAllPlaylist] = useState(null);
    const { setPlaylist, setCurrentSongIndex } = useContext(SongContext);
    useEffect(() => {
        const fetchAllArtists = async () => {
            try {
                const res = await makeAuthGETReq("/playlists/allPlaylists");
                setAllPlaylist(res.data);
            } catch (error) {
                console.error("An error occurred: ", error.message);
            }
        };

        fetchAllArtists();
    }, []);

    if (!allPlaylist) {
        return <div>Loading...</div>; // Display a loading message while data is being fetched
    }
    const handlePlaylistClick = (playlist) => {
        console.log("Setting playlist to:", playlist); // Debugging
        setPlaylist(playlist.songs);
        setCurrentSongIndex(0);
    };
    return(
        <LogInBP>
            <div className="mainSec">
                <h2>Playlists</h2>
                <div className="artists">
                    {allPlaylist.map((item, index)=>{
                        return <PlaylistCard
                        key={index}
                        info={item}
                        playlistId={item._id}
                        onClick={() => handlePlaylistClick(item)} // Pass the selected playlist to the handler
                        />
                    })}
                </div>
            </div>
        </LogInBP>
    )
}