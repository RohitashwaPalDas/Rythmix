import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Card2 from "../components/shared/card2";
import { makeAuthGETReq, makeAuthPOSTReq } from '../utils/serverHelper';
import LogInBP from '../boilerplates/LogInBP';
import { Howl, Howler } from 'howler';
import "../public/css/checkUser.css";
import "../public/css/ArtistProfile.css";
import SongContext from "../contexts/SongContext";


export default function ArtistProfile() {
    const { artistId } = useParams();
    const [artist, setArtist] = useState(null);
    const [playlistDetails, setPlaylistDetails] = useState({});
    const [isCurrentPlaylistPlaying, setIsCurrentPlaylistPlaying] = useState(false); 
    const [isFollowing, setIsFollowing] = useState(false);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [user, setUser] = useState(null); // Store the logged-in user's data
    const [followersCount, setFollowersCount] = useState(0); // New state for followers count
    const [openMenuId, setOpenMenuId] = useState(null); // To track which menu is open
    const {
        currentSong, setCurrentSong, songPlayed, setSongPlayed,
        isPaused, setIsPaused, isCreatePlaylistModalOpen, isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen,
        currentTime, setCurrentTime, volumeIcon, setVolumeIcon, volume, setVolume, isSideVisible, setIsSideVisible, 
        duration, setDuration, intervalId, setIntervalId, isRepeatMode, setIsRepeatMode,historyData, setHistoryData,
        queue, setQueue, isQueueModalOpen, setIsQueueModalOpen, playlist, setPlaylist, setCurrentSongIndex, currentSongIndex, isRegisterAsArtistModalOpen, isPlaylistPlaying, setIsPlaylistPlaying
    } = useContext(SongContext);

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const res = await makeAuthGETReq(`/artistAcc/${artistId}`);
                console.log("Arist: ", res);
                setArtist(res.data);
                setPlaylistDetails(res.data);
                console.log("Followers: ", res.data.followers.length);
                setFollowersCount(res.data.followers.length);
            } catch (error) {
                console.error("An error occurred while fetching artist data:", error.message);
            }
        };

        const fetchUser = async () => {
            try {
                const userRes = await makeAuthGETReq(`/user/me`);
                console.log("User: ", userRes);
                setUser(userRes);

                if (userRes) {
                    // Check if the user is viewing their own artist profile
                    if (userRes.artistProfile && userRes.artistProfile === artistId) {
                        setIsOwnProfile(true);
                    } else if (userRes.following && userRes.following.includes(artistId)) {
                        // If the user is following the artist, set `isFollowing` to true
                        setIsFollowing(true);
                    }
                }
            } catch (error) {
                console.error("An error occurred while fetching user data:", error.message);
            }
        };

        fetchArtist();
        fetchUser();
    }, [artistId]);

    console.log("Playlist is: ", playlistDetails);

    useEffect(() => {
        // If the currently playing song belongs to this playlist
        if (playlistDetails.songs && playlistDetails.songs.includes(currentSong)) {
            setIsCurrentPlaylistPlaying(!isPaused);
        } else {
            setIsCurrentPlaylistPlaying(false); // If it's not the current playlist playing
        }
    }, [isPaused, currentSong, playlistDetails.songs]);

    const playSound = () => {
        if (songPlayed) {
            songPlayed.play(); // Resume playing from the current position
            setIsPaused(false);
        }
    };

    const pauseSound = () => {
        if (songPlayed) {
            songPlayed.pause(); // Pause the current song
            setIsPaused(true);
        }
    };

    const changeSong = (SongSrc, index = currentSongIndex) => {
        if (songPlayed) {
            songPlayed.stop();
        }
    
        const sound = new Howl({
            src: [SongSrc],
            html5: true,
            onplay: async () => {
                setDuration(sound.duration());
                setCurrentSongIndex(index);  // Ensure index is updated here
                const data = await addToHistory(currentSong._id);
                if(data){
                    console.log("Song added to history");
                }
            },
            onend: () => {
                if (isRepeatModeRef.current && repeatingSongRef.current) {
                    // If repeat mode is on, play the same song again
                    setCurrentSong(repeatingSongRef.current);
                    changeSong(repeatingSongRef.current.track);
                } else {
                    // Proceed to the next song in the playlist
                    handleNextSong();
                }
            }
            
        });
        setSongPlayed(sound);
        sound.play();
        setIsPaused(false);
    };

    const handlePlayPausePlaylist = async () => {
        if (isCurrentPlaylistPlaying) {
            // Pause the playlist
            pauseSound();
            setIsCurrentPlaylistPlaying(false);
            setIsPlaylistPlaying(false); // Update global state
        } else {
            // Check if the current song is from this playlist and was just paused
            if (playlistDetails.songs.includes(currentSong)) {
                // Resume the paused song
                playSound();
            } else {
                // If the current song is not from this playlist, start the first song of the new playlist
                if (songPlayed) {
                    songPlayed.stop(); // Stop the currently playing song if any
                }
    
                // Start the first song of the new playlist
                setPlaylist(playlistDetails.songs);
                setCurrentSongIndex(0); // Start from the first song
                setCurrentSong(playlistDetails.songs[0]);
    
                // Play the first song
                changeSong(playlistDetails.songs[0].track); // Assuming 'track' holds the song source
            }
    
            setIsCurrentPlaylistPlaying(true);
            setIsPlaylistPlaying(true); // Update global state
        }
    };


    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                const res = await makeAuthPOSTReq(`/unfollow/${artistId}`);
                console.log(res);
                setIsFollowing(false);
                setFollowersCount(followersCount - 1);
            } else {
                const res = await makeAuthPOSTReq(`/follow/${artistId}`);
                console.log(res);
                setIsFollowing(true);
                setFollowersCount(followersCount + 1); 
            }
        } catch (error) {
            console.error("An error occurred while toggling follow:", error.message);
        }
    };

    if (!artist || !user) {
        return <div>Loading...</div>; // Display a loading message while data is being fetched
    }

    return (
        <LogInBP>
            <div className="mainProfile">
                <div className="profile-section">
                    <div className="profile-header">
                        {artist?.profilePic ? (
                            <img
                                src={artist?.profilePic}
                                alt="Profile"
                                className="profile-image"
                            />
                        ) : (
                            <div className="profile-placeholder">
                                {artist?.firstname.charAt(0) + artist?.lastname.charAt(0)}
                            </div>
                        )}
                        <div className="profile-details">
                            <h4>Profile</h4>
                            <h1 className="username">{artist?.firstname} {artist?.lastname}</h1>
                            <p className="followers">{artist.songs.length} Songs • {followersCount} Followers</p>
                        </div>
                    </div>

                    {/* Links and Buttons */}
                    <div className="buttons">
                        <div className="play" onClick={handlePlayPausePlaylist}>
                            {isCurrentPlaylistPlaying ? (
                                <i className="fa-solid fa-circle-pause"></i> // Pause icon
                            ) : (
                                <i className="fa-solid fa-circle-play"></i>  // Play icon
                            )}
                        </div>
                        <div className="otherActions">
                            <i className="fa-solid fa-shuffle"></i>
                        </div>
                        {!isOwnProfile && (
                            <button className="follow" onClick={handleFollowToggle}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="playlists">
                    <h1>Songs</h1>
                    {artist.songs.map((item, index) => (
                        <Card2 key={index} info={item} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}/>
                    ))}
                </div>
            </div>
        </LogInBP>
    );
}
