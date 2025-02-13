import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { makeAuthPOSTReq } from "../utils/serverHelper";
import TextInput from "../components/shared/textInput";
import Heading from "../components/shared/headings";
import FileUpload from "../utils/FileUpload";
import "../public/css/AddSong.css";
import {toast} from "react-toastify";

export default function AddSong() {
    const [name, setName] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [track, setTrack] = useState("");
    const [isArtist, setIsArtist] = useState(false);  // Check if user is an artist
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user details to check if the user is an artist
        const fetchUser = async () => {
            const res = await makeAuthPOSTReq("/is-artist");  // Assuming this endpoint returns user details
            console.log(res.isArtist);
            if(res && !res.isArtist){
                toast.warn("You should be an Artist to upload song");
                navigate("/curruser");
            }
        };
        fetchUser();
    }, []);

    const addSong = async (e) => {
        e.preventDefault();

        if (!thumbnail || !track) {
            toast.warn("Please upload both a thumbnail and a track.");
            return;
        }

        const data = { name, thumbnail, track };
        const res = await makeAuthPOSTReq("/songs/newsong", data);

        if (res && !res.error) {
            console.log(res);
            toast.success("Song added successfully!");
            navigate("/home");
        } else {
            console.error("Failed to add song:", res.error);
            toast.warn("Failed to add song: " + res.error);
        }
    };

    return (
        <div className="mainContainer">
            <div className="logo">
                <i className="fa-brands fa-spotify"></i>
            </div>
            <div className="heading">
                <Heading title="Add your song in Spotify" />
            </div>
            <div className="signUpForm">
                <form onSubmit={addSong}>
                    <TextInput label="name" labelName="Song Title" placeholder="Song Title" type="text" value={name} setValue={setName} />
                    <div>
                        <FileUpload onUpload={(url) => setThumbnail(url)} btnLabel="Profile Photo" accept="image/*"/>
                    </div>
                    <div>
                        <FileUpload onUpload={(url) => setTrack(url)} btnLabel="Track" accept="audio/*,.mpeg,.mp3,.wav,.ogg,.flac,.aac,.m4a,.wma,.amr"/>
                    </div>
                    <button className="formButton" type="submit">Add Song</button>
                </form>
            </div>
        </div>
    );
}