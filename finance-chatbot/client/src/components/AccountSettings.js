import React from "react";

export default function AccountSettings() {
  return (
    <div className="settings-page">
      <h1>Account Settings</h1>
      <p>Update your personal information, change password, and manage your account here.</p>

      <div className="settings-section">
        <label>Name</label>
        <input type="text" placeholder="Enter your name" className="settings-input" />
      </div>

      <div className="settings-section">
        <label>Email</label>
        <input type="email" placeholder="Enter your email" className="settings-input" />
      </div>

      <div className="settings-section">
        <label>Change Password</label>
        <input type="password" placeholder="New password" className="settings-input" />
      </div>

      <button className="settings-btn">Save Changes</button>
    </div>
  );
}
