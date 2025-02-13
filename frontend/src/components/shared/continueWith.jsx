import "../../public/css/continueWith.css"

export default function ContinueWith({handle, handleName, handleClick}){
    return(
        <div className="continueWith" onClick={handleClick}>
            <i className={`fa-brands fa-${handle} continue-social-logo`}></i>
            <span className="continue-text">Continue with {handleName}</span>
        </div>
    )
}