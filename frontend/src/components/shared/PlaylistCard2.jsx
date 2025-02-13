import "../../public/css/playlistcard2.css";

export default function PlaylistCard2({ info, onClick, isDisabled }) {
    return (
        <div
            className={`PmainBox2 ${isDisabled ? "disabled" : ""}`}
            onClick={isDisabled ? null : onClick}
        >
            <div className="PmainBox2_left">
                <div className="image2">
                    <div className="background" style={{ backgroundImage: `url(${info.thumbnail})` }}></div>
                </div>

                <div className="det2">
                    <div className="title2">{info.name}</div>
                    <div className="artist2">
                        {info.owner.firstname + " " + info.owner.lastname}
                    </div>
                </div>
            </div>
        </div>
    );
}
