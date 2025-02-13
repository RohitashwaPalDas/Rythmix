import "../../public/css/ArtistCard.css";
import { useNavigate } from 'react-router-dom';

export default function ArtistCard(info){
    console.log(info);
    console.log(info.info.profilePic);
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/artist/${info.info._id}`);
    }
    return(
        <div className="mainCard" onClick={handleClick}>
            <div className="profileImage" style={{ backgroundImage: `url(${info.info.profilePic})` }}></div>
            <div className="name">
                {info.info.firstname + " " + info.info.lastname}
            </div>
        </div>
    )
}