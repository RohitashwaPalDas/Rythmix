import TextInput from "../components/shared/textInput"
import Button from "../components/shared/buttons"
import Heading from "../components/shared/headings"
import ContinueWith from "../components/shared/continueWith"
import "../public/css/SignUp.css"
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import {makeAuthPUTReq} from "../utils/serverHelper";
import { useAuth } from "../utils/authProvider";
import FileUpload from "../utils/FileUpload"
import {toast} from "react-toastify";
import { v4 as uuidv4 } from "uuid";


export default function EditProfile(){
    const isValidUUID = (googleId) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(googleId);
    const { currentUser } = useAuth();
    let [firstname, setFirstname] = useState(currentUser.firstname);
    let [lastname, setLastname] = useState(currentUser.lastname);
    let [username, setUsername] = useState(currentUser.username);
    let [email, setEmail] = useState(currentUser.email);
    const [profilePic, setProfilePic] = useState(currentUser.profilePic || "");
    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();

    const edit = async()=>{
        const data = {firstname, lastname, username, email, profilePic};
        const res = await makeAuthPUTReq("/profile", data);
        console.log(res);
        if(res && !res.error){
            setCurrentUser(res);
            console.log("User profile updated:", res);
            toast.success("Your profile updated");
            navigate("/curruser");
        }else{
            toast.error("Failed to update your profile");
        }
    }

    const isGoogleIdEditable = currentUser.googleId && currentUser.googleId !== null && isValidUUID(currentUser.googleId);

    return(
        <div className="mainContainer">
            <div className="logo">
                <i className="fa-brands fa-spotify"></i>
            </div>
            <div className="heading"> 
                <Heading title="Edit Your Profile"/>
            </div>
        
            <div className="signUpForm">
                <form>
                    <TextInput label="firstname" labelName="First Name" placeholder="First Name" type="text" value={firstname} setValue={setFirstname}/>
                    <TextInput label="lastname" labelName="Last Name" placeholder="Larst Name" type="text" value={lastname} setValue={setLastname}/>
                    <TextInput label="username" labelName="Username" placeholder="Username or email" type="text" value={username} setValue={setUsername} shouldCheckUsername={true}/>
                    {(!currentUser.googleId || isGoogleIdEditable) && <TextInput label="email" labelName="Email address" placeholder="name@domain.com" type="text" value={email} setValue={setEmail}/>}
                    <div>
                        <FileUpload onUpload={(url) => setProfilePic(url)} btnLabel="Profile Photo" initialFileUrl={profilePic}/>
                    </div>
                    <button className="formButton" onClick={(e)=>{
                        e.preventDefault();
                        edit();
                    }}>Edit</button>
                </form>
            </div>
            
        </div>
    )
}
