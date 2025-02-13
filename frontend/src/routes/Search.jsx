import LogInBP from "../boilerplates/LogInBP";
import SongContext from "../contexts/SongContext";
import React, { useContext, useState } from 'react';
import "../public/css/Search.css";
import Card2 from "../components/shared/card2";
import ArtistCard from "../components/shared/artistCard";
import { useNavigate } from "react-router-dom";
import { Howl } from 'howler';


export default function Search() {
    const { currentSong, setCurrentSong, songData, artistData, isSideVisible } = useContext(SongContext);
    const [songPlayed, setSongPlayed] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null); // To track which menu is open
    const navigate = useNavigate();
    

    // Filter out null or invalid artist entries
    const validArtists = artistData?.filter(artist => artist && artist.firstname && artist.lastname) || [];

    return (
        <LogInBP>
            <div className="allSearch">
                {songData && songData.length > 0 && (
                    <>
                        <div className="topResult">
                            <h2 className="topHead">Top Result</h2>
                            <div className="topCard">
                                <img src={songData[0]?.thumbnail} alt="image" className="topImg" />
                                <div className="title2 titleHead">{songData[0]?.name}</div>
                                <div className="artist2 artistTop">
                                    {songData[0]?.artist.map((artist, index) => (
                                        <span onClick={(e)=>{
                                            e.preventDefault();
                                            e.stopPropagation();
                                            navigate(`/artist/${artist._id}`);
                                        }}>{artist.firstname} {artist.lastname}{index < songData[0].artist.length - 1 ? ', ' : ''}</span>
                                    ))}
                                </div>
                                <div className="topPlay" onClick={() => setCurrentSong(songData[0])}>
                                    <i className="fa-solid fa-circle-play"></i>
                                </div>
                            </div>
                        </div>

                        <div className={`Search ${isSideVisible ? "sideVisible" : ""}`}>
                            <div className="songSearch">
                                <h2>Songs</h2>
                                {songData.map((item, index) => (
                                    <Card2 key={index} info={item} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} isSearch={true}/>
                                ))}
                            </div>

                            {/* Render artistSearch only if validArtists has data */}
                            {validArtists.length > 0 && (
                                <div className="artistSearch">
                                    <h2>Artists</h2>
                                    {validArtists.map((artist, index) => (
                                        <ArtistCard key={index} info={artist} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}/>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </LogInBP>
    );
}
