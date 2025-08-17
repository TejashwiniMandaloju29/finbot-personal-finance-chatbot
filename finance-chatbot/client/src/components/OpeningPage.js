import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export const OpeningPage = ({ darkMode }) => {
  const navigate = useNavigate();

  return (
    <div className={`opening-page ${darkMode ? "dark" : "light"}`}>
      <div className="jitter-logo-container">
        <img src="/bot-avatar.png" alt="FinBot Logo" className="jitter-logo" style={{
          width: "200px",     
          height: "120px",    
          objectFit: "contain", 
          marginBottom: "0px"
        }}/>
        <h1 className="jitter-title">FinBot</h1>
      </div>
      <p className="opening-tagline">Your personal AI-powered finance assistant</p>
      <button className="opening-btn" onClick={() => navigate("/login")}>
        Get Started
      </button>
    </div>
  );
};
