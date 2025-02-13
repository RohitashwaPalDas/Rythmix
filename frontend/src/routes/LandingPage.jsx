import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../public/css/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  // Redirect to home page after animation (e.g., 4 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 6000); // 4000ms = 4 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="music-landing-page">
      <div className="spinning-record">
        {/* Spinning vinyl record */}
        <div className="record"></div>
        <div className="music-notes">
          {/* Music note icons flying around */}
          <span className="note">&#9835;</span>
          <span className="note">&#9834;</span>
          <span className="note">&#9833;</span>
          <span className="note">&#9836;</span>
        </div>
      </div>
      <h1 className="welcome-text">Welcome to Rythmix</h1>
    </div>
  );
};

export default LandingPage;
