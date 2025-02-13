import "../../public/css/card.css"
import { useNavigate } from "react-router-dom";

export default function ArtistCard2({info}){
    const navigate = useNavigate();
    const handleCardClick = () => {
        navigate(`/artist/${info._id}`);
    };
    return(
        <div className="cards" onClick={handleCardClick}>
            
            {info.profilePic ? (
                <div className="image"><img src={info.profilePic} alt=""/></div>
            ) : (
                <div className="artistProfile-placeholder">
                    {info?.firstname.charAt(0) + info?.lastname.charAt(0)}
                </div>
            )}
            <div className="card-details">
                <div className="card_name">{info.firstname + " " + info.lastname}</div>
            </div>
        </div>
    )
}
