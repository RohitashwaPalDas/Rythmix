import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SongContext from "../../contexts/SongContext";
import "../../public/css/card2.css";
import { Howl } from 'howler';  
import { makeAuthDELETEReq, makeAuthPOSTReq } from "../../utils/serverHelper";
import { useAuth } from "../../utils/authProvider";
import {toast} from "react-toastify";

export default function Card2({ info, openMenuId, setOpenMenuId, showDeleteOption, removeItemFromUI, removeSongFromUI, isInPlaylist=false, playlistId, isSearch=false }) {
    const { currentSong, setCurrentSong, isPaused, queue, setQueue, setIsAddToPlaylistModalOpen, isSideVisible } = useContext(SongContext);
    const { currentUser } = useAuth();
    const [duration, setDuration] = useState(null);
    const [isLiked, setIsLiked] = useState(info?.likedBy?.includes(currentUser._id) || false);
    const [isMobileView, setIsMobileView] = useState(false);
    const navigate = useNavigate();

    if (!info) return null;

    const handleAddToQueue = async (song, event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpenMenuId(null);
        let songId = song._id;
        let data = { songId };
        const res = await makeAuthPOSTReq("/queue", data);
        if (res && !res.error) {
            setQueue(prevQueue => [...prevQueue, song]);
            toast.success("Song added successfully!");
        } else {
            console.error("Failed to add song:", res.error);
            toast.error("Failed to add song: " + res.error);
        }
    };
    
    useEffect(() => {
        if (info && info?.track) {
            const sound = new Howl({
                src: [info?.track], 
                html5: true,
                onload: () => {
                    setDuration(sound.duration());
                },
            });

            return () => {
                sound.unload();
            };
        }
    }, [info?.track]);

    useEffect(() => {
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

    const formatDuration = (seconds) => {
        if (seconds === null) return '00:00';  
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleLike = async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpenMenuId(null);
        const songId = info?._id;
        const data = { songId };
        let res = await makeAuthPOSTReq("/songs/like", data);
        if (res && !res.error) {
            setIsLiked(!isLiked);
            toast.success(res.message);
            if (res.message == "Song disliked successfully") {
                removeItemFromUI(info?._id);
            }
        } else {
            console.error("Failed to like song:", res.error);
            toast.error("Failed to like song: " + res.error);
        }
    };

    const addToPlaylist = async(event)=>{
        event.preventDefault();
        event.stopPropagation();
        setIsAddToPlaylistModalOpen({ isOpen: true, song: info });
        setOpenMenuId(null);
    }

    const deleteFromPlaylist = async(event)=>{
        event.preventDefault();
        event.stopPropagation();
        setOpenMenuId(null);
        const playlistID = playlistId;
        const songID = info?._id;
        console.log(playlistID);
        const res = await makeAuthDELETEReq(`/playlists/${playlistID}/songs/${songID}`)
        if (res && !res.error) {
            toast.success("Song removed successfully!");
            removeSongFromUI(info?._id); // Update UI after deletion
        } else {
            console.error("Failed to remove song:", res.error);
            toast.error("Failed to delete song: " + res.error);
        }
    }

    const toggleMenu = (event) => {
        event.stopPropagation();
        setOpenMenuId(openMenuId === info?._id ? null : info?._id);
    };

    const deleteMySong = async(event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpenMenuId(null);
        const res = await makeAuthDELETEReq(`/songs/mysong/${info?._id}`);
        if (res && !res.error) {
            toast.success("Song deleted successfully!");
            removeSongFromUI(info?._id); // Update UI after deletion
        } else {
            console.error("Failed to delete song:", res.error);
            toast.error("Failed to delete song: " + res.error);
        }
    };

    // Close the menu when clicking outside
    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, [setOpenMenuId]);

    

    return (
        <div className={`mainBox2 ${isSideVisible && isSearch && !isMobileView ? "sideVisible" : ""}`} onClick={() => setCurrentSong(info)}>
            <div className="mainBox2_left">
                <div className="image2">
                    <div className="background" style={{ backgroundImage: `url(${info?.thumbnail})` }}></div>
                    <div className="overlay"></div>
                    <div className="logo2">
                        {isPaused || currentSong === null || currentSong._id !== info?._id ? (
                            <i className="fa-solid fa-play"></i>
                        ) : (
                            <i className="fa-solid fa-pause"></i>
                        )}
                    </div>
                </div>
                <div className="det2">
                    <div className="title2">
                        {info?.name}
                        {info?.movieAlbum ? ` (From "${info?.movieAlbum}")` : ''}
                    </div>
                    <div className="artist2">
                        {info?.artist.map((artist, index) => (
                            <span onClick={(e)=>{
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/artist/${artist._id}`);
                            }}>{artist.firstname} {artist.lastname} {index < info?.artist.length - 1 ? ', ' : ''}</span>
                        ))}
                    </div>
                </div>
            </div>

            

            <div className="mainBox2_right">
                <div className="duration">{formatDuration(duration)}</div>
                <div className="like">
                    <i
                        className={`fa-heart ${isLiked ? 'fa-solid redHeart' : 'fa-regular'}`}
                        onClick={handleLike}
                    ></i>
                </div>
                <div className="menu">
                    <i className="fa-solid fa-ellipsis" onClick={toggleMenu}></i>
                    {openMenuId === info?._id && (
                        <div className="dropdown-menu">
                            <div onClick={(e) => handleAddToQueue(info, e)}>Add to queue</div>
                            <div onClick={handleLike}>{isLiked ? <span>Dislike Song</span> : <span>Like Song</span>}</div>
                            {isInPlaylist ? (
                                <div onClick={deleteFromPlaylist}>Delete from Playlist</div>
                            ) : (
                                <div onClick={addToPlaylist}>Add to Playlist</div>
                            )}
                            {showDeleteOption && <div onClick={deleteMySong}>Delete My Song</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
