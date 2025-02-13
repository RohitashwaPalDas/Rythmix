import "../public/css/RegisterAsArtistModal.css"
import { useContext, useState, useEffect } from "react";
import SongContext from "../contexts/SongContext";
import { makeAuthPOSTReq } from "../utils/serverHelper";
import { useAuth } from "../utils/authProvider";
import { toast } from "react-toastify";

export default function(){
    const { setIsRegisterAsArtistModalOpen, isArtist, setIsArtist } = useContext(SongContext);
    const { currentUser } = useAuth();

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

    const handleCrossIconClick = (e) => {
        setIsRegisterAsArtistModalOpen(false);
    };

    const handleYesClick = async()=>{
        const data = currentUser._id;
        const res = await makeAuthPOSTReq("/registerArtist", data);
        if (res && !res.error) {
            console.log(res);
            toast.success(res.message);
            setIsArtist(!isArtist);
            setIsRegisterAsArtistModalOpen(false);
        } else {
            if(isArtist){
                console.error("Failed to unregister as artist:", res.error);
                toast.error("Failed to remove as artist: " + res.error);
            }
            else{
                console.error("Failed to register as artist:", res.error);
                toast.error("Failed to add as artist: " + res.error);
            }
        }
    }

    return(
        <div className="RegisterModal">
            <div className="modalContainer">
                <div className="closeIcon" onClick={handleCrossIconClick}>
                    <i className="fa-solid fa-xmark"></i>
                </div>
                {isArtist ? (
                    <div>Are you sure to unregister yourself as an <b>ARTIST</b>?</div>
                ) : (
                    <div>Are you sure to register yourself as an <b>ARTIST</b>?</div>
                )}
                <div className="regOptBtns">
                    <button className="yesBtn" onClick={handleYesClick}>Yes</button>
                    <button className="noBtn" onClick={()=>{
                        setIsRegisterAsArtistModalOpen(false);
                    }}>No</button>
                </div>
            </div>
        </div>
    )
}

