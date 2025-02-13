import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeAuthPOSTReq } from "../utils/serverHelper";
import {toast} from "react-toastify";

export default function UpdatePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();

    const updatePassword = async () => {
        const res = await makeAuthPOSTReq(`/update-password`, { oldPassword, newPassword });
        if (res && !res.err) {
            toast.success("Password updated successful!");
            navigate("/home");
        } else {
            toast.error("Failed to reset password.");
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <input 
                type="password" 
                placeholder="Enter old password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
            />

            <input 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
            />
            <button onClick={updatePassword}>Update Password</button>
        </div>
    );
}
