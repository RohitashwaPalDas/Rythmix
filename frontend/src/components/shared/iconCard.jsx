import { Link, useLocation } from "react-router-dom";
import "../../public/css/iconCard.css";
import { useContext } from "react";
import SongContext from "../../contexts/SongContext";

export default function IconCard({ icon, label, targetLink }) {
    const location = useLocation();
    const isActive = location.pathname === targetLink;
    const { setIsCreatePlaylistModalOpen } = useContext(SongContext);

    const handlePlusIconClick = (e) => {
        e.preventDefault(); // Prevent the default Link navigation
        e.stopPropagation(); // Stop the event from bubbling up to the Link
        setIsCreatePlaylistModalOpen(true);
    };

    return (
        <Link to={targetLink} style={{ textDecoration: 'none' }}>
            <div className={`iconCard ${isActive ? "active" : "no-active"}`}>
                <div className="icon"><i className={`fa-solid fa-${icon}`}></i></div>
                <div className="iconLab">{label}</div>
                {label === "Your Library" && (
                    <div
                        className="addLibIcon"
                        onClick={handlePlusIconClick}
                    >
                        <i className="fa-solid fa-plus plus"></i>
                    </div>
                )}
            </div>
        </Link>
    );
}

