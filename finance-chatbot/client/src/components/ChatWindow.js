import React, { useEffect, useState } from "react";
import "../App.css";

export const ChatWindow = ({ groupedMessages, chatEndRef }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.name) {
      setUsername(storedUser.name);
    }
  }, []);

  return (
    <div className="chat-window">
      <div className="chat-messages-wrapper">
        {Object.entries(groupedMessages).map(([date, msgs], i) => (
          <div key={i}>
            {/* Date divider */}
            <div className="date-header">{date}</div>

            {msgs.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
              >
                {/* Avatar */}
                <img
                  src={msg.sender === "user" ? "/user-avatar.png" : "/bot-avatar.png"}
                  alt={msg.sender}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",   
                    objectFit: "cover",    
                    backgroundColor: "#fff"
                  }}
                  className="avatar"
                />

                {/* Message bubble + sender name */}
                <div className="bubble-content">
                  <div className="sender-name">
                    {msg.sender === "user" ? username : "FinBot"}
                  </div>
                  <div className="bubble">{msg.text}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};
