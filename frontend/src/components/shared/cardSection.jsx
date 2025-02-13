import CardCombn from "./cardCombn"
import "../../public/css/cardSection.css"

export default function CardSection(){
    return(
        <div className="section">
            <CardCombn title="Artists"/>
            <CardCombn title="Featured Playlists"/>
        </div>
    )
}