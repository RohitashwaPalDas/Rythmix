import { useAuth } from "../utils/authProvider";
import { Link, useNavigate } from 'react-router-dom';
import "../public/css/checkUser.css";
import LogInBP from "../boilerplates/LogInBP";
import { useState, useEffect, useContext } from "react";
import "../public/css/MyPlaylist.css";
import { makeAuthGETReq , makeAuthPOSTReq } from "../utils/serverHelper";
import {Howl, Howler} from 'howler';
import PlaylistCard from "../components/shared/PlaylistCard";
import SongContext from "../contexts/SongContext"; // Import the context
import Card2 from "../components/shared/card2"
import ArtistCard from "../components/shared/artistCard";
import "../public/css/MySong.css"
import { toast } from "react-toastify";

export default function CheckUser() {
    const { currentUser } = useAuth();
    
    const navigate = useNavigate();
    const {isArtist, setIsArtist} = useContext(SongContext);
    const [openMenuId, setOpenMenuId] = useState(null); // To track which menu is open
    const [playlistData, setPlaylistData] = useState([]);
    const [following, setFollowing] = useState([]);
    const { setPlaylist, setCurrentSongIndex, setIsRegisterAsArtistModalOpen } = useContext(SongContext); // Destructure functions from the context
    const [historyData, setHistoryData] = useState([]);

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

    if (!currentUser) {
        return <p>No user is logged in.</p>;
    }

    const handleLogout = () => {
        navigate('/logout');
    };

    

    useEffect(() => {
        const getData = async () => {
            try {
                console.log("Fetching data from /playlists/myPlaylist...");
                const res = await makeAuthGETReq("/playlists/myPlaylist");
                const res2 = await makeAuthGETReq("/myfollowing");
                if (res.error || res2.error) {
                    throw new Error(res.error || res2.error);
                }
                console.log("Data fetched successfully:", res);
                console.log("Data fetched successfully RES2:", res2);
                console.log(res.data);
                console.log(res2.data.following);
                setPlaylistData(res.data);
                setFollowing(res2.data.following);
            } catch (error) {
                console.error("An error occurred inside useEffect:", error.message);
                toast.error("Error: " + error.message); // Optional: Display an alert for visibility
            }
        };

        getData();
    }, []);

    useEffect(() => {
        const getData = async () => {
            try {
                console.log("Fetching data from /history...");
                const res = await makeAuthGETReq("/history");
                if (res.error) {
                    throw new Error(res.error);
                }
                console.log("Data fetched successfully:", res.data);
                setHistoryData(res.data);
            } catch (error) {
                console.error("An error occurred inside useEffect:", error.message);
                alert("Error: " + error.message); // Optional: Display an alert for visibility
            }
        };
    
        getData();
    }, []);

    const handlePlaylistClick = (playlist) => {
        console.log("Setting playlist to:", playlist); // Debugging
        setPlaylist(playlist.songs);
        setCurrentSongIndex(0);
    };

    const displayedFollowings = following.slice(0, 5); 
    const displayedHistory = historyData.slice(0, 5); 

    return (
        
        <LogInBP>
            <div className="mainProfile">
                
                <div className="profile-section">
                    {/* Profile header with image and username */}
                    <div className="profile-header">
                        {currentUser.profilePic ? (
                            <img
                                src={currentUser.profilePic}
                                alt="Profile"
                                className="profile-image"
                            />
                        ) : (
                            <div className="profile-placeholder">
                                {currentUser?.firstname.charAt(0) +
                                    currentUser?.lastname.charAt(0)}
                            </div>
                        )}
                        <div className="profile-details">
                            <h4>Profile</h4>
                            <h1 className="username">{currentUser.firstname} {currentUser.lastname}</h1>
                            <p className="followers">{playlistData.length} Playlists • {following.length} Following</p>
                            <p className="email">{currentUser.email}</p>
                            <div className="links">
                                <Link to="/updatepassword" className="link">
                                    <div className="changePwd">
                                        <span>Change your Password</span>
                                        <i class="fa-solid fa-pen"></i>
                                    </div>
                                </Link>
                                <Link className="regAsArtist link">
                                    <span onClick={() => setIsRegisterAsArtistModalOpen(true)}>
                                        {isArtist ? (
                                            <span>Unregister as an ARTIST in SPOTIFY</span>
                                        ) : (
                                            <span>Register as an ARTIST in SPOTIFY</span>
                                        )}
                                    </span>
                                </Link>

                            </div>
                        </div>
                    </div>

                    {/* Links and Buttons */}
                    <div className="profile-actions">
                        <Link to="/addsong" className="action-link">
                            Upload Your Song
                        </Link>
                        <Link to="/editProfile" className="action-link">
                            Edit Your Profile
                        </Link>
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <div className="following">
                    <h1>Following</h1>
                    {displayedFollowings.map((item, index) => (
                        <ArtistCard
                            key={index}
                            info={item}
                            openMenuId={openMenuId}
                            setOpenMenuId={setOpenMenuId}
                        />
                    ))}
                    {following.length > 5  && (
                        <button className="see-more-button" onClick={() => navigate("/myfollowing")}>
                            See All
                        </button>
                    )}
                </div>

                <div className="playlists">
                    <h1>Recents</h1>
                    {displayedHistory.map((item, index) => {
                        return <Card2 key={index} info={item.song} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
                    })}
                    {historyData.length > 5 && (
                        <button className="see-more-button" onClick={() => navigate("/recents")}>
                            See All
                        </button>
                    )}
                </div>
            </div>
            
        </LogInBP>
    );
};
