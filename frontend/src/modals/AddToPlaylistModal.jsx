import { useContext, useState, useEffect } from "react";
import SongContext from "../contexts/SongContext";
import { makeAuthPOSTReq, makeAuthGETReq } from "../utils/serverHelper";
import { useNavigate } from "react-router-dom";
import PlaylistCard2 from "../components/shared/PlaylistCard2";
import "../public/css/AddToPlaylistModal.css"
import { toast } from "react-toastify";

export default function AddToPlaylistModal() {
    const { setIsAddToPlaylistModalOpen, isAddToPlaylistModalOpen } = useContext(SongContext);
    const [playlistData, setPlaylistData] = useState([]);
    const navigate = useNavigate();

    const handleCrossIconClick = () => {
        setIsAddToPlaylistModalOpen({ isOpen: false, song: null });
    };

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await makeAuthGETReq("/playlists/myPlaylist");
                if (res.error) throw new Error(res.error);
                setPlaylistData(res.data);
            } catch (error) {
                console.error("An error occurred inside useEffect:", error.message);
                alert("Error: " + error.message); // Optional: Display an alert for visibility
            }
        };

        getData();
    }, []);

    const addSong = async (playlistId) => {
        const songId = isAddToPlaylistModalOpen.song?._id;
        const data = { playlistId, songId };
        const res = await makeAuthPOSTReq("/playlists/addSong", data);

        if (res && !res.error) {
            toast.success("Song added to playlist successfully!");
            setIsAddToPlaylistModalOpen({ isOpen: false, song: null });
            // navigate("/home");
        } else {
            console.error("Failed to add song:", res.error);
            alert("Failed to add song: " + res.error);
        }
    };

    return (
        <div className="PlayListModal">
            <div className="playlistContainer">
                <div className="closeIcon" onClick={handleCrossIconClick}>
                    <i className="fa-solid fa-xmark"></i>
                </div>
                <div className="heading">
                    <h1>Select Playlist</h1>
                </div>
                <div className="selectPlaylist">
                    {playlistData.map((item, index) => {
                        const isSongInPlaylist = item.songs.some(
                            (song) => song._id === isAddToPlaylistModalOpen.song?._id
                        );

                        return (
                            <PlaylistCard2
                                key={index}
                                info={item}
                                onClick={isSongInPlaylist ? null : () => addSong(item._id)}
                                isDisabled={isSongInPlaylist}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
