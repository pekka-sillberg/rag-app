import React, { useRef, useEffect } from 'react';
import Message from './Message';
import Input from './Input';
import axios from 'axios';

function Chatbox({ messages, setMessages, api_url, input, setInput }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (input) => {
    if (!input) return;

    const newMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await axios.post(`${api_url}/api/query-embedding`, { query: input });
      const botMessage = { role: 'bot', content: response.data };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'bot', content: 'Sorry, there was an error.' };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="chatbox">
      <div className="chat-area">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} content={msg.content} />
        ))}
        <div ref={chatEndRef} />
      </div>
      <Input input={input} setInput={setInput} handleSendMessage={handleSendMessage} />
    </div>
  );
}

export default Chatbox;
