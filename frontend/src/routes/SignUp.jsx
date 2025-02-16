import TextInput from "../components/shared/textInput";
import Button from "../components/shared/buttons";
import Heading from "../components/shared/headings";
import ContinueWith from "../components/shared/continueWith";
import "../public/css/SignUp.css";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { makeAuthGETReq, makeUnauthPOSTReq } from "../utils/serverHelper";
import { useAuth } from "../utils/authProvider";
import {toast} from "react-toastify";

export default function SignUp() {
    let [firstname, setFirstname] = useState("");
    let [lastname, setLastname] = useState("");
    let [username, setUsername] = useState("");
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [errors, setErrors] = useState({});
    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();

    // Helper function for email validation using API
    const isValidEmail = async (email) => {
        try {
            let apiKey = "ema_live_UwmTkfwZJZFc32LXjdoQ0kdJ15nDSIijnYBLq3W2"; // Use your valid API key
            let url = `https://api.emailvalidation.io/v1/info?apikey=${apiKey}&email=${email}`;
            let response = await fetch(url);
            let result = await response.json();

            if (!result.smtp_check) {
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error validating email:", error);
            return false;
        }
    };

    

    // Password strength validation criteria
    const passwordCriteria = {
        hasUpperCase: /[A-Z]/,
        hasLowerCase: /[a-z]/,
        hasNumber: /\d/,
        hasSpecialChar: /[@$!%*?&]/,
        hasMinLength: /.{8,}/
    };

    // Function to check which criteria the password meets
    const checkPasswordCriteria = (password) => {
        return {
            hasUpperCase: passwordCriteria.hasUpperCase.test(password),
            hasLowerCase: passwordCriteria.hasLowerCase.test(password),
            hasNumber: passwordCriteria.hasNumber.test(password),
            hasSpecialChar: passwordCriteria.hasSpecialChar.test(password),
            hasMinLength: passwordCriteria.hasMinLength.test(password),
        };
    };

    // Helper function to check if the password is strong
    const checkStrongPassword = (password) => {
        const passwordStrength = checkPasswordCriteria(password);
        return Object.values(passwordStrength).every(Boolean); // Check if all criteria are met
    };

    const validateForm = async () => {
        let errors = {};
        let valid = true;

        // Basic validation checks
        if (!firstname) {
            errors.firstname = "First name is required";
            valid = false;
        }
        if (!lastname) {
            errors.lastname = "Last name is required";
            valid = false;
        }
        if (!username) {
            errors.username = "Username is required";
            valid = false;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Valid email is required";
            valid = false;
        } else {
            const emailValid = await isValidEmail(email);
            if (!emailValid) {
                errors.email = "Please enter a valid email address";
                valid = false;
            }
        }

        if (!password || password.length < 8) {
            errors.password = "Password must be at least 8 characters long";
            valid = false;
        } else if (!checkStrongPassword(password)) {
            errors.password = "Password must meet all criteria";
            valid = false;
        }

        setErrors(errors);
        return valid;
    };

    const signUp = async () => {
        if (!(await validateForm())) return;

        const data = { firstname, lastname, username, email, password };
        const res = await makeUnauthPOSTReq("/signup", data);
        if (res && !res.err) {
            setCurrentUser(res);
            toast.success("Welcome to Rythmix!!");
            navigate("/home");
        } else {
            toast.error("Failed to sign up");
        }
    };

    const passwordStrength = checkPasswordCriteria(password);

    const handleGoogleSuccess = async (response) => {
        window.open('https://rythmix-sbzw.onrender.com/auth/google', '_self');
    };

    return (
        <div className="mainContainer">
            <div className="logo">
                <i className="fa-brands fa-spotify"></i>
            </div>
            <div className="heading">
                <Heading title="SignUp to start listening" />
            </div>
            <div className="continue_with">
                <ContinueWith handle="google" handleName="Google" handleClick= {handleGoogleSuccess}/>
                {/* <ContinueWith handle="facebook" handleName="Facebook" /> */}
            </div>
            <div className="signUpForm">
                <form>
                    {/* First Name */}
                    <div className="form-group">
                        <TextInput 
                            label="firstname"
                            labelName="First Name"
                            placeholder="First Name"
                            type="text"
                            value={firstname}
                            setValue={setFirstname}
                            className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">
                            {errors.firstname}
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="form-group">
                        <TextInput 
                            label="lastname"
                            labelName="Last Name"
                            placeholder="Last Name"
                            type="text"
                            value={lastname}
                            setValue={setLastname}
                            className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">
                            {errors.lastname}
                        </div>
                    </div>

                    {/* Username */}
                    <div className="form-group">
                        <TextInput 
                            label="username"
                            labelName="Username"
                            placeholder="Username or email"
                            type="text"
                            value={username}
                            setValue={setUsername}
                            shouldCheckUsername={true}
                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">
                            {errors.username}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <TextInput 
                            label="email"
                            labelName="Email address"
                            placeholder="name@domain.com"
                            type="text"
                            value={email}
                            setValue={setEmail}
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">
                            {errors.email}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <TextInput 
                            label="password"
                            labelName="Password"
                            placeholder="Password"
                            type="password"
                            value={password}
                            setValue={setPassword}
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">
                            {errors.password}
                        </div>
                        <div className="password-strength-bar">
                            <div
                                className={`strength-segment ${passwordStrength.hasUpperCase ? 'filled' : ''}`}
                            ></div>
                            <div
                                className={`strength-segment ${passwordStrength.hasLowerCase ? 'filled' : ''}`}
                            ></div>
                            <div
                                className={`strength-segment ${passwordStrength.hasNumber ? 'filled' : ''}`}
                            ></div>
                            <div
                                className={`strength-segment ${passwordStrength.hasSpecialChar ? 'filled' : ''}`}
                            ></div>
                            <div
                                className={`strength-segment ${passwordStrength.hasMinLength ? 'filled' : ''}`}
                            ></div>
                        </div>

                        <ul className="password-criteria">
                            <li className={passwordStrength.hasUpperCase ? 'text-success' : 'text-danger'}>
                                {passwordStrength.hasUpperCase ? '✓' : '✗'} At least one uppercase letter
                            </li>
                            <li className={passwordStrength.hasLowerCase ? 'text-success' : 'text-danger'}>
                                {passwordStrength.hasLowerCase ? '✓' : '✗'} At least one lowercase letter
                            </li>
                            <li className={passwordStrength.hasNumber ? 'text-success' : 'text-danger'}>
                                {passwordStrength.hasNumber ? '✓' : '✗'} At least one number
                            </li>
                            <li className={passwordStrength.hasSpecialChar ? 'text-success' : 'text-danger'}>
                                {passwordStrength.hasSpecialChar ? '✓' : '✗'} At least one special character
                            </li>
                            <li className={passwordStrength.hasMinLength ? 'text-success' : 'text-danger'}>
                                {passwordStrength.hasMinLength ? '✓' : '✗'} Minimum length of 8 characters
                            </li>
                        </ul>
                    </div>

                    <button className="formButton btn btn-primary" onClick={(e) => {
                        e.preventDefault();
                        signUp();
                    }}>Sign Up</button>
                </form>
            </div>
            <div className="switch">
                Already have an account? &nbsp; 
                <Link to="/login"><span className="signUpLink">LogIn here</span></Link>
            </div>
        </div>
    );
}
