import React from 'react';

export const InputBar = ({
  input,
  setInput,
  onSend,
  onSpeak,
  isListening,
  onClearChat
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="input-bar">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
      />
      <button className="send-btn" onClick={onSend}>Send</button>
      <button className="speak-btn" onClick={onSpeak}>
        {isListening ? '🛑 Stop' : 'Speak'}
      </button>
      <button className="clear-btn" onClick={onClearChat}>
        Clear Chat
      </button>
    </div>
  );
};
