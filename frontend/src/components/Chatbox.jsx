import React, { useRef, useEffect } from 'react';
import Message from './Message';
import Input from './Input';
import FaqCard from './FaqCard';

function Chatbox({ messages, setMessages, api_url, input, setInput, handleSendMessage, loading }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatbox">
      <div className="chat-area">
        {messages.length === 0 && <FaqCard setInput={setInput} handleSendMessage={handleSendMessage} />}
        
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} content={msg.content} />
        ))}

        {loading && (
          <div className="message bot typing-indicator">
            Typing
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
      <Input input={input} setInput={setInput} handleSendMessage={handleSendMessage} />
    </div>
  );
}

export default Chatbox;
