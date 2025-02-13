import "../../public/css/navBar.css"
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../utils/authProvider";
import React, { useEffect, useState, useRef, useContext } from 'react';
import { makeAuthGETReq } from "../../utils/serverHelper";
import SongContext from "../../contexts/SongContext";

export default function NavBar() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);

    const [inputValue, setInputValue] = useState("");
    const debounceTimeout = useRef(null); // Ref to hold the timeout ID

    const { artistData, setArtistData, setSongData, isLeftPanelOpen, setIsLeftPanelOpen } = useContext(SongContext);

    const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // Clear the previous timeout if the user is still typing
    if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
    }

    if (e.target.value.trim() === "") {
        setSongData([]);  // Clear the song data if input is empty
        return;
    }

    // Set a new timeout to trigger the search after 1 second of inactivity
    debounceTimeout.current = setTimeout(() => {
        search();  // Call the combined search function
    }, 1000);
};

const clearInput = () => {
    setInputValue("");
    clearTimeout(debounceTimeout.current);  // Clear the timeout when input is cleared
    setSongData([]);  // Clear the song data
};

// Combined search function to search both songs and artists
const search = async () => {
    if (inputValue.trim() === "") {
        setSongData([]);  // Clear the song data if input is empty
        return;
    }

    try {
        // Run both API calls in parallel using Promise.all
        const [songRes, artistRes] = await Promise.all([
            makeAuthGETReq("/songs/song/" + inputValue),
            makeAuthGETReq("/artist/" + inputValue)
        ]);

        console.log("Song search result:", songRes);
        console.log("Artist search result:", artistRes);

        // Combine both song and artist data into one array
        const combinedResults = [...songRes.data, ...artistRes.data];

        // Update the state with combined results
        setSongData(songRes.data);
        setArtistData(artistRes.data);
    } catch (error) {
        console.error("Error fetching songs or artists:", error);
    }
};



    useEffect(() => {
        setCanGoBack(window.history.state && window.history.length > 1);
        setCanGoForward(window.history.state && window.history.state.idx < window.history.length - 1);
    }, []);

    const goBack = () => {
        if (canGoBack) {
            navigate(-1);
        }
    };

    const goForward = () => {
        if (canGoForward) {
            navigate(1);
        }
    };

    const handleLogout = () => {
        navigate('/logout');
    };

    const toggleHamburger = () => {
        setIsLeftPanelOpen(!isLeftPanelOpen);
    };

    

    return (
        <div className="navBar">
            <div className="hambars" onClick={toggleHamburger}>
                <i className="fa-solid fa-bars"></i>
            </div>
            
            <div className="shiftBtns">
                <i
                    className={`fa-solid fa-chevron-left ${canGoBack ? 'enabled' : 'disabled'}`}
                    onClick={goBack}
                    style={{
                        opacity: canGoBack ? 1 : 0.5,
                        cursor: canGoBack ? 'pointer' : 'not-allowed',
                    }}
                    title={canGoBack ? 'Go to the previous page' : 'No previous page available'}
                ></i>
                <i
                    className={`fa-solid fa-chevron-right ${canGoForward ? 'enabled' : 'disabled'}`}
                    onClick={goForward}
                    style={{
                        opacity: canGoForward ? 1 : 0.5,
                        cursor: canGoForward ? 'pointer' : 'not-allowed',
                    }}
                    title={canGoForward ? 'Go to the next page' : 'No next page available'}
                ></i>
                
            </div>

            

            {
                location.pathname === "/search" && (
                    <div className="searchBar">
                        <div className="searchBar1">
                            <div className="searchIcon">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </div>
                            <div className="search">
                                <input
                                    type="text"
                                    placeholder="What do you want to play?"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {inputValue && (
                            <div className="searchBar2" onClick={clearInput}>
                                <i className="fa-solid fa-xmark delSearch"></i>
                            </div>
                        )}
                    </div>
            )}


            {
                !currentUser ? (
                    <div className="regBtns">
                        <Link to="/signup"><button className="signUpBtn">Sign Up</button></Link>
                        <Link to="/login"><button className="logInBtn">Log In</button></Link>
                    </div>
                ) : (
                    <div className="regBtns">
                        <Link to="/curruser" className="link">
                            <div className="profile">
                                {currentUser.profilePic ? (
                                    <img
                                        src={currentUser.profilePic}
                                        alt="Profile"
                                        className="profile-image"
                                    />
                                ) : (
                                    <div className="navProfile-placeholder">
                                        {currentUser?.firstname.charAt(0) + currentUser?.lastname.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                )
            }
        </div>
    );
}

