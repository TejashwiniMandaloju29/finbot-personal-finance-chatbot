import React, { useState, useEffect } from "react";
import "../App.css";

export default function Settings({ darkMode, setDarkMode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") === "true"
  );
  const [autoSave, setAutoSave] = useState(
    localStorage.getItem("autoSave") === "true"
  );

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notificationsEnabled", notificationsEnabled);
    localStorage.setItem("autoSave", autoSave);
  }, [notificationsEnabled, autoSave]);

  // Ask for notification permission if enabling
  const handleNotificationsToggle = () => {
    if (!notificationsEnabled) {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") setNotificationsEnabled(true);
      });
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <div className="settings-page">
      <h2>App Settings</h2>
      <p>Customize your preferences and app behavior.</p>

      <div className="setting-item">
        <label>Enable notifications</label>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={handleNotificationsToggle}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="setting-item">
        <label>Dark mode</label>
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="setting-item">
        <label>Auto-save expenses</label>
        <label className="switch">
          <input
            type="checkbox"
            checked={autoSave}
            onChange={() => setAutoSave(!autoSave)}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
}
