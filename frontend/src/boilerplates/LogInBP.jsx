import { useContext, useEffect, useRef, useState, useLayoutEffect } from "react";
import { useNavigate } from 'react-router-dom';
import SongContext from "../contexts/SongContext";
import LeftPanel from "../components/shared/leftPanel";
import NavBar from "../components/shared/navBar";
import CreatePlaylistModal from "../modals/CreatePlaylistModal";
import AddToPlaylistModal from "../modals/AddToPlaylistModal";
import RegisterAsArtistModal from "../modals/RegisterAsArtistModal";
import QueuePlaylistModal from "../modals/QueuePlaylistModal";
import Card2 from "../components/shared/card2";
import "../public/css/Home.css";
import "../public/css/SongPlayer.css";
import { makeAuthDELETEReq, makeAuthGETReq, makeAuthPOSTReq } from "../utils/serverHelper";
import { Howl } from 'howler'; 


export default function LogInBP({ children }) {
    const {
        currentSong, setCurrentSong, songPlayed, setSongPlayed,
        isPaused, setIsPaused, isCreatePlaylistModalOpen, isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen,
        currentTime, setCurrentTime, volumeIcon, setVolumeIcon, volume, setVolume, isSideVisible, setIsSideVisible, 
        duration, setDuration, intervalId, setIntervalId, isRepeatMode, setIsRepeatMode,historyData, setHistoryData,
        queue, setQueue, isQueueModalOpen, setIsQueueModalOpen, playlist, setPlaylist, setCurrentSongIndex, currentSongIndex, isRegisterAsArtistModalOpen, isPlaylistPlaying, setIsPlaylistPlaying, resumeTime, setResumeTime, isArtist, setIsArtist
    } = useContext(SongContext);

    

    const addToHistory = async (songId) => {
        try {
            const data = { songId };
            let res = await makeAuthPOSTReq("/addToHistory", data);
            console.log("Song added to history:", res);
        } catch (error) {
            console.error("Error adding song to history:", error);
        }
    };

    useEffect(() => {
        // Fetch user details to check if the user is an artist
        const fetchUser = async () => {
            const res = await makeAuthPOSTReq("/is-artist");  // Assuming this endpoint returns user details
            console.log(res.isArtist);
            if(res && res.isArtist){
                setIsArtist(true);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const savedVolume = localStorage.getItem('savedVolume');
        if (savedVolume !== null) {
            const parsedVolume = parseFloat(savedVolume);
            setVolume(parsedVolume);
            setVolumeIcon(parsedVolume === 0 ? "fa-solid fa-volume-off" : parsedVolume < 0.5 ? "fa-solid fa-volume-low" : "fa-solid fa-volume-high");
            if (songPlayed) {
                songPlayed.volume(parsedVolume);
            }
        }
    }, []); // Empty dependency array to run only once on mount

    

    const firstUpdate = useRef(true);
    const progressRef = useRef(null);
    const volumeControlRef = useRef(null);
    const navigate = useNavigate();
    

    // **Add Refs for Repeat Functionality**
    const isRepeatModeRef = useRef(isRepeatMode);
    const repeatingSongRef = useRef(null);

    const handleSideClose = ()=>{
        setIsSideVisible(false);
    }

    // **Synchronize isRepeatModeRef with isRepeatMode state**
    useEffect(() => {
        isRepeatModeRef.current = isRepeatMode;
    }, [isRepeatMode]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handlePlusIconClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAddToPlaylistModalOpen(true);
    };

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await makeAuthGETReq('/queue');
                setQueue(response.data.songs);
            } catch (error) {
                console.error('Error fetching queue:', error);
            }
        };
    
        fetchQueue();
    
        const intervalId = setInterval(fetchQueue, 5000); // Fetch the queue every 5 seconds
    
        return () => clearInterval(intervalId); // Cleanup the interval on unmount
    }, []);

    useEffect(() => {
        if (currentSong) {
            console.log("Current Song:", currentSong);
        }
    }, [currentSong]);

    useEffect(() => {
        console.log("Current Playlist:", playlist); // Debugging
    }, [playlist]);


    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        if (!currentSong) {
            return;
        }

        console.log("Triggering changeSong");
        changeSong(currentSong.track);
    }, [currentSong]);

    useEffect(() => {
        if (intervalId) {
            clearInterval(intervalId);
        }
        if (songPlayed && !isPaused) {
            const id = setInterval(() => {
                const currentTime = songPlayed.seek();
                setCurrentTime(currentTime);
                if (progressRef.current) {
                    const progress = (currentTime / duration) * 100;
                    progressRef.current.style.setProperty('--value', progress);
                }
            }, 1000);
            setIntervalId(id);
        }
        return () => clearInterval(intervalId);
    }, [songPlayed, isPaused, duration]);
    

    

    // **Function to change the song**
    
    const changeSong = (SongSrc, index = currentSongIndex, startTime = 0) => {
        if (songPlayed) {
            songPlayed.stop();
        }

        const sound = new Howl({
            src: [SongSrc],
            html5: true,
            onplay: async () => {
                // setIsSideVisible(true);
                setDuration(sound.duration());
                setCurrentSongIndex(index); // Ensure index is updated here
                const data = await addToHistory(currentSong._id);
                if (data) {
                    console.log("Song added to history");
                }
                sound.seek(startTime);

                // Apply the saved volume on new song
                const savedVolume = localStorage.getItem('savedVolume');
                if (savedVolume !== null) {
                    const parsedVolume = parseFloat(savedVolume);
                    sound.volume(parsedVolume);
                }
            },
            onend: () => {
                if (isRepeatModeRef.current && repeatingSongRef.current) {
                    setCurrentSong(repeatingSongRef.current);
                    changeSong(repeatingSongRef.current.track, currentSongIndex, 0);
                } else {
                    handleNextSong();
                }
            },
        });

        setSongPlayed(sound);
        sound.play();
        setIsPaused(false);
    };

    

    // **Toggle Repeat Mode**
    const toggleRepeatMode = () => {
        setIsRepeatMode(!isRepeatMode);
        if (!isRepeatMode) { // Enabling repeat
            repeatingSongRef.current = currentSong;
        } else { // Disabling repeat
            repeatingSongRef.current = null;
        }
    };

    // **Function to remove a song from the queue**
    const removeFromQueue = async (songId) => {
        try {
            let res = await makeAuthDELETEReq(`/queue/${songId}`);
            console.log('Song removed from queue:', res);
        } catch (error) {
            console.error('Error removing song from queue:', error);
        }
    };

    // **Function to handle playing the next song**
    const handleNextSong = () => {
        if (queue.length > 0) {
            // If there are songs in the queue, play the next song from the queue
            const nextSong = queue[0].songId;
            console.log('Next song to be played from queue:', nextSong);
    
            if (nextSong && nextSong.track) {
                setCurrentSong(nextSong);
                changeSong(nextSong.track);
    
                // Remove the song from the queue only if it has a valid _id
                if (nextSong._id) {
                    const updatedQueue = queue.slice(1);
                    removeFromQueue(nextSong._id);
                    setQueue(updatedQueue);
                } else {
                    console.error('Next song does not have a valid _id:', nextSong);
                }
            } else {
                console.error('Next song or track is undefined:', nextSong);
            }
        } else {
            // Play the next song in the playlist after the current song
            const currIndex = playlist.findIndex(x => x.name == currentSong.name);
            const nextIndex = currIndex + 1;
            if (nextIndex < playlist.length) {
                const nextSongInPlaylist = playlist[nextIndex];
                console.log('Next song to be played from playlist:', nextSongInPlaylist);
    
                setCurrentSong(nextSongInPlaylist);
                changeSong(nextSongInPlaylist.track, nextIndex); // Ensure currentSongIndex is updated
            } else {
                console.log('No more songs in the playlist.');
            }
        }
    };
    

    // **Function to handle playing the previous song**
    const handlePrevSong = () => {
        if (!playlist || playlist.length === 0) {
            // If no playlist exists, restart the current song from the beginning
            if (currentSong) {
                songPlayed.seek(0);  // Reset song to start from the beginning
                setCurrentTime(0);   // Reset the current time for UI
                songPlayed.play();    // Ensure the song starts playing
                setIsPaused(false);   // Set isPaused to false
            }
        } else {
            // Play the previous song in the playlist
            const currIndex = playlist.findIndex(x => x.name == currentSong.name);
            const prevIndex = currIndex > 0 ? currIndex - 1 : playlist.length - 1;
            console.log("Previous Index: ", prevIndex);
            const prevSong = playlist[prevIndex];
            console.log('Previous song to be played from playlist:', prevSong);
    
            setCurrentSong(prevSong);
            changeSong(prevSong.track, prevIndex); // Update currentSongIndex to prevIndex
        }
    };
    

    

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        if (songPlayed) {
            songPlayed.volume(newVolume);
        }
        setVolume(newVolume); // Update context
        localStorage.setItem('savedVolume', newVolume); // Save volume to localStorage
        setVolumeIcon(newVolume === 0 ? "fa-solid fa-volume-off" : newVolume < 0.5 ? "fa-solid fa-volume-low" : "fa-solid fa-volume-high");
    };

    // **Function to play the sound**
    const playSound = () => {
        if (songPlayed) {
            setResumeTime(songPlayed.seek());
            songPlayed.play();
            setIsPaused(false);

            // Apply the saved volume on song play
            const savedVolume = localStorage.getItem('savedVolume');
            if (savedVolume !== null) {
                const parsedVolume = parseFloat(savedVolume);
                songPlayed.volume(parsedVolume);
            }
        }
    };

    // **Function to pause the sound**
    const pauseSound = () => {
        if (songPlayed) {
            songPlayed.pause();
            setIsPaused(true);
        }
    };

    // **Function to toggle between play and pause**
    const togglePlayPause = () => {
        if (songPlayed) {
            if (isPaused) {
                // Play from the updated resumeTime
                changeSong(currentSong.track, currentSongIndex, resumeTime);
            } else {
                pauseSound();
                setResumeTime(songPlayed.seek()); // Store the current timestamp when pausing
            }
        }
    };

    // **Function to handle progress bar changes**
    const handleProgressChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        setResumeTime(newTime); // Update resumeTime with the new timestamp
        if (songPlayed) {
            songPlayed.seek(newTime); // Seek to the new timestamp
        }
    };

    const addToPlaylist = async()=>{
        setIsAddToPlaylistModalOpen({ isOpen: true, song: currentSong });
        setOpenMenuId(null);
    }
    
    

    // **Function to handle user selecting a new song**
    const handleUserSelectSong = (selectedSong) => {
        if (isRepeatMode) {
            // Update repeatingSongRef to keep the song that was in repeat mode
            repeatingSongRef.current = selectedSong;
        }
        setCurrentSong(selectedSong);
        changeSong(selectedSong.track);
    };

    return (
        <div className="homePage">
            
            {isAddToPlaylistModalOpen.isOpen && <AddToPlaylistModal />}
            {isRegisterAsArtistModalOpen && <RegisterAsArtistModal/>}
            <div className="leftPart">
                <LeftPanel />
            </div>

            

            <div className="rightPart">
                <NavBar />
                <div className="mainSection">
                    <div className={`children ${currentSong && isSideVisible ? 'shrink' : ''}`}>
                        {children}
                    </div>
                    
                    {currentSong && isSideVisible && (
                        <div className="sideSongPlayer">
                            <div className="closePart" onClick={handleSideClose}>
                                <i class="fa-solid fa-x"></i>
                            </div>
                            <h4 className="sideSongName">{currentSong?.name}</h4>
                            <div className="sideBackground" style={{ backgroundImage: `url(${currentSong?.thumbnail})` }}>
                                
                            </div>
                            <div className="sideTitle">{currentSong?.name}</div>
                            <div className="sideArtist">
                                {currentSong?.artist.firstname + " " + currentSong?.artist.lastname}
                            </div>
                            <div className="queue">
                                <h2>Next In Queue</h2>
                                {queue.length > 0 ? (
                                    queue.map((item, index) => {
                                        // Conditional check for track existence
                                        if (!item.songId || !item.songId.track) {
                                            return null;  
                                        }
                                        return (
                                            <Card2 key={index} info={item.songId}/>
                                        );
                                    })
                                ) : (
                                    <p>No songs in the queue.</p>
                                )}
                            </div>

                        </div>
                    )}
                </div>
                {currentSong && (
                        <div className="SongPlayer">
                            <div className="songInfo">
                                <div className="image2">
                                    <div className="background" style={{ backgroundImage: `url(${currentSong?.thumbnail})` }}></div>
                                    <div className="overlay"></div>
                                    <div className="playLogo2">
                                        <i className="fa-solid fa-chevron-up"></i>
                                    </div>
                                </div>

                                <div className="det2">
                                    <div className="title2">{currentSong?.name}</div>
                                    <div className="artist2">
                                        {currentSong?.artist.firstname + " " + currentSong?.artist.lastname}
                                    </div>
                                </div>

                                <div className="addlikesong" onClick={async()=>{
                                    const songId = currentSong._id;
                                    const data = { songId };
                                    let res = await makeAuthPOSTReq("/songs/like", data);
                                    console.log(res);
                                    if (res && !res.error) {
                                        console.log(res);
                                        alert("Song liked successfully!");
                                        navigate("/home");
                                    } else {
                                        console.error("Failed to add song:", res.error);
                                        alert("Failed to add song: " + res.error);
                                    }
                                }}>
                                    <i className="fa-solid fa-plus"></i>
                                </div>
                            </div>

                            <div className="playArea">
                                <div className="play-sec">
                                    <i className="otherBtn fa-solid fa-shuffle effectSong"></i>
                                    <i className="otherBtn fa-solid fa-backward-step changeSong" onClick={handlePrevSong}></i>
                                    <i className={isPaused ? "playPause fa-regular fa-circle-play circlePlay" : " playPause fa-regular fa-circle-pause circlePlay"} onClick={togglePlayPause}></i>
                                    <i className="otherBtn fa-solid fa-forward-step changeSong" onClick={handleNextSong}></i>
                                    <i
                                        className={`otherBtn fa-solid fa-repeat effectSong ${isRepeatMode ? 'repeatActive' : ''}`}
                                        onClick={toggleRepeatMode}
                                    />

                                </div>

                                <div className="progress-bar" ref={progressRef}>
                                    <div className="time-display">
                                        <span className="timeStamp">{formatTime(currentTime)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration}
                                        value={currentTime}
                                        onChange={handleProgressChange}
                                    />
                                    <div className="time-display">
                                        <span className="timeStamp">{formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="xtraBtns">
                                {isSideVisible ? (
                                    <i class="otherBtn fa-solid fa-chevron-down" onClick={()=>setIsSideVisible(false)}></i>
                                ): (
                                    <i class="otherBtn fa-solid fa-chevron-up" onClick={()=>setIsSideVisible(true)}></i>
                                )}
                                <i className="otherBtn fa-solid fa-microphone"></i>
                                <i className="otherBtn fa-solid fa-folder-plus" onClick={addToPlaylist}></i>
                                <div className="otherBtn volumeControl">
                                    <i className={volumeIcon}></i>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={volume} // Use volume from context
                                        onChange={handleVolumeChange}
                                        className="volume-range"
                                        ref={volumeControlRef}
                                    />
                                </div>
                            </div>
                        </div>
                )}
            </div>
            
        </div>
    );
}
