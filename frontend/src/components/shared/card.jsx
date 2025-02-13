import "../../public/css/card.css"

export default function Card({info}){
    return(
        <div className="cards">
            <div className="image"><img src="https://cancerfocusni.org/wp-content/uploads/2019/10/Music-Notes-300-x-200-Event-page-thumbnail.png" alt=""/></div>
            <div className="card-details">
                <div className="card_name"><a href="#">Playlist1</a></div>
                <div className="card_author">RPD</div>
            </div>
        </div>
    )
}
