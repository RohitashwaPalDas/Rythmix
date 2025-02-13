import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/authProvider";

export default function GoogleAuthSuccess() {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract user data from URL query params
    const query = new URLSearchParams(window.location.search);
    const user = JSON.parse(query.get('user'));

    if (user) {
      setCurrentUser(user); // Set the authenticated user
      navigate("/home"); // Navigate to home
    } else {
      navigate("/login"); // If user data is not found, navigate to login
    }
  }, [setCurrentUser, navigate]);

  return null; // This component doesn't render anything
}
