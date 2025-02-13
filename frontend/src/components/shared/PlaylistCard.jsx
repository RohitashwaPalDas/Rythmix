import "../../public/css/PlaylistCard.css";
import { useNavigate } from "react-router-dom";

export default function PlaylistCard({ info, playlistId, onClick }) { // Add onClick prop
    const navigate = useNavigate();

    const handleCardClick = () => {
        onClick(); // Set the playlist in the context
        navigate("/myplaylist/" + info._id); // Navigate to the playlist page
    };

    return (
        <div className="PlayListCard" onClick={onClick}>
            <div className="playlistThumb">
                <img src={info?.thumbnail} alt="Thumbnail" />
            </div>

            <div className="playListDet">
                <div className="playlistTitle">
                    <b>{info?.name}</b>
                </div>

                <div className="playlistOwner">
                    {info?.owner?.firstname + " " + info?.owner?.lastname}
                </div>
            </div>
        </div>
    );
}
