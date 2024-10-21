import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import Input from './Input';
import axios from 'axios';

function Chatbox({ messages, setMessages, api_url, input, setInput }) {
  const chatEndRef = useRef(null);  // Ref for the scrollable area
  const [loading, setLoading] = useState(false);  // Add loading state

  // Scroll to the bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (input) => {
    if (!input) return;

    const newMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);

    setLoading(true); // Set loading to true when the request is sent

    try {
      const response = await axios.post(`${api_url}/api/query-embedding`, { query: input });
      const botMessage = { role: 'bot', content: response.data };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'bot', content: 'Sorry, there was an error.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false); // Set loading to false when the response is received
    }
  };

  return (
    <div className="chatbox">
      <div className="chat-area">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} content={msg.content} />
        ))}

        {/* Show loading dots if waiting for response */}
        {loading && (
          <div className="message bot">
            <div className="dot-typing">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />  {/* This will ensure the chat always scrolls to the bottom */}
      </div>
      <Input input={input} setInput={setInput} handleSendMessage={handleSendMessage} />
    </div>
  );
}

export default Chatbox;
