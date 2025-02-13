import { useParams, useNavigate } from "react-router-dom";
import LogInBP from "../boilerplates/LogInBP";
import { useState, useEffect, useContext, useRef } from "react";
import { makeAuthGETReq, makeAuthPOSTReq, makeAuthDELETEReq } from "../utils/serverHelper";
import Card2 from "../components/shared/card2";
import "../public/css/singlePlaylistView.css";
import SongContext from "../contexts/SongContext";
import { useAuth } from "../utils/authProvider";
import { Howl } from 'howler';
import { toast } from "react-toastify";

export default function SinglePlaylist() {
    let { playlistId } = useParams();
    const [playlistDetails, setPlaylistDetails] = useState({});
    const [isCurrentPlaylistPlaying, setIsCurrentPlaylistPlaying] = useState(false);
    const [isShuffleMode, setIsShuffleMode] = useState(false);
    const [shuffledPlaylist, setShuffledPlaylist] = useState([]);
    const [isPlaylistOwner, setIsPlaylistOwner] = useState(false);
    const [isInLibrary, setIsInLibrary] = useState(false);
    const [totalDuration, setTotalDuration] = useState(0);
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const playButtonRef = useRef(null);
    const [showStickyPlayButton, setShowStickyPlayButton] = useState(false);
    const navigate = useNavigate();

    const {
        currentSong, setCurrentSong, songPlayed, setSongPlayed,
        isPaused, setIsPaused, currentSongIndex, setCurrentSongIndex,
        isPlaylistPlaying, setIsPlaylistPlaying, setPlaylist, queue, setQueue,
        duration, setDuration, isRepeatMode, resumeTime, setResumeTime
    } = useContext(SongContext);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [songData, setSongData] = useState([]);
    const { currentUser } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            if (playButtonRef.current) {
                const rect = playButtonRef.current.getBoundingClientRect();
                setShowStickyPlayButton(rect.top < 0); // Show sticky play button when the main play button is out of view
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Fetch playlist details
    useEffect(() => {
        const getData = async () => {
            let res = await makeAuthGETReq("/playlists/get/" + playlistId);
            setPlaylistDetails(res.data);
            console.log(res.data);
            setSongData(res.data.songs);
            setIsPlaylistOwner(res.data.owner._id === currentUser._id);
        };
        getData();
    }, [playlistId]);

    

    useEffect(() => {
        let isMounted = true; // To prevent memory leaks in case of unmount

        const fetchDurations = async () => {
            if (playlistDetails?.songs) {
                let total = 0;
                
                const durationPromises = playlistDetails.songs.map((song) => {
                    return new Promise((resolve) => {
                        const sound = new Howl({
                            src: [song.track], 
                            html5: true,
                            onload: () => {
                                resolve(sound.duration());
                                sound.unload(); // Free memory after getting duration
                            },
                        });
                    });
                });

                const durations = await Promise.all(durationPromises);
                if (isMounted) {
                    total = durations.reduce((acc, dur) => acc + dur, 0);
                    setTotalDuration(total);
                }
            }
        };

        fetchDurations();

        return () => {
            isMounted = false;
        };
    }, [playlistDetails]);

    // Function to format the total duration in mm:ss format
    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
    
        return `${hrs > 0 ? `${hrs} hr ` : ""}${mins > 0 ? `${mins} min ` : ""}${secs > 0 ? `${secs} sec` : ""}`.trim();
    };

    

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setShowStickyHeader(true);
                console.log("showing sticky header");
            } else {
                setShowStickyHeader(false);
                console.log("hiding sticky header");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    // Check if the playlist is in user's library
    useEffect(() => {
        const checkLibrary = async () => {
            const res = await makeAuthGETReq("/playlists/myLibrary");
            const isPlaylistInLibrary = res.data.some(
                (playlist) => playlist._id === playlistId
            );
            setIsInLibrary(isPlaylistInLibrary);
        };
        checkLibrary();
    }, [playlistId]);

    // Update play/pause button state based on current song
    useEffect(() => {
        if (playlistDetails.songs && currentSong) {
            const isSongInPlaylist = playlistDetails.songs.some(
                (song) => song._id === currentSong._id
            );
            setIsCurrentPlaylistPlaying(isSongInPlaylist && !isPaused);
        }
    }, [playlistDetails.songs, currentSong, isPaused]);

    

    const shuffleArray = (array) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const toggleShuffle = () => {
        if (isShuffleMode) {
            setIsShuffleMode(false);
            setPlaylist(playlistDetails.songs);
        } else {
            const shuffled = shuffleArray(playlistDetails.songs);
            setShuffledPlaylist(shuffled);
            setIsShuffleMode(true);
            setPlaylist(shuffled);
        }
    };

    const playSound = () => {
        if (songPlayed) {
            songPlayed.play();
            setIsPaused(false);
        }
    };

    const pauseSound = () => {
        if (songPlayed) {
            setResumeTime(songPlayed.seek()); // Save the current time when paused
            songPlayed.pause();
            setIsPaused(true);
        }
    };

    const addToHistory = async (songId) => {
        try {
            const data = { songId };
            let res = await makeAuthPOSTReq("/addToHistory", data);
            console.log("Song added to history:", res);
        } catch (error) {
            console.error("Error adding song to history:", error);
        }
    };

    const handleAddToQueue = async (song) => {
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

    const changeSong = async (SongSrc, index = currentSongIndex, startTime = 0) => {
        if (songPlayed) {
            songPlayed.stop();
        }
    
        const sound = new Howl({
            src: [SongSrc],
            html5: true,
            onplay: async () => {
                setDuration(sound.duration());
                setCurrentSongIndex(index);
                if (currentSong?._id) {
                    const data = await addToHistory(currentSong._id);
                    if (data) {
                        console.log("Song added to history");
                    }
                }
                sound.seek(startTime); // Start from saved time
    
                // Automatically add next songs to the queue
                
            },
            onend: () => {
                if (isRepeatMode) {
                    changeSong(currentSong.track, currentSongIndex, 0);
                } else {
                    handleNextSong();
                }
            }
        });
    
        setSongPlayed(sound);
        sound.play();
        setIsPaused(false);
    };
    

    const handleNextSong = () => {
        let nextIndex;
        const playlist = isShuffleMode ? shuffledPlaylist : playlistDetails.songs;

        nextIndex = (currentSongIndex + 1) % playlist.length;
        setCurrentSong(playlist[nextIndex]);
        changeSong(playlist[nextIndex].track, nextIndex, 0);
    };

    const handlePreviousSong = () => {
        let prevIndex;
        const playlist = isShuffleMode ? shuffledPlaylist : playlistDetails.songs;

        prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        setCurrentSong(playlist[prevIndex]);
        changeSong(playlist[prevIndex].track, prevIndex, 0);
    };


    const handlePlayPausePlaylist = async () => {
        if (isCurrentPlaylistPlaying) {
            // Pause the playlist and save the current resume time
            pauseSound();
            setResumeTime(songPlayed.seek()); // Save the current playtime position
            setIsCurrentPlaylistPlaying(false);
            setIsPlaylistPlaying(false);
            console.log("Current song is(when pausing): ", currentSong);
            console.log("playlist when pausing is: ", playlistDetails.songs);
            console.log("ANswer is: ", playlistDetails.songs.some(song => song._id === currentSong._id));

        } else {
            // Check if the current song is part of the playlist and resume from the last position if applicable
            if (playlistDetails.songs.some(song => song._id === currentSong?._id)) {
                console.log("Current song is: ", currentSong);
                changeSong(currentSong.track, currentSongIndex, resumeTime); // Resume from saved position
            } else {
                if (songPlayed) {
                    songPlayed.stop();
                }
    
                // Start from the beginning of the playlist if it's a fresh start
                const initialPlaylist = isShuffleMode ? shuffledPlaylist : playlistDetails.songs;
                setPlaylist(initialPlaylist);
                setCurrentSongIndex(0);
                setCurrentSong(initialPlaylist[0]);
                changeSong(initialPlaylist[0].track, 0);
            }
    
            setIsCurrentPlaylistPlaying(true);
            setIsPlaylistPlaying(true);
        }
    };
    

    const handleAddToLibrary = async () => {
        const res = await makeAuthPOSTReq("/playlists/addToLibrary/" + playlistId);
        console.log(res);
        setIsInLibrary(!isInLibrary);
    }

    const removeSongFromUI = (songId) => {
        setSongData((prevSongs) => prevSongs.filter((song) => song._id !== songId));
    };

    const handleDeletePlaylist = async(event)=>{
        const res = await makeAuthDELETEReq(`/playlists/myplaylist/${playlistDetails._id}`);
        if (res && !res.error) {
            toast.success("Playlist deleted successfully!");
            navigate("/myplaylist");
        } else {
            console.error("Failed to delete playlist:", res.error);
            toast.error("Failed to delete playlist: " + res.error);
        }
    }

    return (
        <LogInBP>
            {playlistDetails._id && (
                <div className="mainPlaylist">
                    {showStickyHeader && (
                        <div className="sticky-header">
                            <h2>{playlistDetails.name}</h2>
                            {showStickyPlayButton && (
                                <div className="sticky-play play" onClick={handlePlayPausePlaylist}>
                                    {isCurrentPlaylistPlaying ? (
                                        <i className="fa-solid fa-circle-pause"></i>
                                    ) : (
                                        <i className="fa-solid fa-circle-play"></i>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="playlist-section">
                        <div className="playlist-header">
                            {playlistDetails._id ? (
                                <img src={playlistDetails.thumbnail} alt="Thumbnail" className="playlist-image" />
                            ) : (
                                <div className="playlist-placeholder">
                                    {playlistDetails.name.charAt(0)}
                                </div>
                            )}
                            <div className="playlist-details">
                                <h4>Compilation</h4>
                                <h1 className="playlistname">{playlistDetails.name}</h1>
                                <h1 className="playlistOwner">
                                      
                                    {playlistDetails.owner.profilePic ? (
                                        <img src={playlistDetails.owner.profilePic} alt="image" className="ownerPic"/>
                                    ) : (
                                        <div className="ownerInit">{playlistDetails.owner.firstname.charAt(0) + playlistDetails.owner.lastname.charAt(0)}</div>
                                    )}
                                    <div className="ownerName" onClick={()=> {
                                        const artistProfile = playlistDetails.owner.artistProfile;
                                        if(artistProfile){
                                            navigate(`/artist/${playlistDetails.owner.artistProfile}`);
                                        } else{
                                            navigate(`/user/${playlistDetails.owner._id}`);
                                        }
                                    }}>{playlistDetails.owner.firstname + " " + playlistDetails.owner.lastname}</div>
                                </h1>
                                <h4>{playlistDetails.songs.length} songs, {formatDuration(totalDuration)}</h4>
                            </div>
                        </div>

                        <div className="playlist-actions" ref={playButtonRef}>
                            <div className="play" onClick={handlePlayPausePlaylist}>
                                {isCurrentPlaylistPlaying ? (
                                    <i className="fa-solid fa-circle-pause"></i>
                                ) : (
                                    <i className="fa-solid fa-circle-play"></i>
                                )}
                            </div>
                            <div className="otherActions">
                                <i className={`fa-solid fa-shuffle ${isShuffleMode ? 'active' : ''}`} onClick={toggleShuffle}></i>
                                {!isPlaylistOwner && (
                                    <i className={`fa-solid ${isInLibrary ? 'fa-circle-minus' : 'fa-circle-plus'}`} onClick={handleAddToLibrary}></i>
                                )}
                                {isPlaylistOwner && (
                                    <span className="logout-button" onClick={handleDeletePlaylist}>
                                        Delete My Playlist
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="playlists">
                        {songData.map((item, index) => (
                            <Card2 info={item} key={JSON.stringify(item)} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} isInPlaylist={true} playlistId={playlistId} removeSongFromUI={removeSongFromUI}/>
                        ))}
                    </div>
                </div>
            )}
        </LogInBP>
    );
}
