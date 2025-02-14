import TextInput from "../components/shared/textInput";
import Heading from "../components/shared/headings";
import ContinueWith from "../components/shared/continueWith";
import "../public/css/LogIn.css";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { makeUnauthPOSTReq } from "../utils/serverHelper";
import { useAuth } from "../utils/authProvider";
import { toast } from "react-toastify";


export default function LogIn() {
    let [username, setUsername] = useState("");
    let [password, setPassword] = useState("");
    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();

    const logIn = async () => {
        const data = { username, password };
        const res = await makeUnauthPOSTReq("/login", data);
        if (res && !res.err) {
            setCurrentUser(res);
            toast.success("Successfully Logged In!!");
            navigate("/home");
        } else {
            toast.error("Invalid Username or Password!!");
            navigate("/login");
        }
    };

    const handleGoogleSuccess = async (response) => {
        window.open('https://rythmix-backend-d16f.onrender.com/auth/google', '_self');
    };

    return (
        <div className="mainContainer">
            <div className="logo">
                <i className="fa-brands fa-spotify"></i>
            </div>
            <div className="heading">
                <Heading title="LogIn to Spotify" />
            </div>
            <div className="continue_with">
                <ContinueWith handle="google" handleName="Google" handleClick= {handleGoogleSuccess}/>
            </div>
            <div className="logInForm">
                <form action="#">
                    <TextInput
                        label="username"
                        labelName="Username or email"
                        placeholder="Username or email"
                        type="text"
                        value={username}
                        setValue={setUsername}
                    />
                    <TextInput
                        label="password"
                        labelName="Password"
                        placeholder="Password"
                        type="password"
                        value={password}
                        setValue={setPassword}
                    />
                    <Link to="/forgotpassword">Forgot Password</Link>
                    <button
                        className="formButton"
                        onClick={(e) => {
                            e.preventDefault();
                            logIn();
                        }}
                    >
                        Log In
                    </button>
                </form>
            </div>
            <div className="switch">
                Don't have an account?&nbsp;
                <Link to="/signup">
                    <span className="signUpLink">SignUp for Spotify</span>
                </Link>
            </div>
        </div>
    );
}
