import "../../public/css/cardCombn.css"

import Card from "./card"

export default function CardCombn({title}){
    return(
        <div className="main-div">
            <h1 className="cardCombnHead">{title}</h1>
            <div className="cardcombn">
                <Card/>
                <Card/>
            </div>
        </div>
    )
}