import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings, FiSun, FiMoon, FiChevronDown } from 'react-icons/fi';

export const Header = ({ onToggleExpenses, darkMode, setDarkMode, showExpenses }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const handleAccountSettings = () => {
    setShowDropdown(false);
    navigate("/account"); // Account settings page
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowDropdown(false);
    navigate("/login"); // Redirect to login
  };

  const handleLogoClick = () => {
    navigate("/"); // Opening/landing page
  };

  const handleSettingsClick = () => {
    navigate("/settings"); // Settings page
  };

  return (
    <header className="app-header">
      <div 
        className="logo" 
        onClick={handleLogoClick} 
        style={{ 
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: '1.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5px',
          fontFamily: 'Montserrat, sans-serif',
          letterSpacing: '0.5px'
        }}
      >
        <img 
          src="/bot-avatar.png" 
          alt="FinBot Logo" 
          style={{ width: '70px', height: '70px', borderRadius: '50%' }} 
        />
        <span style={{ color: '#2563eb' }}>Fin</span>
        <span style={{ color: '#2563eb' }}>Bot</span>
      </div>


      <div className="header-actions">
        <button className="expense-btn" onClick={onToggleExpenses}>
          {showExpenses ? "Close my Expenses" : "View my Expenses"}
        </button>

        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        <FiSettings
          className="icon"
          title="Settings"
          style={{ cursor: 'pointer' }}
          onClick={handleSettingsClick}
        />

        {/* Avatar and Dropdown */}
        <div className="avatar-wrapper" onClick={() => setShowDropdown(!showDropdown)}>
          <img src="/user-avatar.png" alt="User Avatar" className="avatar" />
          <FiChevronDown className="dropdown-icon" />
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <strong>Tejashwini</strong>
                <p>tejashwini@example.com</p>
              </div>
              <hr />
              <button className="dropdown-item" onClick={handleAccountSettings}>
                🔐 Account Settings
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
