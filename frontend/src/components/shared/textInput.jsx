import "../../public/css/Input.css";
import { useState, useEffect } from "react";
import { makeAuthGETReq } from "../../utils/serverHelper";


export default function TextInput({ label, labelName, type, placeholder, value, setValue, shouldCheckUsername = false }) {
    let isPassword = type === "password";
    let isUsername = label === "username";
    const [usernameExists, setUsernameExists] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    function togglePassword() {
        const passwordInput = document.getElementById(label);
        const toggleIcon = document.querySelector('.toggle-password i');
        const isPasswordVisible = passwordInput.type === 'password';

        passwordInput.type = isPasswordVisible ? 'text' : 'password';
        toggleIcon.classList.toggle('fa-eye', !isPasswordVisible);
        toggleIcon.classList.toggle('fa-eye-slash', isPasswordVisible);
    }

    function handleInputChange(e) {
        setValue(e.target.value);

        if(isUsername && shouldCheckUsername) {
            const inputValue = e.target.value;
            setUsernameExists(false); // Reset state on each change

            // Clear existing debounce timer
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            // Set a new debounce timer
            setDebounceTimer(
                setTimeout(() => {
                    checkUsername(inputValue);
                }, 500) // 500ms delay
            );
        }
    }

    const checkUsername = async (inputValue) => {
        if (!inputValue.trim()) return;

        try {
            const response = await makeAuthGETReq(`/check-username?username=${inputValue}`);
            console.log("Username check response:", response);
            setUsernameExists(response.exists);

            // Set error state if username exists
            if (response.data.exists) {
                setErrors((prevErrors) => ({ ...prevErrors, username: "Username already exists" }));
            } else {
                setErrors((prevErrors) => ({ ...prevErrors, username: "" }));
            }
        } catch (error) {
            console.error("Error checking username:", error);
        }
    };

    return (
        <div className="input-container">
            <label className="label" htmlFor={label}>{labelName}</label> 
            <div className="input-wrapper">
                <input 
                    type={type} 
                    placeholder={placeholder} 
                    name={label} 
                    id={label} 
                    value={value} 
                    onChange={(e) => handleInputChange(e)} 
                />
                {isUsername && shouldCheckUsername && usernameExists && <small className="text-danger">Username already exists</small>}
                {isPassword && (
                    <span className="toggle-password" onClick={togglePassword}>
                        <i className="fas fa-eye"></i>
                    </span>
                )}
            </div>
        </div>
    );
}
