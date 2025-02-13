import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../utils/authProvider";
import {toast} from "react-toastify";

export default function LogOut() {
    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();
    let alertShown = false;

    const logOut = async () => {
        try {
            const res = await fetch(`http://localhost:3000/logout`, {
                method: 'POST',
                credentials: 'include', // Include credentials for session cookies
            });

            if (res.ok) {
                setCurrentUser(null);
                if (!alertShown) {  // Check if the alert was shown
                    toast.success("Logged out successfully");
                    alertShown = true; // Set the flag
                }
                navigate("/login");
            } else {
                console.error("Logout failed, response:", res);
                toast.error("Logout failed");
            }
        } catch (error) {
            console.error("An error occurred during logout:", error);
            toast.error("An error occurred during logout");
        }
    };

    useEffect(() => {
        logOut();
    }, []);

    return (
        <div className="mainContainer">
            <div className="message">
                <p>Logging you out...</p>
            </div>
        </div>
    );
}
