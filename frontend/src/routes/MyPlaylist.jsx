import { useState, useEffect, useContext } from "react";
import "../public/css/MyPlaylist.css";
import { makeAuthGETReq } from "../utils/serverHelper";
import LogInBP from "../boilerplates/LogInBP";
import PlaylistCard from "../components/shared/PlaylistCard";
import PlaylistCard2 from "../components/shared/PlaylistCard2";
import CreatePlaylistModal from "../modals/CreatePlaylistModal";
import SongContext from "../contexts/SongContext"; // Import the context
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";

export default function MyPlaylist() {
    const [playlistData, setPlaylistData] = useState([]);
    const { setPlaylist, setCurrentSongIndex, setIsCreatePlaylistModalOpen, isCreatePlaylistModalOpen } = useContext(SongContext); 
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getData = async () => {
            try {
                console.log("Fetching data from /playlists/myPlaylist...");
                // const res = await makeAuthGETReq("/playlists/myPlaylist");
                const [playlistRes, libraryRes] = await Promise.all([
                    makeAuthGETReq("/playlists/myPlaylist"),
                    makeAuthGETReq("/playlists/myLibrary")
                ]);
                console.log("Playlist:", playlistRes.data);
                console.log("Library:", libraryRes.data);

                // Combine both song and artist data into one array
                const combinedResults = [...playlistRes.data, ...libraryRes.data];
                setPlaylistData(combinedResults);
            } catch (error) {
                console.error("An error occurred inside useEffect:", error.message);
                toast.error("Error: " + error.message); // Optional: Display an alert for visibility
            }
        };

        getData();

        const handleResize = () => {
            const isMobile = window.innerWidth <= 768 || window.innerWidth == 768;
            setIsMobileView(isMobile);
        };

        
        window.addEventListener("resize", handleResize);
        handleResize(); // Trigger resize handler on initial render

        return () => {
            window.removeEventListener("resize", handleResize);
        };

        
    }, []);


    const handlePlaylistClick = (playlist) => {
        console.log("Setting playlist to:", playlist); // Debugging
        setPlaylist(playlist.songs);
        setCurrentSongIndex(0);
        navigate("/myplaylist/" + playlist._id);
    };

    const addNewPlaylistToState = (newPlaylist) => {
        setPlaylistData((prevData) => [...prevData, newPlaylist]); // Add the new playlist to the top
    };

    const handlePlusIconClick = (e) => {
        e.preventDefault(); // Prevent the default Link navigation
        e.stopPropagation(); // Stop the event from bubbling up to the Link
        setIsCreatePlaylistModalOpen(true);
    };

    return (
        <LogInBP>
            {isCreatePlaylistModalOpen && <CreatePlaylistModal addNewPlaylist={addNewPlaylistToState}/>}
            <div className="myPlaylistSec">
                <div className="myPlaylistHead">
                    <h1>My Playlists</h1>
                    <div className="plusLogo" onClick={handlePlusIconClick}><i class="fa-solid fa-plus"></i></div>
                </div>
                <div className="playlistSec">
                    {isMobileView ? playlistData.map((item, index) => (
                        <PlaylistCard2
                            key={index}
                            info={item}
                            playlistId={item._id}
                            onClick={() => handlePlaylistClick(item)} // Pass the selected playlist to the handler
                        />
                    )) : playlistData.map((item, index) => (
                        <PlaylistCard
                            key={index}
                            info={item}
                            playlistId={item._id}
                            onClick={() => handlePlaylistClick(item)} // Pass the selected playlist to the handler
                        />
                    ))}
                    <div className="playlistCreation" onClick={handlePlusIconClick}>
                        <div className="icon addIcon">
                            <i class="fa-solid fa-plus"></i>
                        </div>
                        <div className="addLabel">
                            Create a New Playlist
                        </div>
                    </div>
                </div>
            </div>
        </LogInBP>
    );
}
