import { useState } from "react";
import { makeUnauthPOSTReq } from "../utils/serverHelper";
import {toast} from "react-toastify";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const sendResetLink = async () => {
        const res = await makeUnauthPOSTReq("/forgot-password", { email });
        if (res && !res.err) {
            toast.info("Reset link sent to your email.");
        } else {
            toast.error("Failed to send reset link.");
        }
    };

    return (
        <div>
            <h2>Forgot Password</h2>
            <input 
                type="email" 
                placeholder="Enter your email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <button onClick={sendResetLink}>Send Reset Link</button>
        </div>
    );
}
