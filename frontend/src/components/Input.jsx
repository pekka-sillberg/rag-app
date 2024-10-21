import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';  // Using React Icons for Send Button

function Input({ input, setInput, handleSendMessage }) {
  const handleSend = (e) => {
    e.preventDefault();
    if (!input) return;

    handleSendMessage(input);
    setInput(''); 
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend(e);  // Trigger the send action when Enter is pressed
    }
  };

  return (
    <div className="input-group p-1">
      <input
        type="text"
        className="form-control"
        placeholder="Type your message here..."
        value={input}
        onChange={(e) => setInput(e.target.value)} 
        onKeyDown={handleKeyPress} 
      />
      <div className="input-group-append">
        <button className="btn btn-primary" onClick={handleSend}>
          <FaPaperPlane />  {/* Using React Icon */}
        </button>
      </div>
    </div>
  );
}

export default Input;
