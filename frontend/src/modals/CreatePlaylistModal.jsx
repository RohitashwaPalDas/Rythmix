import "../public/css/CreatePlaylistModal.css"
import TextInput from "../components/shared/textInput";
import FileUpload from "../utils/FileUpload";
import { useContext, useState } from "react";
import SongContext from "../contexts/SongContext";
import { makeAuthPOSTReq } from "../utils/serverHelper";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

export default function CreatePlaylistModal({addNewPlaylist}){
    const { setIsCreatePlaylistModalOpen } = useContext(SongContext);
    const [name, setName] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const songs = [];
    const navigate = useNavigate();

    const handleCrossIconClick = (e) => {
        setIsCreatePlaylistModalOpen(false);
    };

    const addPlaylist = async (e) => {
        e.preventDefault();

        if (!thumbnail) {
            alert("Please upload both a thumbnail");
            return;
        }

        const data = { name, thumbnail, songs};
        const res = await makeAuthPOSTReq("/playlists/newplaylist", data);

        if (res && !res.error) {
            console.log(res);
            toast.success("Playlist created successfully!");
            setIsCreatePlaylistModalOpen(false);
            if (addNewPlaylist) {
                addNewPlaylist(res); // Pass the new playlist data
            }
            // navigate("/home");
        } else {
            console.error("Failed to create playlist:", res.error);
            toast.error("Failed to create playlist: " + res.error);
        }
    };

    return(
        <div className="PlayListModal">
            <div className="formContainer">
                <div className="closeIcon" onClick={handleCrossIconClick}>
                    <i className="fa-solid fa-xmark"></i>
                </div>
                <div className="heading">
                    <h1>Create Playlist</h1>
                </div>
                <div className="CreatePlaylistForm">
                    <form onSubmit={addPlaylist}>
                        <TextInput label="name" labelName="Playlist Title" placeholder="Playlist Title" type="text" value={name} setValue={setName}/>
                        <div>
                            <FileUpload onUpload={(url) => setThumbnail(url)} btnLabel="Thumbnail"/>
                        </div>
                        <button className="formButton" type="submit">Create Playlist</button>
                    </form>
                </div>
            </div>
        </div>
    )
}