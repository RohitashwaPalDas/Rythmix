import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeUnauthPOSTReq } from "../utils/serverHelper";
import {toast} from "react-toastify";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const { token } = useParams();
    const navigate = useNavigate();

    const resetPassword = async () => {
        const res = await makeUnauthPOSTReq(`/reset-password/${token}`, { password });
        if (res && !res.err) {
            toast.success("Password reset successful!");
            navigate("/login");
        } else {
            toast.error("Failed to reset password.");
        }
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <input 
                type="password" 
                placeholder="Enter new password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button onClick={resetPassword}>Reset Password</button>
        </div>
    );
}
