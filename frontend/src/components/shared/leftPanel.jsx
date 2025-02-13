import React, { useState, useContext, useEffect } from "react";
import IconCard from "./iconCard";
import { useAuth } from "../../utils/authProvider";
import SongContext from "../../contexts/SongContext";
import { makeAuthPOSTReq } from "../../utils/serverHelper";
import "../../public/css/leftPanel.css";

export default function LeftPanel() {
    const { currentUser } = useAuth();
    const { isLeftPanelOpen, setIsLeftPanelOpen, isArtist, setIsArtist, currentSong } = useContext(SongContext);
    
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

    return (
        <>
            {/* Left Panel */}
            <div className={`leftPanel ${isLeftPanelOpen ? "open" : "closed"} ${currentSong ? "isSongPlaying" : ""}`}>
                <div className="lpSec">
                    <div className="panel-logo">
                        <div className="panelLogo"><img src="https://res.cloudinary.com/dbztqrvks/image/upload/v1738178667/logo3_o0pc9k.jpg" alt="logo" className="rythmixLogo"/></div>
                        <div className="iconLab"><strong>RYTHMIX</strong></div>
                        <div className="closeHam" onClick={()=>{setIsLeftPanelOpen(false)}}><i class="fa-solid fa-x"></i></div>
                    </div>
                    <IconCard icon="home" label="Home" targetLink="/home" />
                    <IconCard icon="magnifying-glass" label="Search" targetLink="/search" />
                </div>

                <div className="lpSec">
                    <IconCard icon="bars fa-rotate-90" label="Your Library" targetLink="/myplaylist" />
                    <IconCard icon="heart" label="Liked Songs" targetLink="/likedSongs" />
                    {currentUser && isArtist && (
                        <IconCard icon="music" label="My Music" targetLink="/mysong" />
                    )}
                </div>
            </div>
        </>
    );
}
